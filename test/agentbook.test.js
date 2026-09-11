import test from 'node:test';
import assert from 'node:assert/strict';
import {lookupAgentRegistration,AGENTBOOK_ADDRESS} from '../src/agentbook.js';
const address='0x'+'1'.repeat(40);
const client=(read=async()=>0n)=>({getChainId:async()=>480,getBlockNumber:async()=>123n,getBytecode:async()=> '0x1234',readContract:read});
test('World uses canonical contract, pins block and omits human identifier',async()=>{
  const result=await lookupAgentRegistration(address,client(async p=>{
    assert.equal(p.blockNumber,123n);assert.equal(p.address,AGENTBOOK_ADDRESS);return 987654321n;
  }));
  assert.equal(result.registered,true);assert.equal(result.chainId,480);
  assert.equal(result.humanId,undefined);assert.ok(!JSON.stringify(result).includes('987654321'));
});
test('unregistered and SDK-suppressed RPC errors remain distinct',async()=>{
  assert.equal((await lookupAgentRegistration(address,client())).registered,false);
  await assert.rejects(lookupAgentRegistration(address,client(async()=>{throw Error('RPC');})),{code:'WORLD_PROVIDER_FAILED'});
});
test('wrong chain, invalid input and missing contract fail closed',async()=>{
  await assert.rejects(lookupAgentRegistration('bad',client()),{code:'WORLD_INVALID_ADDRESS'});
  await assert.rejects(lookupAgentRegistration(address,{...client(),getChainId:async()=>1}),{code:'WORLD_WRONG_NETWORK'});
  await assert.rejects(lookupAgentRegistration(address,{...client(),getBytecode:async()=>'0x'}),{code:'WORLD_CONTRACT_UNAVAILABLE'});
});
