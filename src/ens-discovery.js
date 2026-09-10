import { ENS_NETWORKS, resolveEnsProfile, matchingEnsMembers } from "./ens.js";

const labels = {
  zh: {
    title: "用 ENS 名称找到社区成员", intro: "读取名称和子名称的公开记录，再按解析出的地址查找成员。",
    name: "ENS 名称", network: "查询网络", lookup: "解析并找人", loading: "正在读取 ENS…",
    note: "Sepolia 是 ENSv2 测试网。名称解析和地址相同不代表已验证成员的钱包所有权。",
    empty: "该名称在所选网络上没有可用的 ETH 地址记录。", invalid: "请输入有效的名称，例如 nick.eth；不要输入网址。",
    failed: "ENS 服务暂时无法读取，请稍后重试。", timeout: "查询超时，请重试。",
    wrong: "节点返回的网络不符，已停止查询。", v2: "当前节点未能验证 ENSv2 注册表，请稍后重试。",
    address: "解析地址", source: "链上来源", block: "查询区块", records: "名称公开记录（由记录控制者填写）",
    missing: "未设置", recordError: "读取失败", matches: "个成员资料中的地址与解析结果相同",
    none: "成员库中没有地址相同的资料。不会据此生成虚构成员。", membersLoading: "成员库尚未加载完成。",
    membersFailed: "成员库读取失败；ENS 解析结果仍可查看。", view: "查看成员资料",
    proof: "核验该地址的 Ethereum 主网活动", proofNote: "下面的活动核验仅覆盖 Ethereum 主网 Uniswap V3，与上面的 Sepolia 名称记录分别查询。",
    hierarchy: "ENSv2 注册表层级", resolver: "Universal Resolver", queried: "查询时间", addressOnly: "仅匹配公开地址，身份未签名验证",
  },
  en: {
    title: "Find community members by ENS name", intro: "Read public name and subname records, then find members with the resolved address.",
    name: "ENS name", network: "Lookup network", lookup: "Resolve and find members", loading: "Reading ENS…",
    note: "Sepolia is the ENSv2 testnet. Name resolution and matching addresses do not verify a member's wallet ownership.",
    empty: "This name has no usable ETH address record on the selected network.", invalid: "Enter a valid name such as nick.eth, not a URL.",
    failed: "ENS is currently unavailable. Please retry.", timeout: "The lookup timed out. Please retry.",
    wrong: "The node returned a different network. Lookup stopped.", v2: "Could not verify the ENSv2 registry on this node. Please retry.",
    address: "Resolved address", source: "Onchain source", block: "Query block", records: "Public name records (set by the record controller)",
    missing: "Not set", recordError: "Read failed", matches: "member profiles share this resolved address",
    none: "No member profile shares this address. No candidate has been generated.", membersLoading: "The member directory is still loading.",
    membersFailed: "The member directory could not load. ENS results remain available.", view: "View member profile",
    proof: "Check this address's Ethereum mainnet activity", proofNote: "The activity check below covers Ethereum mainnet Uniswap V3, queried separately from Sepolia name records.",
    hierarchy: "ENSv2 registry hierarchy", resolver: "Universal Resolver", queried: "Queried at", addressOnly: "Address match only; ownership not signature-verified",
  },
};
const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function mountEnsDiscovery(host, { getLocale, getMembers, directoryStatus, onMember, onCandidate }) {
  let profile = null, error = "", busy = false, revision = 0;
  host.innerHTML = `<div class="ens-heading"><p class="section-label">ENSv2 · SEPOLIA</p><h3 data-ens="title"></h3><p data-ens="intro"></p></div>
    <form class="ens-lookup-form"><label class="field"><span data-ens="name"></span><input name="ens" placeholder="nick.eth" maxlength="255" autocomplete="off" spellcheck="false" required></label>
    <label class="field"><span data-ens="network"></span><select name="network"><option value="sepolia">ENSv2 · Sepolia</option><option value="mainnet">ENS · Ethereum Mainnet</option></select></label>
    <button type="submit" class="button button-dark" data-ens="lookup"></button></form>
    <p class="ens-note" data-ens="note"></p><div class="ens-results" aria-live="polite"></div>`;
  const form = host.querySelector("form"), panel = host.querySelector(".ens-results"), button = host.querySelector("button");
  const render = () => {
    const l = labels[getLocale()] || labels.zh;
    host.querySelector(".section-label").textContent = ENS_NETWORKS[form.elements.network.value].label;
    host.querySelectorAll("[data-ens]").forEach((node) => { node.textContent = l[node.dataset.ens]; });
    button.textContent = busy ? l.loading : l.lookup;
    button.disabled = busy;
    panel.setAttribute("aria-busy", String(busy));
    if (error) {
      const key = ({ ENS_NOT_FOUND: "empty", ENS_INVALID_NAME: "invalid", ENS_TIMEOUT: "timeout", ENS_WRONG_NETWORK: "wrong", ENS_V2_UNAVAILABLE: "v2" })[error] || "failed";
      panel.innerHTML = `<p class="form-error">${l[key]} [${escape(error)}]</p>`; return;
    }
    if (!profile) { panel.innerHTML = ""; return; }
    const config = ENS_NETWORKS[profile.network];
    const link = (address) => `<a href="${config.explorer}/address/${escape(address)}" target="_blank" rel="noopener noreferrer">${escape(address)}</a>`;
    const members = matchingEnsMembers(getMembers(), profile), status = directoryStatus();
    panel.innerHTML = `<h4>${escape(profile.name)}</h4><p><strong>${config.label}</strong> · ${l.block} ${escape(profile.blockNumber)}</p>
      <dl><dt>${l.address}</dt><dd>${link(profile.address)}</dd></dl>
      <details><summary>${l.source}</summary><p>${l.resolver}: ${link(profile.universalResolver)}</p>
      ${profile.rootRegistry ? `<p>${l.hierarchy}</p><ol>${[...profile.registries].reverse().map((a) => `<li>${link(a)}</li>`).join("")}</ol>` : ""}
      <p>${l.queried}: ${escape(profile.queriedAt)}</p></details>
      <details><summary>${l.records}</summary><dl>${Object.entries(profile.records).map(([key, record]) => `<dt>${escape(key)}</dt><dd>${escape(record.status === "error" ? l.recordError : record.value || l.missing)}</dd>`).join("")}</dl></details>
      <p>${status === "loading" ? l.membersLoading : status === "error" ? l.membersFailed : members.length ? `${members.length} ${l.matches}` : l.none}</p>
      ${status === "ready" && members.length ? `<p class="ens-note">${l.addressOnly}</p><ul class="ens-member-list">${members.map((member, index) => `<li><strong>${escape(member.name)}</strong><button class="text-button" type="button" data-view="${index}">${l.view}</button><button class="text-button" type="button" data-proof="${index}">${l.proof}</button></li>`).join("")}</ul><p class="ens-note">${l.proofNote}</p>` : ""}`;
    panel.querySelectorAll("[data-view]").forEach((node) => node.addEventListener("click", () => onMember(members[Number(node.dataset.view)], false)));
    if (onCandidate) panel.querySelectorAll("[data-view]").forEach(node => {
      const add = document.createElement("button"); add.type = "button"; add.className = "text-button";
      add.textContent = getLocale() === "en" ? "Add to shortlist" : "加入候选";
      add.onclick = () => onCandidate(members[Number(node.dataset.view)], profile);
      node.after(add);
    });
    panel.querySelectorAll("[data-proof]").forEach((node) => node.addEventListener("click", () => onMember(members[Number(node.dataset.proof)], true)));
  };
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    const current = ++revision;
    busy = true; profile = null; error = ""; render();
    try {
      const next = await resolveEnsProfile(form.elements.ens.value, form.elements.network.value);
      if (current === revision) profile = next;
    } catch (reason) { if (current === revision) error = reason.code || "ENS_PROVIDER_FAILED"; }
    finally { if (current === revision) { busy = false; render(); } }
  });
  // Discard responses for a previous name/network; never label stale results as current.
  form.addEventListener("input", () => { revision++; busy = false; profile = null; error = ""; render(); });
  form.elements.network.addEventListener("change", () => { revision++; busy = false; profile = null; error = ""; render(); });
  render();
  return { render };
}
