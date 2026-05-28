from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import re
import sqlite3
import time
from contextlib import contextmanager
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


ROOT = Path(__file__).resolve().parent
DEFAULT_DB_PATH = ROOT / "data" / "qianzhi.sqlite3"
PROTOCOL_FEE_RATE = 0.05
ACTIVE_CAPACITY_STATUSES = {"MATCHED", "FUNDED", "IN_PROGRESS", "SUBMITTED", "DISPUTED"}
ACTION_ACTORS = {
    "fund": "user",
    "cancel": "user",
    "start": "agent",
    "submit": "agent",
    "accept": "user",
    "dispute": "user",
    "resolve": "arbitrator",
    "auto-settle": "platform",
}
SIGNED_ACTIONS = set(ACTION_ACTORS)
SIGNATURE_ID_PATTERN = re.compile(r"^SIG-[A-Z0-9]{8,}$")
WITHDRAWAL_STATUSES = {"PENDING_REVIEW", "APPROVED", "REJECTED"}
EVIDENCE_HASH_PATTERN = re.compile(r"^[a-f0-9]{64}$")


AGENT_SEEDS = [
    {
        "id": "legal-sg-001",
        "name": "新加坡跨境电商合规 Agent",
        "owner": "林女士 · 独立法律顾问",
        "category": "legal",
        "price": 50,
        "stake": 12000,
        "reputation": 96,
        "successRate": 98,
        "tasks": 286,
        "escrowLimit": 500,
        "verification": "TEE",
        "summary": "专注新加坡跨境电商、标签合规、消费者保护和平台政策审查。",
        "tags": ["标签合规", "跨境电商", "法律审查"],
    },
    {
        "id": "design-pack-002",
        "name": "包装设计审核 Agent",
        "owner": "Moss Studio · 设计团队",
        "category": "design",
        "price": 18,
        "stake": 6800,
        "reputation": 91,
        "successRate": 95,
        "tasks": 412,
        "escrowLimit": 240,
        "verification": "Optimistic",
        "summary": "检查包装版式、视觉风险、平台主图规范和海外市场本地化问题。",
        "tags": ["包装审核", "品牌规范", "出海设计"],
    },
    {
        "id": "code-review-003",
        "name": "SaaS 代码审查 Agent",
        "owner": "Byte Harbor · 全栈工程师",
        "category": "code",
        "price": 65,
        "stake": 18000,
        "reputation": 94,
        "successRate": 97,
        "tasks": 198,
        "escrowLimit": 800,
        "verification": "TEE",
        "summary": "为中小团队做 PR 审查、接口风险评估、性能问题定位和修复建议。",
        "tags": ["代码审查", "安全风险", "性能优化"],
    },
    {
        "id": "edu-math-004",
        "name": "高中数学个性化辅导 Agent",
        "owner": "陈老师 · 教育创作者",
        "category": "education",
        "price": 12,
        "stake": 3500,
        "reputation": 88,
        "successRate": 93,
        "tasks": 734,
        "escrowLimit": 120,
        "verification": "Optimistic",
        "summary": "根据错题和学习目标生成讲解、练习路径与阶段性测评。",
        "tags": ["个性化辅导", "错题分析", "学习路径"],
    },
    {
        "id": "growth-005",
        "name": "小红书投放复盘 Agent",
        "owner": "North Loop · 增长顾问",
        "category": "ops",
        "price": 35,
        "stake": 7600,
        "reputation": 90,
        "successRate": 94,
        "tasks": 327,
        "escrowLimit": 300,
        "verification": "Optimistic",
        "summary": "分析投放素材、达人表现和转化数据，输出下一轮内容策略。",
        "tags": ["增长复盘", "内容策略", "投放优化"],
    },
    {
        "id": "trans-local-006",
        "name": "东南亚本地化翻译 Agent",
        "owner": "SeaLang Lab · 本地化团队",
        "category": "translation",
        "price": 15,
        "stake": 5200,
        "reputation": 93,
        "successRate": 96,
        "tasks": 589,
        "escrowLimit": 180,
        "verification": "Optimistic",
        "summary": "覆盖英语、马来语、印尼语和泰语，适合电商页面与客服话术本地化。",
        "tags": ["多语言", "电商本地化", "客服话术"],
    },
    {
        "id": "medical-copy-007",
        "name": "医疗科普合规审核 Agent",
        "owner": "Dr. Wei · 医疗内容顾问",
        "category": "legal",
        "price": 42,
        "stake": 15000,
        "reputation": 92,
        "successRate": 95,
        "tasks": 154,
        "escrowLimit": 620,
        "verification": "TEE",
        "summary": "审核医疗健康内容中的夸大宣传、禁用词和责任边界。",
        "tags": ["医疗科普", "广告合规", "风险提示"],
    },
    {
        "id": "ux-audit-008",
        "name": "B2B 产品 UX 审核 Agent",
        "owner": "Flowline · 产品设计师",
        "category": "design",
        "price": 28,
        "stake": 6100,
        "reputation": 89,
        "successRate": 92,
        "tasks": 221,
        "escrowLimit": 260,
        "verification": "Optimistic",
        "summary": "为后台、SaaS、CRM 等工作型产品做信息架构和交互可用性评估。",
        "tags": ["SaaS UX", "信息架构", "可用性"],
    },
]


def now_ms() -> int:
    return int(time.time() * 1000)


def dumps(value) -> str:
    return json.dumps(value, ensure_ascii=False)


def loads(value: str | None, fallback):
    if not value:
        return fallback
    return json.loads(value)


def calculate_escrow(budget: float, selected_agents: list[dict]) -> dict:
    fee = round(budget * PROTOCOL_FEE_RATE, 2)
    creator_pool = round(budget - fee, 2)
    total_price = sum(agent["price"] for agent in selected_agents) or 1
    splits = []
    allocated = 0.0

    for index, agent in enumerate(selected_agents):
        if index == len(selected_agents) - 1:
            amount = round(creator_pool - allocated, 2)
        else:
            amount = round(creator_pool * agent["price"] / total_price, 2)
            allocated += amount

        splits.append(
            {
                "agentId": agent["id"],
                "agentName": agent["name"],
                "owner": agent["owner"],
                "amount": amount,
            }
        )

    return {
        "currency": "USDC",
        "budget": budget,
        "protocolFeeRate": PROTOCOL_FEE_RATE,
        "protocolFee": fee,
        "creatorPool": creator_pool,
        "splits": splits,
    }


def validate_agent_capacity(budget: float, selected_agents: list[dict]) -> None:
    if not selected_agents:
        raise ApiError(422, "no eligible agents matched this task")

    total_available = sum(
        float(agent.get("availableEscrowLimit", agent.get("escrowLimit", 0)) or 0)
        for agent in selected_agents
    )
    if budget > total_available:
        raise ApiError(422, "budget exceeds matched agents' available escrow capacity")

    escrow_preview = calculate_escrow(budget, selected_agents)
    split_by_agent = {
        split.get("agentId"): float(split.get("amount") or 0)
        for split in escrow_preview.get("splits", [])
    }
    over_capacity = [
        agent.get("name") or agent.get("id") or "unknown agent"
        for agent in selected_agents
        if float(agent.get("availableEscrowLimit", agent.get("escrowLimit", 0)) or 0) < split_by_agent.get(agent.get("id"), 0)
    ]
    if over_capacity:
        raise ApiError(422, f"matched agents' available capacity is too low: {', '.join(over_capacity)}")

    total_stake = sum(float(agent.get("stake", 0)) for agent in selected_agents)
    required_stake = budget * 2
    if total_stake < required_stake:
        raise ApiError(422, "matched agents' stake is too low for this budget")


def validate_agent_ownership_gate(selected_agents: list[dict]) -> None:
    blocked = [
        agent.get("name") or agent.get("id") or "unknown agent"
        for agent in selected_agents
        if (agent.get("ownershipStatus") or {}).get("status") != "verified"
    ]
    if blocked:
        raise ApiError(422, f"agent ownership must be verified before escrow: {', '.join(blocked)}")


def ownership_status_from_proof(
    proof: str | None,
    review_status: str | None = None,
    review_note: str | None = None,
    reviewed_at: int | None = None,
) -> dict:
    value = (proof or "").strip()
    lowered = value.lower()
    normalized_review = (review_status or "").strip().upper()

    if normalized_review == "APPROVED":
        return {
            "status": "verified",
            "label": "平台已校验",
            "method": "人工复核",
            "reviewRequired": False,
            "reviewNote": review_note or "",
            "reviewedAt": reviewed_at,
        }

    if normalized_review == "REJECTED":
        return {
            "status": "rejected",
            "label": "已拒绝",
            "method": "平台复核未通过",
            "reviewRequired": True,
            "reviewNote": review_note or "",
            "reviewedAt": reviewed_at,
        }

    methods = {
        "did:": "DID 签名",
        "agentnft:": "Agent NFT",
        "modelhash:": "模型承诺哈希",
        "reposig:": "代码仓库签名",
    }

    for prefix, method in methods.items():
        if lowered.startswith(prefix):
            return {
                "status": "verified",
                "label": "已校验",
                "method": method,
                "reviewRequired": False,
                "reviewNote": review_note or "",
                "reviewedAt": reviewed_at,
            }

    if value:
        return {
            "status": "review",
            "label": "人工复核",
            "method": "待人工复核",
            "reviewRequired": True,
            "reviewNote": review_note or "",
            "reviewedAt": reviewed_at,
        }

    return {
        "status": "missing",
        "label": "未提交",
        "method": "无所有权证明",
        "reviewRequired": True,
        "reviewNote": review_note or "",
        "reviewedAt": reviewed_at,
    }


def build_arbitration_decision(task_id: str, winner: str, body: dict) -> dict:
    resolution = body.get("resolution")
    if not isinstance(resolution, dict):
        resolution = {}

    decided_at = now_ms()
    reason = str(resolution.get("reason") or "").strip()
    evidence_review = str(resolution.get("evidenceReview") or "").strip()

    if len(reason) < 8:
        raise ApiError(400, "arbitration reason is required")
    if len(evidence_review) < 8:
        raise ApiError(400, "arbitration evidence review is required")

    digest = hashlib.sha256(
        f"{task_id}:{winner}:{reason}:{evidence_review}:{decided_at}".encode("utf-8")
    ).hexdigest()[:10].upper()

    return {
        "outcome": winner,
        "reason": reason,
        "evidenceReview": evidence_review,
        "decisionId": f"ARB-{digest}",
        "arbitrator": "arbitrator",
        "decidedAt": decided_at,
    }


def build_settlement_payload(
    result: str,
    escrow: dict,
    reputation_events: list[dict] | None = None,
    decision: dict | None = None,
    acceptance_confirmation: dict | None = None,
    contract_fingerprint: str | None = None,
) -> dict:
    if acceptance_confirmation and contract_fingerprint and not acceptance_confirmation.get("contractFingerprint"):
        acceptance_confirmation = {**acceptance_confirmation, "contractFingerprint": contract_fingerprint}

    payload = {
        "result": result,
        "settledAt": now_ms(),
        "escrow": escrow,
        "payouts": escrow.get("splits", []),
        "reputationEvents": reputation_events or [],
    }
    if contract_fingerprint:
        payload["contractFingerprint"] = contract_fingerprint
    if decision:
        payload["decision"] = decision
    if acceptance_confirmation:
        payload["acceptanceConfirmation"] = acceptance_confirmation
        confirmation_fingerprint = str(acceptance_confirmation.get("contractFingerprint") or "").strip()
        if confirmation_fingerprint:
            payload["contractFingerprint"] = confirmation_fingerprint
    return payload


def build_refund_payload(
    row: sqlite3.Row,
    reputation_events: list[dict] | None = None,
    decision: dict | None = None,
    contract_fingerprint: str | None = None,
) -> dict:
    payload = {
        "result": "user_won_dispute",
        "refundedAt": now_ms(),
        "refund": row["budget"],
        "slashSuggested": True,
        "reputationEvents": reputation_events or [],
    }
    if contract_fingerprint:
        payload["contractFingerprint"] = contract_fingerprint
    if decision:
        payload["decision"] = decision
    return payload


def build_readiness_payload() -> dict:
    return {
        "ok": True,
        "service": "qianzhi-mock-api",
        "environment": "local",
        "source": "mock",
        "updatedAt": now_ms(),
        "capabilities": [
            {
                "id": "api",
                "label": "API 连接",
                "value": "本地 Mock API",
                "state": "mock",
                "note": "本地开发服务已连接，仍不是生产业务后端",
            },
            {
                "id": "auth",
                "label": "账号与鉴权",
                "value": "待真实登录",
                "state": "todo",
                "note": "mock 服务不提供真实账号、JWT、Session 或钱包签名校验",
            },
            {
                "id": "task-state",
                "label": "任务状态机",
                "value": "API 校验中",
                "state": "mock",
                "note": "mock API 会校验角色、状态和操作签名格式，用于联调交易流程",
            },
            {
                "id": "funding",
                "label": "资金与出账",
                "value": "演示流水",
                "state": "mock",
                "note": "当前只有 SQLite 演示流水，没有真实支付、链上哈希或出账单号",
            },
            {
                "id": "evidence-upload",
                "label": "证据上传",
                "value": "文件哈希存证",
                "state": "mock",
                "note": "mock 支持登记文件名、大小和 SHA-256 哈希，但不保存原文件内容；真实版本需要文件上传、加密存储和权限控制",
            },
            {
                "id": "signature",
                "label": "签名凭证",
                "value": "演示签名",
                "state": "mock",
                "note": "当前签名用于审计展示，真实后端需要校验钱包签名或服务端会话",
            },
            {
                "id": "arbitration",
                "label": "争议仲裁",
                "value": "演示裁决",
                "state": "mock",
                "note": "mock 支持裁决理由和证据核对说明，真实版本需要仲裁员权限与附件",
            },
            {
                "id": "withdrawal",
                "label": "提现与结算",
                "value": "演示审核",
                "state": "mock",
                "note": "mock 支持提现申请和审核状态，真实版本需要钱包地址和出账状态",
            },
        ],
        "nextAsks": [
            "API Base URL",
            "登录/鉴权方式",
            "资金流水和上传接口",
            "仲裁与提现字段",
        ],
    }


def challenge_deadline(conn: sqlite3.Connection, row: sqlite3.Row) -> int | None:
    history = conn.execute(
        """
        SELECT at FROM task_history
        WHERE task_id = ? AND status = 'SUBMITTED'
        ORDER BY at DESC, id DESC
        LIMIT 1
        """,
        (row["id"],),
    ).fetchone()
    if not history:
        return None
    return int(history["at"]) + int(row["challenge_window_hours"]) * 60 * 60 * 1000


def normalize_evidence(value) -> list[dict]:
    if value is None:
        return []
    if isinstance(value, str):
        value = loads(value, [])
    if not isinstance(value, list):
        raise ApiError(400, "evidence must be a list")

    evidence = []
    for item in value:
        if not isinstance(item, dict):
            raise ApiError(400, "evidence items must be objects")
        label = str(item.get("label", "")).strip()
        uri = str(item.get("uri", "")).strip()
        evidence_hash = str(item.get("hash", "")).strip()
        item_type = str(item.get("type", "")).strip() or "reference"
        if not label or not uri:
            raise ApiError(400, "evidence items require label and uri")
        evidence.append(
            {
                "type": item_type,
                "label": label,
                "uri": uri,
                "hash": evidence_hash,
            }
        )
    return evidence


def make_agent_id(name: str) -> str:
    ascii_slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    if not ascii_slug:
        ascii_slug = "agent"
    return f"{ascii_slug[:28]}-{now_ms()}"


def make_tx_id(seed: str) -> str:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()[:12].upper()
    return f"TX-{digest}"


def make_task_contract_fingerprint(task: dict, selected_agents: list[dict], escrow: dict) -> str:
    agents = [
        {
            "id": agent.get("id") or agent.get("agentId") or "",
            "name": agent.get("name") or agent.get("agentName") or agent.get("id") or "",
            "owner": agent.get("owner") or "",
        }
        for agent in selected_agents
    ]
    snapshot = {
        "taskId": task.get("id") or "",
        "description": task.get("description") or task.get("title") or "",
        "category": task.get("category") or "",
        "acceptanceCriteria": str(task.get("acceptanceCriteria") or task.get("acceptance_criteria") or "").strip(),
        "challengeWindowHours": int(task.get("challengeWindowHours") or task.get("challenge_window_hours") or 24),
        "budget": float(task.get("budget") or 0),
        "verification": task.get("verification") or "",
        "agents": agents,
        "escrow": {
            "protocolFee": float((escrow or {}).get("protocolFee") or 0),
            "creatorPool": float((escrow or {}).get("creatorPool") or 0),
        },
    }
    encoded = json.dumps(snapshot, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(encoded.encode("utf-8")).hexdigest()[:8].upper()
    return f"CTR-{digest}"


class ApiError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


class Store:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)

    @contextmanager
    def connect(self) -> Iterator[sqlite3.Connection]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def init(self) -> None:
        with self.connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS meta (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS agents (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    owner TEXT NOT NULL,
                    ownership_proof TEXT NOT NULL DEFAULT '',
                    category TEXT NOT NULL,
                    price REAL NOT NULL,
                    stake REAL NOT NULL,
                    reputation INTEGER NOT NULL,
                    success_rate INTEGER NOT NULL,
                    tasks INTEGER NOT NULL,
                    escrow_limit REAL NOT NULL,
                    verification TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    service_boundary TEXT NOT NULL DEFAULT '',
                    ownership_review_status TEXT NOT NULL DEFAULT '',
                    ownership_review_note TEXT NOT NULL DEFAULT '',
                    ownership_reviewed_at INTEGER,
                    ownership_review_signature_json TEXT,
                    tags_json TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    description TEXT NOT NULL,
                    acceptance_criteria TEXT NOT NULL DEFAULT '',
                    challenge_window_hours INTEGER NOT NULL DEFAULT 24,
                    category TEXT NOT NULL,
                    budget REAL NOT NULL,
                    verification TEXT NOT NULL,
                    status TEXT NOT NULL,
                    deliverable TEXT,
                    deliverable_evidence_json TEXT NOT NULL DEFAULT '[]',
                    escrow_json TEXT NOT NULL,
                    settlement_json TEXT,
                    dispute_json TEXT,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                );

                CREATE TABLE IF NOT EXISTS task_agents (
                    task_id TEXT NOT NULL,
                    agent_id TEXT NOT NULL,
                    snapshot_json TEXT NOT NULL,
                    share_amount REAL NOT NULL,
                    PRIMARY KEY (task_id, agent_id),
                    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS task_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    note TEXT NOT NULL,
                    signature_json TEXT,
                    at INTEGER NOT NULL,
                    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS withdrawals (
                    id TEXT PRIMARY KEY,
                    owner TEXT NOT NULL,
                    amount REAL NOT NULL,
                    status TEXT NOT NULL,
                    requested_at INTEGER NOT NULL,
                    reviewed_at INTEGER,
                    signature_json TEXT NOT NULL,
                    review_signature_json TEXT,
                    review_note TEXT NOT NULL DEFAULT ''
                );

                CREATE TABLE IF NOT EXISTS escrow_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    amount REAL NOT NULL,
                    currency TEXT NOT NULL DEFAULT 'USDC',
                    counterparty TEXT NOT NULL DEFAULT '',
                    tx_id TEXT NOT NULL,
                    note TEXT NOT NULL,
                    at INTEGER NOT NULL,
                    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS evidence_vault (
                    id TEXT PRIMARY KEY,
                    task_id TEXT,
                    evidence_type TEXT NOT NULL,
                    label TEXT NOT NULL,
                    file_name TEXT NOT NULL,
                    mime_type TEXT NOT NULL DEFAULT '',
                    size_bytes INTEGER NOT NULL,
                    sha256 TEXT NOT NULL,
                    uri TEXT NOT NULL,
                    created_by TEXT NOT NULL,
                    created_at INTEGER NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON task_history(task_id, at);
                CREATE INDEX IF NOT EXISTS idx_withdrawals_owner ON withdrawals(owner, requested_at DESC);
                CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status, requested_at DESC);
                CREATE INDEX IF NOT EXISTS idx_escrow_events_task_id ON escrow_events(task_id, at, id);
                CREATE INDEX IF NOT EXISTS idx_evidence_vault_task_id ON evidence_vault(task_id, created_at DESC);
                """
            )
            self.ensure_agent_schema(conn)
            self.ensure_task_schema(conn)
            self.ensure_task_history_schema(conn)
            self.ensure_withdrawal_schema(conn)
            self.seed_agents(conn)
            self.seed_task(conn)
            self.ensure_escrow_events(conn)

    def ensure_agent_schema(self, conn: sqlite3.Connection) -> None:
        columns = {row["name"] for row in conn.execute("PRAGMA table_info(agents)").fetchall()}
        if "ownership_proof" not in columns:
            conn.execute("ALTER TABLE agents ADD COLUMN ownership_proof TEXT NOT NULL DEFAULT ''")
        if "service_boundary" not in columns:
            conn.execute("ALTER TABLE agents ADD COLUMN service_boundary TEXT NOT NULL DEFAULT ''")
        if "ownership_review_status" not in columns:
            conn.execute("ALTER TABLE agents ADD COLUMN ownership_review_status TEXT NOT NULL DEFAULT ''")
        if "ownership_review_note" not in columns:
            conn.execute("ALTER TABLE agents ADD COLUMN ownership_review_note TEXT NOT NULL DEFAULT ''")
        if "ownership_reviewed_at" not in columns:
            conn.execute("ALTER TABLE agents ADD COLUMN ownership_reviewed_at INTEGER")
        if "ownership_review_signature_json" not in columns:
            conn.execute("ALTER TABLE agents ADD COLUMN ownership_review_signature_json TEXT")

        conn.execute(
            """
            UPDATE agents
            SET ownership_proof = 'DID:' || id
            WHERE ownership_proof IS NULL OR ownership_proof = ''
            """
        )
        conn.execute(
            """
            UPDATE agents
            SET service_boundary = ?
            WHERE service_boundary IS NULL OR service_boundary = ''
            """,
            ("只承接能力说明范围内的任务；高风险结论需要用户二次复核。",),
        )

    def ensure_task_schema(self, conn: sqlite3.Connection) -> None:
        columns = {row["name"] for row in conn.execute("PRAGMA table_info(tasks)").fetchall()}
        if "acceptance_criteria" not in columns:
            conn.execute("ALTER TABLE tasks ADD COLUMN acceptance_criteria TEXT NOT NULL DEFAULT ''")
        if "challenge_window_hours" not in columns:
            conn.execute("ALTER TABLE tasks ADD COLUMN challenge_window_hours INTEGER NOT NULL DEFAULT 24")
        if "deliverable_evidence_json" not in columns:
            conn.execute("ALTER TABLE tasks ADD COLUMN deliverable_evidence_json TEXT NOT NULL DEFAULT '[]'")

        conn.execute(
            """
            UPDATE tasks
            SET acceptance_criteria = ?
            WHERE acceptance_criteria IS NULL OR acceptance_criteria = ''
            """,
            ("交付物需要覆盖任务目标、风险点、可执行建议，并能被用户复核。",),
        )
        conn.execute(
            """
            UPDATE tasks
            SET challenge_window_hours = 24
            WHERE challenge_window_hours IS NULL OR challenge_window_hours <= 0
            """
        )

    def ensure_task_history_schema(self, conn: sqlite3.Connection) -> None:
        columns = {row["name"] for row in conn.execute("PRAGMA table_info(task_history)").fetchall()}
        if "signature_json" not in columns:
            conn.execute("ALTER TABLE task_history ADD COLUMN signature_json TEXT")

    def ensure_withdrawal_schema(self, conn: sqlite3.Connection) -> None:
        columns = {row["name"] for row in conn.execute("PRAGMA table_info(withdrawals)").fetchall()}
        if "review_signature_json" not in columns:
            conn.execute("ALTER TABLE withdrawals ADD COLUMN review_signature_json TEXT")

    def seed_agents(self, conn: sqlite3.Connection) -> None:
        count = conn.execute("SELECT COUNT(*) FROM agents").fetchone()[0]
        if count:
            return

        conn.executemany(
            """
                INSERT INTO agents (
                    id, name, owner, ownership_proof, category, price, stake, reputation,
                    success_rate, tasks, escrow_limit, verification, summary, service_boundary,
                    ownership_review_status, ownership_review_note, ownership_reviewed_at,
                    ownership_review_signature_json, tags_json
                )
                VALUES (
                    :id, :name, :owner, :ownershipProof, :category, :price, :stake, :reputation,
                    :successRate, :tasks, :escrowLimit, :verification, :summary, :serviceBoundary,
                    '', '', NULL, NULL, :tags_json
                )
            """,
            [
                {
                    **agent,
                    "ownershipProof": agent.get("ownershipProof") or f"DID:{agent['id']}",
                    "serviceBoundary": agent.get("serviceBoundary")
                    or "只承接能力说明范围内的任务；高风险结论需要用户二次复核。",
                    "tags_json": dumps(agent["tags"]),
                }
                for agent in AGENT_SEEDS
            ],
        )

    def seed_task(self, conn: sqlite3.Connection) -> None:
        count = conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0]
        if count:
            self.seed_settled_demo_task(conn)
            self.seed_disputed_demo_task(conn)
            self.ensure_next_task_number(conn)
            return

        selected_agents = [
            self.agent_by_id(conn, "legal-sg-001"),
            self.agent_by_id(conn, "trans-local-006"),
        ]
        escrow = calculate_escrow(80, selected_agents)
        task = {
            "id": "QZ-1025",
            "description": "审查护肤品出口新加坡的标签合规风险，并给出修改建议。",
            "acceptanceCriteria": "交付物需列出风险等级、对应法规依据、建议替换文案和仍需人工确认的不确定项。",
            "challengeWindowHours": 24,
            "category": "legal",
            "budget": 80,
            "verification": "TEE",
            "status": "SUBMITTED",
            "deliverable": "初步合规报告已提交，等待用户验收。",
            "deliverableEvidence": [
                {
                    "type": "report",
                    "label": "合规报告摘要",
                    "uri": "qz://deliverables/QZ-1025/report.md",
                    "hash": "sha256-qz-1025-report",
                },
                {
                    "type": "audit",
                    "label": "TEE 执行审计引用",
                    "uri": "qz://audit/QZ-1025/tee-run",
                    "hash": "sha256-qz-1025-tee",
                },
            ],
            "escrow": escrow,
            "settlement": None,
            "dispute": None,
            "createdAt": now_ms(),
        }
        self.insert_task(conn, task, selected_agents)
        self.append_history(conn, task["id"], "MATCHED", "platform", "平台生成 Agent 执行方案")
        self.append_history(conn, task["id"], "FUNDED", "user", "用户确认方案并托管 80 USDC")
        self.append_history(conn, task["id"], "IN_PROGRESS", "agent", "Agent 开始执行")
        self.append_history(conn, task["id"], "SUBMITTED", "agent", "Agent 提交交付物")
        self.seed_settled_demo_task(conn)
        self.seed_disputed_demo_task(conn)
        self.set_meta(conn, "next_task_number", "1026")

    def seed_settled_demo_task(self, conn: sqlite3.Connection) -> None:
        exists = conn.execute("SELECT 1 FROM tasks WHERE id = ?", ("QZ-1019",)).fetchone()
        if exists:
            return

        selected_agents = [self.agent_by_id(conn, "growth-005")]
        escrow = calculate_escrow(120, selected_agents)
        task = {
            "id": "QZ-1019",
            "description": "复盘小红书投放素材，输出下一轮内容策略。",
            "acceptanceCriteria": "交付物需包含表现最好的素材共性、低效素材原因、下一轮选题和预算分配建议。",
            "challengeWindowHours": 24,
            "category": "ops",
            "budget": 120,
            "verification": "Optimistic",
            "status": "SETTLED",
            "deliverable": "投放复盘和下一轮内容策略已验收通过。",
            "deliverableEvidence": [
                {
                    "type": "report",
                    "label": "增长复盘报告",
                    "uri": "qz://deliverables/QZ-1019/growth-review.md",
                    "hash": "sha256-qz-1019-review",
                }
            ],
            "escrow": escrow,
            "settlement": build_settlement_payload(
                "accepted",
                escrow,
                [
                    {
                        "agentId": "growth-005",
                        "agentName": selected_agents[0]["name"],
                        "reputationBefore": 89,
                        "reputationAfter": 90,
                        "successRateBefore": 93,
                        "successRateAfter": 94,
                        "stakeSlash": 0,
                    }
                ],
            ),
            "dispute": None,
            "createdAt": now_ms(),
        }
        task["settlement"]["contractFingerprint"] = make_task_contract_fingerprint(task, selected_agents, escrow)
        self.insert_task(conn, task, selected_agents)
        self.append_history(conn, task["id"], "MATCHED", "platform", "平台生成 Agent 执行方案")
        self.append_history(conn, task["id"], "FUNDED", "user", "用户确认方案并托管 120 USDC")
        self.append_history(conn, task["id"], "IN_PROGRESS", "agent", "Agent 开始执行")
        self.append_history(conn, task["id"], "SUBMITTED", "agent", "Agent 提交交付物")
        self.append_history(conn, task["id"], "SETTLED", "user", "用户验收通过，托管资金完成分账")

    def seed_disputed_demo_task(self, conn: sqlite3.Connection) -> None:
        exists = conn.execute("SELECT 1 FROM tasks WHERE id = ?", ("QZ-1018",)).fetchone()
        if exists:
            return

        selected_agents = [self.agent_by_id(conn, "design-pack-002")]
        escrow = calculate_escrow(60, selected_agents)
        task = {
            "id": "QZ-1018",
            "description": "审核一组美妆包装主图是否存在夸大功效风险。",
            "acceptanceCriteria": "交付物需指出每张主图的风险点、夸大表述、替换建议和需要人工确认的证据缺口。",
            "challengeWindowHours": 24,
            "category": "design",
            "budget": 60,
            "verification": "Optimistic",
            "status": "DISPUTED",
            "deliverable": "包装主图风险清单已提交，但用户认为缺少第 3 张图的功效宣称依据。",
            "deliverableEvidence": [
                {
                    "type": "report",
                    "label": "包装主图审核清单",
                    "uri": "qz://deliverables/QZ-1018/design-audit.md",
                    "hash": "sha256-qz-1018-report",
                }
            ],
            "escrow": escrow,
            "settlement": None,
            "dispute": {
                "reason": "用户认为第 3 张图的功效宣称没有被单独评估，要求仲裁复核。",
                "openedAt": now_ms(),
                "evidence": [
                    {
                        "type": "dispute-note",
                        "label": "用户争议说明",
                        "uri": "qz://disputes/QZ-1018/reason.md",
                        "hash": "sha256-qz-1018-dispute",
                    },
                    {
                        "type": "source-image",
                        "label": "第 3 张包装主图引用",
                        "uri": "qz://evidence/QZ-1018/image-03.png",
                        "hash": "sha256-qz-1018-image-03",
                    },
                ],
            },
            "createdAt": now_ms(),
        }
        self.insert_task(conn, task, selected_agents)
        self.append_history(conn, task["id"], "MATCHED", "platform", "平台生成 Agent 执行方案")
        self.append_history(conn, task["id"], "FUNDED", "user", "用户确认方案并托管 60 USDC")
        self.append_history(conn, task["id"], "IN_PROGRESS", "agent", "Agent 开始执行")
        self.append_history(conn, task["id"], "SUBMITTED", "agent", "Agent 提交交付物")
        self.append_history(conn, task["id"], "DISPUTED", "user", "用户发起争议，等待仲裁")

    def ensure_next_task_number(self, conn: sqlite3.Connection) -> None:
        current = self.get_meta(conn, "next_task_number")
        if current:
            return

        rows = conn.execute("SELECT id FROM tasks WHERE id LIKE 'QZ-%'").fetchall()
        highest = 1025
        for row in rows:
            try:
                highest = max(highest, int(row["id"].split("-", 1)[1]))
            except (IndexError, ValueError):
                pass
        self.set_meta(conn, "next_task_number", str(highest + 1))

    def get_meta(self, conn: sqlite3.Connection, key: str) -> str | None:
        row = conn.execute("SELECT value FROM meta WHERE key = ?", (key,)).fetchone()
        return row["value"] if row else None

    def set_meta(self, conn: sqlite3.Connection, key: str, value: str) -> None:
        conn.execute(
            "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (key, value),
        )

    def next_task_id(self, conn: sqlite3.Connection) -> str:
        self.ensure_next_task_number(conn)
        next_number = int(self.get_meta(conn, "next_task_number") or "1026")
        self.set_meta(conn, "next_task_number", str(next_number + 1))
        return f"QZ-{next_number}"

    def next_withdrawal_id(self, conn: sqlite3.Connection) -> str:
        next_number = int(self.get_meta(conn, "next_withdrawal_number") or "1001")
        self.set_meta(conn, "next_withdrawal_number", str(next_number + 1))
        return f"WD-{next_number}"

    def row_to_agent(self, row: sqlite3.Row) -> dict:
        return {
            "id": row["id"],
            "name": row["name"],
            "owner": row["owner"],
            "ownershipProof": row["ownership_proof"],
            "ownershipStatus": ownership_status_from_proof(
                row["ownership_proof"],
                row["ownership_review_status"],
                row["ownership_review_note"],
                row["ownership_reviewed_at"],
            ),
            "ownershipReviewSignature": loads(row["ownership_review_signature_json"], None),
            "category": row["category"],
            "price": row["price"],
            "stake": row["stake"],
            "reputation": row["reputation"],
            "successRate": row["success_rate"],
            "tasks": row["tasks"],
            "escrowLimit": row["escrow_limit"],
            "verification": row["verification"],
            "summary": row["summary"],
            "serviceBoundary": row["service_boundary"],
            "tags": loads(row["tags_json"], []),
        }

    def active_capacity_by_agent(self, conn: sqlite3.Connection, ignore_task_id: str | None = None) -> dict[str, float]:
        placeholders = ",".join("?" for _ in ACTIVE_CAPACITY_STATUSES)
        params: list = list(ACTIVE_CAPACITY_STATUSES)
        sql = f"""
            SELECT ta.agent_id, SUM(ta.share_amount) AS locked_capacity
            FROM task_agents ta
            JOIN tasks t ON t.id = ta.task_id
            WHERE t.status IN ({placeholders})
        """
        if ignore_task_id:
            sql += " AND t.id != ?"
            params.append(ignore_task_id)
        sql += " GROUP BY ta.agent_id"
        rows = conn.execute(sql, params).fetchall()
        return {row["agent_id"]: float(row["locked_capacity"] or 0) for row in rows}

    def apply_capacity_snapshot(self, agent: dict, locked_by_agent: dict[str, float]) -> dict:
        locked_capacity = round(float(locked_by_agent.get(agent.get("id"), 0) or 0), 2)
        escrow_limit = float(agent.get("escrowLimit") or 0)
        agent["lockedCapacity"] = locked_capacity
        agent["availableEscrowLimit"] = round(max(0.0, escrow_limit - locked_capacity), 2)
        return agent

    def row_to_withdrawal(self, row: sqlite3.Row) -> dict:
        return {
            "id": row["id"],
            "owner": row["owner"],
            "amount": row["amount"],
            "status": row["status"],
            "requestedAt": row["requested_at"],
            "reviewedAt": row["reviewed_at"],
            "signature": loads(row["signature_json"], {}),
            "reviewSignature": loads(row["review_signature_json"], None),
            "reviewNote": row["review_note"],
        }

    def row_to_escrow_event(self, row: sqlite3.Row) -> dict:
        return {
            "id": row["id"],
            "type": row["event_type"],
            "actor": row["actor"],
            "amount": row["amount"],
            "currency": row["currency"],
            "counterparty": row["counterparty"],
            "txId": row["tx_id"],
            "note": row["note"],
            "at": row["at"],
        }

    def row_to_history_item(self, row: sqlite3.Row) -> dict:
        item = {
            "status": row["status"],
            "actor": row["actor"],
            "note": row["note"],
            "at": row["at"],
        }
        signature = loads(row["signature_json"], None)
        if signature:
            item["signature"] = signature
        return item

    def task_agent_snapshots(self, conn: sqlite3.Connection, task_id: str) -> list[dict]:
        agent_rows = conn.execute(
            "SELECT snapshot_json FROM task_agents WHERE task_id = ? ORDER BY rowid",
            (task_id,),
        ).fetchall()
        return [loads(agent_row["snapshot_json"], {}) for agent_row in agent_rows]

    def contract_fingerprint_for_row(self, conn: sqlite3.Connection, row: sqlite3.Row) -> str:
        selected_agents = self.task_agent_snapshots(conn, row["id"])
        task = {
            "id": row["id"],
            "description": row["description"],
            "acceptanceCriteria": row["acceptance_criteria"],
            "challengeWindowHours": row["challenge_window_hours"],
            "category": row["category"],
            "budget": row["budget"],
            "verification": row["verification"],
        }
        return make_task_contract_fingerprint(task, selected_agents, loads(row["escrow_json"], {}))

    def row_to_task(self, conn: sqlite3.Connection, row: sqlite3.Row) -> dict:
        task_id = row["id"]
        selected_agents = self.task_agent_snapshots(conn, task_id)
        escrow = loads(row["escrow_json"], {})
        contract_fingerprint = make_task_contract_fingerprint(
            {
                "id": task_id,
                "description": row["description"],
                "acceptanceCriteria": row["acceptance_criteria"],
                "challengeWindowHours": row["challenge_window_hours"],
                "category": row["category"],
                "budget": row["budget"],
                "verification": row["verification"],
            },
            selected_agents,
            escrow,
        )
        history_rows = conn.execute(
            "SELECT status, actor, note, signature_json, at FROM task_history WHERE task_id = ? ORDER BY at, id",
            (task_id,),
        ).fetchall()
        escrow_rows = conn.execute(
            "SELECT * FROM escrow_events WHERE task_id = ? ORDER BY at, id",
            (task_id,),
        ).fetchall()
        settlement = loads(row["settlement_json"], None)
        if settlement and not settlement.get("contractFingerprint"):
            settlement = {**settlement, "contractFingerprint": contract_fingerprint}

        return {
            "id": task_id,
            "description": row["description"],
            "acceptanceCriteria": row["acceptance_criteria"],
            "challengeWindowHours": row["challenge_window_hours"],
            "category": row["category"],
            "budget": row["budget"],
            "verification": row["verification"],
            "status": row["status"],
            "deliverable": row["deliverable"],
            "deliverableEvidence": loads(row["deliverable_evidence_json"], []),
            "escrow": escrow,
            "settlement": settlement,
            "dispute": loads(row["dispute_json"], None),
            "contractFingerprint": contract_fingerprint,
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
            "selectedAgents": selected_agents,
            "history": [self.row_to_history_item(history_row) for history_row in history_rows],
            "escrowEvents": [self.row_to_escrow_event(event_row) for event_row in escrow_rows],
        }

    def agent_by_id(self, conn: sqlite3.Connection, agent_id: str) -> dict:
        row = conn.execute("SELECT * FROM agents WHERE id = ?", (agent_id,)).fetchone()
        if not row:
            raise ApiError(404, "agent not found")
        return self.row_to_agent(row)

    def list_agents(self, category: str = "all", keyword: str = "") -> list[dict]:
        with self.connect() as conn:
            sql = "SELECT * FROM agents"
            params: list = []
            clauses = []

            if category and category != "all":
                clauses.append("category = ?")
                params.append(category)

            if keyword:
                clauses.append(
                    "("
                    "LOWER(name) LIKE ? OR LOWER(owner) LIKE ? OR LOWER(ownership_proof) LIKE ? "
                    "OR LOWER(summary) LIKE ? OR LOWER(service_boundary) LIKE ? OR LOWER(tags_json) LIKE ?"
                    ")"
                )
                like = f"%{keyword.lower()}%"
                params.extend([like, like, like, like, like, like])

            if clauses:
                sql += " WHERE " + " AND ".join(clauses)
            sql += " ORDER BY reputation DESC, success_rate DESC, price ASC"

            locked_by_agent = self.active_capacity_by_agent(conn)
            return [
                self.apply_capacity_snapshot(self.row_to_agent(row), locked_by_agent)
                for row in conn.execute(sql, params)
            ]

    def list_creator_accounts(self) -> dict:
        with self.connect() as conn:
            agent_rows = conn.execute("SELECT * FROM agents ORDER BY owner, reputation DESC").fetchall()
            agents = [self.row_to_agent(row) for row in agent_rows]
            task_rows = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
            tasks = [self.row_to_task(conn, row) for row in task_rows]

        creators: dict[str, dict] = {}

        def ensure_creator(owner: str | None) -> dict:
            key = owner or "未知创作者"
            if key not in creators:
                creators[key] = {
                    "owner": key,
                    "agentCount": 0,
                    "agentNames": [],
                    "settledIncome": 0.0,
                    "pendingIncome": 0.0,
                    "disputedIncome": 0.0,
                    "refundedAmount": 0.0,
                    "stake": 0.0,
                    "escrowLimit": 0.0,
                    "tasks": 0,
                    "reputationTotal": 0,
                    "successTotal": 0,
                    "verifiedAgents": 0,
                    "reviewAgents": 0,
                    "missingOwnership": 0,
                }
            return creators[key]

        agent_index = {}
        for agent in agents:
            agent_index[agent["id"]] = agent
            agent_index[agent["name"]] = agent
            row = ensure_creator(agent["owner"])
            row["agentCount"] += 1
            row["agentNames"].append(agent["name"])
            row["stake"] += float(agent.get("stake") or 0)
            row["escrowLimit"] += float(agent.get("escrowLimit") or 0)
            row["tasks"] += int(agent.get("tasks") or 0)
            row["reputationTotal"] += int(agent.get("reputation") or 0)
            row["successTotal"] += int(agent.get("successRate") or 0)
            ownership_status = (agent.get("ownershipStatus") or {}).get("status")
            if ownership_status == "verified":
                row["verifiedAgents"] += 1
            elif ownership_status == "review":
                row["reviewAgents"] += 1
            else:
                row["missingOwnership"] += 1

        for task in tasks:
            settlement = task.get("settlement") or {}
            escrow = settlement.get("escrow") or task.get("escrow") or {}
            payouts = settlement.get("payouts") or escrow.get("splits") or []
            is_refund = task.get("status") == "REFUNDED" or settlement.get("result") == "user_won_dispute"
            is_disputed = task.get("status") == "DISPUTED"
            is_pending = task.get("status") in {"FUNDED", "IN_PROGRESS", "SUBMITTED"}

            for payout in payouts:
                agent = agent_index.get(payout.get("agentId")) or agent_index.get(payout.get("agentName")) or {}
                owner = payout.get("owner") or agent.get("owner")
                row = ensure_creator(owner)
                amount = float(payout.get("amount") or 0)

                if is_refund:
                    fallback = float(settlement.get("refund") or task.get("budget") or 0) / max(1, len(payouts))
                    row["refundedAmount"] += amount or fallback
                elif settlement:
                    row["settledIncome"] += amount
                elif is_disputed:
                    row["disputedIncome"] += amount
                elif is_pending:
                    fallback = float(escrow.get("creatorPool") or 0) / max(1, len(payouts))
                    row["pendingIncome"] += amount or fallback

        rows = []
        for row in creators.values():
            agent_count = row["agentCount"] or 0
            rows.append(
                {
                    "owner": row["owner"],
                    "agentCount": agent_count,
                    "agentNames": row["agentNames"],
                    "settledIncome": round(row["settledIncome"], 2),
                    "pendingIncome": round(row["pendingIncome"], 2),
                    "disputedIncome": round(row["disputedIncome"], 2),
                    "refundedAmount": round(row["refundedAmount"], 2),
                    "stake": round(row["stake"], 2),
                    "escrowLimit": round(row["escrowLimit"], 2),
                    "tasks": row["tasks"],
                    "verifiedAgents": row["verifiedAgents"],
                    "reviewAgents": row["reviewAgents"],
                    "missingOwnership": row["missingOwnership"],
                    "averageReputation": round(row["reputationTotal"] / agent_count) if agent_count else 0,
                    "averageSuccessRate": round(row["successTotal"] / agent_count) if agent_count else 0,
                    "withdrawable": round(max(0, row["settledIncome"] - row["refundedAmount"]), 2),
                }
            )

        rows.sort(key=lambda item: (item["withdrawable"], item["agentCount"]), reverse=True)
        return {
            "summary": {
                "creators": len(rows),
                "agents": len(agents),
                "withdrawable": round(sum(row["withdrawable"] for row in rows), 2),
                "stake": round(sum(row["stake"] for row in rows), 2),
                "verifiedAgents": sum(row["verifiedAgents"] for row in rows),
                "reviewAgents": sum(row["reviewAgents"] for row in rows),
            },
            "rows": rows,
        }

    def list_withdrawals(self) -> list[dict]:
        with self.connect() as conn:
            rows = conn.execute(
                "SELECT * FROM withdrawals ORDER BY requested_at DESC, id DESC"
            ).fetchall()
            return [self.row_to_withdrawal(row) for row in rows]

    def reserved_withdrawal_amount(self, conn: sqlite3.Connection, owner: str) -> float:
        row = conn.execute(
            """
            SELECT COALESCE(SUM(amount), 0) AS amount
            FROM withdrawals
            WHERE owner = ? AND status IN ('PENDING_REVIEW', 'APPROVED')
            """,
            (owner,),
        ).fetchone()
        return float(row["amount"] or 0)

    def creator_withdrawable_amount(self, owner: str) -> float:
        ledger = self.list_creator_accounts()
        creator = next((row for row in ledger["rows"] if row["owner"] == owner), None)
        if not creator:
            raise ApiError(404, "creator not found")

        with self.connect() as conn:
            reserved = self.reserved_withdrawal_amount(conn, owner)
        return round(max(0, float(creator["withdrawable"] or 0) - reserved), 2)

    def create_withdrawal(self, body: dict) -> dict:
        actor = str(body.get("actor", "")).strip()
        require_actor(actor, "agent")

        owner = str(body.get("owner", "")).strip()
        try:
            amount = round(float(body.get("amount", 0)), 2)
        except (TypeError, ValueError):
            raise ApiError(400, "amount must be a number")

        if len(owner) < 2:
            raise ApiError(400, "owner is required")
        if amount <= 0:
            raise ApiError(400, "amount must be greater than 0")

        signature = validate_withdrawal_signature(body, "withdraw-request", actor, owner, amount)
        available = self.creator_withdrawable_amount(owner)
        if amount > available:
            raise ApiError(422, f"withdrawal amount exceeds available balance {available}")

        with self.connect() as conn:
            withdrawal_id = self.next_withdrawal_id(conn)
            conn.execute(
                """
                INSERT INTO withdrawals (
                    id, owner, amount, status, requested_at, reviewed_at,
                    signature_json, review_signature_json, review_note
                )
                VALUES (?, ?, ?, 'PENDING_REVIEW', ?, NULL, ?, NULL, '')
                """,
                (
                    withdrawal_id,
                    owner,
                    amount,
                    now_ms(),
                    dumps(signature),
                ),
            )
            row = conn.execute("SELECT * FROM withdrawals WHERE id = ?", (withdrawal_id,)).fetchone()
            return self.row_to_withdrawal(row)

    def review_withdrawal(self, withdrawal_id: str, action: str, body: dict) -> dict:
        if action not in {"approve", "reject"}:
            raise ApiError(400, "withdrawal action must be approve or reject")

        actor = str(body.get("actor", "")).strip()
        require_actor(actor, "platform")

        with self.connect() as conn:
            row = conn.execute("SELECT * FROM withdrawals WHERE id = ?", (withdrawal_id,)).fetchone()
            if not row:
                raise ApiError(404, "withdrawal not found")
            if row["status"] != "PENDING_REVIEW":
                raise ApiError(409, f"withdrawal status must be PENDING_REVIEW, current is {row['status']}")

            signature = validate_withdrawal_signature(
                body,
                f"withdraw-{action}",
                actor,
                row["owner"],
                float(row["amount"]),
                withdrawal_id,
            )
            next_status = "APPROVED" if action == "approve" else "REJECTED"
            review_note = (
                "平台已核对结算和争议风险，等待真实出账"
                if action == "approve"
                else "平台拒绝提现，余额回到可提现池"
            )
            conn.execute(
                """
                UPDATE withdrawals
                SET status = ?, reviewed_at = ?, review_signature_json = ?, review_note = ?
                WHERE id = ?
                """,
                (next_status, now_ms(), dumps(signature), review_note, withdrawal_id),
            )
            updated = conn.execute("SELECT * FROM withdrawals WHERE id = ?", (withdrawal_id,)).fetchone()
            return self.row_to_withdrawal(updated)

    def review_agent_ownership(self, agent_id: str, action: str, body: dict) -> dict:
        if action not in {"approve", "reject"}:
            raise ApiError(400, "ownership action must be approve or reject")

        actor = str(body.get("actor", "")).strip()
        require_actor(actor, "platform")

        with self.connect() as conn:
            row = conn.execute("SELECT * FROM agents WHERE id = ?", (agent_id,)).fetchone()
            if not row:
                raise ApiError(404, "agent not found")
            if not str(row["ownership_proof"] or "").strip():
                raise ApiError(409, "agent has no ownership proof to review")

            signature = validate_ownership_review_signature(
                body,
                f"ownership-{action}",
                actor,
                agent_id,
                row["owner"],
            )
            review_note = (
                "平台已复核创作者证明，Agent 可进入可信匹配池"
                if action == "approve"
                else "平台复核未通过，需创作者补充所有权证明"
            )
            conn.execute(
                """
                UPDATE agents
                SET ownership_review_status = ?,
                    ownership_review_note = ?,
                    ownership_reviewed_at = ?,
                    ownership_review_signature_json = ?
                WHERE id = ?
                """,
                (
                    "APPROVED" if action == "approve" else "REJECTED",
                    review_note,
                    now_ms(),
                    dumps(signature),
                    agent_id,
                ),
            )
            updated = conn.execute("SELECT * FROM agents WHERE id = ?", (agent_id,)).fetchone()
            return self.row_to_agent(updated)

    def create_agent(self, body: dict) -> dict:
        name = str(body.get("name", "")).strip()
        owner = str(body.get("owner", "")).strip()
        ownership_proof = str(body.get("ownershipProof", "")).strip()
        category = str(body.get("category", "")).strip()
        verification = str(body.get("verification", "")).strip() or "Optimistic"
        summary = str(body.get("summary", "")).strip()
        service_boundary = str(body.get("serviceBoundary", "")).strip()
        tags = body.get("tags", [])
        creator_declaration = body.get("creatorDeclaration")

        if isinstance(tags, str):
            tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
        if not isinstance(tags, list):
            raise ApiError(400, "tags must be a list or comma-separated string")
        if not isinstance(creator_declaration, dict):
            raise ApiError(400, "creatorDeclaration is required")
        if not all(
            bool(creator_declaration.get(key))
            for key in ("ownsAgent", "nonCustody", "outcomePayout")
        ):
            raise ApiError(400, "creatorDeclaration must confirm ownership, non-custody, and outcome payout")

        try:
            price = float(body.get("price", 0))
            stake = float(body.get("stake", 0))
            escrow_limit = float(body.get("escrowLimit", 0))
        except (TypeError, ValueError):
            raise ApiError(400, "price, stake, and escrowLimit must be numbers")

        if len(name) < 3:
            raise ApiError(400, "agent name is too short")
        if len(owner) < 2:
            raise ApiError(400, "owner is required")
        if not category:
            raise ApiError(400, "category is required")
        if price <= 0:
            raise ApiError(400, "price must be greater than 0")
        if stake < max(100, price * 20):
            raise ApiError(400, "stake is too low for safe matching")
        if escrow_limit < price:
            raise ApiError(400, "escrowLimit must be at least the starting price")
        if len(ownership_proof) < 6:
            raise ApiError(400, "ownershipProof is too short")
        if len(summary) < 12:
            raise ApiError(400, "summary is too short")
        if len(service_boundary) < 8:
            raise ApiError(400, "serviceBoundary is too short")

        with self.connect() as conn:
            existing = conn.execute("SELECT id FROM agents WHERE name = ?", (name,)).fetchone()
            if existing:
                raise ApiError(409, "agent name already exists")

            agent = {
                "id": make_agent_id(name),
                "name": name,
                "owner": owner,
                "ownershipProof": ownership_proof,
                "category": category,
                "price": price,
                "stake": stake,
                "reputation": 60,
                "successRate": 0,
                "tasks": 0,
                "escrowLimit": escrow_limit,
                "verification": verification,
                "summary": summary,
                "serviceBoundary": service_boundary,
                "tags": [str(tag).strip() for tag in tags if str(tag).strip()],
            }
            conn.execute(
                """
                INSERT INTO agents (
                    id, name, owner, ownership_proof, category, price, stake, reputation,
                    success_rate, tasks, escrow_limit, verification, summary, service_boundary,
                    ownership_review_status, ownership_review_note, ownership_reviewed_at,
                    ownership_review_signature_json, tags_json
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', NULL, NULL, ?)
                """,
                (
                    agent["id"],
                    agent["name"],
                    agent["owner"],
                    agent["ownershipProof"],
                    agent["category"],
                    agent["price"],
                    agent["stake"],
                    agent["reputation"],
                    agent["successRate"],
                    agent["tasks"],
                    agent["escrowLimit"],
                    agent["verification"],
                    agent["summary"],
                    agent["serviceBoundary"],
                    "PENDING_REVIEW"
                    if ownership_status_from_proof(ownership_proof)["status"] != "verified"
                    else "",
                    dumps(agent["tags"]),
                ),
            )
            row = conn.execute("SELECT * FROM agents WHERE id = ?", (agent["id"],)).fetchone()
            return self.row_to_agent(row)

    def list_tasks(self) -> list[dict]:
        with self.connect() as conn:
            rows = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
            return [self.row_to_task(conn, row) for row in rows]

    def get_task(self, task_id: str) -> dict:
        with self.connect() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            if not row:
                raise ApiError(404, "task not found")
            return self.row_to_task(conn, row)

    def create_evidence_record(self, body: dict) -> dict:
        task_id = str(body.get("taskId", "")).strip()
        evidence_type = str(body.get("type", "")).strip() or "file"
        file_name = str(body.get("fileName", "")).strip()
        label = str(body.get("label", "")).strip() or file_name
        mime_type = str(body.get("mimeType", "")).strip()
        created_by = str(body.get("actor", "")).strip() or "agent"
        raw_hash = str(body.get("sha256") or body.get("hash") or "").strip().lower()
        if raw_hash.startswith("sha256-"):
            raw_hash = raw_hash.removeprefix("sha256-")

        try:
            size_bytes = int(body.get("sizeBytes", 0))
        except (TypeError, ValueError):
            size_bytes = 0

        if not file_name:
            raise ApiError(400, "fileName is required")
        if not label:
            raise ApiError(400, "label is required")
        if size_bytes <= 0:
            raise ApiError(400, "sizeBytes must be positive")
        if not EVIDENCE_HASH_PATTERN.match(raw_hash):
            raise ApiError(400, "sha256 must be a 64 character hex digest")

        timestamp = now_ms()
        evidence_id = f"EV-{hashlib.sha256(f'{task_id}:{file_name}:{raw_hash}:{timestamp}'.encode('utf-8')).hexdigest()[:12].upper()}"
        scope = task_id or "unbound"
        uri = f"qz://evidence/{scope}/{raw_hash[:16]}"
        record = {
            "id": evidence_id,
            "taskId": task_id,
            "type": evidence_type,
            "label": label,
            "fileName": file_name,
            "mimeType": mime_type,
            "sizeBytes": size_bytes,
            "sha256": raw_hash,
            "hash": f"sha256-{raw_hash}",
            "uri": uri,
            "createdBy": created_by,
            "createdAt": timestamp,
        }

        with self.connect() as conn:
            if task_id:
                row = conn.execute("SELECT id FROM tasks WHERE id = ?", (task_id,)).fetchone()
                if not row:
                    raise ApiError(404, "task not found")

            conn.execute(
                """
                INSERT INTO evidence_vault (
                    id, task_id, evidence_type, label, file_name, mime_type,
                    size_bytes, sha256, uri, created_by, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record["id"],
                    record["taskId"],
                    record["type"],
                    record["label"],
                    record["fileName"],
                    record["mimeType"],
                    record["sizeBytes"],
                    record["sha256"],
                    record["uri"],
                    record["createdBy"],
                    record["createdAt"],
                ),
            )
        return record

    def match_agents(
        self,
        conn: sqlite3.Connection,
        category: str,
        selected_agent_names: list[str],
        budget: float,
    ) -> list[dict]:
        locked_by_agent = self.active_capacity_by_agent(conn)
        if selected_agent_names:
            placeholders = ",".join("?" for _ in selected_agent_names)
            rows = conn.execute(
                f"SELECT * FROM agents WHERE name IN ({placeholders}) OR id IN ({placeholders})",
                [*selected_agent_names, *selected_agent_names],
            ).fetchall()
            if rows:
                return [
                    self.apply_capacity_snapshot(self.row_to_agent(row), locked_by_agent)
                    for row in rows
                ]

        rows = conn.execute(
            """
            SELECT * FROM agents
            WHERE category = ?
            ORDER BY reputation DESC, success_rate DESC, price ASC
            """,
            (category,),
        ).fetchall()
        if not rows:
            rows = conn.execute(
                "SELECT * FROM agents ORDER BY reputation DESC, success_rate DESC, price ASC"
            ).fetchall()

        matched = []
        total_limit = 0.0
        for row in rows:
            agent = self.apply_capacity_snapshot(self.row_to_agent(row), locked_by_agent)
            if (agent.get("ownershipStatus") or {}).get("status") != "verified":
                continue
            if float(agent.get("availableEscrowLimit") or 0) <= 0:
                continue
            matched.append(agent)
            total_limit += float(agent.get("availableEscrowLimit", 0))
            if total_limit >= budget or len(matched) >= 3:
                break
        return matched

    def insert_task(self, conn: sqlite3.Connection, task: dict, selected_agents: list[dict]) -> None:
        timestamp = task.get("createdAt") or now_ms()
        conn.execute(
            """
            INSERT INTO tasks (
                id, description, acceptance_criteria, challenge_window_hours, category,
                budget, verification, status, deliverable, deliverable_evidence_json,
                escrow_json, settlement_json, dispute_json, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                task["id"],
                task["description"],
                task["acceptanceCriteria"],
                task["challengeWindowHours"],
                task["category"],
                task["budget"],
                task["verification"],
                task["status"],
                task.get("deliverable"),
                dumps(task.get("deliverableEvidence", [])),
                dumps(task["escrow"]),
                dumps(task.get("settlement")) if task.get("settlement") else None,
                dumps(task.get("dispute")) if task.get("dispute") else None,
                timestamp,
                timestamp,
            ),
        )

        split_by_agent = {
            split["agentId"]: split["amount"] for split in task["escrow"].get("splits", [])
        }
        for agent in selected_agents:
            conn.execute(
                """
                INSERT INTO task_agents (task_id, agent_id, snapshot_json, share_amount)
                VALUES (?, ?, ?, ?)
                """,
                (task["id"], agent["id"], dumps(agent), split_by_agent.get(agent["id"], 0)),
            )

    def append_history(
        self,
        conn: sqlite3.Connection,
        task_id: str,
        status: str,
        actor: str,
        note: str,
        signature: dict | None = None,
    ) -> None:
        conn.execute(
            """
            INSERT INTO task_history (task_id, status, actor, note, signature_json, at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (task_id, status, actor, note, dumps(signature) if signature else None, now_ms()),
        )

    def append_escrow_event(
        self,
        conn: sqlite3.Connection,
        task_id: str,
        event_type: str,
        actor: str,
        amount: float,
        counterparty: str,
        note: str,
        at: int | None = None,
    ) -> None:
        amount = round(float(amount or 0), 2)
        if amount <= 0:
            return
        event_at = at or now_ms()
        tx_id = make_tx_id(f"{task_id}-{event_type}-{actor}-{amount}-{counterparty}-{event_at}")
        conn.execute(
            """
            INSERT INTO escrow_events (
                task_id, event_type, actor, amount, currency, counterparty, tx_id, note, at
            )
            VALUES (?, ?, ?, ?, 'USDC', ?, ?, ?, ?)
            """,
            (task_id, event_type, actor, amount, counterparty, tx_id, note, event_at),
        )

    def append_settlement_escrow_events(
        self,
        conn: sqlite3.Connection,
        task_id: str,
        escrow: dict,
        reason: str,
    ) -> None:
        self.append_escrow_event(
            conn,
            task_id,
            "protocol_fee",
            "platform",
            float(escrow.get("protocolFee") or 0),
            "Qianzhi Protocol",
            f"平台协议费入账 · {reason}",
        )
        for split in escrow.get("splits", []):
            counterparty = split.get("owner") or split.get("agentName") or split.get("agentId") or "Agent Creator"
            self.append_escrow_event(
                conn,
                task_id,
                "creator_payout",
                "platform",
                float(split.get("amount") or 0),
                counterparty,
                f"创作者分账释放 · {reason}",
            )

    def append_refund_escrow_event(self, conn: sqlite3.Connection, row: sqlite3.Row, reason: str) -> None:
        self.append_escrow_event(
            conn,
            row["id"],
            "user_refund",
            "platform",
            float(row["budget"] or 0),
            "Task Creator",
            f"托管预算退回用户 · {reason}",
        )

    def ensure_escrow_events(self, conn: sqlite3.Connection) -> None:
        rows = conn.execute("SELECT * FROM tasks ORDER BY created_at").fetchall()
        for row in rows:
            existing = conn.execute(
                "SELECT COUNT(*) FROM escrow_events WHERE task_id = ?",
                (row["id"],),
            ).fetchone()[0]
            if existing:
                continue

            if row["status"] in {"FUNDED", "IN_PROGRESS", "SUBMITTED", "DISPUTED", "SETTLED", "REFUNDED"}:
                self.append_escrow_event(
                    conn,
                    row["id"],
                    "escrow_deposit",
                    "user",
                    float(row["budget"] or 0),
                    "Escrow Vault",
                    "用户确认方案，预算进入托管金库",
                    row["created_at"] + 1000,
                )

            escrow = loads(row["escrow_json"], {})
            settlement = loads(row["settlement_json"], None)
            if row["status"] == "SETTLED" and settlement:
                self.append_settlement_escrow_events(conn, row["id"], settlement.get("escrow") or escrow, "历史结算补录")
            elif row["status"] == "REFUNDED" and settlement:
                self.append_refund_escrow_event(conn, row, "历史退款补录")

    def apply_agent_outcome(self, conn: sqlite3.Connection, task_id: str, success: bool) -> list[dict]:
        rows = conn.execute(
            """
            SELECT a.*, ta.share_amount
            FROM task_agents ta
            JOIN agents a ON a.id = ta.agent_id
            WHERE ta.task_id = ?
            """,
            (task_id,),
        ).fetchall()

        events = []
        for row in rows:
            previous_tasks = int(row["tasks"])
            previous_reputation = int(row["reputation"])
            previous_success_rate = int(row["success_rate"])
            previous_stake = float(row["stake"])

            next_tasks = previous_tasks + 1
            outcome_score = 100 if success else 0
            next_success_rate = round(
                ((previous_success_rate * previous_tasks) + outcome_score) / next_tasks
            )
            next_reputation = min(100, previous_reputation + 1) if success else max(0, previous_reputation - 6)
            slash_amount = 0.0 if success else round(min(previous_stake * 0.02, float(row["share_amount"])), 2)
            next_stake = round(max(0.0, previous_stake - slash_amount), 2)

            conn.execute(
                """
                UPDATE agents
                SET tasks = ?, success_rate = ?, reputation = ?, stake = ?
                WHERE id = ?
                """,
                (next_tasks, next_success_rate, next_reputation, next_stake, row["id"]),
            )

            events.append(
                {
                    "agentId": row["id"],
                    "agentName": row["name"],
                    "owner": row["owner"],
                    "outcome": "success" if success else "refund",
                    "reputationBefore": previous_reputation,
                    "reputationAfter": next_reputation,
                    "successRateBefore": previous_success_rate,
                    "successRateAfter": next_success_rate,
                    "tasksBefore": previous_tasks,
                    "tasksAfter": next_tasks,
                    "stakeSlash": slash_amount,
                    "stakeAfter": next_stake,
                }
            )

        return events

    def create_task(self, body: dict) -> dict:
        description = str(body.get("description", "")).strip()
        acceptance_criteria = str(body.get("acceptanceCriteria", "")).strip()
        category = str(body.get("category", "")).strip() or "ops"
        verification = str(body.get("verification", "")).strip() or "Optimistic"
        selected_agent_names = body.get("selectedAgentNames") or body.get("selectedAgentIds") or []

        if not isinstance(selected_agent_names, list):
            raise ApiError(400, "selectedAgentNames must be a list")

        try:
            budget = float(body.get("budget", 0))
        except (TypeError, ValueError):
            raise ApiError(400, "budget must be a number")

        try:
            challenge_window_hours = int(body.get("challengeWindowHours", 24))
        except (TypeError, ValueError):
            raise ApiError(400, "challengeWindowHours must be an integer")

        if len(description) < 8:
            raise ApiError(400, "description is too short")
        if len(acceptance_criteria) < 8:
            raise ApiError(400, "acceptanceCriteria is too short")
        if budget < 10:
            raise ApiError(400, "budget must be at least 10 USDC")
        if challenge_window_hours < 1 or challenge_window_hours > 168:
            raise ApiError(400, "challengeWindowHours must be between 1 and 168")

        with self.connect() as conn:
            selected_agents = self.match_agents(conn, category, selected_agent_names, budget)
            validate_agent_ownership_gate(selected_agents)
            validate_agent_capacity(budget, selected_agents)
            task_id = self.next_task_id(conn)
            task = {
                "id": task_id,
                "description": description,
                "acceptanceCriteria": acceptance_criteria,
                "challengeWindowHours": challenge_window_hours,
                "category": category,
                "budget": budget,
                "verification": verification,
                "status": "MATCHED",
                "deliverable": None,
                "deliverableEvidence": [],
                "escrow": calculate_escrow(budget, selected_agents),
                "settlement": None,
                "dispute": None,
                "createdAt": now_ms(),
            }
            self.insert_task(conn, task, selected_agents)
            self.append_history(
                conn,
                task_id,
                "MATCHED",
                "platform",
                f"平台生成 Agent 执行方案，并锁定 {challenge_window_hours} 小时挑战窗口",
            )
            row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            return self.row_to_task(conn, row)

    def transition_task(self, task_id: str, body: dict, action: str | None = None) -> dict:
        action = action or str(body.get("action", "")).strip()
        actor = str(body.get("actor", "")).strip()
        expected_actor = ACTION_ACTORS.get(action)
        if expected_actor:
            require_actor(actor, expected_actor)

        with self.connect() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            if not row:
                raise ApiError(404, "task not found")

            signature = validate_action_signature(body, action, actor, task_id)
            signature_note = f" · 签名 {signature['signatureId']}" if signature else ""
            status = row["status"]
            contract_fingerprint = self.contract_fingerprint_for_row(conn, row)
            updates: dict[str, object] = {"updated_at": now_ms()}
            history: list[tuple[str, str, str]] = []

            if action == "fund":
                require_status(status, "MATCHED")
                funding_confirmation = body.get("fundingConfirmation")
                funding_note = "用户确认方案并托管预算"
                if isinstance(funding_confirmation, dict):
                    summary = str(funding_confirmation.get("summary") or "").strip()
                    if summary:
                        funding_note = summary
                updates["status"] = "FUNDED"
                history.append(("FUNDED", "user", f"{funding_note}{signature_note}"))
                self.append_escrow_event(
                    conn,
                    task_id,
                    "escrow_deposit",
                    "user",
                    float(row["budget"] or 0),
                    "Escrow Vault",
                    "用户确认清单后，预算进入托管金库",
                )
            elif action == "start":
                require_status(status, "FUNDED")
                execution_commitment = body.get("executionCommitment")
                commitment_note = "Agent 接单并开始执行"
                if isinstance(execution_commitment, dict):
                    summary = str(execution_commitment.get("summary") or "").strip()
                    if summary:
                        commitment_note = summary
                updates["status"] = "IN_PROGRESS"
                history.append(("IN_PROGRESS", "agent", f"{commitment_note}{signature_note}"))
            elif action == "submit":
                require_status(status, "IN_PROGRESS")
                deliverable = str(body.get("deliverable", "")).strip()
                if len(deliverable) < 6:
                    raise ApiError(400, "deliverable is too short")
                evidence = normalize_evidence(
                    body.get("deliverableEvidence") or body.get("evidence") or []
                )
                if not evidence:
                    raise ApiError(400, "deliverableEvidence is required")
                updates["status"] = "SUBMITTED"
                updates["deliverable"] = deliverable
                updates["deliverable_evidence_json"] = dumps(evidence)
                history.append(("SUBMITTED", "agent", f"Agent 提交交付物{signature_note}"))
            elif action == "accept":
                require_status(status, "SUBMITTED")
                acceptance_confirmation = body.get("acceptanceConfirmation")
                acceptance_note = "用户验收通过"
                if isinstance(acceptance_confirmation, dict):
                    summary = str(acceptance_confirmation.get("summary") or "").strip()
                    if summary:
                        acceptance_note = summary
                reputation_events = self.apply_agent_outcome(conn, task_id, success=True)
                escrow = loads(row["escrow_json"], {})
                updates["status"] = "SETTLED"
                updates["settlement_json"] = dumps(
                    build_settlement_payload(
                        "accepted",
                        escrow,
                        reputation_events,
                        None,
                        acceptance_confirmation if isinstance(acceptance_confirmation, dict) else None,
                        contract_fingerprint,
                    )
                )
                self.append_settlement_escrow_events(conn, task_id, escrow, "用户验收通过")
                history.append(("ACCEPTED", "user", f"{acceptance_note}{signature_note}"))
                history.append(("SETTLED", "platform", "托管资金完成自动分账"))
                history.append(("SETTLED", "platform", "Agent 成交、声誉和成功率已更新"))
            elif action == "auto-settle":
                require_status(status, "SUBMITTED")
                deadline = challenge_deadline(conn, row)
                if deadline is None:
                    raise ApiError(409, "submitted timestamp is missing")
                if now_ms() < deadline:
                    raise ApiError(409, "challenge window is still open")
                reputation_events = self.apply_agent_outcome(conn, task_id, success=True)
                escrow = loads(row["escrow_json"], {})
                updates["status"] = "SETTLED"
                updates["settlement_json"] = dumps(
                    build_settlement_payload(
                        "challenge_window_expired",
                        escrow,
                        reputation_events,
                        contract_fingerprint=contract_fingerprint,
                    )
                )
                self.append_settlement_escrow_events(conn, task_id, escrow, "挑战窗口结束")
                history.append(("SETTLED", "platform", f"挑战窗口结束，平台自动结算{signature_note}"))
                history.append(("SETTLED", "platform", "Agent 成交、声誉和成功率已更新"))
            elif action == "dispute":
                require_status(status, "SUBMITTED")
                reason = str(body.get("reason", "")).strip()
                if len(reason) < 6:
                    raise ApiError(400, "dispute reason is too short")
                evidence = normalize_evidence(body.get("evidence") or [])
                if not evidence:
                    raise ApiError(400, "dispute evidence is required")
                updates["status"] = "DISPUTED"
                updates["dispute_json"] = dumps(
                    {"reason": reason, "openedAt": now_ms(), "evidence": evidence}
                )
                history.append(("DISPUTED", "user", f"{reason}{signature_note}"))
            elif action == "resolve":
                require_status(status, "DISPUTED")
                winner = str(body.get("winner", "")).strip()
                if winner not in {"agent", "user"}:
                    raise ApiError(400, "winner must be agent or user")
                decision = build_arbitration_decision(task_id, winner, body)
                if winner == "agent":
                    reputation_events = self.apply_agent_outcome(conn, task_id, success=True)
                    escrow = loads(row["escrow_json"], {})
                    updates["status"] = "SETTLED"
                    updates["settlement_json"] = dumps(
                        build_settlement_payload(
                            "agent_won_dispute",
                            escrow,
                            reputation_events,
                            decision,
                            contract_fingerprint=contract_fingerprint,
                        )
                    )
                    self.append_settlement_escrow_events(conn, task_id, escrow, "仲裁支持 Agent")
                    history.append(("SETTLED", "arbitrator", f"仲裁支持 Agent：{decision['reason']}{signature_note}"))
                    history.append(("SETTLED", "platform", "Agent 成交、声誉和成功率已更新"))
                else:
                    reputation_events = self.apply_agent_outcome(conn, task_id, success=False)
                    updates["status"] = "REFUNDED"
                    updates["settlement_json"] = dumps(
                        build_refund_payload(row, reputation_events, decision, contract_fingerprint)
                    )
                    self.append_refund_escrow_event(conn, row, "仲裁支持用户")
                    history.append(("REFUNDED", "arbitrator", f"仲裁支持用户：{decision['reason']}{signature_note}"))
                    history.append(("REFUNDED", "platform", "Agent 声誉、成功率和质押风险已更新"))
            elif action == "cancel":
                if status not in {"MATCHED", "DRAFT"}:
                    raise ApiError(409, "funded task cannot be cancelled directly")
                updates["status"] = "CANCELLED"
                history.append(("CANCELLED", "user", f"用户在托管前取消任务{signature_note}"))
            else:
                raise ApiError(400, "unknown task action")

            set_clause = ", ".join(f"{key} = ?" for key in updates)
            conn.execute(
                f"UPDATE tasks SET {set_clause} WHERE id = ?",
                [*updates.values(), task_id],
            )
            for next_status, actor, note in history:
                history_signature = signature if signature_note and signature_note in note else None
                self.append_history(conn, task_id, next_status, actor, note, history_signature)

            updated_row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            return self.row_to_task(conn, updated_row)


def require_status(current: str, expected: str) -> None:
    if current != expected:
        raise ApiError(409, f"task status must be {expected}, current is {current}")


def require_actor(actor: str, expected: str) -> None:
    if actor != expected:
        raise ApiError(403, f"action requires {expected} actor")


def attach_wallet_signature_fields(normalized: dict, signature: dict) -> dict:
    wallet_address = str(signature.get("walletAddress", "")).strip()
    wallet_signature = str(signature.get("walletSignature", "")).strip()
    message = str(signature.get("message", "")).strip()
    if wallet_address:
        normalized["walletAddress"] = wallet_address
    if wallet_signature:
        normalized["walletSignature"] = wallet_signature
    if message:
        normalized["message"] = message
    return normalized


def validate_action_signature(body: dict, action: str, actor: str, task_id: str) -> dict | None:
    if action not in SIGNED_ACTIONS:
        return None

    signature = body.get("signature")
    if not isinstance(signature, dict):
        raise ApiError(401, "action signature is required")

    signature_id = str(signature.get("signatureId", "")).strip().upper()
    signer = str(signature.get("signer", "")).strip()
    issued_at = signature.get("issuedAt")

    if str(signature.get("actor", "")).strip() != actor:
        raise ApiError(401, "signature actor does not match request actor")
    if str(signature.get("action", "")).strip() != action:
        raise ApiError(401, "signature action does not match request action")
    if str(signature.get("taskId", "")).strip() != task_id:
        raise ApiError(401, "signature taskId does not match request task")
    if not signer:
        raise ApiError(401, "signature signer is required")
    if not SIGNATURE_ID_PATTERN.match(signature_id):
        raise ApiError(401, "signatureId is invalid")
    if not isinstance(issued_at, (int, float)) or issued_at <= 0:
        raise ApiError(401, "signature issuedAt is invalid")

    return attach_wallet_signature_fields({
        "signatureId": signature_id,
        "signer": signer,
        "actor": actor,
        "action": action,
        "taskId": task_id,
        "issuedAt": int(issued_at),
    }, signature)


def validate_withdrawal_signature(
    body: dict,
    action: str,
    actor: str,
    owner: str,
    amount: float,
    withdrawal_id: str | None = None,
) -> dict:
    signature = body.get("signature")
    if not isinstance(signature, dict):
        raise ApiError(401, "withdrawal signature is required")

    signature_id = str(signature.get("signatureId", "")).strip().upper()
    signer = str(signature.get("signer", "")).strip()
    issued_at = signature.get("issuedAt")
    signature_amount = signature.get("amount")

    if str(signature.get("actor", "")).strip() != actor:
        raise ApiError(401, "signature actor does not match request actor")
    if str(signature.get("action", "")).strip() != action:
        raise ApiError(401, "signature action does not match withdrawal action")
    if str(signature.get("owner", "")).strip() != owner:
        raise ApiError(401, "signature owner does not match withdrawal owner")
    if withdrawal_id and str(signature.get("withdrawalId", "")).strip() != withdrawal_id:
        raise ApiError(401, "signature withdrawalId does not match request")
    if not signer:
        raise ApiError(401, "signature signer is required")
    if not SIGNATURE_ID_PATTERN.match(signature_id):
        raise ApiError(401, "signatureId is invalid")
    if not isinstance(issued_at, (int, float)) or issued_at <= 0:
        raise ApiError(401, "signature issuedAt is invalid")
    if not isinstance(signature_amount, (int, float)) or round(float(signature_amount), 2) != round(amount, 2):
        raise ApiError(401, "signature amount does not match withdrawal amount")

    normalized = {
        "signatureId": signature_id,
        "signer": signer,
        "actor": actor,
        "action": action,
        "owner": owner,
        "amount": round(amount, 2),
        "issuedAt": int(issued_at),
    }
    if withdrawal_id:
        normalized["withdrawalId"] = withdrawal_id
    return attach_wallet_signature_fields(normalized, signature)


def validate_ownership_review_signature(
    body: dict,
    action: str,
    actor: str,
    agent_id: str,
    owner: str,
) -> dict:
    signature = body.get("signature")
    if not isinstance(signature, dict):
        raise ApiError(401, "ownership review signature is required")

    signature_id = str(signature.get("signatureId", "")).strip().upper()
    signer = str(signature.get("signer", "")).strip()
    issued_at = signature.get("issuedAt")

    if str(signature.get("actor", "")).strip() != actor:
        raise ApiError(401, "signature actor does not match request actor")
    if str(signature.get("action", "")).strip() != action:
        raise ApiError(401, "signature action does not match ownership review action")
    if str(signature.get("agentId", "")).strip() != agent_id:
        raise ApiError(401, "signature agentId does not match request")
    if str(signature.get("owner", "")).strip() != owner:
        raise ApiError(401, "signature owner does not match agent owner")
    if not signer:
        raise ApiError(401, "signature signer is required")
    if not SIGNATURE_ID_PATTERN.match(signature_id):
        raise ApiError(401, "signatureId is invalid")
    if not isinstance(issued_at, (int, float)) or issued_at <= 0:
        raise ApiError(401, "signature issuedAt is invalid")

    return attach_wallet_signature_fields({
        "signatureId": signature_id,
        "signer": signer,
        "actor": actor,
        "action": action,
        "agentId": agent_id,
        "owner": owner,
        "issuedAt": int(issued_at),
    }, signature)


class QianzhiHandler(BaseHTTPRequestHandler):
    server_version = "QianzhiMock/0.2"

    @property
    def store(self) -> Store:
        return self.server.store  # type: ignore[attr-defined]

    def log_message(self, format: str, *args) -> None:
        return

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.end_headers()

    def do_GET(self) -> None:
        try:
            parsed = urlparse(self.path)
            if parsed.path == "/api/health":
                self.write_json(
                    {
                        "ok": True,
                        "service": "qianzhi-mock-api",
                        "storage": "sqlite",
                        "db": str(self.store.db_path),
                    }
                )
            elif parsed.path == "/api/readiness":
                self.write_json(build_readiness_payload())
            elif parsed.path == "/api/agents":
                query = parse_qs(parsed.query)
                category = query.get("category", ["all"])[0]
                keyword = query.get("q", [""])[0]
                self.write_json({"agents": self.store.list_agents(category, keyword)})
            elif parsed.path == "/api/creators":
                self.write_json(self.store.list_creator_accounts())
            elif parsed.path == "/api/withdrawals":
                self.write_json({"withdrawals": self.store.list_withdrawals()})
            elif parsed.path == "/api/tasks":
                self.write_json({"tasks": self.store.list_tasks()})
            elif parsed.path.startswith("/api/tasks/"):
                task_id = parsed.path.rsplit("/", 1)[-1]
                self.write_json({"task": self.store.get_task(task_id)})
            else:
                self.serve_static(parsed.path)
        except ApiError as error:
            self.write_json({"error": error.message}, error.status)
        except Exception as error:
            self.write_json({"error": f"internal error: {error}"}, 500)

    def do_POST(self) -> None:
        try:
            parsed = urlparse(self.path)
            body = self.read_json()

            if parsed.path == "/api/tasks":
                self.write_json({"task": self.store.create_task(body)}, 201)
                return

            if parsed.path == "/api/agents":
                self.write_json({"agent": self.store.create_agent(body)}, 201)
                return

            if parsed.path == "/api/evidence":
                self.write_json({"evidence": self.store.create_evidence_record(body)}, 201)
                return

            if parsed.path == "/api/withdrawals":
                self.write_json({"withdrawal": self.store.create_withdrawal(body)}, 201)
                return

            parts = [part for part in parsed.path.split("/") if part]
            if (
                len(parts) == 5
                and parts[0] == "api"
                and parts[1] == "agents"
                and parts[3] == "ownership"
            ):
                agent_id, action = parts[2], parts[4]
                self.write_json({"agent": self.store.review_agent_ownership(agent_id, action, body)})
                return

            if len(parts) == 4 and parts[0] == "api" and parts[1] == "withdrawals":
                withdrawal_id, action = parts[2], parts[3]
                self.write_json({"withdrawal": self.store.review_withdrawal(withdrawal_id, action, body)})
                return

            if len(parts) == 3 and parts[0] == "api" and parts[1] == "tasks":
                self.write_json({"task": self.store.transition_task(parts[2], body)})
                return

            if len(parts) == 4 and parts[0] == "api" and parts[1] == "tasks":
                task_id, action = parts[2], parts[3]
                self.write_json({"task": self.store.transition_task(task_id, body, action)})
                return

            raise ApiError(404, "unknown endpoint")
        except ApiError as error:
            self.write_json({"error": error.message}, error.status)
        except Exception as error:
            self.write_json({"error": f"internal error: {error}"}, 500)

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        if not length:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            raise ApiError(400, "request body must be valid JSON")

    def write_json(self, payload: dict, status: int = 200) -> None:
        data = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def serve_static(self, path: str) -> None:
        relative = unquote(path).lstrip("/") or "index.html"
        target = (ROOT / relative).resolve()
        if ROOT not in target.parents and target != ROOT:
            raise ApiError(403, "forbidden")
        if target.is_dir():
            target = target / "index.html"
        if not target.exists():
            raise ApiError(404, "file not found")

        data = target.read_bytes()
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        if target.suffix in {".html", ".css", ".js", ".md"}:
            content_type += "; charset=utf-8"

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main() -> None:
    parser = argparse.ArgumentParser(description="Qianzhi local mock API")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--db", default=str(DEFAULT_DB_PATH), help="SQLite database path")
    args = parser.parse_args()

    store = Store(Path(args.db).resolve())
    store.init()

    server = ThreadingHTTPServer((args.host, args.port), QianzhiHandler)
    server.store = store  # type: ignore[attr-defined]
    print(f"Qianzhi mock API running at http://{args.host}:{args.port}")
    print(f"SQLite database: {store.db_path}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
