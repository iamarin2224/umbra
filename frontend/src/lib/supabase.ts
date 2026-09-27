/**
 * Umbra Supabase Data Client
 * Real database access plus realtime change subscriptions.
 * Used as the direct data plane: every row comes from Postgres — nothing is
 * synthesized client-side.
 */
import { createClient, SupabaseClient, type RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { EscrowRecord, EscrowState, ESCROW_STATE_LABELS, EscrowServerEvent, EscrowTimelineEvent } from '../types/escrow';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let clientInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-'));
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

export interface EscrowDbRow {
  id: string;
  contract_address: string;
  buyer_address: string;
  seller_address: string;
  amount: string;
  condition: string;
  state: number;
  state_label: string;
  created_at: string;
  updated_at: string;
  funded_at: string | null;
  delivered_at: string | null;
  released_at: string | null;
  disputed_at: string | null;
  resolved_at: string | null;
  cancelled_at: string | null;
  transaction_hash: string;
  deposit_coin_index?: string | null;
  buyer_secret?: string;
  seller_secret?: string;
  salt?: string;
}

export function rowToEscrowRecord(row: EscrowDbRow): EscrowRecord {
  const state = (row.state as EscrowState) ?? EscrowState.Created;
  return {
    id: row.id,
    contractAddress: row.contract_address,
    buyerAddress: row.buyer_address,
    sellerAddress: row.seller_address,
    amount: row.amount,
    condition: row.condition,
    state,
    stateLabel: row.state_label || ESCROW_STATE_LABELS[state] || 'Unknown',
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToServerEvent(row: any): EscrowServerEvent {
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

export function serverEventToTimeline(event: EscrowServerEvent): EscrowTimelineEvent {
  return {
    id: event.id != null ? String(event.id) : `evt_${event.escrowId}_${event.createdAt ?? ''}`,
    escrowId: event.escrowId,
    type: event.action,
    fromState: event.fromState ?? undefined,
    toState: event.toState,
    transactionHash: event.transactionHash ?? '',
    timestamp: event.createdAt ?? new Date().toISOString(),
    description: event.description,
  };
}

// ─── Realtime Subscriptions ─────────────────────────────────────────────────

export interface RealtimeHandlers {
  onEscrowChange: (payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) => void;
  onEventInsert: (event: EscrowServerEvent) => void;
  onStatusChange: (status: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED') => void;
}

/**
 * Subscribes to live Postgres changes on the escrows and escrow_events tables.
 * Returns an unsubscribe function. Requires Supabase realtime to be enabled
 * for both tables (see supabase/schema.sql).
 */
export function subscribeToLiveUpdates(handlers: RealtimeHandlers): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return () => undefined;
  }

  const channel = supabase
    .channel('umbra-escrow-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'escrows' },
      handlers.onEscrowChange,
    )
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'escrow_events' }, (payload) => {
      handlers.onEventInsert(rowToServerEvent(payload.new));
    })
    .subscribe((status) => {
      if (
        status === 'SUBSCRIBED' ||
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT' ||
        status === 'CLOSED'
      ) {
        handlers.onStatusChange(status);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

export { rowToServerEvent };
