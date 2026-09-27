import type { EscrowWitnesses } from "./types";

// ─── Umbra Escrow Witness Providers ─────────────────────────────────────────
// Bridges local private state to the Midnight Compact ZK circuit witnesses.
// ALL witness values use one canonical encoding: UTF-8 bytes zero-padded or
// truncated to 32 bytes (encodeStringToBytes32). This is the same encoding
// used by scripts/deploy.ts and src/midnight-client.ts when constructing
// commitments on-chain — hex-decoding is NOT used anywhere.

/**
 * Canonical witness encoding shared by every deploy and circuit-call path:
 * UTF-8 encode the value, then copy into a zero-padded 32-byte buffer
 * (truncating anything beyond 32 bytes).
 */
export function encodeStringToBytes32(textValue: string): Uint8Array {
    const rawBytes = new TextEncoder().encode(textValue);
    const outBuffer = new Uint8Array(32);
    outBuffer.set(rawBytes.slice(0, 32));
    return outBuffer;
}

/**
 * Creates witness provider closures for the ZK escrow circuits.
 *
 * @param buyerSecret - Buyer's private secret (hex string from generateSecret)
 * @param sellerSecret - Seller's private secret (hex string from generateSecret)
 * @param amount - Escrow funding amount
 * @param condition - Condition text
 * @returns EscrowWitnesses provider functions (UTF-8 bytes32 as hex strings)
 */
export function createEscrowWitnesses(
    buyerSecret: string,
    sellerSecret: string,
    amount: string,
    condition: string,
): EscrowWitnesses {
    const normalizeBytes32 = (textValue: string): string => {
        return formatBytesToHex(encodeStringToBytes32(textValue));
    };

    return {
        buyerSecret: () => normalizeBytes32(buyerSecret),
        sellerSecret: () => normalizeBytes32(sellerSecret),
        escrowAmount: () => normalizeBytes32(amount),
        conditionHash: () => normalizeBytes32(condition),
    };
}

/**
 * Creates witness providers from an existing escrow record or stored parameter object.
 */
export function createWitnessesFromRecord(record: {
    buyerSecret: string;
    sellerSecret: string;
    amount: string;
    condition: string;
}): EscrowWitnesses {
    return createEscrowWitnesses(
        record.buyerSecret,
        record.sellerSecret,
        record.amount,
        record.condition,
    );
}

// ─── Byte & Hex Utilities ───────────────────────────────────────────────────

function formatBytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

// ─── Cryptographic Secret & Salt Generation ─────────────────────────────────

/**
 * Generates a cryptographically secure 32-byte (64 hex character) random secret.
 */
export function generateSecret(): string {
    const randomBuffer = new Uint8Array(32);
    crypto.getRandomValues(randomBuffer);
    return formatBytesToHex(randomBuffer);
}

/**
 * Generates a random salt for commitment domain separation.
 */
export function generateSalt(): string {
    return generateSecret();
}
