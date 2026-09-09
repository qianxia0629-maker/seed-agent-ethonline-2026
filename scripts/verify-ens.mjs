import { resolveEnsProfile } from "../src/ens.js";

// No secrets or write transactions. Pass a real Sepolia ENS name to rerun.
const name = process.argv[2] || "nick.eth";
const network = process.argv[3] || "sepolia";
try {
  console.log(JSON.stringify(await resolveEnsProfile(name, network), null, 2));
} catch (error) {
  console.error(JSON.stringify({ name, network, success: false, code: error.code || "ENS_PROVIDER_FAILED" }));
  process.exitCode = 1;
}
