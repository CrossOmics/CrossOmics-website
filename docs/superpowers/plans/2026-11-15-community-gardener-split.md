# Community / Gardener Website Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 独立发布 Gardener 官网，让现有域名及项目专用于 Community。

**Architecture:** 从当前 main 提取官网到新的公开仓库 `CrossOmics/Gardener-website`。现仓保留 Community，根首页展示 Registry，原官网路径经过验证的 `GARDENER_WEBSITE_URL` 临时跳转；OAuth 和 Community 子页路径不变。

**Tech Stack:** Next.js 15, React 19, TypeScript, Node test runner, GitHub, Vercel。

**Spec:** ../specs/2026-11-13-community-gardener-split-design.md

## Global Constraints

- 两个独立前端仓库、两个 Vercel 项目；不使用运行时站点模式开关。
- 不迁移 Community API、Supabase 数据、OAuth 凭据或桌面计算后端。
- 保留 `/community/**` 子页面和 `/api/community/**`；根 `/community` 兼容跳到 `/`。
- 保留最新 main 的表单、作者/引用和 tooltip 改动。
- 不复制 `.env`、数据库连接串、会话密钥或 OAuth secrets 到 Gardener。
- 不改 DNS，不购买域名；新站先使用实际分配的 Vercel 域名。

## Review Focus

- 根首页筛选及 `/community?q=...` 的参数保留。
- 旧产品路径嵌套、查询和 fragment 兼容，缺失/非法目标不能循环跳转。
- Community 同源代理 Cookie、登录回调、Origin 和请求大小校验不变。
- Gardener 不存在 Community API 代理或本地账号页面。
- 新站先就绪再切换 Community，保留可回滚的部署与 Git 历史。

### Task 1: Extract a standalone Gardener website

**Files:** 新仓 `app/{page,layout,globals,about,tutorial,research,approach,roadmap,future,value}`、官网 `components/`、`lib/{nav,content,sections,papers,releases}`、`public/`、构建配置、`tests/site.mjs`、`README.md`。

**Interfaces:** 公开 Community 地址固定 `https://www.cross-omics.com/`；官网内部路由保持原路径。新仓只构建官网，没有 Community 代理。

- [ ] 编写 HTTP 测试：主页/教程成功、Community 入口为绝对地址、`/api/community/v1/session` 为 404、教程图片成功；针对原合站运行，确认隔离断言失败。
- [ ] 提取现有内容、组件与资源，移除 Community 文件和数据库测试依赖，更新外链和站点标识，注明源提交。
- [ ] 运行 `npm ci`、`npm run build`，启动官网并运行 `npm test`。
  Expected: 构建成功，官网及隔离测试全部通过。
- [ ] 提交新仓初始版本；保留路径和源 SHA 供后续 review。

### Task 2: Convert the original website to Community

**Files:** `app/page.tsx`、`app/community/{page,layout,CommunityNav}`、`components/{SiteHeader,SiteFooter}`、`lib/nav.ts`、`lib/site-links.mjs`、`app/[...legacy]/page.tsx`、`app/layout.tsx`、`.env.example`、`tests/{registry-submit,community,site-links}.mjs`、`README.md`；移除已迁官网源文件与资源。

**Interfaces:** `gardenerWebsiteUrl(value)` 返回可信 HTTPS origin 或 null；`legacyGardenerUrl(segments,query,value)` 仅为已迁产品路径产生外站目标，拒绝本站和非法地址。`CommunityRegistry` 提供根首页内容，既有子页继续使用 CommunityLayout。

- [ ] 编写测试并观察失败：根 Registry、旧 Community 重定向参数、旧产品嵌套路由和查询、缺配置提示、非法/本站目标、代理限制保持。
- [ ] 实现根首页与共用 Registry 内容，保留子路由；改导航/元信息，加入已迁路径的安全临时重定向和无配置状态。
- [ ] 更新测试中原 Gardener 首页预期为 Community 首页；保留注册、OAuth 和既有 API 的回归断言。
- [ ] 运行 `npm run test:registry-submit`、`node --test tests/site-links.mjs`、`npm run build` 和本地 `npm run test:community`。
  Expected: 所有已配置检查通过，明确列出缺少可选 OAuth/数据库夹具的 skip。
- [ ] 提交 Community 拆站实现。

### Task 3: Review, deploy Gardener, and deliver the Community cutover

**Files:** 两仓 README、当前设计和此计划；Vercel 新项目及现有项目的公共 Gardener URL 配置。

**Interfaces:** Gardener 实际生产 URL → Community `GARDENER_WEBSITE_URL`；Community 当前服务配置及正式域名归属不变。

- [ ] 对两个仓库做一次独立完整 review；重要问题用 RED→GREEN 修复并运行相关完整套件。
- [ ] 创建公开 Gardener GitHub 仓库、推送已测试版本，导入独立 Vercel 项目；验证首页、教程、资源与外链，记录实际 URL。
- [ ] 配置 Community 的公共 Gardener URL，推送拆站分支和 PR，验证 Vercel 预览及旧链接兼容。
- [ ] 按用户已授权的整体部署范围，在检查通过且无平台限制时完成切换；若现有保护要求用户合并，提供具体 PR 和剩余操作。
- [ ] 在真实浏览器检查两个站点，保存截图；不使用生产凭据写入测试数据，报告 OAuth/桌面实际验证边界。
  Expected: 新官网独立可用，Community 发布或待用户合并的状态准确可核验。
