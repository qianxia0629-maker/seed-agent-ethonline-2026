export const EVM_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

export function normalizeEvmAddress(value) {
  const address = String(value || "").trim();
  return EVM_ADDRESS_PATTERN.test(address) ? address.toLowerCase() : null;
}

export function shortAddress(value) {
  const address = normalizeEvmAddress(value);
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
}

export function parseOnchainProof(value) {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return parseOnchainProof(JSON.parse(value));
    } catch {
      return null;
    }
  }
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const totalEvents = Number(value.totalEvents);
  const evidence = Array.isArray(value.evidence)
    ? value.evidence
      .map((item) => ({
        type: String(item?.type || "").slice(0, 40),
        count: Math.max(0, Number(item?.count) || 0),
        latestTimestamp: item?.latestTimestamp ? String(item.latestTimestamp) : null,
      }))
      .filter((item) => item.type)
      .slice(0, 12)
    : [];
  return {
    version: Number(value.version) || 1,
    totalEvents: Math.max(0, Number.isFinite(totalEvents) ? totalEvents : 0),
    evidence,
    queriedAt: value.queriedAt ? String(value.queriedAt) : null,
    firstActivityAt: value.firstActivityAt ? String(value.firstActivityAt) : null,
    latestActivityAt: value.latestActivityAt ? String(value.latestActivityAt) : null,
    source: value.source && typeof value.source === "object" ? {
      provider: String(value.source.provider || "The Graph Network").slice(0, 80),
      protocol: String(value.source.protocol || "").slice(0, 80),
      network: String(value.source.network || "").slice(0, 40),
      subgraphId: String(value.source.subgraphId || "").slice(0, 80),
      indexedBlock: Number(value.source.indexedBlock) || null,
    } : null,
  };
}

