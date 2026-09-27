import type { ChainGateway, ChainGatewayCallParams, ChainGatewayCallResult, ChainGatewayDeployParams, ChainGatewayDeployResult } from "../src/escrow/gateway";
import type { EscrowRepository } from "../src/escrow/repository";
import type { EscrowEvent, EscrowFilter, EscrowRecord } from "../src/escrow/types";

// ─── Test Doubles ───────────────────────────────────────────────────────────
// These exist ONLY for unit tests. Production code always wires the real
// Supabase repository and the real Midnight chain gateway.

export class FakeEscrowRepository implements EscrowRepository {
    private records = new Map<string, EscrowRecord>();
    private events: EscrowEvent[] = [];
    private nextEventId = 1;

    async insert(record: EscrowRecord): Promise<void> {
        if (this.records.has(record.id)) {
            throw new Error(`Duplicate escrow id: ${record.id}`);
        }
        this.records.set(record.id, structuredClone(record));
    }

    async update(record: EscrowRecord): Promise<void> {
        if (!this.records.has(record.id)) {
            throw new Error(`Escrow not found: ${record.id}`);
        }
        this.records.set(record.id, structuredClone(record));
    }

    async getById(id: string): Promise<EscrowRecord | null> {
        const record = this.records.get(id);
        return record ? structuredClone(record) : null;
    }

    async list(filters?: EscrowFilter): Promise<EscrowRecord[]> {
        let results = Array.from(this.records.values(), (r) => structuredClone(r));
        if (filters?.state !== undefined) {
            results = results.filter((r) => r.state === filters.state);
        }
        if (filters?.buyerAddress) {
            results = results.filter((r) => r.buyerAddress === filters.buyerAddress);
        }
        if (filters?.sellerAddress) {
            results = results.filter((r) => r.sellerAddress === filters.sellerAddress);
        }
        return results.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }

    async remove(id: string): Promise<void> {
        this.records.delete(id);
        this.events = this.events.filter((e) => e.escrowId !== id);
    }

    async insertEvent(event: EscrowEvent): Promise<void> {
        this.events.push({
            ...event,
            id: this.nextEventId++,
            createdAt: new Date().toISOString(),
        });
    }

    async listEvents(escrowId?: string): Promise<EscrowEvent[]> {
        const scoped = escrowId ? this.events.filter((e) => e.escrowId === escrowId) : this.events;
        return structuredClone(scoped).sort((a, b) => {
            const timeDiff =
                new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
            if (timeDiff !== 0) return timeDiff;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }

    clear(): void {
        this.records.clear();
        this.events = [];
        this.nextEventId = 1;
    }
}

export class FakeChainGateway implements ChainGateway {
    deployCalls: ChainGatewayDeployParams[] = [];
    callCalls: ChainGatewayCallParams[] = [];
    private counter = 0;

    async deployEscrow(params: ChainGatewayDeployParams): Promise<ChainGatewayDeployResult> {
        this.deployCalls.push(params);
        this.counter += 1;
        return {
            contractAddress: `mn_contract_${this.counter}`,
            transactionHash: `tx_deploy_${this.counter}`,
        };
    }

    async callCircuit(params: ChainGatewayCallParams): Promise<ChainGatewayCallResult> {
        this.callCalls.push(params);
        this.counter += 1;
        return {
            transactionHash: `tx_${params.circuit}_${this.counter}`,
            blockHeight: this.counter,
        };
    }

    async getCoinMtIndex(): Promise<bigint> {
        return BigInt(42);
    }

    reset(): void {
        this.deployCalls = [];
        this.callCalls = [];
        this.counter = 0;
    }
}
