import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildOnchainProof } = require("../cloudfunctions/seedclub-ai-search/onchain-proof.js");

const NOW = Math.floor(Date.UTC(2026, 8, 7) / 1000);
const tx = (id, timestamp) => ({ id, blockNumber: "25000000", timestamp: String(timestamp) });
const event = (id, transactionId, timestamp) => ({
  id,
  timestamp: String(timestamp),
  amountUSD: "120.50",
  transaction: tx(transactionId, timestamp),
  pool: { id: "0xpool" },
  token0: { symbol: "USDC" },
  token1: { symbol: "WETH" },
});

test("returns a zero activity score when The Graph finds no wallet evidence", () => {
  const proof = buildOnchainProof({}, NOW);
  assert.equal(proof.score, 0);
  assert.equal(proof.hasEvidence, false);
  assert.equal(proof.activeSinceYear, null);
  assert.deepEqual(proof.verifiedNetworks, []);
  assert.deepEqual(proof.verifiedProtocols, []);
});

test("builds an explainable proof from unique transactions and owned positions", () => {
  const oldTimestamp = Math.floor(Date.UTC(2023, 8, 1) / 1000);
  const recentTimestamp = NOW - (7 * 24 * 60 * 60);
  const proof = buildOnchainProof({
    earliestMints: [{ timestamp: String(oldTimestamp) }],
    recentMints: [
      event("mint-1", "0xtx1", recentTimestamp),
      event("mint-2", "0xtx1", recentTimestamp),
    ],
    recentBurns: [event("burn-1", "0xtx2", recentTimestamp - 30)],
    positions: [
      {
        id: "1",
        liquidity: "50",
        amountDepositedUSD: "100",
        transaction: tx("0xposition1", oldTimestamp),
        pool: { id: "0xpool" },
        token0: { symbol: "USDC" },
        token1: { symbol: "WETH" },
      },
      {
        id: "2",
        liquidity: "0",
        amountDepositedUSD: "25",
        transaction: tx("0xposition2", oldTimestamp + 100),
        pool: { id: "0xpool" },
        token0: { symbol: "USDC" },
        token1: { symbol: "WETH" },
      },
    ],
  }, NOW);

  assert.equal(proof.activeSinceYear, 2023);
  assert.equal(proof.recentTransactionCount, 2);
  assert.equal(proof.ownedPositionCount, 2);
  assert.equal(proof.activePositionCount, 1);
  assert.equal(proof.score, 57);
  assert.deepEqual(proof.verifiedNetworks, ["Ethereum"]);
  assert.deepEqual(proof.verifiedProtocols, ["Uniswap V3"]);
  assert.equal(proof.breakdown.reduce((sum, item) => sum + item.points, 0), proof.score);
});

test("caps recent activity inputs and exposes the cap", () => {
  const timestamp = NOW - 60;
  const proof = buildOnchainProof({
    earliestCollects: [{ timestamp: String(timestamp - 100) }],
    recentCollects: Array.from({ length: 100 }, (_, index) => event(`collect-${index}`, `0xtx${index}`, timestamp - index)),
  }, NOW);

  assert.equal(proof.recentTransactionCount, 100);
  assert.equal(proof.resultCapped, true);
  assert.equal(proof.score, 58);
});
