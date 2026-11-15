# Community 登录更新：部署与验收

## 更新内容

- `/community/sign-in` 是独立登录页面，支持 Google、Apple、GitHub，登录后返回原操作。
- 新登录会话有效期30天；页面跳转、刷新和正常关闭浏览器后无需重复登录。用户主动退出、清理Cookie或会话到期后需要重新登录。已有旧会话保留原到期时间。
- 三种账号均可提交 Registry 项目并查看自己的提交。只有既有 GitHub 管理员白名单能审核发布。
- Registry v2 提交到数据库进行站内审核，不创建GitHub PR，因此不需要GitHub仓库写权限。
- 旧版PR API仅在实际创建PR时单独请求GitHub授权。授权不会替换原Community会话；令牌只在请求中使用并尝试撤销，不永久保存。
- 不按邮箱自动合并账号。主动退出Google后改用GitHub登录，仍是另一个身份；一次PR授权不是账号合并。

## 部署顺序

先合入后端PR，再在Droplet执行迁移并更新后端。确认会话接口返回 `sessionDurationDays: 30` 后，再合入前端PR，由现有Vercel项目部署。无需修改域名、OAuth callback、Google/Apple/GitHub客户端凭据或Vercel环境变量。

后端仓库提供 `db/002-registry-community-identity.sql` 和 `scripts/apply-community-login.py`。已有Supabase环境使用此前准备的私有 `.env.community-migration`（迁移owner连接），以及现有 `.env`、`.env.supabase`。不要在聊天或命令行参数中粘贴数据库密码。

```sh
cd ~/CrossOmics-website-backend
git pull --ff-only origin main && (
  set -a
  . ./.env.community-migration || exit 1
  set +a
  python3 scripts/apply-community-login.py || exit 1
  unset COMMUNITY_MIGRATION_DATABASE_URL
  docker compose --env-file .env --env-file .env.supabase \
    -f compose.yaml -f compose.https.yaml -f compose.supabase.yaml config -q &&
  docker compose --env-file .env --env-file .env.supabase \
    -f compose.yaml -f compose.https.yaml -f compose.supabase.yaml up -d --build --wait community &&
  curl -fsS https://www.cross-omics.com/api/community/v1/session
)
```

迁移脚本失败会阻止部署。脚本可重复执行，不删除或改写已有提交、账号ID、贡献历史或管理员白名单。全新本地Compose数据卷也会按初始化顺序应用该迁移。已有非GitHub提交后，代码回滚时保留这个扩展数据库约束，避免恢复成只支持数字ID。

## 验收

1. 打开正式站Sign in，确认进入独立页面，三种已配置方式可用；已登录访问此页直接返回原操作。
2. 分别用自己的Google、Apple、GitHub账号登录。未登录从指定项目进入注册时，登录后应保留该项目。
3. 关闭并重新打开浏览器、刷新页面，登录状态仍保留。确认“退出登录”生效。
4. Google/Apple提交项目，能在My registry submissions看到自己的记录；普通账号不能审核发布，也看不到其他账号的私有提交。
5. GitHub管理员仍能打开Review queue审核。现有贡献、作者/引用字段和桌面端流程保持原行为。

开发验证使用独立临时PostgreSQL、模拟GitHub和本地目录数据；覆盖30天Cookie、有效旧Cookie、签名/过期拒绝、重复访问不续期、退出、跨账号隔离、跨站拒绝、PR幂等恢复和迁移重跑。真实OAuth服务、真实PR写入、浏览器重启与生产迁移需账号所有者/部署者完成上述验收。

## 本次实现取舍与边界

GitHub授权按操作执行，没有建立永久账号关联；将来若需要多个登录方式共享一个账号，需要独立的关联/迁移设计。原有旧会话不自动续期，可能比新30天政策更早要求再登录。后端测试不再请求已拆出的前端页面，旧PR结果链接由前端测试覆盖。

重复成功回调可恢复已有PR号；同一个GitHub账号也可由不同Community账号单独授权，但不会合并历史或绕过回调所有权校验。GitHub故障时撤销令牌仍是尽力执行，令牌不会被服务持久化。旧后端未上报会话时长时，前端显示7天并隐藏未配置/不可用的登录方式。

旧PR组件只负责显示完成结果，不恢复已弃用的PR提交流程。非管理员手动加 `all=1` 仍只看到自己的记录，服务端会独立拒绝全量读取。桌面账号体系、一般OAuth架构、代码仓库验证和其他迁移工具未扩展。界面检查覆盖桌面及390px手机宽度，未进行完整辅助技术认证或所有语言/视口组合验证。
