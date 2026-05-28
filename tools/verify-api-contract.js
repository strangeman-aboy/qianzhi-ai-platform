#!/usr/bin/env node

const REQUIRED_AGENT_FIELDS = [
    "id",
    "name",
    "owner",
    "ownershipStatus",
    "category",
    "price",
    "stake",
    "reputation",
    "successRate",
    "tasks",
    "escrowLimit",
    "verification",
    "summary",
    "serviceBoundary",
    "tags"
];

const REQUIRED_TASK_FIELDS = [
    "id",
    "description",
    "acceptanceCriteria",
    "challengeWindowHours",
    "category",
    "budget",
    "verification",
    "status",
    "selectedAgents",
    "escrow",
    "history",
    "contractFingerprint"
];

const READINESS_STATES = new Set(["ready", "mock", "todo"]);
const TIMEOUT_MS = Number(process.env.QIANZHI_API_TIMEOUT_MS || 8000);

const results = [];

function normalizeBaseUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
}

function buildUrl(baseUrl, apiPath) {
    if (baseUrl.endsWith("/api") && apiPath.startsWith("/api/")) {
        return `${baseUrl}${apiPath.slice(4)}`;
    }

    return `${baseUrl}${apiPath}`;
}

function getHeaders() {
    const headers = {
        "Accept": "application/json"
    };

    if (process.env.QIANZHI_API_TOKEN) {
        headers.Authorization = `Bearer ${process.env.QIANZHI_API_TOKEN}`;
    }

    return headers;
}

async function requestJson(baseUrl, apiPath, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const headers = {
        ...getHeaders(),
        ...(options.body ? { "Content-Type": "application/json" } : {})
    };

    try {
        const response = await fetch(buildUrl(baseUrl, apiPath), {
            method: options.method || "GET",
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: controller.signal
        });
        const text = await response.text();
        let data = null;

        if (text) {
            try {
                data = JSON.parse(text);
            } catch (error) {
                return {
                    ok: false,
                    status: response.status,
                    error: `响应不是 JSON：${text.slice(0, 120)}`
                };
            }
        }

        return {
            ok: response.ok,
            status: response.status,
            data,
            error: response.ok ? null : data?.error || response.statusText
        };
    } catch (error) {
        const message = error.name === "AbortError"
            ? `请求超过 ${TIMEOUT_MS}ms`
            : error.message;

        return {
            ok: false,
            status: 0,
            error: message
        };
    } finally {
        clearTimeout(timer);
    }
}

function addResult(level, name, message) {
    results.push({ level, name, message });
}

function missingFields(value, fields) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return fields;
    }

    return fields.filter((field) => !(field in value));
}

function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function summarizeObjectId(value) {
    if (!isObject(value)) {
        return "无样本";
    }

    return value.id || value.name || "未命名样本";
}

async function checkHealth(baseUrl) {
    const response = await requestJson(baseUrl, "/api/health");

    if (!response.ok) {
        addResult("fail", "GET /api/health", `健康检查失败：${response.error || response.status}`);
        return null;
    }

    if (!isObject(response.data) || response.data.ok !== true) {
        addResult("fail", "GET /api/health", "响应必须包含 ok: true");
        return response.data;
    }

    addResult("pass", "GET /api/health", `已连接 ${response.data.service || "API 服务"}`);
    return response.data;
}

async function checkReadiness(baseUrl) {
    const response = await requestJson(baseUrl, "/api/readiness");

    if (!response.ok) {
        addResult("warn", "GET /api/readiness", `推荐接口暂不可用：${response.error || response.status}`);
        return null;
    }

    if (!Array.isArray(response.data?.capabilities)) {
        addResult("warn", "GET /api/readiness", "响应建议包含 capabilities 数组，方便前端展示接入就绪状态");
        return response.data;
    }

    const invalidStates = response.data.capabilities
        .map((item) => item?.state)
        .filter((state) => !READINESS_STATES.has(state));

    if (invalidStates.length > 0) {
        addResult("warn", "GET /api/readiness", `存在未知状态：${[...new Set(invalidStates)].join(", ")}`);
        return response.data;
    }

    addResult("pass", "GET /api/readiness", `能力状态 ${response.data.capabilities.length} 项`);
    return response.data;
}

async function checkAgents(baseUrl) {
    const response = await requestJson(baseUrl, "/api/agents");

    if (!response.ok) {
        addResult("fail", "GET /api/agents", `Agent 列表失败：${response.error || response.status}`);
        return [];
    }

    if (!Array.isArray(response.data?.agents)) {
        addResult("fail", "GET /api/agents", "响应必须包含 agents 数组");
        return [];
    }

    const agents = response.data.agents;

    if (agents.length === 0) {
        addResult("warn", "GET /api/agents", "当前没有 Agent 样本，无法检查字段完整性");
        return agents;
    }

    const sample = agents[0];
    const missing = missingFields(sample, REQUIRED_AGENT_FIELDS);

    if (missing.length > 0) {
        addResult("fail", "GET /api/agents", `Agent 样本 ${summarizeObjectId(sample)} 缺少字段：${missing.join(", ")}`);
        return agents;
    }

    if (!Array.isArray(sample.tags)) {
        addResult("fail", "GET /api/agents", "Agent tags 必须是数组");
        return agents;
    }

    if (!isObject(sample.ownershipStatus)) {
        addResult("fail", "GET /api/agents", "Agent ownershipStatus 必须是对象");
        return agents;
    }

    addResult("pass", "GET /api/agents", `Agent 列表 ${agents.length} 条，样本字段完整`);
    return agents;
}

function buildAgentDeclarationProbe(overrides = {}) {
    const stamp = Date.now();

    return {
        name: `合约检查声明 Agent ${stamp}`,
        owner: "Contract Checker",
        ownershipProof: `DID:contract-check-${stamp}`,
        category: "legal",
        verification: "TEE",
        price: 45,
        stake: 1200,
        escrowLimit: 400,
        summary: "用于验证创作者声明缺失或不完整时后端必须拒绝入驻。",
        serviceBoundary: "只用于合约检查，不承接真实任务或真实用户材料。",
        tags: ["contract-check"],
        ...overrides
    };
}

async function checkAgentDeclarationRejected(baseUrl, kind, body) {
    const resultName = `POST /api/agents ${kind}`;
    const response = await requestJson(baseUrl, "/api/agents", {
        method: "POST",
        body
    });

    if ([401, 403].includes(response.status)) {
        addResult("warn", resultName, "接口需要登录或创作者身份，无法验证创作者声明拒绝逻辑");
        return;
    }

    if (response.status !== 400) {
        addResult(
            "fail",
            resultName,
            `${kind}的 Agent 入驻请求应返回 400，实际返回 ${response.status || response.error}`
        );
        return;
    }

    addResult("pass", resultName, `${kind}的 Agent 入驻请求被 400 拒绝`);
}

async function checkAgentCreatorDeclarationRejected(baseUrl) {
    await checkAgentDeclarationRejected(
        baseUrl,
        "missing creatorDeclaration",
        buildAgentDeclarationProbe()
    );
    await checkAgentDeclarationRejected(
        baseUrl,
        "incomplete creatorDeclaration",
        buildAgentDeclarationProbe({
            creatorDeclaration: {
                ownsAgent: true,
                nonCustody: false,
                outcomePayout: true
            }
        })
    );
}

async function checkTasks(baseUrl) {
    const response = await requestJson(baseUrl, "/api/tasks");

    if (!response.ok) {
        addResult("fail", "GET /api/tasks", `任务列表失败：${response.error || response.status}`);
        return [];
    }

    if (!Array.isArray(response.data?.tasks)) {
        addResult("fail", "GET /api/tasks", "响应必须包含 tasks 数组");
        return [];
    }

    const tasks = response.data.tasks;

    if (tasks.length === 0) {
        addResult("warn", "GET /api/tasks", "当前没有任务样本，无法检查交易字段完整性");
        return tasks;
    }

    const sample = tasks[0];
    const missing = missingFields(sample, REQUIRED_TASK_FIELDS);

    if (missing.length > 0) {
        addResult("fail", "GET /api/tasks", `任务样本 ${summarizeObjectId(sample)} 缺少字段：${missing.join(", ")}`);
        return tasks;
    }

    if (!String(sample.contractFingerprint).startsWith("CTR-")) {
        addResult("fail", "GET /api/tasks", "任务 contractFingerprint 应使用 CTR- 前缀");
        return tasks;
    }

    if (!Array.isArray(sample.selectedAgents) || !isObject(sample.escrow) || !Array.isArray(sample.history)) {
        addResult("fail", "GET /api/tasks", "任务 selectedAgents/history 必须是数组，escrow 必须是对象");
        return tasks;
    }

    addResult("pass", "GET /api/tasks", `任务列表 ${tasks.length} 条，样本交易字段完整`);
    return tasks;
}

async function checkTaskDetail(baseUrl, tasks) {
    const sample = tasks.find((task) => task?.id);

    if (!sample) {
        addResult("warn", "GET /api/tasks/{id}", "没有任务样本，跳过详情接口检查");
        return null;
    }

    const response = await requestJson(baseUrl, `/api/tasks/${encodeURIComponent(sample.id)}`);

    if (!response.ok) {
        addResult("fail", "GET /api/tasks/{id}", `任务详情失败：${response.error || response.status}`);
        return null;
    }

    const task = response.data?.task;

    if (!isObject(task) || task.id !== sample.id) {
        addResult("fail", "GET /api/tasks/{id}", `详情响应必须返回同一个任务 ${sample.id}`);
        return task;
    }

    if (task.contractFingerprint !== sample.contractFingerprint) {
        addResult("fail", "GET /api/tasks/{id}", "详情页契约指纹必须和列表保持一致");
        return task;
    }

    addResult("pass", "GET /api/tasks/{id}", `任务详情 ${sample.id} 可读取且契约一致`);
    return task;
}

async function checkEvidenceVault(baseUrl, tasks) {
    const sample = tasks.find((task) => task?.id);

    if (!sample) {
        addResult("warn", "POST /api/evidence", "没有任务样本，跳过文件哈希存证检查");
        return null;
    }

    const sha256 = "a".repeat(64);
    const response = await requestJson(baseUrl, "/api/evidence", {
        method: "POST",
        body: {
            taskId: sample.id,
            type: "file",
            label: "合约检查文件哈希",
            fileName: "contract-check.txt",
            mimeType: "text/plain",
            sizeBytes: 32,
            sha256,
            actor: "agent"
        }
    });

    if (!response.ok) {
        addResult("warn", "POST /api/evidence", `推荐接口暂不可用：${response.error || response.status}`);
        return null;
    }

    const evidence = response.data?.evidence;
    if (!isObject(evidence) || evidence.taskId !== sample.id || evidence.hash !== `sha256-${sha256}` || !String(evidence.uri || "").startsWith("qz://evidence/")) {
        addResult("fail", "POST /api/evidence", "文件哈希存证响应必须返回 taskId、sha256 哈希和 qz://evidence 引用");
        return evidence;
    }

    addResult("pass", "POST /api/evidence", `文件哈希存证已登记到 ${evidence.uri}`);
    return evidence;
}

async function checkInvalidEvidenceRejected(baseUrl, tasks) {
    const sample = tasks.find((task) => task?.id);

    if (!sample) {
        addResult("warn", "POST /api/evidence invalid hash", "没有任务样本，跳过无效文件哈希检查");
        return null;
    }

    const response = await requestJson(baseUrl, "/api/evidence", {
        method: "POST",
        body: {
            taskId: sample.id,
            type: "file",
            label: "无效哈希样本",
            fileName: "invalid.txt",
            mimeType: "text/plain",
            sizeBytes: 12,
            sha256: "not-a-valid-sha256",
            actor: "agent"
        }
    });

    if (response.status !== 400) {
        addResult("fail", "POST /api/evidence invalid hash", `无效 sha256 应被 400 拒绝，当前返回 ${response.status || response.error}`);
        return response.data;
    }

    addResult("pass", "POST /api/evidence invalid hash", "无效 sha256 已被 400 拒绝");
    return response.data;
}

function buildUnsignedTransitionProbe(task) {
    const status = task?.status;
    const id = task?.id;

    if (!id) return null;

    const probes = {
        MATCHED: {
            action: "fund",
            actor: "user",
            body: {
                actor: "user",
                fundingConfirmation: {
                    summary: "合约检查：缺签名请求不应推进托管"
                }
            }
        },
        FUNDED: {
            action: "start",
            actor: "agent",
            body: {
                actor: "agent",
                executionCommitment: {
                    summary: "合约检查：缺签名请求不应开始执行"
                }
            }
        },
        IN_PROGRESS: {
            action: "submit",
            actor: "agent",
            body: {
                actor: "agent",
                deliverable: "合约检查用交付摘要，不应被接受",
                deliverableEvidence: [
                    {
                        type: "report",
                        label: "合约检查证据",
                        uri: "qz://contract-check/unsigned-submit",
                        hash: "sha256-contract-check"
                    }
                ]
            }
        },
        SUBMITTED: {
            action: "accept",
            actor: "user",
            body: {
                actor: "user",
                acceptanceConfirmation: {
                    summary: "合约检查：缺签名请求不应结算"
                }
            }
        },
        DISPUTED: {
            action: "resolve",
            actor: "arbitrator",
            body: {
                actor: "arbitrator",
                winner: "agent",
                resolution: {
                    reason: "合约检查：缺签名请求不应完成仲裁",
                    evidenceReview: "合约检查用证据说明，不应被接受"
                }
            }
        }
    };

    const probe = probes[status];
    return probe ? { taskId: id, ...probe } : null;
}

function getWrongActor(actor) {
    const actors = ["user", "agent", "arbitrator", "platform"];
    return actors.find((item) => item !== actor) || "user";
}

function buildWrongActorBody(probe) {
    const wrongActor = getWrongActor(probe.actor);

    return buildSignedProbeBody(probe, {
        actor: wrongActor,
        signatureId: "SIG-CHECKBAD1"
    });
}

function buildSignedProbeBody(probe, signatureOverrides = {}) {
    const actor = signatureOverrides.actor || probe.actor;

    return {
        ...probe.body,
        actor,
        signature: {
            signatureId: signatureOverrides.signatureId || "SIG-CHECKOK1",
            signer: "contract-checker",
            actor,
            action: signatureOverrides.action || probe.action,
            taskId: signatureOverrides.taskId || probe.taskId,
            issuedAt: Date.now()
        }
    };
}

function buildWrongActionBody(probe) {
    const wrongAction = probe.action === "resolve" ? "fund" : "resolve";
    return buildSignedProbeBody(probe, {
        action: wrongAction,
        signatureId: "SIG-CHECKBAD2"
    });
}

function buildWrongTaskBody(probe) {
    return buildSignedProbeBody(probe, {
        taskId: `${probe.taskId}-OTHER`,
        signatureId: "SIG-CHECKBAD3"
    });
}

function getSubmittedAt(task) {
    const submitted = [...(task?.history || [])].reverse().find((item) => item?.status === "SUBMITTED");
    return Number(submitted?.at || task?.submittedAt || 0);
}

function hasOpenChallengeWindow(task) {
    const submittedAt = getSubmittedAt(task);
    if (!submittedAt) return false;

    const hours = Number(task.challengeWindowHours || 24);
    return submittedAt + hours * 60 * 60 * 1000 > Date.now();
}

function buildMissingDisputeEvidenceProbe(tasks) {
    const task = tasks.find((item) => item?.id && item.status === "SUBMITTED");

    if (!task) return null;

    return {
        taskId: task.id,
        action: "dispute",
        actor: "user",
        body: {
            actor: "user",
            reason: "合约检查：缺少争议证据不应进入仲裁",
            evidence: []
        }
    };
}

function buildEarlyAutoSettleProbe(tasks) {
    const task = tasks.find((item) => item?.id && item.status === "SUBMITTED" && hasOpenChallengeWindow(item));

    if (!task) return null;

    return {
        taskId: task.id,
        action: "auto-settle",
        actor: "platform",
        body: {
            actor: "platform"
        }
    };
}

function buildMissingArbitrationReasonProbe(tasks) {
    const task = tasks.find((item) => item?.id && item.status === "DISPUTED");

    if (!task) return null;

    return {
        taskId: task.id,
        action: "resolve",
        actor: "arbitrator",
        body: {
            actor: "arbitrator",
            winner: "agent",
            resolution: {
                reason: "",
                evidenceReview: ""
            }
        }
    };
}

async function checkUnsignedTaskActionRejected(baseUrl, tasks) {
    const probe = tasks.map(buildUnsignedTransitionProbe).find(Boolean);

    if (!probe) {
        addResult("warn", "POST /api/tasks/{id}/{action} unsigned", "没有可用于缺签名负向测试的进行中任务样本");
        return;
    }

    const before = await requestJson(baseUrl, `/api/tasks/${encodeURIComponent(probe.taskId)}`);
    const beforeStatus = before.data?.task?.status;
    const response = await requestJson(
        baseUrl,
        `/api/tasks/${encodeURIComponent(probe.taskId)}/${probe.action}`,
        {
            method: "POST",
            body: probe.body
        }
    );
    const after = await requestJson(baseUrl, `/api/tasks/${encodeURIComponent(probe.taskId)}`);
    const afterStatus = after.data?.task?.status;

    if (response.status !== 401) {
        addResult(
            "fail",
            "POST /api/tasks/{id}/{action} unsigned",
            `缺少 signature 的 ${probe.action} 请求应返回 401，实际返回 ${response.status || response.error}`
        );
        return;
    }

    if (beforeStatus !== afterStatus) {
        addResult(
            "fail",
            "POST /api/tasks/{id}/{action} unsigned",
            `缺签名请求不应改变任务状态，${probe.taskId} 从 ${beforeStatus} 变成 ${afterStatus}`
        );
        return;
    }

    addResult(
        "pass",
        "POST /api/tasks/{id}/{action} unsigned",
        `${probe.taskId} 的缺签名 ${probe.action} 请求被 401 拒绝，状态保持 ${afterStatus}`
    );
}

async function checkWrongActorTaskActionRejected(baseUrl, tasks) {
    const probe = tasks.map(buildUnsignedTransitionProbe).find(Boolean);

    if (!probe) {
        addResult("warn", "POST /api/tasks/{id}/{action} wrong actor", "没有可用于错身份负向测试的进行中任务样本");
        return;
    }

    const before = await requestJson(baseUrl, `/api/tasks/${encodeURIComponent(probe.taskId)}`);
    const beforeStatus = before.data?.task?.status;
    const response = await requestJson(
        baseUrl,
        `/api/tasks/${encodeURIComponent(probe.taskId)}/${probe.action}`,
        {
            method: "POST",
            body: buildWrongActorBody(probe)
        }
    );
    const after = await requestJson(baseUrl, `/api/tasks/${encodeURIComponent(probe.taskId)}`);
    const afterStatus = after.data?.task?.status;

    if (beforeStatus !== afterStatus) {
        addResult(
            "fail",
            "POST /api/tasks/{id}/{action} wrong actor",
            `错身份签名请求不应改变任务状态，${probe.taskId} 从 ${beforeStatus} 变成 ${afterStatus}`
        );
        return;
    }

    if (![401, 403].includes(response.status)) {
        addResult(
            "fail",
            "POST /api/tasks/{id}/{action} wrong actor",
            `错身份签名的 ${probe.action} 请求应返回 401/403，实际返回 ${response.status || response.error}`
        );
        return;
    }

    addResult(
        "pass",
        "POST /api/tasks/{id}/{action} wrong actor",
        `${probe.taskId} 的错身份 ${probe.action} 请求被 ${response.status} 拒绝，状态保持 ${afterStatus}`
    );
}

async function checkTamperedSignatureTaskActionRejected(baseUrl, tasks, kind, buildBody, expectedStatus = 401) {
    const probe = tasks.map(buildUnsignedTransitionProbe).find(Boolean);
    const resultName = `POST /api/tasks/{id}/{action} ${kind}`;

    if (!probe) {
        addResult("warn", resultName, `没有可用于${kind}负向测试的进行中任务样本`);
        return;
    }

    const before = await requestJson(baseUrl, `/api/tasks/${encodeURIComponent(probe.taskId)}`);
    const beforeStatus = before.data?.task?.status;
    const response = await requestJson(
        baseUrl,
        `/api/tasks/${encodeURIComponent(probe.taskId)}/${probe.action}`,
        {
            method: "POST",
            body: buildBody(probe)
        }
    );
    const after = await requestJson(baseUrl, `/api/tasks/${encodeURIComponent(probe.taskId)}`);
    const afterStatus = after.data?.task?.status;

    if (beforeStatus !== afterStatus) {
        addResult(
            "fail",
            resultName,
            `${kind}请求不应改变任务状态，${probe.taskId} 从 ${beforeStatus} 变成 ${afterStatus}`
        );
        return;
    }

    if (response.status !== expectedStatus) {
        addResult(
            "fail",
            resultName,
            `${kind}的 ${probe.action} 请求应返回 ${expectedStatus}，实际返回 ${response.status || response.error}`
        );
        return;
    }

    addResult(
        "pass",
        resultName,
        `${probe.taskId} 的${kind} ${probe.action} 请求被 ${response.status} 拒绝，状态保持 ${afterStatus}`
    );
}

async function checkSignedInvalidTaskActionRejected(baseUrl, tasks, resultName, buildProbe, expectedStatuses) {
    const probe = buildProbe(tasks);
    const statuses = Array.isArray(expectedStatuses) ? expectedStatuses : [expectedStatuses];

    if (!probe) {
        addResult("warn", resultName, "没有可用于该交易安全负向测试的任务样本");
        return;
    }

    const before = await requestJson(baseUrl, `/api/tasks/${encodeURIComponent(probe.taskId)}`);
    const beforeStatus = before.data?.task?.status;
    const response = await requestJson(
        baseUrl,
        `/api/tasks/${encodeURIComponent(probe.taskId)}/${probe.action}`,
        {
            method: "POST",
            body: buildSignedProbeBody(probe, {
                signatureId: "SIG-CHECKSAFE1"
            })
        }
    );
    const after = await requestJson(baseUrl, `/api/tasks/${encodeURIComponent(probe.taskId)}`);
    const afterStatus = after.data?.task?.status;

    if (beforeStatus !== afterStatus) {
        addResult(
            "fail",
            resultName,
            `无效请求不应改变任务状态，${probe.taskId} 从 ${beforeStatus} 变成 ${afterStatus}`
        );
        return;
    }

    if (!statuses.includes(response.status)) {
        addResult(
            "fail",
            resultName,
            `${probe.action} 无效请求应返回 ${statuses.join("/")}，实际返回 ${response.status || response.error}`
        );
        return;
    }

    addResult(
        "pass",
        resultName,
        `${probe.taskId} 的 ${probe.action} 无效请求被 ${response.status} 拒绝，状态保持 ${afterStatus}`
    );
}

async function checkCreators(baseUrl) {
    const response = await requestJson(baseUrl, "/api/creators");

    if (!response.ok) {
        addResult("warn", "GET /api/creators", `推荐接口暂不可用：${response.error || response.status}`);
        return null;
    }

    if (!isObject(response.data?.summary) || !Array.isArray(response.data?.rows)) {
        addResult("warn", "GET /api/creators", "响应建议包含 summary 对象和 rows 数组");
        return response.data;
    }

    addResult("pass", "GET /api/creators", `创作者经营数据 ${response.data.rows.length} 条`);
    return response.data;
}

async function checkWithdrawals(baseUrl) {
    const response = await requestJson(baseUrl, "/api/withdrawals");

    if (!response.ok) {
        addResult("warn", "GET /api/withdrawals", `推荐接口暂不可用：${response.error || response.status}`);
        return null;
    }

    if (!Array.isArray(response.data?.withdrawals)) {
        addResult("warn", "GET /api/withdrawals", "响应建议包含 withdrawals 数组");
        return response.data;
    }

    addResult("pass", "GET /api/withdrawals", `提现队列 ${response.data.withdrawals.length} 条`);
    return response.data;
}

function printReport(baseUrl) {
    const counts = results.reduce((memo, item) => {
        memo[item.level] += 1;
        return memo;
    }, { pass: 0, warn: 0, fail: 0 });

    console.log(`\n乾智 API 合约检查：${baseUrl}`);
    console.log(`结果：通过 ${counts.pass} / 警告 ${counts.warn} / 失败 ${counts.fail}\n`);

    for (const item of results) {
        const label = item.level === "pass"
            ? "通过"
            : item.level === "warn"
                ? "警告"
                : "失败";
        console.log(`[${label}] ${item.name} - ${item.message}`);
    }

    if (counts.fail > 0) {
        console.log("\n结论：存在必需接口或核心字段问题，前端不能可靠接入这个后端。");
        process.exitCode = 1;
        return;
    }

    if (counts.warn > 0) {
        console.log("\n结论：核心接口可用，但仍有推荐能力需要后端补齐。");
        return;
    }

    console.log("\n结论：当前后端符合前端原型所需的基础合约。");
}

async function main() {
    const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.QIANZHI_API_BASE || "http://127.0.0.1:8107");

    if (!baseUrl) {
        console.error("请提供 API 地址，例如：node tools/verify-api-contract.js http://127.0.0.1:8107");
        process.exit(1);
    }

    await checkHealth(baseUrl);
    await checkReadiness(baseUrl);
    await checkAgents(baseUrl);
    await checkAgentCreatorDeclarationRejected(baseUrl);
    const tasks = await checkTasks(baseUrl);
    await checkTaskDetail(baseUrl, tasks);
    await checkEvidenceVault(baseUrl, tasks);
    await checkInvalidEvidenceRejected(baseUrl, tasks);
    await checkUnsignedTaskActionRejected(baseUrl, tasks);
    await checkWrongActorTaskActionRejected(baseUrl, tasks);
    await checkTamperedSignatureTaskActionRejected(baseUrl, tasks, "签名动作不匹配", buildWrongActionBody);
    await checkTamperedSignatureTaskActionRejected(baseUrl, tasks, "签名任务不匹配", buildWrongTaskBody);
    await checkSignedInvalidTaskActionRejected(
        baseUrl,
        tasks,
        "POST /api/tasks/{id}/dispute missing evidence",
        buildMissingDisputeEvidenceProbe,
        400
    );
    await checkSignedInvalidTaskActionRejected(
        baseUrl,
        tasks,
        "POST /api/tasks/{id}/auto-settle early",
        buildEarlyAutoSettleProbe,
        409
    );
    await checkSignedInvalidTaskActionRejected(
        baseUrl,
        tasks,
        "POST /api/tasks/{id}/resolve missing rationale",
        buildMissingArbitrationReasonProbe,
        400
    );
    await checkCreators(baseUrl);
    await checkWithdrawals(baseUrl);

    printReport(baseUrl);
}

main().catch((error) => {
    console.error(`API 合约检查异常：${error.message}`);
    process.exit(1);
});
