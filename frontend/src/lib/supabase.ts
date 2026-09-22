/**
 * Umbra Supabase Data Client
 * Provides optional direct persistence and real-time subscription access.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EscrowRecord, EscrowState, ESCROW_STATE_LABELS } from '../types/escrow';

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

export function escrowRecordToRow(record: EscrowRecord): EscrowDbRow {
  return {
    id: record.id,
    contract_address: record.contractAddress,
    buyer_address: record.buyerAddress,
    seller_address: record.sellerAddress,
    amount: record.amount,
    condition: record.condition,
    state: Number(record.state),
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
    deposit_coin_index: record.depositCoinIndex,
    buyer_secret: record.buyerSecret,
    seller_secret: record.sellerSecret,
    salt: record.salt,
  };
}
