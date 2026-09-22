/**
 * Umbra Escrow State Management Hook
 * Connects frontend views to backend Express API, Supabase real-time triggers, and optimistic client cache.
 * Provides complete lifecycle actions: create, deposit, confirm delivery, release, dispute, resolve, and cancel.
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
  createEscrow as apiCreateEscrow,
  performEscrowAction as apiPerformEscrowAction,
  fetchHealth,
  fetchWalletCoins,
} from '../lib/api';
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

const EVENTS_CACHE_KEY = 'umbra_escrow_events_cache';

export function useEscrowService(): UseEscrowServiceReturn {
  const { address } = useMidnightWallet();
  const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
  const [events, setEvents] = useState<EscrowTimelineEvent[]>(() => {
    try {
      const stored = localStorage.getItem(EVENTS_CACHE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState<EscrowFilter>({ state: 'all' });
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowRecord | null>(null);
  const [coins, setCoins] = useState<WalletCoin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  const initialLoadRef = useRef<boolean>(false);

  // ─── Save Events helper ──────────────────────────────────────────────────
  const recordEvent = useCallback((event: EscrowTimelineEvent) => {
    setEvents((prev) => {
      const next = [event, ...prev].slice(0, 50); // Keep last 50 events
      try {
        localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(next));
      } catch {
        // storage quota fallback
      }
      return next;
    });
  }, []);

  // ─── Fetch All Data ──────────────────────────────────────────────────────
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      // 1. Ping Health
      const health = await fetchHealth();
      setIsBackendOnline(health.ok);

      // 2. Fetch Escrows
      const data = await fetchEscrows();
      setEscrows(data);

      // 3. Fetch Wallet Coins
      const walletCoins = await fetchWalletCoins();
      setCoins(walletCoins);
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

  // Polling for live status every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ─── Create Escrow ───────────────────────────────────────────────────────
  const createEscrow = useCallback(
    async (params: { sellerAddress: string; amount: string; condition: string }): Promise<EscrowRecord> => {
      setActionLoading(true);
      setError(null);

      try {
        const buyerAddress = address || 'mn_shielded_buyer_default';
        const req: CreateEscrowRequest = {
          buyerAddress,
          sellerAddress: params.sellerAddress,
          amount: params.amount,
          condition: params.condition,
        };

        const newRecord = await apiCreateEscrow(req);

        // Optimistically prepend to active state
        setEscrows((prev) => [newRecord, ...prev]);

        // Record timeline event
        recordEvent({
          id: `evt_${Date.now()}`,
          escrowId: newRecord.id,
          type: 'created',
          toState: EscrowState.Created,
          transactionHash: newRecord.transactionHash,
          timestamp: newRecord.createdAt,
          description: `Escrow agreement deployed on-chain (${params.amount} tDUST)`,
        });

        return newRecord;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error creating escrow';
        setError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [address, recordEvent]
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
        const target = escrows.find((e) => e.id === escrowId);
        const fromState = target?.state;

        const result = await apiPerformEscrowAction(escrowId, {
          action,
          value: params?.value || target?.amount,
          sellerPubKey: params?.sellerPubKey,
          coinIndex: params?.coinIndex,
        });

        if (!result.success) {
          throw new Error(result.error || 'Contract transition failed');
        }

        // Update local state optimistically
        setEscrows((prev) =>
          prev.map((e) => {
            if (e.id !== escrowId) return e;
            const updated: EscrowRecord = {
              ...e,
              state: result.newState,
              stateLabel: result.newStateLabel || ESCROW_STATE_LABELS[result.newState],
              updatedAt: new Date().toISOString(),
            };
            if (result.newState === EscrowState.Funded) updated.fundedAt = updated.updatedAt;
            if (result.newState === EscrowState.Delivered) updated.deliveredAt = updated.updatedAt;
            if (result.newState === EscrowState.Released) updated.releasedAt = updated.updatedAt;
            if (result.newState === EscrowState.Disputed) updated.disputedAt = updated.updatedAt;
            if (result.newState === EscrowState.Resolved) updated.resolvedAt = updated.updatedAt;
            if (result.newState === EscrowState.Cancelled) updated.cancelledAt = updated.updatedAt;
            return updated;
          })
        );

        // Update selected escrow if opened in inspector
        setSelectedEscrow((prev) => {
          if (!prev || prev.id !== escrowId) return prev;
          return {
            ...prev,
            state: result.newState,
            stateLabel: result.newStateLabel || ESCROW_STATE_LABELS[result.newState],
            updatedAt: new Date().toISOString(),
          };
        });

        // Record timeline event
        recordEvent({
          id: `evt_${Date.now()}`,
          escrowId,
          type: action,
          fromState,
          toState: result.newState,
          transactionHash: result.transactionHash,
          timestamp: new Date().toISOString(),
          description: `Executed ZK Circuit '${action}' → State ${result.newStateLabel || ESCROW_STATE_LABELS[result.newState]}`,
        });

        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Action execution failed';
        setError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [escrows, recordEvent]
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
    setFilter,
    setSelectedEscrow,
    refresh: () => loadData(false),
    createEscrow,
    executeAction,
  };
}
