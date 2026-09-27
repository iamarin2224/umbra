import { describe, it, expect } from "vitest";
import {
    createEscrowWitnesses,
    createWitnessesFromRecord,
    encodeStringToBytes32,
    generateSecret,
    generateSalt,
} from "../src/escrow/witnesses";

describe("Umbra Witnesses & Secret Generation", () => {
    describe("createEscrowWitnesses", () => {
        it("should create witness providers for all four parameters", () => {
            const buyerSecret = "a".repeat(64);
            const sellerSecret = "b".repeat(64);
            const amount = "0000000000000000000000000000000000000000000000000000000000001000";
            const condition = "c".repeat(64);

            const witnesses = createEscrowWitnesses(
                buyerSecret,
                sellerSecret,
                amount,
                condition,
            );

            expect(witnesses).toHaveProperty("buyerSecret");
            expect(witnesses).toHaveProperty("sellerSecret");
            expect(witnesses).toHaveProperty("escrowAmount");
            expect(witnesses).toHaveProperty("conditionHash");
            expect(typeof witnesses.buyerSecret).toBe("function");
            expect(typeof witnesses.sellerSecret).toBe("function");
            expect(typeof witnesses.escrowAmount).toBe("function");
            expect(typeof witnesses.conditionHash).toBe("function");
        });

        it("should encode values via canonical UTF-8 bytes32 (same as on-chain paths)", () => {
            const buyerSecret = "a".repeat(64);
            const sellerSecret = "b".repeat(64);
            const amount = "c".repeat(64);
            const condition = "d".repeat(64);

            const witnesses = createEscrowWitnesses(
                buyerSecret,
                sellerSecret,
                amount,
                condition,
            );

            // UTF-8 "aaaa..." truncated to 32 bytes → 0x61 repeated 32 times
            expect(witnesses.buyerSecret()).toBe("61".repeat(32));
            expect(witnesses.sellerSecret()).toBe("62".repeat(32));
            expect(witnesses.escrowAmount()).toBe("63".repeat(32));
            expect(witnesses.conditionHash()).toBe("64".repeat(32));
        });

        it("should pad short values to 32 bytes (64 hex characters)", () => {
            const witnesses = createEscrowWitnesses(
                "aabb",
                "ccdd",
                "1122",
                "3344",
            );

            const buyerResult = witnesses.buyerSecret();
            expect(buyerResult.length).toBe(64);
            // UTF-8 "aabb" → 61 61 62 62 then zero padding
            expect(buyerResult.startsWith("61616262")).toBe(true);
            expect(buyerResult.endsWith("00".repeat(28))).toBe(true);

            const sellerResult = witnesses.sellerSecret();
            expect(sellerResult.length).toBe(64);
            expect(sellerResult.startsWith("63636464")).toBe(true);
        });

        it("should truncate long values to 32 bytes", () => {
            const longSecret = "a".repeat(100);
            const witnesses = createEscrowWitnesses(
                longSecret,
                "bb",
                "cc",
                "dd",
            );

            const result = witnesses.buyerSecret();
            expect(result.length).toBe(64);
            expect(result).toBe("61".repeat(32));
        });
    });

    describe("encodeStringToBytes32", () => {
        it("should be the single shared encoding for all deploy/circuit paths", () => {
            const bytes = encodeStringToBytes32("hi");
            expect(bytes).toBeInstanceOf(Uint8Array);
            expect(bytes.length).toBe(32);
            expect(Array.from(bytes.slice(0, 2))).toEqual([0x68, 0x69]);
            expect(Array.from(bytes.slice(2)).every((b) => b === 0)).toBe(true);
        });

        it("should truncate values beyond 32 bytes", () => {
            const bytes = encodeStringToBytes32("x".repeat(40));
            expect(bytes.length).toBe(32);
            expect(Array.from(bytes).every((b) => b === 0x78)).toBe(true);
        });
    });

    describe("createWitnessesFromRecord", () => {
        it("should create witnesses correctly from an escrow record object", () => {
            const record = {
                buyerSecret: "a".repeat(64),
                sellerSecret: "b".repeat(64),
                amount: "c".repeat(64),
                condition: "d".repeat(64),
            };

            const witnesses = createWitnessesFromRecord(record);

            // Same canonical UTF-8 bytes32 encoding as createEscrowWitnesses
            expect(witnesses.buyerSecret()).toBe("61".repeat(32));
            expect(witnesses.sellerSecret()).toBe("62".repeat(32));
            expect(witnesses.escrowAmount()).toBe("63".repeat(32));
            expect(witnesses.conditionHash()).toBe("64".repeat(32));
        });
    });

    describe("generateSecret", () => {
        it("should generate a valid 64-character hex string", () => {
            const secret = generateSecret();
            expect(secret.length).toBe(64);
            expect(/^[0-9a-f]{64}$/.test(secret)).toBe(true);
        });

        it("should generate cryptographically unique secrets", () => {
            const secret1 = generateSecret();
            const secret2 = generateSecret();
            expect(secret1).not.toBe(secret2);
        });
    });

    describe("generateSalt", () => {
        it("should generate a 64-character hex salt", () => {
            const salt = generateSalt();
            expect(salt.length).toBe(64);
            expect(/^[0-9a-f]{64}$/.test(salt)).toBe(true);
        });

        it("should generate unique salts on subsequent invocations", () => {
            const salt1 = generateSalt();
            const salt2 = generateSalt();
            expect(salt1).not.toBe(salt2);
        });
    });
});
