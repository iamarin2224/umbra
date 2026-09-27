import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "../env.js";
import type { EscrowEvent, EscrowFilter, EscrowRecord } from "./types";

// ─── Escrow Persistence Repository ──────────────────────────────────────────
// The only production implementation persists to Supabase/Postgres.
// Test doubles live exclusively under tests/.

export interface EscrowRepository {
    insert(record: EscrowRecord): Promise<void>;
    update(record: EscrowRecord): Promise<void>;
    getById(id: string): Promise<EscrowRecord | null>;
    list(filters?: EscrowFilter): Promise<EscrowRecord[]>;
    remove(id: string): Promise<void>;
    insertEvent(event: EscrowEvent): Promise<void>;
    listEvents(escrowId?: string): Promise<EscrowEvent[]>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRecord(row: any): EscrowRecord {
    return {
        id: row.id,
        contractAddress: row.contract_address,
        buyerAddress: row.buyer_address,
        sellerAddress: row.seller_address,
        amount: row.amount,
        condition: row.condition,
        state: row.state,
        stateLabel: row.state_label,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        fundedAt: row.funded_at,
        deliveredAt: row.delivered_at,
        releasedAt: row.released_at,
        disputedAt: row.disputed_at,
        resolvedAt: row.resolved_at,
        cancelledAt: row.cancelled_at,
        transactionHash: row.transaction_hash,
        depositCoinIndex: row.deposit_coin_index,
        buyerSecret: row.buyer_secret,
        sellerSecret: row.seller_secret,
        salt: row.salt,
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
        deposit_coin_index: record.depositCoinIndex ?? null,
        buyer_secret: record.buyerSecret,
        seller_secret: record.sellerSecret,
        salt: record.salt,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEvent(row: any): EscrowEvent {
    return {
        id: row.id,
        escrowId: row.escrow_id,
        action: row.action,
        fromState: row.from_state,
        toState: row.to_state,
        transactionHash: row.transaction_hash,
        blockHeight: row.block_height,
        description: row.description,
        createdAt: row.created_at,
    };
}

export function isSupabaseConfigured(): boolean {
    return Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
}

export function createSupabaseEscrowRepository(): EscrowRepository {
    if (!isSupabaseConfigured()) {
        throw new Error(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY " +
                "(copy .env.supabase.example to .env.local). Umbra does not run without a real database.",
        );
    }

    let client: SupabaseClient | null = null;
    const getClient = (): SupabaseClient => {
        if (!client) {
            client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        }
        return client;
    };

    return {
        async insert(record: EscrowRecord): Promise<void> {
            const { error } = await getClient().from("escrows").insert(recordToRow(record));
            if (error) {
                throw new Error(`Failed to persist escrow ${record.id}: ${error.message}`);
            }
        },

        async update(record: EscrowRecord): Promise<void> {
            const { error } = await getClient()
                .from("escrows")
                .update(recordToRow(record))
                .eq("id", record.id);
            if (error) {
                throw new Error(`Failed to update escrow ${record.id}: ${error.message}`);
            }
        },

        async getById(id: string): Promise<EscrowRecord | null> {
            const { data, error } = await getClient()
                .from("escrows")
                .select("*")
                .eq("id", id)
                .maybeSingle();
            if (error) {
                throw new Error(`Failed to load escrow ${id}: ${error.message}`);
            }
            return data ? rowToRecord(data) : null;
        },

        async list(filters?: EscrowFilter): Promise<EscrowRecord[]> {
            let query = getClient().from("escrows").select("*");
            if (filters?.state !== undefined) {
                query = query.eq("state", filters.state as number);
            }
            if (filters?.buyerAddress) {
                query = query.eq("buyer_address", filters.buyerAddress);
            }
            if (filters?.sellerAddress) {
                query = query.eq("seller_address", filters.sellerAddress);
            }
            const { data, error } = await query.order("created_at", { ascending: false });
            if (error) {
                throw new Error(`Failed to list escrows: ${error.message}`);
            }
            return (data || []).map(rowToRecord);
        },

        async remove(id: string): Promise<void> {
            const { error } = await getClient().from("escrows").delete().eq("id", id);
            if (error) {
                throw new Error(`Failed to delete escrow ${id}: ${error.message}`);
            }
        },

        async insertEvent(event: EscrowEvent): Promise<void> {
            const { error } = await getClient().from("escrow_events").insert({
                escrow_id: event.escrowId,
                action: event.action,
                from_state: event.fromState,
                to_state: event.toState,
                transaction_hash: event.transactionHash,
                block_height: event.blockHeight ?? null,
                description: event.description,
            });
            if (error) {
                throw new Error(
                    `Failed to persist event for escrow ${event.escrowId}: ${error.message}`,
                );
            }
        },

        async listEvents(escrowId?: string): Promise<EscrowEvent[]> {
            let query = getClient().from("escrow_events").select("*");
            if (escrowId) {
                query = query.eq("escrow_id", escrowId);
            }
            const { data, error } = await query
                .order("created_at", { ascending: false })
                .order("id", { ascending: false })
                .limit(500);
            if (error) {
                throw new Error(`Failed to list events: ${error.message}`);
            }
            return (data || []).map(rowToEvent);
        },
    };
}
