# Community 与 Gardener 官网拆分

状态：方案待用户确认；已确认采用两个独立前端仓库、两个 Vercel 项目。

## 目的与边界

`cross-omics.com` 专用于 CrossOmics Community；Gardener 产品官网独立维护和部署。
此次迁移的是 Gardener 官网（产品介绍、文档和下载入口），不是把桌面端、agent 或计算后端搬到 Vercel。

- Community 继续负责目录、pipeline 提交与审核、悬赏、贡献记录、账号登录和桌面授权。
- Gardener 官网保留目前产品首页、介绍、教程、研究、技术路线和路线图。
- 两端分别构建、配置环境变量和发布，使用明确的外部链接互相访问。
- Community API、Supabase 数据、OAuth 凭据和 Gardener 桌面应用不迁移，不增加第二套账号系统。

## 已核实的现状

- `CrossOmics/CrossOmics-website` 同时包含 Gardener 官网和 `/community/**`。
- Vercel 项目 `cross-omics-website` 绑定 `www.cross-omics.com`；`cross-omics.com` 通过 308 跳转到 www。
- 同源 `/api/community/**` 代理连接已独立部署的 Community API。
- 登录和 Gardener 桌面授权回调依赖现有网站域名及 `/community/**`、`/api/community/**` 路径。
- 作者字段修复 PR #21 已合入；实施从当时最新 main 开始，保留后续 tooltip 等已合入更新。

## 方案比较

1. **两个独立仓库、两个 Vercel 项目：用户已选择。** 文件、环境变量和发布独立，符合分开维护的目标。
2. 同仓库两个应用：可以复用公共组件，但需要按目录构建和管理共享改动；本次不采用。

## 页面、仓库与部署归属

| 内容 | 归属 |
| --- | --- |
| 现有仓库 `CrossOmics-website`、Vercel 项目 `cross-omics-website` | Community |
| 新仓库 `CrossOmics/Gardener-website`、新 Vercel 项目 `crossomics-gardener` | Gardener 官网 |
| `/` | 直接展示 Community Registry，支持现有查询筛选 |
| `/community` | 兼容入口，重定向到 `/`，保留查询参数 |
| `/community/**` 子页面 | 保留路径：目录详情、贡献、悬赏、个人历史、提交、审核和桌面授权 |
| `/api/community/**` | 留在 Community，保留代理白名单、Cookie、方法和回调行为 |
| `/about`、`/tutorial/**`、`/research`、`/approach`、`/roadmap`、`/future`、`/value` | 迁到 Gardener；Community 旧路径重定向到 Gardener 对应路径 |
| 原 Gardener 首页、官网组件、文案、发布查询、教程图片与静态资源 | 随 Gardener 官网迁移 |

新仓库保持公开，与原官网仓库一致。首个提交注明迁移来源仓库和源提交，保留文案和资源署名。
新站先使用 Vercel 实际分配的 `*.vercel.app` 域名；域名以成功创建项目后的结果为准，不假定名称可用。
本次不购买新域名，也不调整现有 cross-omics.com DNS。

## 导航与链接

- Community 标题、描述、页头和页脚采用 Community 定位；主要入口是 Registry、Bounties、Contributions、个人历史和提交。
- Community 提供 Gardener 官网外链；不再将产品介绍、教程等作为本地导航页面。
- Gardener 保留产品导航和下载入口，并将 Community 导航、首页入口改为 `https://www.cross-omics.com/`。
- 旧产品链接的重定向仅匹配已迁移路径；路径、查询参数和浏览器 fragment 按兼容规则保留，避免跳转循环。
- 不使用运行时站点模式开关；两个仓库构建结果各自只包含对应站点功能。

## 登录、数据和配置

- Community 保持 `www.cross-omics.com` 为正式 origin，保留已有 OAuth callback 和登录 Cookie 行为。
- 保留 Google / Apple / GitHub 登录、GitHub-only Registry 提交、审核权限、个人记录和桌面授权流程。
- Community 沿用 Vercel 的 `COMMUNITY_SERVICE_URL`、公共服务地址及已配置的联系信息；不输出或复制凭据。
- Gardener 官网不部署 Community API 代理，不接收 Community 后端地址、数据库连接串、会话密钥或 OAuth secrets。
- Community 通过服务端配置 `GARDENER_WEBSITE_URL` 指向新站；正式部署前配置实际域名。缺配置时仅禁用站外迁移链接/跳转并显示清晰状态，不回退到旧产品页面或未知站点。
- 不更改 Community API、数据库 schema、现有部署开关和管理员名单。

## 部署顺序与回退

1. 从最新 main 准备两个站点代码和独立构建，完成导航、路径和登录代理回归检查。
2. 创建 Gardener 新仓库和 Vercel 项目，先验证新站首页、教程、下载入口及图片。
3. 用新站实际域名配置 Community，创建拆分 PR 和可审核的预览；保持现有正式域名归属。
4. 验证 Community 预览后，将审核通过的 Community 版本合入并部署到现有项目。
5. 验收两个正式站点、旧链接、登录回调和 Gardener 桌面授权入口。

只在新站已就绪后切换旧产品入口，避免先移除页面导致链接失效。使用临时重定向完成迁移验收，避免浏览器永久缓存尚未确认的目标。
保留 Vercel 之前的部署和原 Git 历史；回退 Community 到切换前部署即可恢复原页面。此次不改变数据库写入来源，无需数据回迁。
遇到 GitHub/Vercel 安装授权、域名验证、付费或账号校验限制时，报告具体阻塞并交由用户完成相关账号操作。

## 验收标准

- 两个仓库各自 `npm ci` / `npm run build` 成功，分别由独立 Vercel 项目构建。
- Community 首页显示真实目录或明确错误状态；筛选、详情、悬赏、贡献、个人历史、提交和审核路径可访问。
- 保留 Origin / Improved / Update / Fix 及 Origin 隐藏原作者、其他类型必填原作者的行为。
- `/community?q=...` 正确进入根目录并保留筛选；现有 Community 子页和 OAuth callback 路径不改变。
- Gardener 官网包含现有产品内容、教程和静态资源，Community 链接指向主站，产品内部链接留在 Gardener。
- Community 上的旧产品路径正确跳到新站；没有 Community/Gardener 相互循环跳转。
- Community 代理的认证、Origin 校验和请求大小限制保持有效；Gardener 不暴露这些代理接口。
- 不向生产写入测试记录；真实 OAuth/桌面授权涉及本人交互时请用户验证，报告验证范围。

## 实施者可自行决定

组件和 CSS 文件的具体拆分、测试夹具、分支名及 PR 组织方式由实施者决定；沿用 Next.js、TypeScript 和现有视觉风格，不引入 monorepo 框架或 UI 重设计。
