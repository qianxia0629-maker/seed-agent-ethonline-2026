import test from "node:test";
import assert from "node:assert/strict";
import {
  explorerAddressUrl,
  explorerTransactionUrl,
  isEvmAddress,
  normalizeEvmAddress,
  shortenEvmAddress,
} from "../src/wallet.js";

const MIXED_CASE = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

test("recognizes and normalizes EVM addresses", () => {
  assert.equal(isEvmAddress(MIXED_CASE), true);
  assert.equal(normalizeEvmAddress(`  ${MIXED_CASE}  `), MIXED_CASE.toLowerCase());
  assert.equal(isEvmAddress("0x1234"), false);
  assert.equal(normalizeEvmAddress("ray.eth"), "");
});

test("shortens addresses without accepting invalid input", () => {
  assert.equal(shortenEvmAddress(MIXED_CASE), "0xa0b869…06eb48");
  assert.equal(shortenEvmAddress("not-an-address"), "");
});

test("builds only safe Ethereum explorer links", () => {
  assert.equal(explorerAddressUrl(MIXED_CASE), `https://etherscan.io/address/${MIXED_CASE.toLowerCase()}`);
  assert.equal(explorerAddressUrl("javascript:alert(1)"), "");
  const hash = `0x${"a".repeat(64)}`;
  assert.equal(explorerTransactionUrl(hash), `https://etherscan.io/tx/${hash}`);
  assert.equal(explorerTransactionUrl("0x1234"), "");
});
