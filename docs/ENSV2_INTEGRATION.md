# Day 5 — ENSv2 member discovery

## Product flow

The ENS discovery panel starts on Sepolia. A visitor enters a name or subname,
reads its ETH address and public text records through the Universal Resolver,
and finds existing public member profiles with exactly the same wallet address.
The visitor can open a matching profile or explicitly request its existing
Ethereum mainnet Uniswap V3 activity check. No member records are generated.

The name lookup records the network, query block, time, Universal Resolver and
ENSv2 registry hierarchy. Text records are self-published information; absent
records and failed record reads are displayed separately. Zero-address results,
invalid names, wrong networks and provider failures are not successful results.

## ENSv2 integration

- viem is pinned to 2.56.3 (ENS documentation requires >=2.35.0).
- Names use ENSIP-15 normalization, including subnames, emoji and DNS names.
- The library's canonical Universal Resolver proxy is used; implementation
  addresses are not hardcoded. The client handles CCIP-Read.
- On Sepolia, the app calls `ROOT_REGISTRY()` and `findRegistries(bytes)` on the
  Universal Resolver to inspect the ENSv2 hierarchy before resolving records.
- Address, hierarchy and text reads use the same observed block number.
- There is no ENSv1 registry fallback. The ENSv2 contract itself can resolve
  unmigrated names via a mirror; success does not imply a name has migrated.
- Ethereum mainnet lookup is available separately. The profile editor's
  `Resolve ENS` button uses mainnet and fills existing wallet/ENS fields.
- A different existing wallet is never silently replaced by the ENS result.
- Editing the name/network or switching editors discards outdated results.

This read-only integration does not register names, create subname registries,
delegate roles, migrate names or prove ownership. It makes no claim to have
implemented those write features or to guarantee prize eligibility.

## Network and identity boundaries

Sepolia ENSv2 records and Ethereum mainnet onchain activity are separate sources.
The public member match is exact address equality, not proof that a member
controls that address. ENS text is not used to award skill or reputation points.
Existing manually entered ENS fields remain self-reported, not verified badges.
No testnet ENS name is silently saved as a mainnet identity.

## Deployment

Frontend-only change; no database migration or cloud-function upload is needed.
No new secret is required. The frontend uses public HTTPS RPC endpoints from
PublicNode and makes read calls only. Availability and browser CORS depend on
the providers; failures are visible and have no fabricated fallback.

Push the tested commit to `main` for EdgeOne's configured production deployment.
Build: `pnpm install --frozen-lockfile`, `pnpm run build`, output `dist`.
For a local pnpm installation using an existing store, preserve that installation's
store setting (this Windows workspace uses `--store-dir G:\.pnpm-store`).

## Checks and live evidence

- `node --test`: 16 tests passed during initial Day 5 validation.
- `pnpm run verify:ens -- nick.eth sepolia`: live Sepolia result at block
  **11668031**, queried **2026-09-09T12:46:08.190Z**.
  Address: `0xb8c2c29ee19d8307cb7255e1cd9cbde883a267d5`.
  Root registry: `0x8115186E8f2E0B0281e86ab91f0f48Ba90364354`.
  ETH registry: `0xBDC85dD5b15D7ecb354cd7cb6f2c50b4f2c4F0E2`.
  Description, URL, GitHub and Twitter records were unset, not invented.
- Mainnet `ur.integration-tests.eth` returned the official expected address
  `0x2222222222222222222222222222222222222222` at block **25939905**.
- The nonexistent Sepolia name `seed-agent-no-such-name-20260909.eth` returned
  `ENS_NOT_FOUND`.
- The external `test.offchaindemo.eth` CCIP-Read fixture failed with a gateway
  HTTP error. CCIP support exists in the library, but that live fixture has NOT
  passed and is not claimed as verified.

`nick.eth` is a public third-party test name used only as a repeatable lookup
example. It is not Ray's identity or a fabricated community member. Live records
can change. Run `node scripts/verify-ens.mjs <name> sepolia` to recheck.

## Participant acceptance

1. Open `https://seedclubtalent.com` after the Day 5 production build succeeds.
2. Find the ENS panel, keep **ENSv2 · Sepolia**, and resolve `nick.eth`.
3. Check the returned address, Sepolia block and expandable registry hierarchy.
4. A zero-member result is valid if nobody in the real directory has this address.
5. Resolve an unregistered name; confirm it reports no address rather than a fake person.
6. Switch to English and check the lookup labels and results.
7. For the full member-to-activity demo, use a participant-controlled Sepolia
   ENSv2 name resolving to a wallet already present in their member profile.
   Preparing this owned test identity remains a separate acceptance step; do not
   put the third-party sample wallet on the participant's profile.

## Official references

- https://ethglobal.com/events/ethonline2026/prizes/ens
- https://docs.ens.domains/ensv2/tutorial-app-developers/
- https://docs.ens.domains/web/ensv2-readiness/
- https://docs.ens.domains/ensv2/universal-resolver-v2/
