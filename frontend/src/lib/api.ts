/**
 * Umbra REST API Client
 * Talks to the live Umbra Express API (and directly to Supabase as a secondary
 * real data source). Every call either returns real server data or throws —
 * there is no simulated record generation and no offline mock cache.
 */

import {
  EscrowRecord,
  CreateEscrowRequest,
  EscrowActionRequest,
  EscrowActionResult,
  WalletAvailableCoinsResponse,
  WalletPublicKeyResponse,
  ApiHealthResponse,
  EscrowFilter,
  EscrowServerEvent,
  WalletCoin,
  EscrowTimelineEvent,
} from '../types/escrow';
import { getSupabaseClient, rowToEscrowRecord, rowToServerEvent, serverEventToTimeline } from '../lib/supabase';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

async function readError(res: Response, fallback: string): Promise<Error> {
  try {
    const payload = (await res.json()) as { error?: string };
    if (payload.error) return new Error(payload.error);
  } catch {
    // non-JSON error body
  }
  return new Error(`${fallback} (HTTP ${res.status})`);
}

/**
 * Health check ping — returns ok:false when the API is unreachable (a real
 * status probe, not fabricated data).
 */
export async function fetchHealth(): Promise<ApiHealthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Health HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { ok: false, timestamp: new Date().toISOString() };
  }
}

/**
 * Query available shielded coins from the Midnight wallet server.
 * Throws when the API or wallet is unavailable — returns [] only when the
 * server genuinely reports no coins.
 */
export async function fetchWalletCoins(): Promise<WalletCoin[]> {
  const res = await fetch(`${API_BASE_URL}/api/wallet/coins`);
  if (!res.ok) throw await readError(res, 'Failed to fetch wallet coins');
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as WalletAvailableCoinsResponse).coins)) {
    return (data as WalletAvailableCoinsResponse).coins;
  }
  return [];
}

/**
 * Retrieve the coin public key for the connected server enclave.
 */
export async function fetchWalletPublicKey(): Promise<WalletPublicKeyResponse> {
  const res = await fetch(`${API_BASE_URL}/api/wallet/public-key`);
  if (!res.ok) throw await readError(res, 'Failed to fetch wallet public key');
  return await res.json();
}

/**
 * Fetch the escrow list. Prefers the REST API; falls back to a direct
 * Supabase read (still real database rows). Throws when neither is reachable.
 */
export async function fetchEscrows(filter?: EscrowFilter): Promise<EscrowRecord[]> {
  try {
    let url = `${API_BASE_URL}/api/escrows`;
    const params = new URLSearchParams();
    if (filter?.buyerAddress) params.set('buyerAddress', filter.buyerAddress);
    if (filter?.sellerAddress) params.set('sellerAddress', filter.sellerAddress);
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const res = await fetch(url);
    if (res.ok) {
      return (await res.json()) as EscrowRecord[];
    }
    if (res.status !== 503) {
      throw await readError(res, 'Failed to fetch escrows');
    }
    // API reports Supabase unconfigured — try a direct Supabase read below.
  } catch (err) {
    const supabase = getSupabaseClient();
    if (!supabase) throw err;
    // fall through to direct Supabase query
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error(
      'Cannot load escrows: API server unreachable and Supabase is not configured in the frontend.',
    );
  }

  let query = supabase.from('escrows').select('*');
  if (filter?.buyerAddress) query = query.eq('buyer_address', filter.buyerAddress);
  if (filter?.sellerAddress) query = query.eq('seller_address', filter.sellerAddress);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    throw new Error(`Failed to load escrows from Supabase: ${error.message}`);
  }
  return (data || []).map(rowToEscrowRecord);
}

/**
 * Fetch the append-only on-chain event log.
 */
export async function fetchEvents(escrowId?: string): Promise<EscrowTimelineEvent[]> {
  try {
    const url = escrowId
      ? `${API_BASE_URL}/api/escrows/${encodeURIComponent(escrowId)}/events`
      : `${API_BASE_URL}/api/events`;
    const res = await fetch(url);
    if (res.ok) {
      return ((await res.json()) as EscrowServerEvent[]).map(serverEventToTimeline);
    }
    if (res.status !== 503) throw await readError(res, 'Failed to fetch events');
  } catch (err) {
    const supabase = getSupabaseClient();
    if (!supabase) throw err;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error(
      'Cannot load events: API server unreachable and Supabase is not configured in the frontend.',
    );
  }
  let query = supabase.from('escrow_events').select('*');
  if (escrowId) query = query.eq('escrow_id', escrowId);
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(500);
  if (error) throw new Error(`Failed to load events from Supabase: ${error.message}`);
  return (data || []).map((row) => serverEventToTimeline(rowToServerEvent(row)));
}

/**
 * Deploy a new zero-knowledge escrow on Midnight. Requires the API server —
 * there is no client-side simulated deployment.
 */
export async function createEscrow(req: CreateEscrowRequest): Promise<EscrowRecord> {
  const res = await fetch(`${API_BASE_URL}/api/escrows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw await readError(res, 'Escrow deploy failed');
  return (await res.json()) as EscrowRecord;
}

/**
 * Execute a zero-knowledge circuit transition on-chain.
 * Failures are surfaced to the caller — never replaced with local simulation.
 */
export async function performEscrowAction(
  id: string,
  req: EscrowActionRequest,
): Promise<EscrowActionResult> {
  const res = await fetch(`${API_BASE_URL}/api/escrows/${encodeURIComponent(id)}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw await readError(res, 'Circuit transition failed');
  return (await res.json()) as EscrowActionResult;
}
