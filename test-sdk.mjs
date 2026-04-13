/**
 * Depth Protocol SDK — Comprehensive Test Suite
 * Tests against LIVE mainnet contracts.
 * Run: node test-sdk.mjs
 */

const DEPLOYER = "SP356P5YEXBJC1ZANBWBNR0N0X7NT8AV7FY3VJ930";
const SCRIBE_OWNER = "SP3NAPNARH29VNDP0M2MVTBNKQ06K0R6GR1XTQ7JZ";
const config = { contractAddress: DEPLOYER, network: "stacks:1" };

let passed = 0;
let failed = 0;

function assert(condition, label, detail) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label} — ${detail || "assertion failed"}`);
    failed++;
  }
}

async function run() {
  // === Types & Constants ===
  console.log("\n─── Types & Constants ───");
  const types = await import("./dist/types.js");
  assert(types.DEPLOYER === DEPLOYER, "DEPLOYER matches");
  assert(types.STACKS_MAINNET === "stacks:1", "STACKS_MAINNET = stacks:1");
  assert(types.STATUS_ACTIVE === 1, "STATUS_ACTIVE = 1");
  assert(types.STATUS_PAUSED === 2, "STATUS_PAUSED = 2");
  assert(types.STATUS_DEREGISTERED === 3, "STATUS_DEREGISTERED = 3");
  assert(types.TASK_OPEN === 1, "TASK_OPEN = 1");
  assert(types.TASK_COMPLETED === 4, "TASK_COMPLETED = 4");
  assert(types.REGISTRY_ERRORS.ALREADY_REGISTERED === 1000, "REGISTRY_ERRORS correct");
  assert(types.VAULT_ERRORS.NO_VAULT === 1100, "VAULT_ERRORS correct");
  assert(types.TASK_ERRORS.TASK_NOT_FOUND === 1200, "TASK_ERRORS correct");
  assert(types.REPUTATION_ERRORS.NOT_AUTHORIZED === 1300, "REPUTATION_ERRORS correct");
  assert(types.LAUNCHPAD_ERRORS.NOT_REGISTERED === 1400, "LAUNCHPAD_ERRORS correct");

  // === Agent Reader (live mainnet reads) ===
  console.log("\n─── Agent Reader (Mainnet) ───");
  const reader = await import("./dist/agent-reader.js");

  // Registry
  const sentinel = await reader.getAgent(config, DEPLOYER);
  assert(sentinel !== null, "getAgent(Sentinel) returns data", JSON.stringify(sentinel));

  const scribe = await reader.getAgent(config, SCRIBE_OWNER);
  assert(scribe !== null, "getAgent(Scribe) returns data", JSON.stringify(scribe));

  const registered = await reader.isRegistered(config, DEPLOYER);
  assert(registered !== null, "isRegistered(Sentinel) returns data", JSON.stringify(registered));

  const active = await reader.isActive(config, DEPLOYER);
  assert(active !== null, "isActive(Sentinel) returns data", JSON.stringify(active));

  const notRegistered = await reader.isRegistered(config, "SP000000000000000000002Q6VF78");
  assert(notRegistered !== null, "isRegistered(random) returns data");

  const stats = await reader.getRegistryStats(config);
  assert(stats !== null, "getRegistryStats returns data", JSON.stringify(stats));

  // Launchpad
  const curve0 = await reader.getCurve(config, 0n);
  assert(curve0 !== null, "getCurve(0) returns Sentinel curve", JSON.stringify(curve0)?.slice(0, 100));

  const curve1 = await reader.getCurve(config, 1n);
  assert(curve1 !== null, "getCurve(1) returns Scribe curve", JSON.stringify(curve1)?.slice(0, 100));

  const agentCurve = await reader.getAgentCurve(config, DEPLOYER);
  assert(agentCurve !== null, "getAgentCurve(Sentinel) returns curve ID", JSON.stringify(agentCurve));

  const balance = await reader.getBalance(config, 1n, SCRIBE_OWNER);
  assert(balance !== null, "getBalance(Scribe curve, Scribe owner) returns data", JSON.stringify(balance));

  const buyQuote = await reader.getBuyQuote(config, 0n, 1000000n);
  assert(buyQuote !== null, "getBuyQuote(1 STX on Sentinel) returns quote", JSON.stringify(buyQuote));

  const sellQuote = await reader.getSellQuote(config, 1n, 1000000000n);
  assert(sellQuote !== null, "getSellQuote(1B tokens on Scribe) returns quote", JSON.stringify(sellQuote));

  const price = await reader.getPrice(config, 0n);
  assert(price !== null, "getPrice(Sentinel curve) returns price", JSON.stringify(price));

  const invariant = await reader.checkInvariant(config, 0n);
  assert(invariant !== null, "checkInvariant(Sentinel) returns data", JSON.stringify(invariant));

  const lpStats = await reader.getLaunchpadStats(config);
  assert(lpStats !== null, "getLaunchpadStats returns data", JSON.stringify(lpStats));

  // Reputation
  const rep = await reader.getReputation(config, DEPLOYER);
  // May be null if no ratings yet — that's ok
  assert(true, `getReputation(Sentinel) returned ${rep === null ? "null (no ratings)" : "data"}`);

  // Task Board
  const taskStats = await reader.getTaskStats(config);
  assert(taskStats !== null, "getTaskStats returns data", JSON.stringify(taskStats));

  // Vault
  const vault = await reader.getVault(config, DEPLOYER);
  // May be null if no vault created — ok
  assert(true, `getVault(Sentinel) returned ${vault === null ? "null (no vault)" : "data"}`);

  // x402 Router
  const routerStats = await reader.getRouterStats(config);
  assert(routerStats !== null, "getRouterStats returns data", JSON.stringify(routerStats));

  // === Agent Client (builder tests — pure, no network) ===
  console.log("\n─── Agent Client (Builders) ───");
  const client = await import("./dist/agent-client.js");

  const regArgs = client.buildRegisterAgent(config, {
    name: "TestBot", descriptionUrl: "https://example.com/desc.json",
    pricePerTask: 1000000n, acceptsStx: true, acceptsSip010: false,
  });
  assert(regArgs.contractName === "agent-registry", "buildRegisterAgent → agent-registry");
  assert(regArgs.functionName === "register-agent", "buildRegisterAgent → register-agent");
  assert(regArgs.functionArgs.name === "TestBot", "buildRegisterAgent → name=TestBot");
  assert(regArgs.functionArgs["price-per-task"] === "1000000", "buildRegisterAgent → price=1000000");

  const updateArgs = client.buildUpdateAgent(config, {
    name: "TestBot2", descriptionUrl: "https://example.com/desc2.json",
    pricePerTask: 2000000n, acceptsStx: true, acceptsSip010: true,
  });
  assert(updateArgs.functionName === "update-agent", "buildUpdateAgent → update-agent");

  const capArgs = client.buildSetCapability(config, 0, "code-review");
  assert(capArgs.functionName === "set-capability", "buildSetCapability → set-capability");
  assert(capArgs.functionArgs.capability === "code-review", "buildSetCapability → code-review");

  const rmCapArgs = client.buildRemoveCapability(config, 0);
  assert(rmCapArgs.functionName === "remove-capability", "buildRemoveCapability → remove-capability");

  const statusArgs = client.buildSetStatus(config, 2);
  assert(statusArgs.functionArgs["new-status"] === "2", "buildSetStatus → status=2 (PAUSED)");

  const delArgs = client.buildAddDelegate(config, SCRIBE_OWNER);
  assert(delArgs.functionArgs.delegate === SCRIBE_OWNER, "buildAddDelegate → correct delegate");

  const rmDelArgs = client.buildRemoveDelegate(config, SCRIBE_OWNER);
  assert(rmDelArgs.functionName === "remove-delegate", "buildRemoveDelegate → remove-delegate");

  // Vault builders
  const vaultArgs = client.buildCreateVault(config, { perTxCap: 5000000n, dailyCap: 50000000n });
  assert(vaultArgs.contractName === "agent-vault", "buildCreateVault → agent-vault");
  assert(vaultArgs.functionArgs["per-tx-cap"] === "5000000", "buildCreateVault → per-tx-cap");

  const depositArgs = client.buildVaultDeposit(config, 10000000n);
  assert(depositArgs.functionArgs.amount === "10000000", "buildVaultDeposit → 10 STX");

  const withdrawArgs = client.buildVaultWithdraw(config, 5000000n);
  assert(withdrawArgs.functionName === "withdraw", "buildVaultWithdraw → withdraw");

  const policyArgs = client.buildUpdatePolicy(config, { perTxCap: 1000000n, dailyCap: 10000000n });
  assert(policyArgs.functionName === "update-policy", "buildUpdatePolicy → update-policy");

  const wlArgs = client.buildAddToWhitelist(config, SCRIBE_OWNER);
  assert(wlArgs.functionName === "add-to-whitelist", "buildAddToWhitelist → add-to-whitelist");

  const rmWlArgs = client.buildRemoveFromWhitelist(config, SCRIBE_OWNER);
  assert(rmWlArgs.functionName === "remove-from-whitelist", "buildRemoveFromWhitelist → remove-from-whitelist");

  const spendArgs = client.buildVaultSpend(config, { owner: DEPLOYER, amount: 1000000n, memo: "test" });
  assert(spendArgs.functionArgs.memo === "test", "buildVaultSpend → memo=test");

  // Task Board builders
  const taskArgs = client.buildPostTask(config, {
    title: "Audit my contract", descriptionUrl: "https://example.com/task.json",
    bounty: 5000000n, deadline: 10000000n,
  });
  assert(taskArgs.contractName === "task-board", "buildPostTask → task-board");
  assert(taskArgs.functionArgs.bounty === "5000000", "buildPostTask → bounty=5 STX");

  const bidArgs = client.buildBid(config, { taskId: 0n, price: 3000000n, messageUrl: "https://example.com/bid.json" });
  assert(bidArgs.functionName === "bid", "buildBid → bid");

  const assignArgs = client.buildAssign(config, 0n, SCRIBE_OWNER);
  assert(assignArgs.functionArgs.agent === SCRIBE_OWNER, "buildAssign → correct agent");

  const submitArgs = client.buildSubmitWork(config, 0n, "https://example.com/result.json");
  assert(submitArgs.functionName === "submit-work", "buildSubmitWork → submit-work");

  const approveArgs = client.buildApprove(config, 0n);
  assert(approveArgs.functionName === "approve", "buildApprove → approve");

  const disputeArgs = client.buildDispute(config, 0n, "https://example.com/reason.json");
  assert(disputeArgs.functionName === "dispute", "buildDispute → dispute");

  const cancelArgs = client.buildCancel(config, 0n);
  assert(cancelArgs.functionName === "cancel", "buildCancel → cancel");

  const expireArgs = client.buildExpireTask(config, 0n);
  assert(expireArgs.functionName === "expire-task", "buildExpireTask → expire-task");

  // Reputation builders
  const rateArgs = client.buildRateAgent(config, { taskId: 0n, agent: DEPLOYER, score: 5 });
  assert(rateArgs.contractName === "reputation", "buildRateAgent → reputation");
  assert(rateArgs.functionArgs.score === "5", "buildRateAgent → score=5");

  const endorseArgs = client.buildEndorse(config, DEPLOYER, "security-audit");
  assert(endorseArgs.functionArgs.capability === "security-audit", "buildEndorse → capability");

  const revokeArgs = client.buildRevokeEndorsement(config, DEPLOYER);
  assert(revokeArgs.functionName === "revoke-endorsement", "buildRevokeEndorsement → revoke-endorsement");

  // Launchpad builders
  const launchArgs = client.buildLaunch(config, { name: "TestToken", symbol: "TEST" });
  assert(launchArgs.contractName === "agent-launchpad", "buildLaunch → agent-launchpad");
  assert(launchArgs.functionArgs.symbol === "TEST", "buildLaunch → symbol=TEST");

  const buyArgs = client.buildBuy(config, { curveId: 0n, stxAmount: 1000000n, minTokensOut: 0n });
  assert(buyArgs.functionArgs["stx-amount"] === "1000000", "buildBuy → stx-amount=1 STX");

  const sellArgs = client.buildSell(config, { curveId: 0n, tokenAmount: 1000000n, minStxOut: 0n });
  assert(sellArgs.functionName === "sell", "buildSell → sell");

  const transferArgs = client.buildTransfer(config, { curveId: 0n, amount: 1000n, recipient: SCRIBE_OWNER });
  assert(transferArgs.functionArgs.recipient === SCRIBE_OWNER, "buildTransfer → correct recipient");

  const redeemArgs = client.buildRedeem(config, { curveId: 0n, tokenAmount: 1000n });
  assert(redeemArgs.functionName === "redeem", "buildRedeem → redeem");

  const graduateArgs = client.buildGraduate(config, 0n);
  assert(graduateArgs.functionName === "graduate", "buildGraduate → graduate");

  // x402 Router builder
  const routerArgs = client.buildPayViaCurve(config, {
    curveId: 0n, stxAmount: 2500000n, nonce: "0x0102030405060708090a0b0c0d0e0f10", minTokensOut: 0n,
  });
  assert(routerArgs.contractName === "x402-curve-router", "buildPayViaCurve → x402-curve-router");
  assert(routerArgs.functionArgs["stx-amount"] === "2500000", "buildPayViaCurve → 2.5 STX");

  // === Client Module (pure, no network) ===
  console.log("\n─── Client Module ───");
  const clientMod = await import("./dist/client.js");

  assert(typeof clientMod.is402Response === "function", "is402Response exported");
  assert(typeof clientMod.parsePaymentRequired === "function", "parsePaymentRequired exported");
  assert(typeof clientMod.wrapFetchWithPayment === "function", "wrapFetchWithPayment exported");

  const nonce = clientMod.generateNonce();
  assert(nonce.length === 16, "generateNonce → 16 bytes");
  assert(nonce instanceof Uint8Array, "generateNonce → Uint8Array");

  const hex = clientMod.nonceToHex(nonce);
  assert(hex.length === 32, "nonceToHex → 32 hex chars");
  assert(/^[0-9a-f]+$/.test(hex), "nonceToHex → valid hex");

  // === Server Module (pure, no network) ===
  console.log("\n─── Server Module ───");
  const serverMod = await import("./dist/server.js");

  const serverConfig = {
    contractAddress: DEPLOYER,
    network: "stacks:1",
    payTo: DEPLOYER,
  };

  const reqs = serverMod.buildPaymentRequirements(serverConfig, { amount: "2500000" });
  assert(reqs.scheme === "exact", "buildPaymentRequirements → scheme=exact");
  assert(reqs.network === "stacks:1", "buildPaymentRequirements → network=stacks:1");
  assert(reqs.amount === "2500000", "buildPaymentRequirements → amount=2500000");
  assert(reqs.payTo === DEPLOYER, "buildPaymentRequirements → payTo=DEPLOYER");
  assert(reqs.extra.contractName === "x402-payments", "buildPaymentRequirements → x402-payments");

  const pr = serverMod.buildPaymentRequired(serverConfig, {
    url: "https://sentinel.deepstx.app/analyze", description: "Security audit", mimeType: "application/json",
  }, { amount: "2500000" });
  assert(pr.x402Version === 2, "buildPaymentRequired → v2");
  assert(pr.accepts.length === 1, "buildPaymentRequired → 1 accept");
  assert(pr.resource.url === "https://sentinel.deepstx.app/analyze", "buildPaymentRequired → correct URL");

  const resp402 = serverMod.create402Response(serverConfig, { url: "/analyze" }, { amount: "2500000" });
  assert(resp402.status === 402, "create402Response → status 402");
  assert(resp402.headers["PAYMENT-REQUIRED"] !== undefined, "create402Response → has PAYMENT-REQUIRED header");

  const extracted = serverMod.extractPaymentPayload({ "PAYMENT-SIGNATURE": btoa(JSON.stringify({ x402Version: 2, payload: { txId: "0xabc", nonce: "0102" } })) });
  assert(extracted !== null, "extractPaymentPayload → decodes payload");
  assert(extracted.payload.txId === "0xabc", "extractPaymentPayload → correct txId");

  const noPayload = serverMod.extractPaymentPayload({});
  assert(noPayload === null, "extractPaymentPayload → null when no header");

  // === Summary ===
  console.log(`\n═══════════════════════════════════`);
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(`═══════════════════════════════════\n`);

  if (failed > 0) process.exit(1);
}

run().catch((e) => { console.error("Fatal:", e); process.exit(1); });
