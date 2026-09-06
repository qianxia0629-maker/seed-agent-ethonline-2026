const DAY_SECONDS = 24 * 60 * 60;
const ACTIVITY_WINDOW_DAYS = 90;

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function positionActivity(position) {
  return {
    kind: "position",
    id: String(position?.id || ""),
    transactionHash: String(position?.transaction?.id || ""),
    blockNumber: asNumber(position?.transaction?.blockNumber),
    timestamp: asNumber(position?.transaction?.timestamp),
    amountUSD: position?.amountDepositedUSD == null ? null : String(position.amountDepositedUSD),
    poolAddress: String(position?.pool?.id || ""),
    token0: String(position?.token0?.symbol || "Token 0"),
    token1: String(position?.token1?.symbol || "Token 1"),
  };
}

function eventActivity(kind, event) {
  return {
    kind,
    id: String(event?.id || ""),
    transactionHash: String(event?.transaction?.id || ""),
    blockNumber: asNumber(event?.transaction?.blockNumber),
    timestamp: asNumber(event?.timestamp),
    amountUSD: event?.amountUSD == null ? null : String(event.amountUSD),
    poolAddress: String(event?.pool?.id || ""),
    token0: String(event?.token0?.symbol || event?.pool?.token0?.symbol || "Token 0"),
    token1: String(event?.token1?.symbol || event?.pool?.token1?.symbol || "Token 1"),
  };
}

function uniqueTransactions(activities) {
  const seen = new Set();
  return activities.filter((activity) => {
    const key = activity.transactionHash || activity.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildOnchainProof(graphData, nowSeconds = Math.floor(Date.now() / 1000)) {
  const positions = asArray(graphData?.positions);
  const recentMints = asArray(graphData?.recentMints).map((event) => eventActivity("mint", event));
  const recentBurns = asArray(graphData?.recentBurns).map((event) => eventActivity("burn", event));
  const recentCollects = asArray(graphData?.recentCollects).map((event) => eventActivity("collect", event));
  const recentTransactions = uniqueTransactions(
    [...recentMints, ...recentBurns, ...recentCollects]
      .filter((activity) => activity.timestamp > 0)
      .sort((a, b) => b.timestamp - a.timestamp),
  );

  const earliestTimestamps = [
    ...asArray(graphData?.earliestMints),
    ...asArray(graphData?.earliestBurns),
    ...asArray(graphData?.earliestCollects),
  ].map((event) => asNumber(event?.timestamp)).filter(Boolean);
  positions.forEach((position) => {
    const timestamp = asNumber(position?.transaction?.timestamp);
    if (timestamp) earliestTimestamps.push(timestamp);
  });

  const activeSinceTimestamp = earliestTimestamps.length ? Math.min(...earliestTimestamps) : 0;
  const activeDays = activeSinceTimestamp
    ? Math.max(0, Math.floor((nowSeconds - activeSinceTimestamp) / DAY_SECONDS))
    : 0;
  const activePositionCount = positions.filter((position) => asNumber(position?.liquidity) > 0).length;
  const hasEvidence = Boolean(activeSinceTimestamp || recentTransactions.length || positions.length);

  const historyPoints = activeSinceTimestamp
    ? Math.min(30, 8 + (Math.floor(activeDays / 365) * 7))
    : 0;
  const recentPoints = Math.min(40, recentTransactions.length * 4);
  const positionPoints = Math.min(20, activePositionCount * 10);
  const protocolPoints = hasEvidence ? 10 : 0;
  const score = historyPoints + recentPoints + positionPoints + protocolPoints;

  const positionActivities = positions.map(positionActivity);
  const activities = uniqueTransactions([...recentTransactions, ...positionActivities]
    .sort((a, b) => b.timestamp - a.timestamp))
    .slice(0, 5);

  return {
    score,
    scoreType: "activity_not_credit",
    coverageWindowDays: ACTIVITY_WINDOW_DAYS,
    activeSinceTimestamp: activeSinceTimestamp || null,
    activeSinceYear: activeSinceTimestamp
      ? new Date(activeSinceTimestamp * 1000).getUTCFullYear()
      : null,
    activeDays,
    recentTransactionCount: recentTransactions.length,
    ownedPositionCount: positions.length,
    activePositionCount,
    verifiedNetworks: hasEvidence ? ["Ethereum"] : [],
    verifiedProtocols: hasEvidence ? ["Uniswap V3"] : [],
    hasEvidence,
    resultCapped: recentMints.length >= 100 || recentBurns.length >= 100 || recentCollects.length >= 100,
    breakdown: [
      { key: "history", points: historyPoints, maxPoints: 30 },
      { key: "recentActivity", points: recentPoints, maxPoints: 40 },
      { key: "activePositions", points: positionPoints, maxPoints: 20 },
      { key: "protocolEvidence", points: protocolPoints, maxPoints: 10 },
    ],
    activities,
  };
}

module.exports = {
  ACTIVITY_WINDOW_DAYS,
  DAY_SECONDS,
  buildOnchainProof,
};
