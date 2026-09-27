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
    type EscrowActionType,
    type EscrowActionParams,
    type EscrowEvent,
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

// ─── Chain Gateway & Repository ─────────────────────────────────────────────
export {
    type ChainGateway,
    type ChainGatewayDeployParams,
    type ChainGatewayDeployResult,
    type ChainGatewayCallParams,
    type ChainGatewayCallResult,
    createMidnightChainGateway,
} from "./gateway";

export {
    type EscrowRepository,
    createSupabaseEscrowRepository,
    isSupabaseConfigured,
} from "./repository";

// ─── Service ────────────────────────────────────────────────────────────────
export {
    EscrowError,
    type EscrowServiceDeps,
    configureEscrowService,
    getEscrowServiceDeps,
    resetEscrowService,
    privateStateIdFor,
    deployEscrow,
    executeEscrowAction,
    getEscrow,
    getEscrowOrThrow,
    listEscrows,
    listEvents,
    removeEscrow,
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
