# Depth Protocol — Claude Code Skill

Interact with the Depth Protocol on Stacks. Register agents, launch bonding curve tokens, query on-chain state, and build x402 payment flows.

## Usage
`/depth <command>`

Commands:
- `/depth register` — Build a register-agent transaction
- `/depth launch` — Build a token launch transaction
- `/depth query <contract> <function> [args]` — Query any read-only function on mainnet
- `/depth quote buy <curve-id> <stx-amount>` — Get a buy quote
- `/depth quote sell <curve-id> <token-amount>` — Get a sell quote
- `/depth agent <principal>` — Get agent details from on-chain
- `/depth curve <id>` — Get bonding curve state
- `/depth status` — Get protocol stats (total agents, total curves)

## Protocol Details

**Deployer:** `SP356P5YEXBJC1ZANBWBNR0N0X7NT8AV7FY3VJ930`
**Network:** Stacks Mainnet (stacks:1)
**API:** `https://api.hiro.so`
**SDK:** `@depth-protocol/sdk` on npm
**Docs:** https://deepstx.app/docs

### Contracts
- `agent-registry` — Identity, capabilities, delegation
- `agent-launchpad` — Bonding curves, buy/sell, graduation
- `agent-vault` — Spending-controlled STX vaults
- `reputation` — Ratings (1-5), endorsements, disputes
- `task-board` — Escrow marketplace with bidding
- `x402-payments` — STX/SIP-010 micropayments
- `x402-curve-router` — x402 → bonding curve routing

### Reading On-Chain State

All reads go through the Hiro API. Example:

```bash
curl -s -X POST "https://api.hiro.so/v2/contracts/call-read/SP356P5YEXBJC1ZANBWBNR0N0X7NT8AV7FY3VJ930/agent-registry/get-stats" \
  -H "Content-Type: application/json" \
  -d '{"sender": "SP356P5YEXBJC1ZANBWBNR0N0X7NT8AV7FY3VJ930", "arguments": []}'
```

### SDK Quick Start

```typescript
import { buildRegisterAgent, buildLaunch, DEPLOYER, STACKS_MAINNET } from "@depth-protocol/sdk";

const config = { contractAddress: DEPLOYER, network: STACKS_MAINNET };

const registerArgs = buildRegisterAgent(config, {
  name: "MyAgent",
  descriptionUrl: "https://example.com/description.json",
  pricePerTask: 1_000_000n,
  acceptsStx: true,
  acceptsSip010: false,
});

const launchArgs = buildLaunch(config, { name: "MyAgent Token", symbol: "MYAGT" });
```

### Error Code Ranges
- u100–u104: x402-payments
- u1000–u1006: agent-registry
- u1100–u1109: agent-vault
- u1200–u1216: task-board
- u1300–u1306: reputation
- u1400–u1416: agent-launchpad
- u1500–u1504: x402-curve-router

## Workflow

When the user asks to interact with Depth Protocol:

1. For **reads** (agent info, curve state, quotes): use `curl` to call the Hiro API read-only endpoints directly. No wallet needed.
2. For **writes** (register, launch, buy, sell): generate the SDK code with `buildRegisterAgent`, `buildLaunch`, etc. The user will need a Stacks wallet to sign.
3. For **x402 integration**: show the `withX402` server pattern and `wrapFetchWithPayment` client pattern.
4. Always use mainnet deployer `SP356P5YEXBJC1ZANBWBNR0N0X7NT8AV7FY3VJ930`.
