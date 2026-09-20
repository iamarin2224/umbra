import type { EscrowState } from "./types";

// ─── Umbra Private State Schema & Storage ───────────────────────────────────
// Manages sensitive client-side data (counterparty secrets, amounts, conditions, salts)
// that remain strictly off-chain and are required to produce ZK proofs.

const STORAGE_KEY_PREFIX = "umbra:escrow:";

export interface PrivateEscrowState {
    buyerSecret: string;
    sellerSecret: string;
    amount: string;
    condition: string;
    salt: string;
    contractAddress: string;
    buyerAddress: string;
    sellerAddress: string;
    state: EscrowState;
    createdAt: string;
}

// ─── Serialization & Deserialization ────────────────────────────────────────

/**
 * Serializes private escrow state into a string format.
 */
export function serializePrivateState(state: PrivateEscrowState): string {
    return JSON.stringify(state);
}

/**
 * Parses and verifies private state payload from a JSON string.
 */
export function deserializePrivateState(serializedData: string): PrivateEscrowState {
    const parsedState = JSON.parse(serializedData) as PrivateEscrowState;

    if (
        !parsedState.buyerSecret ||
        !parsedState.sellerSecret ||
        !parsedState.amount ||
        !parsedState.condition ||
        !parsedState.salt ||
        !parsedState.contractAddress
    ) {
        throw new Error("Invalid private state: missing required fields");
    }

    return parsedState;
}

// ─── Browser LocalStorage Adapter ───────────────────────────────────────────

/**
 * Persists private state into browser localStorage under the Umbra storage prefix.
 */
export function savePrivateState(
    escrowId: string,
    state: PrivateEscrowState,
): void {
    if (typeof window === "undefined" || !window.localStorage) {
        throw new Error("localStorage not available");
    }
    const storageKey = `${STORAGE_KEY_PREFIX}${escrowId}`;
    window.localStorage.setItem(storageKey, serializePrivateState(state));
}

/**
 * Retrieves private state from browser localStorage.
 */
export function loadPrivateState(
    escrowId: string,
): PrivateEscrowState | null {
    if (typeof window === "undefined" || !window.localStorage) {
        return null;
    }
    const storageKey = `${STORAGE_KEY_PREFIX}${escrowId}`;
    const rawData = window.localStorage.getItem(storageKey);
    if (!rawData) return null;
    return deserializePrivateState(rawData);
}

/**
 * Removes private state entry from browser localStorage.
 */
export function removePrivateState(escrowId: string): void {
    if (typeof window === "undefined" || !window.localStorage) {
        return;
    }
    const storageKey = `${STORAGE_KEY_PREFIX}${escrowId}`;
    window.localStorage.removeItem(storageKey);
}

/**
 * Returns all active escrow IDs stored in localStorage.
 */
export function listPrivateStateIds(): string[] {
    if (typeof window === "undefined" || !window.localStorage) {
        return [];
    }
    const escrowIds: string[] = [];
    for (let index = 0; index < window.localStorage.length; index++) {
        const itemKey = window.localStorage.key(index);
        if (itemKey?.startsWith(STORAGE_KEY_PREFIX)) {
            escrowIds.push(itemKey.slice(STORAGE_KEY_PREFIX.length));
        }
    }
    return escrowIds;
}

// ─── In-Memory State Provider (Node.js & Testing) ───────────────────────────

const inMemoryStore = new Map<string, PrivateEscrowState>();

/**
 * Stores private state in memory cache.
 */
export function savePrivateStateMemory(
    escrowId: string,
    state: PrivateEscrowState,
): void {
    inMemoryStore.set(escrowId, state);
}

/**
 * Loads private state from in-memory cache.
 */
export function loadPrivateStateMemory(
    escrowId: string,
): PrivateEscrowState | null {
    return inMemoryStore.get(escrowId) ?? null;
}

/**
 * Deletes private state entry from in-memory cache.
 */
export function removePrivateStateMemory(escrowId: string): void {
    inMemoryStore.delete(escrowId);
}

/**
 * Clears all cached in-memory state entries.
 */
export function clearMemoryState(): void {
    inMemoryStore.clear();
}

// ─── Private State Factory & Transformers ───────────────────────────────────

/**
 * Generates initial private state record for a newly created escrow.
 */
export function createInitialPrivateState(params: {
    buyerSecret: string;
    sellerSecret: string;
    amount: string;
    condition: string;
    salt: string;
    contractAddress: string;
    buyerAddress: string;
    sellerAddress: string;
}): PrivateEscrowState {
    return {
        buyerSecret: params.buyerSecret,
        sellerSecret: params.sellerSecret,
        amount: params.amount,
        condition: params.condition,
        salt: params.salt,
        contractAddress: params.contractAddress,
        buyerAddress: params.buyerAddress,
        sellerAddress: params.sellerAddress,
        state: 0, // EscrowState.Created
        createdAt: new Date().toISOString(),
    };
}

/**
 * Returns an updated immutable copy of private escrow state with new lifecycle state.
 */
export function updatePrivateState(
    currentState: PrivateEscrowState,
    newState: EscrowState,
): PrivateEscrowState {
    return {
        ...currentState,
        state: newState,
    };
}
