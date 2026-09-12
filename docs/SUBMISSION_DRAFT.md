# Submission draft — participant review required

> Superseded by [SUBMISSION_FINAL.md](SUBMISSION_FINAL.md) for the frozen release.

## Project name
Seed Agent — Seed Club Talent

## Short description (under 100 characters)
Find community talent with AI, inspect onchain evidence, and export an explainable shortlist.

## Description
Seed Agent adds public onchain evidence to an existing community member directory.
Users search in natural language, inspect profile relevance separately from protocol
activity, discover addresses through ENSv2 on Sepolia, and export a candidate shortlist
with the search context and available source metadata. The AI parses intent; candidates
are selected from actual member records. Missing evidence and provider failures remain
visible, rather than being filled in by a model.

The Graph supplies Ethereum mainnet Uniswap V3 activity. ENSv2 supplies name/address
records and registry hierarchy. An additional AgentKit Core integration reads canonical
World Chain AgentBook registrations without retaining the anonymous human identifier.
The registration lookup is not a completed human-backed-agent authorization flow.

## How it is made
Vite and vanilla JavaScript frontend; CloudBase authentication, PostgreSQL and cloud
functions; DeepSeek for bounded language processing; The Graph for indexed protocol
queries; viem for ENS reads; AgentKit Core for AgentBook lookup. Candidate reports are
generated in the browser. Keys remain server-side, and shortlist contact fields are
not exported. Tests cover scoring, invalid data, RPC failure, stale associations and
source provenance. No mocked-success fallback is used in production.

## Continuity disclosure
The pre-event Seed Club Talent V5.12 baseline already included accounts, member CRUD,
AI-assisted profile drafting/search, skill normalization, bilingual UI, community board
and crowdfunding. The event work adds wallet fields, live activity evidence, evidence-aware
ranking, ENSv2 discovery, World AgentBook registration reads and candidate reports.
See PRE_EXISTING_WORK.md, AI_USAGE.md and the preserved pre-ethonline-2026 tag.

## AI disclosure
OpenAI Codex generated and revised most technical implementation and supporting test
and documentation work under Ray's direction. Ray supplied the product goals, performed
manual deployments/acceptance in earlier stages, and remains responsible for final
participant statements and submission. Do not replace this with a claim of minimal AI use.

## Links
- Product: https://seedclubtalent.com
- Repository: https://github.com/qianxia0629-maker/seed-agent-ethonline-2026
- Demo video: participant must record, upload and paste the real link.

## Partner selection caution
The Graph and ENS are candidate partner entries subject to each track's eligibility
and final demonstration. World AgentKit Continuity is NOT ready to claim: the current
feature is a registration lookup, without completed signed-agent authorization and
World ID Sandbox testing. Three is a maximum, not a requirement to select three.

## Verified event constraints (September 11, 2026)
- Deadline: September 13, 12:00 EDT = September 14, 00:00 Beijing.
- Participant's earlier internal deadline remains September 13, 20:00 Beijing.
- Required demo video: 2–4 minutes.
- Up to three partner prizes; Continuity disclosures must distinguish existing work.

Sources:
- https://ethglobal.com/events/ethonline2026/info/details
- https://ethglobal.com/events/ethonline2026/prizes/world
- https://ethglobal.com/events/ethonline2026/prizes/ens
