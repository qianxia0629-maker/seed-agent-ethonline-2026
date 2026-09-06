const apiKey = process.env.THE_GRAPH_API_KEY || process.env.GRAPH_API_KEY;
const subgraphId = process.env.THE_GRAPH_SUBGRAPH_ID
  || "9fWsevEC9Yz4WdW9QyUvu2JXsxyXAxc1X4HaEkmyyc75";
const wallet = String(process.env.GRAPH_TEST_WALLET || "").trim().toLowerCase();
const nowSeconds = Math.floor(Date.now() / 1000);
const cutoff = String(nowSeconds - (90 * 24 * 60 * 60));

if (!apiKey) throw new Error("Set THE_GRAPH_API_KEY before running the live verification.");
if (!/^0x[a-f0-9]{40}$/.test(wallet)) {
  throw new Error("Set GRAPH_TEST_WALLET to a valid 0x Ethereum address.");
}

const response = await fetch(`https://gateway.thegraph.com/api/subgraphs/id/${subgraphId}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    query: `query WalletOnchainProfile($wallet: Bytes!, $cutoff: BigInt!) {
      _meta { block { number hash } deployment hasIndexingErrors }
      earliestMints: mints(first: 1, orderBy: timestamp, orderDirection: asc, where: { origin: $wallet }) { timestamp }
      earliestBurns: burns(first: 1, orderBy: timestamp, orderDirection: asc, where: { origin: $wallet }) { timestamp }
      earliestCollects: collects(first: 1, orderBy: timestamp, orderDirection: asc, where: { origin: $wallet }) { timestamp }
      recentMints: mints(first: 100, orderBy: timestamp, orderDirection: desc, where: { origin: $wallet, timestamp_gte: $cutoff }) {
        id timestamp amountUSD transaction { id blockNumber } pool { id } token0 { symbol } token1 { symbol }
      }
      recentBurns: burns(first: 100, orderBy: timestamp, orderDirection: desc, where: { origin: $wallet, timestamp_gte: $cutoff }) {
        id timestamp amountUSD transaction { id blockNumber } pool { id } token0 { symbol } token1 { symbol }
      }
      recentCollects: collects(first: 100, orderBy: timestamp, orderDirection: desc, where: { origin: $wallet, timestamp_gte: $cutoff }) {
        id timestamp amountUSD transaction { id blockNumber } pool { id token0 { symbol } token1 { symbol } }
      }
      positions(first: 20, where: { owner: $wallet }) {
        id liquidity amountDepositedUSD
        transaction { id blockNumber timestamp }
        pool { id }
        token0 { symbol }
        token1 { symbol }
      }
    }`,
    variables: { wallet, cutoff },
  }),
});

const body = await response.json();
if (!response.ok || body.errors?.length) {
  throw new Error(body.errors?.[0]?.message || `The Graph API ${response.status}`);
}

console.log(JSON.stringify({
  live: true,
  wallet,
  indexedBlock: body.data?._meta?.block?.number || null,
  hasIndexingErrors: body.data?._meta?.hasIndexingErrors || false,
  earliestMints: body.data?.earliestMints || [],
  earliestBurns: body.data?.earliestBurns || [],
  earliestCollects: body.data?.earliestCollects || [],
  recentMints: body.data?.recentMints || [],
  recentBurns: body.data?.recentBurns || [],
  recentCollects: body.data?.recentCollects || [],
  liquidityPositions: body.data?.positions || [],
}, null, 2));
