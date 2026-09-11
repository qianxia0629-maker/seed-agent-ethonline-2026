const clean = (value) => String(value ?? "").replace(/[\r\n]+/g, " ").replace(/[<>`*_\[\]\\#]/g, "");
const wallet = (value) => String(value || "").toLowerCase();

export function mergeCandidateOrigin(previous = {}, next = {}) {
  return {...previous,...next,source:[...new Set([...(previous.sources || (previous.source ? [previous.source] : [])), next.source].filter(Boolean))].join(' + '),
    sources:[...new Set([...(previous.sources || (previous.source ? [previous.source] : [])),next.source].filter(Boolean))]};
}

export function candidateEvidence(member, evidence = {}) {
  if (!/^0x[\da-f]{40}$/i.test(member.wallet_address || "")) return "wallet_missing";
  if (evidence.loading) return "loading";
  if (evidence.error) return "failed";
  if (!evidence.profile?.source?.live) return "pending";
  return evidence.profile?.proof?.hasEvidence ? "verified" : "no_evidence";
}

export function validEnsOrigin(member, origin) {
  return origin?.ens && /^0x[\da-f]{40}$/i.test(member.wallet_address || "") && wallet(origin.ens.address) === wallet(member.wallet_address) ? origin.ens : null;
}

export function candidateReport(entries, getEvidence, now = new Date()) {
  const lines = ["# Seed Club Talent — Candidate report", `Generated: ${now.toISOString()}`, "", "Profile information is self-reported. Address matching does not verify wallet ownership.", "Activity queries cover Ethereum mainnet Uniswap V3 only, not all onchain activity or personal ability.", "This report is a snapshot; pending, failed and no evidence are different states. Contact details are excluded.", ""];
  for (const { member, origin } of entries) {
    const evidence = getEvidence(member), status = candidateEvidence(member, evidence);
    lines.push(`## ${clean(member.name)}`, `Member ID: ${clean(member.id)}`, `Wallet (self-reported): ${clean(member.wallet_address) || "Not provided"}`, `Discovery: ${clean(origin.source)}`, `Search: ${clean(origin.query) || "Not applicable"}`, `Reasons at selection: ${clean(origin.reasons) || "Manually selected; no search score assigned"}`, `Activity status: ${status}`);
    if (["verified", "no_evidence"].includes(status)) {
      lines.push(`Source: The Graph / Ethereum mainnet / Uniswap V3`, `Indexed block: ${clean(evidence.profile.indexedBlock)}`, `Activity score: ${clean(evidence.profile.proof?.score ?? 0)}/100`);
      lines.push(`Activity queried at: ${clean(evidence.profile.source.queriedAt) || "Not available"}`, `Subgraph ID: ${clean(evidence.profile.source.subgraphId) || "Not available"}`);
    }
    const ens = validEnsOrigin(member, origin);
    if (ens) lines.push(`ENS: ${clean(ens.name)} | ${clean(ens.network)} | chain ${clean(ens.chainId)} | block ${clean(ens.blockNumber)}`, `ENS queried at: ${clean(ens.queriedAt)}`, `Universal Resolver: ${clean(ens.universalResolver)}`);
    else if (origin.ens) lines.push("ENS association invalidated: member wallet changed.");
    if (origin.world?.live && wallet(origin.world.address) === wallet(member.wallet_address)) {
      lines.push(`World AgentBook: ${origin.world.registered ? 'Registration record found' : 'No registration record at queried block'}`,`World Chain (480), block: ${clean(origin.world.blockNumber)}`,`AgentBook contract: ${clean(origin.world.contract)}`,`World queried at: ${clean(origin.world.queriedAt)}`, 'Registration lookup only; current visitor and wallet ownership are not verified.');
    } else if(origin.world) lines.push('World association invalidated: member wallet changed.');
    lines.push("");
  }
  return lines.join("\n");
}

export function mountShortlist(host, { getMembers, getLocale, getEvidence, onVerify, onView }) {
  const selected = new Map();
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const entries = () => [...selected].flatMap(([id, origin]) => {
    const member = getMembers().find(m => String(m.id) === id);
    return member ? [{ member, origin }] : [];
  });
  function render() {
    const en = getLocale() === "en", rows = entries();
    const statuses = en ? {wallet_missing:"No wallet",loading:"Checking…",failed:"Query failed",pending:"Not checked",verified:"Activity found",no_evidence:"No evidence in queried scope"} : {wallet_missing:"未提供钱包",loading:"核验中…",failed:"查询失败",pending:"尚未核验",verified:"发现活动证据",no_evidence:"查询范围内未发现证据"};
    host.innerHTML = `<h3>${en ? "Candidate shortlist" : "候选名单"} · ${rows.length}</h3><p>${en ? "Select → Verify → Export. This page only; refreshing clears the list. Reports exclude contact details." : "加入候选 → 核验活动 → 导出报告。名单仅在当前页面保留，刷新即清空；报告不包含联系方式。"}</p>
      ${rows.length ? rows.map(({member,origin},i) => { const status = candidateEvidence(member,getEvidence(member)); return `<article class="shortlist-row"><h4>${esc(member.name)}</h4><p>${esc(origin.query || origin.source)}</p><p>${esc(origin.reasons)}</p><p>${statuses[status]} · Ethereum / Uniswap V3</p>${validEnsOrigin(member,origin) ? `<p>ENS: ${esc(origin.ens.name)} · ${esc(origin.ens.network)}</p>` : ""}<button class="text-button" data-view="${i}">${en ? "View profile" : "查看资料"}</button><button class="text-button" data-verify="${i}" ${["wallet_missing","loading"].includes(status) ? "disabled" : ""}>${en ? "Verify activity" : "核验活动"}</button><button class="text-button" data-remove="${esc(member.id)}">${en ? "Remove" : "移除"}</button></article>`; }).join("") : `<p>${en ? "Add members from search, ENS results or the directory." : "从 AI 搜索、ENS 结果或成员卡片加入候选。"}</p>`}
      <button class="button button-quiet" data-export ${rows.length ? "" : "disabled"}>${en ? "Export candidate report (.md)" : "导出候选报告（.md）"}</button>`;
    host.querySelectorAll("[data-view]").forEach(b => b.onclick = () => onView(rows[Number(b.dataset.view)].member));
    host.querySelectorAll('.shortlist-row').forEach((node,index)=>{
      const {member,origin}=rows[index];
      const world=origin.world;
      if(world?.live && wallet(world.address)===wallet(member.wallet_address)) {
        const note=document.createElement('p');
        note.textContent=`World AgentBook · ${world.registered?(en?'Registration found':'发现注册记录'):(en?'No registration':'未发现注册记录')} · ${en?'Block':'区块'} ${world.blockNumber}`;
        node.append(note);
      }
    });
    host.querySelectorAll("[data-verify]").forEach(b => b.onclick = () => onVerify(rows[Number(b.dataset.verify)].member.id));
    host.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => {selected.delete(b.dataset.remove); render();});
    host.querySelector("[data-export]").onclick = () => {
      const url = URL.createObjectURL(new Blob([candidateReport(entries(), getEvidence)], {type:"text/markdown;charset=utf-8"}));
      const a = document.createElement("a"); a.href = url; a.download = "seedclub-candidates.md"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }
  render();
  return { render, add(member, origin = {source:"Member directory"}) { if(!member)return; selected.set(String(member.id), structuredClone(mergeCandidateOrigin(selected.get(String(member.id)),origin))); render(); host.scrollIntoView({behavior:"smooth",block:"start"}); } };
}
