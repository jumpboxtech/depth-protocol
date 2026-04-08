/**
 * Depth SDK — Agent Client (Write Operations)
 *
 * Builds contract call args for agent-registry, agent-vault,
 * task-board, reputation, and agent-launchpad.
 */

import type { AgentSDKConfig, AgentStatus } from "./types.js";

interface ContractCallArgs {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: Record<string, unknown>;
}

function cid(config: AgentSDKConfig, name: string) {
  return { contractAddress: config.contractAddress, contractName: name };
}

// --- Agent Registry ---

export function buildRegisterAgent(config: AgentSDKConfig, params: {
  name: string; descriptionUrl: string; pricePerTask: bigint; acceptsStx: boolean; acceptsSip010: boolean;
}): ContractCallArgs {
  return { ...cid(config, "agent-registry"), functionName: "register-agent", functionArgs: {
    name: params.name, "description-url": params.descriptionUrl,
    "price-per-task": params.pricePerTask.toString(), "accepts-stx": params.acceptsStx, "accepts-sip010": params.acceptsSip010,
  }};
}

export function buildUpdateAgent(config: AgentSDKConfig, params: {
  name: string; descriptionUrl: string; pricePerTask: bigint; acceptsStx: boolean; acceptsSip010: boolean;
}): ContractCallArgs {
  return { ...cid(config, "agent-registry"), functionName: "update-agent", functionArgs: {
    name: params.name, "description-url": params.descriptionUrl,
    "price-per-task": params.pricePerTask.toString(), "accepts-stx": params.acceptsStx, "accepts-sip010": params.acceptsSip010,
  }};
}

export function buildSetCapability(config: AgentSDKConfig, index: number, capability: string): ContractCallArgs {
  return { ...cid(config, "agent-registry"), functionName: "set-capability", functionArgs: { index: index.toString(), capability }};
}

export function buildRemoveCapability(config: AgentSDKConfig, index: number): ContractCallArgs {
  return { ...cid(config, "agent-registry"), functionName: "remove-capability", functionArgs: { index: index.toString() }};
}

export function buildSetStatus(config: AgentSDKConfig, status: AgentStatus): ContractCallArgs {
  return { ...cid(config, "agent-registry"), functionName: "set-status", functionArgs: { "new-status": status.toString() }};
}

export function buildAddDelegate(config: AgentSDKConfig, delegate: string): ContractCallArgs {
  return { ...cid(config, "agent-registry"), functionName: "add-delegate", functionArgs: { delegate }};
}

export function buildRemoveDelegate(config: AgentSDKConfig, delegate: string): ContractCallArgs {
  return { ...cid(config, "agent-registry"), functionName: "remove-delegate", functionArgs: { delegate }};
}

// --- Agent Vault ---

export function buildCreateVault(config: AgentSDKConfig, params: { perTxCap: bigint; dailyCap: bigint }): ContractCallArgs {
  return { ...cid(config, "agent-vault"), functionName: "create-vault", functionArgs: {
    "per-tx-cap": params.perTxCap.toString(), "daily-cap": params.dailyCap.toString(),
  }};
}

export function buildVaultDeposit(config: AgentSDKConfig, amount: bigint): ContractCallArgs {
  return { ...cid(config, "agent-vault"), functionName: "deposit", functionArgs: { amount: amount.toString() }};
}

export function buildVaultWithdraw(config: AgentSDKConfig, amount: bigint): ContractCallArgs {
  return { ...cid(config, "agent-vault"), functionName: "withdraw", functionArgs: { amount: amount.toString() }};
}

export function buildUpdatePolicy(config: AgentSDKConfig, params: { perTxCap: bigint; dailyCap: bigint }): ContractCallArgs {
  return { ...cid(config, "agent-vault"), functionName: "update-policy", functionArgs: {
    "per-tx-cap": params.perTxCap.toString(), "daily-cap": params.dailyCap.toString(),
  }};
}

export function buildAddToWhitelist(config: AgentSDKConfig, target: string): ContractCallArgs {
  return { ...cid(config, "agent-vault"), functionName: "add-to-whitelist", functionArgs: { target }};
}

export function buildRemoveFromWhitelist(config: AgentSDKConfig, target: string): ContractCallArgs {
  return { ...cid(config, "agent-vault"), functionName: "remove-from-whitelist", functionArgs: { target }};
}

export function buildVaultSpend(config: AgentSDKConfig, params: { owner: string; amount: bigint; memo: string }): ContractCallArgs {
  return { ...cid(config, "agent-vault"), functionName: "spend", functionArgs: {
    owner: params.owner, amount: params.amount.toString(), memo: params.memo,
  }};
}

// --- Task Board ---

export function buildPostTask(config: AgentSDKConfig, params: { title: string; descriptionUrl: string; bounty: bigint; deadline: bigint }): ContractCallArgs {
  return { ...cid(config, "task-board"), functionName: "post-task", functionArgs: {
    title: params.title, "description-url": params.descriptionUrl,
    bounty: params.bounty.toString(), deadline: params.deadline.toString(),
  }};
}

export function buildBid(config: AgentSDKConfig, params: { taskId: bigint; price: bigint; messageUrl: string }): ContractCallArgs {
  return { ...cid(config, "task-board"), functionName: "bid", functionArgs: {
    "task-id": params.taskId.toString(), price: params.price.toString(), "message-url": params.messageUrl,
  }};
}

export function buildAssign(config: AgentSDKConfig, taskId: bigint, agent: string): ContractCallArgs {
  return { ...cid(config, "task-board"), functionName: "assign", functionArgs: { "task-id": taskId.toString(), agent }};
}

export function buildSubmitWork(config: AgentSDKConfig, taskId: bigint, resultUrl: string): ContractCallArgs {
  return { ...cid(config, "task-board"), functionName: "submit-work", functionArgs: { "task-id": taskId.toString(), "result-url": resultUrl }};
}

export function buildApprove(config: AgentSDKConfig, taskId: bigint): ContractCallArgs {
  return { ...cid(config, "task-board"), functionName: "approve", functionArgs: { "task-id": taskId.toString() }};
}

export function buildDispute(config: AgentSDKConfig, taskId: bigint, reasonUrl: string): ContractCallArgs {
  return { ...cid(config, "task-board"), functionName: "dispute", functionArgs: { "task-id": taskId.toString(), "reason-url": reasonUrl }};
}

export function buildCancel(config: AgentSDKConfig, taskId: bigint): ContractCallArgs {
  return { ...cid(config, "task-board"), functionName: "cancel", functionArgs: { "task-id": taskId.toString() }};
}

export function buildExpireTask(config: AgentSDKConfig, taskId: bigint): ContractCallArgs {
  return { ...cid(config, "task-board"), functionName: "expire-task", functionArgs: { "task-id": taskId.toString() }};
}

// --- Reputation ---

export function buildRateAgent(config: AgentSDKConfig, params: { taskId: bigint; agent: string; score: number }): ContractCallArgs {
  return { ...cid(config, "reputation"), functionName: "rate-agent", functionArgs: {
    "task-id": params.taskId.toString(), agent: params.agent, score: params.score.toString(),
  }};
}

export function buildEndorse(config: AgentSDKConfig, agent: string, capability: string): ContractCallArgs {
  return { ...cid(config, "reputation"), functionName: "endorse", functionArgs: { agent, capability }};
}

export function buildRevokeEndorsement(config: AgentSDKConfig, agent: string): ContractCallArgs {
  return { ...cid(config, "reputation"), functionName: "revoke-endorsement", functionArgs: { agent }};
}

// --- Launchpad ---

export function buildLaunch(config: AgentSDKConfig, params: { name: string; symbol: string }): ContractCallArgs {
  return { ...cid(config, "agent-launchpad"), functionName: "launch", functionArgs: {
    name: params.name, symbol: params.symbol,
  }};
}

export function buildBuy(config: AgentSDKConfig, params: { curveId: bigint; stxAmount: bigint; minTokensOut: bigint }): ContractCallArgs {
  return { ...cid(config, "agent-launchpad"), functionName: "buy", functionArgs: {
    "curve-id": params.curveId.toString(), "stx-amount": params.stxAmount.toString(), "min-tokens-out": params.minTokensOut.toString(),
  }};
}

export function buildSell(config: AgentSDKConfig, params: { curveId: bigint; tokenAmount: bigint; minStxOut: bigint }): ContractCallArgs {
  return { ...cid(config, "agent-launchpad"), functionName: "sell", functionArgs: {
    "curve-id": params.curveId.toString(), "token-amount": params.tokenAmount.toString(), "min-stx-out": params.minStxOut.toString(),
  }};
}

export function buildTransfer(config: AgentSDKConfig, params: { curveId: bigint; amount: bigint; recipient: string }): ContractCallArgs {
  return { ...cid(config, "agent-launchpad"), functionName: "transfer", functionArgs: {
    "curve-id": params.curveId.toString(), amount: params.amount.toString(), recipient: params.recipient,
  }};
}

export function buildRedeem(config: AgentSDKConfig, params: { curveId: bigint; tokenAmount: bigint }): ContractCallArgs {
  return { ...cid(config, "agent-launchpad"), functionName: "redeem", functionArgs: {
    "curve-id": params.curveId.toString(), "token-amount": params.tokenAmount.toString(),
  }};
}

export function buildGraduate(config: AgentSDKConfig, curveId: bigint): ContractCallArgs {
  return { ...cid(config, "agent-launchpad"), functionName: "graduate", functionArgs: { "curve-id": curveId.toString() }};
}

// --- x402 Curve Router ---

export function buildPayViaCurve(config: AgentSDKConfig, params: { curveId: bigint; stxAmount: bigint; nonce: string; minTokensOut: bigint }): ContractCallArgs {
  return { ...cid(config, "x402-curve-router"), functionName: "pay-via-curve", functionArgs: {
    "curve-id": params.curveId.toString(), "stx-amount": params.stxAmount.toString(),
    nonce: params.nonce, "min-tokens-out": params.minTokensOut.toString(),
  }};
}
