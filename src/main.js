import cloudbase from "@cloudbase/js-sdk";
import "./style.css";
import { normalize, rankMembers, searchableText } from "./matching.js";
import { intentNeedsOnchain, rankVerifiableMatches } from "./verifiable-search.js";
import {
  explorerAddressUrl,
  explorerTransactionUrl,
  isEvmAddress,
  normalizeEvmAddress,
  shortenEvmAddress,
} from "./wallet.js";

const ENV_ID = "seedclub-talent-a-d7d88i40a622d9";
const ADMIN_UID = "2094762302839332865";
const USERNAME_PATTERN = /^[a-z][a-z0-9_-]{5,24}$/;
const PROFILE_DRAFT_STORAGE_KEY = "seedclub-profile-draft";
const CROWDFUND_EVM_ADDRESS = "0xecf2930ba7d960cc598377ef25435349b0b619e0";
const DEFAULT_CROWDFUNDING = Object.freeze({
  id: 1,
  evm_address: CROWDFUND_EVM_ADDRESS,
  raised_original: "暂无已确认入账",
  raised_zh: "暂无已确认入账",
  raised_en: "No confirmed contributions yet",
  current_expenses_original: "品牌域名注册（1 年）：¥83\n云服务、数据库与函数：待账单对账\n已确认开支合计：¥83",
  current_expenses_zh: "品牌域名注册（1 年）：¥83\n云服务、数据库与函数：待账单对账\n已确认开支合计：¥83",
  current_expenses_en: "Brand domain registration (1 year): ¥83\nCloud services, database, and functions: pending billing reconciliation\nTotal confirmed expenses: ¥83",
  future_budget_original: "域名续费：约 ¥90 / 年\n托管、CDN、数据库与云函数：¥0–100 / 月\nAI 搜索与自动翻译 API：¥0–300 / 月\n邮件通知、备份与安全：¥0–200 / 月\n扩容和突发费用预留：¥0–200 / 月\n年度预算合计：约 ¥90–9,690",
  future_budget_zh: "域名续费：约 ¥90 / 年\n托管、CDN、数据库与云函数：¥0–100 / 月\nAI 搜索与自动翻译 API：¥0–300 / 月\n邮件通知、备份与安全：¥0–200 / 月\n扩容和突发费用预留：¥0–200 / 月\n年度预算合计：约 ¥90–9,690",
  future_budget_en: "Domain renewal: approx. ¥90 / year\nHosting, CDN, database, and cloud functions: ¥0–100 / month\nAI search and translation APIs: ¥0–300 / month\nEmail, backups, and security: ¥0–200 / month\nScaling and contingency reserve: ¥0–200 / month\nEstimated annual budget: approx. ¥90–9,690",
  updated_at: "2026-09-03T00:00:00+08:00",
});

const messages = {
  zh: {
    homeAria: "Seed Club Talent 首页",
    switchLanguage: "Switch to English",
    adminMode: "管理员模式",
    memberAccount: "成员账号",
    createMyProfile: "创建我的资料卡",
    editMyProfile: "编辑我的资料",
    addMember: "＋ 添加成员",
    normalizeAllSkills: "AI 整理旧技能",
    normalizingSkills: "AI 整理中 {current}/{total}",
    aiStandardSkills: "AI 标准技能",
    aiPreparingSkills: "AI 正在整理技能…",
    aiSkillsUpdated: "AI 标准技能已更新",
    aiSkillsBatchDone: "已整理 {success} 位成员的技能",
    aiSkillsBatchPartial: "已整理 {success} 位，{failed} 位失败",
    aiSkillsFallbackSaved: "资料已保存；AI 技能暂未提炼，可由管理员稍后重试",
    web3Identity: "WEB3 IDENTITY",
    web3IdentityEditor: "Web3 身份",
    web3IdentityHint: "连接或填写公开钱包地址，用于读取真实链上活动。连接钱包不会发起交易。",
    fieldWallet: "钱包地址",
    fieldWalletPlaceholder: "0x…",
    fieldEns: "ENS（选填）",
    fieldEnsPlaceholder: "例如：ray.eth",
    connectWallet: "连接钱包",
    walletConnecting: "正在连接…",
    walletConnected: "钱包已连接；保存资料卡后公开展示。",
    walletValid: "钱包地址格式正确；保存资料卡后公开展示。",
    walletProviderMissing: "没有检测到浏览器钱包，也可以直接粘贴 0x 地址。",
    walletRequestRejected: "钱包连接没有完成，请在钱包中允许连接后重试。",
    walletInvalid: "请输入完整有效的 0x 钱包地址。",
    walletPublicNote: "钱包地址和 ENS 会公开显示；当前连接仅关联地址，不代表已完成签名验证。",
    network: "网络",
    onchainActivity: "近期链上活动",
    protocol: "协议",
    verifyOnchain: "读取真实链上数据",
    verifyingOnchain: "正在查询 The Graph…",
    liveGraphData: "The Graph 实时数据",
    verifiedOnchainActivity: "VERIFIED ONCHAIN ACTIVITY",
    proofLiveBadge: "LIVE",
    proofScore: "链上活跃度",
    proofScoreValue: "{score} / 100",
    proofScoreDisclaimer: "仅衡量已查询到的链上活动，不是信用评分，也不代表个人能力。",
    proofActiveSince: "活跃起始",
    proofRecentActivity: "近 90 天交易",
    proofNetworks: "已验证网络",
    proofProtocols: "已验证协议",
    proofPositions: "活跃流动性仓位",
    proofNotAvailable: "暂无证据",
    proofNoEvidence: "The Graph 查询成功，但暂未发现该地址的 Uniswap V3 链上证据。",
    proofBreakdown: "评分依据",
    proofHistory: "活跃历史",
    proofRecent: "近期活动",
    proofPositionEvidence: "当前仓位",
    proofProtocolEvidence: "协议证据",
    proofPoints: "{points}/{max} 分",
    proofRecentEvidence: "最近可验证记录",
    proofActivityMint: "增加流动性",
    proofActivityBurn: "移除流动性",
    proofActivityCollect: "领取流动性",
    proofActivityPosition: "创建仓位",
    proofPoweredBy: "Powered by The Graph",
    proofLimitedResult: "高频地址的近 90 天记录已按查询上限统计。",
    graphIndexedBlock: "索引至区块 {block}",
    graphQueryFailed: "链上数据暂时无法读取，请检查 The Graph 配置后重试。",
    graphNotConfigured: "云函数没有读取到 The Graph 密钥。",
    graphAuthFailed: "The Graph 密钥无效、受限或额度不可用。",
    graphProviderFailed: "The Graph 已连接，但当前 Subgraph 查询失败。",
    graphTimeout: "The Graph 查询超时，请稍后重试。",
    loginRegister: "登录 / 注册",
    logout: "退出登录",
    heroTitle: "创建你的 Seed Club 资料卡，让社区认识你",
    heroSubtitle: "完善资料后，你可以被其他成员通过 AI、技能、职业和地区搜索到。",
    heroCta: "创建我的资料卡",
    heroEditCta: "编辑我的资料卡",
    heroBrowse: "浏览社区成员",
    heroAiHint: "不会写？输入一段自我介绍，AI 自动生成资料卡。",
    newcomerLabel: "NEW MEMBERS",
    newcomerTitle: "最近加入 Seed Club 的成员",
    newcomerIntro: "新创建或刚刚更新资料卡的成员会出现在这里。",
    newcomerEmpty: "还没有公开的成员资料，来成为第一位吧。",
    newcomerView: "查看资料",
    discoverLabel: "DISCOVER MEMBERS",
    discoverTitle: "用真实证据寻找合适的人",
    discoverIntro: "AI 理解你的需求，成员资料负责匹配，The Graph 提供可验证的链上证据。",
    aiSearchLabel: "用自然语言描述要找的人",
    aiPlaceholder: "例如：找一位有真实 DeFi 链上经历的 Solidity 开发者",
    aiQuota: "同一网络每天可使用 10 次 AI 搜索",
    aiQuotaRemaining: "今天还可使用 {count} 次 AI 搜索",
    aiSearch: "AI 帮我找",
    aiSearching: "正在查找…",
    aiExamplesAria: "AI 搜索示例",
    aiTradeQuery: "找一位有真实 DeFi 链上经历的 Solidity 开发者",
    aiSecurityQuery: "谁研究 Agent Security？",
    aiXianQuery: "我想找人在西安、可以聊 Web3 的成员",
    keywordDivider: "或者使用关键词精准搜索",
    memberSearchLabel: "搜索成员",
    keywordPlaceholder: "搜索姓名、技能、职业、地区……",
    search: "搜索",
    examplesAria: "搜索示例",
    tryIt: "试试：",
    quantitativeQuery: "量化",
    xianQuery: "西安",
    memberDirectory: "MEMBER DIRECTORY",
    connecting: "正在连接成员库…",
    clearSearch: "清除搜索",
    loadingProfiles: "正在读取成员资料",
    boardLabel: "COMMUNITY BOARD",
    boardTitle: "成员留言板",
    boardIntro: "查看社区留言。登录成员账号后，可以在这里留言和交流。",
    boardRefresh: "刷新留言",
    boardRefreshing: "刷新中…",
    boardLoginPrompt: "登录成员账号后即可参与留言",
    boardLoginButton: "登录后留言",
    boardAutoTranslated: "留言会自动生成中文和英文版本",
    boardPlaceholder: "分享近况、寻找合作，或者和社区成员打个招呼……",
    boardPost: "发布留言",
    boardPosting: "发布中…",
    boardCount: "共 {count} 条留言",
    boardEmpty: "还没有留言",
    boardEmptyIntro: "登录后发布第一条社区留言吧。",
    boardLoading: "正在读取留言",
    boardLoadFailed: "留言板暂时无法连接",
    boardRetry: "重新加载",
    boardDelete: "删除",
    boardDeleteConfirm: "确定删除这条留言吗？",
    boardPosted: "留言已发布",
    boardDeleted: "留言已删除",
    boardCharacters: "{count}/500",
    boardTooLong: "留言内容需要控制在 1–500 字以内。",
    boardLoginRequired: "请先登录成员账号再发布留言。",
    boardPostFailed: "留言发布失败，请重试。",
    boardDeleteFailed: "留言删除失败，请重试。",
    announcement: "更新公告",
    announcementLabel: "WHAT'S NEW",
    announcementPublishedAt: "更新时间：{time}",
    announcementEdit: "编辑当前公告",
    announcementAdmin: "发布更新公告",
    announcementEditorLabel: "ADMIN UPDATE",
    announcementEditorNew: "发布新公告",
    announcementEditorEdit: "编辑当前公告",
    announcementEditorIntro: "填写任意一种语言，发布时会自动生成中文和英文版本。发布新公告后，访客会自动看到一次弹窗。",
    announcementTitleField: "公告标题",
    announcementTitlePlaceholder: "例如：成员留言板正式上线",
    announcementContentField: "更新内容",
    announcementContentPlaceholder: "简要说明本次增加或调整了什么……",
    announcementPublish: "翻译并发布",
    announcementSaveChanges: "翻译并保存修改",
    announcementSaving: "正在翻译并保存…",
    announcementPublished: "新公告已发布",
    announcementUpdated: "公告已更新",
    announcementRequired: "请填写公告标题和更新内容。",
    announcementSaveFailed: "公告保存失败，请重试。",
    translationFallback: "自动翻译暂时不可用，已按原文保存。",
    crowdfundBanner: "Seed Club Talent 众筹",
    crowdfundBannerAction: "查看收款方式与金额公示",
    crowdfundLabel: "CROWDFUNDING",
    crowdfundTitle: "众筹收款与金额公示",
    crowdfundIntro: "感谢你支持 Seed Club Talent 的持续开发与运营。",
    crowdfundNetwork: "收款网络",
    crowdfundNetworkValue: "EVM（转账前请向管理员确认具体网络与币种）",
    crowdfundAddress: "虚拟货币收款地址",
    crowdfundCopy: "复制地址",
    crowdfundCopied: "EVM 收款地址已复制",
    crowdfundRaised: "已筹金额",
    crowdfundRaisedValue: "暂无已确认入账",
    crowdfundUpdated: "公示更新时间：{time}",
    crowdfundEdit: "编辑众筹账本",
    crowdfundEditorLabel: "ADMIN LEDGER",
    crowdfundEditorTitle: "编辑众筹与开支公示",
    crowdfundEditorIntro: "填写任意一种语言，保存时会自动生成中文和英文版本，访客刷新页面即可看到最新公示。每行填写一个开支或预算项目。",
    crowdfundRaisedField: "已筹金额",
    crowdfundRaisedPlaceholder: "例如：100 USDT（Ethereum）",
    crowdfundCurrentField: "目前已确认开支",
    crowdfundCurrentPlaceholder: "例如：品牌域名注册（1 年）：¥83",
    crowdfundFutureField: "未来 12 个月预算",
    crowdfundFuturePlaceholder: "例如：域名续费：约 ¥90 / 年",
    crowdfundSave: "翻译并更新公示",
    crowdfundSaving: "正在翻译并更新…",
    crowdfundSaved: "众筹与开支公示已更新",
    crowdfundRequired: "请填写收款地址、已筹金额、当前开支和未来预算。",
    crowdfundSaveFailed: "账本更新失败，请重试。",
    expenseCurrentTitle: "目前已确认开支",
    expenseFutureTitle: "未来 12 个月预算",
    expenseItem: "项目",
    expenseAmount: "金额",
    expenseDomainRegistration: "品牌域名注册（1 年）",
    expenseCloudReconcile: "云服务、数据库与函数",
    expensePendingReconcile: "待账单对账",
    expenseConfirmedTotal: "已确认开支合计",
    expenseDomainRenewal: "域名续费",
    expenseDomainRenewalAmount: "约 ¥90 / 年",
    expenseInfrastructure: "托管、CDN、数据库与云函数",
    expenseInfrastructureAmount: "¥0–100 / 月",
    expenseAiApi: "AI 搜索与自动翻译 API",
    expenseAiApiAmount: "¥0–300 / 月",
    expenseMessaging: "邮件通知、备份与安全",
    expenseMessagingAmount: "¥0–200 / 月",
    expenseContingency: "扩容和突发费用预留",
    expenseContingencyAmount: "¥0–200 / 月",
    expenseEstimatedTotal: "年度预算合计",
    expenseEstimatedTotalAmount: "约 ¥90–9,690",
    expenseEstimateNote: "预算按当前小规模运营估算，不是实时账单或服务商固定报价；实际开支将按账单更新。",
    crowdfundNotice: "转账前请先确认所使用的 EVM 网络和币种。不同网络之间的资产无法自动找回；入账金额由管理员核对后更新公示。",
    footerTagline: "让能力更容易被看见，让合作更快发生。",
    close: "关闭",
    memberLogin: "成员账号登录",
    loginIntro: "可使用邮箱或账号登录。登录后只能创建和维护属于自己的资料卡。",
    loginToPublish: "资料已保留。登录或注册后即可继续发布，不会丢失刚才填写的内容。",
    identifier: "邮箱或账号",
    identifierPlaceholder: "name@example.com 或账号",
    password: "密码",
    passwordPlaceholder: "输入密码",
    login: "登录",
    openRegister: "没有账号？使用邮箱注册",
    registerTitle: "注册成员账号",
    registerIntro: "账号仅支持小写英文字母、数字、下划线和短横线，须以字母开头，长度 6–25 位。",
    email: "邮箱",
    username: "账号",
    usernamePlaceholder: "例如：ray_2026",
    newPasswordPlaceholder: "至少 8 位",
    confirmPassword: "确认密码",
    confirmPasswordPlaceholder: "再次输入密码",
    verificationCode: "邮箱验证码",
    verificationCodePlaceholder: "输入邮件中的验证码",
    sendCode: "发送验证码",
    backToLogin: "已有账号？返回登录",
    memberProfile: "MEMBER PROFILE",
    editorAddAdmin: "添加成员",
    editorAddSelf: "创建我的资料卡",
    editorEdit: "修改成员资料",
    editorIntro: "大约 1 分钟完成。先填写 4 个必填项，其他资料以后也可以补充。",
    coreFieldsTitle: "1 分钟资料卡",
    optionalFieldsTitle: "补充更多资料（选填）",
    optionalFieldsHint: "地区、经历和联系方式可以稍后再填",
    profileAiTitle: "让 AI 帮你写",
    profileAiPitch: "不会写？输入一段自我介绍，AI 自动生成资料卡。",
    profileAiPlaceholder: "例如：我是 Ray，目前在做 AI Agent 产品，擅长工作流设计，希望认识 Web3 创业者和开发者……",
    profileAiGenerate: "AI 生成资料卡",
    profileAiGenerating: "AI 正在整理…",
    profileAiGenerated: "资料卡已生成，你可以继续修改。",
    profileAiRequired: "请先输入一段自我介绍。",
    profileAiFailed: "AI 暂时没有生成成功，你仍然可以手动填写。",
    visibilityNote: "完善资料后，你可以被其他成员通过 AI、技能、职业和地区搜索到。",
    cancel: "取消",
    saveMember: "发布资料卡",
    saveChanges: "保存修改",
    saving: "保存中…",
    dangerZone: "DANGER ZONE",
    confirmDeleteTitle: "确认删除成员？",
    confirmDelete: "确认删除",
    deleting: "删除中…",
    edit: "编辑",
    delete: "删除",
    defaultOccupation: "Seed Club 成员",
    loadingIntent: "正在理解你的需求",
    loadingIntentDetail: "AI 正在把自然语言转换成成员搜索条件…",
    aiFailedTitle: "这次没有搜索成功",
    aiFallbackSummary: "根据“{query}”查找成员",
    noAiMatches: "目前的真实成员资料中还没有找到同时符合全部条件的成员。",
    aiMatchCount: "从真实成员库中找到 {count} 位同时符合全部条件的成员：",
    matchReason: "匹配原因：{reasons}",
    verifiableSearchLabel: "AI + 可验证证据",
    verifiableSearchNote: "匹配分只衡量当前搜索需求，不评价个人能力。链上数据来自 The Graph，AI 不会补写缺失证据。",
    matchScore: "本次匹配分",
    profileMatch: "资料匹配",
    onchainMatch: "链上活跃度",
    proofAutoChecking: "正在通过 The Graph 核验",
    proofVerified: "已验证链上证据",
    proofNoMatch: "未发现链上证据",
    proofWalletMissing: "未关联公开钱包",
    proofVerificationFailed: "链上核验失败",
    proofPending: "等待链上核验",
    proofNotRequested: "本次需求未要求链上证据",
    proofEvidenceSummary: "{networks} · {protocols}",
    proofIndexedSource: "The Graph · 索引至区块 {block}",
    profileEvidenceOnly: "资料符合需求，但链上经历尚未得到验证。",
    verifiedEvidenceExplanation: "资料符合需求，且 The Graph 已查询到公开链上活动。",
    aiVerifyingMatches: "正在核验候选人的链上证据…",
    viewProfile: "查看完整资料",
    libraryFailed: "成员库连接失败",
    retry: "重新连接",
    unavailable: "暂时无法显示成员",
    resultCount: "找到 {count} 位匹配成员",
    totalCount: "共 {count} 位成员",
    noMembers: "暂时没有找到匹配成员",
    tryDifferent: "换一个姓名、技能、职业或地区试试。",
    loginSuccessAdmin: "管理员登录成功",
    loginSuccessMember: "成员账号登录成功",
    logoutSuccess: "已退出登录",
    profileCreated: "个人资料已创建",
    profileUpdated: "成员资料已更新",
    memberDeleted: "成员已删除",
    codeSent: "验证码已发送，请检查邮箱",
    codeSentTo: "验证码已发送到 {email}",
    verifyComplete: "验证并完成注册",
    verifying: "验证中…",
    sending: "发送中…",
    registered: "账号注册成功",
    registeredWithProfile: "账号注册成功，刚才填写的资料还在，确认后即可发布",
    profileDraftRestored: "资料已保留，确认后点击发布资料卡即可。",
    deleteMessage: "将永久删除“{name}”的成员资料。这个操作不能撤销。",
    errorInvalidLogin: "账号或密码不正确，请重新输入。",
    errorInvalidCode: "验证码不正确或已过期，请重新获取。",
    errorAlreadyRegistered: "这个邮箱或账号已经注册，请直接登录。",
    errorCaptcha: "需要完成安全验证，请刷新页面后重试。",
    errorDuplicateProfile: "每个账号只能创建一张资料卡，你可以编辑已有资料。",
    errorPermission: "权限不足：你只能修改自己创建的资料卡。",
    errorNetwork: "网络连接不稳定，请检查网络后重试。",
    errorLimit: "今天的 10 次 AI 搜索已经用完，明天可以继续使用。",
    errorDeepSeek: "AI 服务还没有完成密钥配置，请联系管理员。",
    errorGeneric: "操作没有成功，请稍后重试。",
    errorDetailedQuery: "请再具体描述一下你想找什么样的人。",
    errorAnonymous: "请确认 CloudBase 匿名登录已开启，并刷新页面重试。",
    errorAiFallback: "AI 搜索暂时不可用，你仍然可以使用下面的关键词搜索。",
    errorLoginState: "登录状态没有正确建立，请重试。",
    errorLogin: "登录失败，请重新输入。",
    errorUsername: "账号仅支持小写英文字母、数字、下划线和短横线，须以字母开头，长度 6–25 位。",
    errorPasswordLength: "密码长度需要在 8–64 位之间。",
    errorPasswordMismatch: "两次输入的密码不一致。",
    errorCodeDelivery: "验证码没有正确发送，请稍后重试。",
    errorCodeRequired: "请输入邮箱验证码。",
    errorRegistrationState: "注册成功，但登录状态没有建立，请返回登录。",
    errorRegistration: "注册没有成功，请重试。",
    errorRequiredFields: "请填写昵称、我现在在做什么、我擅长什么和我希望认识什么人。",
    errorOwnOnly: "你只能修改自己创建的资料卡。",
    errorSave: "保存失败，请重试。",
    errorDelete: "删除失败，请重试。",
    nameMatch: "姓名匹配“{value}”",
    nameClose: "姓名接近“{value}”",
    skillMatch: "擅长 {value}",
    experienceSkill: "经历涉及 {value}",
    locationMatch: "所在地匹配 {value}",
    occupationMatch: "职业方向匹配 {value}",
    experienceMatch: "经历中包含 {value}",
    keywordMatch: "资料中提到 {value}",
    fieldName: "昵称",
    fieldNamePlaceholder: "例如：Leo",
    fieldNickname: "昵称",
    fieldNicknamePlaceholder: "成员常用昵称",
    fieldOccupation: "我现在在做什么",
    fieldOccupationPlaceholder: "例如：正在做 AI Agent 产品，或 Solidity 开发者",
    fieldLocation: "所在地",
    fieldLocationPlaceholder: "例如：上海",
    fieldSkills: "我擅长什么",
    fieldSkillsPlaceholder: "用逗号或换行分隔，例如：AI Agent，DeFi，智能合约审计",
    fieldExperience: "个人经历",
    fieldExperiencePlaceholder: "工作、项目或研究经历",
    fieldIntro: "我希望认识什么人",
    fieldIntroPlaceholder: "例如：希望认识 Web3 创业者、产品经理和智能合约开发者",
    fieldWechat: "微信",
    fieldWechatPlaceholder: "微信号",
    fieldEmail: "邮箱",
  },
  en: {
    homeAria: "Seed Club Talent home",
    switchLanguage: "切换到中文",
    adminMode: "Admin mode",
    memberAccount: "Member account",
    createMyProfile: "Create my profile",
    editMyProfile: "Edit my profile",
    addMember: "+ Add member",
    normalizeAllSkills: "AI clean up old skills",
    normalizingSkills: "AI processing {current}/{total}",
    aiStandardSkills: "AI-standardized skills",
    aiPreparingSkills: "AI is standardizing skills…",
    aiSkillsUpdated: "AI-standardized skills updated",
    aiSkillsBatchDone: "Standardized skills for {success} members",
    aiSkillsBatchPartial: "Processed {success}; {failed} failed",
    aiSkillsFallbackSaved: "Profile saved. AI skill standardization can be retried later by an admin.",
    web3Identity: "WEB3 IDENTITY",
    web3IdentityEditor: "Web3 identity",
    web3IdentityHint: "Connect or enter a public wallet address to read real onchain activity. Connecting never starts a transaction.",
    fieldWallet: "Wallet address",
    fieldWalletPlaceholder: "0x…",
    fieldEns: "ENS (optional)",
    fieldEnsPlaceholder: "Example: ray.eth",
    connectWallet: "Connect wallet",
    walletConnecting: "Connecting…",
    walletConnected: "Wallet connected. It will be public after you save the profile.",
    walletValid: "The wallet address is valid. It will be public after you save the profile.",
    walletProviderMissing: "No browser wallet was detected. You can paste a 0x address instead.",
    walletRequestRejected: "Wallet connection was not completed. Allow the connection in your wallet and try again.",
    walletInvalid: "Enter a complete, valid 0x wallet address.",
    walletPublicNote: "Wallet and ENS are public. This connection associates an address; ownership is not signature-verified yet.",
    network: "Network",
    onchainActivity: "Recent onchain activity",
    protocol: "Protocol",
    verifyOnchain: "Load live onchain data",
    verifyingOnchain: "Querying The Graph…",
    liveGraphData: "Live data from The Graph",
    verifiedOnchainActivity: "VERIFIED ONCHAIN ACTIVITY",
    proofLiveBadge: "LIVE",
    proofScore: "Onchain Activity Score",
    proofScoreValue: "{score} / 100",
    proofScoreDisclaimer: "Measures only the queried onchain activity. It is not a credit score or a judgment of ability.",
    proofActiveSince: "Active since",
    proofRecentActivity: "90-day transactions",
    proofNetworks: "Verified networks",
    proofProtocols: "Verified protocols",
    proofPositions: "Active liquidity positions",
    proofNotAvailable: "No evidence yet",
    proofNoEvidence: "The Graph query succeeded, but no Uniswap V3 evidence was found for this address.",
    proofBreakdown: "Score breakdown",
    proofHistory: "Activity history",
    proofRecent: "Recent activity",
    proofPositionEvidence: "Current positions",
    proofProtocolEvidence: "Protocol evidence",
    proofPoints: "{points}/{max} pts",
    proofRecentEvidence: "Recent verifiable records",
    proofActivityMint: "Added liquidity",
    proofActivityBurn: "Removed liquidity",
    proofActivityCollect: "Collected liquidity",
    proofActivityPosition: "Created position",
    proofPoweredBy: "Powered by The Graph",
    proofLimitedResult: "The 90-day count for this high-activity wallet is limited by the query cap.",
    graphIndexedBlock: "Indexed through block {block}",
    graphQueryFailed: "Onchain data could not be loaded. Check The Graph configuration and try again.",
    graphNotConfigured: "The cloud function could not read the The Graph API key.",
    graphAuthFailed: "The Graph API key is invalid, restricted, or has no available spending limit.",
    graphProviderFailed: "The Graph is connected, but the current Subgraph query failed.",
    graphTimeout: "The Graph query timed out. Try again shortly.",
    loginRegister: "Log in / Sign up",
    logout: "Log out",
    heroTitle: "Create your Seed Club profile and let the community discover you",
    heroSubtitle: "Complete your profile so other members can find you through AI, skills, roles, and locations.",
    heroCta: "Create my profile",
    heroEditCta: "Edit my profile",
    heroBrowse: "Browse community members",
    heroAiHint: "Not sure what to write? Add a short introduction and AI will create your profile.",
    newcomerLabel: "NEW MEMBERS",
    newcomerTitle: "Recently joined Seed Club",
    newcomerIntro: "Members who create or update their profiles appear here.",
    newcomerEmpty: "No public member profiles yet. Be the first to join.",
    newcomerView: "View profile",
    discoverLabel: "DISCOVER MEMBERS",
    discoverTitle: "Find people with evidence you can verify",
    discoverIntro: "AI interprets the request, member profiles provide the match, and The Graph supplies verifiable onchain evidence.",
    aiSearchLabel: "Describe the person you are looking for",
    aiPlaceholder: "Example: Find a Solidity developer with real DeFi onchain experience",
    aiQuota: "10 AI searches per network each day",
    aiQuotaRemaining: "{count} AI searches remaining today",
    aiSearch: "Find with AI",
    aiSearching: "Searching…",
    aiExamplesAria: "AI search examples",
    aiTradeQuery: "Find a Solidity developer with real DeFi onchain experience",
    aiSecurityQuery: "Who works on Agent Security?",
    aiXianQuery: "Find a Web3 member in Xi'an",
    keywordDivider: "or search with exact keywords",
    memberSearchLabel: "Search members",
    keywordPlaceholder: "Search names, skills, roles, locations…",
    search: "Search",
    examplesAria: "Search examples",
    tryIt: "Try:",
    quantitativeQuery: "Quantitative",
    xianQuery: "Xi'an",
    memberDirectory: "MEMBER DIRECTORY",
    connecting: "Connecting to the member directory…",
    clearSearch: "Clear search",
    loadingProfiles: "Loading member profiles",
    boardLabel: "COMMUNITY BOARD",
    boardTitle: "Member message board",
    boardIntro: "Read community messages. Log in with a member account to join the conversation.",
    boardRefresh: "Refresh messages",
    boardRefreshing: "Refreshing…",
    boardLoginPrompt: "Log in with a member account to leave a message",
    boardLoginButton: "Log in to post",
    boardAutoTranslated: "Messages are automatically available in Chinese and English",
    boardPlaceholder: "Share an update, look for collaborators, or say hello to the community…",
    boardPost: "Post message",
    boardPosting: "Posting…",
    boardCount: "{count} messages",
    boardEmpty: "No messages yet",
    boardEmptyIntro: "Log in and start the conversation.",
    boardLoading: "Loading messages",
    boardLoadFailed: "The message board is temporarily unavailable",
    boardRetry: "Reload",
    boardDelete: "Delete",
    boardDeleteConfirm: "Delete this message?",
    boardPosted: "Message posted",
    boardDeleted: "Message deleted",
    boardCharacters: "{count}/500",
    boardTooLong: "Messages must contain between 1 and 500 characters.",
    boardLoginRequired: "Log in with a member account before posting.",
    boardPostFailed: "The message could not be posted. Please try again.",
    boardDeleteFailed: "The message could not be deleted. Please try again.",
    announcement: "What's new",
    announcementLabel: "WHAT'S NEW",
    announcementPublishedAt: "Updated {time}",
    announcementEdit: "Edit this announcement",
    announcementAdmin: "Publish an update",
    announcementEditorLabel: "ADMIN UPDATE",
    announcementEditorNew: "Publish a new announcement",
    announcementEditorEdit: "Edit current announcement",
    announcementEditorIntro: "Write in either language. Chinese and English versions are generated automatically. A new announcement opens once for every visitor.",
    announcementTitleField: "Announcement title",
    announcementTitlePlaceholder: "Example: The member message board is live",
    announcementContentField: "What's changed",
    announcementContentPlaceholder: "Briefly describe what was added or improved…",
    announcementPublish: "Translate and publish",
    announcementSaveChanges: "Translate and save changes",
    announcementSaving: "Translating and saving…",
    announcementPublished: "New announcement published",
    announcementUpdated: "Announcement updated",
    announcementRequired: "Enter an announcement title and update details.",
    announcementSaveFailed: "The announcement could not be saved. Please try again.",
    translationFallback: "Automatic translation is temporarily unavailable. The original text was saved.",
    crowdfundBanner: "Seed Club Talent crowdfunding",
    crowdfundBannerAction: "View payment details and public total",
    crowdfundLabel: "CROWDFUNDING",
    crowdfundTitle: "Crowdfunding payment and public total",
    crowdfundIntro: "Thank you for supporting the continued development and operation of Seed Club Talent.",
    crowdfundNetwork: "Network",
    crowdfundNetworkValue: "EVM (confirm the exact network and token with the administrator before transferring)",
    crowdfundAddress: "Crypto payment address",
    crowdfundCopy: "Copy address",
    crowdfundCopied: "EVM payment address copied",
    crowdfundRaised: "Confirmed amount raised",
    crowdfundRaisedValue: "No confirmed contributions yet",
    crowdfundUpdated: "Disclosure updated: {time}",
    crowdfundEdit: "Edit crowdfunding ledger",
    crowdfundEditorLabel: "ADMIN LEDGER",
    crowdfundEditorTitle: "Edit crowdfunding and expense disclosure",
    crowdfundEditorIntro: "Write in either language. Chinese and English versions are generated when saved, and visitors will see the latest disclosure after refreshing. Enter one expense or budget item per line.",
    crowdfundRaisedField: "Confirmed amount raised",
    crowdfundRaisedPlaceholder: "Example: 100 USDT (Ethereum)",
    crowdfundCurrentField: "Confirmed expenses to date",
    crowdfundCurrentPlaceholder: "Example: Brand domain registration (1 year): ¥83",
    crowdfundFutureField: "Estimated budget for the next 12 months",
    crowdfundFuturePlaceholder: "Example: Domain renewal: approx. ¥90 / year",
    crowdfundSave: "Translate and update disclosure",
    crowdfundSaving: "Translating and updating…",
    crowdfundSaved: "Crowdfunding and expense disclosure updated",
    crowdfundRequired: "Enter the payment address, amount raised, current expenses, and future budget.",
    crowdfundSaveFailed: "The ledger could not be updated. Please try again.",
    expenseCurrentTitle: "Confirmed expenses to date",
    expenseFutureTitle: "Estimated budget for the next 12 months",
    expenseItem: "Item",
    expenseAmount: "Amount",
    expenseDomainRegistration: "Brand domain registration (1 year)",
    expenseCloudReconcile: "Cloud services, database, and functions",
    expensePendingReconcile: "Pending billing reconciliation",
    expenseConfirmedTotal: "Total confirmed expenses",
    expenseDomainRenewal: "Domain renewal",
    expenseDomainRenewalAmount: "Approx. ¥90 / year",
    expenseInfrastructure: "Hosting, CDN, database, and cloud functions",
    expenseInfrastructureAmount: "¥0–100 / month",
    expenseAiApi: "AI search and translation APIs",
    expenseAiApiAmount: "¥0–300 / month",
    expenseMessaging: "Email, backups, and security",
    expenseMessagingAmount: "¥0–200 / month",
    expenseContingency: "Scaling and contingency reserve",
    expenseContingencyAmount: "¥0–200 / month",
    expenseEstimatedTotal: "Estimated annual budget",
    expenseEstimatedTotalAmount: "Approx. ¥90–9,690",
    expenseEstimateNote: "This is an internal small-scale operating estimate, not a real-time bill or fixed provider quote. Actual expenses will be updated from billing records.",
    crowdfundNotice: "Confirm the EVM network and token before transferring. Assets sent over an incompatible network may not be recoverable. The public total is updated after administrator verification.",
    footerTagline: "Make skills easier to discover and collaboration faster to start.",
    close: "Close",
    memberLogin: "Member login",
    loginIntro: "Log in with your email or username. You can create and maintain only your own profile.",
    loginToPublish: "Your profile draft is saved. Log in or sign up to continue publishing without losing what you wrote.",
    identifier: "Email or username",
    identifierPlaceholder: "name@example.com or username",
    password: "Password",
    passwordPlaceholder: "Enter password",
    login: "Log in",
    openRegister: "New here? Sign up with email",
    registerTitle: "Create a member account",
    registerIntro: "Usernames must start with a lowercase letter, contain only lowercase letters, numbers, underscores, or hyphens, and be 6–25 characters long.",
    email: "Email",
    username: "Username",
    usernamePlaceholder: "Example: ray_2026",
    newPasswordPlaceholder: "At least 8 characters",
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Enter password again",
    verificationCode: "Email verification code",
    verificationCodePlaceholder: "Enter the code from your email",
    sendCode: "Send verification code",
    backToLogin: "Already registered? Back to login",
    memberProfile: "MEMBER PROFILE",
    editorAddAdmin: "Add member",
    editorAddSelf: "Create my profile",
    editorEdit: "Edit member profile",
    editorIntro: "It takes about one minute. Complete the four required fields now and add the rest later.",
    coreFieldsTitle: "Your one-minute profile",
    optionalFieldsTitle: "Add more details (optional)",
    optionalFieldsHint: "Location, experience, and contact details can be added later",
    profileAiTitle: "Let AI help you write",
    profileAiPitch: "Not sure what to write? Add a short introduction and AI will create your profile.",
    profileAiPlaceholder: "Example: I am Ray. I build AI agent products, specialize in workflow design, and want to meet Web3 founders and developers…",
    profileAiGenerate: "Generate profile with AI",
    profileAiGenerating: "AI is preparing your profile…",
    profileAiGenerated: "Your profile is ready. You can edit it before publishing.",
    profileAiRequired: "Enter a short introduction first.",
    profileAiFailed: "AI could not generate the profile right now. You can still complete it manually.",
    visibilityNote: "Complete your profile so other members can find you through AI, skills, roles, and locations.",
    cancel: "Cancel",
    saveMember: "Publish profile",
    saveChanges: "Save changes",
    saving: "Saving…",
    dangerZone: "DANGER ZONE",
    confirmDeleteTitle: "Delete this member?",
    confirmDelete: "Delete member",
    deleting: "Deleting…",
    edit: "Edit",
    delete: "Delete",
    defaultOccupation: "Seed Club member",
    loadingIntent: "Understanding your request",
    loadingIntentDetail: "AI is converting your request into member search conditions…",
    aiFailedTitle: "The search was not successful",
    aiFallbackSummary: "Searching members for “{query}”",
    noAiMatches: "No member currently matches every requested condition.",
    aiMatchCount: "Found {count} members who match every requested condition:",
    matchReason: "Why they match: {reasons}",
    verifiableSearchLabel: "AI + VERIFIABLE EVIDENCE",
    verifiableSearchNote: "The match score applies only to this search and does not judge ability. Onchain data comes from The Graph; AI never fills in missing evidence.",
    matchScore: "Search match",
    profileMatch: "Profile match",
    onchainMatch: "Onchain activity",
    proofAutoChecking: "Checking with The Graph",
    proofVerified: "Verified onchain evidence",
    proofNoMatch: "No onchain evidence found",
    proofWalletMissing: "No public wallet linked",
    proofVerificationFailed: "Onchain verification failed",
    proofPending: "Waiting for verification",
    proofNotRequested: "Onchain evidence was not required",
    proofEvidenceSummary: "{networks} · {protocols}",
    proofIndexedSource: "The Graph · indexed through block {block}",
    profileEvidenceOnly: "The profile matches, but onchain experience has not been verified.",
    verifiedEvidenceExplanation: "The profile matches and The Graph found public onchain activity.",
    aiVerifyingMatches: "Verifying candidates with live onchain evidence…",
    viewProfile: "View full profile",
    libraryFailed: "Could not connect to the member directory",
    retry: "Reconnect",
    unavailable: "Members are temporarily unavailable",
    resultCount: "Found {count} matching members",
    totalCount: "{count} members",
    noMembers: "No matching members found",
    tryDifferent: "Try another name, skill, role, or location.",
    loginSuccessAdmin: "Admin login successful",
    loginSuccessMember: "Member login successful",
    logoutSuccess: "Logged out",
    profileCreated: "Your profile has been created",
    profileUpdated: "Member profile updated",
    memberDeleted: "Member deleted",
    codeSent: "Verification code sent. Please check your email.",
    codeSentTo: "A verification code was sent to {email}",
    verifyComplete: "Verify and complete registration",
    verifying: "Verifying…",
    sending: "Sending…",
    registered: "Account created",
    registeredWithProfile: "Account created. Your draft is still here and ready to publish.",
    profileDraftRestored: "Your draft is saved. Review it and click Publish profile.",
    deleteMessage: "“{name}” will be permanently deleted. This action cannot be undone.",
    errorInvalidLogin: "The username or password is incorrect.",
    errorInvalidCode: "The verification code is incorrect or has expired.",
    errorAlreadyRegistered: "This email or username is already registered. Please log in.",
    errorCaptcha: "Please complete the security check and try again.",
    errorDuplicateProfile: "Each account can create only one profile. You can edit your existing profile.",
    errorPermission: "You can edit only the profile you created.",
    errorNetwork: "The network connection is unstable. Please try again.",
    errorLimit: "Today's 10 AI searches have been used. Please try again tomorrow.",
    errorDeepSeek: "The AI service has not been fully configured. Please contact an administrator.",
    errorGeneric: "The action could not be completed. Please try again.",
    errorDetailedQuery: "Please describe the person you need in more detail.",
    errorAnonymous: "The visitor session could not be created. Please refresh and try again.",
    errorAiFallback: "AI search is temporarily unavailable. You can still use the keyword search below.",
    errorLoginState: "Your login session was not established. Please try again.",
    errorLogin: "Login failed. Please try again.",
    errorUsername: "Usernames must start with a lowercase letter, contain only lowercase letters, numbers, underscores, or hyphens, and be 6–25 characters long.",
    errorPasswordLength: "Passwords must be 8–64 characters.",
    errorPasswordMismatch: "The passwords do not match.",
    errorCodeDelivery: "The verification code could not be sent. Please try again.",
    errorCodeRequired: "Enter the email verification code.",
    errorRegistrationState: "The account was created, but the login session was not established. Return to login.",
    errorRegistration: "Registration failed. Please try again.",
    errorRequiredFields: "Enter your nickname, current work, skills, and the people you want to meet.",
    errorOwnOnly: "You can edit only the profile you created.",
    errorSave: "The profile could not be saved. Please try again.",
    errorDelete: "The member could not be deleted. Please try again.",
    nameMatch: "Name matches “{value}”",
    nameClose: "Name is close to “{value}”",
    skillMatch: "Skilled in {value}",
    experienceSkill: "Experience includes {value}",
    locationMatch: "Located in {value}",
    occupationMatch: "Role matches {value}",
    experienceMatch: "Experience includes {value}",
    keywordMatch: "Profile mentions {value}",
    fieldName: "Nickname",
    fieldNamePlaceholder: "Example: Leo",
    fieldNickname: "Nickname",
    fieldNicknamePlaceholder: "Commonly used nickname",
    fieldOccupation: "What I am working on",
    fieldOccupationPlaceholder: "Example: Building an AI agent product, or working as a Solidity developer",
    fieldLocation: "Location",
    fieldLocationPlaceholder: "Example: Shanghai",
    fieldSkills: "What I am good at",
    fieldSkillsPlaceholder: "Separate with commas or new lines, e.g. AI Agent, DeFi, smart contract audit",
    fieldExperience: "Experience",
    fieldExperiencePlaceholder: "Work, projects, or research experience",
    fieldIntro: "Who I want to meet",
    fieldIntroPlaceholder: "Example: Web3 founders, product managers, and smart contract developers",
    fieldWechat: "WeChat",
    fieldWechatPlaceholder: "WeChat ID",
    fieldEmail: "Email",
  },
};

function initialLocale() {
  try {
    const saved = window.localStorage.getItem("seedclub-locale");
    if (saved === "zh" || saved === "en") return saved;
  } catch {}
  return navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function t(key, values = {}) {
  const template = messages[state?.locale || "zh"]?.[key] || messages.zh[key] || key;
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

const app = cloudbase.init({ env: ENV_ID });
const auth = app.auth;

function getDb() {
  return app.rdb();
}

function readProfileDraft() {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(PROFILE_DRAFT_STORAGE_KEY) || "null");
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

function storeProfileDraft(profile) {
  const draft = Object.fromEntries(Object.entries(profile).filter(([, value]) => value !== null && value !== ""));
  state.pendingProfileDraft = draft;
  try {
    window.sessionStorage.setItem(PROFILE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {}
}

function clearProfileDraft() {
  state.pendingProfileDraft = null;
  try {
    window.sessionStorage.removeItem(PROFILE_DRAFT_STORAGE_KEY);
  } catch {}
}

const state = {
  members: [],
  query: "",
  isMember: false,
  isAdmin: false,
  currentUid: null,
  currentEmail: "",
  currentUsername: "",
  loading: true,
  saving: false,
  registerVerifier: null,
  registerEmail: "",
  error: "",
  aiLoading: false,
  aiVerifying: false,
  aiError: "",
  aiQuery: "",
  aiIntent: null,
  aiMatches: [],
  aiRemaining: null,
  editorMode: "add",
  editingId: null,
  locale: initialLocale(),
  editorDirty: false,
  bulkNormalizing: false,
  bulkProgress: "",
  boardMessages: [],
  boardLoading: true,
  boardRefreshing: false,
  boardError: "",
  boardPosting: false,
  boardDeletingId: null,
  currentAnnouncement: null,
  announcementMode: "add",
  editingAnnouncementId: null,
  announcementSaving: false,
  currentCrowdfunding: { ...DEFAULT_CROWDFUNDING },
  crowdfundingSaving: false,
  pendingProfileDraft: readProfileDraft(),
  awaitingProfileAuth: false,
  aiProfileGenerating: false,
  onchainProfiles: new Map(),
  onchainErrors: new Map(),
  onchainLoading: new Set(),
};

const essentialFields = [
  { key: "name", labelKey: "fieldName", required: true, placeholderKey: "fieldNamePlaceholder" },
  { key: "occupation", labelKey: "fieldOccupation", required: true, placeholderKey: "fieldOccupationPlaceholder" },
  { key: "skills", labelKey: "fieldSkills", required: true, wide: true, type: "textarea", placeholderKey: "fieldSkillsPlaceholder" },
  { key: "intro", labelKey: "fieldIntro", required: true, wide: true, type: "textarea", placeholderKey: "fieldIntroPlaceholder" },
];

const optionalFields = [
  { key: "location", labelKey: "fieldLocation", placeholderKey: "fieldLocationPlaceholder" },
  { key: "experience", labelKey: "fieldExperience", wide: true, type: "textarea", placeholderKey: "fieldExperiencePlaceholder" },
  { key: "x_account", label: "X", placeholder: "例如：@username" },
  { key: "wechat", labelKey: "fieldWechat", placeholderKey: "fieldWechatPlaceholder" },
  { key: "telegram", label: "Telegram", placeholder: "例如：@username" },
  { key: "email", labelKey: "fieldEmail", type: "email", placeholder: "name@example.com" },
];

const walletFields = [
  { key: "wallet_address", labelKey: "fieldWallet", placeholderKey: "fieldWalletPlaceholder", maxLength: 42 },
  { key: "ens_name", labelKey: "fieldEns", placeholderKey: "fieldEnsPlaceholder", maxLength: 255 },
];

const fields = [...essentialFields, ...walletFields, ...optionalFields];

document.querySelector("#app").innerHTML = `
  <header class="topbar">
    <a class="brand" href="#" aria-label="Seed Club Talent 首页" data-i18n-aria-label="homeAria">
      <span class="brand-mark" aria-hidden="true">S</span>
      <span>Seed Club Talent</span>
    </a>
    <div class="admin-actions">
      <button id="languageBtn" class="button button-quiet button-small language-button" type="button" aria-label="Switch to English">EN</button>
      <button id="announcementOpenBtn" class="button button-quiet button-small" type="button" hidden data-i18n="announcement">更新公告</button>
      <span id="adminBadge" class="admin-badge" hidden>管理员模式</span>
      <button id="announcementAdminBtn" class="button button-quiet button-small" type="button" hidden data-i18n="announcementAdmin">发布更新公告</button>
      <button id="normalizeSkillsBtn" class="button button-quiet button-small" type="button" hidden>AI 整理旧技能</button>
      <button id="addMemberBtn" class="button button-primary button-small" type="button" hidden>＋ 创建我的资料</button>
      <button id="adminBtn" class="button button-quiet button-small" type="button">登录 / 注册</button>
    </div>
  </header>

  <aside class="crowdfund-banner" aria-label="Seed Club Talent 众筹" data-i18n-aria-label="crowdfundBanner">
    <span class="crowdfund-banner-dot" aria-hidden="true"></span>
    <strong data-i18n="crowdfundBanner">Seed Club Talent 众筹</strong>
    <button id="crowdfundOpenBtn" type="button" data-i18n="crowdfundBannerAction">查看收款方式与金额公示</button>
  </aside>

  <main>
    <section class="hero hero-profile" aria-labelledby="pageTitle">
      <div class="eyebrow">SEED CLUB · MEMBER DIRECTORY</div>
      <h1 id="pageTitle" data-i18n="heroTitle">创建你的 Seed Club 资料卡，让社区认识你</h1>
      <p data-i18n="heroSubtitle">完善资料后，你可以被其他成员通过 AI、技能、职业和地区搜索到。</p>
      <div class="hero-actions">
        <button id="heroProfileBtn" class="button button-primary hero-primary-action" type="button" data-i18n="heroCta">创建我的资料卡</button>
        <a class="button button-quiet hero-secondary-action" href="#memberDiscovery" data-i18n="heroBrowse">浏览社区成员</a>
      </div>
      <p class="hero-ai-hint"><span aria-hidden="true">✦</span><span data-i18n="heroAiHint">不会写？输入一段自我介绍，AI 自动生成资料卡。</span></p>
    </section>

    <section class="newcomer-section" aria-labelledby="newcomerTitle">
      <div class="newcomer-heading">
        <div>
          <p class="section-label" data-i18n="newcomerLabel">NEW MEMBERS</p>
          <h2 id="newcomerTitle" data-i18n="newcomerTitle">最近加入 Seed Club 的成员</h2>
          <p data-i18n="newcomerIntro">新创建或刚刚更新资料卡的成员会出现在这里。</p>
        </div>
      </div>
      <div id="newcomerGrid" class="newcomer-grid" aria-live="polite"></div>
    </section>

    <section id="memberDiscovery" class="discovery-section" aria-labelledby="discoveryTitle">
      <div class="discovery-heading">
        <p class="section-label" data-i18n="discoverLabel">DISCOVER MEMBERS</p>
        <h2 id="discoveryTitle" data-i18n="discoverTitle">用真实证据寻找合适的人</h2>
        <p data-i18n="discoverIntro">AI 理解你的需求，成员资料负责匹配，The Graph 提供可验证的链上证据。</p>
      </div>
      <form id="aiSearchForm" class="ai-search-box">
        <label class="sr-only" for="aiSearchInput" data-i18n="aiSearchLabel">用自然语言描述要找的人</label>
        <textarea id="aiSearchInput" rows="2" maxlength="300" placeholder="例如：找一位有真实 DeFi 链上经历的 Solidity 开发者" data-i18n-placeholder="aiPlaceholder"></textarea>
        <div class="ai-search-footer">
          <span id="aiQuotaText" data-i18n="aiQuota">同一网络每天可使用 10 次 AI 搜索</span>
          <button id="aiSearchBtn" class="button button-primary" type="submit" data-i18n="aiSearch">AI 帮我找</button>
        </div>
      </form>
      <div class="ai-suggestions" aria-label="AI 搜索示例" data-i18n-aria-label="aiExamplesAria">
        <button type="button" data-ai-search="找一位有真实 DeFi 链上经历的 Solidity 开发者" data-i18n-query="aiTradeQuery">Solidity + DeFi 证明</button>
        <button type="button" data-ai-search="谁研究 Agent Security？" data-i18n-query="aiSecurityQuery">Agent Security</button>
        <button type="button" data-ai-search="我想找人在西安、可以聊 Web3 的成员" data-i18n-query="aiXianQuery">西安 + Web3</button>
      </div>
      <div id="aiResultPanel" class="ai-result-panel" hidden></div>

      <div class="search-divider"><span data-i18n="keywordDivider">或者使用关键词精准搜索</span></div>
      <form id="searchForm" class="search-box" role="search">
        <label class="sr-only" for="searchInput" data-i18n="memberSearchLabel">搜索成员</label>
        <span class="search-icon" aria-hidden="true"></span>
        <input id="searchInput" type="search" autocomplete="off" placeholder="搜索姓名、技能、职业、地区……" data-i18n-placeholder="keywordPlaceholder" />
        <button class="button button-dark" type="submit" data-i18n="search">搜索</button>
      </form>
      <div class="suggestions" aria-label="搜索示例" data-i18n-aria-label="examplesAria">
        <span data-i18n="tryIt">试试：</span>
        <button type="button" data-search="Darrick">Darrick</button>
        <button type="button" data-search="量化" data-i18n="quantitativeQuery" data-i18n-query="quantitativeQuery">量化</button>
        <button type="button" data-search="Agent Security">Agent Security</button>
        <button type="button" data-search="西安" data-i18n="xianQuery" data-i18n-query="xianQuery">西安</button>
      </div>
    </section>

    <section class="results-section" aria-live="polite" aria-busy="true">
      <div class="results-heading">
        <div>
          <p class="section-label" data-i18n="memberDirectory">MEMBER DIRECTORY</p>
          <h2 id="resultTitle" data-i18n="connecting">正在连接成员库…</h2>
        </div>
        <button id="clearSearchBtn" class="text-button" type="button" hidden data-i18n="clearSearch">清除搜索</button>
      </div>
      <div id="statusPanel" class="status-panel loading-state">
        <span class="spinner" aria-hidden="true"></span>
        <p data-i18n="loadingProfiles">正在读取成员资料</p>
      </div>
      <div id="memberGrid" class="member-grid"></div>
    </section>

    <section id="messageBoardSection" class="message-board-section" aria-labelledby="messageBoardTitle">
      <div class="message-board-shell">
        <div class="message-board-heading">
          <div>
            <p class="section-label" data-i18n="boardLabel">COMMUNITY BOARD</p>
            <h2 id="messageBoardTitle" data-i18n="boardTitle">成员留言板</h2>
            <p data-i18n="boardIntro">查看社区留言。登录成员账号后，可以在这里留言和交流。</p>
          </div>
          <button id="messageRefreshBtn" class="button button-quiet button-small" type="button" data-i18n="boardRefresh">刷新留言</button>
        </div>

        <div id="messageLoginPrompt" class="message-login-prompt">
          <div><strong data-i18n="boardLoginPrompt">登录成员账号后即可参与留言</strong><span data-i18n="boardAutoTranslated">留言会自动生成中文和英文版本</span></div>
          <button id="messageLoginBtn" class="button button-dark button-small" type="button" data-i18n="boardLoginButton">登录后留言</button>
        </div>

        <form id="messageForm" class="message-composer" hidden>
          <label class="sr-only" for="messageInput" data-i18n="boardPlaceholder">分享近况、寻找合作，或者和社区成员打个招呼……</label>
          <textarea id="messageInput" maxlength="500" rows="4" placeholder="分享近况、寻找合作，或者和社区成员打个招呼……" data-i18n-placeholder="boardPlaceholder"></textarea>
          <div class="message-composer-footer">
            <span id="messageCharacterCount">0/500</span>
            <p id="messageFormError" class="form-error" role="alert"></p>
            <button id="messageSubmitBtn" class="button button-primary" type="submit" data-i18n="boardPost">发布留言</button>
          </div>
        </form>

        <div id="messageBoardMeta" class="message-board-meta"></div>
        <div id="messageBoardStatus" class="message-board-status"></div>
        <div id="messageList" class="message-list"></div>
      </div>
    </section>
  </main>

  <footer>
    <span>Seed Club Talent</span>
    <span data-i18n="footerTagline">让能力更容易被看见，让合作更快发生。</span>
  </footer>

  <dialog id="loginDialog" class="dialog dialog-login">
    <form id="loginForm" class="dialog-card">
      <button class="icon-button dialog-close" type="button" data-close-dialog aria-label="关闭" data-i18n-aria-label="close">×</button>
      <p class="section-label">MEMBER ACCESS</p>
      <h2 data-i18n="memberLogin">成员账号登录</h2>
      <p class="dialog-intro" data-i18n="loginIntro">可使用邮箱或账号登录。登录后只能创建和维护属于自己的资料卡。</p>
      <p id="loginProfileContext" class="login-profile-context" hidden data-i18n="loginToPublish">资料已保留。登录或注册后即可继续发布，不会丢失刚才填写的内容。</p>
      <label class="field">
        <span data-i18n="identifier">邮箱或账号</span>
        <input id="usernameInput" name="username" autocomplete="username" required autofocus placeholder="name@example.com 或账号" data-i18n-placeholder="identifierPlaceholder" />
      </label>
      <label class="field">
        <span data-i18n="password">密码</span>
        <input id="passwordInput" name="password" type="password" autocomplete="current-password" required placeholder="输入密码" data-i18n-placeholder="passwordPlaceholder" />
      </label>
      <p id="loginError" class="form-error" role="alert"></p>
      <button id="loginSubmitBtn" class="button button-dark button-full" type="submit" data-i18n="login">登录</button>
      <button id="openRegisterBtn" class="text-button auth-switch" type="button" data-i18n="openRegister">没有账号？使用邮箱注册</button>
    </form>
  </dialog>

  <dialog id="registerDialog" class="dialog dialog-login">
    <form id="registerForm" class="dialog-card">
      <button class="icon-button dialog-close" type="button" data-close-dialog aria-label="关闭" data-i18n-aria-label="close">×</button>
      <p class="section-label">CREATE ACCOUNT</p>
      <h2 data-i18n="registerTitle">注册成员账号</h2>
      <p class="dialog-intro" data-i18n="registerIntro">账号仅支持小写英文字母、数字、下划线和短横线，须以字母开头，长度 6–25 位。</p>
      <div id="registerStartFields">
        <label class="field"><span data-i18n="email">邮箱</span><input id="registerEmailInput" name="email" type="email" autocomplete="email" required placeholder="name@example.com" /></label>
        <label class="field"><span data-i18n="username">账号</span><input id="registerUsernameInput" name="username" minlength="6" maxlength="25" pattern="[a-z][a-z0-9_-]{5,24}" autocomplete="username" autocapitalize="none" spellcheck="false" aria-describedby="registerUsernameValidation" required placeholder="例如：ray_2026" data-i18n-placeholder="usernamePlaceholder" /><span id="registerUsernameValidation" class="field-validation" aria-live="polite"></span></label>
        <label class="field"><span data-i18n="password">密码</span><input id="registerPasswordInput" name="password" type="password" minlength="8" maxlength="64" autocomplete="new-password" required placeholder="至少 8 位" data-i18n-placeholder="newPasswordPlaceholder" /></label>
        <label class="field"><span data-i18n="confirmPassword">确认密码</span><input id="registerConfirmInput" name="confirmPassword" type="password" minlength="8" maxlength="64" autocomplete="new-password" required placeholder="再次输入密码" data-i18n-placeholder="confirmPasswordPlaceholder" /></label>
      </div>
      <div id="registerVerifyFields" hidden>
        <p id="verificationHint" class="verification-hint"></p>
        <label class="field"><span data-i18n="verificationCode">邮箱验证码</span><input id="registerCodeInput" name="verificationCode" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="输入邮件中的验证码" data-i18n-placeholder="verificationCodePlaceholder" /></label>
      </div>
      <p id="registerError" class="form-error" role="alert"></p>
      <button id="registerSubmitBtn" class="button button-dark button-full" type="submit" data-i18n="sendCode">发送验证码</button>
      <button id="backToLoginBtn" class="text-button auth-switch" type="button" data-i18n="backToLogin">已有账号？返回登录</button>
    </form>
  </dialog>

  <dialog id="memberDialog" class="dialog dialog-editor">
    <form id="memberForm" class="dialog-card editor-card">
      <div class="dialog-header">
        <div>
          <p class="section-label" data-i18n="memberProfile">MEMBER PROFILE</p>
          <h2 id="editorTitle">添加成员</h2>
        </div>
        <button class="icon-button" type="button" data-close-dialog aria-label="关闭" data-i18n-aria-label="close">×</button>
      </div>
      <p class="dialog-intro" data-i18n="editorIntro">大约 1 分钟完成。先填写 4 个必填项，其他资料以后也可以补充。</p>
      <section class="profile-ai-assist" aria-labelledby="profileAiTitle">
        <div>
          <p class="section-label">AI PROFILE</p>
          <h3 id="profileAiTitle" data-i18n="profileAiTitle">让 AI 帮你写</h3>
          <p data-i18n="profileAiPitch">不会写？输入一段自我介绍，AI 自动生成资料卡。</p>
        </div>
        <textarea id="profileAiInput" rows="3" maxlength="1600" placeholder="例如：我是 Ray，目前在做 AI Agent 产品，擅长工作流设计，希望认识 Web3 创业者和开发者……" data-i18n-placeholder="profileAiPlaceholder"></textarea>
        <div class="profile-ai-actions">
          <p id="profileAiStatus" role="status" aria-live="polite"></p>
          <button id="profileAiGenerateBtn" class="button button-quiet button-small" type="button" data-i18n="profileAiGenerate">AI 生成资料卡</button>
        </div>
      </section>
      <div id="memberFields" class="profile-fields"></div>
      <div class="visibility-note">
        <span class="status-dot"></span>
        <span data-i18n="visibilityNote">当前按现有权限规则保存为公开成员资料</span>
      </div>
      <p id="memberError" class="form-error" role="alert"></p>
      <div class="form-actions">
        <button class="button button-quiet" type="button" data-close-dialog data-i18n="cancel">取消</button>
        <button id="saveMemberBtn" class="button button-dark" type="submit">发布资料卡</button>
      </div>
    </form>
  </dialog>

  <dialog id="deleteDialog" class="dialog dialog-confirm">
    <form id="deleteForm" class="dialog-card">
      <p class="section-label danger-label" data-i18n="dangerZone">DANGER ZONE</p>
      <h2 data-i18n="confirmDeleteTitle">确认删除成员？</h2>
      <p id="deleteMessage" class="dialog-intro"></p>
      <p id="deleteError" class="form-error" role="alert"></p>
      <div class="form-actions">
        <button class="button button-quiet" type="button" data-close-dialog data-i18n="cancel">取消</button>
        <button id="deleteSubmitBtn" class="button button-danger" type="submit" data-i18n="confirmDelete">确认删除</button>
      </div>
    </form>
  </dialog>

  <dialog id="announcementDialog" class="dialog announcement-dialog">
    <article class="dialog-card announcement-card">
      <button class="icon-button dialog-close" type="button" data-close-dialog aria-label="关闭" data-i18n-aria-label="close">×</button>
      <p class="section-label" data-i18n="announcementLabel">WHAT'S NEW</p>
      <h2 id="announcementTitle"></h2>
      <p id="announcementContent" class="announcement-content"></p>
      <time id="announcementTime"></time>
      <button id="announcementEditBtn" class="button button-quiet button-small" type="button" hidden data-i18n="announcementEdit">编辑当前公告</button>
    </article>
  </dialog>

  <dialog id="announcementEditorDialog" class="dialog dialog-editor">
    <form id="announcementForm" class="dialog-card editor-card">
      <button class="icon-button dialog-close" type="button" data-close-dialog aria-label="关闭" data-i18n-aria-label="close">×</button>
      <p class="section-label" data-i18n="announcementEditorLabel">ADMIN UPDATE</p>
      <h2 id="announcementEditorTitle" data-i18n="announcementEditorNew">发布新公告</h2>
      <p class="dialog-intro" data-i18n="announcementEditorIntro">填写任意一种语言，发布时会自动生成中文和英文版本。发布新公告后，访客会自动看到一次弹窗。</p>
      <label class="field">
        <span data-i18n="announcementTitleField">公告标题</span>
        <input id="announcementTitleInput" maxlength="120" required placeholder="例如：成员留言板正式上线" data-i18n-placeholder="announcementTitlePlaceholder" />
      </label>
      <label class="field">
        <span data-i18n="announcementContentField">更新内容</span>
        <textarea id="announcementContentInput" maxlength="2000" rows="7" required placeholder="简要说明本次增加或调整了什么……" data-i18n-placeholder="announcementContentPlaceholder"></textarea>
      </label>
      <p id="announcementFormError" class="form-error" role="alert"></p>
      <div class="form-actions">
        <button class="button button-quiet" type="button" data-close-dialog data-i18n="cancel">取消</button>
        <button id="announcementSubmitBtn" class="button button-primary" type="submit" data-i18n="announcementPublish">翻译并发布</button>
      </div>
    </form>
  </dialog>

  <dialog id="crowdfundDialog" class="dialog crowdfund-dialog">
    <article class="dialog-card crowdfund-card">
      <button class="icon-button dialog-close" type="button" data-close-dialog aria-label="关闭" data-i18n-aria-label="close">×</button>
      <p class="section-label" data-i18n="crowdfundLabel">CROWDFUNDING</p>
      <h2 data-i18n="crowdfundTitle">众筹收款与金额公示</h2>
      <p class="dialog-intro" data-i18n="crowdfundIntro">感谢你支持 Seed Club Talent 的持续开发与运营。</p>
      <dl class="crowdfund-details">
        <div>
          <dt data-i18n="crowdfundNetwork">收款网络</dt>
          <dd data-i18n="crowdfundNetworkValue">EVM（转账前请向管理员确认具体网络与币种）</dd>
        </div>
        <div class="crowdfund-address-row">
          <dt data-i18n="crowdfundAddress">虚拟货币收款地址</dt>
          <dd><code id="crowdfundAddress">${CROWDFUND_EVM_ADDRESS}</code><button id="crowdfundCopyBtn" class="button button-quiet button-small" type="button" data-i18n="crowdfundCopy">复制地址</button></dd>
        </div>
        <div class="crowdfund-total-row">
          <dt data-i18n="crowdfundRaised">已筹金额</dt>
          <dd id="crowdfundRaisedValue">暂无已确认入账</dd>
        </div>
      </dl>
      <section class="expense-ledger" aria-labelledby="expenseCurrentTitle">
        <h3 id="expenseCurrentTitle" data-i18n="expenseCurrentTitle">目前已确认开支</h3>
        <p id="crowdfundCurrentExpenses" class="expense-public-text"></p>
      </section>
      <section class="expense-ledger" aria-labelledby="expenseFutureTitle">
        <h3 id="expenseFutureTitle" data-i18n="expenseFutureTitle">未来 12 个月预算</h3>
        <p id="crowdfundFutureBudget" class="expense-public-text"></p>
        <p class="expense-estimate-note" data-i18n="expenseEstimateNote">预算按当前小规模运营估算，不是实时账单或服务商固定报价；实际开支将按账单更新。</p>
      </section>
      <p class="crowdfund-notice" data-i18n="crowdfundNotice">转账前请先确认所使用的 EVM 网络和币种。不同网络之间的资产无法自动找回；入账金额由管理员核对后更新公示。</p>
      <time id="crowdfundUpdated" class="crowdfund-updated"></time>
      <button id="crowdfundEditBtn" class="button button-quiet button-small" type="button" hidden data-i18n="crowdfundEdit">编辑众筹账本</button>
    </article>
  </dialog>

  <dialog id="crowdfundEditorDialog" class="dialog dialog-editor">
    <form id="crowdfundForm" class="dialog-card editor-card">
      <button class="icon-button dialog-close" type="button" data-close-dialog aria-label="关闭" data-i18n-aria-label="close">×</button>
      <p class="section-label" data-i18n="crowdfundEditorLabel">ADMIN LEDGER</p>
      <h2 data-i18n="crowdfundEditorTitle">编辑众筹与开支公示</h2>
      <p class="dialog-intro" data-i18n="crowdfundEditorIntro">填写任意一种语言，保存时会自动生成中文和英文版本，访客刷新页面即可看到最新公示。每行填写一个开支或预算项目。</p>
      <label class="field">
        <span data-i18n="crowdfundAddress">虚拟货币收款地址</span>
        <input id="crowdfundAddressInput" maxlength="80" pattern="0x[0-9a-fA-F]{40}" required />
      </label>
      <label class="field">
        <span data-i18n="crowdfundRaisedField">已筹金额</span>
        <input id="crowdfundRaisedInput" maxlength="240" required placeholder="例如：100 USDT（Ethereum）" data-i18n-placeholder="crowdfundRaisedPlaceholder" />
      </label>
      <label class="field">
        <span data-i18n="crowdfundCurrentField">目前已确认开支</span>
        <textarea id="crowdfundCurrentInput" maxlength="4000" rows="6" required placeholder="例如：品牌域名注册（1 年）：¥83" data-i18n-placeholder="crowdfundCurrentPlaceholder"></textarea>
      </label>
      <label class="field">
        <span data-i18n="crowdfundFutureField">未来 12 个月预算</span>
        <textarea id="crowdfundFutureInput" maxlength="4000" rows="8" required placeholder="例如：域名续费：约 ¥90 / 年" data-i18n-placeholder="crowdfundFuturePlaceholder"></textarea>
      </label>
      <p id="crowdfundFormError" class="form-error" role="alert"></p>
      <div class="form-actions">
        <button class="button button-quiet" type="button" data-close-dialog data-i18n="cancel">取消</button>
        <button id="crowdfundSubmitBtn" class="button button-primary" type="submit" data-i18n="crowdfundSave">翻译并更新公示</button>
      </div>
    </form>
  </dialog>

  <div id="toast" class="toast" role="status" aria-live="polite"></div>
`;

const elements = {
  heroProfileBtn: document.querySelector("#heroProfileBtn"),
  newcomerGrid: document.querySelector("#newcomerGrid"),
  resultsSection: document.querySelector(".results-section"),
  memberGrid: document.querySelector("#memberGrid"),
  statusPanel: document.querySelector("#statusPanel"),
  resultTitle: document.querySelector("#resultTitle"),
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  aiSearchForm: document.querySelector("#aiSearchForm"),
  aiSearchInput: document.querySelector("#aiSearchInput"),
  aiSearchBtn: document.querySelector("#aiSearchBtn"),
  aiQuotaText: document.querySelector("#aiQuotaText"),
  aiResultPanel: document.querySelector("#aiResultPanel"),
  clearSearchBtn: document.querySelector("#clearSearchBtn"),
  languageBtn: document.querySelector("#languageBtn"),
  crowdfundOpenBtn: document.querySelector("#crowdfundOpenBtn"),
  crowdfundDialog: document.querySelector("#crowdfundDialog"),
  crowdfundCopyBtn: document.querySelector("#crowdfundCopyBtn"),
  crowdfundAddress: document.querySelector("#crowdfundAddress"),
  crowdfundRaisedValue: document.querySelector("#crowdfundRaisedValue"),
  crowdfundCurrentExpenses: document.querySelector("#crowdfundCurrentExpenses"),
  crowdfundFutureBudget: document.querySelector("#crowdfundFutureBudget"),
  crowdfundUpdated: document.querySelector("#crowdfundUpdated"),
  crowdfundEditBtn: document.querySelector("#crowdfundEditBtn"),
  crowdfundEditorDialog: document.querySelector("#crowdfundEditorDialog"),
  crowdfundForm: document.querySelector("#crowdfundForm"),
  crowdfundAddressInput: document.querySelector("#crowdfundAddressInput"),
  crowdfundRaisedInput: document.querySelector("#crowdfundRaisedInput"),
  crowdfundCurrentInput: document.querySelector("#crowdfundCurrentInput"),
  crowdfundFutureInput: document.querySelector("#crowdfundFutureInput"),
  crowdfundFormError: document.querySelector("#crowdfundFormError"),
  crowdfundSubmitBtn: document.querySelector("#crowdfundSubmitBtn"),
  announcementOpenBtn: document.querySelector("#announcementOpenBtn"),
  adminBtn: document.querySelector("#adminBtn"),
  adminBadge: document.querySelector("#adminBadge"),
  announcementAdminBtn: document.querySelector("#announcementAdminBtn"),
  normalizeSkillsBtn: document.querySelector("#normalizeSkillsBtn"),
  addMemberBtn: document.querySelector("#addMemberBtn"),
  messageRefreshBtn: document.querySelector("#messageRefreshBtn"),
  messageLoginPrompt: document.querySelector("#messageLoginPrompt"),
  messageLoginBtn: document.querySelector("#messageLoginBtn"),
  messageForm: document.querySelector("#messageForm"),
  messageInput: document.querySelector("#messageInput"),
  messageCharacterCount: document.querySelector("#messageCharacterCount"),
  messageFormError: document.querySelector("#messageFormError"),
  messageSubmitBtn: document.querySelector("#messageSubmitBtn"),
  messageBoardMeta: document.querySelector("#messageBoardMeta"),
  messageBoardStatus: document.querySelector("#messageBoardStatus"),
  messageList: document.querySelector("#messageList"),
  loginDialog: document.querySelector("#loginDialog"),
  loginForm: document.querySelector("#loginForm"),
  loginProfileContext: document.querySelector("#loginProfileContext"),
  loginError: document.querySelector("#loginError"),
  loginSubmitBtn: document.querySelector("#loginSubmitBtn"),
  usernameInput: document.querySelector("#usernameInput"),
  passwordInput: document.querySelector("#passwordInput"),
  openRegisterBtn: document.querySelector("#openRegisterBtn"),
  registerDialog: document.querySelector("#registerDialog"),
  registerForm: document.querySelector("#registerForm"),
  registerStartFields: document.querySelector("#registerStartFields"),
  registerVerifyFields: document.querySelector("#registerVerifyFields"),
  registerEmailInput: document.querySelector("#registerEmailInput"),
  registerUsernameInput: document.querySelector("#registerUsernameInput"),
  registerUsernameValidation: document.querySelector("#registerUsernameValidation"),
  registerPasswordInput: document.querySelector("#registerPasswordInput"),
  registerConfirmInput: document.querySelector("#registerConfirmInput"),
  registerCodeInput: document.querySelector("#registerCodeInput"),
  verificationHint: document.querySelector("#verificationHint"),
  registerError: document.querySelector("#registerError"),
  registerSubmitBtn: document.querySelector("#registerSubmitBtn"),
  backToLoginBtn: document.querySelector("#backToLoginBtn"),
  memberDialog: document.querySelector("#memberDialog"),
  memberForm: document.querySelector("#memberForm"),
  memberFields: document.querySelector("#memberFields"),
  profileAiInput: document.querySelector("#profileAiInput"),
  profileAiStatus: document.querySelector("#profileAiStatus"),
  profileAiGenerateBtn: document.querySelector("#profileAiGenerateBtn"),
  memberError: document.querySelector("#memberError"),
  editorTitle: document.querySelector("#editorTitle"),
  saveMemberBtn: document.querySelector("#saveMemberBtn"),
  deleteDialog: document.querySelector("#deleteDialog"),
  deleteForm: document.querySelector("#deleteForm"),
  deleteMessage: document.querySelector("#deleteMessage"),
  deleteError: document.querySelector("#deleteError"),
  deleteSubmitBtn: document.querySelector("#deleteSubmitBtn"),
  announcementDialog: document.querySelector("#announcementDialog"),
  announcementTitle: document.querySelector("#announcementTitle"),
  announcementContent: document.querySelector("#announcementContent"),
  announcementTime: document.querySelector("#announcementTime"),
  announcementEditBtn: document.querySelector("#announcementEditBtn"),
  announcementEditorDialog: document.querySelector("#announcementEditorDialog"),
  announcementForm: document.querySelector("#announcementForm"),
  announcementEditorTitle: document.querySelector("#announcementEditorTitle"),
  announcementTitleInput: document.querySelector("#announcementTitleInput"),
  announcementContentInput: document.querySelector("#announcementContentInput"),
  announcementFormError: document.querySelector("#announcementFormError"),
  announcementSubmitBtn: document.querySelector("#announcementSubmitBtn"),
  toast: document.querySelector("#toast"),
};

function renderFieldControl(field) {
  const classes = `field${field.wide ? " field-wide" : ""}`;
  const required = field.required ? "required" : "";
  const marker = field.required ? " *" : "";
  const label = field.labelKey ? t(field.labelKey) : field.label;
  const placeholder = field.placeholderKey ? t(field.placeholderKey) : (field.placeholder || "");
  const labelAttribute = field.labelKey ? ` data-i18n="${field.labelKey}" data-required-marker="${marker}"` : "";
  const placeholderAttribute = field.placeholderKey ? ` data-i18n-placeholder="${field.placeholderKey}"` : "";
  const maxLength = field.maxLength ? ` maxlength="${field.maxLength}"` : "";
  const inputMode = field.key === "wallet_address" ? " inputmode=\"text\" spellcheck=\"false\" autocomplete=\"off\"" : "";
  const control = field.type === "textarea"
    ? `<textarea id="field-${field.key}" name="${field.key}" rows="3" ${required} placeholder="${placeholder}"${placeholderAttribute}></textarea>`
    : `<input id="field-${field.key}" name="${field.key}" type="${field.type || "text"}" ${required}${maxLength}${inputMode} placeholder="${placeholder}"${placeholderAttribute} />`;
  return `<label class="${classes}"><span${labelAttribute}>${label}${marker}</span>${control}</label>`;
}

elements.memberFields.innerHTML = `
  <section class="profile-field-section">
    <h3 data-i18n="coreFieldsTitle">1 分钟资料卡</h3>
    <div class="form-grid">${essentialFields.map(renderFieldControl).join("")}</div>
  </section>
  <section class="profile-field-section wallet-editor-section">
    <div class="wallet-editor-heading">
      <div><h3 data-i18n="web3IdentityEditor">Web3 身份</h3><p data-i18n="web3IdentityHint">连接或填写公开钱包地址，用于读取真实链上活动。连接钱包不会发起交易。</p></div>
      <button id="connectWalletBtn" class="button button-quiet button-small" type="button" data-i18n="connectWallet">连接钱包</button>
    </div>
    <div class="form-grid">${walletFields.map(renderFieldControl).join("")}</div>
    <p id="walletEditorStatus" class="wallet-editor-status" role="status" aria-live="polite" data-i18n="walletPublicNote">钱包地址和 ENS 会公开显示；当前连接仅关联地址，不代表已完成签名验证。</p>
  </section>
  <details class="optional-profile-fields">
    <summary><span data-i18n="optionalFieldsTitle">补充更多资料（选填）</span><small data-i18n="optionalFieldsHint">地区、经历和联系方式可以稍后再填</small></summary>
    <div class="form-grid">${optionalFields.map(renderFieldControl).join("")}</div>
  </details>`;

function updateEditorUi() {
  elements.editorTitle.textContent = state.editorMode === "add"
    ? (state.isAdmin ? t("editorAddAdmin") : t("editorAddSelf"))
    : t("editorEdit");
  elements.saveMemberBtn.textContent = state.editorMode === "add" ? t("saveMember") : t("saveChanges");
}

function validateRegisterUsername() {
  const username = elements.registerUsernameInput.value;
  const hasValue = username.length > 0;
  const valid = !hasValue || USERNAME_PATTERN.test(username);
  const message = valid ? "" : t("errorUsername");
  elements.registerUsernameInput.setCustomValidity(message);
  elements.registerUsernameInput.setAttribute("aria-invalid", String(!valid));
  elements.registerUsernameValidation.textContent = message;
  return valid && hasValue;
}

function applyLanguage() {
  document.documentElement.lang = state.locale === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const marker = node.dataset.requiredMarker || "";
    node.textContent = `${t(node.dataset.i18n)}${marker}`;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-i18n-query]").forEach((node) => {
    const query = t(node.dataset.i18nQuery);
    if (node.hasAttribute("data-ai-search")) node.dataset.aiSearch = query;
    if (node.hasAttribute("data-search")) node.dataset.search = query;
  });
  elements.languageBtn.textContent = state.locale === "zh" ? "EN" : "中文";
  elements.languageBtn.setAttribute("aria-label", t("switchLanguage"));
  if (state.aiRemaining !== null) {
    elements.aiQuotaText.textContent = t("aiQuotaRemaining", { count: state.aiRemaining });
  }
  if (state.registerVerifier && state.registerEmail) {
    elements.verificationHint.textContent = t("codeSentTo", { email: state.registerEmail });
    elements.registerSubmitBtn.textContent = t("verifyComplete");
  }
  validateRegisterUsername();
  updateEditorUi();
  updateAccountUi();
  renderMessageBoard();
  renderAnnouncement();
  renderCrowdfunding();
  renderAiResults();
}

async function copyCrowdfundAddress() {
  const address = state.currentCrowdfunding?.evm_address || CROWDFUND_EVM_ADDRESS;
  try {
    await navigator.clipboard.writeText(address);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = address;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }
  showToast(t("crowdfundCopied"));
}

function renderCrowdfunding() {
  const ledger = state.currentCrowdfunding || DEFAULT_CROWDFUNDING;
  const localizedRaised = state.locale === "zh"
    ? (ledger.raised_zh || ledger.raised_original)
    : (ledger.raised_en || ledger.raised_original);
  const localizedCurrent = state.locale === "zh"
    ? (ledger.current_expenses_zh || ledger.current_expenses_original)
    : (ledger.current_expenses_en || ledger.current_expenses_original);
  const localizedFuture = state.locale === "zh"
    ? (ledger.future_budget_zh || ledger.future_budget_original)
    : (ledger.future_budget_en || ledger.future_budget_original);
  elements.crowdfundAddress.textContent = ledger.evm_address || CROWDFUND_EVM_ADDRESS;
  elements.crowdfundRaisedValue.textContent = localizedRaised || t("crowdfundRaisedValue");
  elements.crowdfundCurrentExpenses.textContent = localizedCurrent || "";
  elements.crowdfundFutureBudget.textContent = localizedFuture || "";
  elements.crowdfundUpdated.textContent = t("crowdfundUpdated", {
    time: formatMessageTime(ledger.updated_at),
  });
  elements.crowdfundEditBtn.hidden = !state.isAdmin;
}

async function loadCrowdfunding({ silent = false } = {}) {
  try {
    const { data, error } = await getDb()
      .from("site_crowdfunding")
      .select("*")
      .eq("id", 1)
      .limit(1);
    if (error) throw error;
    if (Array.isArray(data) && data[0]) state.currentCrowdfunding = data[0];
    renderCrowdfunding();
  } catch (error) {
    if (!silent) console.error("crowdfunding ledger load failed", error);
    renderCrowdfunding();
  }
}

function openCrowdfundingEditor() {
  if (!state.isAdmin) return;
  const ledger = state.currentCrowdfunding || DEFAULT_CROWDFUNDING;
  elements.crowdfundFormError.textContent = "";
  elements.crowdfundAddressInput.value = ledger.evm_address || CROWDFUND_EVM_ADDRESS;
  elements.crowdfundRaisedInput.value = ledger.raised_original || "";
  elements.crowdfundCurrentInput.value = ledger.current_expenses_original || "";
  elements.crowdfundFutureInput.value = ledger.future_budget_original || "";
  if (elements.crowdfundDialog.open) elements.crowdfundDialog.close();
  openDialog(elements.crowdfundEditorDialog);
  window.setTimeout(() => elements.crowdfundRaisedInput.focus(), 50);
}

async function saveCrowdfunding(event) {
  event.preventDefault();
  if (!state.isAdmin || state.crowdfundingSaving) return;
  const evmAddress = elements.crowdfundAddressInput.value.trim();
  const raised = elements.crowdfundRaisedInput.value.trim();
  const currentExpenses = elements.crowdfundCurrentInput.value.trim();
  const futureBudget = elements.crowdfundFutureInput.value.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(evmAddress) || !raised || !currentExpenses || !futureBudget) {
    elements.crowdfundFormError.textContent = t("crowdfundRequired");
    return;
  }

  state.crowdfundingSaving = true;
  elements.crowdfundFormError.textContent = "";
  elements.crowdfundSubmitBtn.disabled = true;
  elements.crowdfundSubmitBtn.textContent = t("crowdfundSaving");
  let usedTranslationFallback = false;
  try {
    let raisedTranslation;
    let currentTranslation;
    let futureTranslation;
    try {
      [raisedTranslation, currentTranslation, futureTranslation] = await Promise.all([
        requestBilingualTranslation({ content: raised }),
        requestBilingualTranslation({ content: currentExpenses }),
        requestBilingualTranslation({ content: futureBudget }),
      ]);
    } catch (error) {
      console.error("crowdfunding ledger translation failed", error);
      raisedTranslation = translationFallback({ content: raised });
      currentTranslation = translationFallback({ content: currentExpenses });
      futureTranslation = translationFallback({ content: futureBudget });
      usedTranslationFallback = true;
    }

    const { error } = await getDb().from("site_crowdfunding").update({
      evm_address: evmAddress,
      raised_original: raised,
      raised_zh: raisedTranslation.content_zh,
      raised_en: raisedTranslation.content_en,
      current_expenses_original: currentExpenses,
      current_expenses_zh: currentTranslation.content_zh,
      current_expenses_en: currentTranslation.content_en,
      future_budget_original: futureBudget,
      future_budget_zh: futureTranslation.content_zh,
      future_budget_en: futureTranslation.content_en,
      source_language: currentTranslation.source_language,
      translation_status: usedTranslationFallback ? "fallback" : "ready",
    }).eq("id", 1);
    if (error) throw error;

    elements.crowdfundEditorDialog.close();
    await loadCrowdfunding();
    openDialog(elements.crowdfundDialog);
    showToast(
      usedTranslationFallback ? t("translationFallback") : t("crowdfundSaved"),
      usedTranslationFallback ? "error" : "success",
    );
  } catch (error) {
    console.error("crowdfunding ledger save failed", error);
    elements.crowdfundFormError.textContent = friendlyError(error, t("crowdfundSaveFailed"));
  } finally {
    state.crowdfundingSaving = false;
    elements.crowdfundSubmitBtn.disabled = false;
    elements.crowdfundSubmitBtn.textContent = t("crowdfundSave");
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function filteredMembers() {
  const terms = normalize(state.query).split(/\s+/).filter(Boolean);
  if (!terms.length) return state.members;
  return state.members.filter((member) => {
    const haystack = searchableText(member);
    return terms.every((term) => haystack.includes(term));
  });
}

function renderAiResults() {
  const panel = elements.aiResultPanel;
  if (state.aiLoading) {
    panel.hidden = false;
    panel.innerHTML = `<div class="ai-thinking"><span class="spinner" aria-hidden="true"></span><div><strong>${t("loadingIntent")}</strong><p>${t("loadingIntentDetail")}</p></div></div>`;
    return;
  }

  if (state.aiError) {
    panel.hidden = false;
    panel.innerHTML = `<div class="ai-error"><strong>${t("aiFailedTitle")}</strong><p>${escapeHtml(state.aiError)}</p></div>`;
    return;
  }

  if (!state.aiQuery) {
    panel.hidden = true;
    panel.innerHTML = "";
    return;
  }

  panel.hidden = false;
  const summary = state.locale === "en"
    ? t("aiFallbackSummary", { query: state.aiQuery })
    : (state.aiIntent?.summary || t("aiFallbackSummary", { query: state.aiQuery }));
  if (!state.aiMatches.length) {
    panel.innerHTML = `<div class="ai-answer-head"><span class="ai-mark">AI</span><div><strong>${escapeHtml(summary)}</strong><p>${t("noAiMatches")}</p></div></div>`;
    return;
  }

  const verifiableMatches = rankVerifiableMatches(
    state.aiMatches,
    state.aiIntent,
    state.aiQuery,
    (member) => {
      const walletAddress = normalizeEvmAddress(member?.wallet_address);
      return {
        walletLinked: Boolean(walletAddress),
        loading: walletAddress ? state.onchainLoading.has(walletAddress) : false,
        error: walletAddress ? state.onchainErrors.get(walletAddress) : "",
        onchainProfile: walletAddress ? state.onchainProfiles.get(walletAddress) : null,
      };
    },
  );
  const verificationLabels = {
    verified: "proofVerified",
    no_evidence: "proofNoMatch",
    wallet_missing: "proofWalletMissing",
    failed: "proofVerificationFailed",
    loading: "proofAutoChecking",
    pending: "proofPending",
    not_requested: "proofNotRequested",
  };

  panel.innerHTML = `
    <div class="ai-answer-head">
      <span class="ai-mark">AI</span>
      <div><span class="verifiable-search-label">${t("verifiableSearchLabel")}</span><strong>${escapeHtml(summary)}</strong><p>${state.aiVerifying ? t("aiVerifyingMatches") : t("aiMatchCount", { count: verifiableMatches.length })}</p></div>
    </div>
    <p class="verifiable-search-note">${t("verifiableSearchNote")}</p>
    <div class="ai-match-list">
      ${verifiableMatches.map((match, index) => {
        const { member, reasons } = match;
        const verificationLabel = t(verificationLabels[match.verificationState] || "proofPending");
        const reasonsText = reasons.map((reason) => t(reason.key, { value: reason.value })).map(escapeHtml).join(state.locale === "zh" ? "；" : "; ");
        const networks = match.verifiedNetworks.join(", ") || "Ethereum";
        const protocols = match.verifiedProtocols.join(", ") || "Uniswap V3";
        const evidenceSummary = match.verificationState === "verified"
          ? t("proofEvidenceSummary", { networks, protocols })
          : verificationLabel;
        const indexedBlock = Number(match.onchainProfile?.indexedBlock || 0);
        const explanation = match.verificationState === "verified"
          ? t("verifiedEvidenceExplanation")
          : (match.requiresOnchain ? t("profileEvidenceOnly") : "");
        return `
        <article class="ai-match-card">
          <span class="rank-number">${String(index + 1).padStart(2, "0")}</span>
          <div class="ai-match-content">
            <div class="ai-match-score-row">
              <div class="ai-match-title"><h3>${escapeHtml(member.name)}</h3>${member.occupation ? `<span>${escapeHtml(member.occupation)}</span>` : ""}</div>
              <div class="talent-match-score"><strong>${match.matchScore}</strong><span>${t("matchScore")}</span></div>
            </div>
            ${member.location ? `<p class="ai-match-location">${escapeHtml(member.location)}</p>` : ""}
            ${reasons.length ? `<p class="match-reason">${t("matchReason", { reasons: reasonsText })}</p>` : ""}
            ${explanation ? `<p class="match-explanation">${escapeHtml(explanation)}</p>` : ""}
            <div class="match-evidence-grid">
              <div><span>${t("profileMatch")}</span><strong>${match.profileMatchScore}/100</strong><small>${reasonsText || t("profileMatch")}</small></div>
              <div class="evidence-${match.verificationState}"><span>${t("onchainMatch")}</span><strong>${match.verificationState === "loading" ? "…" : (["verified", "no_evidence"].includes(match.verificationState) ? `${match.onchainActivityScore}/100` : "—")}</strong><small>${escapeHtml(evidenceSummary)}</small></div>
            </div>
            ${indexedBlock ? `<p class="match-proof-source">${t("proofIndexedSource", { block: indexedBlock.toLocaleString("en-US") })}</p>` : ""}
            ${Array.isArray(member.skills) && member.skills.length ? `<div class="skill-list">${member.skills.slice(0, 6).map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}</div>` : ""}
            <button class="text-button ai-view-member" type="button" data-member-id="${escapeHtml(member.id)}">${t("viewProfile")}</button>
          </div>
        </article>`;
      }).join("")}
    </div>`;

  panel.querySelectorAll(".ai-view-member").forEach((button) => {
    button.addEventListener("click", () => {
      const card = document.querySelector(`.member-card[data-id="${CSS.escape(button.dataset.memberId)}"]`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("member-highlight");
        window.setTimeout(() => card.classList.remove("member-highlight"), 1600);
      }
    });
  });
}

function contactLink(type, value) {
  const text = escapeHtml(value);
  if (type === "email") return `<a href="mailto:${encodeURIComponent(value)}">${text}</a>`;
  if (type === "x_account") {
    const handle = value.replace(/^@/, "");
    return `<a href="https://x.com/${encodeURIComponent(handle)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  }
  if (type === "telegram") {
    const handle = value.replace(/^@/, "");
    return `<a href="https://t.me/${encodeURIComponent(handle)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  }
  return text;
}

function myMember() {
  if (!state.currentUid) return null;
  return state.members.find((member) => String(member.owner_id || "") === state.currentUid) || null;
}

function needsSkillNormalization(member) {
  if (!Array.isArray(member.ai_skills) || !member.ai_skills.length) return true;
  if (!member.ai_skills_updated_at) return true;
  const profileUpdated = Date.parse(member.updated_at || "");
  const skillsUpdated = Date.parse(member.ai_skills_updated_at || "");
  return Number.isFinite(profileUpdated)
    && Number.isFinite(skillsUpdated)
    && skillsUpdated < profileUpdated;
}

function canEditMember(member) {
  return state.isAdmin || (state.isMember && String(member.owner_id || "") === state.currentUid);
}

function formatUsd(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat(state.locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount < 1 ? 4 : 2,
  }).format(amount);
}

function formatProofDate(timestamp) {
  const date = new Date(Number(timestamp) * 1000);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat(state.locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function graphSubgraphUrl(subgraphId) {
  const id = String(subgraphId || "");
  if (!/^[a-zA-Z0-9]{20,80}$/.test(id)) return "https://thegraph.com/explorer";
  return `https://thegraph.com/explorer/subgraphs/${id}?view=Query&chain=arbitrum-one`;
}

function renderWeb3Identity(member) {
  const walletAddress = normalizeEvmAddress(member.wallet_address);
  if (!walletAddress) return "";

  const profile = state.onchainProfiles.get(walletAddress);
  const error = state.onchainErrors.get(walletAddress);
  const loading = state.onchainLoading.has(walletAddress);
  const addressUrl = explorerAddressUrl(walletAddress);
  const proof = profile?.proof && typeof profile.proof === "object" ? profile.proof : null;
  const activities = Array.isArray(proof?.activities) ? proof.activities.slice(0, 3) : [];
  const breakdown = Array.isArray(proof?.breakdown) ? proof.breakdown : [];
  const score = Math.max(0, Math.min(100, Number(proof?.score) || 0));
  const networks = Array.isArray(proof?.verifiedNetworks) && proof.verifiedNetworks.length
    ? proof.verifiedNetworks.join(", ")
    : "—";
  const protocols = Array.isArray(proof?.verifiedProtocols) && proof.verifiedProtocols.length
    ? proof.verifiedProtocols.join(", ")
    : "—";
  const breakdownLabels = {
    history: "proofHistory",
    recentActivity: "proofRecent",
    activePositions: "proofPositionEvidence",
    protocolEvidence: "proofProtocolEvidence",
  };
  const activityLabels = {
    mint: "proofActivityMint",
    burn: "proofActivityBurn",
    collect: "proofActivityCollect",
    position: "proofActivityPosition",
  };
  const sourceUrl = graphSubgraphUrl(profile?.source?.subgraphId);

  return `
    <section class="web3-identity" aria-label="${t("web3Identity")}">
      <div class="web3-identity-title"><span class="onchain-live-dot" aria-hidden="true"></span><strong>${t("web3Identity")}</strong></div>
      <dl class="web3-identity-grid">
        <div><dt>Wallet</dt><dd><a href="${addressUrl}" target="_blank" rel="noopener noreferrer" title="${walletAddress}">${shortenEvmAddress(walletAddress)}</a></dd></div>
        ${member.ens_name ? `<div><dt>ENS</dt><dd>${escapeHtml(member.ens_name)}</dd></div>` : ""}
        <div><dt>${t("network")}</dt><dd>Ethereum</dd></div>
      </dl>
      ${profile && proof ? `
        <div class="onchain-proof">
          <div class="proof-heading"><strong>${t("verifiedOnchainActivity")}</strong><span>${t("proofLiveBadge")}</span></div>
          <div class="proof-score-shell">
            <div class="proof-score-ring" style="--proof-score:${score * 3.6}deg" aria-label="${t("proofScoreValue", { score })}">
              <strong>${score}</strong><span>/100</span>
            </div>
            <div><strong>${t("proofScore")}</strong><p>${t("proofScoreDisclaimer")}</p></div>
          </div>
          <dl class="proof-metrics">
            <div><dt>${t("proofActiveSince")}</dt><dd>${proof.activeSinceYear || t("proofNotAvailable")}</dd></div>
            <div><dt>${t("proofRecentActivity")}</dt><dd>${Number(proof.recentTransactionCount || 0)}</dd></div>
            <div><dt>${t("proofNetworks")}</dt><dd>${escapeHtml(networks)}</dd></div>
            <div><dt>${t("proofProtocols")}</dt><dd>${escapeHtml(protocols)}</dd></div>
            <div><dt>${t("proofPositions")}</dt><dd>${Number(proof.activePositionCount || 0)}</dd></div>
          </dl>
          ${proof.hasEvidence ? `
            <div class="proof-breakdown"><p>${t("proofBreakdown")}</p>${breakdown.map((item) => {
              const points = Math.max(0, Number(item.points) || 0);
              const maxPoints = Math.max(1, Number(item.maxPoints) || 1);
              const progress = Math.min(100, Math.round((points / maxPoints) * 100));
              return `<div class="proof-breakdown-row"><span>${t(breakdownLabels[item.key] || "proofScore")}</span><i><b style="width:${progress}%"></b></i><small>${t("proofPoints", { points, max: maxPoints })}</small></div>`;
            }).join("")}</div>
          ` : `<p class="onchain-empty">${t("proofNoEvidence")}</p>`}
          ${activities.length ? `<div class="proof-activity-list"><p>${t("proofRecentEvidence")}</p><ul>${activities.map((activity) => {
            const txUrl = explorerTransactionUrl(activity.transactionHash);
            const pair = `${activity.token0 || "Token 0"} / ${activity.token1 || "Token 1"}`;
            const amount = formatUsd(activity.amountUSD);
            const date = formatProofDate(activity.timestamp);
            const label = t(activityLabels[activity.kind] || "proofRecentEvidence");
            return `<li><div>${txUrl ? `<a href="${txUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(pair)}</a>` : escapeHtml(pair)}<small>${escapeHtml(label)}${date ? ` · ${escapeHtml(date)}` : ""}</small></div>${amount ? `<span>${escapeHtml(amount)}</span>` : ""}</li>`;
          }).join("")}</ul></div>` : ""}
          ${proof.resultCapped ? `<p class="proof-limit-note">${t("proofLimitedResult")}</p>` : ""}
          <p class="proof-source"><a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">${t("proofPoweredBy")}</a><span>${t("graphIndexedBlock", { block: Number(profile.indexedBlock || 0).toLocaleString("en-US") })}</span></p>
        </div>` : ""}
      ${error ? `<p class="onchain-error">${escapeHtml(error)}</p>` : ""}
      <button class="button button-quiet button-small onchain-query" type="button" data-member-id="${escapeHtml(member.id)}" ${loading ? "disabled" : ""}>${loading ? t("verifyingOnchain") : t("verifyOnchain")}</button>
    </section>`;
}

function renderMember(member) {
  const skills = Array.isArray(member.skills) ? member.skills : [];
  const aiSkills = Array.isArray(member.ai_skills) ? member.ai_skills : [];
  const contacts = [
    ["x_account", "X", member.x_account],
    ["wechat", t("fieldWechat"), member.wechat],
    ["telegram", "Telegram", member.telegram],
    ["email", t("fieldEmail"), member.email],
  ].filter(([, , value]) => value);
  const initials = escapeHtml((member.name || "?").trim().slice(0, 1).toUpperCase());
  const canEdit = canEditMember(member);

  return `
    <article class="member-card" data-id="${escapeHtml(member.id)}">
      <div class="card-topline">
        <div class="avatar" aria-hidden="true">${initials}</div>
        ${canEdit ? `
          <div class="card-admin-actions">
            <button class="icon-button edit-member" type="button" data-id="${escapeHtml(member.id)}" aria-label="${t("edit")} ${escapeHtml(member.name)}">${t("edit")}</button>
            ${state.isAdmin ? `<button class="icon-button delete-member danger" type="button" data-id="${escapeHtml(member.id)}" aria-label="${t("delete")} ${escapeHtml(member.name)}">${t("delete")}</button>` : ""}
          </div>` : ""}
      </div>
      <div class="member-heading">
        <h3>${escapeHtml(member.name)}</h3>
        ${member.nickname && member.nickname !== member.name ? `<span class="nickname">${escapeHtml(member.nickname)}</span>` : ""}
      </div>
      <p class="occupation">${escapeHtml(member.occupation || t("defaultOccupation"))}</p>
      ${member.location ? `<p class="location"><span aria-hidden="true">●</span>${escapeHtml(member.location)}</p>` : ""}
      ${skills.length ? `<div class="skill-list">${skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}</div>` : ""}
      ${aiSkills.length ? `
        <div class="ai-skill-block">
          <p>${t("aiStandardSkills")}</p>
          <div class="skill-list ai-standardized-skills">${aiSkills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}</div>
        </div>` : ""}
      ${member.experience ? `<p class="experience">${escapeHtml(member.experience)}</p>` : ""}
      ${member.intro ? `<p class="intro">${escapeHtml(member.intro)}</p>` : ""}
      ${renderWeb3Identity(member)}
      ${contacts.length ? `
        <dl class="contacts">
          ${contacts.map(([type, label, value]) => `<div><dt>${label}</dt><dd>${contactLink(type, value)}</dd></div>`).join("")}
        </dl>` : ""}
    </article>
  `;
}

function recentMembers() {
  return [...state.members]
    .sort((left, right) => {
      const rightTime = Date.parse(right.updated_at || right.created_at || 0) || 0;
      const leftTime = Date.parse(left.updated_at || left.created_at || 0) || 0;
      return rightTime - leftTime;
    })
    .slice(0, 6);
}

function renderNewcomers() {
  if (state.loading) {
    elements.newcomerGrid.innerHTML = `<div class="newcomer-loading"><span class="spinner" aria-hidden="true"></span><span>${t("loadingProfiles")}</span></div>`;
    return;
  }
  if (state.error || !state.members.length) {
    elements.newcomerGrid.innerHTML = `<div class="newcomer-empty">${t("newcomerEmpty")}</div>`;
    return;
  }

  elements.newcomerGrid.innerHTML = recentMembers().map((member) => {
    const skills = Array.isArray(member.ai_skills) && member.ai_skills.length
      ? member.ai_skills
      : (Array.isArray(member.skills) ? member.skills : []);
    const initial = escapeHtml((member.name || "?").trim().slice(0, 1).toUpperCase());
    return `
      <article class="newcomer-card">
        <div class="newcomer-card-top"><span class="avatar" aria-hidden="true">${initial}</span><span class="newcomer-status-dot" aria-hidden="true"></span></div>
        <h3>${escapeHtml(member.name || t("defaultOccupation"))}</h3>
        <p>${escapeHtml(member.occupation || t("defaultOccupation"))}</p>
        ${skills.length ? `<div class="skill-list">${skills.slice(0, 3).map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}</div>` : ""}
        <button class="text-button newcomer-view" type="button" data-member-id="${escapeHtml(member.id)}">${t("newcomerView")}</button>
      </article>`;
  }).join("");

  elements.newcomerGrid.querySelectorAll(".newcomer-view").forEach((button) => {
    button.addEventListener("click", () => {
      const card = document.querySelector(`.member-card[data-id="${CSS.escape(button.dataset.memberId)}"]`);
      card?.scrollIntoView({ behavior: "smooth", block: "center" });
      card?.classList.add("member-highlight");
      if (card) window.setTimeout(() => card.classList.remove("member-highlight"), 1600);
    });
  });
}

function render() {
  renderAiResults();
  renderNewcomers();
  elements.resultsSection.setAttribute("aria-busy", String(state.loading));
  if (state.loading) {
    elements.statusPanel.className = "status-panel loading-state";
    elements.statusPanel.innerHTML = `<span class="spinner" aria-hidden="true"></span><p>${t("loadingProfiles")}</p>`;
    elements.statusPanel.hidden = false;
    elements.memberGrid.innerHTML = "";
    elements.resultTitle.textContent = t("connecting");
    return;
  }

  if (state.error) {
    elements.statusPanel.className = "status-panel error-state";
    elements.statusPanel.innerHTML = `<strong>${t("libraryFailed")}</strong><p>${escapeHtml(state.error)}</p><button id="retryBtn" class="button button-dark button-small" type="button">${t("retry")}</button>`;
    elements.statusPanel.hidden = false;
    elements.memberGrid.innerHTML = "";
    elements.resultTitle.textContent = t("unavailable");
    document.querySelector("#retryBtn")?.addEventListener("click", initialize);
    return;
  }

  const members = filteredMembers();
  elements.statusPanel.hidden = true;
  elements.clearSearchBtn.hidden = !state.query;
  elements.resultTitle.textContent = state.query
    ? t("resultCount", { count: members.length })
    : t("totalCount", { count: members.length });

  if (!members.length) {
    elements.memberGrid.innerHTML = `
      <div class="empty-state">
        <span aria-hidden="true">⌕</span>
        <h3>${t("noMembers")}</h3>
        <p>${t("tryDifferent")}</p>
      </div>`;
    return;
  }

  elements.memberGrid.innerHTML = members.map(renderMember).join("");
  document.querySelectorAll(".edit-member").forEach((button) => {
    button.addEventListener("click", () => openEditor("edit", button.dataset.id));
  });
  document.querySelectorAll(".delete-member").forEach((button) => {
    button.addEventListener("click", () => openDelete(button.dataset.id));
  });
  document.querySelectorAll(".onchain-query").forEach((button) => {
    button.addEventListener("click", () => queryMemberOnchain(button.dataset.memberId));
  });
}

function formatMessageTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat(state.locale === "zh" ? "zh-CN" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function requestBilingualTranslation({ title = "", content }) {
  const response = await app.callFunction({
    name: "seedclub-ai-search",
    data: { action: "translate_content", title, content },
  });
  let result = response?.result ?? response;
  if (typeof result === "string") result = JSON.parse(result);
  if (!result?.success) {
    const error = new Error(result?.message || result?.code || "TRANSLATION_FAILED");
    error.code = result?.code;
    throw error;
  }
  const translated = {
    source_language: ["zh", "en", "mixed"].includes(result.source_language)
      ? result.source_language
      : "unknown",
    content_zh: String(result.content_zh || "").trim().slice(0, 4000),
    content_en: String(result.content_en || "").trim().slice(0, 4000),
    translation_status: "ready",
  };
  if (title) {
    translated.title_zh = String(result.title_zh || "").trim().slice(0, 240);
    translated.title_en = String(result.title_en || "").trim().slice(0, 240);
  }
  if (!translated.content_zh || !translated.content_en
    || (title && (!translated.title_zh || !translated.title_en))) {
    throw new Error("TRANSLATION_EMPTY");
  }
  return translated;
}

function translationFallback({ title = "", content }) {
  return {
    ...(title ? { title_zh: title, title_en: title } : {}),
    content_zh: content,
    content_en: content,
    source_language: "unknown",
    translation_status: "fallback",
  };
}

function canDeleteBoardMessage(message) {
  return state.isAdmin
    || Boolean(state.currentUid && String(message.owner_id || "") === state.currentUid);
}

function renderMessageBoard() {
  const signedIn = state.isMember || state.isAdmin;
  elements.messageLoginPrompt.hidden = signedIn;
  elements.messageForm.hidden = !signedIn;
  elements.messageRefreshBtn.disabled = state.boardLoading || state.boardRefreshing;
  elements.messageRefreshBtn.textContent = state.boardRefreshing
    ? t("boardRefreshing")
    : t("boardRefresh");
  elements.messageSubmitBtn.disabled = state.boardPosting;
  elements.messageSubmitBtn.textContent = state.boardPosting ? t("boardPosting") : t("boardPost");
  elements.messageCharacterCount.textContent = t("boardCharacters", {
    count: elements.messageInput.value.length,
  });

  if (state.boardLoading) {
    elements.messageBoardMeta.textContent = "";
    elements.messageBoardStatus.innerHTML = `<span class="spinner" aria-hidden="true"></span><p>${t("boardLoading")}</p>`;
    elements.messageBoardStatus.hidden = false;
    elements.messageList.innerHTML = "";
    return;
  }

  if (state.boardError) {
    elements.messageBoardMeta.textContent = "";
    elements.messageBoardStatus.innerHTML = `<strong>${t("boardLoadFailed")}</strong><p>${escapeHtml(state.boardError)}</p><button id="messageRetryBtn" class="button button-dark button-small" type="button">${t("boardRetry")}</button>`;
    elements.messageBoardStatus.hidden = false;
    elements.messageList.innerHTML = "";
    document.querySelector("#messageRetryBtn")?.addEventListener("click", () => loadBoardMessages());
    return;
  }

  elements.messageBoardStatus.hidden = true;
  elements.messageBoardStatus.innerHTML = "";
  elements.messageBoardMeta.textContent = t("boardCount", { count: state.boardMessages.length });

  if (!state.boardMessages.length) {
    elements.messageList.innerHTML = `
      <div class="message-empty">
        <span aria-hidden="true">✦</span>
        <div><strong>${t("boardEmpty")}</strong><p>${t("boardEmptyIntro")}</p></div>
      </div>`;
    return;
  }

  elements.messageList.innerHTML = state.boardMessages.map((message) => {
    const authorName = message.author_name || t("memberAccount");
    const initial = escapeHtml(authorName.trim().slice(0, 1).toUpperCase() || "S");
    const localizedContent = state.locale === "zh"
      ? (message.content_zh || message.content)
      : (message.content_en || message.content);
    return `
      <article class="message-item" data-message-id="${escapeHtml(message.id)}">
        <div class="message-avatar" aria-hidden="true">${initial}</div>
        <div class="message-body">
          <div class="message-meta">
            <div><strong>${escapeHtml(authorName)}</strong><time datetime="${escapeHtml(message.created_at)}">${escapeHtml(formatMessageTime(message.created_at))}</time></div>
            ${canDeleteBoardMessage(message) ? `<button class="message-delete" type="button" data-message-id="${escapeHtml(message.id)}">${t("boardDelete")}</button>` : ""}
          </div>
          <p>${escapeHtml(localizedContent)}</p>
        </div>
      </article>`;
  }).join("");

  elements.messageList.querySelectorAll(".message-delete").forEach((button) => {
    button.disabled = String(state.boardDeletingId || "") === button.dataset.messageId;
    button.addEventListener("click", () => deleteBoardMessage(button.dataset.messageId));
  });
}

async function loadBoardMessages({ silent = false } = {}) {
  if (state.boardLoading && silent) return;
  if (silent) state.boardRefreshing = true;
  else state.boardLoading = true;
  if (!silent || !state.boardMessages.length) state.boardError = "";
  renderMessageBoard();

  try {
    const { data, error } = await getDb()
      .from("message_board_posts")
      .select("id, owner_id, author_name, content, content_zh, content_en, source_language, translation_status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    state.boardMessages = Array.isArray(data) ? data : [];
    state.boardError = "";
  } catch (error) {
    console.error("message board load failed", error);
    if (!silent || !state.boardMessages.length) {
      state.boardError = friendlyError(error, t("boardLoadFailed"));
    }
  } finally {
    state.boardLoading = false;
    state.boardRefreshing = false;
    renderMessageBoard();
  }
}

async function postBoardMessage(event) {
  event.preventDefault();
  if (state.boardPosting) return;
  if (!state.isMember && !state.isAdmin) {
    elements.messageFormError.textContent = t("boardLoginRequired");
    return;
  }

  const content = elements.messageInput.value.trim();
  if (!content || content.length > 500) {
    elements.messageFormError.textContent = t("boardTooLong");
    return;
  }

  state.boardPosting = true;
  elements.messageFormError.textContent = "";
  renderMessageBoard();
  let usedTranslationFallback = false;
  try {
    let translated;
    try {
      translated = await requestBilingualTranslation({ content });
      translated.content_zh = translated.content_zh.slice(0, 1200);
      translated.content_en = translated.content_en.slice(0, 1200);
    } catch (error) {
      console.error("message translation failed", error);
      translated = translationFallback({ content });
      usedTranslationFallback = true;
    }
    const { error } = await getDb().from("message_board_posts").insert({
      content,
      ...translated,
    });
    if (error) throw error;
    elements.messageInput.value = "";
    await loadBoardMessages({ silent: true });
    showToast(usedTranslationFallback ? t("translationFallback") : t("boardPosted"), usedTranslationFallback ? "error" : "success");
  } catch (error) {
    console.error("message board post failed", error);
    elements.messageFormError.textContent = friendlyError(error, t("boardPostFailed"));
  } finally {
    state.boardPosting = false;
    renderMessageBoard();
  }
}

async function deleteBoardMessage(id) {
  const message = state.boardMessages.find((item) => String(item.id) === String(id));
  if (!message || !canDeleteBoardMessage(message) || state.boardDeletingId) return;
  if (!window.confirm(t("boardDeleteConfirm"))) return;

  state.boardDeletingId = id;
  renderMessageBoard();
  try {
    const { error } = await getDb().from("message_board_posts").delete().eq("id", id);
    if (error) throw error;
    state.boardMessages = state.boardMessages.filter((item) => String(item.id) !== String(id));
    showToast(t("boardDeleted"));
  } catch (error) {
    console.error("message board delete failed", error);
    showToast(friendlyError(error, t("boardDeleteFailed")), "error");
  } finally {
    state.boardDeletingId = null;
    renderMessageBoard();
  }
}

function announcementSeenValue(announcement) {
  return `${announcement?.id || ""}:${announcement?.updated_at || ""}`;
}

function markCurrentAnnouncementSeen() {
  if (!state.currentAnnouncement) return;
  try {
    window.localStorage.setItem("seedclub-announcement-seen", announcementSeenValue(state.currentAnnouncement));
  } catch {}
}

function renderAnnouncement() {
  const announcement = state.currentAnnouncement;
  elements.announcementOpenBtn.hidden = !announcement;
  elements.announcementAdminBtn.hidden = !state.isAdmin;
  elements.announcementEditBtn.hidden = !state.isAdmin || !announcement;
  if (!announcement) return;

  const localizedTitle = state.locale === "zh"
    ? (announcement.title_zh || announcement.title_original)
    : (announcement.title_en || announcement.title_original);
  const localizedContent = state.locale === "zh"
    ? (announcement.content_zh || announcement.content_original)
    : (announcement.content_en || announcement.content_original);
  elements.announcementTitle.textContent = localizedTitle;
  elements.announcementContent.textContent = localizedContent;
  elements.announcementTime.textContent = t("announcementPublishedAt", {
    time: formatMessageTime(announcement.updated_at),
  });
}

function openCurrentAnnouncement() {
  if (!state.currentAnnouncement) return;
  renderAnnouncement();
  openDialog(elements.announcementDialog);
}

function maybeShowCurrentAnnouncement() {
  if (!state.currentAnnouncement) return;
  let seen = "";
  try {
    seen = window.localStorage.getItem("seedclub-announcement-seen") || "";
  } catch {}
  if (seen !== announcementSeenValue(state.currentAnnouncement)) {
    window.setTimeout(openCurrentAnnouncement, 250);
  }
}

async function loadCurrentAnnouncement({ showIfNew = false } = {}) {
  try {
    const { data, error } = await getDb()
      .from("site_announcements")
      .select("*")
      .eq("active", true)
      .order("updated_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    state.currentAnnouncement = Array.isArray(data) ? (data[0] || null) : null;
    renderAnnouncement();
    if (showIfNew) maybeShowCurrentAnnouncement();
  } catch (error) {
    // Announcement failure must not block the directory or message board.
    console.error("announcement load failed", error);
    state.currentAnnouncement = null;
    renderAnnouncement();
  }
}

function openAnnouncementEditor(mode) {
  if (!state.isAdmin) return;
  state.announcementMode = mode;
  state.editingAnnouncementId = mode === "edit" ? state.currentAnnouncement?.id : null;
  elements.announcementForm.reset();
  elements.announcementFormError.textContent = "";
  elements.announcementEditorTitle.textContent = mode === "edit"
    ? t("announcementEditorEdit")
    : t("announcementEditorNew");
  elements.announcementSubmitBtn.textContent = mode === "edit"
    ? t("announcementSaveChanges")
    : t("announcementPublish");

  if (mode === "edit" && state.currentAnnouncement) {
    elements.announcementTitleInput.value = state.currentAnnouncement.title_original || "";
    elements.announcementContentInput.value = state.currentAnnouncement.content_original || "";
  }
  if (elements.announcementDialog.open) elements.announcementDialog.close();
  openDialog(elements.announcementEditorDialog);
  window.setTimeout(() => elements.announcementTitleInput.focus(), 50);
}

async function saveAnnouncement(event) {
  event.preventDefault();
  if (!state.isAdmin || state.announcementSaving) return;
  const title = elements.announcementTitleInput.value.trim();
  const content = elements.announcementContentInput.value.trim();
  if (!title || !content) {
    elements.announcementFormError.textContent = t("announcementRequired");
    return;
  }

  state.announcementSaving = true;
  elements.announcementFormError.textContent = "";
  elements.announcementSubmitBtn.disabled = true;
  elements.announcementSubmitBtn.textContent = t("announcementSaving");
  let usedTranslationFallback = false;
  try {
    let translated;
    try {
      translated = await requestBilingualTranslation({ title, content });
    } catch (error) {
      console.error("announcement translation failed", error);
      translated = translationFallback({ title, content });
      usedTranslationFallback = true;
    }

    const payload = {
      title_original: title,
      content_original: content,
      ...translated,
    };
    const result = state.announcementMode === "edit"
      ? await getDb().from("site_announcements").update(payload).eq("id", state.editingAnnouncementId)
      : await getDb().from("site_announcements").insert(payload);
    if (result.error) throw result.error;

    elements.announcementEditorDialog.close();
    await loadCurrentAnnouncement();
    openCurrentAnnouncement();
    showToast(
      usedTranslationFallback
        ? t("translationFallback")
        : state.announcementMode === "edit"
          ? t("announcementUpdated")
          : t("announcementPublished"),
      usedTranslationFallback ? "error" : "success",
    );
  } catch (error) {
    console.error("announcement save failed", error);
    elements.announcementFormError.textContent = friendlyError(error, t("announcementSaveFailed"));
  } finally {
    state.announcementSaving = false;
    elements.announcementSubmitBtn.disabled = false;
    elements.announcementSubmitBtn.textContent = state.announcementMode === "edit"
      ? t("announcementSaveChanges")
      : t("announcementPublish");
  }
}

function updateAccountUi() {
  const signedIn = state.isMember || state.isAdmin;
  const ownProfile = myMember();
  const pendingNormalization = state.members.some((member) => needsSkillNormalization(member));
  elements.adminBadge.hidden = !signedIn;
  elements.adminBadge.textContent = state.isAdmin
    ? t("adminMode")
    : (state.currentUsername || state.currentEmail || t("memberAccount"));
  elements.addMemberBtn.hidden = !signedIn;
  elements.addMemberBtn.textContent = state.isAdmin
    ? t("addMember")
    : (ownProfile ? t("editMyProfile") : t("createMyProfile"));
  elements.heroProfileBtn.textContent = ownProfile ? t("heroEditCta") : t("heroCta");
  elements.adminBtn.textContent = signedIn ? t("logout") : t("loginRegister");
  elements.adminBtn.classList.toggle("logged-in", signedIn);
  elements.normalizeSkillsBtn.hidden = !state.isAdmin || !pendingNormalization;
  elements.normalizeSkillsBtn.disabled = state.bulkNormalizing;
  elements.normalizeSkillsBtn.textContent = state.bulkProgress || t("normalizeAllSkills");
  render();
  renderMessageBoard();
  renderAnnouncement();
  renderCrowdfunding();
}

function setAccountFromUser(user) {
  const uid = String(user?.id || user?.uid || user?.sub || "");
  const anonymous = Boolean(user?.is_anonymous) || user?.role?.includes?.("anon");
  state.currentUid = anonymous ? null : uid;
  state.currentEmail = anonymous ? "" : String(user?.email || "");
  state.currentUsername = anonymous ? "" : String(user?.user_metadata?.username || user?.username || "");
  state.isAdmin = Boolean(uid === ADMIN_UID && !anonymous);
  state.isMember = Boolean(uid && !anonymous && uid !== ADMIN_UID);
}

async function ensureSession() {
  // A brand-new visitor has no credentials yet. CloudBase reports that normal
  // first-visit state as an AuthError, so do not abort before anonymous login.
  const { data: sessionData } = await auth.getSession();

  const existingUser = sessionData?.user || sessionData?.session?.user;
  if (existingUser && !existingUser.is_anonymous) {
    setAccountFromUser(existingUser);
    await waitForCredentials();
    return;
  }

  setAccountFromUser(null);
  if (!sessionData?.session) {
    const { error } = await auth.signInAnonymously();
    if (error) throw error;
  }
  await waitForCredentials();
}

async function waitForCredentials() {
  let lastError;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const credentials = await auth.getCredentials();
      if (credentials?.access_token || credentials?.accessToken) return credentials;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 150 * (attempt + 1)));
  }
  throw lastError || new Error("credentials not found");
}

async function loadMembers() {
  const { data, error } = await getDb()
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  state.members = Array.isArray(data) ? data : [];
}

function friendlyError(error, fallback = t("errorGeneric")) {
  const message = error?.message || String(error || "");
  const code = error?.code || "";
  if (/invalid_username_or_password|invalid.*password|用户名或密码/i.test(message)) return t("errorInvalidLogin");
  if (/invalid_verification_code|verification.*invalid|验证码.*错误/i.test(message)) return t("errorInvalidCode");
  if (/already.*registered|already exists|user.*exist|已注册|已存在/i.test(message)) return t("errorAlreadyRegistered");
  if (/captcha/i.test(message)) return t("errorCaptcha");
  if (/duplicate key|unique constraint|members_owner_id/i.test(message)) return t("errorDuplicateProfile");
  if (/row-level security|permission|denied|policy|403/i.test(message)) return t("errorPermission");
  if (/network|fetch|timeout|Failed to fetch/i.test(message)) return t("errorNetwork");
  if (/DAILY_LIMIT_REACHED/i.test(`${code} ${message}`)) return t("errorLimit");
  if (/DEEPSEEK_NOT_CONFIGURED/i.test(`${code} ${message}`)) return t("errorDeepSeek");
  return state.locale === "en" ? fallback : (message || fallback);
}

async function handleAiSearch(event) {
  event.preventDefault();
  const query = elements.aiSearchInput.value.trim();
  if (!query || state.aiLoading) return;
  if (query.length < 2) {
    state.aiError = t("errorDetailedQuery");
    renderAiResults();
    return;
  }

  state.aiLoading = true;
  state.aiVerifying = false;
  state.aiError = "";
  state.aiQuery = query;
  state.aiIntent = null;
  state.aiMatches = [];
  state.query = "";
  elements.searchInput.value = "";
  elements.aiSearchBtn.disabled = true;
  elements.aiSearchBtn.textContent = t("aiSearching");
  render();

  try {
    const response = await app.callFunction({
      name: "seedclub-ai-search",
      data: { query },
    });
    let payload = response?.result ?? response;
    if (typeof payload === "string") payload = JSON.parse(payload);
    if (!payload?.success) {
      const error = new Error(payload?.message || payload?.code || "AI_SEARCH_FAILED");
      error.code = payload?.code;
      throw error;
    }

    state.aiIntent = payload.intent || {};
    state.aiMatches = rankMembers(state.members, state.aiIntent, query);
    state.aiRemaining = Number.isFinite(Number(payload.remaining)) ? Number(payload.remaining) : null;
    if (state.aiRemaining !== null) elements.aiQuotaText.textContent = t("aiQuotaRemaining", { count: state.aiRemaining });
    state.aiLoading = false;
    renderAiResults();
    await hydrateAiMatchProofs(state.aiMatches);
  } catch (error) {
    console.error(error);
    state.aiError = friendlyError(error, t("errorAiFallback"));
  } finally {
    state.aiLoading = false;
    state.aiVerifying = false;
    elements.aiSearchBtn.disabled = false;
    elements.aiSearchBtn.textContent = t("aiSearch");
    renderAiResults();
  }
}

async function initialize() {
  state.loading = true;
  state.error = "";
  render();
  try {
    await ensureSession();
    await loadMembers();
    await loadBoardMessages();
    await loadCrowdfunding();
    await loadCurrentAnnouncement({ showIfNew: true });
  } catch (error) {
    console.error(error);
    state.error = friendlyError(error, t("errorAnonymous"));
  } finally {
    state.loading = false;
    updateAccountUi();
  }
}

function showToast(message, type = "success") {
  elements.toast.textContent = message;
  elements.toast.className = `toast show ${type}`;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.className = "toast";
  }, 3200);
}

function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
}

function closeDialog(dialog) {
  if (!dialog.open || state.saving) return;
  dialog.close();
  if (dialog === elements.memberDialog) state.editorDirty = false;
}

function findMember(id) {
  return state.members.find((member) => String(member.id) === String(id));
}

function fillMemberForm(profile, { onlyPresent = false } = {}) {
  if (!profile) return;
  fields.forEach((field) => {
    const input = elements.memberForm.elements[field.key];
    if (!input) return;
    if (onlyPresent && !(field.key in profile)) return;
    const value = field.key === "skills" && Array.isArray(profile.skills)
      ? profile.skills.join("，")
      : profile[field.key] || "";
    input.value = value;
  });
  const hasOptionalDetails = optionalFields.some((field) => {
    const value = profile[field.key];
    return Array.isArray(value) ? value.length : Boolean(value);
  });
  const optionalDetails = elements.memberFields.querySelector(".optional-profile-fields");
  if (optionalDetails) optionalDetails.open = hasOptionalDetails;
}

function openEditor(mode, id = null, draft = null) {
  if (mode === "edit" && !state.isAdmin && !state.isMember) return;
  state.editorMode = mode;
  state.editingId = id;
  state.editorDirty = false;
  elements.memberForm.reset();
  elements.memberError.textContent = "";
  elements.profileAiInput.value = "";
  elements.profileAiStatus.textContent = "";
  updateEditorUi();

  if (mode === "edit") {
    const member = findMember(id);
    if (!member || !canEditMember(member)) return;
    fillMemberForm(member);
  } else if (state.isMember && state.currentEmail) {
    elements.memberForm.elements.email.value = state.currentEmail;
  }
  fillMemberForm(draft || (mode === "add" ? state.pendingProfileDraft : null), { onlyPresent: true });
  openDialog(elements.memberDialog);
}

function resumePendingProfileDraft() {
  const draft = state.pendingProfileDraft;
  if (!draft || (!state.isAdmin && !state.isMember)) return;
  const ownProfile = myMember();
  openEditor(ownProfile ? "edit" : "add", ownProfile?.id || null, draft);
  showToast(t("profileDraftRestored"));
}

function formPayload(form) {
  const formData = new FormData(form);
  const skills = String(formData.get("skills") || "")
    .split(/[，,、;；\n]+/)
    .map((skill) => skill.trim())
    .filter(Boolean);
  const payload = { skills, visibility: "public", updated_at: new Date().toISOString() };
  fields.filter((field) => field.key !== "skills").forEach((field) => {
    const value = String(formData.get(field.key) || "").trim();
    payload[field.key] = value || null;
  });
  if (payload.wallet_address) payload.wallet_address = normalizeEvmAddress(payload.wallet_address);
  if (payload.ens_name) payload.ens_name = payload.ens_name.toLowerCase();
  return payload;
}

function validateWalletField() {
  const input = elements.memberForm.elements.wallet_address;
  const value = String(input?.value || "").trim();
  const valid = !value || isEvmAddress(value);
  if (input) {
    input.setCustomValidity(valid ? "" : t("walletInvalid"));
    input.setAttribute("aria-invalid", String(!valid));
  }
  return valid;
}

async function connectProfileWallet() {
  const button = document.querySelector("#connectWalletBtn");
  const status = document.querySelector("#walletEditorStatus");
  const input = elements.memberForm.elements.wallet_address;
  if (!button || !status || !input) return;
  if (!window.ethereum?.request) {
    status.textContent = t("walletProviderMissing");
    status.className = "wallet-editor-status error";
    input.focus();
    return;
  }

  button.disabled = true;
  button.textContent = t("walletConnecting");
  status.textContent = "";
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const address = normalizeEvmAddress(accounts?.[0]);
    if (!address) throw new Error("INVALID_WALLET_ADDRESS");
    input.value = address;
    validateWalletField();
    state.editorDirty = true;
    status.textContent = t("walletConnected");
    status.className = "wallet-editor-status success";
  } catch (error) {
    console.error("wallet connection failed", error);
    status.textContent = t("walletRequestRejected");
    status.className = "wallet-editor-status error";
  } finally {
    button.disabled = false;
    button.textContent = t("connectWallet");
  }
}

function onchainFailureMessage(error) {
  const errorMessages = {
    THE_GRAPH_NOT_CONFIGURED: "graphNotConfigured",
    THE_GRAPH_AUTH_FAILED: "graphAuthFailed",
    THE_GRAPH_QUERY_FAILED: "graphProviderFailed",
    THE_GRAPH_TIMEOUT: "graphTimeout",
  };
  const key = errorMessages[error?.code];
  return `${key ? t(key) : t("graphQueryFailed")} [${error?.code || "UNKNOWN"}]`;
}

async function requestMemberOnchain(member) {
  const walletAddress = normalizeEvmAddress(member?.wallet_address);
  if (!walletAddress) return null;
  const response = await app.callFunction({
    name: "seedclub-ai-search",
    data: { action: "onchain_profile", walletAddress },
  });
  let result = response?.result ?? response;
  if (typeof result === "string") result = JSON.parse(result);
  if (!result?.success || !result?.profile?.source?.live) {
    const error = new Error(result?.message || result?.code || "THE_GRAPH_QUERY_FAILED");
    error.code = result?.code;
    throw error;
  }
  state.onchainProfiles.set(walletAddress, result.profile);
  return result.profile;
}

async function queryMemberOnchain(memberId) {
  const member = findMember(memberId);
  const walletAddress = normalizeEvmAddress(member?.wallet_address);
  if (!member || !walletAddress || state.onchainLoading.has(walletAddress)) return;

  state.onchainLoading.add(walletAddress);
  state.onchainErrors.delete(walletAddress);
  render();
  try {
    await requestMemberOnchain(member);
  } catch (error) {
    console.error("The Graph wallet query failed", error);
    state.onchainErrors.set(walletAddress, onchainFailureMessage(error));
  } finally {
    state.onchainLoading.delete(walletAddress);
    render();
  }
}

async function hydrateAiMatchProofs(matches) {
  if (!intentNeedsOnchain(state.aiIntent, state.aiQuery)) return;
  const targets = matches
    .map(({ member }) => member)
    .filter((member, index, members) => {
      const walletAddress = normalizeEvmAddress(member?.wallet_address);
      if (!walletAddress || state.onchainProfiles.has(walletAddress) || state.onchainLoading.has(walletAddress)) return false;
      return members.findIndex((candidate) => normalizeEvmAddress(candidate?.wallet_address) === walletAddress) === index;
    });
  if (!targets.length) return;

  targets.forEach((member) => {
    const walletAddress = normalizeEvmAddress(member.wallet_address);
    state.onchainLoading.add(walletAddress);
    state.onchainErrors.delete(walletAddress);
  });
  state.aiVerifying = true;
  renderAiResults();

  await Promise.all(targets.map(async (member) => {
    const walletAddress = normalizeEvmAddress(member.wallet_address);
    try {
      await requestMemberOnchain(member);
    } catch (error) {
      console.error("The Graph talent verification failed", error);
      state.onchainErrors.set(walletAddress, onchainFailureMessage(error));
    } finally {
      state.onchainLoading.delete(walletAddress);
    }
  }));

  state.aiVerifying = false;
  render();
}

function normalizedStringList(value, maxItems) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))].slice(0, maxItems);
}

function localSkillFallback(profile) {
  const aiSkills = normalizedStringList(profile.skills, 12);
  const fragments = [
    ...aiSkills,
    profile.occupation,
    ...[profile.experience, profile.intro]
      .filter(Boolean)
      .flatMap((value) => String(value).split(/[，,、;；/|\n]+/)),
  ];
  return {
    ai_skills: aiSkills,
    ai_search_terms: normalizedStringList(fragments, 36),
    ai_skills_updated_at: null,
  };
}

async function generateProfileFromIntroduction() {
  if (state.aiProfileGenerating) return;
  const introduction = elements.profileAiInput.value.trim();
  elements.profileAiStatus.className = "";
  if (!introduction) {
    elements.profileAiStatus.textContent = t("profileAiRequired");
    elements.profileAiStatus.className = "error";
    elements.profileAiInput.focus();
    return;
  }

  state.aiProfileGenerating = true;
  elements.profileAiGenerateBtn.disabled = true;
  elements.profileAiGenerateBtn.textContent = t("profileAiGenerating");
  elements.profileAiStatus.textContent = "";
  try {
    const response = await app.callFunction({
      name: "seedclub-ai-search",
      data: { action: "generate_profile", introduction },
    });
    let result = response?.result ?? response;
    if (typeof result === "string") result = JSON.parse(result);
    if (!result?.success) {
      const error = new Error(result?.message || result?.code || "PROFILE_GENERATION_FAILED");
      error.code = result?.code;
      throw error;
    }

    fillMemberForm({
      name: result.name,
      occupation: result.occupation,
      skills: normalizedStringList(result.skills, 12),
      intro: result.intro,
    });
    state.editorDirty = true;
    elements.profileAiStatus.textContent = t("profileAiGenerated");
    elements.profileAiStatus.className = "success";
  } catch (error) {
    console.error("profile generation failed", error);
    elements.profileAiStatus.textContent = friendlyError(error, t("profileAiFailed"));
    elements.profileAiStatus.className = "error";
  } finally {
    state.aiProfileGenerating = false;
    elements.profileAiGenerateBtn.disabled = false;
    elements.profileAiGenerateBtn.textContent = t("profileAiGenerate");
  }
}

async function requestSkillNormalization(profile) {
  const response = await app.callFunction({
    name: "seedclub-ai-search",
    data: {
      action: "normalize_profile",
      profile: {
        name: profile.name,
        occupation: profile.occupation,
        location: profile.location,
        skills: profile.skills,
        experience: profile.experience,
        intro: profile.intro,
      },
    },
  });
  let result = response?.result ?? response;
  if (typeof result === "string") result = JSON.parse(result);
  if (!result?.success) {
    const error = new Error(result?.message || result?.code || "PROFILE_NORMALIZE_FAILED");
    error.code = result?.code;
    throw error;
  }
  const aiSkills = normalizedStringList(result.ai_skills, 12);
  const aiSearchTerms = normalizedStringList(result.ai_search_terms, 36);
  if (!aiSkills.length) throw new Error("PROFILE_NORMALIZE_EMPTY");
  return {
    ai_skills: aiSkills,
    ai_search_terms: normalizedStringList([...aiSkills, ...aiSearchTerms], 36),
    ai_skills_updated_at: new Date().toISOString(),
  };
}

async function normalizeLegacySkills() {
  if (!state.isAdmin || state.bulkNormalizing) return;
  const candidates = state.members.filter((member) => needsSkillNormalization(member));
  if (!candidates.length) return;

  state.bulkNormalizing = true;
  let success = 0;
  let failed = 0;
  try {
    for (let index = 0; index < candidates.length; index += 1) {
      const member = candidates[index];
      state.bulkProgress = t("normalizingSkills", { current: index + 1, total: candidates.length });
      updateAccountUi();
      try {
        const normalized = await requestSkillNormalization(member);
        const result = await getDb().from("members").update(normalized).eq("id", member.id);
        if (result.error) throw result.error;
        success += 1;
      } catch (error) {
        console.error("skill normalization failed", member.id, error);
        failed += 1;
      }
    }
    await loadMembers();
    showToast(
      failed
        ? t("aiSkillsBatchPartial", { success, failed })
        : t("aiSkillsBatchDone", { success }),
      failed ? "error" : "success",
    );
  } finally {
    state.bulkNormalizing = false;
    state.bulkProgress = "";
    updateAccountUi();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (state.saving) return;
  state.saving = true;
  elements.loginError.textContent = "";
  elements.loginSubmitBtn.disabled = true;
  elements.loginSubmitBtn.textContent = state.locale === "zh" ? "登录中…" : "Logging in…";

  try {
    const identifier = elements.usernameInput.value.trim();
    const password = elements.passwordInput.value;
    const credentials = identifier.includes("@")
      ? { email: identifier.toLowerCase(), password }
      : { username: identifier, password };
    const { data, error } = await auth.signInWithPassword(credentials);
    if (error) throw error;
    const user = data?.user || data?.session?.user;
    if (!user) throw new Error(t("errorLoginState"));
    setAccountFromUser(user);
    await waitForCredentials();
    elements.passwordInput.value = "";
    elements.loginDialog.close();
    await loadMembers();
    updateAccountUi();
    showToast(state.isAdmin ? t("loginSuccessAdmin") : t("loginSuccessMember"));
    if (state.pendingProfileDraft) {
      state.awaitingProfileAuth = false;
      window.setTimeout(resumePendingProfileDraft, 80);
    }
  } catch (error) {
    console.error(error);
    elements.loginError.textContent = friendlyError(error, t("errorLogin"));
  } finally {
    state.saving = false;
    elements.loginSubmitBtn.disabled = false;
    elements.loginSubmitBtn.textContent = t("login");
  }
}

function resetRegisterForm() {
  state.registerVerifier = null;
  state.registerEmail = "";
  elements.registerForm.reset();
  elements.registerStartFields.hidden = false;
  elements.registerVerifyFields.hidden = true;
  elements.registerCodeInput.required = false;
  elements.registerError.textContent = "";
  elements.registerUsernameValidation.textContent = "";
  elements.registerUsernameInput.setCustomValidity("");
  elements.registerUsernameInput.setAttribute("aria-invalid", "false");
  elements.registerSubmitBtn.textContent = t("sendCode");
}

async function handleRegister(event) {
  event.preventDefault();
  if (state.saving) return;
  state.saving = true;
  elements.registerError.textContent = "";
  elements.registerSubmitBtn.disabled = true;

  try {
    if (!state.registerVerifier) {
      const email = elements.registerEmailInput.value.trim().toLowerCase();
      const username = elements.registerUsernameInput.value;
      const password = elements.registerPasswordInput.value;
      const confirmPassword = elements.registerConfirmInput.value;
      if (!validateRegisterUsername()) throw new Error(t("errorUsername"));
      if (password.length < 8 || password.length > 64) throw new Error(t("errorPasswordLength"));
      if (password !== confirmPassword) throw new Error(t("errorPasswordMismatch"));

      elements.registerSubmitBtn.textContent = t("sending");
      const { data, error } = await auth.signUp({ email, username, password, name: username });
      if (error) throw error;
      if (data?.session || data?.user) {
        setAccountFromUser(data.user || data.session?.user);
        await waitForCredentials();
        await loadMembers();
        elements.registerDialog.close();
        resetRegisterForm();
        updateAccountUi();
        showToast(t("registered"));
        if (state.pendingProfileDraft) {
          state.awaitingProfileAuth = false;
          window.setTimeout(resumePendingProfileDraft, 80);
        }
        return;
      }
      if (typeof data?.verifyOtp !== "function") throw new Error(t("errorCodeDelivery"));

      state.registerVerifier = data.verifyOtp;
      state.registerEmail = email;
      elements.registerStartFields.hidden = true;
      elements.registerVerifyFields.hidden = false;
      elements.registerCodeInput.required = true;
      elements.verificationHint.textContent = t("codeSentTo", { email });
      elements.registerSubmitBtn.textContent = t("verifyComplete");
      elements.registerCodeInput.focus();
      showToast(t("codeSent"));
    } else {
      const code = elements.registerCodeInput.value.trim();
      if (!code) throw new Error(t("errorCodeRequired"));
      elements.registerSubmitBtn.textContent = t("verifying");
      const { data, error } = await state.registerVerifier({ token: code });
      if (error) throw error;
      const user = data?.user || data?.session?.user;
      if (!user) throw new Error(t("errorRegistrationState"));
      setAccountFromUser(user);
      await waitForCredentials();
      await loadMembers();
      elements.registerDialog.close();
      resetRegisterForm();
      updateAccountUi();
      showToast(t("registeredWithProfile"));
      if (state.pendingProfileDraft) {
        state.awaitingProfileAuth = false;
        window.setTimeout(resumePendingProfileDraft, 80);
      }
    }
  } catch (error) {
    console.error(error);
    elements.registerError.textContent = friendlyError(error, t("errorRegistration"));
  } finally {
    state.saving = false;
    elements.registerSubmitBtn.disabled = false;
    elements.registerSubmitBtn.textContent = state.registerVerifier ? t("verifyComplete") : t("sendCode");
  }
}

async function logoutAccount() {
  if (state.saving) return;
  state.saving = true;
  elements.adminBtn.disabled = true;
  try {
    const signOutResult = await auth.signOut();
    if (signOutResult?.error) throw signOutResult.error;
    const anonymousResult = await auth.signInAnonymously();
    if (anonymousResult.error) throw anonymousResult.error;
    setAccountFromUser(null);
    await loadMembers();
    updateAccountUi();
    showToast(t("logoutSuccess"));
  } catch (error) {
    console.error(error);
    showToast(friendlyError(error), "error");
  } finally {
    state.saving = false;
    elements.adminBtn.disabled = false;
  }
}

async function saveMember(event) {
  event.preventDefault();
  if (state.saving) return;
  elements.memberError.textContent = "";

  if (!validateWalletField()) {
    elements.memberError.textContent = t("walletInvalid");
    elements.memberForm.elements.wallet_address.focus();
    return;
  }

  const payload = formPayload(elements.memberForm);
  if (!payload.name || !payload.occupation || !payload.skills.length || !payload.intro) {
    elements.memberError.textContent = t("errorRequiredFields");
    return;
  }

  if (!state.isAdmin && !state.isMember) {
    storeProfileDraft(payload);
    state.awaitingProfileAuth = true;
    state.editorDirty = false;
    elements.memberDialog.close();
    openLoginDialog({ forProfile: true });
    return;
  }

  state.saving = true;
  elements.saveMemberBtn.disabled = true;
  elements.saveMemberBtn.textContent = t("saving");
  try {
    let usedLocalSkillFallback = false;
    elements.saveMemberBtn.textContent = t("aiPreparingSkills");
    try {
      Object.assign(payload, await requestSkillNormalization(payload));
    } catch (error) {
      // Keep profile editing available when the AI provider is temporarily
      // unavailable. A null timestamp leaves this profile in the admin's
      // backfill queue so it can be normalized later.
      console.error("profile skill normalization failed", error);
      Object.assign(payload, localSkillFallback(payload), {
        ai_skills_updated_at: null,
      });
      usedLocalSkillFallback = true;
    }

    let result;
    if (state.editorMode === "add") {
      delete payload.updated_at;
      payload.owner_id = state.isAdmin ? null : state.currentUid;
      result = await getDb().from("members").insert(payload);
    } else {
      const member = findMember(state.editingId);
      if (!member || !canEditMember(member)) throw new Error(t("errorOwnOnly"));
      result = await getDb().from("members").update(payload).eq("id", state.editingId);
    }
    if (result.error) throw result.error;

    await loadMembers();
    clearProfileDraft();
    state.awaitingProfileAuth = false;
    state.editorDirty = false;
    elements.memberDialog.close();
    render();
    updateAccountUi();
    showToast(
      usedLocalSkillFallback
        ? t("aiSkillsFallbackSaved")
        : state.editorMode === "add"
          ? t("profileCreated")
          : t("profileUpdated"),
    );
  } catch (error) {
    console.error(error);
    elements.memberError.textContent = friendlyError(error, t("errorSave"));
  } finally {
    state.saving = false;
    elements.saveMemberBtn.disabled = false;
    elements.saveMemberBtn.textContent = state.editorMode === "add" ? t("saveMember") : t("saveChanges");
  }
}

function openDelete(id) {
  if (!state.isAdmin) return;
  const member = findMember(id);
  if (!member) return;
  state.editingId = id;
  elements.deleteError.textContent = "";
  elements.deleteMessage.textContent = t("deleteMessage", { name: member.name });
  openDialog(elements.deleteDialog);
}

async function deleteMember(event) {
  event.preventDefault();
  if (!state.isAdmin || state.saving) return;
  state.saving = true;
  elements.deleteError.textContent = "";
  elements.deleteSubmitBtn.disabled = true;
  elements.deleteSubmitBtn.textContent = t("deleting");

  try {
    const { error } = await getDb().from("members").delete().eq("id", state.editingId);
    if (error) throw error;
    await loadMembers();
    elements.deleteDialog.close();
    render();
    showToast(t("memberDeleted"));
  } catch (error) {
    console.error(error);
    elements.deleteError.textContent = friendlyError(error, t("errorDelete"));
  } finally {
    state.saving = false;
    elements.deleteSubmitBtn.disabled = false;
    elements.deleteSubmitBtn.textContent = t("confirmDelete");
  }
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = elements.searchInput.value.trim();
  render();
});

elements.aiSearchForm.addEventListener("submit", handleAiSearch);

elements.languageBtn.addEventListener("click", () => {
  state.locale = state.locale === "zh" ? "en" : "zh";
  try {
    window.localStorage.setItem("seedclub-locale", state.locale);
  } catch {}
  applyLanguage();
});

document.querySelectorAll("[data-ai-search]").forEach((button) => {
  button.addEventListener("click", () => {
    elements.aiSearchInput.value = button.dataset.aiSearch;
    elements.aiSearchInput.focus();
  });
});

elements.searchInput.addEventListener("input", () => {
  state.query = elements.searchInput.value.trim();
  render();
});

document.querySelectorAll("[data-search]").forEach((button) => {
  button.addEventListener("click", () => {
    elements.searchInput.value = button.dataset.search;
    state.query = button.dataset.search;
    render();
  });
});

elements.clearSearchBtn.addEventListener("click", () => {
  elements.searchInput.value = "";
  state.query = "";
  render();
  elements.searchInput.focus();
});

function openLoginDialog({ forProfile = false } = {}) {
  elements.loginError.textContent = "";
  elements.usernameInput.value = "";
  elements.passwordInput.value = "";
  elements.loginProfileContext.hidden = !forProfile;
  openDialog(elements.loginDialog);
  window.setTimeout(() => elements.usernameInput.focus(), 50);
}

elements.adminBtn.addEventListener("click", () => {
  if (state.isAdmin || state.isMember) logoutAccount();
  else openLoginDialog();
});

elements.heroProfileBtn.addEventListener("click", () => {
  const ownProfile = myMember();
  if (!state.isAdmin && ownProfile) openEditor("edit", ownProfile.id);
  else openEditor("add");
});

elements.addMemberBtn.addEventListener("click", () => {
  const ownProfile = myMember();
  if (!state.isAdmin && ownProfile) openEditor("edit", ownProfile.id);
  else openEditor("add");
});
elements.openRegisterBtn.addEventListener("click", () => {
  elements.loginDialog.close();
  resetRegisterForm();
  openDialog(elements.registerDialog);
  window.setTimeout(() => elements.registerEmailInput.focus(), 50);
});
elements.backToLoginBtn.addEventListener("click", () => {
  elements.registerDialog.close();
  resetRegisterForm();
  openDialog(elements.loginDialog);
  window.setTimeout(() => elements.usernameInput.focus(), 50);
});
elements.loginForm.addEventListener("submit", handleLogin);
elements.registerForm.addEventListener("submit", handleRegister);
elements.registerUsernameInput.addEventListener("input", () => {
  validateRegisterUsername();
  elements.registerError.textContent = "";
});
elements.registerUsernameInput.addEventListener("blur", validateRegisterUsername);
elements.crowdfundOpenBtn.addEventListener("click", () => {
  renderCrowdfunding();
  openDialog(elements.crowdfundDialog);
});
elements.crowdfundCopyBtn.addEventListener("click", copyCrowdfundAddress);
elements.crowdfundEditBtn.addEventListener("click", openCrowdfundingEditor);
elements.crowdfundForm.addEventListener("submit", saveCrowdfunding);
elements.normalizeSkillsBtn.addEventListener("click", normalizeLegacySkills);
elements.announcementOpenBtn.addEventListener("click", openCurrentAnnouncement);
elements.announcementAdminBtn.addEventListener("click", () => openAnnouncementEditor("add"));
elements.announcementEditBtn.addEventListener("click", () => openAnnouncementEditor("edit"));
elements.announcementForm.addEventListener("submit", saveAnnouncement);
elements.announcementDialog.addEventListener("close", markCurrentAnnouncementSeen);
elements.messageLoginBtn.addEventListener("click", openLoginDialog);
elements.messageRefreshBtn.addEventListener("click", () => loadBoardMessages());
elements.messageForm.addEventListener("submit", postBoardMessage);
elements.messageInput.addEventListener("input", () => {
  elements.messageFormError.textContent = "";
  elements.messageCharacterCount.textContent = t("boardCharacters", {
    count: elements.messageInput.value.length,
  });
});
elements.messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    elements.messageForm.requestSubmit();
  }
});
elements.memberForm.addEventListener("submit", saveMember);
elements.profileAiGenerateBtn.addEventListener("click", generateProfileFromIntroduction);
document.querySelector("#connectWalletBtn")?.addEventListener("click", connectProfileWallet);
elements.memberForm.elements.wallet_address?.addEventListener("input", () => {
  validateWalletField();
  const status = document.querySelector("#walletEditorStatus");
  if (status) {
    status.textContent = isEvmAddress(elements.memberForm.elements.wallet_address.value)
      ? t("walletValid")
      : t("walletPublicNote");
    status.className = "wallet-editor-status";
  }
});
elements.memberForm.addEventListener("input", () => {
  state.editorDirty = true;
});
elements.deleteForm.addEventListener("submit", deleteMember);

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => closeDialog(button.closest("dialog")));
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    // The profile editor stays open when a touch/text-selection gesture ends
    // on the backdrop. This prevents mobile editing from discarding the form.
    if (event.target === dialog && dialog !== elements.memberDialog) closeDialog(dialog);
  });
  dialog.addEventListener("cancel", (event) => {
    if (state.saving || dialog === elements.memberDialog) event.preventDefault();
  });
});

applyLanguage();
initialize();
window.setInterval(() => {
  if (document.visibilityState === "visible" && !state.boardError && !state.boardPosting) {
    loadBoardMessages({ silent: true });
    loadCrowdfunding({ silent: true });
  }
}, 30000);
