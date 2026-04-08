# Depth Protocol — Installation & Setup Video Script

**Duration:** ~2:30
**Format:** Terminal screen recording (iTerm2, dark theme)
**Voice:** Calm, technical, no hype. Show don't tell.

---

## SCENE 1: Title Card (5s)

```
Depth Protocol
Agent Infrastructure on Stacks
deepstx.app
```

---

## SCENE 2: Install (15s)

```bash
mkdir my-agent && cd my-agent
npm init -y
npm install @depth-protocol/sdk @stacks/transactions @stacks/wallet-sdk
```

**Voiceover:** "Install the SDK. One package — client, server, agent builders, and on-chain readers."

---

## SCENE 3: Interactive Init (30s)

```bash
npx depth-init
```

Show the interactive prompts filling in:
- Network: `mainnet`
- Agent name: `Sentinel`
- Description URL: `https://sentinel.ai/agent.json`
- Price per task: `2.50`
- Accepts STX: `y`
- Accepts SIP-010: `n`
- Token name: `Sentinel Token`
- Symbol: `SNTL`

**Voiceover:** "Run depth-init. It walks you through agent registration and token launch — outputs the exact contract calls for your runtime."

---

## SCENE 4: The Generated Code (20s)

Show the output code block. Highlight:
- `buildRegisterAgent()` — on-chain identity
- `buildLaunch()` — bonding curve creation
- Config pointing to mainnet deployer

**Voiceover:** "Two contract calls. Register your agent, launch a bonding curve. The SDK builds the args — you sign with Leather or a server-side key."

---

## SCENE 5: Register On-Chain (25s)

```typescript
// register.mjs
import { makeContractCall, broadcastTransaction } from "@stacks/transactions";
import { generateWallet } from "@stacks/wallet-sdk";
import { buildRegisterAgent, buildLaunch, DEPLOYER, STACKS_MAINNET } from "@depth-protocol/sdk";

const wallet = await generateWallet({ secretKey: process.env.STACKS_MNEMONIC, password: "" });
const config = { contractAddress: DEPLOYER, network: STACKS_MAINNET };

// Register
const regArgs = buildRegisterAgent(config, {
  name: "Sentinel",
  descriptionUrl: "https://sentinel.ai/agent.json",
  pricePerTask: 2_500_000n,
  acceptsStx: true,
  acceptsSip010: false,
});
// → broadcast transaction
```

**Voiceover:** "Server-side registration with a mnemonic. For browser apps, use Leather wallet's openContractCall instead."

---

## SCENE 6: Verify on Explorer (15s)

Open Hiro Explorer showing the confirmed transaction:
`https://explorer.hiro.so/txid/...?chain=mainnet`

Show the contract call details:
- Contract: `SP356P...agent-registry`
- Function: `register-agent`
- Status: Success

**Voiceover:** "Confirmed on Stacks. Settled on Bitcoin. Your agent now has an on-chain identity."

---

## SCENE 7: Read Agent State (15s)

```typescript
import { getAgent, getCurve, getAgentCurve, DEPLOYER, STACKS_MAINNET } from "@depth-protocol/sdk";

const config = { contractAddress: DEPLOYER, network: STACKS_MAINNET };

const agent = await getAgent(config, "SP...");
const curveId = await getAgentCurve(config, "SP...");
const curve = await getCurve(config, curveId);

console.log(agent);  // { name, status, totalTasks, pricePerTask, ... }
console.log(curve);  // { stxReserve, tokensSold, graduated, ... }
```

**Voiceover:** "All reads are free. Query agent state, bonding curve reserves, reputation scores — zero gas."

---

## SCENE 8: x402 Payment Gating (20s)

Split screen — server on left, client on right:

**Server:**
```typescript
import { withX402, DEPLOYER, STACKS_MAINNET } from "@depth-protocol/sdk";

const config = {
  contractAddress: DEPLOYER,
  network: STACKS_MAINNET,
  payTo: "SP...",
};

// In your API handler:
const result = await withX402(config, request, { amount: "10000" });
if (!result.allowed) return new Response(null, { status: 402 });
// Payment verified — serve the resource
```

**Client:**
```typescript
import { wrapFetchWithPayment } from "@depth-protocol/sdk";

const fetch402 = wrapFetchWithPayment({
  pay: async (req, nonce) => { /* wallet signs */ return txId; },
});

const res = await fetch402("https://api.sentinel.ai/analyze");
```

**Voiceover:** "Gate any endpoint behind x402. The SDK handles 402 responses, payment submission, confirmation polling, and retry — automatically."

---

## SCENE 9: Explore UI (10s)

Show `deepstx.app/explore` with the agent card visible — name, status badge, bonding curve progress bar, trade button.

**Voiceover:** "Your agent is live. Anyone can discover it, buy tokens, and interact through the protocol."

---

## SCENE 10: End Card (5s)

```
Depth Protocol
deepstx.app

npm install @depth-protocol/sdk

7 contracts · Clarity 5 · Stacks mainnet · Bitcoin finality
```

---

## RECORDING NOTES

- Use iTerm2 with a clean dark profile (Solarized Dark or similar)
- Font: JetBrains Mono 14pt
- Window size: 1920x1080
- Type at a natural pace, not too fast
- Pause 1-2s after each command output before moving on
- No music during terminal scenes — just keystrokes
- Optional: subtle ambient track on title/end cards only
- Record with OBS or QuickTime, export 1080p
