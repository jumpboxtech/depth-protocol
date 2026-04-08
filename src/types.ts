/**
 * Depth Protocol SDK — Core Types
 *
 * x402 payment types (CAIP-2 network IDs, PaymentRequired/PaymentPayload)
 * and agent protocol types for Stacks blockchain.
 */

export const STACKS_MAINNET = "stacks:1" as const;
export const STACKS_TESTNET = "stacks:2147483648" as const;
export type StacksNetwork = typeof STACKS_MAINNET | typeof STACKS_TESTNET;

export const DEPLOYER = "SP356P5YEXBJC1ZANBWBNR0N0X7NT8AV7FY3VJ930";
export const MAINNET_API = "https://api.hiro.so";
export const TESTNET_API = "https://api.testnet.hiro.so";

// --- x402 Protocol ---

export interface ResourceInfo {
  url: string;
  description: string;
  mimeType: string;
}

export interface PaymentRequirements {
  scheme: "exact";
  network: StacksNetwork;
  asset: "STX" | string;
  amount: string;
  payTo: string;
  maxTimeoutSeconds: number;
  extra: {
    contractAddress: string;
    contractName: string;
  };
}

export interface PaymentRequired {
  x402Version: 2;
  error?: string;
  resource: ResourceInfo;
  accepts: PaymentRequirements[];
}

export interface PaymentPayload {
  x402Version: 2;
  resource: ResourceInfo;
  accepted: PaymentRequirements;
  payload: {
    txId: string;
    nonce: string;
  };
}

export interface VerifyResponse {
  isValid: boolean;
  invalidReason?: string;
  payer?: string;
  amount?: string;
  recipient?: string;
}

export interface PaymentReceipt {
  payer: string;
  recipient: string;
  amount: bigint;
  fee: bigint;
  block: bigint;
  isStx: boolean;
}

export interface X402ServerConfig {
  contractAddress: string;
  contractName?: string;
  apiUrl?: string;
  network: StacksNetwork;
  payTo: string;
}

export interface X402ClientConfig {
  apiUrl?: string;
  network: StacksNetwork;
}

export const HEADER_PAYMENT_REQUIRED = "PAYMENT-REQUIRED";
export const HEADER_PAYMENT_SIGNATURE = "PAYMENT-SIGNATURE";
export const HEADER_PAYMENT_RESPONSE = "PAYMENT-RESPONSE";

// --- Agent Protocol ---

export const STATUS_ACTIVE = 1;
export const STATUS_PAUSED = 2;
export const STATUS_DEREGISTERED = 3;
export type AgentStatus = typeof STATUS_ACTIVE | typeof STATUS_PAUSED | typeof STATUS_DEREGISTERED;

export interface AgentRecord {
  name: string;
  descriptionUrl: string;
  status: AgentStatus;
  registeredAt: bigint;
  totalTasks: bigint;
  totalEarned: bigint;
  pricePerTask: bigint;
  acceptsStx: boolean;
  acceptsSip010: boolean;
}

export interface AgentCapability { capability: string; }

export interface RegistryStats { totalAgents: bigint; admin: string; }

export interface VaultRecord {
  balance: bigint;
  perTxCap: bigint;
  dailyCap: bigint;
  dailySpent: bigint;
  lastResetBlock: bigint;
  createdAt: bigint;
}

export interface SpendLogEntry {
  spender: string;
  amount: bigint;
  block: bigint;
  memo: string;
}

export const TASK_OPEN = 1;
export const TASK_ASSIGNED = 2;
export const TASK_SUBMITTED = 3;
export const TASK_COMPLETED = 4;
export const TASK_DISPUTED = 5;
export const TASK_CANCELLED = 6;
export const TASK_EXPIRED = 7;
export type TaskStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface TaskRecord {
  poster: string;
  title: string;
  descriptionUrl: string;
  bounty: bigint;
  fee: bigint;
  assignedTo: string | null;
  status: TaskStatus;
  createdAt: bigint;
  deadline: bigint;
  submittedAt: bigint;
  completedAt: bigint;
  resultUrl: string;
}

export interface BidRecord { price: bigint; messageUrl: string; bidAt: bigint; }
export interface TaskStats { totalTasks: bigint; feeBps: bigint; admin: string; }
export interface TaskAttestation { agent: string; poster: string; }

export interface ReputationRecord {
  totalScore: bigint;
  ratingCount: bigint;
  tasksCompleted: bigint;
  tasksDisputed: bigint;
  endorsementCount: bigint;
}

export interface RatingRecord { agent: string; score: bigint; block: bigint; }
export interface EndorsementRecord { capability: string; block: bigint; }

export interface AgentSDKConfig {
  contractAddress: string;
  apiUrl?: string;
  network: StacksNetwork;
}

export const REGISTRY_ERRORS = {
  ALREADY_REGISTERED: 1000, NOT_REGISTERED: 1001, UNAUTHORIZED: 1002,
  NAME_TOO_LONG: 1003, TOO_MANY_CAPS: 1004, INVALID_STATUS: 1005, NOT_DELEGATE: 1006,
} as const;

export const VAULT_ERRORS = {
  NO_VAULT: 1100, VAULT_EXISTS: 1101, UNAUTHORIZED: 1102,
  EXCEEDED_TX_CAP: 1103, EXCEEDED_DAILY_CAP: 1104, INSUFFICIENT_FUNDS: 1105,
  NOT_WHITELISTED: 1106, ZERO_AMOUNT: 1107, AGENT_NOT_REGISTERED: 1108, CONTRACT_CALL: 1109,
} as const;

export const TASK_ERRORS = {
  TASK_NOT_FOUND: 1200, UNAUTHORIZED: 1201, INVALID_STATUS: 1202,
  ALREADY_BID: 1203, NOT_ASSIGNED: 1204, ZERO_BOUNTY: 1205, SELF_ASSIGN: 1206,
  NOT_REGISTERED: 1207, DISPUTE_WINDOW: 1208, ALREADY_DISPUTED: 1209,
  NOT_ADMIN: 1210, TASK_EXPIRED: 1211, INVALID_FEE: 1212, SPLIT_MISMATCH: 1213,
  NO_BID: 1214, TITLE_TOO_LONG: 1215, CONTRACT_CALL: 1216,
} as const;

export const REPUTATION_ERRORS = {
  NOT_AUTHORIZED: 1300, ALREADY_RATED: 1301, INVALID_SCORE: 1302,
  SELF_ENDORSEMENT: 1303, NOT_REGISTERED: 1304, NO_ATTESTATION: 1305, TASK_MISMATCH: 1306,
} as const;

export const LAUNCHPAD_ERRORS = {
  NOT_REGISTERED: 1400, ALREADY_LAUNCHED: 1401, CURVE_NOT_FOUND: 1402,
  GRADUATED: 1403, ZERO_AMOUNT: 1404, INSUFFICIENT_BALANCE: 1405,
  SLIPPAGE: 1406, NOT_ADMIN: 1407, OVERFLOW: 1408, SELF_TRANSFER: 1409,
  CONTRACT_CALL: 1410, INVALID_PARAMS: 1411, NOT_GRADUATED: 1412,
  SOLD_OUT: 1413, INVALID_FEE: 1414, PAUSED: 1415, UNAUTHORIZED: 1416,
} as const;
