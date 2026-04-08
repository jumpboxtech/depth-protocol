/**
 * Depth SDK — Client Module
 *
 * x402 auto-paying fetch wrapper for clients consuming paid APIs.
 */

import {
  type PaymentRequired,
  type PaymentPayload,
  type PaymentRequirements,
  HEADER_PAYMENT_REQUIRED,
  HEADER_PAYMENT_SIGNATURE,
  MAINNET_API,
} from "./types.js";

export function is402Response(response: Response): boolean {
  return response.status === 402;
}

export function parsePaymentRequired(response: Response): PaymentRequired | null {
  const raw = response.headers.get(HEADER_PAYMENT_REQUIRED);
  if (!raw) return null;
  try { return JSON.parse(atob(raw)) as PaymentRequired; } catch { return null; }
}

export function generateNonce(): Uint8Array {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(16));
  }
  const nonce = new Uint8Array(16);
  for (let i = 0; i < 16; i++) nonce[i] = Math.floor(Math.random() * 256);
  return nonce;
}

export function nonceToHex(nonce: Uint8Array): string {
  return Array.from(nonce).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildPayStxArgs(
  requirements: PaymentRequirements,
  nonce: Uint8Array
) {
  return {
    contractAddress: requirements.extra.contractAddress,
    contractName: requirements.extra.contractName,
    functionName: "pay-stx" as const,
    functionArgs: {
      recipient: requirements.payTo,
      amount: requirements.amount,
      nonce: `0x${nonceToHex(nonce)}`,
    },
  };
}

export function buildPaymentPayload(
  paymentRequired: PaymentRequired,
  accepted: PaymentRequirements,
  txId: string,
  nonce: Uint8Array
): PaymentPayload {
  return {
    x402Version: 2,
    resource: paymentRequired.resource,
    accepted,
    payload: { txId, nonce: nonceToHex(nonce) },
  };
}

export function encodePaymentPayload(payload: PaymentPayload): string {
  return btoa(JSON.stringify(payload));
}

export interface AutoPayConfig {
  pay: (requirements: PaymentRequirements, nonce: Uint8Array) => Promise<string>;
  confirmationTimeout?: number;
  pollInterval?: number;
  apiUrl?: string;
}

async function waitForConfirmation(
  txId: string, apiUrl: string, timeout: number, pollInterval: number
): Promise<boolean> {
  const start = Date.now();
  const cleanTxId = txId.startsWith("0x") ? txId : `0x${txId}`;
  while (Date.now() - start < timeout) {
    try {
      const resp = await fetch(`${apiUrl}/extended/v1/tx/${cleanTxId}`);
      if (resp.ok) {
        const data = (await resp.json()) as { tx_status: string };
        if (data.tx_status === "success") return true;
        if (data.tx_status === "abort_by_response" || data.tx_status === "abort_by_post_condition") return false;
      }
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, pollInterval));
  }
  return false;
}

export function wrapFetchWithPayment(config: AutoPayConfig): typeof globalThis.fetch {
  const apiUrl = config.apiUrl || MAINNET_API;
  const timeout = config.confirmationTimeout || 120_000;
  const pollInterval = config.pollInterval || 3_000;

  return async function payingFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const response = await fetch(input, init);
    if (!is402Response(response)) return response;

    const paymentRequired = parsePaymentRequired(response);
    if (!paymentRequired || paymentRequired.accepts.length === 0) return response;

    const accepted = paymentRequired.accepts[0];
    const nonce = generateNonce();
    const txId = await config.pay(accepted, nonce);
    const confirmed = await waitForConfirmation(txId, apiUrl, timeout, pollInterval);
    if (!confirmed) throw new Error(`Payment transaction ${txId} failed or timed out`);

    const payload = buildPaymentPayload(paymentRequired, accepted, txId, nonce);
    const retryInit: RequestInit = {
      ...init,
      headers: { ...Object.fromEntries(new Headers(init?.headers).entries()), [HEADER_PAYMENT_SIGNATURE]: encodePaymentPayload(payload) },
    };
    return fetch(input, retryInit);
  };
}
