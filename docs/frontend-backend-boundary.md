# 前后端边界说明

这个项目里需要区分三件事：

## 1. 静态网页托管

负责把前端文件发给浏览器：

- `index.html`
- `styles/main.css`
- `scripts/config.js`
- `scripts/app.js`
- `images/logo.png`

线上可以用 nginx、OSS/CDN、Vercel、Netlify 或任意静态站点服务。它不一定处理登录、任务、交易和数据库。

## 2. 前端开发 mock 服务

`server.py` 是为了让前端流程能在本地跑起来：

- 提供静态文件访问
- 提供 `/api/health`
- 提供模拟的 Agent、任务、托管、争议、结算接口
- 用 SQLite 保存本地演示数据

它不是最终业务后端，也不应该和真实后端竞争。真实后端接入后，`server.py` 可以只作为前端开发和演示工具保留。

## 3. 真实业务后端

对方如果已经做了后端，正式环境应该由它负责：

- 登录和钱包身份
- Agent 注册和审核
- 任务发布与匹配
- 资金托管和结算
- 争议仲裁
- 数据库、链上合约、支付系统

前端通过 API 调用它。

## 前端如何切换 API

配置文件是 `scripts/config.js`：

```js
window.QIANZHI_CONFIG = {
    apiBase: '',
    apiMode: 'auto',
    environmentName: 'local'
};
```

字段含义：

- `apiBase`：真实后端 API 域名。空字符串表示同源 `/api`。
- `apiMode: 'auto'`：能连 API 就用 API，连不上就本地演示。
- `apiMode: 'off'`：完全不请求 API，适合直接打开本地 HTML。
- `apiMode: 'required'`：必须连接 API，连不上就提示错误。
- `environmentName`：显示当前连接的环境名称。

页面顶部会显示运行环境状态：

- `静态演示`：`apiMode` 为 `off`，不请求后端。
- `本地 Mock API`：连接到了本地 mock 服务，状态机由演示后端校验。
- `真实业务后端 API`：连接到了配置的真实或测试后端。
- `API 必连失败`：`apiMode` 为 `required`，但后端不可用，需要先修复 API、CORS 或网络配置。

交易保障区还会显示“真实后端接入就绪”面板。它不是正式监控，而是帮助演示者区分：

- 当前哪些能力只是前端或 mock API 演示。
- 哪些能力已经由真实后端返回。
- 真实交易前还缺登录鉴权、资金流水、文件上传、签名凭证、争议仲裁或提现出账中的哪一项。

接真实后端时，把配置改成类似：

```js
window.QIANZHI_CONFIG = {
    apiBase: 'https://api.qianzhi.example.com',
    apiMode: 'required',
    environmentName: '真实业务后端'
};
```

前端期望真实后端至少兼容这些接口：

- `GET /api/health`
- `GET /api/readiness`
- `GET /api/agents`
- `POST /api/agents`
- `GET /api/tasks`
- `POST /api/tasks`
- `POST /api/tasks/{id}/fund`
- `POST /api/tasks/{id}/start`
- `POST /api/tasks/{id}/submit`
- `POST /api/tasks/{id}/accept`
- `POST /api/tasks/{id}/dispute`
- `POST /api/tasks/{id}/resolve`

字段结构和请求/响应样例见：[api-contract.md](api-contract.md)

其中 `/api/readiness` 是可选但推荐的环境能力接口。真实后端提供后，前端会用它展示哪些能力已经真实可用；未提供时，前端会退回到本地推断，不影响基本交易流程。

Agent 容量风控的来源优先级是：

- 真实后端返回 `lockedCapacity` / `availableEscrowLimit` 时，前端直接使用后端容量快照。
- 后端没有返回容量字段时，前端才用当前已加载的任务列表本地推算。
- 正式交易场景必须以后端实时容量、质押和资金锁定结果为准，前端推算只适合静态演示或本地 mock。

## 对外访问方式

如果只是让别人看页面，需要把静态前端部署到公网地址；如果要让别人体验真实登录、任务数据、托管和结算，还需要把 `scripts/config.js` 指向公网可访问的真实后端 API。

更完整的部署路径、配置方式和上线检查清单见：[deployment-guide.md](deployment-guide.md)
