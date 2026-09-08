# Verifiable Talent Search

Seed Agent separates three different kinds of information instead of asking an AI model to invent a single opaque ranking.

1. DeepSeek converts the user's natural-language request into bounded search fields. It never receives the complete member database and cannot add candidates.
2. Deterministic browser code matches those fields against real public member records.
3. When the request asks for onchain experience, the server queries the Uniswap V3 Mainnet Subgraph through The Graph decentralized gateway for each wallet-linked match.

## Search match score

The displayed score measures relevance to the current request. It is not a rating of the person, skill, identity, creditworthiness, or employability.

- For a profile-only request, the score is the normalized profile match score.
- For a request that explicitly requires onchain evidence, profile relevance contributes 70% and the deterministic Onchain Activity Score contributes 30%.
- A missing wallet, provider failure, or successful zero-evidence query contributes zero onchain points and remains visibly labeled.
- Results are re-ranked only with these calculated values. AI does not set or alter the final score.

## Evidence states

- `Verified`: The Graph returned wallet-specific evidence from the configured Subgraph.
- `No evidence found`: the live query succeeded but returned no covered Uniswap V3 evidence.
- `No public wallet linked`: the member profile has no address available for verification.
- `Verification failed`: the provider or configuration failed; the interface does not replace it with mock data.

The current proof covers Ethereum Uniswap V3 liquidity activity only. Absence of evidence means absence within this query scope, not absence of all onchain activity.
