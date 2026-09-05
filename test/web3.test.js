import test from "node:test";
import assert from "node:assert/strict";
import { normalizeEvmAddress, parseOnchainProof, shortAddress } from "../src/web3.js";

test("normalizes valid EVM addresses", () => {
  assert.equal(
    normalizeEvmAddress(" 0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD "),
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  );
});

test("rejects malformed EVM addresses", () => {
  assert.equal(normalizeEvmAddress("0x1234"), null);
  assert.equal(normalizeEvmAddress("not-an-address"), null);
});

test("shortens a normalized address for display", () => {
  assert.equal(
    shortAddress("0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"),
    "0xabcd...abcd",
  );
});

test("parses a stored JSON proof and removes malformed evidence", () => {
  const proof = parseOnchainProof(JSON.stringify({
    version: 1,
    totalEvents: 3,
    evidence: [{ type: "swap", count: 3 }, { count: 2 }],
    source: { provider: "The Graph Network", indexedBlock: "123" },
  }));
  assert.equal(proof.totalEvents, 3);
  assert.deepEqual(proof.evidence, [{ type: "swap", count: 3, latestTimestamp: null }]);
  assert.equal(proof.source.indexedBlock, 123);
});

