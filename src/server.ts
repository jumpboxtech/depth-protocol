/**
 * Depth SDK — Server Module
 *
 * x402 payment gating middleware for API servers.
 */

import {
  type X402ServerConfig,
  type PaymentRequired,
  type PaymentPayload,
  type PaymentRequirements,
  type ResourceInfo,
  type VerifyResponse,
  HEADER_PAYMENT_REQUIRED,
  HEADER_PAYMENT_SIGNATURE,
  MAINNET_API,
} from "./types.js";

export function buildPaymentRequirements(
  config: X402ServerConfig,
  options: { amount: string | number | bigint; asset?: string; maxTimeoutSeconds?: number }
): PaymentRequirements {
  return {
    scheme: "exact",
    network: config.network,
    asset: options.asset || "STX",
    amount: String(options.amount),
    payTo: config.payTo,
    maxTimeoutSeconds: options.maxTimeoutSeconds || 300,
    extra: {
      contractAddress: config.contractAddress,
      contractName: config.contractName || "x402-payments",
    },
  };
}

export function buildPaymentRequired(
  config: X402ServerConfig,
  resource: ResourceInfo,
  options: { amount: string | number | bigint; asset?: string; maxTimeoutSeconds?: number; error?: string }
): PaymentRequired {
  return {
    x402Version: 2,
    error: options.error || "Payment required",
    resource,
    accepts: [buildPaymentRequirements(config, options)],
  };
}

export async function verifyPayment(config: X402ServerConfig, payload: PaymentPayload): Promise<VerifyResponse> {
  const apiUrl = config.apiUrl || (config.network === "stacks:1" ? MAINNET_API : "https://api.testnet.hiro.so");
  const contractAddress = config.contractAddress;
  const contractName = config.contractName || "x402-payments";

  try {
    const txResp = await fetch(`${apiUrl}/extended/v1/tx/${payload.payload.txId}`);
    if (!txResp.ok) return { isValid: false, invalidReason: "Transaction not found" };

    const txData = (await txResp.json()) as {
      tx_status: string; sender_address?: string;
      contract_call?: { contract_id: string; function_name: string };
    };

    if (txData.tx_status !== "success") return { isValid: false, invalidReason: `Transaction status: ${txData.tx_status}` };

    const expectedContract = `${contractAddress}.${contractName}`;
    if (txData.contract_call?.contract_id !== expectedContract) return { isValid: false, invalidReason: `Wrong contract: ${txData.contract_call?.contract_id}` };

    const fn = txData.contract_call?.function_name;
    if (fn !== "pay-stx" && fn !== "pay-sip010") return { isValid: false, invalidReason: `Wrong function: ${fn}` };

    const nonceHex = payload.payload.nonce.replace(/^0x/, "");
    const verifyResp = await fetch(`${apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: contractAddress, arguments: [`0x${nonceHex}`] }),
    });

    if (!verifyResp.ok) return { isValid: false, invalidReason: "Failed to call verify-payment" };
    const verifyData = (await verifyResp.json()) as { okay: boolean; result?: string };
    if (!verifyData.okay || !verifyData.result) return { isValid: false, invalidReason: "Contract call failed" };
    if (verifyData.result.includes("none")) return { isValid: false, invalidReason: "Nonce not found on-chain" };

    return { isValid: true, payer: txData.sender_address, amount: payload.accepted.amount, recipient: payload.accepted.payTo };
  } catch (error) {
    return { isValid: false, invalidReason: `Verification error: ${error}` };
  }
}

export function create402Response(
  config: X402ServerConfig,
  request: { url: string },
  options: { amount: string | number | bigint; asset?: string; description?: string; mimeType?: string }
) {
  const resource: ResourceInfo = { url: request.url, description: options.description || "Protected resource", mimeType: options.mimeType || "application/json" };
  const paymentRequired = buildPaymentRequired(config, resource, { amount: options.amount, asset: options.asset });
  const encoded = btoa(JSON.stringify(paymentRequired));
  return {
    status: 402 as const,
    headers: { [HEADER_PAYMENT_REQUIRED]: encoded, "Content-Type": "application/json" },
    body: { error: "payment_required", message: `Payment required to access ${request.url}` },
  };
}

export function extractPaymentPayload(headers: Record<string, string | undefined>): PaymentPayload | null {
  const raw = headers[HEADER_PAYMENT_SIGNATURE] || headers[HEADER_PAYMENT_SIGNATURE.toLowerCase()];
  if (!raw) return null;
  try { return JSON.parse(atob(raw)) as PaymentPayload; } catch { return null; }
}

export async function withX402(
  config: X402ServerConfig,
  request: { url: string; headers: Record<string, string | undefined> },
  options: { amount: string | number | bigint; asset?: string; description?: string }
): Promise<
  | { allowed: true; payer: string; payload: PaymentPayload }
  | { allowed: false; response: { status: number; headers: Record<string, string>; body: unknown } }
> {
  const payload = extractPaymentPayload(request.headers);
  if (!payload) return { allowed: false, response: create402Response(config, request, options) };

  const verification = await verifyPayment(config, payload);
  if (!verification.isValid) {
    return { allowed: false, response: { status: 402, headers: { "Content-Type": "application/json" }, body: { error: "payment_invalid", message: verification.invalidReason || "Payment verification failed" } } };
  }
  return { allowed: true, payer: verification.payer!, payload };
}
