const apiKey = process.env.THE_GRAPH_API_KEY || process.env.GRAPH_API_KEY;
const subgraphId = process.env.THE_GRAPH_SUBGRAPH_ID
  || "HUZDsRpEVP2AvzDCyzDHtdc64dyDxx8FQjzsmqSg4H3B";
const wallet = String(process.env.GRAPH_TEST_WALLET || "").trim().toLowerCase();

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
    query: `query WalletOnchainProfile($wallet: Bytes!) {
      _meta { block { number hash } deployment hasIndexingErrors }
      swaps(first: 3, orderBy: timestamp, orderDirection: desc, where: { origin: $wallet }) {
        id timestamp amountUSD
        transaction { id blockNumber }
        token0 { symbol }
        token1 { symbol }
      }
    }`,
    variables: { wallet },
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
  recentSwaps: body.data?.swaps || [],
}, null, 2));
