const DEFAULT_UNISWAP_V3_SUBGRAPH_ID = "5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV";
const EVM_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

const WALLET_ACTIVITY_QUERY = `
  query WalletActivity($wallet: Bytes!) {
    _meta { block { number } hasIndexingErrors }
    swaps(first: 100, orderBy: timestamp, orderDirection: desc, where: { origin: $wallet }) {
      id
      timestamp
      token0 { symbol }
      token1 { symbol }
    }
    mints(first: 100, orderBy: timestamp, orderDirection: desc, where: { origin: $wallet }) {
      id
      timestamp
      token0 { symbol }
      token1 { symbol }
    }
    burns(first: 100, orderBy: timestamp, orderDirection: desc, where: { origin: $wallet }) {
      id
      timestamp
      token0 { symbol }
      token1 { symbol }
    }
    collects(first: 100, orderBy: timestamp, orderDirection: desc, where: { owner: $wallet }) {
      id
      timestamp
      token0 { symbol }
      token1 { symbol }
    }
  }
`;

function normalizeEvmAddress(value) {
  const address = typeof value === "string" ? value.trim() : "";
  return EVM_ADDRESS_PATTERN.test(address) ? address.toLowerCase() : null;
}

function graphError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function safeSubgraphId(value) {
  const id = String(value || "").trim();
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(id)) {
    throw graphError("GRAPH_SUBGRAPH_INVALID", "The configured Subgraph ID is invalid");
  }
  return id;
}

function unixTimestampToIso(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

function latestTimestamp(items) {
  return items.reduce((latest, item) => Math.max(latest, Number(item?.timestamp) || 0), 0);
}

function buildProof(walletAddress, data, { subgraphId, queriedAt = new Date().toISOString() }) {
  const categories = [
    ["swap", Array.isArray(data?.swaps) ? data.swaps : []],
    ["liquidity-added", Array.isArray(data?.mints) ? data.mints : []],
    ["liquidity-removed", Array.isArray(data?.burns) ? data.burns : []],
    ["fees-collected", Array.isArray(data?.collects) ? data.collects : []],
  ];
  const allTimestamps = categories
    .flatMap(([, items]) => items.map((item) => Number(item?.timestamp) || 0))
    .filter((timestamp) => timestamp > 0);
  const evidence = categories
    .filter(([, items]) => items.length > 0)
    .map(([type, items]) => ({
      type,
      count: items.length,
      countIsCapped: items.length === 100,
      latestTimestamp: unixTimestampToIso(latestTimestamp(items)),
    }));

  return {
    version: 1,
    walletAddress,
    totalEvents: evidence.reduce((sum, item) => sum + item.count, 0),
    evidence,
    firstActivityAt: allTimestamps.length ? unixTimestampToIso(Math.min(...allTimestamps)) : null,
    latestActivityAt: allTimestamps.length ? unixTimestampToIso(Math.max(...allTimestamps)) : null,
    queriedAt,
    source: {
      provider: "The Graph Network",
      protocol: "Uniswap V3",
      network: "ethereum",
      subgraphId,
      indexedBlock: Number(data?._meta?.block?.number) || null,
      hasIndexingErrors: Boolean(data?._meta?.hasIndexingErrors),
    },
    limitations: [
      "Counts include at most 100 recent events per activity category.",
      "This proof covers the configured Uniswap V3 Ethereum Subgraph only.",
      "A linked wallet does not prove a person's legal identity or trustworthiness.",
    ],
  };
}

async function queryWalletActivity(walletAddress, options = {}) {
  const normalizedAddress = normalizeEvmAddress(walletAddress);
  if (!normalizedAddress) throw graphError("INVALID_WALLET_ADDRESS", "A valid EVM wallet address is required");

  const apiKey = options.apiKey || process.env.GRAPH_API_KEY;
  if (!apiKey) throw graphError("GRAPH_NOT_CONFIGURED", "The Graph API key is not configured");

  const subgraphId = safeSubgraphId(
    options.subgraphId || process.env.GRAPH_UNISWAP_V3_SUBGRAPH_ID || DEFAULT_UNISWAP_V3_SUBGRAPH_ID,
  );
  const gatewayBase = String(options.gatewayBase || process.env.GRAPH_GATEWAY_URL || "https://gateway.thegraph.com")
    .replace(/\/$/, "");
  const endpoint = `${gatewayBase}/api/subgraphs/id/${subgraphId}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(options.timeoutMs) || 12000);
  const fetchImpl = options.fetchImpl || fetch;

  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: WALLET_ACTIVITY_QUERY, variables: { wallet: normalizedAddress } }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw graphError("GRAPH_HTTP_ERROR", body?.message || `The Graph gateway returned ${response.status}`);
    }
    if (Array.isArray(body?.errors) && body.errors.length) {
      throw graphError("GRAPH_QUERY_ERROR", body.errors.map((item) => item?.message).filter(Boolean).join("; "));
    }
    if (!body?.data) throw graphError("GRAPH_EMPTY_RESPONSE", "The Graph returned no query data");
    return buildProof(normalizedAddress, body.data, { subgraphId });
  } catch (error) {
    if (error?.name === "AbortError") throw graphError("GRAPH_TIMEOUT", "The Graph query timed out");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  DEFAULT_UNISWAP_V3_SUBGRAPH_ID,
  WALLET_ACTIVITY_QUERY,
  buildProof,
  normalizeEvmAddress,
  queryWalletActivity,
  safeSubgraphId,
};

