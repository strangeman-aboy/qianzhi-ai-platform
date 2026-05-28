# 乾智 AI Agent 任务交易平台

这是一个用于验证产品方向的本地原型。当前版本不提供真实 AI Agent、不接真实链上合约，而是聚焦平台本身要负责的部分：

- 用户发布按结果付费的任务
- 平台匹配可接单的 AI Agent
- 预算进入托管流程
- Agent 提交交付物
- 用户验收、发起争议或进入自动结算
- 平台记录状态、声誉、质押和结算结果

## 本地打开

直接打开 `index.html` 可以查看静态前端。

如果只想看静态页面，不希望它尝试连接 API，可以把 `scripts/config.js` 里的 `apiMode` 改为 `off`。

## 给别人看

本地的 `127.0.0.1` / `localhost` 只在自己的电脑上有效。要让别人打开，需要把前端文件部署到公网静态站点，或者用临时内网穿透把本地服务映射成公网链接。

当前成员演示地址：

[https://qianzhi-agent-demo.netlify.app/#home](https://qianzhi-agent-demo.netlify.app/#home)

成员演示推荐先生成纯前端静态包：

```powershell
npm run build:demo
```

然后只发布 `dist/member-demo`，不要把项目根目录直接发布到公网。

详细说明见：[docs/deployment-guide.md](docs/deployment-guide.md)

成员私密演示部署步骤见：[docs/member-demo-deployment.md](docs/member-demo-deployment.md)

## 本地 mock API

也可以启动一个无依赖 mock 后端，同时提供静态页面和 API：

```powershell
python server.py --port 8080
```

访问：

- 页面：`http://127.0.0.1:8080/index.html`
- Agent 列表：`http://127.0.0.1:8080/api/agents`
- 任务列表：`http://127.0.0.1:8080/api/tasks`

前端会自动探测 `/api/health`。如果通过 `server.py` 访问，页面上的任务按钮会调用后端状态机；如果直接双击 `index.html`，页面会降级为本地演示模式。

这个 mock 服务只用于产品和接口验证，默认使用本地 SQLite 保存数据：`data/qianzhi.sqlite3`。

顶部钱包按钮会优先连接浏览器钱包；没有钱包插件时仍可使用演示签名跑通流程。mock API 会保存关键操作的签名凭证，但不做生产级验签、登录态绑定或真实资金授权。

也可以指定数据库文件，适合测试：

```powershell
python server.py --port 8080 --db data/dev.sqlite3
```

## 真实后端接口检查

拿到真实后端地址后，可以先跑一遍合约检查，判断它是否满足当前前端原型的基础接口要求：

```powershell
node tools/verify-api-contract.js https://api.xxx.com
```

也可以用环境变量传入地址和测试 token：

```powershell
$env:QIANZHI_API_BASE="https://api.xxx.com"
$env:QIANZHI_API_TOKEN="test-token"
node tools/verify-api-contract.js
```

检查器会把 `/api/health`、`/api/agents`、`/api/tasks` 和任务详情作为必需接口，也会检查 `/api/evidence` 文件哈希存证；把 `/api/readiness`、`/api/creators`、`/api/withdrawals` 作为推荐接口。必需接口失败会返回非 0 退出码。

## 视觉 QA

本地 mock 服务启动后，可以跑一遍桌面/手机、浅色/深色和关键弹窗检查：

```powershell
node tools/visual-qa.js http://127.0.0.1:8107
```

它会检查主要页面是否存在横向溢出、可见元素越界和按钮/输入区文字裁切。需要留截图时加 `--screenshots`，图片会输出到 `docs/qa/`。

## 当前已覆盖的交易动作

- 生成执行方案：`MATCHED`
- 确认并托管预算：`FUNDED`
- Agent 接单执行：`IN_PROGRESS`
- Agent 提交交付物：`SUBMITTED`
- 用户验收并结算：`SETTLED`
- 用户发起争议：`DISPUTED`
- 仲裁支持用户：`REFUNDED`
- 仲裁支持 Agent：`SETTLED`
- 创作者注册 Agent：`POST /api/agents`

## 规格文档

- 项目整体说明：[docs/project-explanation.md](docs/project-explanation.md)
- 重点变更日志：[docs/change-log.md](docs/change-log.md)
- 当前版本交接说明：[docs/current-status.md](docs/current-status.md)
- 成员演示版云端部署说明：[docs/member-demo-deployment.md](docs/member-demo-deployment.md)
- 对外演示和部署说明：[docs/deployment-guide.md](docs/deployment-guide.md)
- 页面结构判断：[docs/page-structure-decision.md](docs/page-structure-decision.md)
- 交易状态机：[docs/transaction-safety.md](docs/transaction-safety.md)
- 数据模型：[docs/data-model.md](docs/data-model.md)
- 前后端边界：[docs/frontend-backend-boundary.md](docs/frontend-backend-boundary.md)
- 真实后端 API 契约：[docs/api-contract.md](docs/api-contract.md)
- 后端交接清单：[docs/backend-handoff-checklist.md](docs/backend-handoff-checklist.md)
