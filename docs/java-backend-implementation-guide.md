# Java 后端实现与联调说明

更新时间：2026-05-30

这份说明给后端同学和项目成员使用。它的目的不是让后端照着页面猜接口，而是把当前项目状态、已完成能力、下一步优先级和前后端联调方式讲清楚。

## 一句话目标

乾智要做的是一个 AI Agent 任务交易平台：

- 平台不生产 Agent。
- 个人创作者拥有自己的专业 Agent。
- 创作者的 Agent 解决通用 AI 难以稳定处理的垂直领域复杂问题。
- 用户发布任务并按结果付费，而不是订阅一个大平台。
- 平台负责匹配、托管、证据、验收、争议、结算和交易安全。
- 平台降低普通人使用 AI 的门槛，让用户只需要说明目标、预算和验收标准。

所以后端的核心不是“存几个用户和工具”，而是实现一套可追踪、可验证、可争议、可结算的任务交易状态机。

## 当前目录

```text
D:\AGENT 平台设计
  ai-platform前端\                前端原型和成员静态演示
  ai-platform后端\                当前 Java Spring Boot 后端
  src\                            早期后端建模草稿，暂不作为当前运行工程
  本地开发工具-JDK和Maven\          本地验证用 JDK 和 Maven
```

当前要联调和继续开发的后端工程是：

```text
D:\AGENT 平台设计\ai-platform后端
```

早期 `D:\AGENT 平台设计\src` 里只有 JPA 实体草稿，不应再作为主工程继续扩展。后续如果要保留其中有价值的字段，可以迁移进 `ai-platform后端`，不要让两个后端目录并行生长。

## 当前后端已具备的能力

`ai-platform后端` 现在已经是一个可以启动的 Spring Boot 工程：

- Java 17
- Spring Boot 3.3.5
- Spring Web
- Spring JDBC
- Bean Validation
- H2 文件数据库
- CORS 配置
- 全局 API 异常处理
- 后端测试

已覆盖接口：

- `GET /api/health`
- `GET /api/readiness`
- `GET /api/agents`
- `POST /api/agents`
- `POST /api/agents/{id}/ownership/{action}`
- `GET /api/tasks`
- `GET /api/tasks/{id}`
- `POST /api/tasks`
- `POST /api/tasks/{id}`
- `POST /api/tasks/{id}/{action}`
- `POST /api/evidence`
- `GET /api/creators`
- `GET /api/withdrawals`
- `POST /api/withdrawals`
- `POST /api/withdrawals/{id}/{action}`

当前后端已经可以支撑前端演示这些关键概念：

- 创作者注册并声明自己拥有 Agent。
- 平台审核 Agent 所有权。
- 用户发布按结果付费的任务。
- 后端匹配可承接的 Agent。
- 预算进入演示级托管流水。
- Agent 接单、提交交付物。
- 用户验收或发起争议。
- 挑战窗口结束后自动结算。
- 平台仲裁争议。
- 创作者查看收益并发起提现。

## 仍然是演示级的部分

当前后端已经比纯前端 mock 更真实，但还不是生产级后端。下面这些能力仍需后续补齐：

- 资金托管和分账目前是 H2 数据库流水，不是真实支付或链上合约。
- 签名目前校验角色、动作、任务编号和签名编号，不做真实钱包验签。
- 文件证据目前只登记哈希和元数据，不保存原文件内容。
- 用户身份、创作者账号、平台管理员账号还没有真实登录系统。
- H2 适合本地演示，后续测试/生产应迁移到 PostgreSQL 或 MySQL。
- 缺少生产级审计日志、权限隔离、限流和异常告警。

## 启动后端

如果电脑已经安装 Java 17+ 和 Maven：

```powershell
cd "D:\AGENT 平台设计\ai-platform后端"
mvn spring-boot:run
```

如果使用项目里的本地开发工具：

```powershell
cd "D:\AGENT 平台设计\ai-platform后端"
$env:JAVA_HOME = (Resolve-Path "..\本地开发工具-JDK和Maven\jdk").Path
$env:Path = "$env:JAVA_HOME\bin;$((Resolve-Path '..\本地开发工具-JDK和Maven\maven\bin').Path);$env:Path"
mvn.cmd spring-boot:run
```

默认后端地址：

```text
http://127.0.0.1:8080
```

健康检查：

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/health
```

预期返回：

```json
{
  "ok": true,
  "service": "qianzhi-api",
  "environment": "local",
  "storage": "h2"
}
```

## 前端联调方式

前端目录：

```text
D:\AGENT 平台设计\ai-platform前端
```

后端启动后，可以先跑接口契约检查：

```powershell
cd "D:\AGENT 平台设计\ai-platform前端"
node tools\verify-api-contract.js http://127.0.0.1:8080
```

这一步会检查健康接口、Agent 列表、任务列表、任务详情、证据存证、状态机非法操作拦截、创作者收益和提现队列。失败时优先看输出里的失败接口和状态码。

再跑前端连接后端的页面联调：

```powershell
npm run build:demo
npm run preview:demo
```

保持预览服务运行，另开一个终端：

```powershell
npm run qa:backend-ui
```

这个 QA 会临时把前端配置指向 `http://127.0.0.1:8080`，确认：

- 首页显示本地 Java 后端已接入。
- Agent 市场能渲染后端返回的 Agent。
- 任务列表显示 API 状态机。
- 交易保障页显示后端就绪能力。

它不会修改 `scripts/config.js`，也不会影响 Netlify 上给成员看的静态演示。

## 前端配置原则

`ai-platform前端\scripts\config.js` 当前默认保持：

```js
apiBase: '',
apiMode: 'off',
environmentName: 'member-demo'
```

这是为了保证 Netlify 成员演示是纯静态页面，不会因为访问不到本机后端而报错。

如果本地要手动连接 Java 后端，可以临时改成：

```js
apiBase: 'http://127.0.0.1:8080',
apiMode: 'required',
environmentName: '本地 Java 后端'
```

提交前要确认是否需要改回静态演示模式。一般建议使用 `npm run qa:backend-ui` 做联调，不直接改 `scripts/config.js`。

## 后端下一步优先级

### 1. 数据库从 H2 迁移到 PostgreSQL 或 MySQL

H2 适合演示，但多人协作和长期测试不稳。建议下一步增加：

- `spring.profiles.active=local`
- `application-local.yml`
- `application-prod.yml`
- PostgreSQL 或 MySQL 连接配置
- Flyway 或 Liquibase 管理表结构

### 2. 拆分当前 QianzhiStore

现在 `QianzhiStore` 把 Agent、Task、Evidence、Creator、Withdrawal 都放在一个类里，适合原型速度，但后续会越来越难维护。

建议拆成：

- `AgentService`
- `TaskService`
- `EvidenceService`
- `CreatorService`
- `WithdrawalService`
- `SignatureService`
- `EscrowService`

拆分时不要改变接口字段，先保证 `tools\verify-api-contract.js` 继续通过。

### 3. 做真实账号与权限

需要明确至少四类角色：

- 用户：发布任务、验收、争议。
- 创作者：注册 Agent、接单、提交交付物、提现。
- 平台：审核所有权、仲裁、审核提现。
- 访客：浏览公开 Agent 和公开任务信息。

接口不能只靠前端传 `actor` 字段判断身份，后续要接登录态、JWT、Session 或钱包签名。

### 4. 做真实钱包签名或登录验签

当前签名是演示字段校验。生产级需要：

- 服务端生成 nonce。
- 前端钱包签名或账号登录。
- 服务端验证签名地址和操作内容。
- 防重放。
- 签名内容包含任务编号、动作、金额、时间和链/平台域名。

### 5. 文件证据上传

现在只存哈希。后续应该增加：

- 文件上传接口。
- 文件大小和类型限制。
- 病毒/恶意文件扫描。
- 访问权限控制。
- 私有对象存储。
- 文件哈希与任务、交付、争议绑定。

### 6. 资金托管与结算

当前托管是数据库流水。后续要选路线：

- 先接传统支付和平台账户分账。
- 或先接链上 USDC/稳定币托管合约。

无论选哪条，后端都要保证：

- 创建任务时锁定预算。
- 验收或挑战窗口结束后才能结算。
- 争议中不能结算。
- 仲裁结果要有证据和理由。
- 提现要有审核和出账回调。

## 修改后必须跑的检查

后端修改后至少跑：

```powershell
cd "D:\AGENT 平台设计\ai-platform后端"
$env:JAVA_HOME = (Resolve-Path "..\本地开发工具-JDK和Maven\jdk").Path
$env:Path = "$env:JAVA_HOME\bin;$((Resolve-Path '..\本地开发工具-JDK和Maven\maven\bin').Path);$env:Path"
mvn.cmd test
```

后端启动后，在前端目录跑：

```powershell
cd "D:\AGENT 平台设计\ai-platform前端"
npm run check:js
node tools\verify-api-contract.js http://127.0.0.1:8080
npm run build:demo
npm run qa:backend-ui
```

只要后端接口字段、状态码或状态机规则变化，这几个检查都应该重新跑。

## 给后端同学的协作提醒

- 不要把 `src` 草稿目录继续当主工程开发。
- 不要改一套和前端契约完全不同的字段名。
- 不要让前端绕过后端状态机直接改任务状态。
- 不要把真实密钥、钱包私钥、支付回调密钥写进代码或 Git。
- 每次改状态机，都要补充非法操作测试，例如错身份、缺签名、过早结算、缺证据争议。
- 演示功能可以先 mock，但交易安全的边界要从一开始就写在后端里。
