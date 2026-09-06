# Seed Agent — ETHOnline 2026

Seed Agent is being built in public during ETHOnline 2026 on top of the frozen Seed Club Talent V5.12 baseline. The pre-hackathon code is preserved at the `pre-ethonline-2026` tag and documented in `PRE_EXISTING_WORK.md`.

AI-assisted development is documented transparently in `AI_USAGE.md`.

## Day 2 — Wallet + Onchain Profile

- Member profiles now support a public EVM wallet address and optional ENS name.
- Users can connect a browser wallet or paste a valid `0x…` address; connecting does not initiate a transaction.
- Wallet addresses are normalized and validated in both the browser and cloud function.
- Member cards include a Web3 Identity panel with Ethereum, wallet/ENS and live activity.
- `seedclub-ai-search` adds the `onchain_profile` action. It queries the decentralized The Graph gateway from the server, never from the browser.
- The live source is the indexed `Substreams Uniswap v3 Ethereum` subgraph. Results include the indexed block and up to 10 recent swaps initiated by the wallet.
- There is no mocked or static onchain fallback. Missing/invalid credentials and provider failures are shown as errors.

### Day 2 deployment

1. Run `sql/v6-wallet-and-onchain-profile.sql` in the CloudBase PostgreSQL SQL editor.
2. Add `THE_GRAPH_API_KEY` to the `seedclub-ai-search` cloud-function environment. Do not put it in the frontend or commit it.
3. Optional: set `THE_GRAPH_SUBGRAPH_ID`; otherwise the project uses `HUZDsRpEVP2AvzDCyzDHtdc64dyDxx8FQjzsmqSg4H3B`.
4. Deploy the updated cloud function, then deploy the frontend.
5. Verify a live query locally with environment variables `THE_GRAPH_API_KEY` and `GRAPH_TEST_WALLET`, then run `npm run verify:graph`. A successful response includes `live: true` and a current `indexedBlock`, even when that wallet has no recent swaps.

The wallet association is intentionally described as public profile data, not cryptographic ownership proof. Signature verification belongs to a later milestone.

## Pre-hackathon baseline: Seed Club Talent V5.12

## V5.12 更新

- 首页主目标改为“创建你的 Seed Club 资料卡，让社区认识你”，搜索功能保留并下移。
- 游客可以先填写完整资料卡，点击发布时再登录或注册；登录过程中草稿不会丢失。
- 资料卡精简为 4 个必填项：昵称、我现在在做什么、我擅长什么、我希望认识什么人，其他资料全部选填。
- 新增 AI 生成资料卡：用户输入一段自我介绍，AI 自动整理成四个核心字段，发布前仍可修改。
- 首页新增“最近加入 Seed Club 的成员”新人墙；成员新建或更新资料后会按最近更新时间展示。
- 首页明确展示资料收益：完善后可被其他成员通过 AI、技能、职业和地区搜索到。

本次升级无需新增数据库表。需要同时更新前端和 `seedclub-ai-search` 云函数。

## V5.11 更新

- 网站顶部增加中英文众筹公示入口。
- 众筹弹窗展示 EVM 收款地址、复制按钮、转账风险提示和已确认筹款金额状态。
- 同一弹窗公开目前已确认开支和未来 12 个月分项预算；没有账单依据的费用明确标记为待对账或估算。
- 管理员可在网站内实时编辑已筹金额、当前开支、未来预算和 EVM 地址；保存时自动生成中英文版本。
- 初始金额公示为“暂无已确认入账”，后续由管理员核对入账后更新。

部署前请在 PostgreSQL SQL 编辑器执行 `sql/v5.11-crowdfunding-ledger.sql`。

## V5.10 更新

- 修复普通登录成员发布留言时无法生成中英文版本的问题。
- 注册账号规则与 CloudBase 后端保持一致：小写字母开头，仅支持小写字母、数字、下划线和短横线，长度 6–25 位。
- 用户输入账号时即时显示校验结果，在发送邮箱验证码前拦截不合规账号。

V5.9 新增中英双语留言板和网站更新公告，让社区交流与版本通知直接发生在网站内。

## V5.9 更新

- 新增中英双语成员留言板，所有访客可以浏览留言。
- 已登录成员和管理员可以发布 1–500 字留言。
- 留言可使用中文或英文输入，发布时自动生成另一种语言，切换网站语言即可查看对应版本。
- 留言身份由数据库绑定：优先显示本人资料卡姓名，不能冒充其他成员。
- 普通成员只能删除自己的留言，管理员可以删除任意留言。
- 每 30 秒自动读取新留言，也支持手动刷新。
- 新增网站更新公告弹窗；每次发布新公告后，每位访客会自动看到一次，也可通过顶部“更新公告”重新打开。
- 管理员可以发布新公告或编辑当前公告，公告内容同样自动生成中文和英文版本。
- 翻译暂时失败时仍会按原文保存，避免留言或公告内容丢失。
- 桌面端和移动端均已适配留言、公告和管理入口。

## V5.7 更新

- 成员保存资料时，AI 自动把原始技能提炼为 2–12 个统一技能标签。
- 自动生成中英文同义词、常见缩写和行业术语，扩大关键词搜索召回范围。
- 原始技能内容完整保留，标准化技能作为独立标签展示并参与搜索。
- 管理员新增“AI 整理旧技能”按钮，可一次补齐历史成员资料。
- AI 暂时不可用时仍可保存资料，之后由管理员批量补齐。
- 普通成员每天最多整理 20 次资料，管理员批量整理不受该次数限制。

## V5.6 更新

- 新增中文 / English 一键切换，并在浏览器中记住语言选择。
- AI 搜索从“任一条件命中”改为“全部条件同时满足”，减少不准确推荐。
- 修复移动端选中文字时资料编辑弹窗误关闭、内容回退的问题。
- 英文界面覆盖搜索、登录注册、成员资料编辑、状态提示和错误提示。

## 安全设计

- DeepSeek API Key 只放在 CloudBase 云函数环境变量中，前端没有 Key。
- DeepSeek 只把自然语言转换成搜索条件，不接收完整成员数据库。
- 最终推荐结果由前端在真实 `members` 数据中计算，AI 不能编造成员。
- 搜索次数按网络来源做不可逆哈希后记录；资料整理次数按登录用户做不可逆哈希后记录。

## 部署顺序

1. 首次部署执行 `sql/v4-ai-search-usage.sql` 和 `sql/v5-member-accounts-and-ip-quota.sql`；升级依次执行 `sql/v5.7-ai-normalized-skills.sql` 与 `sql/v5.9-community-board-and-announcements.sql`。
2. 创建普通云函数 `seedclub-ai-search`，上传对应云函数 ZIP。
3. 云函数环境变量新增 `DEEPSEEK_API_KEY`；可选新增 `DEEPSEEK_MODEL`。
4. 上传最新前端 ZIP，配置仍然为：
   - 目标目录：`./`
   - 安装命令：`npm install`
   - 构建命令：`npm run build`
   - 构建产物：`./dist`
   - 部署路径：`/`
   - Node.js：18 或以上

## 管理员

- 账号：`seedclub_admin`
- 密码：使用 CloudBase 中现有密码，密码未写入代码。
