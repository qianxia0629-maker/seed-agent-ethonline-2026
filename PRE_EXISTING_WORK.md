# Pre-Existing Work Disclosure

This file records the state of Seed Club Talent before ETHOnline 2026 hacking began.

## Baseline

- Product: Seed Club Talent
- Version: V5.12.0
- Snapshot date: 2026-09-04 (Asia/Shanghai)
- Git tag: `pre-ethonline-2026`
- Purpose: existing community member directory and talent discovery website

## Features that already existed

- Member registration and sign-in with email or username.
- Member profile creation, editing, and ownership controls.
- AI-assisted profile drafting from a short self-introduction.
- AI-assisted natural-language member search.
- Deterministic matching against real member records; the AI does not invent candidates.
- Skill normalization with Chinese and English aliases.
- Chinese and English interface support.
- Recently updated member directory.
- Community message board and update announcements.
- Public crowdfunding and expense ledger.
- CloudBase database, authentication, and serverless function integration.
- DeepSeek-backed parsing, translation, and profile assistance through server-side environment variables.

## Technical baseline

- Front end: Vite and vanilla JavaScript.
- Cloud services: Tencent CloudBase authentication, database, hosting, and cloud functions.
- Serverless function: `cloudfunctions/seedclub-ai-search`.
- Database migrations: files under `sql/` through V5.11.
- Production build command: `pnpm run build`.
- The production build passed on 2026-09-04 before the hackathon start.

## Not present in this baseline

The following ETHOnline project work had not been implemented at the time of this snapshot:

- Seed Agent or any autonomous team-building agent.
- Project brief analysis and multi-role decomposition.
- Explainable candidate scoring or ranked team recommendations.
- The Graph integration or indexed onchain reputation signals.
- ENS profile resolution or identity display.
- World ID proof-of-human verification.
- Hackathon-specific project creation, demo flow, or judging materials.

All hackathon development should be committed after the `pre-ethonline-2026` tag so judges can clearly distinguish new work from this existing foundation.
