import type {
    CreateEscrowRequest,
    EscrowActionParams,
    EscrowActionType,
    EscrowActionResult,
    EscrowDeploymentResult,
    EscrowEvent,
    EscrowRecord,
    EscrowState,
} from "./types";
import { EscrowState as State, ESCROW_STATE_LABELS } from "./types";
import { generateSalt, generateSecret } from "./witnesses";
import { isValidTransition, type CircuitName } from "./contract";
import { verifyAmount, verifyCondition, computeEscrowHash } from "./verification";
import { createMidnightChainGateway, type ChainGateway } from "./gateway";
import { createSupabaseEscrowRepository, type EscrowRepository } from "./repository";

// ─── Umbra Escrow Service ───────────────────────────────────────────────────
// Real orchestration layer: validates domain rules, executes ZK circuits on
// Midnight through the chain gateway, and persists every state change plus an
// append-only event log to Supabase. There is no in-memory store and no
// simulated transaction path — if the network or database is unreachable the
// call fails loudly.

export class EscrowError extends Error {
    constructor(
        message: string,
        readonly statusCode: number = 400,
    ) {
        super(message);
        this.name = "EscrowError";
    }
}

export interface EscrowServiceDeps {
    repository: EscrowRepository;
    gateway: ChainGateway;
}

let _deps: EscrowServiceDeps | null = null;

/**
 * Overrides service dependencies. Intended for tests, which inject test
 * doubles that live under tests/ — production code always resolves the real
 * Supabase repository and Midnight chain gateway.
 */
export function configureEscrowService(deps: EscrowServiceDeps): void {
    _deps = deps;
}

export function getEscrowServiceDeps(): EscrowServiceDeps {
    if (!_deps) {
        _deps = {
            repository: createSupabaseEscrowRepository(),
            gateway: createMidnightChainGateway(),
        };
    }
    return _deps;
}

export function resetEscrowService(): void {
    _deps = null;
}

// ─── State Machine Binding ──────────────────────────────────────────────────

const ACTION_TARGET_STATE: Record<EscrowActionType, EscrowState> = {
    deposit: State.Funded,
    confirmDelivery: State.Delivered,
    release: State.Released,
    dispute: State.Disputed,
    resolve: State.Resolved,
    cancel: State.Cancelled,
};

const SELLER_ONLY_ACTIONS: ReadonlySet<EscrowActionType> = new Set([
    "confirmDelivery",
    "resolve",
]);

export function privateStateIdFor(escrowId: string): string {
    return `umbra-escrow:${escrowId}`;
}

// ─── Deployment ─────────────────────────────────────────────────────────────

export async function deployEscrow(
    request: CreateEscrowRequest,
): Promise<EscrowDeploymentResult & { escrowId: string }> {
    const amountVerification = verifyAmount(request.amount);
    if (!amountVerification.valid) {
        throw new EscrowError(`Invalid amount: ${amountVerification.reason}`);
    }

    const conditionVerification = verifyCondition(request.condition);
    if (!conditionVerification.valid) {
        throw new EscrowError(`Invalid condition: ${conditionVerification.reason}`);
    }

    if (!request.buyerAddress?.trim()) {
        throw new EscrowError("Buyer address is required");
    }
    if (!request.sellerAddress?.trim()) {
        throw new EscrowError("Seller address is required");
    }

    const { repository, gateway } = getEscrowServiceDeps();

    const buyerSecret = generateSecret();
    const sellerSecret = generateSecret();
    const salt = generateSalt();

    const now = new Date().toISOString();
    const escrowId = computeEscrowHash({
        buyerAddress: request.buyerAddress,
        sellerAddress: request.sellerAddress,
        amount: request.amount,
        condition: request.condition,
        timestamp: now,
    });
    const privateStateId = privateStateIdFor(escrowId);

    const deployResult = await gateway.deployEscrow({
        buyerSecret,
        sellerSecret,
        amount: request.amount,
        condition: request.condition,
        privateStateId,
    });

    const record: EscrowRecord = {
        id: escrowId,
        contractAddress: deployResult.contractAddress,
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
        transactionHash: deployResult.transactionHash,
        depositCoinIndex: null,
        buyerSecret,
        sellerSecret,
        salt,
    };

    await repository.insert(record);
    await repository.insertEvent({
        escrowId,
        action: "created",
        fromState: null,
        toState: State.Created,
        transactionHash: deployResult.transactionHash,
        description: `Escrow deployed on-chain at ${deployResult.contractAddress}`,
    });

    return {
        escrowId,
        contractAddress: deployResult.contractAddress,
        transactionHash: deployResult.transactionHash,
    };
}

// ─── Circuit Transitions ────────────────────────────────────────────────────

export async function executeEscrowAction(
    escrowId: string,
    action: EscrowActionType,
    params: EscrowActionParams,
): Promise<EscrowActionResult> {
    const { repository, gateway } = getEscrowServiceDeps();

    const record = await repository.getById(escrowId);
    if (!record) {
        throw new EscrowError(`Escrow ${escrowId} not found`, 404);
    }

    if (!isValidTransition(record.state, action as CircuitName)) {
        throw new EscrowError(
            `Cannot perform ${action} in state ${ESCROW_STATE_LABELS[record.state]}`,
        );
    }

    const sellerOnly = SELLER_ONLY_ACTIONS.has(action);
    const expectedSecret = sellerOnly ? record.sellerSecret : record.buyerSecret;
    if (!params.secret || params.secret !== expectedSecret) {
        throw new EscrowError(
            sellerOnly
                ? "Only the seller can perform this action"
                : "Invalid secret for this escrow",
        );
    }

    const args = buildCircuitArgs(action, params, record);
    const fromState = record.state;
    const newState = ACTION_TARGET_STATE[action];

    const callResult = await gateway.callCircuit({
        contractAddress: record.contractAddress,
        circuit: action,
        args,
        privateStateId: privateStateIdFor(escrowId),
    });

    let warning: string | undefined;

    if (action === "deposit") {
        const coinIndex = await lookupCoinIndexWithRetry(
            gateway,
            callResult.transactionHash,
            record.contractAddress,
        );
        if (coinIndex !== null) {
            record.depositCoinIndex = coinIndex;
        } else {
            warning =
                "Deposit settled on-chain but its coin mt_index could not be indexed yet; " +
                "release/cancel will fail until it is available.";
        }
    }

    const timestamp = new Date().toISOString();
    record.state = newState;
    record.stateLabel = ESCROW_STATE_LABELS[newState];
    record.updatedAt = timestamp;
    record.transactionHash = callResult.transactionHash;
    switch (action) {
        case "deposit":
            record.fundedAt = timestamp;
            break;
        case "confirmDelivery":
            record.deliveredAt = timestamp;
            break;
        case "release":
            record.releasedAt = timestamp;
            break;
        case "dispute":
            record.disputedAt = timestamp;
            break;
        case "resolve":
            record.resolvedAt = timestamp;
            break;
        case "cancel":
            record.cancelledAt = timestamp;
            break;
    }

    await repository.update(record);
    await repository.insertEvent({
        escrowId,
        action,
        fromState,
        toState: newState,
        transactionHash: callResult.transactionHash,
        blockHeight: callResult.blockHeight,
        description: `Executed ZK circuit '${action}': ${ESCROW_STATE_LABELS[fromState]} → ${ESCROW_STATE_LABELS[newState]}`,
    });

    return {
        success: true,
        transactionHash: callResult.transactionHash,
        blockHeight: callResult.blockHeight,
        newState,
        warning,
    };
}

function buildCircuitArgs(
    action: EscrowActionType,
    params: EscrowActionParams,
    record: EscrowRecord,
): unknown[] {
    switch (action) {
        case "deposit": {
            const value = params.value ?? record.amount;
            try {
                return [BigInt(value)];
            } catch {
                throw new EscrowError(`Invalid deposit value: ${value}`);
            }
        }
        case "release": {
            if (!params.sellerPubKey) {
                throw new EscrowError("Missing sellerPubKey for release");
            }
            if (!record.depositCoinIndex) {
                throw new EscrowError(
                    "Deposit coin index unavailable — cannot release until the deposit coin is indexed",
                );
            }
            return [
                { bytes: Uint8Array.from(Buffer.from(params.sellerPubKey, "hex")) },
                BigInt(record.depositCoinIndex),
            ];
        }
        case "cancel": {
            // Contract refunds the deposit when cancelling from Funded, which
            // requires the deposit coin's merkle index to reconstruct the coin.
            if (record.state === State.Funded) {
                if (!record.depositCoinIndex) {
                    throw new EscrowError(
                        "Deposit coin index unavailable — cannot cancel with refund until the deposit coin is indexed",
                    );
                }
                return [BigInt(record.depositCoinIndex)];
            }
            return [0n];
        }
        default:
            return [];
    }
}

async function lookupCoinIndexWithRetry(
    gateway: ChainGateway,
    txHash: string,
    contractAddress: string,
    attempts = 3,
    delayMs = 2000,
): Promise<string | null> {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            const index = await gateway.getCoinMtIndex(txHash, contractAddress);
            return index.toString();
        } catch (err) {
            if (attempt === attempts) {
                console.error(
                    `[Umbra-Service] Coin mt_index lookup failed for tx ${txHash}:`,
                    err instanceof Error ? err.message : err,
                );
                return null;
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    return null;
}

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getEscrow(escrowId: string): Promise<EscrowRecord | null> {
    return getEscrowServiceDeps().repository.getById(escrowId);
}

export async function getEscrowOrThrow(escrowId: string): Promise<EscrowRecord> {
    const record = await getEscrow(escrowId);
    if (!record) {
        throw new EscrowError(`Escrow ${escrowId} not found`, 404);
    }
    return record;
}

export async function listEscrows(filters?: {
    state?: EscrowState;
    buyerAddress?: string;
    sellerAddress?: string;
}): Promise<EscrowRecord[]> {
    return getEscrowServiceDeps().repository.list(filters);
}

export async function listEvents(escrowId?: string): Promise<EscrowEvent[]> {
    return getEscrowServiceDeps().repository.listEvents(escrowId);
}

export async function removeEscrow(escrowId: string): Promise<void> {
    await getEscrowServiceDeps().repository.remove(escrowId);
}
