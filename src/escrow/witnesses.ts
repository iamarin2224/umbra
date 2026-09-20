import type { EscrowWitnesses } from "./types";

// ─── Umbra Escrow Witness Providers ─────────────────────────────────────────
// Bridges local private state to the Midnight Compact ZK circuit witnesses.
// Normalizes values to 32-byte hex representations for cryptographic commitment generation.

/**
 * Creates witness provider closures for the ZK escrow circuits.
 *
 * @param buyerSecret - Buyer's private secret (hex string, padded/truncated to 32 bytes)
 * @param sellerSecret - Seller's private secret (hex string, padded/truncated to 32 bytes)
 * @param amount - Escrow funding amount (hex string, padded/truncated to 32 bytes)
 * @param condition - Condition hash (hex string, padded/truncated to 32 bytes)
 * @returns EscrowWitnesses provider functions
 */
export function createEscrowWitnesses(
    buyerSecret: string,
    sellerSecret: string,
    amount: string,
    condition: string,
): EscrowWitnesses {
    const normalizeBytes32 = (hexStr: string): string => {
        const rawBytes = parseHexToBytes(hexStr);
        const buffer = new Uint8Array(32);
        buffer.set(rawBytes.slice(0, 32));
        return formatBytesToHex(buffer);
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

function parseHexToBytes(hex: string): Uint8Array {
    const cleaned = hex.startsWith("0x") ? hex.slice(2) : hex;
    const byteArray = new Uint8Array(cleaned.length / 2);
    for (let index = 0; index < cleaned.length; index += 2) {
        byteArray[index / 2] = Number.parseInt(cleaned.substring(index, index + 2), 16);
    }
    return byteArray;
}

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
