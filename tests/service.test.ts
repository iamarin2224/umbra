import { describe, it, expect, beforeEach } from "vitest";
import {
    configureEscrowService,
    resetEscrowService,
    deployEscrow,
    executeEscrowAction,
    getEscrow,
    listEscrows,
    listEvents,
    privateStateIdFor,
    EscrowError,
} from "../src/escrow/service";
import { EscrowState } from "../src/escrow/types";
import { FakeChainGateway, FakeEscrowRepository } from "./fakes";

// Unit tests for the real escrow service orchestration logic.
// The service itself has no mock code paths — these tests inject test doubles
// for the repository and chain gateway so the domain rules can be verified
// without a live network or database.

let repository: FakeEscrowRepository;
let gateway: FakeChainGateway;

const BUYER_SECRET = "b".repeat(64);

async function createEscrow(overrides?: Partial<{ buyerAddress: string; sellerAddress: string; amount: string; condition: string }>) {
    const deployment = await deployEscrow({
        buyerAddress: overrides?.buyerAddress ?? "mn_buyer_1",
        sellerAddress: overrides?.sellerAddress ?? "mn_seller_1",
        amount: overrides?.amount ?? "1000",
        condition: overrides?.condition ?? "Deliver goods",
    });
    const record = await getEscrow(deployment.escrowId);
    if (!record) throw new Error("deployed escrow missing from repository");
    return { deployment, record };
}

async function deposit(escrowId: string, secret: string) {
    return executeEscrowAction(escrowId, "deposit", { secret, value: "1000" });
}

async function confirmDelivery(escrowId: string, secret: string) {
    return executeEscrowAction(escrowId, "confirmDelivery", { secret });
}

async function release(escrowId: string, secret: string) {
    return executeEscrowAction(escrowId, "release", {
        secret,
        sellerPubKey: "deadbeef",
    });
}

async function dispute(escrowId: string, secret: string) {
    return executeEscrowAction(escrowId, "dispute", { secret });
}

async function resolve(escrowId: string, secret: string) {
    return executeEscrowAction(escrowId, "resolve", { secret });
}

async function cancel(escrowId: string, secret: string) {
    return executeEscrowAction(escrowId, "cancel", { secret });
}

describe("Umbra Escrow Service (real orchestration, injected test doubles)", () => {
    beforeEach(() => {
        repository = new FakeEscrowRepository();
        gateway = new FakeChainGateway();
        resetEscrowService();
        configureEscrowService({ repository, gateway });
    });

    describe("deployEscrow", () => {
        it("deploys a new escrow through the chain gateway and persists it", async () => {
            const result = await deployEscrow({
                buyerAddress: "mn_buyer_1",
                sellerAddress: "mn_seller_1",
                amount: "1000",
                condition: "Deliver 10 units of product X",
            });

            expect(result.escrowId).toBeDefined();
            expect(result.contractAddress).toBeDefined();
            expect(result.transactionHash).toBeDefined();
            expect(gateway.deployCalls).toHaveLength(1);
            expect(gateway.deployCalls[0].privateStateId).toBe(
                privateStateIdFor(result.escrowId),
            );

            const record = await getEscrow(result.escrowId);
            expect(record).not.toBeNull();
            expect(record?.state).toBe(EscrowState.Created);
            expect(record?.buyerAddress).toBe("mn_buyer_1");
            expect(record?.sellerAddress).toBe("mn_seller_1");
            expect(record?.amount).toBe("1000");
            expect(record?.condition).toBe("Deliver 10 units of product X");
            expect(record?.transactionHash).toBe(result.transactionHash);
        });

        it("records a 'created' event in the event log", async () => {
            const result = await deployEscrow({
                buyerAddress: "mn_buyer_1",
                sellerAddress: "mn_seller_1",
                amount: "1000",
                condition: "Deliver goods",
            });

            const events = await listEvents(result.escrowId);
            expect(events).toHaveLength(1);
            expect(events[0].action).toBe("created");
            expect(events[0].toState).toBe(EscrowState.Created);
            expect(events[0].transactionHash).toBe(result.transactionHash);
        });

        it("generates distinct buyer and seller secrets", async () => {
            const { record } = await createEscrow();
            expect(record.buyerSecret).toBeDefined();
            expect(record.sellerSecret).toBeDefined();
            expect(record.buyerSecret).not.toBe(record.sellerSecret);
            expect(record.buyerSecret.length).toBe(64);
            expect(record.sellerSecret.length).toBe(64);
        });

        it("rejects negative or non-numeric amount", async () => {
            await expect(
                deployEscrow({
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "-100",
                    condition: "Deliver goods",
                }),
            ).rejects.toThrow("Invalid amount");
        });

        it("rejects empty condition string", async () => {
            await expect(
                deployEscrow({
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "",
                }),
            ).rejects.toThrow("Invalid condition");
        });

        it("rejects missing buyer address", async () => {
            await expect(
                deployEscrow({
                    buyerAddress: "",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                }),
            ).rejects.toThrow("Buyer address is required");
        });

        it("does not create any record when validation fails", async () => {
            await expect(
                deployEscrow({
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "NaN",
                    condition: "Deliver goods",
                }),
            ).rejects.toThrow("Invalid amount");
            expect(await listEscrows()).toHaveLength(0);
            expect(gateway.deployCalls).toHaveLength(0);
        });
    });

    describe("deposit", () => {
        it("deposits funds, transitions to Funded, and indexes the deposit coin", async () => {
            const { record } = await createEscrow();

            const result = await deposit(record.id, record.buyerSecret);

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Funded);
            expect(result.transactionHash).toBeTruthy();

            const updated = await getEscrow(record.id);
            expect(updated?.state).toBe(EscrowState.Funded);
            expect(updated?.fundedAt).toBeDefined();
            expect(updated?.depositCoinIndex).toBe("42");

            const events = await listEvents(record.id);
            expect(events[0].action).toBe("deposit");
            expect(events[0].fromState).toBe(EscrowState.Created);
            expect(events[0].toState).toBe(EscrowState.Funded);
        });

        it("passes the deposit value and per-escrow private state id to the circuit", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);

            expect(gateway.callCalls[0].circuit).toBe("deposit");
            expect(gateway.callCalls[0].args).toEqual([BigInt(1000)]);
            expect(gateway.callCalls[0].privateStateId).toBe(privateStateIdFor(record.id));
        });

        it("rejects deposit with an unauthorized secret", async () => {
            const { record } = await createEscrow();
            await expect(deposit(record.id, "invalid_secret")).rejects.toThrow(
                "Invalid secret",
            );
        });

        it("rejects deposit with the seller secret", async () => {
            const { record } = await createEscrow();
            await expect(deposit(record.id, record.sellerSecret)).rejects.toThrow(
                "Invalid secret",
            );
        });

        it("returns not-found for a non-existent escrow", async () => {
            await expect(deposit("nonexistent", BUYER_SECRET)).rejects.toThrow("not found");
        });
    });

    describe("confirmDelivery", () => {
        it("confirms delivery by the seller and transitions to Delivered", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);

            const result = await confirmDelivery(record.id, record.sellerSecret);

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Delivered);

            const updated = await getEscrow(record.id);
            expect(updated?.state).toBe(EscrowState.Delivered);
            expect(updated?.deliveredAt).toBeDefined();
        });

        it("rejects delivery confirmation from the buyer secret", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);

            await expect(confirmDelivery(record.id, record.buyerSecret)).rejects.toThrow(
                "Only the seller",
            );
        });

        it("rejects delivery confirmation before funding", async () => {
            const { record } = await createEscrow();
            await expect(confirmDelivery(record.id, record.sellerSecret)).rejects.toThrow(
                "Cannot perform confirmDelivery",
            );
        });
    });

    describe("release", () => {
        it("releases funds to the seller and transitions to Released", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);
            await confirmDelivery(record.id, record.sellerSecret);

            const result = await release(record.id, record.buyerSecret);

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Released);

            const updated = await getEscrow(record.id);
            expect(updated?.state).toBe(EscrowState.Released);
            expect(updated?.releasedAt).toBeDefined();

            const releaseCall = gateway.callCalls[gateway.callCalls.length - 1];
            expect(releaseCall.circuit).toBe("release");
            expect(releaseCall.args).toHaveLength(2);
            expect(releaseCall.args[1]).toBe(BigInt(42));
        });

        it("rejects release in a non-delivered state", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);

            await expect(release(record.id, record.buyerSecret)).rejects.toThrow(
                "Cannot perform release",
            );
        });

        it("rejects release when sellerPubKey is missing", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);
            await confirmDelivery(record.id, record.sellerSecret);

            await expect(
                executeEscrowAction(record.id, "release", { secret: record.buyerSecret }),
            ).rejects.toThrow("Missing sellerPubKey");
        });

        it("rejects release when the deposit coin index is unavailable", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);
            await confirmDelivery(record.id, record.sellerSecret);

            const stored = await getEscrow(record.id);
            await repository.update({ ...stored!, depositCoinIndex: null });

            await expect(release(record.id, record.buyerSecret)).rejects.toThrow(
                "Deposit coin index unavailable",
            );
        });
    });

    describe("dispute", () => {
        it("raises a dispute from the funded state", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);

            const result = await dispute(record.id, record.buyerSecret);

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Disputed);

            const updated = await getEscrow(record.id);
            expect(updated?.state).toBe(EscrowState.Disputed);
            expect(updated?.disputedAt).toBeDefined();
        });

        it("raises a dispute from the delivered state", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);
            await confirmDelivery(record.id, record.sellerSecret);

            const result = await dispute(record.id, record.buyerSecret);
            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Disputed);
        });

        it("rejects a dispute in the created state", async () => {
            const { record } = await createEscrow();
            await expect(dispute(record.id, record.buyerSecret)).rejects.toThrow(
                "Cannot perform dispute",
            );
        });

        it("rejects a dispute from the seller secret", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);
            await expect(dispute(record.id, record.sellerSecret)).rejects.toThrow(
                "Invalid secret",
            );
        });
    });

    describe("resolve", () => {
        it("resolves a dispute by the seller", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);
            await dispute(record.id, record.buyerSecret);

            const result = await resolve(record.id, record.sellerSecret);

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Resolved);

            const updated = await getEscrow(record.id);
            expect(updated?.state).toBe(EscrowState.Resolved);
            expect(updated?.resolvedAt).toBeDefined();
        });

        it("rejects dispute resolution from the buyer secret", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);
            await dispute(record.id, record.buyerSecret);

            await expect(resolve(record.id, record.buyerSecret)).rejects.toThrow(
                "Only the seller",
            );
        });
    });

    describe("cancel", () => {
        it("cancels an escrow from the created state", async () => {
            const { record } = await createEscrow();

            const result = await cancel(record.id, record.buyerSecret);

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Cancelled);

            const updated = await getEscrow(record.id);
            expect(updated?.state).toBe(EscrowState.Cancelled);
            expect(updated?.cancelledAt).toBeDefined();
        });

        it("cancels from the funded state with deposit refund (contract allows FUNDED -> CANCELLED)", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);

            const result = await cancel(record.id, record.buyerSecret);

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Cancelled);

            const updated = await getEscrow(record.id);
            expect(updated?.state).toBe(EscrowState.Cancelled);
        });

        it("rejects cancellation from the seller secret", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);

            await expect(cancel(record.id, record.sellerSecret)).rejects.toThrow(
                "Invalid secret",
            );
        });

        it("rejects cancellation from the delivered state", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);
            await confirmDelivery(record.id, record.sellerSecret);

            await expect(cancel(record.id, record.buyerSecret)).rejects.toThrow(
                "Cannot perform cancel",
            );
        });
    });

    describe("listEscrows", () => {
        it("lists all registered escrows", async () => {
            await createEscrow({ buyerAddress: "mn_buyer_1" });
            await createEscrow({ buyerAddress: "mn_buyer_2" });

            const escrows = await listEscrows();
            expect(escrows.length).toBe(2);
        });

        it("filters escrows by lifecycle state", async () => {
            const first = await createEscrow({ buyerAddress: "mn_buyer_1" });
            await createEscrow({ buyerAddress: "mn_buyer_2" });
            await deposit(first.record.id, first.record.buyerSecret);

            const fundedEscrows = await listEscrows({ state: EscrowState.Funded });
            expect(fundedEscrows.length).toBe(1);
            expect(fundedEscrows[0].state).toBe(EscrowState.Funded);

            const createdEscrows = await listEscrows({ state: EscrowState.Created });
            expect(createdEscrows.length).toBe(1);
            expect(createdEscrows[0].state).toBe(EscrowState.Created);
        });

        it("filters escrows by buyer address", async () => {
            await createEscrow({ buyerAddress: "mn_buyer_1" });
            await createEscrow({ buyerAddress: "mn_buyer_2" });

            const buyer1Escrows = await listEscrows({ buyerAddress: "mn_buyer_1" });
            expect(buyer1Escrows.length).toBe(1);
            expect(buyer1Escrows[0].buyerAddress).toBe("mn_buyer_1");
        });
    });

    describe("event log", () => {
        it("records the full lifecycle timeline with real transition history", async () => {
            const { record } = await createEscrow();
            await deposit(record.id, record.buyerSecret);
            await confirmDelivery(record.id, record.sellerSecret);
            await release(record.id, record.buyerSecret);

            const events = await listEvents(record.id);
            const actions = events.map((e) => e.action).reverse();
            expect(actions).toEqual(["created", "deposit", "confirmDelivery", "release"]);

            for (const event of events) {
                expect(event.transactionHash).toBeTruthy();
            }
        });

        it("throws EscrowError with status 404 for unknown ids", async () => {
            const error = await getEscrow("missing").then(() => null, (e) => e);
            expect(error).toBeNull();

            try {
                await executeEscrowAction("missing", "deposit", {
                    secret: BUYER_SECRET,
                    value: "1",
                });
                expect.unreachable("should have thrown");
            } catch (err) {
                expect(err).toBeInstanceOf(EscrowError);
                expect((err as EscrowError).statusCode).toBe(404);
            }
        });
    });
});
