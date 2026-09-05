# AI Usage Disclosure

## Summary

Seed Club Talent is being developed with a human-directed, AI-assisted workflow. AI tools generate a substantial portion of code, tests, technical documentation, and implementation options. They do not independently choose the problem, competition strategy, product scope, release criteria, or what is submitted.

## Human contribution and accountability

Ray is the project owner and makes the consequential decisions:

- Identified the community talent discovery problem and the target users.
- Chose the Verifiable Web3 Builder Network direction and The Graph Continuity track.
- Defined the desired user flow, feature priorities, non-goals, and judging narrative.
- Supplied the pre-existing product, community context, production environment, and deployment accounts.
- Evaluates visible behavior, usability, factual accuracy, and whether each feature serves the intended users.
- Approves database changes, deployments, public source publication, demo content, and the final submission.
- Presents the project and remains accountable for its claims and limitations.

Ray is not claiming to have manually authored AI-generated source code. The meaningful human work is product authorship: setting direction and constraints, making tradeoffs, validating results, rejecting unsuitable outputs, and deciding what becomes part of the product.

## AI contribution

OpenAI Codex is used as the primary implementation assistant for:

- Inspecting the existing codebase and proposing compatible architecture.
- Generating and editing frontend, serverless function, database migration, and test code.
- Refactoring, debugging, and interpreting build or test failures.
- Drafting technical documentation, setup instructions, and disclosure records.
- Checking implementation against the product specification and competition requirements.

DeepSeek was already part of the pre-event product for profile drafting, translation, skill normalization, and intent parsing. Those existing features are listed in `PRE_EXISTING_WORK.md`.

## Validation process

AI-generated output is treated as a proposed implementation, not automatic acceptance. A change is retained only after the relevant automated checks pass and Ray evaluates the user-facing result or explicitly accepts the documented limitation. Live onchain claims must originate from a configured The Graph endpoint; the application does not substitute mock data when that provider is unavailable.

## File-level record

| Area | AI assistance | Human decision or validation |
| --- | --- | --- |
| `HACKATHON.md` | Drafted the structured scope and checkpoints | Approved project direction and priorities |
| `AI_USAGE.md` | Drafted disclosure language and contribution mapping | Chose transparent disclosure and accepted final wording |
| `docs/PRODUCT_SPEC.md` | Converted the project plan into acceptance criteria | Supplied the plan and product constraints |
| `docs/AI_DEVELOPMENT_LOG.md` | Maintains an implementation and prompt summary | Confirms decisions and visible results |
| `src/web3.js` | Generated address validation and stored-proof parsing utilities | Chose the public wallet flow and acceptance behavior |
| `src/main.js` | Implemented wallet connection, profile persistence, proof refresh, and evidence display | Defined the user flow, public wording, and evidence boundaries |
| `src/style.css` | Added responsive presentation for wallet and proof sections | Required preservation of the existing product style |
| `sql/v6-ethonline-wallet-and-proof.sql` | Generated the additive database migration | Approved wallet and evidence fields without rewriting existing records |
| `cloudfunctions/seedclub-ai-search/onchain-proof.js` | Implemented The Graph query, aggregation, failures, and limitations | Chose live-only evidence and Uniswap V3 as the first supported protocol |
| `cloudfunctions/seedclub-ai-search/index.js` | Added authenticated proof refresh, database persistence, and onchain intent fields | Required member ownership controls, server-side credentials, and explicit evidence requests |
| `src/matching.js` | Added deterministic matching against stored provider evidence | Required AI to extract intent without inventing or selecting members |
| `test/` and `*.test.cjs` | Generated utility, provider-boundary, and matching tests | Requires passing tests before accepting the implementation |
| `README.md` | Documented The Graph source, environment variables, and deployment order | Owns deployment and will validate the live production result |

This table is updated as competition code is added.

## Tools and models

- OpenAI Codex: repository work, code generation, tests, debugging, and documentation.
- DeepSeek API: existing in-product language features and future structured search reasoning where documented.

No AI-generated or text-to-speech voice will be used in the submission video.
