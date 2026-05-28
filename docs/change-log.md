# 重点变更日志

更新时间：2026-05-29

这个文件只记录项目层面的关键变化，用于后续交接、复盘和对外说明。

不记录每一次样式微调、文案替换、代码整理或临时测试；只有当变化影响产品方向、页面结构、交易流程、接口契约、数据模型、视觉定位或交付边界时，才写进这里。

## 记录规则

- 每条日志只写一个关键变化。
- 优先写“为什么改”和“影响了什么”，不要写成代码提交流水账。
- 同一天有多个小改动时，合并成一条模块级记录。
- 新记录追加到对应日期下方，重要程度高的放前面。
- 建议包含：变更类型、核心变化、影响范围、后续注意事项。

## 2026-05-29

### 首屏定位补充专业 Agent 与低门槛使用

变更类型：产品定位
核心变化：首页首屏补充“创作者把能解决垂直复杂问题的专业 Agent 带到市场”和“用户只需要描述任务与验收结果，平台负责匹配、托管、证据和结算”，更明确解释平台如何降低普通人使用 AI 的门槛，并帮助用户提升效率和质量。
影响范围：
- `index.html`
- `docs/current-status.md`
- `docs/project-explanation.md`
- `docs/change-log.md`

后续注意：后续新增页面或对外材料时，要同时讲清楚三层价值：创作者拥有专业 Agent、普通用户按结果获得能力、平台只做可信交易和安全结算。

### 挑战窗口未结束时阻止自动结算入口

变更类型：交易安全
核心变化：前端会根据任务提交时间和挑战窗口计算自动结算是否可用；窗口未结束时，平台身份的自动结算按钮会被禁用，行动队列也不会把它作为待处理动作展示。本地演示状态机也会拒绝提前自动结算，和 mock 后端的 `409 challenge window is still open` 规则保持一致。
影响范围：
- `scripts/app.js`
- `docs/change-log.md`

后续注意：真实后端仍然必须保留服务端挑战窗口校验，前端禁用按钮只能减少误操作和解释交易规则，不能替代后端权限与时间判断。

## 2026-05-28

### 成员演示版部署包与交接说明加入

变更类型：部署交付
核心变化：新增 `npm run build:demo`，自动生成只包含 `index.html`、`styles/`、`scripts/` 和 `images/` 的 `dist/member-demo` 静态演示包；默认配置切到 `apiMode: 'off'`，适合私有 GitHub + Vercel/Netlify 的成员演示场景；同时新增成员部署说明，明确发布目录、访问保护、代码可见边界和真实后端接入方式。
影响范围：
- `index.html`
- `scripts/config.js`
- `package.json`
- `tools/build-member-demo.js`
- `.gitignore`
- `README.md`
- `docs/member-demo-deployment.md`
- `docs/change-log.md`

后续注意：云平台必须发布 `dist/member-demo`，不要发布项目根目录；即使仓库私有，浏览器仍会下载前端静态文件，所以页面里不能放真实密钥、真实钱包私钥、真实用户数据或未公开资金信息。

### 钱包连接与关键操作签名凭证补强

变更类型：交易安全
核心变化：顶部“连接钱包”不再直接伪造已连接状态；浏览器有钱包时会请求真实账户，关键任务流转、提现审核和 Agent 所有权复核会尝试 `personal_sign`，没有钱包时仍明确使用 `demo:{actor}` 演示签名。mock API 会保留可选的 `walletAddress`、`walletSignature` 和 `message` 字段，并把带签名的任务状态变化写入 `task_history.signature_json`，让审计链能看到更完整的操作凭证。
影响范围：
- `scripts/app.js`
- `server.py`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/transaction-safety.md`
- `docs/data-model.md`
- `docs/backend-handoff-checklist.md`
- `docs/change-log.md`

后续注意：当前 mock API 只保存钱包签名字段，不做服务端验签、地址恢复、登录态绑定或资金授权。真实后端接入后，必须校验签名消息和任务、动作、角色、契约指纹一致，并确认恢复出的地址有权执行该操作。

### 加入自动视觉 QA 并修复手机端钱包按钮裁切

变更类型：视觉体验
核心变化：新增 `tools/visual-qa.js`，自动检查桌面/手机、浅色/深色、主要页面和证据弹窗的横向溢出、元素越界和文字裁切；同时修复手机端顶部“连接钱包”按钮因短宽按钮保留原始长文字而被裁切的问题。
影响范围：
- `index.html`
- `styles/main.css`
- `tools/visual-qa.js`
- `README.md`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：后面每次改页面结构、移动端样式、主题色或弹窗，都应先启动本地 mock 服务，再运行 `node tools/visual-qa.js http://127.0.0.1:8107`；需要留截图时加 `--screenshots`。

### 证据提交台加入文件哈希存证入口

变更类型：交易安全
核心变化：交付证据和争议证据表单现在可以选择本地文件，由浏览器计算 SHA-256；连接 mock API 时会调用 `/api/evidence` 保存文件名、大小、哈希和 `qz://evidence/...` 引用，但不上传原文件内容；合约检查器会验证有效哈希可登记、无效哈希必须被拒绝。
影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `tools/verify-api-contract.js`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：这一步只是把“证据存证”变成可操作流程，不等于真实文件服务。正式后端仍需要文件上传、加密存储、权限控制、证据下载授权和不可篡改存证。

### API 合约检查加入状态机负向测试

变更类型：后端对接

核心变化：`tools/verify-api-contract.js` 会对进行中的任务发起不带 `signature`、错身份签名、签名动作不匹配、签名任务不匹配、缺少争议证据、挑战窗口未结束自动结算和缺少仲裁依据的状态流转请求，要求后端拒绝且任务状态不改变。

影响范围：
- `tools/verify-api-contract.js`
- `server.py`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：真实后端地址交付后，要先跑合约检查器；如果缺签名、错身份、签名绑定被篡改、缺证据、提前结算或缺仲裁依据的请求没有被拒绝，说明状态机可以绕过关键交易安全约束，不能用于真实演示。

### Agent 入驻加入创作者声明

变更类型：创作者准入

核心变化：创作者注册 Agent 前必须确认所有权、平台非托管和按结果结算；未确认时前端和 mock API 都会拒绝入驻，合约检查器也会验证缺失或不完整声明。

影响范围：
- `index.html`
- `styles/main.css`
- `scripts/app.js`
- `server.py`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/data-model.md`
- `docs/change-log.md`

后续注意：真实后端接入时，`POST /api/agents` 也应保存或校验这份创作者声明；如果合约检查器提示缺失声明仍可入驻，说明后端没有守住“平台不代管、不生产、不做订阅分成”的供给侧边界。

### 首页无订阅定位明确

变更类型：产品定位

核心变化：首页主文案和关键指标补充“0 月费 / 无订阅捆绑”，把用户按任务结果付费和平台透明协议费区分开。

影响范围：
- `index.html`
- `styles/main.css`
- `scripts/app.js`
- `docs/current-status.md`
- `docs/project-explanation.md`
- `docs/change-log.md`

后续注意：后续所有收费说明都要保持这个边界：平台可以收每笔任务的透明协议费，但不要把用户引导成订阅大平台的心智。

### 首页资金流转补足

变更类型：视觉体验

核心变化：左侧新增资金托管、结果放款和争议冻结说明，右侧新增下单前校验摘要，并把预算拆分与右侧任务托管单联动；右侧托管预览继续保持紧凑。

影响范围：
- `index.html`
- `styles/main.css`
- `scripts/app.js`
- `docs/current-status.md`
- `docs/project-explanation.md`
- `docs/page-structure-decision.md`
- `docs/change-log.md`

后续注意：首页后续如果继续新增字段或风控项，要同步检查左右栏底部节奏；不能只靠拉长角色卡片填空，新增内容必须解释交易安全或用户决策。

## 2026-05-27

### 容量风控来源优先级明确

变更类型：后端对接

核心变化：前端会优先使用后端返回的 `lockedCapacity` 和 `availableEscrowLimit`；后端未提供这些字段时，才根据当前任务列表本地推算 Agent 容量占用。

影响范围：
- `scripts/app.js`
- `docs/change-log.md`
- `docs/api-contract.md`
- `docs/transaction-safety.md`
- `docs/frontend-backend-boundary.md`

后续注意：真实后端接入后，容量、质押、冻结资金和实时接单状态必须以后端风控结果为准，前端推算只能作为静态演示兜底。

### Agent 活跃容量占用加入

变更类型：交易风控

核心变化：Agent 市场、托管预览和本地 mock API 会按未完成任务占用后的剩余可承接额度判断是否还能接新任务；`MATCHED`、`FUNDED`、`IN_PROGRESS`、`SUBMITTED`、`DISPUTED` 都会占用容量，最终结算、退款或取消后释放。

影响范围：
- `scripts/app.js`
- `server.py`
- `docs/current-status.md`
- `docs/change-log.md`
- `docs/project-explanation.md`
- `docs/transaction-safety.md`
- `docs/api-contract.md`

后续注意：真实后端接入后，容量占用应来自服务端实时风控和资金锁定数据；前端只能展示和提前提示，不能作为最终准入依据。

### 手选执行方案硬校验加入

变更类型：交易准入

核心变化：用户手动选择 Agent 后，发布任务前会硬校验所有权、剩余可承接额度和总质押覆盖；不满足时前端不会继续提交托管方案，本地 mock 创建任务也复用同一套判断。

影响范围：
- `scripts/app.js`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实后端接入后，前端校验只作为下单前提示，最终准入仍必须以服务端状态机和实时资金/质押数据为准。

### 浅色模式选中态高对比收口

变更类型：视觉体验

核心变化：浅色模式统一修正主按钮、角色切换、筛选按钮、任务状态筛选和导航高亮的选中/点击态，并处理浅色底色规则覆盖 active 样式的问题。

影响范围：
- `styles/main.css`
- `scripts/app.js`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：新增按钮、筛选器或标签页时，要同时检查浅色模式下的默认态、悬浮态、点击态和选中态；浅色主题的基础按钮样式权重较高，active 样式要用同等或更高权重兜住。

### Agent 卡片适配检查加入

变更类型：Agent 市场

核心变化：Agent 卡片新增当前任务适配检查，逐项显示类型、所有权、承接上限和质押覆盖是否通过。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实后端接入后，卡片上的适配检查应展示后端风控解释，而不是只由前端根据静态字段推断。

### 适配当前任务筛选加入

变更类型：Agent 市场

核心变化：Agent 市场新增“适配当前任务”筛选，会同时检查任务类型、当前预算、所有权校验、承接上限和质押覆盖。

影响范围：
- `index.html`
- `scripts/app.js`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实后端接入后，适配判断应升级为后端推荐和风控结果，包含实时容量、历史争议、冻结质押、账号权限和任务材料完整度。

### 按当前预算筛选 Agent

变更类型：Agent 市场

核心变化：Agent 市场新增“可承接当前预算”筛选，会读取首页任务预算，只展示单任务承接上限足够的 Agent，并同步刷新可信供给池概览。

影响范围：
- `index.html`
- `scripts/app.js`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实后端接入后，承接能力不应只看静态上限，还应结合 Agent 当前并发任务、冻结质押、争议风险和账号权限。

### Agent 所有权筛选加入

变更类型：Agent 市场

核心变化：Agent 市场新增所有权状态筛选，支持按全部、已校验和待复核查看供给，并同步刷新可信供给池概览。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实后端接入后，这个筛选应优先使用后端返回的所有权校验状态和审核权限，前端不应自行判断可托管资格。

### Agent 市场安全概览加入

变更类型：Agent 市场

核心变化：Agent 市场新增可信供给池概览，汇总当前筛选结果的所有权校验数量、总质押、承接上限、平均声誉和已选执行方案容量。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实后端接入后，市场安全概览中的所有权、质押、承接上限和声誉应由后端返回可信计算结果，前端只负责展示和筛选。

### 当前身份待处理队列加入

变更类型：任务工作台

核心变化：任务托管页新增当前身份行动队列，会按用户、Agent 创作者、仲裁员或平台系统身份汇总待处理交易，展示下一步动作，并提供进入交易档案的入口。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：当前队列基于前端状态和 mock API 状态机判断。真实后端接入后，应由后端返回“当前登录账号可处理的动作”，避免前端自行推断权限。

### 首页角色入口与首屏空白修正

变更类型：信息架构

核心变化：首页新增用户下任务、选择 Agent、创作者经营和交易保障四条入口，点击入口会同步切换体验身份并进入对应页面；同时把任务生命周期和角色入口放入首页左侧内容栈，修正右侧任务表单过长时首页左栏出现大面积空白的问题。

影响范围：
- `index.html`
- `styles/main.css`
- `scripts/app.js`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：首页只负责快速解释平台和分流角色，差异较大的功能继续进入独立页面；后续视觉打磨应优先检查首屏左右两栏在桌面和手机端是否还有空白、挤压、身份错位或文字溢出。

### API 合约验证脚本加入

变更类型：前后端边界

核心变化：新增 `tools/verify-api-contract.js`，拿到真实后端地址后可以直接检查 `/api/health`、Agent 列表、任务列表、任务详情、就绪状态、创作者经营台和提现队列是否符合当前前端原型需要。

影响范围：
- `tools/verify-api-contract.js`
- `README.md`
- `docs/api-contract.md`
- `docs/backend-handoff-checklist.md`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：这个脚本只做基础 smoke/schema 检查，不替代真实鉴权、资金托管、文件上传、仲裁权限和支付出账测试。接真实后端时，失败项要先修，警告项要进入上线前清单。

### 后端契约指纹成为任务事实

变更类型：交易安全

核心变化：mock 后端开始按任务编号、验收标准、预算、挑战窗口、执行 Agent 和托管分账生成 `contractFingerprint`，并在任务响应、结算凭证和退款凭证中返回。

影响范围：
- `server.py`
- `docs/api-contract.md`
- `docs/data-model.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：真实后端应把这层升级为不可变契约版本或哈希，并在托管、接单、提交证据、验收、仲裁和资金流水中使用同一份契约引用。

### 真实后端接入就绪面板加入

变更类型：前后端边界

核心变化：交易保障区新增真实后端接入就绪面板，把 API 连接、账号鉴权、任务状态机、资金出账、证据上传、签名凭证、争议仲裁和提现结算分成真实可用、演示可跑和待后端补齐三类状态。

补充变化：mock API 新增 `/api/readiness` 能力接口；前端会优先读取后端返回的能力清单，接口缺失时再退回本地推断。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/api-contract.md`
- `docs/backend-handoff-checklist.md`
- `docs/current-status.md`
- `docs/frontend-backend-boundary.md`
- `docs/project-explanation.md`
- `docs/change-log.md`

后续注意：这个面板不是生产监控，只是前端原型里的后端接入提醒。真实上线前，后端需要返回更明确的环境、鉴权、资金、上传、仲裁和提现能力状态。

### Agent 资产档案页加入

变更类型：创作者资产

核心变化：Agent 详情从市场弹窗升级为可直达的资产档案页，点击 Agent 卡片会进入独立 Agent 档案视图，并通过 Agent 编号 hash 保留当前资产上下文。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/project-explanation.md`
- `docs/page-structure-decision.md`
- `docs/change-log.md`

后续注意：当前仍然是单前端 hash 视图；真实产品阶段可以升级为 `/agents/:id` 路由，并由后端返回 Agent 所有权、服务边界、质押、收入、容量和任务履历。

### 任务交易档案页加入

变更类型：信息架构

核心变化：任务详情从单纯弹窗升级为可直达的页面式交易档案，点击任务里的“查看详情”会进入独立任务档案视图，并通过任务编号 hash 保留当前交易上下文。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/project-explanation.md`
- `docs/page-structure-decision.md`
- `docs/change-log.md`

后续注意：当前仍然是单个前端工程内的 hash 视图；真实产品阶段可以继续升级为 `/tasks/:id` 路由，并让后端按任务编号返回完整交易档案。

### 任务契约指纹加入

变更类型：交易追踪

核心变化：结果契约卡、预算托管确认、Agent 接单承诺、用户验收放款和结算/退款凭证统一展示同一个任务契约指纹，用于标识本次任务对应的验收标准、预算、挑战窗口和执行 Agent。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/project-explanation.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：当前契约指纹是前端和 mock 服务里的演示型指纹。真实版本应由后端生成不可变契约版本或哈希，并和用户托管签名、Agent 接单签名、交付证据、仲裁裁决和资金流水绑定。

### 用户验收放款确认加入

变更类型：验收结算

核心变化：用户点击“验收并结算”后会先进入放款确认清单，确认交付满足契约、证据已核对、不发起争议并释放托管分账，再推进到 `SETTLED` 状态。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/project-explanation.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：真实版本应把验收确认作为可签名放款凭证，并和交付证据、验收契约版本、资金流水、创作者分账和用户争议放弃状态绑定。

### Agent 接单承诺清单加入

变更类型：创作者责任

核心变化：Agent 创作者点击“Agent 接单执行”后会先进入承诺清单，确认服务边界、结果契约、交付证据和声誉风险，再推进到 `IN_PROGRESS` 状态。

影响范围：
- `scripts/app.js`
- `server.py`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/project-explanation.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：真实版本应把接单承诺做成可签名凭证，并和 Agent 所有权证明、服务边界版本、任务契约、交付证据要求和质押风险绑定。

### 预算托管确认清单加入

变更类型：托管安全

核心变化：用户点击“确认并托管”后会先进入确认清单，逐项确认结果契约、执行 Agent 所有权、预算进入托管、协议费和创作者池，再推进到 `FUNDED` 状态。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/project-explanation.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：真实版本应把这些确认项替换为可签名的托管确认凭证，并和支付通道流水、钱包签名、任务契约版本、Agent 接单承诺绑定。

### 结果契约卡加入

变更类型：按结果付费

核心变化：任务发布预览、任务卡片和交易详情统一展示结果契约，包含验收标准、挑战窗口、放款条件、争议条件和平台边界。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/project-explanation.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：真实版本应把结果契约作为后端持久化对象，和任务编号、预算托管、证据包、用户签名、Agent 接单签名绑定，避免前端展示和后端结算口径不一致。

### 仲裁裁决理由表单加入

变更类型：争议仲裁

核心变化：仲裁员处理争议时不能再只点击“支持 Agent”或“支持用户”，需要先填写裁决理由和证据核对说明；结算或退款凭证会展示仲裁裁决依据和裁决编号。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/project-explanation.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：真实版本应继续补齐仲裁员身份认证、裁决附件上传、二次申诉期限、裁决结果不可篡改存证和后端权限校验。

### Agent 入驻预检加入

变更类型：创作者准入

核心变化：创作者入驻表单新增实时预检，提交前展示所有权证明类型、能力说明、服务边界、质押覆盖、承接上限和是否可进入可信匹配池。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`
- `docs/project-explanation.md`

后续注意：当前预检是前端演示口径；真实后端接入后，所有权、质押和风控准入应由后端返回最终判断。

### Agent 执行方案栏加入

变更类型：Agent 市场

核心变化：Agent 市场新增执行方案栏，用户可直接在卡片上把已校验 Agent 加入方案，并查看已选 Agent 的所有权校验、承接上限和质押覆盖；选择结果会同步到首页任务托管单。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`
- `docs/project-explanation.md`

后续注意：真实产品阶段可继续升级为多 Agent 对比、报价拆分、组合推荐和后端风控报价接口。

### 任务托管页状态筛选加入

变更类型：任务工作台

核心变化：任务托管页新增交易概览和状态筛选，可按全部、当前身份待处理、进行中、待验收、争议中和已完成查看任务，同时展示托管中资金、争议数量和已结算创作者池。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`
- `docs/project-explanation.md`

后续注意：真实后端接入后，任务筛选可以继续升级为服务端分页、搜索和多条件过滤，避免任务量变大后前端一次性加载过多数据。

### 长页面改为页面式视图

变更类型：信息架构

核心变化：保留单个前端工程，但把首页、Agent 市场、任务托管、仲裁中心、收益台账、迭代日志、交易保障和创作者入口切成页面式视图，顶部导航切换视图而不是让用户在所有模块之间长距离滚动。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`
- `docs/project-explanation.md`

后续注意：这一步没有拆成多个 HTML 文件，也没有改变后端接口；真实产品阶段可以继续演进为独立路由或多页面应用。

### 交易安全总览加入

变更类型：交易安全

核心变化：交易保障区新增动态安全总览，根据当前 Agent 和任务数据汇总所有权校验、托管中资金、已结算创作者池、交付证据覆盖、审计链覆盖、退款闭环以及待复核 Agent、待裁决争议和证据缺口。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`
- `docs/project-explanation.md`
- `docs/transaction-safety.md`

后续注意：当前覆盖度是前端演示指标，用于帮助用户理解平台保障层；接入真实后端后，应由后端返回经过风控和审计口径确认的安全指标。

### 运行环境状态栏加入

变更类型：交付边界

核心变化：页面顶部新增运行环境状态栏，根据 `apiMode` 和 `/api/health` 探测结果显示静态演示、本地 mock API、真实后端已连接或 API 必连失败，帮助演示者判断交易状态来源。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`
- `docs/frontend-backend-boundary.md`
- `docs/project-explanation.md`
- `docs/deployment-guide.md`

后续注意：对外演示真实交易时应把 `apiMode` 设为 `required`，并确认状态栏显示真实后端连接成功，避免误用本地演示数据。

### 结算和退款凭证增强

变更类型：交易安全

核心变化：任务交易档案里的结算/退款凭证从单纯金额展示升级为可解释凭证，增加触发原因、托管预算、协议费、创作者收入池、证据数量、分账公式和关联资金流水编号，让用户和创作者都能看懂钱为什么释放或退回。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实版本应把这些凭证字段与支付通道流水、链上交易哈希、仲裁裁决编号和钱包签名绑定，前端只展示后端返回的可信凭证。

### 任务详情操作链路增强

变更类型：交易体验

核心变化：交付证据提交台和用户争议提交台新增顶部返回交易档案入口，并在任务详情、提交证据、发起争议之间切换时自动回到弹窗顶部，减少手机端长表单里的迷路感。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实版本接入文件上传和钱包签名后，仍应保持交易档案作为中心视图，所有证据、签名和资金动作都能返回同一个任务上下文。

### 移动端交易组件防溢出补强

变更类型：视觉体验

核心变化：任务详情弹窗、Agent 资产档案、证据提交台、资金流水、签名凭证和创作者经营台补充窄屏防溢出规则，长交易编号、证据地址、签名 ID、资产履历和提现审核文本在手机端会换行显示，底部操作按钮改为单列排列。

影响范围：
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：后续如果加入真实文件名、钱包地址、链上交易哈希或更长 DID，要继续用手机端检查弹窗内部是否仍然可读。

### 移动端首屏可读性修复

变更类型：视觉体验

核心变化：针对手机宽度下首屏横向挤压问题，收紧主标题、平台关键词、行动按钮、指标卡和任务托管单内容宽度，让标题与输入区在窄屏下正常换行，不再被裁切。

影响范围：
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：继续视觉打磨时，应优先用手机截图检查首屏、任务详情弹窗、证据提交台和创作者经营台，避免只按桌面端观感判断。

### 项目整体说明文档补齐

变更类型：交接管理

核心变化：新增项目整体说明文档，用更直观的方式解释产品定位、前端和后端关系、本地网页与公网部署区别、当前已完成内容、真实后端依赖和后续推进顺序。

影响范围：
- `README.md`
- `docs/project-explanation.md`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：这份文档适合给非技术成员、后端团队或临时接手的人先看；接口字段和状态机仍以专题文档为准。

### 已校验 Agent 才能进入托管方案

变更类型：准入风控

核心变化：任务自动推荐、手动选择和 mock API 创建任务都加入所有权准入门槛，未通过所有权校验的 Agent 不能进入托管执行方案。

影响范围：
- `server.py`
- `scripts/app.js`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/transaction-safety.md`
- `docs/backend-handoff-checklist.md`
- `docs/change-log.md`

后续注意：真实版本应把这条规则放在后端和合约/支付前置校验里，前端提示只能作为体验层辅助。

### 托管资金流水加入

变更类型：资金安全

核心变化：任务交易档案新增资金流水，mock API 新增 `escrow_events` 表，记录用户托管、平台协议费、创作者分账和用户退款，并返回演示交易编号。

影响范围：
- `server.py`
- `scripts/app.js`
- `styles/main.css`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/transaction-safety.md`
- `docs/data-model.md`
- `docs/change-log.md`

后续注意：当前交易编号是本地演示哈希；真实版本应替换为支付通道流水、链上交易哈希、合约事件或银行出账编号。

### Agent 所有权复核接入

变更类型：所有权安全

核心变化：Agent 所有权证明从自动展示升级为可审核流程，mock API 新增平台通过/拒绝接口，前端在 Agent 资产档案中提供平台复核操作，并保存复核签名。

影响范围：
- `server.py`
- `scripts/app.js`
- `styles/main.css`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/transaction-safety.md`
- `docs/data-model.md`
- `docs/change-log.md`

后续注意：真实版本应接 DID、Agent NFT、模型哈希、仓库签名或人工审核系统；平台只复核所有权证明，不应接管创作者的 Agent 模型和资产。

### 用户争议证据提交台加入

变更类型：争议仲裁

核心变化：用户点击发起争议时不再直接使用默认理由，而是先进入争议证据提交台，填写争议理由、证据名称、文件或任务契约引用，并为每条证据生成演示哈希后再提交给状态机和仲裁中心。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：真实版本应接入真实文件上传、证据存证、仲裁理由、附件预览、申诉时限和裁决依据；后端必须继续拒绝无理由或无证据的争议。

### 提现审核接入 mock API

变更类型：出账安全

核心变化：创作者提现从前端内存队列升级为 mock API 持久化流程，新增提现查询、发起、批准和拒绝接口；后端会校验可提现余额、锁定审核中金额，并保存创作者申请签名和平台审核签名。

影响范围：
- `server.py`
- `scripts/app.js`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/backend-handoff-checklist.md`
- `docs/change-log.md`

后续注意：当前仍不做真实出账，只模拟出账审核状态；真实版本需要对接钱包地址、支付通道、链上转账、KYC/风控、争议冻结和出账流水。

### Agent 交付证据提交台加入

变更类型：交付验收

核心变化：Agent 点击提交交付物时不再直接一键流转，而是先进入交付证据提交台，填写交付摘要、证据名称、文件或审计引用，并为每条证据生成演示哈希后再进入待验收。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：当前只保存证据元数据和演示哈希，不上传真实文件；真实版本需要接文件服务、加密存储、TEE/zkML 日志、链上哈希或第三方存证。

### 任务托管方案预览加入

变更类型：托管体验

核心变化：任务发布表单新增实时托管预览，展示预算、协议费、创作者池、验证方式、推荐或手选 Agent、承接上限、质押覆盖和风控检查。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实版本应由后端返回最终报价、匹配权重、风控拒绝原因和托管合约参数，前端只展示预览和确认入口。

### 创作者提现审核队列加入

变更类型：结算出账

核心变化：创作者经营台新增提现请求入口，创作者可对可提现余额发起签名提现，平台身份可审核批准或拒绝，提现金额会从可提现池锁定并进入审核队列。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/backend-handoff-checklist.md`
- `docs/change-log.md`

后续注意：当前提现是前端演示队列，真实版本应由后端校验结算流水、争议冻结、钱包地址、KYC/风控和真实支付状态。

### Agent 资产档案升级

变更类型：供给侧资产

核心变化：Agent 详情从基础介绍升级为资产档案，展示所有权、服务边界、经济参数、已结算收入、待结算收入、争议中收入、承接容量和任务履历。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实版本应由后端返回 Agent 收益、任务履历、容量占用和争议风险，前端不应自行推断真实资金状态。

### 任务详情交易档案加入

变更类型：交易体验

核心变化：任务卡片和仲裁中心新增查看详情入口，集中展示验收契约、执行 Agent、托管分账、风控检查、交付/争议证据、操作签名、结算凭证和审计链。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实版本可以把这个弹窗升级为独立任务详情页，并接入真实文件预览、钱包签名明细和链上托管交易哈希。

### 对外演示部署说明补齐

变更类型：交付边界

核心变化：新增对外演示和部署说明，明确纯静态演示、本地 mock API 演示、公网静态网页加真实后端三种路径，并补充上线前配置检查。

影响范围：
- `README.md`
- `docs/deployment-guide.md`
- `docs/frontend-backend-boundary.md`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实后端接口稳定后，应把 `scripts/config.js` 的 `apiMode` 设为 `required`，避免对外演示时误退回本地假数据。

### 关键操作签名审计加入

变更类型：交易安全

核心变化：托管、取消、接单、提交、验收、争议、仲裁和自动结算都开始携带操作签名凭证；mock API 会校验签名里的角色、动作和任务编号，并把签名编号写入交易审计记录。

影响范围：
- `server.py`
- `scripts/app.js`
- `docs/api-contract.md`
- `docs/transaction-safety.md`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：当前签名仍是演示凭证，真实版本应替换为钱包签名、DID 签名、服务端会话签名或合约事件校验。

### 顶部导航轻量化

变更类型：视觉体验

核心变化：顶部栏拆成品牌、导航、操作三区；品牌加入短副标题，导航改为轻量文字和细下划线高亮，右侧身份/主题/钱包操作收紧，并修复浅色模式下一批浅色文字对比度不足的问题。

影响范围：
- `index.html`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：继续视觉打磨时优先保证年轻用户第一眼看起来清爽、可信，不要把过多状态信息堆到顶部栏。

### Agent 所有权校验状态加入

变更类型：供给侧可信

核心变化：Agent API 新增 `ownershipStatus` 计算字段，前端在市场卡片、详情弹窗、托管前风控和创作者经营台展示所有权校验状态；DID、Agent NFT、模型承诺哈希和代码仓库签名会标记为已校验，其他证明进入人工复核。

影响范围：
- `server.py`
- `scripts/app.js`
- `styles/main.css`
- `docs/api-contract.md`
- `docs/data-model.md`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实版本应由后端或链上校验服务生成所有权状态，前端只展示结果，不能自行认定 Agent 归属。

### 浅色简约主题与深色切换加入

变更类型：视觉体验

核心变化：页面默认改为浅色简约风格，并在顶部加入深浅色切换；用户选择会保存到本地，保留原深色模式作为可选视觉。

影响范围：
- `index.html`
- `styles/main.css`
- `scripts/app.js`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：继续做视觉打磨时，默认以浅色简约、信息清楚、年轻但不花哨为主；深色模式作为偏沉浸的备选。

### 创作者经营台 API 加入

变更类型：后端对接

核心变化：mock API 新增 `GET /api/creators`，返回创作者经营台需要的聚合数据；前端在 API 可用时优先使用后端聚合结果，接口不可用时退回本地聚合。

影响范围：
- `server.py`
- `scripts/app.js`
- `docs/api-contract.md`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实后端应把这个接口接入钱包、提现、收入流水、质押锁定和 Agent 归属校验，避免前端自行推断资金状态。

### 创作者经营台加入

变更类型：创作者经营

核心变化：新增创作者经营台，按创作者汇总 Agent 数量、已结算收益、待结算收入、争议中收入、质押规模、平均声誉和成功率。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：真实版本需要接入创作者钱包、提现状态、收入流水、质押解锁期和 Agent 所有权校验结果；平台仍只提供交易和结算基础设施，不生产或接管 Agent。

### 仲裁中心加入

变更类型：争议仲裁

核心变化：新增独立仲裁中心，集中展示争议任务的验收契约、Agent 交付证据、用户争议证据、托管金额和裁决入口；mock API 默认种子数据新增一笔争议任务用于演示。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/current-status.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：真实版本应增加仲裁员身份认证、裁决理由填写、裁决附件、仲裁时限、二次申诉和裁决结果不可篡改存证。

### 托管前风控检查加入

变更类型：风控规则

核心变化：任务卡片新增托管前风控检查，展示 Agent 承接上限、质押覆盖、所有权证明、验收契约和证据状态；mock API 创建任务时会拒绝超过匹配 Agent 总承接上限或质押覆盖不足的高风险方案。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/current-status.md`
- `docs/transaction-safety.md`
- `docs/api-contract.md`
- `docs/data-model.md`
- `docs/change-log.md`

后续注意：真实版本应把风控阈值做成后端策略，而不是写死在前端；拒绝原因需要返回给用户，帮助其降低预算、换 Agent 或追加担保。

### 任务交易审计链前台化

变更类型：交易安全

核心变化：任务卡片不再只展示最近几条简写历史，而是展示完整交易审计链；每条记录包含操作角色、时间、资金/证据/结算摘要和前端生成的审计编号。

影响范围：
- `scripts/app.js`
- `styles/main.css`
- `docs/current-status.md`
- `docs/transaction-safety.md`
- `docs/change-log.md`

后续注意：当前审计编号用于产品演示。真实版本应由后端、合约事件或不可篡改日志服务生成，并与资金流水、证据哈希和身份签名关联。

### 创作者收益台账与重点迭代日志加入

变更类型：可解释性与交接管理

核心变化：页面新增“收益台账”，按已结算任务汇总创作者收入、平台协议费、争议退款金额和 Agent 分账；同时新增“迭代日志”区块，只展示影响产品方向、交易流程、接口边界、视觉定位和交付判断的重点变化。

影响范围：
- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/current-status.md`
- `docs/change-log.md`

后续注意：日志不要写成提交流水账。只有当变化会影响对外讲法、真实后端对接、交易状态、收益结算、风控可信度或用户体验判断时，才追加到这里。

### 产品方向重塑

变更类型：产品定位

核心变化：项目从原来的“AI 商品/资源商城展示页”，调整为“AI Agent 任务交易平台原型”。

影响范围：

- 首页主张
- 任务发布入口
- Agent 市场
- 交易状态表达
- 创作者入驻路径

后续注意：对外表达时不要说平台自己生产 Agent，当前定位是连接任务方和 Agent 创作者，并提供托管、验收、争议和结算安全。

### 交易流程原型落地

变更类型：业务流程

核心变化：前端增加了从任务发布、预算托管、Agent 执行、提交交付、用户验收、争议处理到结算/退款的完整演示链路。

影响范围：

- `index.html`
- `scripts/app.js`
- `docs/transaction-safety.md`
- `docs/api-contract.md`

后续注意：真实后端接入时，需要严格保持状态机约束，不能允许跳过托管、越权验收、重复结算等高风险操作。

### 交易安全能力前台化

变更类型：前端表达

核心变化：在“交易保障”模块中增加 Safety Ledger 安全中枢，明确展示规则锁定、资金隔离、证据留痕和结果分账。

影响范围：

- `index.html`
- `styles/main.css`

后续注意：后续接入真实后端后，这个区域可以进一步展示真实任务的资金状态、证据包、仲裁节点和结算哈希。

### 任务操作角色权限加入

变更类型：交易安全

核心变化：前端增加用户、Agent 创作者、仲裁员三种体验身份，任务按钮按身份启用；mock API 对任务状态流转增加角色校验，错误身份返回 `403`。

影响范围：

- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/transaction-safety.md`
- `docs/api-contract.md`
- `docs/current-status.md`

后续注意：真实后端不能信任前端传入的 `actor` 字段，应改用登录态、钱包签名、DID 或服务端会话判断操作权限。

### 创作者收益结算凭证加入

变更类型：结算透明度

核心变化：任务完成或仲裁支持 Agent 时展示结算凭证，包含平台协议费、创作者收益池和 Agent 分账；仲裁支持用户时展示退款凭证和扣罚建议。

影响范围：

- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/api-contract.md`
- `docs/transaction-safety.md`
- `docs/data-model.md`
- `docs/current-status.md`

后续注意：真实后端接入资金或合约后，应把结算凭证升级为可追踪的支付流水、合约交易哈希或链下审计编号。

### Agent 声誉由任务结果驱动

变更类型：市场质量机制

核心变化：任务进入结算或退款最终状态后，mock API 和本地演示会回写 Agent 成交数、声誉、成功率和质押风险，并在结算凭证中展示声誉事件。

影响范围：

- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/api-contract.md`
- `docs/transaction-safety.md`
- `docs/data-model.md`
- `docs/current-status.md`

后续注意：真实版本需要把这套规则升级为可解释、可申诉、可审计的声誉模型，避免单次恶意争议过度伤害创作者。

### 交付与争议证据包加入

变更类型：仲裁与审计

核心变化：Agent 提交交付物时需要附带证据包元数据，用户发起争议时可附带争议证据；前端会展示证据引用，mock API 会持久化证据元数据。

影响范围：

- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/api-contract.md`
- `docs/transaction-safety.md`
- `docs/data-model.md`
- `docs/current-status.md`

后续注意：真实版本需要接入文件上传、加密存储、访问权限、证据哈希和仲裁可见性规则。

### 挑战窗口自动结算加入

变更类型：托管结算

核心变化：前端新增平台系统体验身份和“窗口结束自动结算”动作；mock API 增加 `auto-settle`，会校验挑战窗口是否已结束，未结束时返回 `409`。

影响范围：

- `index.html`
- `scripts/app.js`
- `styles/main.css`
- `server.py`
- `docs/api-contract.md`
- `docs/transaction-safety.md`
- `docs/current-status.md`

后续注意：真实版本应由定时任务、合约事件或队列任务触发自动结算，前端不应直接扮演平台系统。

### 按结果付费字段打通

变更类型：交易契约

核心变化：任务创建新增结果验收标准和挑战窗口，前端、mock API、SQLite 数据模型和 API 契约都已同步。

影响范围：

- `index.html`
- `scripts/app.js`
- `server.py`
- `docs/api-contract.md`
- `docs/data-model.md`

后续注意：真实后端需要把这两个字段作为任务契约的一部分保存，后续验收、争议和自动结算都应以它们为依据。

### 本地 mock API 建立

变更类型：开发支撑

核心变化：新增 `server.py`，用于本地演示静态页面和模拟 API，并使用 SQLite 保存 Agent、任务和任务历史。

影响范围：

- `server.py`
- `data/qianzhi.sqlite3`
- `docs/data-model.md`

后续注意：这个服务只是前端开发和产品演示用，不等于真实业务后端；涉及登录、支付、链上合约、真实资金和风控的能力仍需要正式后端提供。

### 前后端边界明确

变更类型：交接规范

核心变化：新增配置文件和接口文档，让前端可以在静态演示、本地 mock API、真实业务后端之间切换。

影响范围：

- `scripts/config.js`
- `docs/frontend-backend-boundary.md`
- `docs/api-contract.md`
- `docs/backend-handoff-checklist.md`

后续注意：如果后端团队已经完成真实服务，优先向对方索要 API Base URL、接口文档、鉴权方式、测试账号、CORS 白名单和字段映射。

### 创作者供给侧入口加入

变更类型：功能模块

核心变化：页面增加了创作者注册 Agent 的入口，前端和 mock API 都支持新增 Agent，并做了基础字段校验。

影响范围：

- `index.html`
- `scripts/app.js`
- `server.py`

后续注意：真实版本需要补充创作者身份认证、Agent 所有权证明、质押凭证、审核状态和违规处理。

### Agent 所有权元数据打通

变更类型：供给侧契约

核心变化：Agent 入驻新增所有权证明和服务边界，前端、mock API、SQLite 数据模型和 API 契约都已同步。

影响范围：

- `index.html`
- `scripts/app.js`
- `server.py`
- `docs/api-contract.md`
- `docs/data-model.md`
- `docs/current-status.md`
- `docs/backend-handoff-checklist.md`

后续注意：真实后端需要把所有权证明升级为可校验凭证，例如 Agent NFT、DID 签名、模型承诺哈希或代码仓库签名；平台仍不应接管模型权重。

### 年轻化视觉方向调整

变更类型：视觉设计

核心变化：整体视觉从传统深蓝科技展示页，调整为更适合年轻用户的黑曜底、多色高亮、任务市场感和创作者经济氛围。

影响范围：

- `styles/main.css`
- `index.html`

后续注意：后续继续打磨时，应保持“年轻、可信、有交易感”，避免变成过度严肃的企业后台，也不要做成只有炫酷但看不清操作的展示页。

### 项目交接文档补齐

变更类型：文档体系

核心变化：新增并整理当前状态、交易安全、数据模型、前后端边界、API 契约和后端交接清单。

影响范围：

- `README.md`
- `docs/current-status.md`
- `docs/transaction-safety.md`
- `docs/data-model.md`
- `docs/frontend-backend-boundary.md`
- `docs/api-contract.md`
- `docs/backend-handoff-checklist.md`

后续注意：后面有重大变化时，先更新对应专题文档，再在本日志记录一句“关键变化和影响”。
