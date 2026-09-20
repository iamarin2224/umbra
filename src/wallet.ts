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
