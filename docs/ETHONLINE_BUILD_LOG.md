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
- Query the decentralized gateway for the public `Substreams Uniswap v3 Ethereum` subgraph.
- Return the current indexed block plus recent wallet-originated swaps so a zero-activity wallet still has verifiable live-query metadata.
- Label the wallet as an address association, not proof of ownership; signature verification remains future work.
- Keep provider failure visible and ship no mocked fallback.

### Checks

- EVM address and explorer-link unit tests.
- Cloud-function JavaScript syntax check.
- Vite production build.
- `git diff --check` before commit.
- Live gateway verification requires a participant-owned The Graph API key and is performed after the key is added to the cloud-function environment.
