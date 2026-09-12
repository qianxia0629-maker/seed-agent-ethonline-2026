import {explorerTransactionUrl, explorerAddressUrl} from './wallet.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=value=>String(value??'').replace(/[\r\n<>`*_\[\]\\#]/g,' ');
const pointNames={history:['历史跨度','History'],recentActivity:['近 90 天交易','Recent activity'],activePositions:['活跃仓位','Active positions'],protocolEvidence:['协议证据','Protocol evidence']};
export function evidenceLines(profile,locale='zh') {
  if(!profile?.source?.live)return [];
  const en=locale==='en',proof=profile.proof||{},lines=[];
  lines.push(en?'Scope: Ethereum mainnet / Uniswap V3. Recent events: 90 days; positions and earliest history are queried separately.':'范围：Ethereum 主网 / Uniswap V3。近期事件覆盖 90 天；仓位及最早历史分别查询。');
  lines.push(`${en?'Queried at':'查询时间'}: ${safe(profile.source.queriedAt)||'—'}`,`${en?'Indexed block':'索引区块'}: ${safe(profile.indexedBlock)||'—'}`,`Subgraph: ${safe(profile.source.subgraphId)||'—'}`);
  lines.push(en?'Activity is not skill or credit. For AI searches requiring onchain evidence, profile relevance weighs 70% and activity 30%; manual selections have no match score.':'活跃度不是能力或信用。要求链上证据的 AI 搜索中，资料相关性占 70%，活跃度占 30%；手动加入不产生匹配分。');
  for(const item of Array.isArray(proof.breakdown)?proof.breakdown:[])lines.push(`${pointNames[item.key]?.[en?1:0]||safe(item.key)}: ${safe(item.points)} / ${safe(item.maxPoints)}`);
  if(!proof.hasEvidence)lines.push(en?'No evidence found in this query scope. This does not mean the address has no onchain history.':'本次查询范围内未发现证据，不代表该地址没有其他链上经历。');
  lines.push(en?'Evidence is a service-returned sample (up to 5), not a complete transaction or position history.':'下方为服务返回的证据样本（最多 5 条），不是完整交易或仓位历史。');
  if(proof.resultCapped)lines.push(en?'Result cap reached; counts may be incomplete.':'查询已触及数量上限，统计可能不完整。');
  if(profile.hasIndexingErrors)lines.push(en?'Indexer reported errors; interpret results cautiously.':'索引服务报告错误，请谨慎解读数据。');
  return lines;
}
export function evidenceActivities(profile){
  return (Array.isArray(profile?.proof?.activities)?profile.proof.activities:[]).slice(0,5).map(a=>{
    const seconds=Number(a.timestamp),date=new Date(seconds*1000);
    return {label:`${safe(a.kind)} · ${safe(a.token0)} / ${safe(a.token1)}`,time:seconds>0&&Number.isFinite(date.getTime())?date.toISOString():'—',block:safe(a.blockNumber)||'—',tx:explorerTransactionUrl(a.transactionHash),pool:explorerAddressUrl(a.poolAddress)};
  });
}
export function renderEvidenceDetails(profile,locale='zh'){
  const lines=evidenceLines(profile,locale);if(!lines.length)return '';
  const en=locale==='en';
  return `<details class="evidence-details" style="overflow-wrap:anywhere"><summary>${en?'Inspect onchain evidence':'查看链上证据详情'}</summary>${lines.map(line=>`<p>${esc(line)}</p>`).join('')}<ol>${evidenceActivities(profile).map(a=>`<li><strong>${esc(a.label)}</strong><p>${esc(a.time)} · Block ${esc(a.block)}</p>${a.tx?`<a href="${a.tx}" target="_blank" rel="noopener noreferrer">${en?'Verify transaction':'核对交易'}</a>`:''} ${a.pool?`<a href="${a.pool}" target="_blank" rel="noopener noreferrer">${en?'Inspect pool':'查看资金池'}</a>`:''}</li>`).join('')}</ol></details>`;
}
export function evidenceMarkdown(profile){
  return [...evidenceLines(profile,'en'),...evidenceActivities(profile).flatMap(a=>[`${a.label} | ${a.time} | block ${a.block}`,a.tx?`Transaction: ${a.tx}`:'Transaction link unavailable',...(a.pool?[`Pool: ${a.pool}`]:[])])].join('\n');
}
