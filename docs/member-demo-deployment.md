# 成员演示版云端部署说明

更新时间：2026-05-28

这份说明用于把当前项目部署成“成员可访问的云端演示网站”。目标不是开源，也不是上线真实交易系统，而是让团队成员不需要本地文件，也能通过一个网址查看产品原型。

## 部署目标

- GitHub 仓库保持私有。
- 云端只发布静态演示包 `dist/member-demo`。
- 演示站默认不连接本地 mock API，也不连接真实后端。
- 成员能打开页面查看视觉、页面结构和本地演示流程。
- 不把 `server.py`、`data/`、`docs/`、`tools/` 等开发资料发布到公网目录。

## 重要边界

只要别人能打开网页，浏览器就会下载前端文件，所以成员可以在浏览器开发者工具里看到发布后的 `index.html`、`styles/main.css`、`scripts/app.js` 和图片资源。这是网页的基本机制，无法完全隐藏。

我们能保护的是：

- GitHub 私有仓库不公开。
- 后端代码不发布。
- 本地 SQLite 数据库不发布。
- 开发文档和工具脚本不发布。
- 通过访问保护减少非成员访问。

## 当前项目已经做好的准备

- `scripts/config.js` 默认设置为静态成员演示：

```js
window.QIANZHI_CONFIG = {
    apiBase: '',
    apiMode: 'off',
    environmentName: 'member-demo'
};
```

- `index.html` 增加了 `noindex, nofollow`，减少被搜索引擎索引的概率。
- 新增 `tools/build-member-demo.js`，用于生成纯前端演示包。
- 新增 `package.json`，提供构建命令。
- `.gitignore` 已忽略 `dist/` 和本地数据库。

`noindex` 不是权限控制，只是告诉搜索引擎不要收录。真正限制访问仍然要靠 Vercel/Netlify 的访问保护、Cloudflare Access 或服务器账号密码。

## 本地生成演示包

在项目根目录运行：

```powershell
npm run build:demo
```

生成目录：

```text
dist/member-demo/
  index.html
  styles/
  scripts/
  images/
  robots.txt
```

发布时只发布 `dist/member-demo`，不要发布项目根目录。

## 推荐方案：私有 GitHub + Vercel

适合快速给成员看页面。

### 你需要做

1. 在 GitHub 新建 Private Repository。
2. 把项目上传到这个私有仓库。
3. 不要把仓库设为 Public。
4. 不要上传账号密码、API 密钥、真实钱包私钥或真实数据库。

### 砚衡或部署负责人需要做

1. 登录 Vercel。
2. 点击 `Add New Project`。
3. 选择刚才的 GitHub 私有仓库。
4. Framework Preset 选择 `Other` 或保持自动识别。
5. Build Command 填：

```text
npm run build:demo
```

6. Output Directory 填：

```text
dist/member-demo
```

7. 点击 Deploy。
8. 部署成功后，把生成的网址发给成员。

### 访问保护

如果是内部演示，建议在 Vercel 项目里开启 Deployment Protection。可选方式取决于账号计划：

- 要求 Vercel 登录后才能访问。
- 设置访问密码。
- 只发 Preview Deployment 链接给内部成员。

如果当前账号没有密码保护能力，至少要做到：

- GitHub 仓库保持 Private。
- 演示链接只发给内部成员。
- 页面保持 `noindex`。
- 不在页面里放真实密钥、真实资金信息或未公开商业数据。

## 备选方案：私有 GitHub + Netlify

Netlify 步骤类似：

1. 新建站点，选择从 Git 导入。
2. 选择私有仓库。
3. Build Command 填：

```text
npm run build:demo
```

4. Publish Directory 填：

```text
dist/member-demo
```

5. 部署完成后开启 Password Protection 或团队访问控制。

注意：Netlify 的部分访问保护能力可能和账号套餐有关。

## 备选方案：自己的服务器或 nginx

如果已经有自己的服务器，也可以不走 Vercel/Netlify。

本地生成演示包：

```powershell
npm run build:demo
```

然后只上传 `dist/member-demo` 里的内容到服务器目录，例如：

```text
/var/www/qianzhi/ai-platform/
```

对外访问可能是：

```text
https://your-domain.com/ai-platform/index.html
```

服务器侧建议加：

- HTTPS
- Basic Auth 或内部账号登录
- 不允许目录列表
- 只开放静态演示目录

不要把整个项目目录直接放到 nginx 可访问目录下。

## 将来接真实后端时怎么改

如果后端团队给了公网 API，比如：

```text
https://api.qianzhi.example.com
```

再把 `scripts/config.js` 改成：

```js
window.QIANZHI_CONFIG = {
    apiBase: 'https://api.qianzhi.example.com',
    apiMode: 'required',
    environmentName: '真实业务后端'
};
```

然后重新运行：

```powershell
npm run build:demo
```

部署前必须先跑：

```powershell
node tools/verify-api-contract.js https://api.qianzhi.example.com
```

如果合约检查有失败，不建议对外演示真实交易流程。

## 部署前检查清单

- GitHub 仓库是 Private。
- `.gitignore` 中包含 `data/*.sqlite3`、`data/*.sqlite3-*`、`dist/`。
- 本地运行 `npm run build:demo` 成功。
- 云平台发布目录是 `dist/member-demo`，不是项目根目录。
- `scripts/config.js` 当前是 `apiMode: 'off'`。
- 演示链接开启访问保护，或者只发给内部成员。
- 页面里没有真实密钥、真实钱包私钥、真实用户数据或未公开资金信息。

## 给成员的说明口径

可以这样说：

> 这是乾智 AI Agent 任务交易平台的前端演示版，用于查看产品方向、页面结构和交易流程。当前链接不连接真实后端，不涉及真实资金、真实 Agent 执行或真实钱包授权。页面里的状态和数据用于演示。

