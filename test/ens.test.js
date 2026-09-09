import test from "node:test";
import assert from "node:assert/strict";
import { normalizeEnsName, resolveEnsProfile, matchingEnsMembers } from "../src/ens.js";

const address = "0x1234567890123456789012345678901234567890";
function client(overrides = {}) {
  return {
    getChainId: async () => 11155111,
    getBlockNumber: async () => 123n,
    readContract: async ({ functionName }) => functionName === "ROOT_REGISTRY" ? address : [address],
    getEnsAddress: async () => address,
    getEnsText: async ({ key }) => key === "description" ? "Public profile" : null,
    ...overrides,
  };
}

test("ENSIP-15 names support case normalization, subnames, emoji and DNS names", () => {
  assert.equal(normalizeEnsName(" Nick.ETH "), "nick.eth");
  assert.equal(normalizeEnsName("dev.nick.eth"), "dev.nick.eth");
  assert.equal(normalizeEnsName("ensfairy.xyz"), "ensfairy.xyz");
  assert.ok(normalizeEnsName("🦄.eth"));
  for (const value of ["https://nick.eth", "nick..eth", "nick", "a b.eth", "foo.eth/path", "<script>.eth"]) {
    assert.throws(() => normalizeEnsName(value), { code: "ENS_INVALID_NAME" });
  }
});
test("real-query adapter pins a block and returns ENSv2 hierarchy and record states", async () => {
  const result = await resolveEnsProfile("nick.eth", "sepolia", client({ getEnsAddress: async (args) => {
    assert.equal(args.blockNumber, 123n); return address;
  } }));
  assert.equal(result.chainId, 11155111);
  assert.equal(result.rootRegistry, address);
  assert.equal(result.records.description.value, "Public profile");
  assert.equal(result.records.url.status, "empty");
  assert.equal(result.live, true);
});
test("missing, wrong network, and provider errors cannot become fake successful evidence", async () => {
  await assert.rejects(resolveEnsProfile("nick.eth", "sepolia", client({ getEnsAddress: async () => null })), { code: "ENS_NOT_FOUND" });
  await assert.rejects(resolveEnsProfile("nick.eth", "sepolia", client({ getChainId: async () => 1 })), { code: "ENS_WRONG_NETWORK" });
  await assert.rejects(resolveEnsProfile("nick.eth", "sepolia", client({ readContract: async () => { throw Error("offline"); } })), { code: "ENS_PROVIDER_FAILED" });
});
test("an optional text failure remains distinct from an unset record", async () => {
  const result = await resolveEnsProfile("nick.eth", "sepolia", client({ getEnsText: async () => { throw Error("offline"); } }));
  assert.equal(result.records.url.status, "error");
  assert.equal(result.records.url.value, "");
});
test("member selection uses exact addresses, never a claimed ENS name alone", () => {
  const members = [{ id: 1, ens_name: "nick.eth", wallet_address: "" }, { id: 2, wallet_address: address }, { id: 3, wallet_address: "0x0000000000000000000000000000000000000001" }];
  assert.deepEqual(matchingEnsMembers(members, { address }).map((m) => m.id), [2]);
  assert.deepEqual(matchingEnsMembers(members, { name: "nick.eth" }), []);
});
