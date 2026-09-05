import test from "node:test";
import assert from "node:assert/strict";
import { rankMembers, searchableText } from "../src/matching.js";

const members = [
  {
    id: "1",
    name: "Builder One",
    occupation: "DeFi product developer",
    skills: ["DeFi", "Solidity"],
    onchain_proof: {
      totalEvents: 4,
      source: { protocol: "Uniswap V3", network: "ethereum" },
      evidence: [{ type: "swap", count: 4 }],
    },
  },
  {
    id: "2",
    name: "Builder Two",
    occupation: "DeFi researcher",
    skills: ["DeFi"],
  },
];

test("includes provider-backed evidence in searchable text", () => {
  assert.match(searchableText(members[0]), /uniswap v3/);
  assert.match(searchableText(members[0]), /swap/);
});

test("requires real cached evidence only when explicitly requested", () => {
  const results = rankMembers(members, {
    skills: ["DeFi"],
    requires_onchain_evidence: true,
    onchain_protocols: ["Uniswap"],
    onchain_activities: ["swap"],
  }, "Find a DeFi builder with verified Uniswap swap activity");

  assert.deepEqual(results.map((item) => item.member.id), ["1"]);
  assert.ok(results[0].reasons.some((reason) => reason.key === "onchainEvidence"));
});

test("does not penalize profiles without evidence for ordinary skill searches", () => {
  const results = rankMembers(members, { skills: ["DeFi"] }, "DeFi");
  assert.deepEqual(results.map((item) => item.member.id), ["1", "2"]);
});

