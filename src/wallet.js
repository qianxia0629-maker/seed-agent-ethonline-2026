export const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export function isEvmAddress(value) {
  return EVM_ADDRESS_PATTERN.test(String(value || "").trim());
}

export function normalizeEvmAddress(value) {
  const address = String(value || "").trim();
  return isEvmAddress(address) ? address.toLowerCase() : "";
}

export function shortenEvmAddress(value, visible = 6) {
  const address = normalizeEvmAddress(value);
  if (!address) return "";
  return `${address.slice(0, visible + 2)}…${address.slice(-visible)}`;
}

export function explorerAddressUrl(value) {
  const address = normalizeEvmAddress(value);
  return address ? `https://etherscan.io/address/${address}` : "";
}

export function explorerTransactionUrl(value) {
  const hash = String(value || "").trim();
  return /^0x[a-fA-F0-9]{64}$/.test(hash) ? `https://etherscan.io/tx/${hash}` : "";
}
