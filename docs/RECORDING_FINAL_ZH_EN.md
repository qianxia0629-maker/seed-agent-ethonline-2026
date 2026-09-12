# 最终录屏稿｜Ray 本人讲解

本稿取代旧 DEMO_SCRIPT_ZH_EN.md。目标约 3 分钟，按实际录制检查时长。
只读英文；中文和操作提示不用读。正常语速，不必背得一字不差。

## 录前准备

- 电脑录屏，建议 1920×1080；只录产品窗口，关闭通知和无关标签。
- 网站 https://seedclubtalent.com/，切换 EN。不要录钱包助记词、云控制台或私人联系方式。
- 名称 seedclub-ray.eth，网络 ENSv2 / Sepolia。主网活动查询与名称网络不同。
- 先试一次搜索，确认当日限额可用；正式录制避免反复请求。
- 候选名单刷新即清空，录制过程中不要刷新。完成全部来源添加后再导出。
- 当前真实结果是 no_evidence。不要换成伪造的正向数据，不要为了演示临时做真钱交易。

## 0:00–0:20｜首页

Hi, I'm Ray. This is Seed Agent, built on Seed Club Talent.

It helps people find community members and inspect the evidence behind a match.

We keep profile information and onchain activity separate.

中文：找社区成员，并检查匹配依据；自述资料与链上活动分开。

## 0:20–1:00｜AI 搜索

操作：输入 `Find Tomo-A and check onchain activity`，运行搜索，展示资料匹配与活动评分。

I can describe who I want to find in plain language.

Here, I search for Tomo-A and ask for onchain activity.

The AI understands my request. It does not invent candidates. Results come from our member directory.

The profile score shows relevance to this search. The activity score describes the data we found. Neither score measures a person's ability.

中文：AI 解析需求，成员来自真实成员库；两种分数不代表能力。

## 1:00–1:40｜ENS 找人

操作：查询 `seedclub-ray.eth`，选择 Sepolia。展示解析地址、查询区块和匹配成员，在 ENS 结果里点 Add to shortlist。

Next, I search by my ENS name, seedclub-ray dot eth.

I registered this name on Sepolia using ENSv2.

The app reads the name's address and finds a member profile with the same wallet address.

We also show the query block and resolver information.

This is an address match. It does not prove that every profile claim is true.

中文：演示本人注册名称的实际解析；不是仅装饰性地显示名字。

## 1:40–2:35｜The Graph 与证据详情

操作：候选名单点 Verify activity，再展开 Inspect onchain evidence。

Now I check the candidate through The Graph.

Our current query covers Uniswap V3 on Ethereum mainnet. Recent events cover ninety days.

For this wallet, no evidence was found in that scope. This is a real query result, not an error. It does not mean the wallet has never been active elsewhere.

The details show the source, query time, indexed block, and score breakdown.

When transaction evidence is returned, the app provides explorer links. We label samples and query limits instead of pretending to show a complete history.

中文：这里展示真实的零证据结果；不要口头声称画面里有交易链接。

## 2:35–3:10｜导出与收尾

操作：Export candidate report，打开本次下载文件，展示 ENS 和 Graph 来源。避开记事本其他私人文档标签。

I can export a report with the discovery source, ENS resolution, and activity evidence. Contact fields are excluded.

This is a Continuity project. The directory and basic AI search existed before the event.

During the event, we added live onchain evidence, evidence-aware matching, ENSv2 discovery, and this report workflow.

Our repository includes the baseline, development history, and AI-use disclosure.

The goal is simple: find people, and make the evidence easy to inspect. Thank you.

## 故障备用句

- The data provider is taking longer than expected.（服务较慢。）
- This request failed. We do not treat failure as missing evidence.（失败不会算成零证据。）
- This is testnet name data, separate from mainnet activity.（名称测试网与主网活动分开。）

## 录完检查

- 2–4 分钟，至少 720p，本人声音清晰。不要 AI 配音、手机拍屏或整体加速。
- 允许剪掉等待，但不能剪接成没有发生的成功操作。
- 视频必须展示产品操作；不要只录幻灯片或只放音乐字幕。
- 检查 ENS 来源确实写进报告；只报 The Graph 与 ENS，不把 World 当作完成的真人认证。
- 上传后用未登录窗口确认可播放，把真实链接填入提交表。当前尚无最终视频文件或上传链接。

规则来源（2026-09-12 核对）：https://ethglobal.com/events/ethonline2026/info/details
