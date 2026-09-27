/**
 * Umbra Escrow State Management Hook
 * Connects frontend views to the backend Express API, the Supabase realtime
 * event stream, and the Midnight wallet. All escrow rows and timeline events
 * come from live data sources — nothing is cached or synthesized locally.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  EscrowRecord,
  EscrowFilter,
  EscrowTimelineEvent,
  EscrowState,
  ESCROW_STATE_LABELS,
  CreateEscrowRequest,
  EscrowActionType,
  EscrowActionResult,
  WalletCoin,
} from '../types/escrow';
import {
  fetchEscrows,
  fetchEvents,
  createEscrow as apiCreateEscrow,
  performEscrowAction as apiPerformEscrowAction,
  fetchHealth,
  fetchWalletCoins,
  fetchWalletPublicKey,
} from '../lib/api';
import { subscribeToLiveUpdates, isSupabaseConfigured } from '../lib/supabase';
import { useMidnightWallet } from '../context/MidnightWalletContext';

export interface EscrowStats {
  totalCount: number;
  totalVolume: number;
  activeCount: number;
  completedCount: number;
  disputedCount: number;
}

export interface UseEscrowServiceReturn {
  // State
  escrows: EscrowRecord[];
  filteredEscrows: EscrowRecord[];
  events: EscrowTimelineEvent[];
  stats: EscrowStats;
  selectedEscrow: EscrowRecord | null;
  coins: WalletCoin[];
  filter: EscrowFilter;

  // Loading & Diagnostics
  loading: boolean;
  actionLoading: boolean;
  refreshing: boolean;
  error: string | null;
  isBackendOnline: boolean;
  isLiveConnected: boolean;

  // Operations & Setters
  setFilter: React.Dispatch<React.SetStateAction<EscrowFilter>>;
  setSelectedEscrow: (escrow: EscrowRecord | null) => void;
  refresh: () => Promise<void>;
  createEscrow: (params: { sellerAddress: string; amount: string; condition: string }) => Promise<EscrowRecord>;
  executeAction: (
    escrowId: string,
    action: EscrowActionType,
    params?: { value?: string; sellerPubKey?: string; coinIndex?: string }
  ) => Promise<EscrowActionResult>;
}

const SELLER_ONLY_ACTIONS: ReadonlySet<EscrowActionType> = new Set(['confirmDelivery', 'resolve']);

export function useEscrowService(): UseEscrowServiceReturn {
  const { address } = useMidnightWallet();
  const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
  const [events, setEvents] = useState<EscrowTimelineEvent[]>([]);
  const [filter, setFilter] = useState<EscrowFilter>({ state: 'all' });
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowRecord | null>(null);
  const [coins, setCoins] = useState<WalletCoin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  const initialLoadRef = useRef<boolean>(false);
  const escrowsRef = useRef<EscrowRecord[]>([]);
  escrowsRef.current = escrows;

  // ─── Full data load from live sources ────────────────────────────────────
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const health = await fetchHealth();
      setIsBackendOnline(health.ok);

      const [escrowRows, timelineEvents] = await Promise.all([
        fetchEscrows(),
        fetchEvents(),
      ]);
      setEscrows(escrowRows);
      setEvents(timelineEvents);
    } catch (err: unknown) {
      console.error('[useEscrowService] Load failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch escrow data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadData(false);
    }
  }, [loadData]);

  // ─── Supabase realtime subscription (push-based updates) ─────────────────
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLiveConnected(false);
      return undefined;
    }

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        loadData(true);
      }, 300);
    };

    const unsubscribe = subscribeToLiveUpdates({
      onEscrowChange: scheduleRefresh,
      onEventInsert: (serverEvent) => {
        setEvents((prev) => {
          const timelineEvent: EscrowTimelineEvent = {
            id: serverEvent.id != null ? String(serverEvent.id) : `evt_${Date.now()}`,
            escrowId: serverEvent.escrowId,
            type: serverEvent.action,
            fromState: serverEvent.fromState ?? undefined,
            toState: serverEvent.toState,
            transactionHash: serverEvent.transactionHash ?? '',
            timestamp: serverEvent.createdAt ?? new Date().toISOString(),
            description: serverEvent.description,
          };
          if (prev.some((e) => e.id === timelineEvent.id)) return prev;
          return [timelineEvent, ...prev].slice(0, 200);
        });
        scheduleRefresh();
      },
      onStatusChange: (status) => {
        setIsLiveConnected(status === 'SUBSCRIBED');
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[useEscrowService] Realtime channel degraded:', status);
        }
      },
    });

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      unsubscribe();
      setIsLiveConnected(false);
    };
  }, [loadData]);

  // ─── Backend health ping (status probe only — no data polling) ───────────
  useEffect(() => {
    const interval = setInterval(async () => {
      const health = await fetchHealth();
      setIsBackendOnline(health.ok);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // ─── Wallet coin refresh ────────────────────────────────────────────────
  const refreshCoins = useCallback(async () => {
    try {
      setCoins(await fetchWalletCoins());
    } catch (err) {
      console.warn('[useEscrowService] Wallet coins unavailable:', err);
      setCoins([]);
    }
  }, []);

  useEffect(() => {
    refreshCoins();
  }, [refreshCoins]);

  // ─── Create Escrow ───────────────────────────────────────────────────────
  const createEscrow = useCallback(
    async (params: { sellerAddress: string; amount: string; condition: string }): Promise<EscrowRecord> => {
      setActionLoading(true);
      setError(null);

      try {
        if (!address) {
          throw new Error('Connect a Midnight wallet before deploying an escrow.');
        }

        const req: CreateEscrowRequest = {
          buyerAddress: address,
          sellerAddress: params.sellerAddress,
          amount: params.amount,
          condition: params.condition,
        };

        const newRecord = await apiCreateEscrow(req);
        setEscrows((prev) => [newRecord, ...prev]);
        return newRecord;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error creating escrow';
        setError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [address],
  );

  // ─── Perform Circuit Transition Action ───────────────────────────────────
  const executeAction = useCallback(
    async (
      escrowId: string,
      action: EscrowActionType,
      params?: { value?: string; sellerPubKey?: string; coinIndex?: string }
    ): Promise<EscrowActionResult> => {
      setActionLoading(true);
      setError(null);

      try {
        const target = escrowsRef.current.find((e) => e.id === escrowId);
        if (!target) {
          throw new Error(`Escrow ${escrowId} not found`);
        }

        const sellerOnly = SELLER_ONLY_ACTIONS.has(action);
        const secret = sellerOnly ? target.sellerSecret : target.buyerSecret;
        if (!secret) {
          throw new Error(
            `Escrow ${escrowId} has no ${sellerOnly ? 'seller' : 'buyer'} secret available — cannot authorize '${action}'`,
          );
        }

        let sellerPubKey = params?.sellerPubKey;
        if (action === 'release' && !sellerPubKey) {
          sellerPubKey = (await fetchWalletPublicKey()).publicKey;
        }

        const result = await apiPerformEscrowAction(escrowId, {
          action,
          secret,
          value: params?.value || target.amount,
          sellerPubKey,
          coinIndex: params?.coinIndex,
        });

        if (!result.success) {
          throw new Error(result.error || 'Contract transition failed');
        }

        // Confirm the transition against the server response, then rely on the
        // realtime stream for cross-client convergence.
        const nowIso = new Date().toISOString();
        setEscrows((prev) =>
          prev.map((e) => {
            if (e.id !== escrowId) return e;
            const updated: EscrowRecord = {
              ...e,
              state: result.newState,
              stateLabel: result.newStateLabel || ESCROW_STATE_LABELS[result.newState],
              updatedAt: nowIso,
            };
            if (result.newState === EscrowState.Funded) updated.fundedAt = nowIso;
            if (result.newState === EscrowState.Delivered) updated.deliveredAt = nowIso;
            if (result.newState === EscrowState.Released) updated.releasedAt = nowIso;
            if (result.newState === EscrowState.Disputed) updated.disputedAt = nowIso;
            if (result.newState === EscrowState.Resolved) updated.resolvedAt = nowIso;
            if (result.newState === EscrowState.Cancelled) updated.cancelledAt = nowIso;
            return updated;
          })
        );

        setSelectedEscrow((prev) => {
          if (!prev || prev.id !== escrowId) return prev;
          return {
            ...prev,
            state: result.newState,
            stateLabel: result.newStateLabel || ESCROW_STATE_LABELS[result.newState],
            updatedAt: nowIso,
          };
        });

        if (result.warning) {
          console.warn('[useEscrowService] Action warning:', result.warning);
        }

        // Re-sync from live sources so the event log reflects the persisted row.
        loadData(true);

        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Action execution failed';
        setError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [loadData],
  );

  // ─── Filtered Escrows Calculation ────────────────────────────────────────
  const filteredEscrows = escrows.filter((item) => {
    if (filter.state !== undefined && filter.state !== 'all') {
      if (item.state !== filter.state) return false;
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchCond = item.condition.toLowerCase().includes(q);
      const matchContract = item.contractAddress.toLowerCase().includes(q);
      if (!matchId && !matchCond && !matchContract) return false;
    }
    if (filter.buyerAddress && item.buyerAddress !== filter.buyerAddress) {
      return false;
    }
    if (filter.sellerAddress && item.sellerAddress !== filter.sellerAddress) {
      return false;
    }
    return true;
  });

  // ─── Aggregate Protocol Metrics / Telemetry ──────────────────────────────
  const stats: EscrowStats = {
    totalCount: escrows.length,
    totalVolume: escrows.reduce((sum, item) => sum + (parseFloat(item.amount.replace(/,/g, '')) || 0), 0),
    activeCount: escrows.filter(
      (e) => e.state === EscrowState.Created || e.state === EscrowState.Funded || e.state === EscrowState.Delivered
    ).length,
    completedCount: escrows.filter((e) => e.state === EscrowState.Released || e.state === EscrowState.Resolved).length,
    disputedCount: escrows.filter((e) => e.state === EscrowState.Disputed).length,
  };

  return {
    escrows,
    filteredEscrows,
    events,
    stats,
    selectedEscrow,
    coins,
    filter,
    loading,
    actionLoading,
    refreshing,
    error,
    isBackendOnline,
    isLiveConnected,
    setFilter,
    setSelectedEscrow,
    refresh: () => loadData(false),
    createEscrow,
    executeAction,
  };
}
