# AI Assistance Disclosure

This project uses AI-assisted development openly. OpenAI Codex produced most of the technical implementation under the participant's direction, including code generation, refactoring, test creation, documentation drafting, and implementation research.

## Participant contribution

The participant is responsible for the product and submission decisions: choosing the community talent-discovery problem, selecting the Continuity approach, defining the online-only competition scope, approving the daily milestones, deciding what data should be public, reviewing the user experience, running final acceptance checks, and presenting the project. The participant also decides which generated changes are kept in the submitted product.

## AI-assisted areas

### Pre-hackathon baseline

AI assistance was used across the Seed Club Talent V5.12 codebase, including the Vite frontend, CloudBase integration, PostgreSQL migrations, bilingual interface, member search, profile drafting, skill normalization, message board, announcements, and crowdfunding disclosure. This baseline is separately documented in `PRE_EXISTING_WORK.md` and frozen at the `pre-ethonline-2026` tag.

### ETHOnline 2026 work

OpenAI Codex assisted with the following hackathon changes:

- `src/main.js`: wallet/ENS profile fields, browser-wallet connection flow, Web3 Identity UI, and The Graph result rendering.
- `src/wallet.js`: EVM address validation, normalization, shortening, and safe explorer URLs.
- `src/style.css`: wallet editor and onchain profile presentation.
- `cloudfunctions/seedclub-ai-search/index.js`: server-side wallet validation and live The Graph gateway query.
- `sql/v6-wallet-and-onchain-profile.sql`: database migration for wallet and ENS fields.
- `test/wallet.test.js` and `scripts/verify-the-graph.mjs`: automated validation and live-query verification tooling.
- `README.md` and this disclosure: setup and transparency documentation.

For Day 3, OpenAI Codex also assisted with the deterministic Onchain Proof implementation, including the multi-entity GraphQL query, activity de-duplication, score calculation, tests, bilingual proof-card interface, and methodology documentation. The participant approved the feature scope and score framing. The score itself is calculated by fixed application logic from live query results; no AI model assigns or changes it.

For Day 4, OpenAI Codex assisted with the Verifiable Talent Search implementation, including the extended intent schema, automatic proof lookup, deterministic profile/onchain score composition, evidence-state interface, tests, and documentation. DeepSeek parses a natural-language request into bounded conditions. Candidate selection and final scoring remain deterministic and operate only on real member records and returned The Graph data; the model cannot invent candidates or onchain evidence.

## Verification and limits

- AI output is treated as a draft until it passes automated checks and participant acceptance.
- No private keys, wallet seed phrases, or API keys are committed to the repository.
- Onchain results have no mocked fallback; provider or credential failures remain visible failures.
- A connected address is currently a public profile association, not cryptographic proof of ownership. The interface and documentation say so explicitly.

This disclosure will be updated if additional AI tools or generated assets are used before submission.
