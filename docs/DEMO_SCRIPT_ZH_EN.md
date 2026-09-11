# 演示稿：简单英文版（约 3 分钟）

只读英文，中文帮助理解。先排练一次，按实际查询速度停顿。
录屏前关闭无关页面、通知和钱包弹窗；不要展示云端密钥或私人资料。
本稿不声称 World 真人授权已完成，也不把零证据说成错误。

## 0:00–0:25 · 打开网站，切换 English

Hi, I'm Ray. This is Seed Agent, built on Seed Club Talent.

It helps people find community members and check the public evidence behind a match.

A profile tells us what someone says they can do. Onchain data gives us another source to inspect. These are different things, and our product keeps them separate.

中文：这是一个找社区成员、查看匹配证据的产品。成员自述和链上证据分开显示。

## 0:25–1:05 · AI Search

I can describe who I want to find in plain language.

For this demo, I will search for Tomo-A and check this address's onchain activity.

The AI turns my request into search conditions. It does not create people. Every result comes from the member directory.

Here we show the profile match and the onchain evidence separately. The score measures this search, not the person's ability.

操作：输入 `Find Tomo-A and check onchain activity`，点击 AI 搜索。不要重复点击，以免消耗当日限额。

## 1:05–1:40 · 核验与报告

I can add this member to my shortlist and check activity through The Graph.

Our current coverage is Uniswap V3 on Ethereum mainnet. The result includes an indexed block.

If no evidence is found, we say so. That does not mean the wallet has never been active. A failed query is also shown as a failure, not as a successful result.

I can export a report with the search reasons and available data sources. Contact fields are not included.

操作：Add to shortlist → Verify activity → Export candidate report。只展示真实返回。

## 1:40–2:15 · ENS

We also support ENSv2 on Sepolia.

I can resolve a name, inspect its registry path, and read its public records.

The resolved address can be used to find matching member profiles. We do not claim that a matching address proves wallet ownership.

Sepolia name records and Ethereum mainnet activity are different sources, so we label both networks clearly.

操作：查询 `nick.eth`。这是公开示例，不是 Ray 的名称；若无匹配成员，照实展示。

## 2:15–2:40 · World

The World panel reads public AgentBook registration using AgentKit Core.

It shows whether a registration exists at a World Chain block. We do not display the anonymous human identifier.

This is a registration lookup. It is not a completed login or human verification flow for the current visitor.

操作：查询已公开的测试成员钱包。没有注册就展示未注册，不要说“真人验证通过”。

## 2:40–3:05 · 收尾

This is a Continuity project. The member directory existed before the event.

During the event, we added onchain evidence, ENSv2 discovery, AgentBook lookup, and the candidate report workflow.

The source code includes our original baseline, build history, testing notes, and AI-use disclosure.

Our goal is simple: make it easier to find people, and make the evidence easier to understand. Thank you.

## 卡住时可以说

- `The provider is taking longer than expected. I will show another part of the flow.`
  数据服务返回较慢，我先展示另一部分。
- `This address has no evidence in our current query scope.`
  这个地址在当前查询范围内没有证据。
- `This part still needs participant verification. I do not want to overstate it.`
  这部分还需要本人验证，我不会夸大完成情况。

官方要求 2–4 分钟视频。录完后实际检查时长、音量和画面，再提交。
