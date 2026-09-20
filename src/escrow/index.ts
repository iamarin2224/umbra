// ─── Umbra ZK Escrow Domain Module ──────────────────────────────────────────
// Barrel export for types, witnesses, private-state, contract, service, verification, and indexer.

// ─── Domain Types ───────────────────────────────────────────────────────────
export {
    EscrowState,
    ESCROW_STATE_LABELS,
    type EscrowParams,
    type EscrowCommitment,
    type EscrowRecord,
    type EscrowDeploymentResult,
    type EscrowActionResult,
    type EscrowWitnesses,
    type CreateEscrowRequest,
    type EscrowActionRequest,
    type EscrowFilter,
    type OnChainEscrowState,
    type EscrowTransaction,
    type VerificationResult,
    type SettlementProof,
} from "./types";

// ─── Witnesses ──────────────────────────────────────────────────────────────
export {
    createEscrowWitnesses,
    createWitnessesFromRecord,
    generateSecret,
    generateSalt,
} from "./witnesses";

// ─── Private State ──────────────────────────────────────────────────────────
export {
    type PrivateEscrowState,
    serializePrivateState,
    deserializePrivateState,
    savePrivateState,
    loadPrivateState,
    removePrivateState,
    listPrivateStateIds,
    savePrivateStateMemory,
    loadPrivateStateMemory,
    removePrivateStateMemory,
    clearMemoryState,
    createInitialPrivateState,
    updatePrivateState,
} from "./private-state";

// ─── Contract ───────────────────────────────────────────────────────────────
export {
    loadEscrowContract,
    CIRCUITS,
    LEDGER_FIELDS,
    VALID_TRANSITIONS,
    isValidTransition,
    getValidCircuits,
    type CompiledEscrowContract,
    type ContractInfo,
    type CircuitName,
} from "./contract";

// ─── Service ────────────────────────────────────────────────────────────────
export {
    deployEscrow,
    depositFunds,
    confirmDelivery,
    releaseFunds,
    raiseDispute,
    resolveDispute,
    cancelEscrow,
    getEscrow,
    getEscrowAsync,
    listEscrows,
    listEscrowsAsync,
    getEscrowPrivateState,
    removeEscrow,
    clearAllEscrows,
} from "./service";

// ─── Verification ───────────────────────────────────────────────────────────
export {
    verifyStateTransition,
    verifyAddressCommitment,
    verifyAmount,
    verifyCondition,
    computeEscrowHash,
    validateEscrowRecord,
} from "./verification";

// ─── Indexer ────────────────────────────────────────────────────────────────
export {
    fetchEscrowState,
    fetchEscrowTransactions,
    fetchLatestBlock,
    contractExists,
    getEscrowSummary,
} from "./indexer";
