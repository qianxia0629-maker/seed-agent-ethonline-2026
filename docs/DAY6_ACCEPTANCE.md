# Day 6 — Candidate workflow (2026-09-10)

Implemented locally: member directory / AI results / matching ENS results →
page-local shortlist → existing live Graph activity query → Markdown snapshot export.
Refreshing clears the shortlist. Adding the same member updates its selection origin
rather than creating a duplicate. Reports omit contacts. Selection reasons refer to
the search at selection, not a permanent score. ENS association is invalidated if the
current member wallet differs from the resolved address. ENS network and Graph
Ethereum mainnet activity are separate evidence sources; neither proves ownership.

Validation: 20 Node tests passed (four new report/evidence tests), production build
passed. No backend, database, DNS or credential changes. Installed isolated npm and
Playwright CLI tooling on G: with participant authorization. Local browser acceptance
passed directory add/deduplication/remove/empty export, real AI search for Tomo-A,
live Graph refresh, report download, language switch, 390px viewport without horizontal
overflow, view profile and refresh clearing. Downloaded report showed no_evidence at
Ethereum block 25946815. Export was inspected; no contact fields present. The only
observed initial browser resource error was the existing missing favicon (404).

## Acceptance checklist and remaining coverage

1. Add a directory member twice: one candidate only. Remove it: empty state and disabled export.
2. Search for a known member, add its result: originating search and reasons appear.
3. Resolve an ENS name with an address matching an existing real member, add it:
   report records the ENS network, block, resolver and query timestamp. Do not invent
   a member or falsely attach nick.eth to the participant.
4. Verify a candidate: observe pending/loading followed by actual evidence, no evidence
   or failure. Missing wallet disables verification. Failed refresh must not export
   the previous success as current.
5. Export: Markdown contains source scope and indexed block when successful; no email,
   WeChat, Telegram or X contact details. It does not assign a new candidate score.
6. Switch languages, test mobile width, view candidate profile, refresh to clear list.
7. After acceptance, push main and confirm the newly built release on seedclubtalent.com.

Participant-owned ENS demo remains an external wallet task. This increment does not
claim that milestone has been completed on behalf of the participant.
The live ENS-to-existing-member positive route remains pending a participant-owned
name with a matching directory address; address matching/invalidation have unit tests.

## Publication status

Implementation commit 746b0fa was pushed to origin/main on September 10. The configured
automatic production deployment was thereby triggered, but release completion could
not be confirmed: the independent production browser reported ERR_CONNECTION_CLOSED,
PowerShell HTTPS reported unexpected EOF, and IPv4 curl timed out. DNS resolves to
EdgeOne Pages. GitHub combined status returned no checks, not a successful deployment.
Do not claim production acceptance until seedclubtalent.com responds and the shortlist
is observed there. Local live ENS lookup of nick.eth, no-member handling, invalid name
and stale-result clearing also passed; no fixture member was added to the live database.
