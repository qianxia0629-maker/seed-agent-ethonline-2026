import test from 'node:test';
import assert from 'node:assert/strict';
import {renderEvidenceDetails,evidenceMarkdown} from '../src/evidence-details.js';
import {candidateReport} from '../src/shortlist.js';
const tx='0x'+'a'.repeat(64),address='0x'+'b'.repeat(40);
const profile={source:{live:true,queriedAt:'2026-09-12T13:00:00Z',subgraphId:'test'},indexedBlock:123,proof:{hasEvidence:true,breakdown:[{key:'history',points:8,maxPoints:30}],activities:[{kind:'mint',token0:'ETH',token1:'USDC',timestamp:1700000000,blockNumber:120,transactionHash:tx,poolAddress:address}]}};
test('details and report expose real supplied evidence links, timing, limits and score basis',()=>{
  const html=renderEvidenceDetails(profile),md=evidenceMarkdown(profile);
  assert.ok(html.includes('<details'));assert.ok(html.includes('70%'));assert.ok(html.includes('核对交易'));
  assert.ok(md.includes('https://etherscan.io/tx/'+tx));assert.ok(md.includes('2023-11-14T22:13:20.000Z'));
  assert.ok(md.includes('History: 8 / 30'));assert.ok(md.includes('not a complete'));
});
test('empty, capped, index errors and unsafe URLs are explicit',()=>{
  const p={...profile,hasIndexingErrors:true,proof:{hasEvidence:false,resultCapped:true,activities:[{kind:'<script>',transactionHash:'javascript:alert(1)',timestamp:'x'}]}};
  const html=renderEvidenceDetails(p,'en');
  assert.ok(html.includes('No evidence found'));assert.ok(html.includes('cap reached'));assert.ok(html.includes('Indexer reported'));
  assert.ok(!html.includes('<script>'));assert.ok(!html.includes('javascript:'));assert.ok(!html.includes('Invalid Date'));
  assert.equal(renderEvidenceDetails({}), '');
});
test('failed or pending refresh never exports prior transaction samples',()=>{
  const entries=[{member:{id:1,wallet_address:address},origin:{source:'ENS'}}];
  assert.ok(candidateReport(entries,()=>({profile})).includes(tx));
  for(const extra of [{error:true},{loading:true}])assert.ok(!candidateReport(entries,()=>({profile,...extra})).includes(tx));
});
