import type {
    CreateEscrowRequest,
    EscrowActionResult,
    EscrowDeploymentResult,
    EscrowRecord,
    EscrowState,
} from "./types";
import { EscrowState as State, ESCROW_STATE_LABELS } from "./types";
import {
    createEscrowWitnesses,
    generateSalt,
    generateSecret,
} from "./witnesses";
import {
    clearMemoryState,
    createInitialPrivateState,
    loadPrivateStateMemory,
    removePrivateStateMemory,
    savePrivateStateMemory,
    updatePrivateState,
} from "./private-state";
import { isValidTransition } from "./contract";
import {
    verifyAmount,
    verifyCondition,
    computeEscrowHash,
} from "./verification";
import { getDeployedContractAddress } from "../network";
import { env } from "../env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ─── Umbra Supabase Client Singleton ─────────────────────────────────────────
// Falls back to in-memory store when Supabase environment credentials are not present.

let _supabaseClientInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
    if (_supabaseClientInstance) return _supabaseClientInstance;
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        _supabaseClientInstance = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        return _supabaseClientInstance;
    }
    return null;
}

// ─── In-Memory Escrow Cache Store ───────────────────────────────────────────

const inMemoryEscrowStore = new Map<string, EscrowRecord>();

// ─── Schema ↔ Domain Entity Converters ──────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRecord(dbRow: any): EscrowRecord {
    return {
        id: dbRow.id,
        contractAddress: dbRow.contract_address,
        buyerAddress: dbRow.buyer_address,
        sellerAddress: dbRow.seller_address,
        amount: dbRow.amount,
        condition: dbRow.condition,
        state: dbRow.state,
        stateLabel: dbRow.state_label,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at,
        fundedAt: dbRow.funded_at,
        deliveredAt: dbRow.delivered_at,
        releasedAt: dbRow.released_at,
        disputedAt: dbRow.disputed_at,
        resolvedAt: dbRow.resolved_at,
        cancelledAt: dbRow.cancelled_at,
        transactionHash: dbRow.transaction_hash,
        buyerSecret: dbRow.buyer_secret,
        sellerSecret: dbRow.seller_secret,
        salt: dbRow.salt,
    };
}

function recordToRow(record: EscrowRecord) {
    return {
        id: record.id,
        contract_address: record.contractAddress,
        buyer_address: record.buyerAddress,
        seller_address: record.sellerAddress,
        amount: record.amount,
        condition: record.condition,
        state: record.state,
        state_label: record.stateLabel,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        funded_at: record.fundedAt,
        delivered_at: record.deliveredAt,
        released_at: record.releasedAt,
        disputed_at: record.disputedAt,
        resolved_at: record.resolvedAt,
        cancelled_at: record.cancelledAt,
        transaction_hash: record.transactionHash,
        buyer_secret: record.buyerSecret,
        seller_secret: record.sellerSecret,
        salt: record.salt,
    };
}

// ─── Escrow Deployment Engine ───────────────────────────────────────────────

/**
 * Creates and deploys a new escrow contract instance offline/mock.
 */
export async function deployEscrow(
    request: CreateEscrowRequest,
    _provider: MidnightProvider,
): Promise<EscrowDeploymentResult & { escrowId: string }> {
    // Parameter validation
    const amountVerification = verifyAmount(request.amount);
    if (!amountVerification.valid) {
        throw new Error(`Invalid amount: ${amountVerification.reason}`);
    }

    const conditionVerification = verifyCondition(request.condition);
    if (!conditionVerification.valid) {
        throw new Error(`Invalid condition: ${conditionVerification.reason}`);
    }

    // Generate cryptographic secrets
    const buyerSecret = generateSecret();
    const sellerSecret = generateSecret();
    const salt = generateSalt();

    // Create ZK witness bindings
    const _witnessProviders = createEscrowWitnesses(
        buyerSecret,
        sellerSecret,
        request.amount,
        request.condition,
    );

    // Derive mock contract address and transaction hash
    const contractAddress = getDeployedContractAddress() || `mn_contract_${Date.now().toString(16)}`;
    const transactionHash = `mn_tx_${Date.now().toString(16)}`;

    // Generate unique escrow identifier
    const escrowId = computeEscrowHash({
        buyerAddress: request.buyerAddress,
        sellerAddress: request.sellerAddress,
        amount: request.amount,
        condition: request.condition,
        timestamp: new Date().toISOString(),
    });

    const now = new Date().toISOString();
    const record: EscrowRecord = {
        id: escrowId,
        contractAddress,
        buyerAddress: request.buyerAddress,
        sellerAddress: request.sellerAddress,
        amount: request.amount,
        condition: request.condition,
        state: State.Created,
        stateLabel: ESCROW_STATE_LABELS[State.Created],
        createdAt: now,
        updatedAt: now,
        fundedAt: null,
        deliveredAt: null,
        releasedAt: null,
        disputedAt: null,
        resolvedAt: null,
        cancelledAt: null,
        transactionHash,
        buyerSecret,
        sellerSecret,
        salt,
    };

    inMemoryEscrowStore.set(escrowId, record);

    // Sync to Supabase if available
    const supabase = getSupabase();
    if (supabase) {
        const { error: insertErr } = await supabase.from("escrows").insert(recordToRow(record));
        if (insertErr) {
            console.error("Supabase insert failed:", insertErr.message);
        }
    }

    // Persist private state locally
    const privateState = createInitialPrivateState({
        buyerSecret,
        sellerSecret,
        amount: request.amount,
        condition: request.condition,
        salt,
        contractAddress,
        buyerAddress: request.buyerAddress,
        sellerAddress: request.sellerAddress,
    });
    savePrivateStateMemory(escrowId, privateState);

    return {
        escrowId,
        contractAddress,
        transactionHash,
        buyerCommitment: `commitment_${buyerSecret.slice(0, 16)}`,
        sellerCommitment: `commitment_${sellerSecret.slice(0, 16)}`,
        amountCommitment: `commitment_${request.amount.slice(0, 16)}`,
        conditionCommitment: `commitment_${request.condition.slice(0, 16)}`,
    };
}

// ─── Escrow Transition Actions ──────────────────────────────────────────────

export async function depositFunds(
    escrowId: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    return performEscrowAction(escrowId, "deposit", secret, provider);
}

export async function confirmDelivery(
    escrowId: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    return performEscrowAction(escrowId, "confirmDelivery", secret, provider);
}

export async function releaseFunds(
    escrowId: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    return performEscrowAction(escrowId, "release", secret, provider);
}

export async function raiseDispute(
    escrowId: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    return performEscrowAction(escrowId, "dispute", secret, provider);
}

export async function resolveDispute(
    escrowId: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    return performEscrowAction(escrowId, "resolve", secret, provider);
}

export async function cancelEscrow(
    escrowId: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    return performEscrowAction(escrowId, "cancel", secret, provider);
}

// ─── Internal Action Execution Core ─────────────────────────────────────────

async function performEscrowAction(
    escrowId: string,
    action: string,
    secret: string,
    _provider: MidnightProvider,
): Promise<EscrowActionResult> {
    const existingRecord = inMemoryEscrowStore.get(escrowId);
    if (!existingRecord) {
        return {
            success: false,
            transactionHash: "",
            blockHeight: 0,
            newState: State.Created,
            error: `Escrow ${escrowId} not found`,
        };
    }

    // Transition matrix check
    if (!isValidTransition(existingRecord.state, action as any)) {
        return {
            success: false,
            transactionHash: "",
            blockHeight: 0,
            newState: existingRecord.state,
            error: `Cannot perform ${action} in state ${ESCROW_STATE_LABELS[existingRecord.state]}`,
        };
    }

    // Party authorization check
    const isBuyerAuth = secret === existingRecord.buyerSecret;
    const isSellerAuth = secret === existingRecord.sellerSecret;

    if (action === "confirmDelivery" || action === "resolve") {
        if (!isSellerAuth) {
            return {
                success: false,
                transactionHash: "",
                blockHeight: 0,
                newState: existingRecord.state,
                error: "Only the seller can perform this action",
            };
        }
    } else if (!isBuyerAuth && !isSellerAuth) {
        return {
            success: false,
            transactionHash: "",
            blockHeight: 0,
            newState: existingRecord.state,
            error: "Invalid secret for this escrow",
        };
    }

    const stateTransitions: Record<string, EscrowState> = {
        deposit: State.Funded,
        confirmDelivery: State.Delivered,
        release: State.Released,
        dispute: State.Disputed,
        resolve: State.Resolved,
        cancel: State.Cancelled,
    };

    const targetState = stateTransitions[action];
    if (targetState === undefined) {
        return {
            success: false,
            transactionHash: "",
            blockHeight: 0,
            newState: existingRecord.state,
            error: `Unknown action: ${action}`,
        };
    }

    const txHash = `mn_tx_${action}_${Date.now().toString(16)}`;
    const mockBlockHeight = Math.floor(Math.random() * 1000000);
    const timestamp = new Date().toISOString();

    const updatedRecord: EscrowRecord = {
        ...existingRecord,
        state: targetState,
        stateLabel: ESCROW_STATE_LABELS[targetState],
        updatedAt: timestamp,
        ...(action === "deposit" && { fundedAt: timestamp }),
        ...(action === "confirmDelivery" && { deliveredAt: timestamp }),
        ...(action === "release" && { releasedAt: timestamp }),
        ...(action === "dispute" && { disputedAt: timestamp }),
        ...(action === "resolve" && { resolvedAt: timestamp }),
        ...(action === "cancel" && { cancelledAt: timestamp }),
        transactionHash: txHash,
    };

    inMemoryEscrowStore.set(escrowId, updatedRecord);

    const supabase = getSupabase();
    if (supabase) {
        const { error: updateErr } = await supabase
            .from("escrows")
            .update(recordToRow(updatedRecord))
            .eq("id", escrowId);
        if (updateErr) {
            console.error("Supabase update failed:", updateErr.message);
        }
    }

    const currentPrivateState = loadPrivateStateMemory(escrowId);
    if (currentPrivateState) {
        const updatedPrivateState = updatePrivateState(currentPrivateState, targetState);
        savePrivateStateMemory(escrowId, updatedPrivateState);
    }

    return {
        success: true,
        transactionHash: txHash,
        blockHeight: mockBlockHeight,
        newState: targetState,
    };
}

// ─── Query Handlers ─────────────────────────────────────────────────────────

export function getEscrow(escrowId: string): EscrowRecord | null {
    return inMemoryEscrowStore.get(escrowId) ?? null;
}

export async function getEscrowAsync(escrowId: string): Promise<EscrowRecord | null> {
    const cached = inMemoryEscrowStore.get(escrowId);
    if (cached) return cached;

    const supabase = getSupabase();
    if (supabase) {
        const { data, error } = await supabase.from("escrows").select("*").eq("id", escrowId).single();
        if (error || !data) return null;
        return rowToRecord(data);
    }
    return null;
}

export function listEscrows(filters?: {
    state?: EscrowState;
    buyerAddress?: string;
    sellerAddress?: string;
}): EscrowRecord[] {
    let resultList = Array.from(inMemoryEscrowStore.values());

    if (filters?.state !== undefined) {
        resultList = resultList.filter((r) => r.state === filters.state);
    }
    if (filters?.buyerAddress) {
        resultList = resultList.filter((r) => r.buyerAddress === filters.buyerAddress);
    }
    if (filters?.sellerAddress) {
        resultList = resultList.filter((r) => r.sellerAddress === filters.sellerAddress);
    }

    return resultList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function listEscrowsAsync(filters?: {
    state?: EscrowState;
    buyerAddress?: string;
    sellerAddress?: string;
}): Promise<EscrowRecord[]> {
    const supabase = getSupabase();
    if (supabase) {
        let query = supabase.from("escrows").select("*");
        if (filters?.state !== undefined) {
            query = query.eq("state", filters.state);
        }
        if (filters?.buyerAddress) {
            query = query.eq("buyer_address", filters.buyerAddress);
        }
        if (filters?.sellerAddress) {
            query = query.eq("seller_address", filters.sellerAddress);
        }
        const { data, error } = await query.order("created_at", { ascending: false });
        if (error) {
            console.error("Supabase query failed:", error.message);
            return listEscrows(filters);
        }
        return (data || []).map(rowToRecord);
    }
    return listEscrows(filters);
}

export function getEscrowPrivateState(escrowId: string) {
    return loadPrivateStateMemory(escrowId);
}

export function removeEscrow(escrowId: string): boolean {
    const isDeleted = inMemoryEscrowStore.delete(escrowId);
    removePrivateStateMemory(escrowId);

    const supabase = getSupabase();
    if (supabase) {
        supabase.from("escrows").delete().eq("id", escrowId).then(({ error }) => {
            if (error) console.error("Supabase delete failed:", error.message);
        });
    }

    return isDeleted;
}

export function clearAllEscrows(): void {
    inMemoryEscrowStore.clear();
    clearMemoryState();

    const supabase = getSupabase();
    if (supabase) {
        supabase.from("escrows").delete().neq("id", "").then(({ error }) => {
            if (error) console.error("Supabase clear failed:", error.message);
        });
    }
}

// ─── Provider Interface ─────────────────────────────────────────────────────

interface MidnightProvider {
    isConnected: boolean;
    address?: string;
    sign?: (data: string) => Promise<string>;
}
