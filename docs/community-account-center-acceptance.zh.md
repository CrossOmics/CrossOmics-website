# Community 账户中心验收记录

## 本轮交付

用户要求每个人有自己的主页，并在登录后集中查看个人贡献、设置、登录方式与适用的管理员内容。

- 登录后 Community 导航右侧的姓名/头像打开账户菜单。
- `/community/account` 是每个登录账号都有的私人主页，按个人身份、贡献统计、工作记录排序，编辑资料与公开主页入口集中在身份区。
- `/community/mine` 保留原贡献记录和独立分页，在相同账户导航中展示。
- `/community/registry/submissions` 保留本人提交记录及管理员授权的审核队列。
- `/community/account/settings` 集中放置公开姓名和本人账户标识。
- `/community/account/security` 显示当前登录来源、各方式在站点上的可用状态、会话保留时间、Gardener 访问管理及退出登录。
- 管理入口按现有 registry/bounty 权限显示。既有服务端检查继续生效；普通成员不会获得管理权限。
- `/community/contributors/<slug>` 是公开个人主页，包含公开身份、贡献统计及已发布工作。公开可见性仍以公开活动为边界；私人设置、标识、凭证和草稿不进入主页。没有公开活动的新账号也有私人账户主页。

## 登录与兼容

服务新增可选 `signInProvider` 会话字段，并允许三个精确的账户页 OAuth 返回路径。一般登录默认进入账户主页；已有明确的投稿、贡献记录、维护管理和桌面授权目标继续保留。旧后端省略来源字段时，前端根据已验证账号标识使用兼容显示；缺少个人资料接口时给出明确的暂不可用状态，其余私人入口可用。

登录方式页如实区分当前会话来源与站点可用方式，没有增加身份绑定或自动合并账号功能。账户数据只使用 React 请求级缓存，后端请求保持 no-store。

本轮没有新增依赖、环境变量或数据库迁移。部署时先更新配套后端，再更新前端，保证默认 OAuth 返回目标一致。上一轮公开姓名功能的 SQL007 仍是已有前置条件。

## 验证

- 前端最终完整测试144/144，通过生产构建。
- 后端 Community17/17、session/input23/23、登录与迁移35/35，共75项；TypeScript 与最终生产构建通过。
- 独立代码审查提出工作预览、服务通用登录目标、禁用登录方式状态、查询变化菜单关闭、长姓名布局5项问题。全部补回归并完成一次修复；最终覆盖测试通过，没有待处理项。
- 实际浏览器完成：成员主页→菜单→姓名设置；保存姓名后侧栏与菜单同步；登录来源与访问页面；管理员专属导航和管理页面；Google 登录来源；未登录公开主页；公开/私人80字符姓名的布局回归。
- 实际390px宽度下，私人姓名标题145px框内scrollWidth145，公开标题286px框内scrollWidth286，页面scrollWidth390，无横向溢出。姓名已恢复为正常测试名称，临时 viewport 已重置。
- 所有账号切换、改名和数据库操作都使用隔离的本地测试环境，没有线上数据写入。

## 账户布局整理

- 私人账户页使用单行精简顶栏，移除重复的站点导航、Community 导航和侧栏身份展示；公开页面保留原导航。
- 桌面侧栏按 Work、Account、Administration 分组，管理项仍按权限显示。
- 窄屏使用默认收起的账户页面菜单，切换页面后自动收起，Escape 可关闭并返回焦点。
- 主页合并标题与身份区，公开主页改为操作入口，贡献统计与工作记录提前展示，统计数值在标签换行时仍对齐。
- 浏览器验证390px无横向溢出、1280px桌面侧栏、窄屏导航切换后自动收起、顶栏账户菜单及管理员分组。临时 viewport 已重置，预览恢复普通成员。
- 截图保存在 `/Users/jre2000kr/.codex/visualizations/2026/11/26/01a215d9-de2c-7583-8edb-5526677f8ed8/account-organized-compact.png`、`account-organized-mobile.png` 和 `account-organized-desktop.png`。

## 本地验收

- 账号与角色选择：http://127.0.0.1:3044/
- 普通成员自动进入私人主页：http://127.0.0.1:3044/member
- 私人主页：http://127.0.0.1:3043/community/account
- 设置：http://127.0.0.1:3043/community/account/settings
- 登录与访问：http://127.0.0.1:3043/community/account/security
- 角色入口包含管理员、Google、Apple、新成员和访客。切换只影响 localhost 的测试会话。
- 预览脚本 `/private/tmp/community-account-preview.mjs`；隔离生产构建目录记录于 `/private/tmp/community-account-preview-path`。

## 保存位置

- 网站分支 `codex/account-center`，工作区 `/Users/jre2000kr/.codex/worktrees/community-discovery/CrossOmics-website`。
- 后端分支 `codex/account-center-auth`，工作区 `/private/tmp/crossomics-governance-api-20261122`；同名分支已导入持久后端仓库，不改动该仓库原分支和未跟踪文档。
- 本轮仅提交本地功能分支，尚未合入或部署。
