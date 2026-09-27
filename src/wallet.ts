import { Buffer } from 'buffer';

import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  WalletFacade,
  DustWallet,
  HDWallet,
  Roles,
  ShieldedWallet,
  createKeystore,
  NoOpTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk';

import type { NetworkConfig, NetworkId } from './network.js';
import {
  CHILD_KINDS,
  loadWalletState,
  saveWalletState,
  type ChildKind,
  type PersistedWalletState,
} from './wallet-state.js';

export { unshieldedToken };
export type { PersistedWalletState };
export {
  loadWalletState,
  saveWalletState,
  clearWalletState,
  WALLET_STATE_DIR,
  WALLET_STATE_VERSION,
} from './wallet-state.js';

// ─── Umbra HD Key Derivation ────────────────────────────────────────────────

function deriveHDWalletKeys(seedHex: string) {
  const hdInstance = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));
  if (hdInstance.type !== 'seedOk') throw new Error('Invalid seed');
  const derivationResult = hdInstance.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (derivationResult.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdInstance.hdWallet.clear();
  return derivationResult.keys;
}

export interface WalletContext {
  wallet: Awaited<ReturnType<typeof WalletFacade.init>>;
  shieldedSecretKeys: ReturnType<typeof ledger.ZswapSecretKeys.fromSeed>;
  dustSecretKey: ReturnType<typeof ledger.DustSecretKey.fromSeed>;
  unshieldedKeystore: ReturnType<typeof createKeystore>;
  restored: { shielded: boolean; unshielded: boolean; dust: boolean };
}

export interface CreateWalletOptions {
  network: NetworkId;
  networkConfig: NetworkConfig;
  seed: string;
  restore?: boolean;
  cwd?: string;
}

function logRestoreWarning(childKind: ChildKind, errorPayload: unknown): void {
  const errMsg = errorPayload instanceof Error ? errorPayload.message : String(errorPayload);
  process.stderr.write(`  Warning: Could not restore ${childKind} wallet state (${errMsg}); falling back to fresh sync.\n`);
}

// ─── Wallet Creation & Synchronization ──────────────────────────────────────

export async function createWallet(opts: CreateWalletOptions): Promise<WalletContext> {
  setNetworkId(opts.networkConfig.networkId);

  const derivedKeys = deriveHDWalletKeys(opts.seed);
  const activeNetworkId = getNetworkId();
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(derivedKeys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(derivedKeys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(derivedKeys[Roles.NightExternal], activeNetworkId);

  const savedState: PersistedWalletState = opts.restore === false
    ? {}
    : loadWalletState(opts.network, { cwd: opts.cwd });

  const restoredFlags = { shielded: false, unshielded: false, dust: false };

  const configuration = {
    networkId: activeNetworkId,
    indexerClientConnection: {
      indexerHttpUrl: opts.networkConfig.indexer,
      indexerWsUrl: opts.networkConfig.indexerWS,
      // Long preprod catch-up streams (>1h for a fresh wallet) are killed by
      // idle load-balancer timeouts without an application-level keep-alive.
      // 30s keeps the WS alive while adding negligible traffic.
      keepAlive: 30_000,
    },
    provingServerUrl: new URL(opts.networkConfig.proofServer),
    relayURL: new URL(opts.networkConfig.node.replace(/^http/, 'ws')),
    txHistoryStorage: new NoOpTransactionHistoryStorage(),
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
  };

  const walletInstance = await WalletFacade.init({
    configuration,
    shielded: async (childConfig) => {
      const cls = ShieldedWallet(childConfig);
      if (savedState.shielded !== undefined) {
        try {
          const restoredWallet = await (cls as any).restore(savedState.shielded);
          restoredFlags.shielded = true;
          return restoredWallet;
        } catch (err) {
          logRestoreWarning('shielded', err);
        }
      }
      return cls.startWithSecretKeys(shieldedSecretKeys);
    },
    unshielded: async (childConfig) => {
      const cls = UnshieldedWallet(childConfig);
      if (savedState.unshielded !== undefined) {
        try {
          const restoredWallet = await (cls as any).restore(savedState.unshielded);
          restoredFlags.unshielded = true;
          return restoredWallet;
        } catch (err) {
          logRestoreWarning('unshielded', err);
        }
      }
      return cls.startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));
    },
    dust: async (childConfig) => {
      const cls = DustWallet(childConfig);
      if (savedState.dust !== undefined) {
        try {
          const restoredWallet = await (cls as any).restore(savedState.dust);
          restoredFlags.dust = true;
          return restoredWallet;
        } catch (err) {
          logRestoreWarning('dust', err);
        }
      }
      return cls.startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust);
    },
  });

  await walletInstance.start(shieldedSecretKeys, dustSecretKey);

  return {
    wallet: walletInstance,
    shieldedSecretKeys,
    dustSecretKey,
    unshieldedKeystore,
    restored: restoredFlags,
  };
}

export async function persistWalletState(
  network: NetworkId,
  context: WalletContext,
  cwd?: string,
): Promise<void> {
  const statePayload: PersistedWalletState = {};

  for (const kind of CHILD_KINDS) {
    try {
      const childWallet = (context.wallet as unknown as Record<ChildKind, { serializeState: () => Promise<unknown> }>)[kind];
      const serializedData = await childWallet.serializeState();
      if (kind === 'dust') {
        statePayload.dust = serializedData as string;
      } else {
        statePayload[kind] = serializedData;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`  Warning: Could not serialize ${kind} wallet state (${errorMsg}); next run will re-sync.\n`);
    }
  }

  saveWalletState(network, statePayload, { cwd });
}

// ─── Resilient Sync Wait ────────────────────────────────────────────────────
// A fresh preprod wallet replays the full chain via the indexer WS, which takes
// 40-75+ min. The SDK retries transient `Wallet.Sync` failures internally, so a
// bare `waitForSyncedState()` looks hung for an hour while printing
// `Wallet.Sync: [object Object]` (an Effect TaggedError that stringifies
// poorly) plus benign `RPC-CORE ... Normal Closure` reconnect noise on startup.
// This helper adds: per-wallet progress, readable error details, a configurable
// timeout, and periodic state snapshots so a killed/restarted run resumes from
// cache instead of replaying from genesis again.

export interface SyncWaitOptions {
  timeoutMs?: number;
  progressIntervalMs?: number;
  snapshotIntervalMs?: number;
  cwd?: string;
  onProgress?: (line: string) => void;
}

function syncErrorDetail(err: unknown): string {
  if (err instanceof Error) {
    const tagged = (err as { _tag?: unknown })._tag;
    const cause = (err as { cause?: unknown }).cause;
    const base = err.message && err.message !== '[object Object]' ? err.message : String(err);
    const prefix = typeof tagged === 'string' ? `${tagged}: ` : '';
    return cause == null || cause === err ? `${prefix}${base}` : `${prefix}${base} | caused by: ${syncErrorDetail(cause)}`;
  }
  if (typeof err === 'object' && err !== null) {
    const tagged = (err as { _tag?: unknown })._tag;
    const message = (err as { message?: unknown }).message;
    const cause = (err as { cause?: unknown }).cause;
    try {
      const parts: string[] = [];
      if (typeof tagged === 'string') parts.push(tagged);
      if (typeof message === 'string' && message !== '[object Object]') parts.push(message);
      if (cause != null) parts.push(`caused by: ${syncErrorDetail(cause)}`);
      if (parts.length > 0) return parts.join(': ');
      return JSON.stringify(err, (_, v) => (typeof v === 'bigint' ? `${v}n` : v));
    } catch {
      return String(err);
    }
  }
  return String(err);
}

function childProgressFragment(label: string, child: unknown): string | null {
  const progress = (child as { state?: { progress?: unknown } } | null)?.state?.progress as
    | { appliedIndex?: unknown; highestRelevantWalletIndex?: unknown; isConnected?: unknown }
    | undefined;
  if (!progress) return null;
  const applied = typeof progress.appliedIndex === 'bigint' ? progress.appliedIndex.toString() : '?';
  const tip = typeof progress.highestRelevantWalletIndex === 'bigint' ? progress.highestRelevantWalletIndex.toString() : '?';
  const conn = progress.isConnected === true ? '' : ' (disconnected)';
  return `${label} ${applied}/${tip}${conn}`;
}

export function describeSyncProgress(facadeState: unknown): string {
  const s = facadeState as { shielded?: unknown; unshielded?: unknown; dust?: unknown } | null;
  if (!s) return 'no state yet';
  const parts = [
    childProgressFragment('shielded', s.shielded),
    childProgressFragment('unshielded', s.unshielded),
    childProgressFragment('dust', s.dust),
  ].filter((p): p is string => p !== null);
  return parts.length > 0 ? parts.join(' | ') : 'no state yet';
}

export async function waitForSyncedWalletState(
  network: NetworkId,
  context: WalletContext,
  opts: SyncWaitOptions = {},
): Promise<Awaited<ReturnType<WalletContext['wallet']['waitForSyncedState']>>> {
  const envTimeout = Number(process.env.MIDNIGHT_SYNC_TIMEOUT_MS);
  const timeoutMs =
    opts.timeoutMs ?? (Number.isFinite(envTimeout) && envTimeout > 0 ? envTimeout : 120 * 60 * 1000);
  const progressIntervalMs = opts.progressIntervalMs ?? 15_000;
  const snapshotIntervalMs = opts.snapshotIntervalMs ?? 60_000;
  const report = opts.onProgress ?? ((line: string) => process.stdout.write(`${line}\n`));

  let latest: unknown;
  const subscription = context.wallet.state().subscribe({
    next: (s) => {
      latest = s;
    },
    error: (err) => {
      process.stderr.write(`  Wallet state stream error (sync continues): ${syncErrorDetail(err)}\n`);
    },
  });

  const startedAt = Date.now();
  let lastSnapshotAt = 0;
  const progressTimer = setInterval(() => {
    const elapsedMin = ((Date.now() - startedAt) / 60_000).toFixed(1);
    report(`  Sync in progress... (${elapsedMin} min elapsed) ${describeSyncProgress(latest)}`);
    if (Date.now() - lastSnapshotAt >= snapshotIntervalMs) {
      lastSnapshotAt = Date.now();
      persistWalletState(network, context, opts.cwd).catch((err: unknown) => {
        process.stderr.write(`  Warning: periodic wallet snapshot failed (${syncErrorDetail(err)})\n`);
      });
    }
  }, progressIntervalMs);

  try {
    const synced = await Promise.race([
      context.wallet.waitForSyncedState().catch((err: unknown) => {
        throw new Error(`Wallet sync failed: ${syncErrorDetail(err)}`);
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Wallet sync timed out after ${Math.round(timeoutMs / 60_000)} min ` +
                `(configure with MIDNIGHT_SYNC_TIMEOUT_MS). Last progress: ${describeSyncProgress(latest)}. ` +
                `A partial snapshot was saved — re-run to resume from cache instead of genesis.`,
            ),
          );
        }, timeoutMs);
      }),
    ]);
    await persistWalletState(network, context, opts.cwd);
    return synced;
  } finally {
    clearInterval(progressTimer);
    subscription.unsubscribe();
  }
}
