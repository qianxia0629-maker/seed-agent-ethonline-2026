import { createAgentBookVerifier } from '@worldcoin/agentkit-core';
import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import { normalizeEvmAddress } from './wallet.js';

export const AGENTBOOK_ADDRESS = '0xA23aB2712eA7BBa896930544C7d6636a96b944dA';
export const WORLD_RPC = 'https://worldchain-mainnet.g.alchemy.com/public';
const fail = code => Object.assign(new Error(code), {code});

export async function lookupAgentRegistration(value, client = createPublicClient({
  chain: worldchain, transport: http(WORLD_RPC, {timeout:10000,retryCount:1}),
})) {
  const address = normalizeEvmAddress(value);
  if (!address) throw fail('WORLD_INVALID_ADDRESS');
  try {
    if (await client.getChainId() !== 480) throw fail('WORLD_WRONG_NETWORK');
    const blockNumber = await client.getBlockNumber();
    const code = await client.getBytecode({address:AGENTBOOK_ADDRESS,blockNumber});
    if (!code || code === '0x') throw fail('WORLD_CONTRACT_UNAVAILABLE');
    // SDK 0.2.1 returns null both for zero registration and for RPC errors.
    // Track RPC failure in the injected client so a failure never means unregistered.
    let readError;
    const verifier = createAgentBookVerifier({contractAddress:AGENTBOOK_ADDRESS,client:{
      readContract: async parameters => {
        try { return await client.readContract({...parameters,blockNumber}); }
        catch (error) { readError = error; throw error; }
      },
    }});
    const humanId = await verifier.lookupHuman(address);
    if (readError) throw fail('WORLD_PROVIDER_FAILED');
    // Do not retain or export the anonymous human identifier.
    return {address,registered:Boolean(humanId),chainId:480,network:'World Chain',
      contract:AGENTBOOK_ADDRESS,blockNumber:String(blockNumber),queriedAt:new Date().toISOString(),live:true};
  } catch(error) { throw error.code?.startsWith('WORLD_') ? error : fail('WORLD_PROVIDER_FAILED'); }
}
