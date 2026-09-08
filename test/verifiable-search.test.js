import test from "node:test";
import assert from "node:assert/strict";
import {
  buildVerifiableMatch,
  intentNeedsOnchain,
  rankVerifiableMatches,
} from "../src/verifiable-search.js";
import { rankMembers } from "../src/matching.js";

const match = {
  member: { id: "member-1", name: "Ada", wallet_address: "0x1111111111111111111111111111111111111111" },
  profileMatchScore: 90,
  reasons: [{ key: "skillMatch", value: "Solidity" }],
};

test("recognizes explicit and natural-language onchain requirements", () => {
  assert.equal(intentNeedsOnchain({ requires_onchain_evidence: true }, "developer"), true);
  assert.equal(intentNeedsOnchain({}, "Find a developer with real DeFi onchain experience"), true);
  assert.equal(intentNeedsOnchain({}, "Find a product designer"), false);
});

test("normalizes deterministic profile relevance to a 0-100 score", () => {
  const [result] = rankMembers([
    {
      id: "member-1",
      name: "Ada",
      occupation: "Solidity developer",
      skills: ["Solidity"],
      experience: "Built DeFi applications",
    },
  ], {
    skills: ["Solidity"],
    occupations: ["developer"],
    experience_keywords: ["DeFi"],
  }, "");

  assert.equal(result.profileMatchScore, 100);
  assert.equal(result.maxScore, 15);
});

test("combines profile relevance with deterministic onchain evidence", () => {
  const result = buildVerifiableMatch(match, { requires_onchain_evidence: true }, "", {
    walletLinked: true,
    onchainProfile: {
      indexedBlock: 25921064,
      proof: {
        score: 50,
        hasEvidence: true,
        verifiedNetworks: ["Ethereum"],
        verifiedProtocols: ["Uniswap V3"],
      },
    },
  });

  assert.equal(result.matchScore, 78);
  assert.equal(result.verificationState, "verified");
  assert.deepEqual(result.verifiedProtocols, ["Uniswap V3"]);
});

test("never invents proof for a missing wallet or a zero-evidence query", () => {
  const missing = buildVerifiableMatch(match, {}, "onchain DeFi", { walletLinked: false });
  assert.equal(missing.verificationState, "wallet_missing");
  assert.equal(missing.onchainActivityScore, 0);
  assert.equal(missing.matchScore, 63);

  const zero = buildVerifiableMatch(match, {}, "onchain DeFi", {
    walletLinked: true,
    onchainProfile: { proof: { score: 0, hasEvidence: false } },
  });
  assert.equal(zero.verificationState, "no_evidence");
  assert.equal(zero.matchScore, 63);
});

test("re-ranks candidates using only computed evidence scores", () => {
  const matches = [
    match,
    { ...match, member: { ...match.member, id: "member-2", name: "Ben" }, profileMatchScore: 80 },
  ];
  const ranked = rankVerifiableMatches(matches, { requires_onchain_evidence: true }, "", (member) => ({
    walletLinked: true,
    onchainProfile: {
      proof: {
        score: member.id === "member-2" ? 100 : 0,
        hasEvidence: member.id === "member-2",
      },
    },
  }));
  assert.equal(ranked[0].member.id, "member-2");
  assert.equal(ranked[0].matchScore, 86);
});
