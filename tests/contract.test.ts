import { describe, it, expect } from "vitest";
import {
    CIRCUITS,
    LEDGER_FIELDS,
    VALID_TRANSITIONS,
    isValidTransition,
    getValidCircuits,
} from "../src/escrow/contract";
import { EscrowState } from "../src/escrow/types";

describe("Umbra Contract Domain & Transition Tests", () => {
    describe("CIRCUITS constants", () => {
        it("should accurately define all circuit action names", () => {
            expect(CIRCUITS.CONSTRUCTOR).toBe("constructor");
            expect(CIRCUITS.DEPOSIT).toBe("deposit");
            expect(CIRCUITS.CONFIRM_DELIVERY).toBe("confirmDelivery");
            expect(CIRCUITS.RELEASE).toBe("release");
            expect(CIRCUITS.DISPUTE).toBe("dispute");
            expect(CIRCUITS.RESOLVE).toBe("resolve");
            expect(CIRCUITS.CANCEL).toBe("cancel");
        });
    });

    describe("LEDGER_FIELDS constants", () => {
        it("should accurately define all on-chain ledger field keys", () => {
            expect(LEDGER_FIELDS.BUYER_COMMITMENT).toBe("buyerCommitment");
            expect(LEDGER_FIELDS.SELLER_COMMITMENT).toBe("sellerCommitment");
            expect(LEDGER_FIELDS.AMOUNT_COMMITMENT).toBe("amountCommitment");
            expect(LEDGER_FIELDS.CONDITION_COMMITMENT).toBe(
                "conditionCommitment",
            );
            expect(LEDGER_FIELDS.ESCROW_STATE).toBe("escrowState");
            expect(LEDGER_FIELDS.DEPOSIT_COUNT).toBe("depositCount");
            expect(LEDGER_FIELDS.DISPUTE_COUNT).toBe("disputeCount");
        });
    });

    describe("VALID_TRANSITIONS transition matrix", () => {
        it("should map valid transitions for Created state (0)", () => {
            const createdTransitions = VALID_TRANSITIONS[EscrowState.Created];
            expect(createdTransitions).toContain("deposit");
            expect(createdTransitions).toContain("cancel");
            expect(createdTransitions).not.toContain("release");
        });

        it("should map valid transitions for Funded state (1)", () => {
            const fundedTransitions = VALID_TRANSITIONS[EscrowState.Funded];
            expect(fundedTransitions).toContain("confirmDelivery");
            expect(fundedTransitions).toContain("dispute");
            expect(fundedTransitions).not.toContain("deposit");
        });

        it("should map valid transitions for Delivered state (2)", () => {
            const deliveredTransitions = VALID_TRANSITIONS[EscrowState.Delivered];
            expect(deliveredTransitions).toContain("release");
            expect(deliveredTransitions).toContain("dispute");
            expect(deliveredTransitions).not.toContain("cancel");
        });

        it("should have zero allowed transitions for Released terminal state (3)", () => {
            expect(VALID_TRANSITIONS[EscrowState.Released]).toHaveLength(0);
        });

        it("should map valid transitions for Disputed state (4)", () => {
            const disputedTransitions = VALID_TRANSITIONS[EscrowState.Disputed];
            expect(disputedTransitions).toContain("resolve");
            expect(disputedTransitions).not.toContain("deposit");
        });

        it("should have zero allowed transitions for Resolved terminal state (5)", () => {
            expect(VALID_TRANSITIONS[EscrowState.Resolved]).toHaveLength(0);
        });

        it("should have zero allowed transitions for Cancelled terminal state (6)", () => {
            expect(VALID_TRANSITIONS[EscrowState.Cancelled]).toHaveLength(0);
        });
    });

    describe("isValidTransition validation helper", () => {
        it("should return true for valid circuit invocations", () => {
            expect(isValidTransition(EscrowState.Created, "deposit")).toBe(true);
            expect(isValidTransition(EscrowState.Created, "cancel")).toBe(true);
            expect(isValidTransition(EscrowState.Funded, "confirmDelivery")).toBe(true);
            expect(isValidTransition(EscrowState.Funded, "dispute")).toBe(true);
            expect(isValidTransition(EscrowState.Delivered, "release")).toBe(true);
            expect(isValidTransition(EscrowState.Delivered, "dispute")).toBe(true);
            expect(isValidTransition(EscrowState.Disputed, "resolve")).toBe(true);
        });

        it("should return false for invalid circuit invocations", () => {
            expect(isValidTransition(EscrowState.Created, "release")).toBe(false);
            expect(isValidTransition(EscrowState.Created, "confirmDelivery")).toBe(false);
            expect(isValidTransition(EscrowState.Funded, "release")).toBe(false);
            expect(isValidTransition(EscrowState.Released, "deposit")).toBe(false);
            expect(isValidTransition(EscrowState.Resolved, "dispute")).toBe(false);
            expect(isValidTransition(EscrowState.Cancelled, "deposit")).toBe(false);
        });
    });

    describe("getValidCircuits utility", () => {
        it("should return correct list for Created state", () => {
            const circuits = getValidCircuits(EscrowState.Created);
            expect(circuits).toEqual(expect.arrayContaining(["deposit", "cancel"]));
            expect(circuits).not.toContain("release");
        });

        it("should return correct list for Funded state", () => {
            const circuits = getValidCircuits(EscrowState.Funded);
            expect(circuits).toEqual(expect.arrayContaining(["confirmDelivery", "dispute"]));
            expect(circuits).not.toContain("deposit");
        });

        it("should return empty array for terminal states", () => {
            expect(getValidCircuits(EscrowState.Released)).toEqual([]);
            expect(getValidCircuits(EscrowState.Resolved)).toEqual([]);
            expect(getValidCircuits(EscrowState.Cancelled)).toEqual([]);
        });
    });
});
