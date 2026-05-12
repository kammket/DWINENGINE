// Bitcoin payment utilities — zero fees, no external services, no API keys required.
// Uses CoinGecko (free) for BTC price and Blockstream Esplora (free) for on-chain verification.

const BLOCKSTREAM_BASE = "https://blockstream.info/api";

/**
 * Fetch the current BTC/USD price.
 * Tries three free sources in order — if one fails or rate-limits,
 * the next is tried automatically. No API keys required for any of them.
 *
 * Sources:
 *  1. Binance public ticker (most reliable, no key, no rate limit)
 *  2. Coinbase public price endpoint (no key)
 *  3. CoinGecko free endpoint (fallback, can rate-limit server-side)
 */
export async function getBtcPriceUsd(): Promise<number> {
  // 1 — Binance
  try {
    const res = await fetch(
      "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = (await res.json()) as { price: string };
      const price = parseFloat(data.price);
      if (price > 0) return price;
    }
  } catch {
    // try next source
  }

  // 2 — Coinbase
  try {
    const res = await fetch(
      "https://api.coinbase.com/v2/prices/BTC-USD/spot",
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = (await res.json()) as { data: { amount: string } };
      const price = parseFloat(data.data.amount);
      if (price > 0) return price;
    }
  } catch {
    // try next source
  }

  // 3 — CoinGecko (free, sometimes rate-limits server-side)
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = (await res.json()) as { bitcoin: { usd: number } };
      const price = data.bitcoin.usd;
      if (price > 0) return price;
    }
  } catch {
    // all sources failed
  }

  throw new Error(
    "Unable to fetch BTC price — all price sources are unavailable. Please try again in a moment."
  );
}

/**
 * Convert a USD amount (in cents) to satoshis, then add a 1–999 satoshi nonce
 * derived from the invoice ID so that each invoice has a unique exact amount.
 * This lets us match received payments to invoices without HD wallet derivation.
 */
export function usdCentsToUniqueSatoshis(
  usdCents: number,
  btcPriceUsd: number,
  invoiceId: string
): number {
  const btc = usdCents / 100 / btcPriceUsd;
  const baseSatoshis = Math.round(btc * 1e8);
  // 1–999 nonce from last 5 chars of invoice ID interpreted as base-36
  const nonce = (parseInt(invoiceId.slice(-5), 36) % 999) + 1;
  return baseSatoshis + nonce;
}

/** Format satoshis as an 8-decimal BTC string. */
export function satoshisToBtc(satoshis: number): string {
  return (satoshis / 1e8).toFixed(8);
}

/** Build a BIP-21 bitcoin: URI (opens any Bitcoin wallet app). */
export function bitcoinUri(address: string, satoshis: number, label?: string): string {
  const btc = satoshisToBtc(satoshis);
  const base = `bitcoin:${address}?amount=${btc}`;
  return label ? `${base}&label=${encodeURIComponent(label)}` : base;
}

// ─────────────────────────────────────────────────────
// Blockchain verification via Blockstream Esplora (free, no key)
// ─────────────────────────────────────────────────────

type EsploraTx = {
  txid: string;
  vout: Array<{ scriptpubkey_address?: string; value: number }>;
  status: { confirmed: boolean; block_height?: number; block_time?: number };
};

export type PaymentCheckResult =
  | { found: false }
  | { found: true; confirmed: boolean; txid: string };

/**
 * Check Blockstream Esplora for a payment of exactly `expectedSatoshis` to `address`.
 * Checks both the mempool (unconfirmed) and the confirmed transaction history.
 * `afterTs` is the unix timestamp (seconds) of invoice creation — used to skip
 * very old confirmed transactions that predate the invoice.
 */
export async function checkBitcoinPayment(
  address: string,
  expectedSatoshis: number,
  afterTs: number
): Promise<PaymentCheckResult> {
  try {
    const [mempoolRes, confirmedRes] = await Promise.allSettled([
      fetch(`${BLOCKSTREAM_BASE}/address/${address}/txs/mempool`, { cache: "no-store" }),
      fetch(`${BLOCKSTREAM_BASE}/address/${address}/txs`, { cache: "no-store" }),
    ]);

    const allTxs: EsploraTx[] = [];

    if (mempoolRes.status === "fulfilled" && mempoolRes.value.ok) {
      const data = (await mempoolRes.value.json()) as EsploraTx[];
      allTxs.push(...data);
    }

    if (confirmedRes.status === "fulfilled" && confirmedRes.value.ok) {
      const data = (await confirmedRes.value.json()) as EsploraTx[];
      // Only include confirmed txs that are recent enough
      allTxs.push(...data.filter((tx) => {
        if (!tx.status.confirmed) return false;
        const blockTime = tx.status.block_time ?? 0;
        return blockTime >= afterTs - 600; // 10-min buffer
      }));
    }

    for (const tx of allTxs) {
      for (const vout of tx.vout) {
        if (
          vout.scriptpubkey_address === address &&
          vout.value === expectedSatoshis
        ) {
          return { found: true, confirmed: tx.status.confirmed, txid: tx.txid };
        }
      }
    }

    return { found: false };
  } catch {
    return { found: false };
  }
}
