# Governor 与 Cross Community 改造规范

**状态** 待评审 · **负责人** Justin · **日期** 2026-11-09

## 1. 范围和现状

本规范覆盖会议纪要中分配给 Justin 的六项任务。编辑器、文件列表、参数展示、演示视频及通用 SSE UI 改造由对应工作项另行推进。MCP 的接口签名、错误契约与文档由 Justin 负责，并与 Zhenke 的前端工作对接。

| 系统 | 当前实现 | 本次目标 |
| --- | --- | --- |
| Cross | `CrossOmics-website` 为公开网站，`CrossOmics-website-backend` 为独立 Community API，使用自管 PostgreSQL。 | Cross 负责共享账户、目录、提交流程、贡献记录、悬赏及管理 API。Community 数据存入 Supabase。 |
| Governor | 纪要称 Governor。本地能核对的是 Gardener 源码 `Biological-Agent` 和公开发布仓 `Gardener-Agent`。以下暂按 Governor 是纪要中所指的用户侧应用编写，正式源码仓和部署目标待确认。 | 独立部署用户应用、运行后端与 agent。原 Community 页面退出维护入口，保留用户发现、打开或导入公共 pipeline 的路径。 |
| Pipeline Registry | `pipeline-registry` 的 YAML、PR 审核和 GitHub Pages `index.json` 提供目录。Web 通过 Community API 读目录，Gardener 也有读取 Pages 和缓存的路径。 | Supabase 中已发布的 Registry 记录成为目录的唯一写入来源。GitHub 继续提供 pipeline 源码、版本提交和历史 PR 链接。 |

Cross 与 Governor 各有自己的仓库、部署配置、运行凭据和发布节奏。前端继续通过网站的同源 API 代理访问 Cross。Governor 通过版本化 HTTPS API 查询公开目录和访问当前用户的 Community 数据。用户项目、分析数据、运行记录和 MCP 工具运行留在 Governor 的环境中。两端交换的数据限于公共目录元数据及用户授权访问的 Community 记录。

## 2. 修复当前 PR 授权的重复跳转

在 Registry 切换前修复现有的 **Authorize and open PR**。复现时记录正式站域名、浏览器、是否已有登录状态和脱敏的请求顺序。区分两类故障，即同一次点击触发多次授权，以及 OAuth 返回后反复进入登录或授权。当前代码中的异步按钮状态、前端导航、网站代理、OAuth 回调和数据库 attempt 都是排查点。纪要尚不足以确定根因。

预期顺序为网站确认 → 一次授权请求 → GitHub → 网站回调 → 单一结果页。确认后禁用重复操作。服务端绑定用户、预览及 attempt，原子消费有效回调，并以目标仓、base、GitHub 账号和经确认内容生成稳定的 head 分支标识。若 GitHub 已创建 PR 但响应丢失或进程退出，重试先按 head 和 base 查找远端 PR，核对作者及提交内容后复用结果。回调始终回到发起授权所用的正式站域名。用户拒绝、过期或返回错误时保留表单，显示可重试提示。浏览器刷新、回退、多标签页和网络重试不创建第二个 PR，旧回调不影响新授权。

**验收** 至少记录一次原问题复现，覆盖双击、重复回调、取消、GitHub 创建成功后响应丢失，以及后端重启后的重试。使用测试账号和明确选定的测试条目，验证一次真实 OAuth 往返及 PR 链接。验收完成后，此路径继续作为迁移前兼容入口，随第 7 节切换退役。

## 3. Registry 条目、版本和提交

新表单以提交性质为主。用户选择 **Origin**，或选择 **Improved / Update / Fix** 并指定现有 pipeline 和基于的版本。表单、API 与新目录筛选使用同一枚举 `origin | improved | update | fix`。历史 `tool/workflow` 作为导入元数据保留，供旧接口和历史展示使用。

| 提交性质 | 对象和校验 |
| --- | --- |
| `origin` | 新建 pipeline 和首个版本，`parentVersionId` 为空。同一 pipeline 只能有一个 Origin。 |
| `improved` | 在选定版本上新增改进版本，说明具体改进，允许提供性能、结果或复现证据链接。 |
| `update` | 在选定版本上新增更新版本，说明上游版本、依赖或兼容性变化。 |
| `fix` | 在选定版本上新增修复版本，说明修复内容，允许提供 issue 或测试证据链接。 |

- 公共字段包括名称、描述、分类或领域、源仓库、版本标签、完整 commit SHA、原作者与维护者。非 Origin 还需目标条目、父版本与变更摘要。提交账号由服务端读取登录会话。
- 原作者与维护者各至少一条。每条提供显示名，并可附 GitHub handle、ORCID 或公开主页。表单为衍生版本预填原作者，提交人可提出更正，由管理员审阅。提交者、原作者、维护者、审核者分别记录，GitHub 登录仅证明提交者的身份。
- 提议将目录拆成 `registry_pipelines`、`registry_versions`、`registry_credits` 和 `registry_submissions`。保留现有 `cp_*` 与 `cv_*` 标识和 moved 跳转，以复合外键约束父版本属于同一 pipeline，并用数据库唯一约束保证每个 pipeline 只有一个 Origin、同一 repo＋commit 只发布一次。已发布版本的 repo、commit 和父版本为不可变来源信息，修正通过新增版本或有审计记录的元数据变更完成。
- 提议先支持公开 GitHub 仓库，服务端核验完整 commit 可访问。规范化仓库地址并检查重复 repo＋commit。客户端传幂等键，服务端将其绑定到账户和请求摘要，重复提交返回同一记录，摘要冲突返回 `409`。
- 提议由数据库保存 `submitted → published / rejected` 和审核人、时间、理由。普通 GitHub 登录用户提交后看到记录编号及状态，管理员在 Cross 发布或驳回，公开目录仅读取 `published`。写入版本、归属信息、状态和审计记录应在同一事务完成。团队若确认合规提交直接发布，可在同一服务端校验后走自动发布分支。是否保留站内审核待确认。
- 接口草案使用 `GET /api/community/v2/catalog`、`GET /api/community/v2/catalog/{id}`、`POST /api/community/v2/registry/submissions`、`GET /api/community/v2/registry/submissions/{id}` 与管理员审核动作。详情返回条目、版本沿革和署名，提交返回编号和状态。普通用户只能访问自己的未发布提交。新接口使用明确的字段错误和 `401 / 403 / 404 / 409 / 422` 响应。

**验收** 四种提交均能产生预期记录。验证缺署名、无效 commit、跨条目父版本、重复提交和未授权审核。公开搜索只出现已发布版本。旧链接仍能打开，署名和提交账号显示清晰。

## 4. Supabase 与权限

第一阶段使用 Supabase 托管 PostgreSQL，保留现有 Cross 登录服务和 API 契约。现有服务通过 TLS 使用专用 PostgreSQL 运行角色连接。迁移角色和运行角色分开，浏览器和 Governor 通过 API 访问。使用私有 schema 或明确排除 Data API 暴露，并检查 `anon`、`authenticated` 等角色没有直接读写私有数据的权限。如果后续需要开放 Data API，再为公开表或视图逐一配置并测试授权和 RLS。应用角色由 Cross API 检查，数据库连接角色和项目 Dashboard 成员是另外两层权限。 [Supabase 数据库连接](https://supabase.com/docs/guides/database/connecting-to-postgres) · [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)

| 角色 | 提议的访问范围 |
| --- | --- |
| 访客 | 读取已发布的公共目录，以及现有本来就公开的 Community 内容。 |
| GitHub 已登录用户 | 提交 Registry 记录，读取自己的未发布提交，继续使用获准的 Community 功能。 |
| Community admin | Justin、Jiapeng、Zhenke。审核发布、撤回目录版本、补齐历史署名及管理只读授权。用本人验证后的 GitHub 数字 ID 初始化，授权、撤销与管理操作记审计。 |
| 后续只读成员 | 通过指定的管理视图或只读查询入口读取团队批准的数据。禁止修改、审批、授权，以及读取凭据和会话数据。 |
| Supabase 项目运维人员 | 单独分配 Dashboard 和数据库操作权限。确认实际运维职责后再授予对应项目角色。 |

迁移范围包括贡献、影响证据、悬赏、回复、现有编辑白名单，以及为兼容期保留的有效桌面访问令牌哈希。保留 UUID、账号标识、外键、时间和去重约束。旧的短期 OAuth attempts 在切换窗口结束前过期或重新发起。新 Registry 表使用版本化 SQL migration。Staging 先恢复备份并对账，生产切换时暂停写入、应用增量或最终快照、验证计数与关键记录，然后恢复写入。只允许一个生产写入方。

**验收** 验证三位管理员各自的身份，使用只读、普通、匿名账户测试权限矩阵，包含直接 API 调用的越权用例。对照迁移前后的记录数量、关键 UUID、抽样署名、悬赏状态与用户历史。

## 5. Governor 与 Cross 共用 GitHub 账户

Governor 的用户侧应用提供 **Sign in with GitHub**。提议沿用 Cross 作为 Community 身份签发方。对桌面端，打开系统浏览器完成授权，再通过一次性 code 和 PKCE 回到应用。应用把短期 code 在 HTTPS 上交换成可过期、可撤销的 Community 会话，由系统凭据存储保护。Web 使用同一个 GitHub 身份映射，按 GitHub 数字 ID 绑定历史记录，handle 仅用于显示。桌面端无需向用户展示或要求手动粘贴 access token。 [RFC 8252](https://www.rfc-editor.org/rfc/rfc8252)

既有 GitHub Community 记录保持归属。Google 和 Apple 网站账号继续按原身份工作。若未来需要跨供应商合并，单独做可验证的账号关联。过渡期接受已发给旧版客户端的有效令牌哈希，期限和退役版本随切换确认。若 Governor 最终采用独立 Web 部署，保留同一身份签发方，并用该客户端登记的 HTTPS 回调替代桌面 loopback。

**验收** 同一个 GitHub 账户在两个客户端看到同一份贡献和提交历史。切换 GitHub 账户、取消授权、过期、重放 code、错误 verifier、会话撤销和旧客户端升级均有明确结果。Governor 暂时连不上 Cross 时，已安装的本地 pipeline 仍能运行。

## 6. MCP annotation 注册与接口收口

现有 Python agent 的 `mcp_registry.py` 维护工具名和描述。Pi runtime 的 `workspace-tools.json` 提供 workspace 操作契约，`backend_api_tool.py` 会读取 FastAPI OpenAPI。需要减少的重复是同一后端操作在路由、schema 和 agent 注册清单中的手工声明。

提议在显式开放给 MCP 的 FastAPI 操作上加统一注解，如 `@mcp_exposed(...)` 或由封装写入 OpenAPI `x-gardener-mcp`。注解记录稳定工具名、说明及读写类别，输入输出从已有类型定义生成。后端导出筛选后的契约，agent 校验并使用生成清单。先迁移一读一写两个代表性操作，确认打包后，再收口同类路由的手工注册。纯 agent 本地工具沿用自己的注册方式。 [MCP Tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)

注解只控制发现范围。现有项目作用域、鉴权、写入确认、执行权限、参数验证、取消和错误分类仍由运行时检查。未注解路由不出现在清单中。重名、缺少 schema 或缺少权限分类时，契约验证失败。对外已有名称或参数变更需有兼容适配或明确的版本切换。向 Zhenke 提供工具清单、参数及结构化错误示例，现有 GUI 流式传输协议由其对应工作项演进。

**验收** 新增一个标注的同类后端接口只需修改路由和测试，就能被工具清单发现。验证真实 `tools/list`、`tools/call`、合法与非法参数、越权调用、取消与错误反馈。确认打包后清单和源码一致，未标注接口无法借通用调用旁路进入 MCP。

## 7. 发布顺序与数据回退

1. **P0 修复和边界确认**。独立交付 PR 重复跳转修复。确认 Governor 仓库、目标环境、菜单入口与 Cross API 基址。
2. **P1 迁移 Community 数据**。先在 staging 上演练现有 API 对 Supabase 的兼容，再迁生产。此阶段网站目录继续从已发布的 GitHub 索引读取。
3. **P2 建 Registry 写入链路**。导入 GitHub registry 的 YAML、版本与 moved 映射，在 staging 完成权限、目录查询、站内提交和发布，生产写入口保持关闭直到正式切换。根 `original` 转成 `origin`，后续 `original` 转成 `update`，`optimization` 转成 `improved`，保留原始值。历史记录缺署名时标记待补齐，不根据 PR 作者反推原作者或维护者。已合并 PR 和历史贡献保留链接，开放 PR 单独登记并人工核对，按团队确定的收尾方式处理。
4. **P3 更新 Governor 入口与客户端**。发布 Cross 目录读取和 GitHub 登录。将原 Community 页面替换为公共目录入口与导入能力。新客户端可用后，先暂停旧 PR 提交和 Registry 合并，核对在途 PR，并以最后一个源 commit 完成最终导入和对账。随后启用 Supabase 为唯一正式写入端。兼容期内以只读方式保留最后一版 Pages 索引，并提供客户端升级说明。新目录保持公共条目链接和维护排名入口，排名的数据刷新在切换时单独验收。
5. **并行 MCP**。先做现有工具契约盘点和注解试点，再迁移清单。依赖 Governor 目标代码确认，独立于 Supabase 数据切换。

切换前保留源数据库和最后一份 GitHub 索引快照，并记录 Registry 导入的源 commit。若尚无 Supabase 新写入，可恢复旧配置。若已有新写入，先停写、导出并对账，再决定恢复旧读路径或在同一数据库回滚应用版本。旧数据库不得覆盖新记录。首次发布验收覆盖 Cross 与 Governor 分别部署、目录同源、跨端身份、提交权限、版本沿革和旧数据可见性。

## 8. 评审时需要确认

1. Governor 的正式源码仓、部署目标和设备类型。确认它是否就是本地 `Biological-Agent` 对应的 Gardener，以及拆出 Community 后保留的入口形态。
2. Registry 提交后由管理员在站内发布，还是校验通过即发布。开放的旧 PR 由谁关闭或迁入。
3. 三位管理员的 GitHub 数字 ID，以及是否同时需要 Supabase Dashboard 权限。未来只读成员可读的数据范围。
4. 最低支持的 Governor 版本、旧索引兼容期，以及已有桌面访问令牌的退役条件。

## 代码参照

- Cross Web 的当前入口和代理由 [前端 PR #18](https://github.com/CrossOmics/CrossOmics-website/pull/18) 引入。
- 当前 PR OAuth、提交和临时授权表见 [后端 PR #3](https://github.com/CrossOmics/CrossOmics-website-backend/pull/3)。
- 当前 Registry 发布流程与规则见 [pipeline-registry](https://github.com/CrossOmics/pipeline-registry)。
- Governor 对照点采用本地 `Biological-Agent/gardener_pipeline` 的 Community controller、registry source、Electron shared Community 客户端、`mcp_registry.py` 与 `workspace-tools.json`。
