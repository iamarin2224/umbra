import type { EscrowState, VerificationResult } from "./types";
import { ESCROW_STATE_LABELS, EscrowState as State } from "./types";

// ─── Umbra Verification Utilities ───────────────────────────────────────────
// Provides validation for state transitions, address commitments, amounts, conditions,
// and escrow record completeness.

/**
 * Validates whether a state transition from currentState to targetState is valid.
 */
export function verifyStateTransition(
    currentState: EscrowState,
    targetState: EscrowState,
): VerificationResult {
    const transitionGraph: Record<EscrowState, EscrowState[]> = {
        [State.Created]: [State.Funded, State.Cancelled],
        [State.Funded]: [State.Delivered, State.Disputed],
        [State.Delivered]: [State.Released, State.Disputed],
        [State.Released]: [],
        [State.Disputed]: [State.Resolved],
        [State.Resolved]: [],
        [State.Cancelled]: [],
    };

    const isPermitted = transitionGraph[currentState]?.includes(targetState) ?? false;

    if (!isPermitted) {
        return {
            valid: false,
            reason: `Cannot transition from ${ESCROW_STATE_LABELS[currentState]} to ${ESCROW_STATE_LABELS[targetState]}`,
            details: {
                currentState,
                targetState,
                validTargets: transitionGraph[currentState] ?? [],
            },
        };
    }

    return { valid: true };
}

/**
 * Verifies address and commitment format.
 */
export function verifyAddressCommitment(
    address: string,
    commitment: string,
): VerificationResult {
    if (!address || !commitment) {
        return {
            valid: false,
            reason: "Address or commitment is empty",
        };
    }

    if (address.length < 10) {
        return {
            valid: false,
            reason: "Invalid address format",
        };
    }

    if (commitment.length !== 64) {
        return {
            valid: false,
            reason: "Invalid commitment format (expected 64 hex characters)",
        };
    }

    return { valid: true };
}

/**
 * Validates escrow funding amount (positive, non-zero, within boundary).
 */
export function verifyAmount(amount: string): VerificationResult {
    if (!amount) {
        return {
            valid: false,
            reason: "Amount is empty",
        };
    }

    const parsedAmount = Number.parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        return {
            valid: false,
            reason: "Amount must be a positive number",
            details: { amount, parsed: parsedAmount },
        };
    }

    const MAX_ESCROW_AMOUNT = 1_000_000_000;
    if (parsedAmount > MAX_ESCROW_AMOUNT) {
        return {
            valid: false,
            reason: "Amount exceeds maximum allowed value",
            details: { amount, max: "1,000,000,000" },
        };
    }

    return { valid: true };
}

/**
 * Validates escrow condition description text.
 */
export function verifyCondition(condition: string): VerificationResult {
    if (!condition || condition.trim().length === 0) {
        return {
            valid: false,
            reason: "Condition cannot be empty",
        };
    }

    const MAX_CONDITION_LENGTH = 500;
    if (condition.length > MAX_CONDITION_LENGTH) {
        return {
            valid: false,
            reason: "Condition exceeds maximum length (500 characters)",
            details: { length: condition.length, max: MAX_CONDITION_LENGTH },
        };
    }

    return { valid: true };
}

/**
 * Computes deterministic unique identifier hash for escrow parameters.
 */
export function computeEscrowHash(params: {
    buyerAddress: string;
    sellerAddress: string;
    amount: string;
    condition: string;
    timestamp: string;
}): string {
    const payload = [
        params.buyerAddress,
        params.sellerAddress,
        params.amount,
        params.condition,
        params.timestamp,
    ].join(":");

    let computedHash = 0;
    for (let i = 0; i < payload.length; i++) {
        const charCode = payload.charCodeAt(i);
        computedHash = (computedHash << 5) - computedHash + charCode;
        computedHash |= 0;
    }

    return `escrow_${Math.abs(computedHash).toString(16).padStart(8, "0")}`;
}

/**
 * Validates integrity of an escrow record structure.
 */
export function validateEscrowRecord(record: {
    id?: string;
    contractAddress?: string;
    buyerAddress?: string;
    sellerAddress?: string;
    amount?: string;
    condition?: string;
    state?: number;
}): VerificationResult {
    const validationErrors: string[] = [];

    if (!record.id) validationErrors.push("Missing id");
    if (!record.contractAddress) validationErrors.push("Missing contractAddress");
    if (!record.buyerAddress) validationErrors.push("Missing buyerAddress");
    if (!record.sellerAddress) validationErrors.push("Missing sellerAddress");
    if (!record.amount) validationErrors.push("Missing amount");
    if (!record.condition) validationErrors.push("Missing condition");
    if (record.state === undefined || record.state === null)
        validationErrors.push("Missing state");

    if (validationErrors.length > 0) {
        return {
            valid: false,
            reason: validationErrors.join("; "),
            details: { missingFields: validationErrors },
        };
    }

    return { valid: true };
}
