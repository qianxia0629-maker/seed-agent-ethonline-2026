import test from 'node:test';
import assert from 'node:assert/strict';
import {candidateEvidence, candidateReport, validEnsOrigin} from '../src/shortlist.js';
const member = {id:'fixture',name:'Test <script>',wallet_address:'0x'+'1'.repeat(40),email:'private@example.test'};
const profile = {source:{live:true},indexedBlock:123,proof:{hasEvidence:false,score:0}};
test('candidate evidence distinguishes missing, pending, failed, loading and empty',()=>{
  assert.equal(candidateEvidence({}), 'wallet_missing');
  assert.equal(candidateEvidence(member), 'pending');
  assert.equal(candidateEvidence(member,{profile}), 'no_evidence');
  assert.equal(candidateEvidence(member,{profile,error:true}), 'failed');
  assert.equal(candidateEvidence(member,{profile,loading:true}), 'loading');
  assert.equal(candidateEvidence(member,{profile:{...profile,proof:{hasEvidence:true}}}), 'verified');
});
test('ENS association requires a valid matching current wallet',()=>{
  const origin={ens:{address:member.wallet_address}};
  assert.ok(validEnsOrigin(member,origin));
  assert.equal(validEnsOrigin({...member,wallet_address:'0x'+'2'.repeat(40)},origin), null);
  assert.equal(validEnsOrigin({}, {ens:{}}),null);
});
test('report omits contacts, sanitizes names, and preserves evidence scope',()=>{
  const report=candidateReport([{member,origin:{source:'Directory'}}],()=>({profile}));
  assert.ok(report.includes('no_evidence'));
  assert.ok(report.includes('Indexed block: 123'));
  assert.ok(report.includes('Uniswap V3 only'));
  assert.ok(!report.includes(member.email));
  assert.ok(!report.includes('<script>'));
});
test('failed refresh cannot export older evidence as successful',()=>{
  const report=candidateReport([{member,origin:{source:'ENS',ens:{address:'0x'+'2'.repeat(40)}}}],()=>({profile,error:true}));
  assert.ok(report.includes('Activity status: failed'));
  assert.ok(!report.includes('Indexed block:'));
  assert.ok(report.includes('association invalidated'));
});
