# World AgentBook integration — scope and feedback

## Implemented

The frontend uses the official `@worldcoin/agentkit-core` SDK 0.2.1
`createAgentBookVerifier().lookupHuman()` with a block-pinned viem client.
Canonical contract: `0xA23aB2712eA7BBa896930544C7d6636a96b944dA` on World Chain 480.
Reads are public and need no API key, wallet connection, payment or signature.
Chain ID and deployed bytecode are checked before the lookup. A registered address
can be matched to existing member profiles and the observation exported with its
block, network, contract and timestamp. No anonymous human identifier is retained,
displayed, logged or exported by the application.

## Explicit limits

This is an AgentBook registration-evidence integration, NOT an x402 access-control
server or a completed human-backed-agent authorization flow. A lookup does not verify
the visitor, ownership of the member's declared wallet or skills. No agent is registered
on the participant's behalf. World ID Sandbox testing and participant registration
remain required external actions. Do not claim the World AgentKit Continuity prize
requirements are fully satisfied by this read-only integration.

## Developer feedback (actually observed)

- SDK 0.2.1 collapses RPC exceptions and an unregistered zero mapping into null.
  We inject a read client that captures failures and pins the block, then surface an
  error rather than asserting unregistered. A discriminated result would be safer.
- Official integration docs specify canonical World Chain registration. The GitHub
  README still described a Base relay during review; this creates uncertainty.
  We followed the SDK's canonical World Chain address and checked chain ID.
- A minimal vanilla-JS read-only example would help projects that do not use Hono.
- The umbrella `@worldcoin/agentkit` package imports Node crypto and fails the Vite
  browser build. The official core package exposes the lookup without the server wrapper.
- Developer Portal and Sandbox hands-on feedback: NOT TESTED. No invented feedback
  is included. Participant must complete this before submitting for the World prize.

## Participant steps

1. Obtain Sandbox access through the official event resources and follow World instructions.
2. Register the wallet you intend to use as your agent through the official CLI/World App.
   Review the action personally; never share a seed phrase or private key.
3. Query that address in the World panel, record the real result, and record actual
   Sandbox proof success/cancel/failure observations separately.
4. A full access-control use case needs a verified signed challenge and server-side
   policy/replay storage; do not describe the current lookup UI as that feature.

Sources reviewed September 11, 2026:
- https://docs.world.org/agents/agent-kit/integrate
- https://docs.world.org/agents/agent-kit/sdk-reference
- https://ethglobal.com/events/ethonline2026/prizes/world
