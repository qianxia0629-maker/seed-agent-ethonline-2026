const ONCHAIN_QUERY_PATTERN = /(?:on[ -]?chain|blockchain|wallet|ethereum|eth\b|defi|uniswap|liquidity|链上|区块链|钱包|以太坊|去中心化金融|流动性)/i;

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function stringList(value) {
  return Array.isArray(value) ? value.map((item) => String(item || "").trim()).filter(Boolean) : [];
}

export function intentNeedsOnchain(intent, query = "") {
  if (intent?.requires_onchain_evidence === true) return true;
  if (stringList(intent?.required_protocols).length || stringList(intent?.required_networks).length) return true;
  return ONCHAIN_QUERY_PATTERN.test(String(query || ""));
}

export function buildVerifiableMatch(match, intent, query, evidence = {}) {
  const profileMatchScore = clampScore(match?.profileMatchScore);
  const requiresOnchain = intentNeedsOnchain(intent, query);
  const walletLinked = Boolean(evidence.walletLinked);
  const onchainProfile = evidence.onchainProfile && typeof evidence.onchainProfile === "object"
    ? evidence.onchainProfile
    : null;
  const proof = onchainProfile?.proof && typeof onchainProfile.proof === "object"
    ? onchainProfile.proof
    : null;
  const onchainActivityScore = clampScore(proof?.score);

  let verificationState = "not_requested";
  if (!requiresOnchain && proof?.hasEvidence) verificationState = "verified";
  else if (!requiresOnchain) verificationState = "not_requested";
  else if (!walletLinked) verificationState = "wallet_missing";
  else if (evidence.loading) verificationState = "loading";
  else if (evidence.error) verificationState = "failed";
  else if (!onchainProfile) verificationState = "pending";
  else if (proof?.hasEvidence) verificationState = "verified";
  else verificationState = "no_evidence";

  // This score ranks evidence for the current search, not the person. When the
  // request explicitly asks for onchain experience, public profile evidence is
  // 70% and the deterministic activity proof is 30%. Missing proof stays zero.
  const matchScore = requiresOnchain
    ? clampScore((profileMatchScore * 0.7) + (onchainActivityScore * 0.3))
    : profileMatchScore;

  return {
    ...match,
    profileMatchScore,
    requiresOnchain,
    matchScore,
    verificationState,
    onchainActivityScore,
    onchainProfile,
    verifiedNetworks: stringList(proof?.verifiedNetworks),
    verifiedProtocols: stringList(proof?.verifiedProtocols),
  };
}

export function rankVerifiableMatches(matches, intent, query, evidenceForMember) {
  return matches
    .map((match) => buildVerifiableMatch(
      match,
      intent,
      query,
      evidenceForMember(match.member),
    ))
    .sort((left, right) => right.matchScore - left.matchScore
      || right.profileMatchScore - left.profileMatchScore
      || String(left.member?.name || "").localeCompare(String(right.member?.name || ""), "zh-CN"));
}
