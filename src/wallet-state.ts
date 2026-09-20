import * as fs from 'node:fs';
import * as path from 'node:path';

import type { NetworkId } from './network.js';

// ─── Umbra Wallet State Persistence Layer ───────────────────────────────────
// Manages disk-cached serialization of Midnight child wallets (shielded, unshielded, dust)
// to avoid re-syncing from scratch on every server boot.

export const WALLET_STATE_DIR = '.midnight-wallet-state';
export const WALLET_STATE_VERSION = 1 as const;

export type ChildKind = 'shielded' | 'unshielded' | 'dust';
export const CHILD_KINDS: readonly ChildKind[] = ['shielded', 'unshielded', 'dust'] as const;

export interface PersistedWalletState {
  shielded?: unknown;
  unshielded?: unknown;
  dust?: string;
}

interface FsOptions {
  cwd?: string;
}

function resolveNetworkDirectory(network: NetworkId, opts: FsOptions = {}): string {
  return path.join(opts.cwd ?? process.cwd(), WALLET_STATE_DIR, network);
}

function resolveStateFilePath(network: NetworkId, kind: ChildKind, opts: FsOptions = {}): string {
  return path.join(resolveNetworkDirectory(network, opts), `${kind}.json`);
}

function atomicFileWrite(targetFile: string, dataContent: string): void {
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  const temporaryFile = `${targetFile}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporaryFile, dataContent);
  fs.renameSync(temporaryFile, targetFile);
}

interface VersionedStatePayload<T> {
  version: typeof WALLET_STATE_VERSION;
  state: T;
}

function readVersionedStateFile<T>(filePath: string): T | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const parsedPayload = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as VersionedStatePayload<T>;
    if (!parsedPayload || typeof parsedPayload !== 'object' || parsedPayload.version !== WALLET_STATE_VERSION) {
      return undefined;
    }
    return parsedPayload.state;
  } catch {
    return undefined;
  }
}

function writeVersionedStateFile<T>(filePath: string, stateData: T): void {
  const payload: VersionedStatePayload<T> = { version: WALLET_STATE_VERSION, state: stateData };
  atomicFileWrite(filePath, `${JSON.stringify(payload)}\n`);
}

export function loadWalletState(network: NetworkId, opts: FsOptions = {}): PersistedWalletState {
  return {
    shielded: readVersionedStateFile(resolveStateFilePath(network, 'shielded', opts)),
    unshielded: readVersionedStateFile(resolveStateFilePath(network, 'unshielded', opts)),
    dust: readVersionedStateFile<string>(resolveStateFilePath(network, 'dust', opts)),
  };
}

export function saveWalletState(
  network: NetworkId,
  persistedState: PersistedWalletState,
  opts: FsOptions = {},
): void {
  if (persistedState.shielded !== undefined) {
    writeVersionedStateFile(resolveStateFilePath(network, 'shielded', opts), persistedState.shielded);
  }
  if (persistedState.unshielded !== undefined) {
    writeVersionedStateFile(resolveStateFilePath(network, 'unshielded', opts), persistedState.unshielded);
  }
  if (persistedState.dust !== undefined) {
    writeVersionedStateFile(resolveStateFilePath(network, 'dust', opts), persistedState.dust);
  }
}

export function clearWalletState(network: NetworkId, opts: FsOptions = {}): void {
  const targetDir = resolveNetworkDirectory(network, opts);
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
}
