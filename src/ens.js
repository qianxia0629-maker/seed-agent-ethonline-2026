import { createPublicClient, http, parseAbi, toHex, zeroAddress } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { normalize, packetToBytes } from "viem/ens";
import { normalizeEvmAddress } from "./wallet.js";

export const ENS_NETWORKS = Object.freeze({
  sepolia: { chain: sepolia, rpc: "https://ethereum-sepolia-rpc.publicnode.com", label: "ENSv2 · Sepolia", explorer: "https://sepolia.etherscan.io" },
  mainnet: { chain: mainnet, rpc: "https://ethereum-rpc.publicnode.com", label: "ENS · Ethereum", explorer: "https://etherscan.io" },
});
const hierarchyAbi = parseAbi([
  "function ROOT_REGISTRY() view returns (address)",
  "function findRegistries(bytes name) view returns (address[])",
]);
const recordKeys = ["description", "url", "com.github", "com.twitter"];

function fail(code) { return Object.assign(new Error(code), { code }); }

export function normalizeEnsName(value) {
  const input = String(value || "").trim();
  if (!input.includes(".") || input.length > 255 || /[\s/:@?#]/u.test(input)) throw fail("ENS_INVALID_NAME");
  try { return normalize(input); } catch { throw fail("ENS_INVALID_NAME"); }
}

export function matchingEnsMembers(members, profile) {
  const address = normalizeEvmAddress(profile?.address);
  return address ? members.filter((member) => normalizeEvmAddress(member.wallet_address) === address) : [];
}

export function createEnsClient(network = "sepolia") {
  const config = ENS_NETWORKS[network];
  if (!config) throw fail("ENS_INVALID_NETWORK");
  return createPublicClient({ chain: config.chain, transport: http(config.rpc, { timeout: 10000, retryCount: 1 }) });
}

// Names, including inherited/wildcard records, are resolved through the library's
// canonical Universal Resolver. No resolver implementation address is pinned.
export async function resolveEnsProfile(value, network = "sepolia", client = createEnsClient(network)) {
  const name = normalizeEnsName(value);
  const config = ENS_NETWORKS[network];
  if (!config) throw fail("ENS_INVALID_NETWORK");
  let timer;
  const work = async () => {
    if (await client.getChainId() !== config.chain.id) throw fail("ENS_WRONG_NETWORK");
    const blockNumber = await client.getBlockNumber();
    const universalResolver = config.chain.contracts.ensUniversalResolver.address;
    const args = { name, blockNumber };
    let rootRegistry = null;
    let registries = [];
    if (network === "sepolia") {
      [rootRegistry, registries] = await Promise.all([
        client.readContract({ address: universalResolver, abi: hierarchyAbi, functionName: "ROOT_REGISTRY", blockNumber }),
        client.readContract({ address: universalResolver, abi: hierarchyAbi, functionName: "findRegistries", args: [toHex(packetToBytes(name))], blockNumber }),
      ]);
      if (!normalizeEvmAddress(rootRegistry) || rootRegistry.toLowerCase() === zeroAddress) throw fail("ENS_V2_UNAVAILABLE");
    }
    const address = normalizeEvmAddress(await client.getEnsAddress(args));
    if (!address || address === zeroAddress) throw fail("ENS_NOT_FOUND");
    const records = await Promise.allSettled(recordKeys.map((key) => client.getEnsText({ ...args, key })));
    return {
      name, address, network, chainId: config.chain.id, blockNumber: String(blockNumber),
      universalResolver, rootRegistry,
      registries: registries.filter((item) => normalizeEvmAddress(item) && item.toLowerCase() !== zeroAddress),
      records: Object.fromEntries(recordKeys.map((key, i) => [key, {
        status: records[i].status === "fulfilled" ? (records[i].value ? "present" : "empty") : "error",
        value: records[i].status === "fulfilled" ? String(records[i].value || "").slice(0, 1000) : "",
      }])),
      queriedAt: new Date().toISOString(), live: true,
    };
  };
  try {
    return await Promise.race([work(), new Promise((_, reject) => { timer = setTimeout(() => reject(fail("ENS_TIMEOUT")), 35000); })]);
  } catch (error) {
    if (error?.code?.startsWith?.("ENS_")) throw error;
    throw fail("ENS_PROVIDER_FAILED");
  } finally { clearTimeout(timer); }
}
