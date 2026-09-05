# Product Specification

## One-sentence product

Seed Club Talent helps a community find builders whose self-described skills are supported by transparent, live onchain evidence.

## Core user flow

1. A member signs in and creates or edits a profile.
2. The member connects an EVM wallet and confirms the address to publish.
3. The application requests indexed protocol activity from The Graph through a server-side function.
4. The profile displays an Onchain Activity Proof with its data source, query time, and limitations.
5. A user describes the builder they need in natural language.
6. Search combines profile fit with available onchain evidence and explains every recommendation.

## Product principles

- Evidence, not a credit score. The proof summarizes observable indexed activity and does not imply identity, trustworthiness, wealth, or future performance.
- Live or clearly unavailable. Provider failures must produce an honest error state, never a mocked success state.
- Consent before publication. Wallet addresses and related public evidence are saved only through an explicit profile action.
- Explainable recommendations. Every ranked result must identify the profile and onchain signals that affected it.
- Existing community utility remains intact. Registration, profiles, directory search, and the message board must continue to work.

## Phase 1 acceptance criteria

### Wallet-linked profiles

- The editor can request an address from an injected EVM wallet.
- A user can also paste an address for wallets not exposed to the browser.
- The app validates and normalizes an EVM address before save.
- The public member card displays a shortened address linked to a block explorer.
- The database migration adds wallet and proof fields without changing existing records.

### The Graph provider boundary

- API credentials stay in the serverless environment, never in browser code.
- Queries use a configured Graph Network Subgraph ID and live Gateway request.
- The response records the provider, subgraph identifier, indexed block when available, and query timestamp.
- Missing configuration, timeouts, GraphQL errors, and empty evidence have distinct responses.
- No mock activity is returned in production code.

### Onchain Activity Proof

- Shows only observed signals returned by configured Subgraphs.
- Includes an evidence count, activity categories, networks or protocols when known, and the last refresh time.
- Clearly states that a wallet does not prove a person's identity.
- Allows the profile owner to refresh the evidence.

## Later acceptance criteria

### Verifiable Talent Search

- Starts from real public member records.
- Uses deterministic matching for mandatory constraints.
- Adds only available onchain evidence to ranking.
- Gives concise, inspectable reasons for every recommended member.
- Does not invent members, transactions, protocols, or scores.

### ENS

- Resolves a real name or avatar from a supported ENS data source.
- Falls back to the wallet address when no name is found.
- Never displays a hard-coded sample identity as a resolved result.

## Out of scope

- Financial advice or wallet risk scoring.
- Sybil resistance claims without a dedicated proof system.
- Automated outreach or transactions.
- Hidden ranking criteria.

