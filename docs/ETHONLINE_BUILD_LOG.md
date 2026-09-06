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
