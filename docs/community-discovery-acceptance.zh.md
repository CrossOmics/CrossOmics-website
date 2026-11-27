# Community 姓名、族谱与版本摘要验收

2026-11-26。本轮实现四项已接受的 review 修改，并加入用户追加的鼠标滚轮缩放。

## 交付

- 前端分支 `codex/community-discovery-followup`，功能提交 `7dea152`、`e230c67`、`bb9865e`，基于 `7f14cce`。本轮未合入或部署。
- 后端分支 `codex/community-public-name`，提交 `aed311d094cef5d1c4022b339ec8cb9dde09dcd9`，基于 `00f3df1`。已导入本机持久后端仓库的同名分支，保留该仓库原 checkout 与未跟踪 docs。
- 前端工作区 `/Users/jre2000kr/.codex/worktrees/community-discovery/CrossOmics-website`；后端实现工作区 `/private/tmp/crossomics-governance-api-20261122`。

## 行为

1. My Contributions 可以保存或清空本人公开姓名。公开搜索和资料页采用保存的姓名，slug 不变。姓名不修改历史作者、维护者绑定或权限；没有公开活动的账号不会因为设置姓名出现在目录中。
2. 工具族谱按实现展示 STAR → NuSTAR，版本为辅助信息。默认采用已发布代表；完整版本历史另行展开。连接仅来自有效记录，多来源冲突和循环保持断开。具体版本缺失 parent 的诊断保留在该版本详情中。
3. 顶部 View lineage 一次点击展开并定位，直接访问 #lineage 和重复点击也可展开。滚轮在鼠标位置缩放，范围10%–200%，保留拖动、双指与工具栏操作。画布外正常滚动页面。
4. 仓库卡片展示用途、兼容性、性能与证据，区分已发布摘要和最新仓库观察日期。观察记录的 commit subject 不作为性能或兼容性结论。Benchmark 与不同的 PR 链接同时保留。NuSTAR 使用已发布的原文说明原生索引要求与性能测量待补充，没有新增速度或兼容性承诺。
5. 目录支持完整120 Unicode codepoint 姓名；超长查询明确提示，头像不会截断首个 supplementary character。

## 验证证据

- 前端最终 `npm test`：131/131；`npm run build`：退出0。日志 `/private/tmp/community-discovery-final-tests.log` 与 `/private/tmp/community-discovery-final-build.log`。
- 后端：Community15、governance32、session/input21、legacy login35，共103/103；TypeScript 与生产构建通过。SQL007 在已有SQL006数据上重复应用通过，姓名与ACL保留。
- 初次 review 后5项问题均补回归并修复。后续撤回版本标签问题补回归并修复；独立 scoped review 最终通过，滚轮路径通过代码审查。
- 本地真实API/数据库/页面已完成：保存测试成员姓名 → 完整姓名搜索 → 公开资料三组贡献；顶部一次展开和直接hash定位显示STAR→NuSTAR。
- 最终生产构建浏览器实测：画布内滚轮73%→92%→73%，页面scrollY保持726.5；画布外滚动scrollY变为982.5且缩放仍73%。已保存族谱截图。
- 浏览器实际604px宽，无横向溢出；viewport override未生效，因此不宣称390px或1440px精确尺寸测试。全部写操作仅作用于本地隔离测试数据库。

## 本地复验

- 工具页：http://127.0.0.1:3041/community/catalog/cp_star#lineage
- 测试账号入口：http://127.0.0.1:3042/
- 当前预览 helper：`/private/tmp/community-discovery-preview.mjs`；隔离API地址记录于 `/private/tmp/community-discovery-preview.json`。

## 部署顺序

现有服务器已执行SQL005与006；本轮需要额外SQL007。拉取后端新代码后，使用现有私密迁移环境，执行 `python3 scripts/apply-public-names.py`。脚本读取 `COMMUNITY_MIGRATION_DATABASE_URL`，不会自动读取 `.env.community-migration`；沿用此前 `set -a; source .env.community-migration; set +a` 的加载方式。然后部署后端，再部署前端。代码回滚保留新增列和已保存姓名。

前端对缺失个人资料接口显示设置暂不可用，其余个人贡献历史可继续使用。后端代码必须在SQL007之后部署，确保目录查询具备新列。
