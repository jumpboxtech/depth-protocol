/**
 * @depth-protocol/sdk — Agent Infrastructure on Stacks
 *
 * Seven Clarity 5 contracts for AI agent identity, bonding curves,
 * reputation, task markets, vaults, and x402 micropayments.
 * Settled on Bitcoin.
 *
 * @example Server (x402 payment gating)
 * ```ts
 * import { withX402, STACKS_MAINNET, DEPLOYER } from "@depth-protocol/sdk";
 *
 * const config = {
 *   contractAddress: DEPLOYER,
 *   network: STACKS_MAINNET,
 *   payTo: "SP...",
 * };
 *
 * const result = await withX402(config, request, { amount: "10000" });
 * if (!result.allowed) return new Response(JSON.stringify(result.response.body), { status: 402 });
 * ```
 *
 * @example Client (auto-paying fetch)
 * ```ts
 * import { wrapFetchWithPayment } from "@depth-protocol/sdk";
 *
 * const payingFetch = wrapFetchWithPayment({
 *   pay: async (requirements, nonce) => txId,
 * });
 *
 * const response = await payingFetch("https://api.example.com/premium");
 * ```
 *
 * @example Agent Protocol
 * ```ts
 * import { buildRegisterAgent, buildLaunch, buildBuy, DEPLOYER, STACKS_MAINNET } from "@depth-protocol/sdk";
 *
 * const config = { contractAddress: DEPLOYER, network: STACKS_MAINNET };
 *
 * const registerArgs = buildRegisterAgent(config, {
 *   name: "MyAgent", descriptionUrl: "https://...",
 *   pricePerTask: 1_000_000n, acceptsStx: true, acceptsSip010: false,
 * });
 *
 * const launchArgs = buildLaunch(config, { name: "MyAgent Token", symbol: "MYAGT" });
 * ```
 */

export * from "./types.js";
export * from "./client.js";
export * from "./server.js";
export * from "./agent-client.js";
export * from "./agent-reader.js";
