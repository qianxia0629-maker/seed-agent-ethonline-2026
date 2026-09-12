# Submission copy — review before sending

Supersedes SUBMISSION_DRAFT.md for the frozen submission. Replace only the real video link after recording; do not submit a placeholder.

## Name
Seed Agent — Seed Club Talent

## Short description
Find community talent with AI, inspect onchain evidence, and export an explainable shortlist.

## Project description
Seed Agent extends an existing community directory with an evidence-aware discovery workflow. Users describe who they need in natural language, resolve ENSv2 names to member addresses, inspect protocol activity through The Graph, and export a candidate report with source metadata.

Profile claims and onchain activity remain separate. AI interprets the search request, while candidates come from member records and activity scores are computed from returned data. The current data scope is Ethereum mainnet Uniswap V3. A successful empty query, an unqueried wallet and a failed provider request are distinct states. Missing evidence is never filled in by the model.

The live demonstration resolves seedclub-ray.eth on Sepolia, matches its address to a member, queries activity and exports a report. The demonstration wallet currently has no evidence in the queried protocol scope; this is shown honestly rather than treated as proof of inactivity everywhere.

## How it is made
The frontend uses Vite and vanilla JavaScript, with CloudBase authentication, PostgreSQL and cloud functions. DeepSeek supports language processing. The Graph supplies indexed Uniswap V3 events and position data; deterministic scoring makes the ranking explainable. viem reads ENSv2 through the Universal Resolver on Sepolia and exposes registry hierarchy and public records. A page-local shortlist merges discovery sources and exports Markdown without contact fields. Expandable evidence includes scope, timestamps, scoring components, sample limits and validated explorer links when transactions are returned.

## The Graph — integration
Target: Best AI Tooling or AI Use Case with The Graph (Continuity).

The Graph is the live blockchain evidence source used in our natural-language member discovery workflow. The cloud function queries the Uniswap V3 mainnet Subgraph, including recent mint, burn and collect events and position evidence. For searches requiring onchain evidence, deterministic profile relevance and activity scores are combined at 70/30 weighting. The interface and exported report expose indexed blocks, query timestamps, score components and query limitations. We do not use static or mocked success data in production.

## The Graph — feedback
We initially encountered query-schema errors and had to align the selected fields with the deployed Subgraph. Making provider failure distinguishable from a successful empty result was important for this use case. Clear schema discovery and examples of safe partial-result handling would help developers build evidence-based AI applications.

## ENS — integration
Target: Best Integration of ENSv2 into an Existing Project.

We integrated ENSv2 on Sepolia into the existing member discovery and candidate-report workflow. A name is resolved through the Universal Resolver; its address is compared with actual member records. The app also reads registry hierarchy and public text records. An ENS result can directly add a matched member to the shortlist, preserving the name, network, block and resolver in the exported report. Our live demo uses seedclub-ray.eth, registered by the participant during the event. Address equality is not represented as signature verification of member ownership.

## ENS — feedback
The registration and address-record steps were separate: registering a name did not initially produce an address record. After setting the Ethereum address record on Sepolia, our real name-to-member workflow succeeded. The Explorer's Mainnet address-record label and primary-name warning can be confusing during testnet setup; clearer separation of record type, transaction network and reverse resolution would help.

## Continuity disclosure
The pre-event Seed Club Talent V5.12 baseline already included accounts, member editing, AI-assisted profile drafting and search, skill normalization, bilingual UI, community board and crowdfunding. Event work adds wallet evidence, evidence-aware ranking, ENSv2 discovery, public AgentBook reads and candidate reports with inspectable evidence. Only event work is presented for judging. See PRE_EXISTING_WORK.md and the pre-ethonline-2026 tag.

## AI disclosure
OpenAI Codex generated and revised most implementation code, tests and supporting documentation under Ray's direction. Ray supplied product goals and decisions, performed manual deployments and acceptance testing, and personally registered the ENSv2 name and configured its address record. Ray is responsible for the recorded presentation and final submission statements. We disclose substantial AI assistance rather than claiming minimal use.

## Links
- Live: https://seedclubtalent.com/
- Code: https://github.com/qianxia0629-maker/seed-agent-ethonline-2026
- Frozen runtime commit: 3023feb
- Video: NOT YET RECORDED / UPLOADED — replace before submission.

## Not claimed
World is a public AgentBook lookup in the frozen product, not completed human authorization. Sandbox access/testing is incomplete; we are not selecting World for this submission. Uncommitted authorization experiments are excluded from the frozen archive. No custom contract deployment is claimed by Seed Agent; the participant's ENS registration is distinct from deploying the application itself.

## Participant checklist
- Select Continuity, not Start Fresh. Select The Graph and ENS; a third partner is not required.
- Confirm the public repository, baseline and substantial AI disclosure are accessible.
- Attach the actual 2–4 minute video and check it in an unsigned-in browser.
- Check all form declarations yourself. Final eligibility is determined by organizers/judges.
- Internal deadline: 2026-09-13 20:00 Beijing. Official: 2026-09-14 00:00 Beijing.

Sources checked 2026-09-12:
https://ethglobal.com/events/ethonline2026/info/details
https://ethglobal.com/events/ethonline2026/prizes/the-graph
https://ethglobal.com/events/ethonline2026/prizes/ens
