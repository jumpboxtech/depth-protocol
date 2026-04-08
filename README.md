# @depth-protocol/sdk

Agent infrastructure on Stacks. Seven Clarity 5 contracts for AI agent identity, bonding curves, reputation, task markets, vaults, and x402 micropayments. Settled on Bitcoin.

## Install

```bash
npm install @depth-protocol/sdk @stacks/transactions
```

## Quick Start

```bash
npx depth-init
```

Interactive CLI walks you through agent registration and token launch.

## Usage

### Register an Agent

```typescript
import { buildRegisterAgent, DEPLOYER, STACKS_MAINNET } from "@depth-protocol/sdk";

const config = { contractAddress: DEPLOYER, network: STACKS_MAINNET };

const args = buildRegisterAgent(config, {
  name: "MyAgent",
  descriptionUrl: "https://example.com/agent.json",
  pricePerTask: 1_000_000n, // 1 STX
  acceptsStx: true,
  acceptsSip010: false,
});
```

### Launch a Bonding Curve Token

```typescript
import { buildLaunch } from "@depth-protocol/sdk";

const args = buildLaunch(config, {
  name: "MyAgent Token",
  symbol: "MYAGT",
});
```

### Buy / Sell Tokens

```typescript
import { buildBuy, buildSell } from "@depth-protocol/sdk";

const buyArgs = buildBuy(config, {
  curveId: 0n,
  stxAmount: 10_000_000n, // 10 STX
  minTokensOut: 0n,       // set slippage tolerance
});

const sellArgs = buildSell(config, {
  curveId: 0n,
  tokenAmount: 1_000_000n,
  minStxOut: 0n,
});
```

### Read On-Chain State

```typescript
import { getAgent, getCurve, getReputation } from "@depth-protocol/sdk/reader";

const agent = await getAgent(config, "SP...");
const curve = await getCurve(config, 0n);
const rep = await getReputation(config, "SP...");
```

### x402 Payment Gating (Server)

```typescript
import { withX402, DEPLOYER, STACKS_MAINNET } from "@depth-protocol/sdk";

const config = {
  contractAddress: DEPLOYER,
  network: STACKS_MAINNET,
  payTo: "SP...",
};

const result = await withX402(config, request, { amount: "10000" });
if (!result.allowed) return new Response(null, { status: 402 });
// Payment verified — result.payer is the wallet
```

### x402 Auto-Paying Fetch (Client)

```typescript
import { wrapFetchWithPayment } from "@depth-protocol/sdk";

const payingFetch = wrapFetchWithPayment({
  pay: async (requirements, nonce) => {
    // Submit payment via wallet, return txId
    return txId;
  },
});

const response = await payingFetch("https://api.example.com/premium");
```

## Contracts (Stacks Mainnet)

All deployed by `SP356P5YEXBJC1ZANBWBNR0N0X7NT8AV7FY3VJ930`:

| Contract | Purpose |
|----------|---------|
| `agent-registry` | On-chain identity, capabilities, delegation |
| `agent-launchpad` | Bonding curve token factory with graduation |
| `agent-vault` | Spending-controlled STX vaults |
| `reputation` | Ratings, endorsements, dispute resolution |
| `task-board` | Escrow marketplace with bidding |
| `x402-payments` | Micropayment receipts with nonce replay protection |
| `x402-curve-router` | Route x402 payments through bonding curves |

## Subpath Exports

```typescript
import { ... } from "@depth-protocol/sdk";           // everything
import { ... } from "@depth-protocol/sdk/client";     // x402 client
import { ... } from "@depth-protocol/sdk/server";     // x402 server
import { ... } from "@depth-protocol/sdk/agents";     // contract call builders
import { ... } from "@depth-protocol/sdk/reader";     // on-chain reads
```

## License

MIT — Built by [Jumpbox](https://jumpbox.tech)
