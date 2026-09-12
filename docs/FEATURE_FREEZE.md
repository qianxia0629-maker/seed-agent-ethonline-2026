# Feature freeze — 2026-09-12

Runtime baseline: `3023feb`. No new product features after this point without Ray's approval. Documentation and submission preparation may continue. EdgeOne main auto-deployment remains enabled; this is a release policy, not a disabled deployment switch.

Frozen scope: directory, AI search, Graph activity evidence, ENSv2 discovery, page-local shortlist, expandable evidence and Markdown export. Public AgentBook lookup is supplementary only.

Uncommitted World authorization, SQL, dependency and main.js experiments remain local and are NOT in the frozen Git source. Do not package the dirty working directory or its dist as the submission build. Use the frozen Git archive or a clean checkout.

## Acceptance

- Sep12 live browser: seedclub-ray.eth -> existing member -> Graph -> expanded details -> report download; 390px layout check passed, no browser errors.
- Live report: ENS Sepolia block 11689139; Graph block 25961573. These are historical snapshots, not hard-coded current values.
- Ray's subsequent screenshots confirm the deployed details and exported scoring/scope information (Graph block 25961587, ENS block 11689146).
- Actual demo data: no_evidence in Ethereum Uniswap V3 scope. No fake positive transactions.
- Feature tests passed: details/link rendering, safe URLs, empty results, cap/index warnings, stale evidence exclusion. World experiment tests are not evidence of production Sandbox readiness.

## Current handoff

Use RECORDING_FINAL_ZH_EN.md and SUBMISSION_FINAL.md instead of older drafts. ENS participant-name positive flow is now complete; older notes saying it is pending are superseded. Video recording, upload and final form submission remain outstanding.
