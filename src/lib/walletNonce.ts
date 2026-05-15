import crypto from "crypto";

// In-memory nonce store keyed by lowercase wallet address.
// Each nonce expires after 5 minutes to prevent replay attacks.
// For multi-instance production deployments, replace with Redis.
const store = new Map<string, { nonce: string; expires: number }>();

const TTL_MS = 5 * 60 * 1000;

export function generateNonce(address: string): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  store.set(address.toLowerCase(), { nonce, expires: Date.now() + TTL_MS });
  return nonce;
}

export function consumeNonce(address: string, nonce: string): boolean {
  const key = address.toLowerCase();
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expires) { store.delete(key); return false; }
  if (entry.nonce !== nonce) return false;
  store.delete(key); // one-time use
  return true;
}

export function buildSignMessage(address: string, nonce: string): string {
  return `Sign in to Constavita\n\nWallet: ${address}\nNonce: ${nonce}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
}
