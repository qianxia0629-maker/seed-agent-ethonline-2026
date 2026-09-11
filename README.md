# Seed Agent · Seed Club Talent

Find community members, inspect public onchain evidence, and export an explainable shortlist.

- Product: https://seedclubtalent.com
- Repository: https://github.com/qianxia0629-maker/seed-agent-ethonline-2026
- ETHOnline 2026 Continuity build on the preserved `pre-ethonline-2026` baseline.
- [Pre-existing work](PRE_EXISTING_WORK.md) · [AI disclosure](AI_USAGE.md) · [Build log](docs/ETHONLINE_BUILD_LOG.md)

## Try the product

1. Use AI Search, or search the directory directly without using AI quota.
2. Search `Tomo-A` for an existing test profile. Onchain evidence can legitimately be empty.
3. Add a result to the candidate shortlist, then choose **Verify activity**.
4. Resolve a name using **ENSv2 · Sepolia**. Only profiles with the resolved wallet can be added. `nick.eth` is a public lookup example, not the participant's name.
5. Enter a public agent wallet in **World · AgentBook**. Inspect registration at a World Chain block. This is a public-record lookup, not visitor authentication.
6. Export a Markdown report with search reasons and evidence metadata, without contact fields. Reloading clears the list. Multiple discovery routes retain their provenance.

中文交付说明：[最终交付](docs/FINAL_HANDOFF_ZH.md)。
简易英文演示稿：[Demo script](docs/DEMO_SCRIPT_ZH_EN.md)。

## Evidence, not claims

| Layer | Source | Meaning / limits |
| --- | --- | --- |
| Profile relevance | Real member records; bounded AI intent | Self-reported information, not independently verified skills |
| Activity | The Graph, Ethereum mainnet Uniswap V3 | Indexed protocol activity only, not all wallet activity |
| ENS discovery | ENSv2 Universal Resolver and hierarchy on Sepolia | Public name-to-address records, not wallet ownership |
| Agent registration | AgentKit Core / canonical World Chain AgentBook | Registration observed at a block, not a signed request or verified visitor |
| Candidate report | In-page selections and query observations | Snapshot, not a credential or credit score |

Onchain-request ranking uses 70% profile relevance and 30% deterministic activity score.
Missing, pending, loading, failed and no-evidence states are distinct. There are no fabricated
people, histories or human-verification successes, and no mocked provider-success fallbacks.

## Partner scope

- The Graph: live protocol queries and evidence-ranked discovery.
- ENS: functional Sepolia resolution and registry inspection. A participant-owned positive
  name-to-member demo is separate from the public-name read test.
- World: AgentBook evidence lookup. Full human-backed-agent authorization, server access
  policy and World ID Sandbox completion are **not implemented/validated**. Do not claim
  completed AgentKit Continuity qualification without further work.
  [Integration and developer feedback](docs/WORLD_INTEGRATION.md).

## Architecture

Vite + vanilla JavaScript, CloudBase authentication/PostgreSQL/cloud function, DeepSeek
for bounded language processing, The Graph for indexed evidence, viem for ENS, and
AgentKit Core for World Chain lookup. EdgeOne serves the frontend; CloudBase is the backend.

## Local development

Use Node 22+ with npm or pnpm.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm dev
```

Public read checks:

```sh
node scripts/verify-ens.mjs nick.eth sepolia
node scripts/verify-world.mjs <public-agent-wallet>
```

The frontend uses the existing CloudBase environment in `src/main.js`. For your own
deployment, configure your own environment and apply migrations under `sql/` in order.
Do not rerun migrations blindly on an existing database. Server code is in
`cloudfunctions/seedclub-ai-search`. Server variables: `DEEPSEEK_API_KEY`,
`THE_GRAPH_API_KEY`, optional `DEEPSEEK_MODEL` and `THE_GRAPH_SUBGRAPH_ID`.
Never put secrets in Vite variables, browser code, reports or commits.

## Deployment

Push reviewed changes to `main`; the existing EdgeOne integration builds `dist`.
Check the actual deployed bundle: a Git push is not proof that production is updated.
This frontend release needs no new SQL or cloud-function upload.

Settings: root repository; install `pnpm install --frozen-lockfile`; build `pnpm build`;
output `dist`. A frontend ZIP is an alternative deployable artifact, not backend code.

## Validation

Tests cover wallet validation, matching and scores, ENS resolution, canonical World
Chain lookup, RPC errors, provenance merging and report boundaries. Independent browser
checks use the public member directory, without creating fake profiles or signing for Ray.

[Release acceptance](docs/FINAL_HANDOFF_ZH.md) · [Day 6](docs/DAY6_ACCEPTANCE.md) ·
[ENS details](docs/ENSV2_INTEGRATION.md) · [Activity method](docs/ONCHAIN_PROOF_METHOD.md) ·
[Legacy changelog](docs/LEGACY_CHANGELOG.md)
