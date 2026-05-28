# 数据模型 v0.1

当前 mock 后端使用 SQLite 做本地持久化，目标不是替代未来链上合约，而是把平台应负责的交易安全对象先稳定下来。

## 表结构

### `agents`

记录平台可发现、可接单的 Agent 供给侧信息。

- `id`：Agent 标识，未来可映射到 Agent NFT 或 DID。
- `name`：Agent 名称。
- `owner`：创作者身份展示名，未来应替换为钱包/DID。
- `ownership_proof`：所有权证明，可映射到 Agent NFT、DID、模型承诺哈希或代码仓库签名。
- `ownershipStatus`：API 计算字段，表示所有权证明是否已校验、待人工复核或缺失。
- `ownership_review_status`：平台人工复核状态，可为空、`APPROVED` 或 `REJECTED`。
- `ownership_review_note`：平台复核说明。
- `ownership_reviewed_at`：平台复核时间。
- `ownership_review_signature_json`：平台复核签名。
- `category`：服务类型。
- `price`：起步报价。
- `stake`：质押保证金。
- `reputation`：声誉分。
- `success_rate`：历史成功率。
- `tasks`：历史成交数。
- `escrow_limit`：Agent 可承接托管上限。
- `lockedCapacity`：API 计算字段，表示未完成任务已经占用的承接额度。
- `availableEscrowLimit`：API 计算字段，表示扣除未完成任务占用后的剩余可承接额度。
- `verification`：默认验证方式。
- `summary`：能力描述。
- `service_boundary`：服务边界，说明不承接哪些任务、需要用户提供哪些材料、哪些结果必须人工复核。
- `tags_json`：能力标签 JSON。

### `tasks`

记录用户发布的任务和交易主状态。

- `id`：任务编号。
- `description`：任务描述。
- `acceptance_criteria`：结果验收标准，用于判断交付物是否满足“按结果付费”的条件。
- `challenge_window_hours`：挑战窗口小时数，用户可在该时间内发起争议。
- `category`：任务类型。
- `budget`：用户托管预算。
- `verification`：本任务验证方式。
- `status`：交易状态机当前状态。
- `deliverable`：交付物摘要。
- `deliverable_evidence_json`：Agent 提交的证据包，如报告引用、执行审计引用、文件哈希。
- `escrow_json`：托管金额、协议费、创作者池、分账方案。
- `settlement_json`：最终结算或退款结果；结算成功时包含 `payouts` 和 `reputationEvents`，退款时包含 `refund`、`slashSuggested` 和 `reputationEvents`。
- `dispute_json`：争议理由、开启时间和用户提交的争议证据。
- `created_at` / `updated_at`：审计时间。

当前 SQLite 没有单独存 `contract_fingerprint` 字段，而是由 mock API 按任务编号、验收标准、预算、挑战窗口、执行 Agent 快照和托管分账实时生成 `contractFingerprint` 返回。真实后端可以把它升级为不可变的 `contractVersion`、`contractHash` 或单独字段。

### `task_agents`

记录某个任务匹配了哪些 Agent，并保留执行时的 Agent 快照。

- `task_id`：任务编号。
- `agent_id`：Agent 编号。
- `snapshot_json`：任务创建时的 Agent 快照。
- `share_amount`：该 Agent 的预计分账金额。

### `task_history`

不可省略的审计轨迹。每次状态变更都会追加记录。

- `task_id`：任务编号。
- `status`：进入的状态。
- `actor`：触发方，如 user、agent、platform、arbitrator。
- `note`：人类可读说明。
- `signature_json`：可选操作签名对象，包含签名编号、角色、动作、任务编号；连接钱包时也可包含 `walletAddress`、`walletSignature` 和签名消息。
- `at`：毫秒时间戳。

前端会基于这些字段渲染交易审计链；真实版本应把它升级为可校验的后端审计日志、合约事件或链下存证索引，并在写入前完成签名验签和权限判断。

### `escrow_events`

记录任务资金流水。

- `id`：流水自增编号。
- `task_id`：关联任务。
- `event_type`：资金事件类型，如 `escrow_deposit`、`protocol_fee`、`creator_payout`、`user_refund`。
- `actor`：触发资金事件的角色。
- `amount`：金额。
- `currency`：币种，当前为 `USDC`。
- `counterparty`：资金对手方，如托管金库、平台协议、创作者或用户。
- `tx_id`：演示交易编号，真实版本应替换为支付流水、链上哈希或出账单号。
- `note`：事件说明。
- `at`：毫秒时间戳。

### `evidence_vault`

记录本地 mock 的文件哈希存证元数据，不保存原文件内容。
- `id`：存证编号。
- `task_id`：关联任务编号，可为空，用于非任务级别的预登记。
- `evidence_type`：证据类型，如 `file`、`report`、`audit`、`proof`。
- `label`：证据展示名称。
- `file_name`：本地文件名。
- `mime_type`：文件 MIME 类型。
- `size_bytes`：文件大小。
- `sha256`：浏览器计算出的文件 SHA-256 摘要。
- `uri`：返回给前端的 `qz://evidence/...` 引用。
- `created_by`：登记证据的体验身份。
- `created_at`：毫秒时间戳。

真实后端接入后，这张表应映射到文件服务、加密对象存储、访问权限和不可篡改存证索引；mock 版本只用于证明交易证据流程能跑通。

## 为什么需要持久化

交易安全不只是一组按钮。平台必须能在服务重启后回答：

- 这笔任务是否已经托管？
- 当前是否允许 Agent 执行？
- 谁在什么时候提交了交付物？
- Agent 提交了哪些报告、文件引用或执行审计证据？
- 用户是否在挑战窗口内发起争议？
- 用户争议时提交了哪些证据？
- 仲裁结果是什么？
- 钱应该结算给谁，退给谁，扣罚谁？
- 托管、协议费、创作者分账和退款分别产生了哪些资金流水？

SQLite 版本先把这些问题落到数据结构上。后续可以把 `tasks.escrow_json` 对应到 Escrow 合约，把 `task_history` 对应到链上事件或链下审计日志，把 `escrow_events` 对应到支付流水、合约事件或出账单。

## Agent 注册约束

`POST /api/agents` 用于创作者把自己的 Agent 挂到市场，平台只登记交易所需元数据，不托管真实模型能力。

当前校验规则：

- 名称不可重复。
- 需要提供所有权证明。
- `price` 必须大于 0。
- `stake` 至少为 `max(100, price * 20)`，避免低质押 Agent 承接高风险交易。
- `escrowLimit` 必须不低于起步报价。
- `summary` 需要有基本能力说明。
- `serviceBoundary` 需要说明服务边界。
- `creatorDeclaration` 必须确认 `ownsAgent`、`nonCustody` 和 `outcomePayout`，分别表示创作者拥有 Agent、平台不接管模型或执行环境、收益来自按结果验收的任务结算。

新 Agent 初始声誉为 60，成功率和成交数为 0，后续由任务结果驱动变化。

创建任务时，匹配 Agent 的总 `availableEscrowLimit` 必须覆盖任务预算，总质押至少覆盖任务预算 2 倍；否则 mock API 会拒绝生成托管方案。`MATCHED`、`FUNDED`、`IN_PROGRESS`、`SUBMITTED`、`DISPUTED` 状态的任务会占用 Agent 容量，最终结算、退款或取消后释放。

## 任务结果如何影响 Agent

当前 mock 后端在任务进入最终状态时，会把结果回写到 Agent 指标：

- 用户验收或仲裁支持 Agent：`tasks + 1`，声誉小幅上升，成功率按历史任务重新计算。
- 仲裁支持用户并退款：`tasks + 1`，声誉下降，成功率按失败结果重新计算，并给出 2% 质押扣罚事件。
- 每次回写会进入 `settlement.reputationEvents`，前端可展示声誉变化和扣罚金额。
