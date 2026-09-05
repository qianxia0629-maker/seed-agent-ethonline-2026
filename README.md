# Seed Club Talent V6: ETHOnline 2026

Seed Club Talent is becoming a verifiable Web3 builder network. The ETHOnline branch adds wallet-linked profiles and live indexed activity evidence while preserving the existing community directory.

## ETHOnline V6 第一阶段

- 成员资料新增公开 EVM 钱包，可连接浏览器钱包或手动填写地址。
- 钱包地址变更时会自动清除旧链上证据，避免证据与新地址错配。
- 成员本人或管理员可以主动刷新 Onchain Activity Proof。
- 云函数通过 The Graph Network Gateway 查询 Uniswap V3 Ethereum Subgraph 的实时索引数据。
- 证据区显示交易、添加/移除流动性、领取费用、索引区块和查询时间。
- 链上数据为空、API Key 未配置、超时或 GraphQL 查询失败都有独立状态，不返回模拟成功数据。
- 钱包公开不被描述为身份认证、信用评分或投资能力证明。
- AI 搜索可以识别用户明确提出的协议、活动类型和链上证据要求，并在真实成员资料与缓存的 The Graph 证据上确定性筛选。
- 普通的 Web3 或 DeFi 技能搜索不会自动要求钱包证据，避免把没有公开钱包的合适成员错误排除。

### The Graph 集成

- Provider: The Graph Network Gateway
- Subgraph: Uniswap V3 Ethereum
- Default Subgraph ID: `5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`
- Server action: `refresh_onchain_proof`
- Query module: `cloudfunctions/seedclub-ai-search/onchain-proof.js`
- Credentials: server-side `GRAPH_API_KEY`; never expose it in the frontend or commit it to Git

可选环境变量：

- `GRAPH_UNISWAP_V3_SUBGRAPH_ID`: 覆盖默认 Subgraph ID。
- `GRAPH_GATEWAY_URL`: 覆盖默认网关 `https://gateway.thegraph.com`。

查询按每类最多 100 条近期事件汇总，因此页面称其为“已读取的活动记录”，不冒充钱包的完整历史总数。

### V6 部署顺序

1. 在 CloudBase PostgreSQL SQL 编辑器执行 `sql/v6-ethonline-wallet-and-proof.sql`。
2. 在 Subgraph Studio 创建 API Key，并作为 `GRAPH_API_KEY` 写入 `seedclub-ai-search` 云函数环境变量。
3. 更新并部署 `cloudfunctions/seedclub-ai-search` 云函数。
4. 执行 `pnpm test` 与 `pnpm run build`。
5. 部署前端 `dist`，登录成员账号，保存真实钱包并点击“刷新链上证据”。
6. 核对页面显示的 Subgraph、索引区块、查询时间和钱包实际活动。

比赛范围、赛前工作边界与 AI 使用披露分别见 `HACKATHON.md`、`PRE_EXISTING_WORK.md` 与 `AI_USAGE.md`。

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
