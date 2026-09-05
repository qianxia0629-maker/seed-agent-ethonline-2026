const test = require("node:test");
const assert = require("node:assert/strict");
const {
  DEFAULT_UNISWAP_V3_SUBGRAPH_ID,
  buildProof,
  normalizeEvmAddress,
  queryWalletActivity,
} = require("./onchain-proof");

test("normalizes server-side wallet input", () => {
  assert.equal(
    normalizeEvmAddress("0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD"),
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  );
  assert.equal(normalizeEvmAddress("0x123"), null);
});

test("builds transparent evidence without inventing empty categories", () => {
  const proof = buildProof("0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", {
    _meta: { block: { number: "99" }, hasIndexingErrors: false },
    swaps: [{ id: "one", timestamp: "1700000000" }],
    mints: [],
    burns: [],
    collects: [],
  }, { subgraphId: DEFAULT_UNISWAP_V3_SUBGRAPH_ID, queriedAt: "2026-09-05T00:00:00.000Z" });

  assert.equal(proof.totalEvents, 1);
  assert.deepEqual(proof.evidence.map((item) => item.type), ["swap"]);
  assert.equal(proof.source.indexedBlock, 99);
  assert.equal(proof.queriedAt, "2026-09-05T00:00:00.000Z");
});

test("requires a server-side The Graph API key", async () => {
  await assert.rejects(
    queryWalletActivity("0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", { apiKey: "" }),
    (error) => error.code === "GRAPH_NOT_CONFIGURED",
  );
});

test("queries the gateway with bearer credentials", async () => {
  let request;
  const proof = await queryWalletActivity("0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", {
    apiKey: "test-key",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        json: async () => ({
          data: {
            _meta: { block: { number: "101" }, hasIndexingErrors: false },
            swaps: [],
            mints: [{ id: "mint", timestamp: "1700000100" }],
            burns: [],
            collects: [],
          },
        }),
      };
    },
  });

  assert.match(request.url, /gateway\.thegraph\.com\/api\/subgraphs\/id\//);
  assert.equal(request.options.headers.authorization, "Bearer test-key");
  assert.equal(JSON.parse(request.options.body).variables.wallet, "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd");
  assert.equal(proof.totalEvents, 1);
});

