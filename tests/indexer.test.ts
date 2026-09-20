import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    fetchEscrowState,
    fetchEscrowTransactions,
    fetchLatestBlock,
    contractExists,
    getEscrowSummary,
} from "../src/escrow/indexer";

describe("Umbra Escrow Indexer Query Client Tests", () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    describe("fetchEscrowState", () => {
        it("should return parsed on-chain contract state when query succeeds", async () => {
            const mockContractState = {
                buyerCommitment: "0x1111",
                sellerCommitment: "0x2222",
                amountCommitment: "0x3333",
                conditionCommitment: "0x4444",
                escrowState: 1,
                depositCount: 1,
                disputeCount: 0,
            };

            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    data: {
                        contractState: mockContractState,
                    },
                }),
            } as any);

            const result = await fetchEscrowState("mn_contract_test123");
            expect(result).toEqual(mockContractState);
            expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        });

        it("should return null when GraphQL returns errors", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    errors: [{ message: "Contract not found" }],
                }),
            } as any);

            const result = await fetchEscrowState("mn_contract_nonexistent");
            expect(result).toBeNull();
        });

        it("should return null gracefully on network failure", async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network connection refused"));

            const result = await fetchEscrowState("mn_contract_test123");
            expect(result).toBeNull();
        });
    });

    describe("fetchEscrowTransactions", () => {
        it("should return array of transaction entries when found", async () => {
            const mockTxs = [
                {
                    hash: "mn_tx_001",
                    blockHeight: 12000,
                    timestamp: "2026-09-20T12:00:00Z",
                    type: "deposit",
                },
            ];

            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    data: {
                        transactions: mockTxs,
                    },
                }),
            } as any);

            const result = await fetchEscrowTransactions("mn_contract_test123", 5);
            expect(result).toEqual(mockTxs);
        });

        it("should return empty array on GraphQL error or network fault", async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error("HTTP 500 internal indexer error"));

            const result = await fetchEscrowTransactions("mn_contract_test123");
            expect(result).toEqual([]);
        });
    });

    describe("fetchLatestBlock", () => {
        it("should return latest block info", async () => {
            const mockBlock = {
                height: 1854200,
                hash: "0xblockhash123",
                timestamp: "2026-09-20T12:00:00Z",
            };

            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    data: {
                        blocks: [mockBlock],
                    },
                }),
            } as any);

            const result = await fetchLatestBlock();
            expect(result).toEqual(mockBlock);
        });

        it("should return null when block query fails", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    errors: [{ message: "Block indexer sync error" }],
                }),
            } as any);

            const result = await fetchLatestBlock();
            expect(result).toBeNull();
        });
    });

    describe("contractExists helper", () => {
        it("should return true when contract state is found", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    data: {
                        contractState: { escrowState: 0 },
                    },
                }),
            } as any);

            const exists = await contractExists("mn_contract_test123");
            expect(exists).toBe(true);
        });

        it("should return false when contract state is null", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    data: {
                        contractState: null,
                    },
                }),
            } as any);

            const exists = await contractExists("mn_contract_none");
            expect(exists).toBe(false);
        });
    });

    describe("getEscrowSummary helper", () => {
        it("should aggregate on-chain state and latest transaction", async () => {
            const mockState = {
                buyerCommitment: "0x1111",
                sellerCommitment: "0x2222",
                amountCommitment: "0x3333",
                conditionCommitment: "0x4444",
                escrowState: 2,
                depositCount: 1,
                disputeCount: 0,
            };
            const mockTx = {
                hash: "mn_tx_latest",
                blockHeight: 1854201,
                timestamp: "2026-09-20T12:30:00Z",
                type: "confirmDelivery",
            };

            globalThis.fetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ data: { contractState: mockState } }),
                } as any)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ data: { transactions: [mockTx] } }),
                } as any);

            const summary = await getEscrowSummary("mn_contract_test123");
            expect(summary.exists).toBe(true);
            expect(summary.state).toBe(2);
            expect(summary.deposits).toBe(1);
            expect(summary.disputes).toBe(0);
            expect(summary.lastTransaction).toEqual(mockTx);
        });
    });
});
