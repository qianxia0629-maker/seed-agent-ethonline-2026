# AI Development Log

This log summarizes the specifications, prompts, decisions, and validation artifacts used in the human-directed AI-assisted workflow.

## 2026-09-05: project setup

### Human direction

- Continue the existing Seed Club Talent product for ETHOnline 2026.
- Build a Verifiable Web3 Builder Network rather than an unrelated new product.
- Prioritize The Graph, then ENS; treat World proof-of-human as optional.
- Keep the existing product useful and avoid tokens, NFTs, payments, or a full redesign.
- Publish source code and clearly identify pre-event work.
- Develop wallet profiles, live onchain evidence, explainable talent search, and a concise demo.

### Implementation prompt summary

Inspect the existing Vite and CloudBase application, preserve its style and user flows, create a post-baseline competition branch, and implement the plan in small verifiable commits. Keep provider keys server-side, do not mock live onchain evidence, add loading, empty, and error states, and document the exact human and AI contribution without overstating manual coding.

### Decisions

- Competition branch: `ethonline-2026`.
- Pre-event reference: `pre-ethonline-2026` tag and `PRE_EXISTING_WORK.md`.
- Disclosure: state that AI performs substantial implementation while Ray owns product decisions, validation, deployment, and presentation.
- Provider behavior: fail clearly when The Graph is not configured; never convert missing live data into a successful proof.

### Validation

- Repository and pre-event tag inspected.
- Existing architecture and profile flow identified.
- Official ETHGlobal AI disclosure and continuity requirements reviewed.
- Implementation validation will be appended per feature commit.

## 2026-09-05: wallet profiles and first The Graph provider

### Implementation prompt summary

Add an optional public EVM wallet to member profiles. Support an injected browser wallet and manual address entry, validate and normalize addresses, clear cached evidence when an address changes, and display a transparent activity proof on the member card. Query live indexed Uniswap V3 activity through a server-side The Graph Gateway integration. Do not expose the API key and do not return mock activity when the provider is missing or fails.

### AI-generated implementation

- Additive PostgreSQL migration for wallet and cached proof fields.
- Browser wallet connection, manual input, validation, and responsive interface.
- Authenticated serverless refresh action tied to the member profile owner.
- Uniswap V3 Subgraph queries for swaps, mints, burns, and fee collections.
- Evidence aggregation with explicit 100-event-per-category limits and source metadata.
- Unit tests for address handling, proof parsing, provider configuration, and Gateway authentication.

### Human decisions retained in the product

- Wallet information is optional and published only with the profile save action.
- Connecting a wallet is not described as legal identity verification.
- The first evidence source is deliberately narrow and named: Uniswap V3 on Ethereum.
- Empty or unavailable live evidence is shown honestly instead of being replaced with sample data.
- The existing member directory, AI profile features, and community board remain in place.

### Validation

- 8 automated tests passed.
- Cloud function JavaScript syntax checks passed.
- Vite production build passed from the canonical G drive project path.
- Live Gateway validation remains pending until `GRAPH_API_KEY` is configured in CloudBase.

## 2026-09-05: explainable profile and onchain search

### Implementation prompt summary

Extend the existing natural-language talent search so a user can explicitly request observable onchain experience. The AI may extract structured intent but must not choose or invent candidates. Apply the intent deterministically to real member records and cached The Graph evidence. Do not require wallet evidence for an ordinary Web3 or DeFi skills request.

### AI-generated implementation

- Added structured intent fields for protocol, activity type, and explicit evidence requirements.
- Extended deterministic search with provider, activity, and observed-event conditions.
- Added evidence-backed reasons to matching results.
- Added tests for explicit onchain requirements and ordinary skill-search fairness.

### Human product decisions

- Onchain evidence is opt-in as a search constraint, not a default measure of builder quality.
- DeepSeek parses the request but does not receive the full member database and does not pick winners.
- The browser ranks only members that already exist in the community database.

### Validation

- 11 automated tests passed after this change.
- Vite production build passed.
