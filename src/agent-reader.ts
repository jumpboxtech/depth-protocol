/**
 * Depth SDK — Agent Reader (Read-Only Queries)
 *
 * Free on-chain reads via Hiro API for all Depth Protocol contracts.
 */

import type { AgentSDKConfig } from "./types.js";
import { MAINNET_API } from "./types.js";

interface ClarityValue {
  type: string;
  value: unknown;
}

function apiUrl(config: AgentSDKConfig): string {
  return config.apiUrl || MAINNET_API;
}

async function callReadOnly(
  config: AgentSDKConfig, contractName: string, fnName: string, args: string[] = []
): Promise<ClarityValue | null> {
  const url = `${apiUrl(config)}/v2/contracts/call-read/${config.contractAddress}/${contractName}/${fnName}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender: config.contractAddress, arguments: args }),
  });
  if (!resp.ok) return null;
  const data = (await resp.json()) as { okay: boolean; result: string };
  if (!data.okay) return null;
  return { type: "raw", value: data.result };
}

function encodePrincipal(principal: string): string {
  return `0x${Buffer.from(JSON.stringify({ type: "principal", value: principal })).toString("hex")}`;
}

function encodeUint(value: bigint | number): string {
  return `0x${Buffer.from(JSON.stringify({ type: "uint", value: value.toString() })).toString("hex")}`;
}

// --- Agent Registry ---

export async function getAgent(config: AgentSDKConfig, owner: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-registry", "get-agent", [encodePrincipal(owner)]);
}

export async function getCapability(config: AgentSDKConfig, owner: string, index: number): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-registry", "get-capability", [encodePrincipal(owner), encodeUint(index)]);
}

export async function isRegistered(config: AgentSDKConfig, owner: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-registry", "is-registered", [encodePrincipal(owner)]);
}

export async function isActive(config: AgentSDKConfig, owner: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-registry", "is-active", [encodePrincipal(owner)]);
}

export async function isDelegate(config: AgentSDKConfig, owner: string, delegate: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-registry", "is-delegate", [encodePrincipal(owner), encodePrincipal(delegate)]);
}

export async function getRegistryStats(config: AgentSDKConfig): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-registry", "get-stats");
}

// --- Agent Vault ---

export async function getVault(config: AgentSDKConfig, owner: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-vault", "get-vault", [encodePrincipal(owner)]);
}

export async function isWhitelisted(config: AgentSDKConfig, owner: string, target: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-vault", "is-whitelisted", [encodePrincipal(owner), encodePrincipal(target)]);
}

export async function getAvailableDaily(config: AgentSDKConfig, owner: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-vault", "get-available-daily", [encodePrincipal(owner)]);
}

export async function getSpendLogEntry(config: AgentSDKConfig, owner: string, seq: bigint): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-vault", "get-spend-log-entry", [encodePrincipal(owner), encodeUint(seq)]);
}

// --- Task Board ---

export async function getTask(config: AgentSDKConfig, id: bigint): Promise<ClarityValue | null> {
  return callReadOnly(config, "task-board", "get-task", [encodeUint(id)]);
}

export async function getBid(config: AgentSDKConfig, taskId: bigint, bidder: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "task-board", "get-bid", [encodeUint(taskId), encodePrincipal(bidder)]);
}

export async function getBidAt(config: AgentSDKConfig, taskId: bigint, index: number): Promise<ClarityValue | null> {
  return callReadOnly(config, "task-board", "get-bid-at", [encodeUint(taskId), encodeUint(index)]);
}

export async function getBidCount(config: AgentSDKConfig, taskId: bigint): Promise<ClarityValue | null> {
  return callReadOnly(config, "task-board", "get-bid-count", [encodeUint(taskId)]);
}

export async function getAttestation(config: AgentSDKConfig, taskId: bigint): Promise<ClarityValue | null> {
  return callReadOnly(config, "task-board", "get-attestation", [encodeUint(taskId)]);
}

export async function getTaskStats(config: AgentSDKConfig): Promise<ClarityValue | null> {
  return callReadOnly(config, "task-board", "get-stats");
}

// --- Reputation ---

export async function getReputation(config: AgentSDKConfig, agent: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "reputation", "get-reputation", [encodePrincipal(agent)]);
}

export async function getRating(config: AgentSDKConfig, taskId: bigint, rater: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "reputation", "get-rating", [encodeUint(taskId), encodePrincipal(rater)]);
}

export async function getEndorsement(config: AgentSDKConfig, endorser: string, agent: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "reputation", "get-endorsement", [encodePrincipal(endorser), encodePrincipal(agent)]);
}

export async function getAverageScore(config: AgentSDKConfig, agent: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "reputation", "get-average-score", [encodePrincipal(agent)]);
}

export async function getTaskCompletion(config: AgentSDKConfig, taskId: bigint): Promise<ClarityValue | null> {
  return callReadOnly(config, "reputation", "get-task-completion", [encodeUint(taskId)]);
}

// --- Launchpad ---

export async function getCurve(config: AgentSDKConfig, curveId: bigint): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-launchpad", "get-curve", [encodeUint(curveId)]);
}

export async function getBalance(config: AgentSDKConfig, curveId: bigint, holder: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-launchpad", "get-balance", [encodeUint(curveId), encodePrincipal(holder)]);
}

export async function getAgentCurve(config: AgentSDKConfig, agent: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-launchpad", "get-agent-curve", [encodePrincipal(agent)]);
}

export async function getBuyQuote(config: AgentSDKConfig, curveId: bigint, stxAmount: bigint): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-launchpad", "get-buy-quote", [encodeUint(curveId), encodeUint(stxAmount)]);
}

export async function getSellQuote(config: AgentSDKConfig, curveId: bigint, tokenAmount: bigint): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-launchpad", "get-sell-quote", [encodeUint(curveId), encodeUint(tokenAmount)]);
}

export async function getPrice(config: AgentSDKConfig, curveId: bigint): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-launchpad", "get-price", [encodeUint(curveId)]);
}

export async function checkInvariant(config: AgentSDKConfig, curveId: bigint): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-launchpad", "check-invariant", [encodeUint(curveId)]);
}

export async function getLaunchpadStats(config: AgentSDKConfig): Promise<ClarityValue | null> {
  return callReadOnly(config, "agent-launchpad", "get-stats");
}

// --- x402 Curve Router ---

export async function verifyRouterPayment(config: AgentSDKConfig, nonce: string): Promise<ClarityValue | null> {
  return callReadOnly(config, "x402-curve-router", "verify-payment", [nonce]);
}

export async function getRouterStats(config: AgentSDKConfig): Promise<ClarityValue | null> {
  return callReadOnly(config, "x402-curve-router", "get-stats");
}
