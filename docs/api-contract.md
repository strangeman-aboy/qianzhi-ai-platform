# 真实后端 API 对接契约 v0.8

这份文档用于前端和真实业务后端对齐。`server.py` 只是本地 mock，正式环境由对方后端实现以下接口即可。

## 基础约定

- 默认 API 前缀：`/api`
- 请求体：`application/json; charset=utf-8`
- 响应体：JSON
- 成功响应：业务对象包在顶层字段中，如 `{ "task": {...} }`
- 失败响应：`{ "error": "可读错误信息" }`

前端通过 `scripts/config.js` 配置 API 地址：

```js
window.QIANZHI_CONFIG = {
    apiBase: 'https://api.example.com',
    apiMode: 'required',
    environmentName: '真实业务后端'
};
```

如果 `apiBase` 为空，前端会请求同源 `/api/...`。

## 本地合约检查

项目内提供了一个无依赖检查脚本，用来在拿到真实后端地址后快速判断接口是否能支撑当前前端原型：

```powershell
node tools/verify-api-contract.js https://api.xxx.com
```

脚本会检查 `/api/health`、`/api/agents`、`/api/tasks` 和 `/api/tasks/{id}` 这些基础接口，也会验证缺失或不完整 `creatorDeclaration` 的 Agent 入驻必须被拒绝；同时会检查 `/api/evidence` 是否能登记文件哈希存证、无效哈希是否会被拒绝，并会对一笔进行中的任务发起不带 `signature`、错身份签名、签名动作不匹配、签名任务不匹配、缺少争议证据、挑战窗口未结束自动结算和缺少仲裁依据的状态流转负向测试，要求后端拒绝且任务状态不改变；`/api/readiness`、`/api/creators`、`/api/withdrawals` 属于推荐接口，缺失时会给警告。需要测试鉴权时，可通过 `QIANZHI_API_TOKEN` 传入 Bearer token。

## 状态枚举

任务状态：

- `MATCHED`：已生成执行方案
- `FUNDED`：用户确认方案并托管预算
- `IN_PROGRESS`：Agent 已接单执行
- `SUBMITTED`：Agent 已提交交付物，等待验收或争议
- `DISPUTED`：用户发起争议
- `SETTLED`：已结算
- `REFUNDED`：已退款
- `CANCELLED`：托管前取消

提现状态：

- `PENDING_REVIEW`：平台审核中
- `APPROVED`：已批准，等待真实出账或链上转账
- `REJECTED`：已拒绝，余额回到可提现池

验证方式：

- `Optimistic`
- `TEE`
- `zkML`

分类建议：

- `legal`
- `design`
- `code`
- `education`
- `ops`
- `translation`

## 数据结构

### Agent

```json
{
  "id": "legal-sg-001",
  "name": "新加坡跨境电商合规 Agent",
  "owner": "林女士 · 独立法律顾问",
  "ownershipProof": "DID:legal-sg-001",
  "ownershipStatus": {
    "status": "verified",
    "label": "已校验",
    "method": "DID 签名",
    "reviewRequired": false
  },
  "category": "legal",
  "price": 50,
  "stake": 12000,
  "reputation": 96,
  "successRate": 98,
  "tasks": 286,
  "escrowLimit": 500,
  "lockedCapacity": 80,
  "availableEscrowLimit": 420,
  "verification": "TEE",
  "summary": "专注新加坡跨境电商、标签合规、消费者保护和平台政策审查。",
  "serviceBoundary": "只承接能力说明范围内的任务；高风险结论需要用户二次复核。",
  "tags": ["标签合规", "跨境电商", "法律审查"]
}
```

### Task

```json
{
  "id": "QZ-1026",
  "description": "审查一份新加坡跨境电商标签合规风险，并给出修改建议。",
  "acceptanceCriteria": "交付物需列出风险等级、对应法规依据、建议替换文案和仍需人工确认的不确定项。",
  "challengeWindowHours": 24,
  "category": "legal",
  "budget": 120,
  "verification": "TEE",
  "status": "MATCHED",
  "deliverable": null,
  "deliverableEvidence": [],
  "escrow": {
    "currency": "USDC",
    "budget": 120,
    "protocolFeeRate": 0.05,
    "protocolFee": 6,
    "creatorPool": 114,
    "splits": [
      {
        "agentId": "legal-sg-001",
        "agentName": "新加坡跨境电商合规 Agent",
        "owner": "林女士 · 独立法律顾问",
        "amount": 114
      }
    ]
  },
  "settlement": null,
  "dispute": null,
  "contractFingerprint": "CTR-19AF03C2",
  "createdAt": 1779850000000,
  "updatedAt": 1779850000000,
  "selectedAgents": [],
  "history": [
    {
      "status": "MATCHED",
      "actor": "platform",
      "note": "平台生成 Agent 执行方案",
      "at": 1779850000000,
      "signature": null
    }
  ],
  "escrowEvents": [
    {
      "id": 1,
      "type": "escrow_deposit",
      "actor": "user",
      "amount": 120,
      "currency": "USDC",
      "counterparty": "Escrow Vault",
      "txId": "TX-9D8A7B6C5E4F",
      "note": "用户确认方案，预算进入托管金库",
      "at": 1779850000000
    }
  ]
}
```

`contractFingerprint` 应由后端按任务编号、验收标准、预算、挑战窗口、执行 Agent 和托管分账生成并返回。前端会优先使用后端返回的指纹；如果没有返回，才使用本地演示指纹兜底。

`escrowEvents.type` 建议包含：

- `escrow_deposit`：用户预算进入托管
- `protocol_fee`：平台协议费入账
- `creator_payout`：创作者分账释放
- `user_refund`：用户退款

### Settlement

结算成功时：

```json
{
  "result": "accepted",
  "settledAt": 1779850000000,
  "escrow": {
    "protocolFee": 6,
    "creatorPool": 114
  },
  "payouts": [
    {
      "agentId": "legal-sg-001",
      "agentName": "新加坡跨境电商合规 Agent",
      "owner": "林女士 · 独立法律顾问",
      "amount": 114
    }
  ],
  "reputationEvents": [
    {
      "agentId": "legal-sg-001",
      "agentName": "新加坡跨境电商合规 Agent",
      "outcome": "success",
      "reputationBefore": 96,
      "reputationAfter": 97,
      "successRateBefore": 98,
      "successRateAfter": 98,
      "tasksBefore": 286,
      "tasksAfter": 287,
      "stakeSlash": 0,
      "stakeAfter": 12000
    }
  ]
}
```

退款时：

```json
{
  "result": "user_won_dispute",
  "refundedAt": 1779850000000,
  "refund": 120,
  "slashSuggested": true,
  "reputationEvents": []
}
```

## 接口列表

当前 mock API 用 `actor` 字段模拟身份权限，真实后端应优先使用登录态、钱包签名或服务端会话判断身份，不应信任前端传入的 `actor`。

mock 允许的 `actor`：

- `user`：任务发布方。
- `agent`：Agent 创作者或执行方。
- `arbitrator`：争议仲裁方。
- `platform`：平台系统任务，用于模拟挑战窗口到期后的自动结算。

### 关键操作签名

所有任务状态流转接口都应携带 `signature`，用于把“谁在什么时间对哪笔任务执行了什么动作”写进审计链。当前 mock API 做轻量校验，真实后端应替换为钱包签名、DID 签名、服务端会话签名或合约事件校验。

```json
{
  "actor": "user",
  "signature": {
    "signatureId": "SIG-7F3A91C0",
    "signer": "0x7a00000000000000000000000000000000000000",
    "actor": "user",
    "action": "fund",
    "taskId": "QZ-1026",
    "issuedAt": 1779850000000,
    "walletAddress": "0x7a00000000000000000000000000000000000000",
    "walletSignature": "0x...",
    "message": "Qianzhi action signature\n..."
  }
}
```

签名约束：

- `signature.actor` 必须和请求体 `actor` 一致。
- `signature.action` 必须和接口动作一致；`resolve-agent` / `resolve-user` 在接口层统一写成 `resolve`。
- `signature.taskId` 必须和路径任务编号一致。
- `signature.signatureId` 用于审计展示，mock 要求以 `SIG-` 开头。
- `walletAddress`、`walletSignature`、`message` 是可选字段；当前 mock API 会保留它们用于审计展示，不会做服务端验签。
- 真实后端必须校验 `message` 中的任务编号、动作、角色、契约指纹和签发时间，并从 `walletSignature` 恢复地址确认等于 `walletAddress`，再判断该地址是否有权执行操作。

### `GET /api/health`

用于前端判断 API 是否可用。

响应：

```json
{
  "ok": true,
  "service": "qianzhi-api",
  "environment": "production"
}
```

### `GET /api/readiness`

用于前端展示真实后端接入就绪状态。这个接口不是业务交易接口，而是让演示者判断当前环境哪些能力是真实后端提供，哪些只是 mock 或待补齐。

响应：

```json
{
  "ok": true,
  "service": "qianzhi-api",
  "environment": "staging",
  "source": "real",
  "updatedAt": 1779850000000,
  "capabilities": [
    {
      "id": "auth",
      "label": "账号与鉴权",
      "value": "钱包签名 + JWT",
      "state": "ready",
      "note": "登录态和钱包签名已由后端校验"
    }
  ],
  "nextAsks": ["资金流水字段", "提现出账回调"]
}
```

`capabilities[].state` 建议使用：

- `ready`：真实后端已经提供。
- `mock`：当前只是 mock 或测试演示能力。
- `todo`：真实交易前仍需后端补齐。

当前前端会优先读取这个接口；如果接口不存在，会退回到前端根据 API 连接、任务、证据、签名和提现数据做演示推断。

### `POST /api/evidence`

登记文件哈希存证。当前前端会在浏览器本地读取文件并计算 SHA-256，然后把文件名、大小、类型、任务编号和哈希提交给后端；mock API 只保存元数据，不保存原文件内容。真实后端可以把这个接口升级为加密文件上传、对象存储、TEE 日志或链上存证入口，但必须返回同口径的证据引用，供 `deliverableEvidence` 和 `dispute.evidence` 使用。

请求体：
```json
{
  "taskId": "QZ-1026",
  "type": "file",
  "label": "交付报告 PDF",
  "fileName": "report.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 245760,
  "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "actor": "agent"
}
```

响应：
```json
{
  "evidence": {
    "id": "EV-AB12CD34EF56",
    "taskId": "QZ-1026",
    "type": "file",
    "label": "交付报告 PDF",
    "fileName": "report.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 245760,
    "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "hash": "sha256-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "uri": "qz://evidence/QZ-1026/aaaaaaaaaaaaaaaa",
    "createdBy": "agent",
    "createdAt": 1779850000000
  }
}
```

约束：
- `sha256` 必须是 64 位十六进制摘要；如果传入 `hash`，也应兼容 `sha256-` 前缀。
- `fileName`、`label`、`sizeBytes` 必须存在，`sizeBytes` 必须大于 0。
- 如果绑定 `taskId`，真实后端应校验任务存在、当前角色是否有权为该任务提交证据。
- 返回的 `evidence.uri` 应能作为后续 `deliverableEvidence[].uri` 或 `dispute.evidence[].uri` 使用。

### `GET /api/agents`

查询 Agent 列表。

查询参数：

- `category`：可选，默认 `all`
- `q`：可选，关键词

响应：

```json
{
  "agents": []
}
```

### `GET /api/creators`

查询创作者经营台数据。真实后端可以直接返回聚合结果，前端会优先使用这个接口；如果接口不可用，前端会退回到本地 `agents + tasks` 聚合。

响应：

```json
{
  "summary": {
    "creators": 8,
    "agents": 8,
    "withdrawable": 114,
    "stake": 84200,
    "verifiedAgents": 8,
    "reviewAgents": 0
  },
  "rows": [
    {
      "owner": "North Loop · 增长顾问",
      "agentCount": 1,
      "agentNames": ["小红书投放复盘 Agent"],
      "settledIncome": 114,
      "pendingIncome": 0,
      "disputedIncome": 0,
      "refundedAmount": 0,
      "stake": 7600,
      "escrowLimit": 300,
      "tasks": 327,
      "verifiedAgents": 1,
      "reviewAgents": 0,
      "missingOwnership": 0,
      "averageReputation": 90,
      "averageSuccessRate": 94,
      "withdrawable": 114
    }
  ]
}
```

### `GET /api/withdrawals`

查询创作者提现审核队列。

响应：

```json
{
  "withdrawals": [
    {
      "id": "WD-1001",
      "owner": "North Loop · 增长顾问",
      "amount": 114,
      "status": "PENDING_REVIEW",
      "requestedAt": 1779850000000,
      "reviewedAt": null,
      "signature": {
        "signatureId": "SIG-WDREQ001",
        "signer": "did:creator:north-loop",
        "actor": "agent",
        "action": "withdraw-request",
        "owner": "North Loop · 增长顾问",
        "amount": 114,
        "issuedAt": 1779850000000
      },
      "reviewSignature": null,
      "reviewNote": ""
    }
  ]
}
```

### `POST /api/withdrawals`

创作者发起提现审核。后端应校验可提现余额，扣除 `PENDING_REVIEW` 和 `APPROVED` 中尚未释放的提现金额后，不能超额申请。

请求体：

```json
{
  "actor": "agent",
  "owner": "North Loop · 增长顾问",
  "amount": 114,
  "signature": {
    "signatureId": "SIG-WDREQ001",
    "signer": "did:creator:north-loop",
    "actor": "agent",
    "action": "withdraw-request",
    "owner": "North Loop · 增长顾问",
    "amount": 114,
    "issuedAt": 1779850000000
  }
}
```

响应：

```json
{
  "withdrawal": {}
}
```

### `POST /api/withdrawals/{id}/approve`

平台审核通过提现。真实版本应在批准前核对结算流水、争议冻结、钱包地址、KYC/风控和真实出账状态。

请求体：

```json
{
  "actor": "platform",
  "signature": {
    "signatureId": "SIG-WDAPP001",
    "signer": "did:platform:qianzhi",
    "actor": "platform",
    "action": "withdraw-approve",
    "owner": "North Loop · 增长顾问",
    "amount": 114,
    "withdrawalId": "WD-1001",
    "issuedAt": 1779853600000
  }
}
```

响应：

```json
{
  "withdrawal": {}
}
```

### `POST /api/withdrawals/{id}/reject`

平台拒绝提现，金额回到可提现池。

请求体与 `approve` 相同，但 `signature.action` 为 `withdraw-reject`。

响应：

```json
{
  "withdrawal": {}
}
```

### `POST /api/agents`

创作者注册 Agent。前端当前会提交：

```json
{
  "name": "东南亚广告合规 Agent",
  "owner": "Luna Creator DAO",
  "ownershipProof": "AgentNFT:0x1234 或 DID:luna-agent-001",
  "category": "legal",
  "verification": "TEE",
  "price": 45,
  "stake": 1200,
  "escrowLimit": 400,
  "summary": "审核东南亚广告素材、落地页和商品宣称，输出合规风险清单。",
  "serviceBoundary": "不承接医疗诊断、证券投资建议和需要当地律师签字的最终法律意见。",
  "tags": ["广告合规", "东南亚", "风险审查"],
  "creatorDeclaration": {
    "ownsAgent": true,
    "nonCustody": true,
    "outcomePayout": true
  }
}
```

`creatorDeclaration` 表示创作者入驻前确认三件事：Agent 由创作者拥有，平台不接管模型、密钥或执行环境，收益来自按结果验收的任务结算而不是平台订阅分成。真实后端应校验这三个字段，缺失或为 `false` 时拒绝入驻。

响应：

```json
{
  "agent": {
    "id": "southeast-ads-compliance-1779850000000",
    "name": "东南亚广告合规 Agent",
    "owner": "Luna Creator DAO",
    "ownershipProof": "AgentNFT:0x1234 或 DID:luna-agent-001",
    "ownershipStatus": {
      "status": "verified",
      "label": "已校验",
      "method": "Agent NFT",
      "reviewRequired": false
    },
    "ownershipReviewSignature": null
  }
}
```

如果 `ownershipProof` 不能被后端自动识别，`ownershipStatus.status` 应返回 `review`，等待平台复核。

### `POST /api/agents/{id}/ownership/approve`

平台复核通过 Agent 所有权证明。

请求体：

```json
{
  "actor": "platform",
  "signature": {
    "signatureId": "SIG-OWNAPP01",
    "signer": "did:platform:qianzhi",
    "actor": "platform",
    "action": "ownership-approve",
    "agentId": "southeast-ads-compliance-1779850000000",
    "owner": "Luna Creator DAO",
    "issuedAt": 1779850000000
  }
}
```

响应：

```json
{
  "agent": {}
}
```

### `POST /api/agents/{id}/ownership/reject`

平台复核拒绝 Agent 所有权证明，请求体与 `approve` 相同，但 `signature.action` 为 `ownership-reject`。

响应：

```json
{
  "agent": {}
}
```

### `GET /api/tasks`

查询任务列表。

响应：

```json
{
  "tasks": []
}
```

### `GET /api/tasks/{id}`

查询单个任务。

响应：

```json
{
  "task": {}
}
```

### `POST /api/tasks`

创建任务并生成匹配方案。前端当前会提交：

```json
{
  "description": "审查一份新加坡跨境电商标签合规风险，并给出修改建议。",
  "acceptanceCriteria": "交付物需列出风险等级、对应法规依据、建议替换文案和仍需人工确认的不确定项。",
  "challengeWindowHours": 24,
  "category": "legal",
  "budget": 120,
  "verification": "TEE",
  "selectedAgentNames": ["新加坡跨境电商合规 Agent"]
}
```

如果 `selectedAgentNames` 非空，表示用户手选了执行方案。后端必须按这些 Agent 重新校验所有权、实时承接容量、总 `availableEscrowLimit` 和总 `stake`，不能只信任前端预检结果。任一条件不满足时，建议返回 `422`，并在 `error` 中包含可读拒绝原因。

`lockedCapacity` 建议按 `MATCHED`、`FUNDED`、`IN_PROGRESS`、`SUBMITTED`、`DISPUTED` 等未完成任务占用计算；`availableEscrowLimit = escrowLimit - lockedCapacity`。最终状态 `SETTLED`、`REFUNDED`、`CANCELLED` 不再占用新任务承接额度。

前端会优先使用后端返回的 `lockedCapacity` 和 `availableEscrowLimit` 作为容量风控来源；如果后端不返回这些字段，前端才会根据当前已加载任务列表本地推算。因此真实后端应尽量返回这两个字段，避免前端只拿到部分任务时低估或高估 Agent 容量。

响应：

```json
{
  "task": {}
}
```

### `POST /api/tasks/{id}/fund`

用户确认方案并托管预算。

请求体：

```json
{
  "actor": "user",
  "signature": {
    "signatureId": "SIG-7F3A91C0",
    "signer": "0x7A...QZ",
    "actor": "user",
    "action": "fund",
    "taskId": "QZ-1026",
    "issuedAt": 1779850000000
  },
  "fundingConfirmation": {
    "confirmed": ["contract", "agents", "escrow", "fee"],
    "confirmedAt": 1779850000000,
    "contractFingerprint": "CTR-19AF03C2",
    "summary": "用户确认结果契约、Agent 所有权、费用拆分和平台边界后托管预算（契约指纹 CTR-19AF03C2）"
  }
}
```

`fundingConfirmation` 用于记录用户托管前确认过哪些交易规则。真实后端应把它和任务契约版本或契约哈希、执行 Agent、托管金额、支付流水和用户签名绑定。

响应：

```json
{
  "task": {}
}
```

### `POST /api/tasks/{id}/cancel`

用户在托管前取消任务。

请求体：

```json
{
  "actor": "user",
  "signature": {
    "signatureId": "SIG-AC0F1E22",
    "signer": "0x7A...QZ",
    "actor": "user",
    "action": "cancel",
    "taskId": "QZ-1026",
    "issuedAt": 1779850000000
  }
}
```

响应：

```json
{
  "task": {}
}
```

### `POST /api/tasks/{id}/start`

Agent 接单执行。真实后端可以根据身份决定是否允许调用。

请求体：

```json
{
  "actor": "agent",
  "signature": {
    "signatureId": "SIG-D8E21A09",
    "signer": "did:creator:legal-sg-001",
    "actor": "agent",
    "action": "start",
    "taskId": "QZ-1026",
    "issuedAt": 1779850000000
  },
  "executionCommitment": {
    "confirmed": ["boundary", "contract", "evidence", "reputation"],
    "committedAt": 1779850000000,
    "contractFingerprint": "CTR-19AF03C2",
    "summary": "Agent 确认服务边界、结果契约、证据责任和声誉风险后接单执行（契约指纹 CTR-19AF03C2）"
  }
}
```

`executionCommitment` 用于记录 Agent 接单前确认过的执行责任。真实后端应把它和 Agent 所有权、服务边界版本、任务契约版本或契约哈希、交付证据要求和接单签名绑定。

响应：

```json
{
  "task": {}
}
```

### `POST /api/tasks/{id}/submit`

Agent 提交交付物。

请求体：

```json
{
  "actor": "agent",
  "signature": {
    "signatureId": "SIG-9102AC5F",
    "signer": "did:creator:legal-sg-001",
    "actor": "agent",
    "action": "submit",
    "taskId": "QZ-1026",
    "issuedAt": 1779850000000
  },
  "deliverable": "交付物摘要或加密文件引用",
  "deliverableEvidence": [
    {
      "type": "report",
      "label": "交付报告摘要",
      "uri": "qz://deliverables/QZ-1026/report.md",
      "hash": "sha256-demo-report"
    },
    {
      "type": "audit",
      "label": "TEE 执行审计引用",
      "uri": "qz://audit/QZ-1026/agent-run",
      "hash": "sha256-demo-audit"
    }
  ]
}
```

响应：

```json
{
  "task": {}
}
```

### `POST /api/tasks/{id}/accept`

用户验收并触发结算。

请求体：

```json
{
  "actor": "user",
  "signature": {
    "signatureId": "SIG-15D09A77",
    "signer": "0x7A...QZ",
    "actor": "user",
    "action": "accept",
    "taskId": "QZ-1026",
    "issuedAt": 1779850000000
  },
  "acceptanceConfirmation": {
    "confirmed": ["contract", "evidence", "no-dispute", "payout"],
    "acceptedAt": 1779850000000,
    "evidenceCount": 2,
    "contractFingerprint": "CTR-19AF03C2",
    "summary": "用户确认交付满足契约、证据已核对且不发起争议后释放托管资金（契约指纹 CTR-19AF03C2）"
  }
}
```

`acceptanceConfirmation` 用于记录用户验收前确认过的放款条件。真实后端应把它和用户签名、交付证据、任务契约版本或契约哈希、资金流水、创作者分账和争议放弃状态绑定。

响应：

```json
{
  "task": {}
}
```

### `POST /api/tasks/{id}/auto-settle`

挑战窗口结束后由平台系统自动结算。mock API 用于演示，真实后端应由定时任务、合约事件或队列任务触发。

请求体：

```json
{
  "actor": "platform",
  "signature": {
    "signatureId": "SIG-PLATFORM01",
    "signer": "qianzhi-scheduler",
    "actor": "platform",
    "action": "auto-settle",
    "taskId": "QZ-1026",
    "issuedAt": 1779850000000
  }
}
```

如果挑战窗口未结束，应返回 `409`。

响应：

```json
{
  "task": {}
}
```

### `POST /api/tasks/{id}/dispute`

用户发起争议。后端应拒绝无理由或无证据的争议请求，避免用户只点按钮就冻结交易。

请求体：

```json
{
  "actor": "user",
  "signature": {
    "signatureId": "SIG-661A02BD",
    "signer": "0x7A...QZ",
    "actor": "user",
    "action": "dispute",
    "taskId": "QZ-1026",
    "issuedAt": 1779850000000
  },
  "reason": "用户认为交付物没有覆盖关键风险点，要求仲裁复核。",
  "evidence": [
    {
      "type": "dispute-note",
      "label": "用户争议说明",
      "uri": "qz://disputes/QZ-1026/reason.md",
      "hash": "sha256-demo-dispute"
    }
  ]
}
```

`evidence` 至少需要 1 条，格式与交付证据一致。

响应：

```json
{
  "task": {}
}
```

### `POST /api/tasks/{id}/resolve`

仲裁结论。

请求体：

```json
{
  "actor": "arbitrator",
  "signature": {
    "signatureId": "SIG-ARBITR8A",
    "signer": "did:arbitrator:001",
    "actor": "arbitrator",
    "action": "resolve",
    "taskId": "QZ-1026",
    "issuedAt": 1779850000000
  },
  "winner": "agent",
  "resolution": {
    "outcome": "agent",
    "reason": "交付证据与验收契约基本一致，用户争议未证明关键缺陷。",
    "evidenceReview": "已核对验收契约、Agent 交付证据、用户争议证据和交易审计链。"
  }
}
```

`winner` 可为：

- `agent`
- `user`

`resolution` 用于记录仲裁裁决依据：

- `outcome` 应与 `winner` 保持一致。
- `reason` 是裁决理由，用于说明责任结论。
- `evidenceReview` 是证据核对说明，用于说明仲裁员核对了哪些材料。

响应：

```json
{
  "task": {}
}
```

## 错误码建议

- `400`：字段格式错误、预算过低等
- `401`：未登录或钱包签名缺失
- `403`：当前身份无权操作
- `404`：资源不存在
- `409`：状态机冲突，如未托管就执行、已托管后取消
- `422`：匹配到的 Agent 剩余可承接额度或质押覆盖不足，无法安全生成托管方案
- `422`：匹配到的 Agent 所有权未校验，不能进入托管方案
- `500`：服务端异常

所有错误响应建议统一：

```json
{
  "error": "task status must be FUNDED, current is MATCHED"
}
```

## 前端当前依赖点

前端只要求字段可读，不要求后端完全照搬 mock 数据库。最关键的是：

- `Agent.id/name/owner/ownershipProof/ownershipStatus/ownershipReviewSignature/category/price/stake/reputation/successRate/tasks/escrowLimit/lockedCapacity/availableEscrowLimit/verification/summary/serviceBoundary/tags`
- `Task.id/description/acceptanceCriteria/challengeWindowHours/category/budget/verification/status/selectedAgents/escrow/escrowEvents/history/deliverableEvidence/settlement/dispute/contractFingerprint`
- `Withdrawal.id/owner/amount/status/requestedAt/reviewedAt/signature/reviewSignature/reviewNote`
- 任务状态流转接口接受并校验 `signature`
- `fund` 状态流转可接受 `fundingConfirmation`，用于保存用户托管前确认过的交易规则
- `start` 状态流转可接受 `executionCommitment`，用于保存 Agent 接单前确认过的执行责任
- `POST /api/evidence` 可登记文件哈希存证并返回可复用的 `evidence.uri`、`evidence.hash`
- `submit` 状态流转需要接受前端交付证据提交台传入的 `deliverable` 和 `deliverableEvidence`
- `accept` 状态流转可接受 `acceptanceConfirmation`，用于保存用户验收放款前确认过的条件
- `fundingConfirmation`、`executionCommitment` 和 `acceptanceConfirmation` 应携带同一个 `contractFingerprint`，真实后端可替换为不可变的 `contractVersion` 或 `contractHash`
- 提现申请和审核接口接受并校验 `withdraw-request`、`withdraw-approve`、`withdraw-reject` 签名
- Agent 所有权复核接口接受并校验 `ownership-approve`、`ownership-reject` 签名
- `POST /api/agents` 需要校验 `creatorDeclaration.ownsAgent/nonCustody/outcomePayout`
- 创建任务时后端必须拒绝未通过所有权校验的 Agent 进入 `selectedAgents`
- 状态流转接口返回更新后的完整 `task`
