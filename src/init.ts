#!/usr/bin/env node

/**
 * depth-init — Initialize an agent on the Depth Protocol
 *
 * Works with any runtime: Node.js, Bun, Deno
 *
 * Usage:
 *   npx @depth-protocol/sdk init
 *   bunx @depth-protocol/sdk init
 *   deno run npm:@depth-protocol/sdk/init
 *
 * Interactive prompts collect agent details, then outputs
 * the exact contract calls needed to register + launch.
 */

import {
  DEPLOYER,
  STACKS_MAINNET,
  STACKS_TESTNET,
  MAINNET_API,
  TESTNET_API,
} from "./types.js";

import readline from "node:readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q: string): Promise<string> {
  return new Promise((r) => rl.question(q, r));
}

async function main() {
  console.log(`
  ┌─────────────────────────────────────┐
  │     depth-init                      │
  │     Agent Infrastructure on Stacks  │
  └─────────────────────────────────────┘
  `);

  const network = await ask("  Network (mainnet/testnet) [mainnet]: ") || "mainnet";
  const isMainnet = network !== "testnet";

  console.log();
  console.log("  --- Agent Identity ---");
  const name = await ask("  Agent name (max 64 chars): ");
  if (!name.trim()) { console.log("  Name required."); process.exit(1); }

  const descUrl = await ask("  Description URL [https://deepstx.app]: ") || "https://deepstx.app";
  const priceStr = await ask("  Price per task in STX [1.00]: ") || "1.00";
  const price = Math.floor(parseFloat(priceStr) * 1_000_000);
  const acceptsStx = (await ask("  Accepts STX? (y/n) [y]: ") || "y") === "y";
  const acceptsSip010 = (await ask("  Accepts SIP-010 tokens? (y/n) [n]: ") || "n") === "y";

  console.log();
  console.log("  --- Token Details ---");
  const tokenName = await ask("  Token name: ");
  if (!tokenName.trim()) { console.log("  Token name required."); process.exit(1); }

  const tokenSymbol = (await ask("  Token symbol (max 10 chars): ")).toUpperCase();
  if (!tokenSymbol.trim()) { console.log("  Symbol required."); process.exit(1); }

  rl.close();

  const contractAddress = DEPLOYER;
  const api = isMainnet ? MAINNET_API : TESTNET_API;
  const networkId = isMainnet ? STACKS_MAINNET : STACKS_TESTNET;

  console.log(`
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Agent: ${name.trim()}
  Token: ${tokenName.trim()} ($${tokenSymbol})
  Price: ${priceStr} STX per task
  Network: ${isMainnet ? "Stacks Mainnet" : "Stacks Testnet"}

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  // Output the integration code
  console.log(`  Copy this into your project:

  ─────────────────────────────────────
  install:
    npm install @depth-protocol/sdk @stacks/transactions
  ─────────────────────────────────────`);

  const code = `
import {
  buildRegisterAgent,
  buildLaunch,
  DEPLOYER,
  STACKS_${isMainnet ? "MAINNET" : "TESTNET"},
} from "@depth-protocol/sdk";

const config = {
  contractAddress: DEPLOYER,
  network: STACKS_${isMainnet ? "MAINNET" : "TESTNET"},
  apiUrl: "${api}",
};

// Step 1: Register your agent on-chain
const registerArgs = buildRegisterAgent(config, {
  name: "${name.trim()}",
  descriptionUrl: "${descUrl}",
  pricePerTask: ${price}n,
  acceptsStx: ${acceptsStx},
  acceptsSip010: ${acceptsSip010},
});

// Step 2: Launch bonding curve token
const launchArgs = buildLaunch(config, {
  name: "${tokenName.trim()}",
  symbol: "${tokenSymbol}",
});

// Submit via @stacks/transactions or Leather wallet:
// makeContractCall(registerArgs) → broadcast
// makeContractCall(launchArgs)   → broadcast

console.log("Register:", registerArgs);
console.log("Launch:", launchArgs);
`;

  console.log(code);

  // Also output a standalone script they can run directly
  console.log(`  ─────────────────────────────────────
  Or run the full registration script:
  ─────────────────────────────────────`);

  const script = `
import { makeContractCall, broadcastTransaction } from "@stacks/transactions";
import { generateWallet } from "@stacks/wallet-sdk";
import {
  buildRegisterAgent,
  buildLaunch,
  DEPLOYER,
  STACKS_${isMainnet ? "MAINNET" : "TESTNET"},
} from "@depth-protocol/sdk";

const MNEMONIC = process.env.STACKS_MNEMONIC;
if (!MNEMONIC) { console.error("Set STACKS_MNEMONIC env var"); process.exit(1); }

const config = {
  contractAddress: DEPLOYER,
  network: STACKS_${isMainnet ? "MAINNET" : "TESTNET"},
};

async function main() {
  const wallet = await generateWallet({ secretKey: MNEMONIC, password: "" });
  const key = wallet.accounts[0].stxPrivateKey;

  // Register agent
  const regArgs = buildRegisterAgent(config, {
    name: "${name.trim()}",
    descriptionUrl: "${descUrl}",
    pricePerTask: ${price}n,
    acceptsStx: ${acceptsStx},
    acceptsSip010: ${acceptsSip010},
  });

  const regTx = await makeContractCall({
    ...regArgs,
    functionArgs: [], // encode with Cl helpers
    senderKey: key,
    network: "${isMainnet ? "mainnet" : "testnet"}",
    fee: 50000n,
  });
  const regResult = await broadcastTransaction({ transaction: regTx, network: "${isMainnet ? "mainnet" : "testnet"}" });
  console.log("Registered:", regResult.txid);

  // Launch token
  const launchArgs = buildLaunch(config, {
    name: "${tokenName.trim()}",
    symbol: "${tokenSymbol}",
  });

  const launchTx = await makeContractCall({
    ...launchArgs,
    functionArgs: [],
    senderKey: key,
    network: "${isMainnet ? "mainnet" : "testnet"}",
    fee: 50000n,
  });
  const launchResult = await broadcastTransaction({ transaction: launchTx, network: "${isMainnet ? "mainnet" : "testnet"}" });
  console.log("Launched:", launchResult.txid);
}

main();
`;

  console.log(script);
  console.log("  Done. Visit https://deepstx.app/explore to see your agent.\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
