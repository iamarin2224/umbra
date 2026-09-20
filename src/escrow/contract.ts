import path from "node:path";
import type { EscrowState } from "./types";

// ─── Contract Bindings & Metadata ───────────────────────────────────────────
// Manages artifact loading, circuit definitions, and state transition validation.

const ARTIFACTS_BASE_DIR = path.resolve(
    import.meta.dirname ?? process.cwd(),
    "../../artifacts",
);

const ESCROW_CONTRACT_NAME = "umbra";

export interface CompiledEscrowContract {
    contract: unknown;
    info: ContractInfo;
}

export interface ContractInfo {
    name: string;
    version: string;
    circuits: string[];
    ledgerFields: string[];
}

// ─── Contract Artifact Loader ───────────────────────────────────────────────

/**
 * Loads the compiled escrow contract artifacts.
 * Throws if artifacts are missing — ensure artifacts are synchronized or compiled.
 */
export async function loadEscrowContract(): Promise<CompiledEscrowContract> {
    const compactContractPath = path.join(ARTIFACTS_BASE_DIR, `${ESCROW_CONTRACT_NAME}.compact`);
    const contractInfoPath = path.join(ARTIFACTS_BASE_DIR, `${ESCROW_CONTRACT_NAME}.json`);

    let loadedContract: unknown;
    let contractInfo: ContractInfo;

    try {
        loadedContract = await import(compactContractPath);
    } catch {
        throw new Error(
            `Failed to load contract artifacts from ${compactContractPath}. ` +
                `Ensure contract artifacts are compiled in artifacts directory.`,
        );
    }

    try {
        const infoModule = await import(contractInfoPath);
        contractInfo = infoModule.default ?? infoModule;
    } catch {
        // Fallback: construct info matching standard escrow circuits and ledger definitions
        contractInfo = {
            name: ESCROW_CONTRACT_NAME,
            version: "1.0.0",
            circuits: [
                "constructor",
                "deposit",
                "confirmDelivery",
                "release",
                "dispute",
                "resolve",
                "cancel",
            ],
            ledgerFields: [
                "buyerCommitment",
                "sellerCommitment",
                "amountCommitment",
                "conditionCommitment",
                "escrowState",
                "depositCount",
                "disputeCount",
            ],
        };
    }

    return { contract: loadedContract, info: contractInfo };
}

// ─── Circuit Identifiers ────────────────────────────────────────────────────

export const CIRCUITS = {
    CONSTRUCTOR: "constructor",
    DEPOSIT: "deposit",
    CONFIRM_DELIVERY: "confirmDelivery",
    RELEASE: "release",
    DISPUTE: "dispute",
    RESOLVE: "resolve",
    CANCEL: "cancel",
} as const;

export type CircuitName = (typeof CIRCUITS)[keyof typeof CIRCUITS];

// ─── Ledger Field Identifiers ───────────────────────────────────────────────

export const LEDGER_FIELDS = {
    BUYER_COMMITMENT: "buyerCommitment",
    SELLER_COMMITMENT: "sellerCommitment",
    AMOUNT_COMMITMENT: "amountCommitment",
    CONDITION_COMMITMENT: "conditionCommitment",
    ESCROW_STATE: "escrowState",
    DEPOSIT_COUNT: "depositCount",
    DISPUTE_COUNT: "disputeCount",
} as const;

// ─── State Transition Matrix ────────────────────────────────────────────────
// Maps each EscrowState to permitted circuit invocations.

export const VALID_TRANSITIONS: Record<EscrowState, CircuitName[]> = {
    0: ["deposit", "cancel"],           // Created -> Funded or Cancelled
    1: ["confirmDelivery", "dispute"],  // Funded -> Delivered or Disputed
    2: ["release", "dispute"],          // Delivered -> Released or Disputed
    3: [],                              // Released (terminal state)
    4: ["resolve"],                     // Disputed -> Resolved
    5: [],                              // Resolved (terminal state)
    6: [],                              // Cancelled (terminal state)
};

/**
 * Validates whether a specific circuit transition is permitted from the current escrow state.
 */
export function isValidTransition(
    state: EscrowState,
    circuit: CircuitName,
): boolean {
    const allowedCircuits = VALID_TRANSITIONS[state];
    return allowedCircuits ? allowedCircuits.includes(circuit) : false;
}

/**
 * Returns the array of allowable circuits for the given escrow state.
 */
export function getValidCircuits(state: EscrowState): CircuitName[] {
    return VALID_TRANSITIONS[state] ?? [];
}
