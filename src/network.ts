import * as fs from 'node:fs';
import * as path from 'node:path';
import { Buffer } from 'node:buffer';

import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

// ─── Umbra Network & Environment Configuration ──────────────────────────────

export type NetworkId = 'undeployed' | 'preview' | 'preprod';

export const NETWORK_IDS: readonly NetworkId[] = ['undeployed', 'preview', 'preprod'] as const;

export interface NetworkConfig {
  networkId: NetworkId;
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
  faucet: string | null;
  composeServices: string[];
}

export interface DeploymentRecord {
  address: string;
  deployedAt: string;
  deployer: string;
}

export interface WalletRecord {
  seed: string;
  mnemonic?: string;
  createdAt: string;
}

export interface NetworkState {
  version: 1;
  activeNetwork: NetworkId;
  wallets: Partial<Record<NetworkId, WalletRecord>>;
  deployments: Partial<Record<NetworkId, DeploymentRecord>>;
}

export const STATE_FILE_NAME = '.midnight-state.json';
export const STATE_VERSION = 1 as const;

export const NETWORK_CONFIGS: Record<NetworkId, NetworkConfig> = {
  undeployed: {
    networkId: 'undeployed',
    indexer: 'http://127.0.0.1:8088/api/v4/graphql',
    indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
    node: 'ws://127.0.0.1:9944',
    proofServer: 'http://127.0.0.1:6300',
    faucet: null,
    composeServices: ['node', 'indexer', 'proof-server'],
  },
  preview: {
    networkId: 'preview',
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preview.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
    faucet: 'https://midnight-tmnight-preview.nethermind.dev',
    composeServices: ['proof-server'],
  },
  preprod: {
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
    faucet: 'https://midnight-tmnight-preprod.nethermind.dev',
    composeServices: ['proof-server'],
  },
};

export function isNetworkId(val: unknown): val is NetworkId {
  return typeof val === 'string' && (NETWORK_IDS as readonly string[]).includes(val);
}

interface FsOptions {
  cwd?: string;
}

function statePath(opts: FsOptions = {}): string {
  return path.join(opts.cwd ?? process.cwd(), STATE_FILE_NAME);
}

export function loadState(opts: FsOptions = {}): NetworkState | null {
  const filePath = statePath(opts);
  if (!fs.existsSync(filePath)) return null;
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  let parsedState: unknown;
  try {
    parsedState = JSON.parse(rawContent);
  } catch (err) {
    throw new Error(`Failed to parse ${filePath}: ${(err as Error).message}. Run \`npm run clean\` to reset.`);
  }
  if (
    !parsedState ||
    typeof parsedState !== 'object' ||
    (parsedState as { version?: unknown }).version !== STATE_VERSION
  ) {
    throw new Error(
      `Unsupported state-file version in ${filePath} (expected ${STATE_VERSION}). Run \`npm run clean\` to reset.`,
    );
  }
  if (!isNetworkId((parsedState as { activeNetwork?: unknown }).activeNetwork)) {
    throw new Error(
      `Invalid activeNetwork in ${filePath}. Run \`npm run clean\` to reset.`,
    );
  }
  return parsedState as NetworkState;
}

export function saveState(state: NetworkState, opts: FsOptions = {}): void {
  const targetPath = statePath(opts);
  const tempPath = `${targetPath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tempPath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(tempPath, targetPath);
}

export function parseNetworkFlag(argv: string[]): NetworkId | null {
  for (let i = 2; i < argv.length; i++) {
    const currentArg = argv[i];
    if (currentArg === '--network') {
      const nextArg = argv[i + 1];
      if (nextArg === undefined) throw new Error('--network requires a value');
      if (!isNetworkId(nextArg)) {
        throw new Error(`Unknown network: ${nextArg}. Supported: ${NETWORK_IDS.join(', ')}.`);
      }
      return nextArg;
    }
    if (currentArg.startsWith('--network=')) {
      const extractedVal = currentArg.slice('--network='.length);
      if (!isNetworkId(extractedVal)) {
        throw new Error(`Unknown network: ${extractedVal}. Supported: ${NETWORK_IDS.join(', ')}.`);
      }
      return extractedVal;
    }
  }
  return null;
}

interface ResolveOptions {
  argv?: string[];
  env?: NodeJS.ProcessEnv;
  cwd?: string;
}

export type ResolveSource = 'flag' | 'state' | 'default';

export interface ResolveResult {
  network: NetworkId;
  config: NetworkConfig;
  source: ResolveSource;
}

const ENV_OVERRIDES: Array<[keyof NetworkConfig, string]> = [
  ['indexer', 'MIDNIGHT_INDEXER_URL'],
  ['indexerWS', 'MIDNIGHT_INDEXER_WS_URL'],
  ['node', 'MIDNIGHT_NODE_URL'],
  ['faucet', 'MIDNIGHT_FAUCET_URL'],
  ['proofServer', 'MIDNIGHT_PROOF_SERVER_URL'],
];

function applyEnvOverrides(base: NetworkConfig, runtimeEnv: NodeJS.ProcessEnv): NetworkConfig {
  const output: NetworkConfig = { ...base, composeServices: [...base.composeServices] };
  for (const [field, varName] of ENV_OVERRIDES) {
    const val = runtimeEnv[varName];
    if (val) (output as unknown as Record<string, unknown>)[field] = val;
  }
  return output;
}

export function resolveNetwork(opts: ResolveOptions = {}): ResolveResult {
  const argv = opts.argv ?? process.argv;
  const runtimeEnv = opts.env ?? process.env;
  const cwd = opts.cwd ?? process.cwd();

  const networkFlag = parseNetworkFlag(argv);
  let network: NetworkId;
  let source: ResolveSource;

  if (networkFlag) {
    network = networkFlag;
    source = 'flag';
  } else {
    const envNetwork = runtimeEnv.MIDNIGHT_NETWORK;
    if (envNetwork && isNetworkId(envNetwork)) {
      network = envNetwork;
      source = 'default';
    } else {
      const persistedState = loadState({ cwd });
      if (persistedState) {
        network = persistedState.activeNetwork;
        source = 'state';
      } else {
        network = 'undeployed';
        source = 'default';
      }
    }
  }

  const config = applyEnvOverrides(NETWORK_CONFIGS[network], runtimeEnv);
  return { network, config, source };
}

export const GENESIS_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

export function normalizeMnemonic(mnemonic: string): string {
  return mnemonic.trim().toLowerCase().split(/\s+/).join(' ');
}

export function generateMnemonicPhrase(): string {
  return generateMnemonic(wordlist, 256);
}

export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(normalizeMnemonic(mnemonic), wordlist);
}

export function mnemonicToSeedHex(mnemonic: string): string {
  return Buffer.from(mnemonicToSeedSync(normalizeMnemonic(mnemonic))).toString('hex');
}

const SEED_HEX_RE = /^(?:[0-9a-fA-F]{2}){16,64}$/;

interface SeedOptions {
  env?: NodeJS.ProcessEnv;
  cwd?: string;
}

export interface WalletCredentials {
  seed: string;
  mnemonic: string | null;
  created: boolean;
}

export function getOrCreateWallet(network: NetworkId, opts: SeedOptions = {}): WalletCredentials {
  const runtimeEnv = opts.env ?? process.env;
  const cwd = opts.cwd ?? process.cwd();

  if (network === 'undeployed') return { seed: GENESIS_SEED, mnemonic: null, created: false };

  const envSeed = runtimeEnv.MIDNIGHT_WALLET_SEED;
  const envMnemonic = runtimeEnv.MIDNIGHT_WALLET_MNEMONIC;
  if (envSeed && envMnemonic) {
    throw new Error(
      'Both MIDNIGHT_WALLET_SEED and MIDNIGHT_WALLET_MNEMONIC are set — unset one.',
    );
  }
  if (envSeed) {
    const trimmed = envSeed.trim();
    const hex = trimmed.startsWith('0x') || trimmed.startsWith('0X') ? trimmed.slice(2) : trimmed;
    if (!SEED_HEX_RE.test(hex)) {
      throw new Error(
        'MIDNIGHT_WALLET_SEED must be 32-128 hex characters (16-64 whole bytes).',
      );
    }
    return { seed: hex, mnemonic: null, created: false };
  }
  if (envMnemonic) {
    if (!isValidMnemonic(envMnemonic)) {
      throw new Error(
        'MIDNIGHT_WALLET_MNEMONIC is not a valid BIP-39 recovery phrase.',
      );
    }
    return { seed: mnemonicToSeedHex(envMnemonic), mnemonic: normalizeMnemonic(envMnemonic), created: false };
  }

  const existing = loadState({ cwd });
  const persisted = existing?.wallets?.[network];
  if (persisted?.seed) {
    return { seed: persisted.seed, mnemonic: persisted.mnemonic ?? null, created: false };
  }

  const mnemonic = generateMnemonicPhrase();
  const seed = mnemonicToSeedHex(mnemonic);
  const nextState: NetworkState = existing ?? {
    version: STATE_VERSION,
    activeNetwork: network,
    wallets: {},
    deployments: {},
  };
  nextState.activeNetwork = network;
  nextState.wallets = {
    ...nextState.wallets,
    [network]: { seed, mnemonic, createdAt: new Date().toISOString() },
  };
  saveState(nextState, { cwd });
  return { seed, mnemonic, created: true };
}

export function formatWalletBackupNotice(
  wallet: WalletCredentials,
  network: NetworkId,
): string | null {
  if (!wallet.created || !wallet.mnemonic) return null;
  return [
    '',
    `  New ${network} wallet generated. Its 24-word recovery phrase:`,
    '',
    `    ${wallet.mnemonic}`,
    '',
    '  Write this phrase down — anyone holding it controls the wallet.',
    `  It also restores the same wallet in Lace, and is saved to ${STATE_FILE_NAME} (gitignored).`,
    '',
  ].join('\n');
}

export function recordDeployment(
  network: NetworkId,
  address: string,
  deployer: string,
  opts: FsOptions = {},
): void {
  const cwd = opts.cwd ?? process.cwd();
  const existing = loadState({ cwd });
  const nextState: NetworkState = existing ?? {
    version: STATE_VERSION,
    activeNetwork: network,
    wallets: {},
    deployments: {},
  };
  nextState.deployments = {
    ...nextState.deployments,
    [network]: { address, deployer, deployedAt: new Date().toISOString() },
  };
  saveState(nextState, { cwd });
}

export function getDeployedContractAddress(network: NetworkId = 'preprod'): string | null {
  const currentState = loadState();
  return currentState?.deployments?.[network]?.address ?? null;
}
