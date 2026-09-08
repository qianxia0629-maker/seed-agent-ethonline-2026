# ETHOnline 2026 Build Log

This log separates work completed during the event from the frozen pre-event product. Times and dates use Asia/Shanghai unless noted otherwise.

## Before hacking began — 2026-09-04

- Frozen Seed Club Talent V5.12 at Git tag `pre-ethonline-2026`.
- Recorded the existing product and excluded hackathon features in `PRE_EXISTING_WORK.md`.
- Confirmed the repository would be public and the submission would use the appropriate Continuity pool.

## Day 1 — 2026-09-05

- Verified the pre-event snapshot builds successfully.
- Organized the public source history so later hackathon commits can be compared with the baseline.
- Confirmed the product direction: extend the member directory into Seed Agent, an explainable team-discovery product using real onchain signals.

## Day 2 — 2026-09-06

### Participant-approved brief

- Build the Wallet + Onchain Profile foundation and do not expand the AI matching system yet.
- Add `walletAddress` to member profiles.
- Let a user connect a browser wallet and save the address in CloudBase.
- Display wallet identity on the public member card.
- Add a server-side wallet query interface.
- Make the first real The Graph query; do not use mock, local-only, or static blockchain data.
- Success condition: given a valid `0x…` address, the backend returns live indexed onchain data from The Graph.

### Implementation decisions

- Store normalized lowercase EVM addresses and optional participant-supplied ENS names.
- Keep The Graph credentials exclusively in cloud-function environment variables.
- Query the decentralized gateway for the public `Uniswap V3 Mainnet` subgraph.
- Return the current indexed block plus wallet-owned liquidity positions so a wallet with no positions still has verifiable live-query metadata.
- Label the wallet as an address association, not proof of ownership; signature verification remains future work.
- Keep provider failure visible and ship no mocked fallback.

### Checks

- EVM address and explorer-link unit tests.
- Cloud-function JavaScript syntax check.
- Vite production build.
- `git diff --check` before commit.
- Live gateway verification passed against indexed Ethereum block `25917617`; the test wallet correctly returned an empty liquidity-position list without using fallback data.
- Replaced the original Substreams deployment after the gateway reported that it had no active indexer allocations.

### Deployment status

- Applied and verified the PostgreSQL wallet/ENS migration in the production CloudBase environment.
- Deployed the updated `seedclub-ai-search` function on the existing Node.js 20 runtime using merged configuration so existing environment variables were preserved.
- Deployed the production frontend to CloudBase static hosting with a pre-release backup and remote-file verification.
- Verified the served JavaScript bundle contains the Web3 Identity interface and `onchain_profile` action.
- Added `scripts/fixtures/day2-onchain-query.json` as a reproducible cloud-function input. Direct CLI invocation correctly remained behind the app's existing login requirement; the final end-to-end query is therefore run through the deployed website session.
- Participant acceptance passed on the deployed website: the Web3 Identity panel returned live The Graph data through indexed Ethereum block `25917645` without a provider error.
- The acceptance screenshot is archived at `docs/evidence/day2-the-graph-live.png`.

## Day 3 — 2026-09-07

### Participant-approved brief

- Turn the Day 2 wallet query into a visible `Verified Onchain Activity` proof.
- Show the first observed activity year, verified networks and protocols, 90-day activity, and a transparent `0–100` activity score.
- Do not call it a credit score and do not imply that activity proves identity, skill, wealth, or personal value.
- Use only live The Graph results. A wallet with no evidence must receive a visible zero result, not mock data.
- Keep AI talent matching out of Day 3; that remains the Day 4 milestone.

### Implementation decisions

- Query Uniswap V3 mints, burns, fee collections, and owned positions from the indexed Ethereum Subgraph.
- Count unique transaction hashes in the 90-day window so multiple events from one transaction are not double-counted.
- Calculate the score with fixed code across four visible components: history, recent activity, active positions, and protocol evidence.
- Mark Ethereum and Uniswap V3 as verified only when wallet-specific evidence exists.
- Include the indexed block, Subgraph link, capped-result notice, and a plain-language score disclaimer in the profile card.
- Publish the complete method and limits in `docs/ONCHAIN_PROOF_METHOD.md`.

### Checks

- Live GraphQL schema and empty-wallet query against the decentralized gateway.
- Unit tests for zero evidence, transaction de-duplication, position scoring, and capped results.
- Cloud-function JavaScript syntax check.
- Vite production build and `git diff --check`.

### Deployment and acceptance

- Deployed and remotely verified the Day 3 frontend bundle on CloudBase static hosting.
- Updated the production cloud function through the participant's CloudBase console while preserving its environment configuration.
- Participant acceptance passed on the deployed website through indexed Ethereum block `25921064`.
- The zero-evidence acceptance screenshot is archived at `docs/evidence/day3-onchain-proof-zero-evidence.png`.

## Day 4 — 2026-09-08

### Participant-approved brief

- Turn the existing member search into `AI Verifiable Talent Search`.
- Support a request such as “Find a Solidity developer with real DeFi onchain experience.”
- Combine real member profiles with live The Graph evidence without allowing the AI model to invent candidates or activity.
- Show the match score, matching profile fields, onchain evidence state, and a plain-language explanation.

### Implementation decisions

- Extend the bounded AI intent schema with explicit onchain-evidence, network, and protocol requirements.
- Keep candidate selection deterministic and restricted to the public member records already loaded by the application.
- Automatically query wallet-linked matches only when the request asks for onchain evidence.
- Calculate a request-specific score in code: 70% normalized profile relevance and 30% deterministic Onchain Activity Score for onchain requests.
- Re-rank only from calculated profile and proof values; the AI model does not assign the score.
- Keep missing wallets, successful zero-evidence queries, and provider failures as separate visible states.

### Checks

- Unit tests for onchain-intent detection, score composition, zero/missing evidence, and evidence-based re-ranking.
- Existing wallet and Onchain Proof tests.
- Cloud-function JavaScript syntax check.
- Vite production build and `git diff --check`.

### Deployment and acceptance

- Deployed the updated cloud function and frontend to the production CloudBase environment while preserving the existing secret configuration.
- Participant acceptance passed with the request `找到 Tomo-A，并核验其真实链上活动`.
- The result selected the real `Tomo-A` member record, displayed `100/100` profile relevance, returned a live zero-evidence Onchain Activity Score, and calculated the documented combined score of `70`.
- The Graph response was visibly sourced through indexed Ethereum block `25929436`; the application did not infer or mock missing wallet activity.
- The acceptance screenshot is archived at `docs/evidence/day4-verifiable-talent-search.png`.
