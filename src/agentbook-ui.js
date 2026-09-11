import { lookupAgentRegistration } from './agentbook.js';
import { normalizeEvmAddress } from './wallet.js';

export function mountAgentBook(host,{getLocale,getMembers,onCandidate}) {
  let result=null,error='',busy=false,revision=0;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  host.innerHTML=`<h3></h3><p data-note></p><form class="agentbook-form"><label class="field"><span data-label></span><input name="address" autocomplete="off" placeholder="0x…" required maxlength="42"></label><button class="button button-dark" type="submit"></button></form><div data-result aria-live="polite"></div>`;
  const form=host.querySelector('form'),panel=host.querySelector('[data-result]');
  function render() {
    const en=getLocale()==='en';
    host.querySelector('h3').textContent=en?'World · AgentBook registration':'World · AgentBook 注册记录';
    host.querySelector('[data-note]').textContent=en?'Read a public agent registration using AgentKit. This does not verify the current visitor, wallet ownership, skills or Sandbox completion.':'通过 AgentKit 读取公开的 Agent 注册记录。这不代表当前访问者已通过真人验证，也不证明钱包所有权、能力或已完成 Sandbox 测试。';
    host.querySelector('[data-label]').textContent=en?'Agent wallet address':'Agent 钱包地址';
    const button=form.querySelector('button'); button.disabled=busy;
    button.textContent=busy?(en?'Checking…':'查询中…'):(en?'Check registration':'查询注册记录');
    panel.setAttribute('aria-busy',String(busy));
    if(error) {panel.innerHTML=`<p class="form-error">${en?'Lookup failed. Check the address or retry; no registration status was inferred.':'查询失败。请检查地址或重试；不会把失败当作未注册。'} [${esc(error)}]</p>`;return;}
    if(!result){panel.innerHTML='';return;}
    const members=getMembers().filter(m=>normalizeEvmAddress(m.wallet_address)===result.address);
    panel.innerHTML=`<p><strong>${result.registered?(en?'Registration record found':'发现注册记录'):(en?'No registration at this block':'该区块未发现注册记录')}</strong></p><p>World Chain · ${en?'Block':'区块'} ${esc(result.blockNumber)}</p><p>${esc(result.queriedAt)}</p><a href="https://worldscan.org/address/${esc(result.contract)}" target="_blank" rel="noopener noreferrer">AgentBook ${esc(result.contract)}</a><p>${en?'Matches public profile addresses only. No human identifier is displayed or exported.':'仅匹配成员公开地址，不显示或导出真人匿名标识。'}</p>${members.map((m,i)=>`<p>${esc(m.name)} <button class="text-button" type="button" data-add="${i}">${en?'Add to shortlist':'加入候选'}</button></p>`).join('')}`;
    panel.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>onCandidate(members[Number(b.dataset.add)],result));
  }
  form.onsubmit=async event=>{
    event.preventDefault();if(busy)return;
    const current=++revision; busy=true;result=null;error='';render();
    try {const next=await lookupAgentRegistration(form.elements.address.value);if(current===revision)result=next;}
    catch(e){if(current===revision)error=e.code||'WORLD_PROVIDER_FAILED';}
    finally{if(current===revision){busy=false;render();}}
  };
  form.oninput=()=>{revision++;busy=false;result=null;error='';render();};
  render();return {render};
}
