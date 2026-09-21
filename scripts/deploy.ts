/**
 * Deploy Umbra escrow contract to a Midnight network.
 *
 * Usage:
 *   npm run deploy:escrow -- --network preprod
 *   npm run deploy:escrow -- --network undeployed
 *
 * The script uses the wallet seed from .midnight-state.json or MIDNIGHT_WALLET_SEED env var.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';

import { resolveNetwork, getOrCreateWallet, formatWalletBackupNotice, recordDeployment } from '../src/network.js';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from '../src/wallet.js';

function encodeStringToBytes32(textValue: string): Uint8Array {
  const rawBytes = new TextEncoder().encode(textValue);
  const outBuffer = new Uint8Array(32);
  outBuffer.set(rawBytes.slice(0, 32));
  return outBuffer;
}

// @ts-expect-error WebSocket polyfill for wallet client
globalThis.WebSocket = WebSocket;

const UMBRA_PRIVATE_STATE_ID = 'umbraEscrowPrivateState';

// ─── Network Configuration ──────────────────────────────────────────────────

const { network, config: networkConfig } = resolveNetwork();
const WALLET = getOrCreateWallet(network);
const SEED = WALLET.seed;
{
  const backupNotice = formatWalletBackupNotice(WALLET, network);
  if (backupNotice) console.log(backupNotice);
}

// ─── Proof Server Liveness ──────────────────────────────────────────────────

async function waitForProofServer(maxAttempts = 60, intervalDelayMs = 2000): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fetch(networkConfig.proofServer, {
        signal: AbortSignal.timeout(3000),
      });
      return true;
    } catch (err: any) {
      const code = err?.cause?.code || err?.code || '';
      if (code !== 'ECONNREFUSED' && code !== 'UND_ERR_CONNECT_TIMEOUT' && code !== 'UND_ERR_SOCKET') {
        return true;
      }
    }
    if (attempt < maxAttempts) {
      process.stdout.write(`\r  Waiting for proof server... (${attempt}/${maxAttempts})   `);
      await new Promise((resolve) => setTimeout(resolve, intervalDelayMs));
    }
  }
  return false;
}

// ─── Contract Artifacts Loading ─────────────────────────────────────────────

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(currentDir, '..', 'artifacts');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\n  Contract not compiled! Run: npm run compile:escrow\n');
  process.exit(1);
}

const EscrowContract = await import(pathToFileURL(contractPath).href);

// ─── Cryptographic Providers ────────────────────────────────────────────────

async function createDeploymentProviders(walletCtx: WalletContext) {
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Umbra-Devnet-Development-Placeholder-1';

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'umbra-escrow-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

// ─── CLI Arguments Parsing ──────────────────────────────────────────────────

function parseCliArgs(argv: string[]): { buyerSecret: string; sellerSecret: string; amount: string; condition: string } {
  const parsedArgs: Record<string, string> = {};
  for (let index = 2; index < argv.length; index++) {
    const currentToken = argv[index];
    if (currentToken === '--buyer-secret') parsedArgs.buyerSecret = argv[++index] ?? '';
    if (currentToken === '--seller-secret') parsedArgs.sellerSecret = argv[++index] ?? '';
    if (currentToken === '--amount') parsedArgs.amount = argv[++index] ?? '';
    if (currentToken === '--condition') parsedArgs.condition = argv[++index] ?? '';
  }
  return {
    buyerSecret: parsedArgs.buyerSecret || crypto.randomUUID().replace(/-/g, ''),
    sellerSecret: parsedArgs.sellerSecret || crypto.randomUUID().replace(/-/g, ''),
    amount: parsedArgs.amount || '1000',
    condition: parsedArgs.condition || 'Deliver goods as agreed in escrow',
  };
}

// ─── Main Execution ─────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  Deploy Umbra Escrow to ${network.padEnd(36)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('--- Wallet Initialization --------------------------------------\n');
  console.log('  Creating wallet...');
  const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
  const restoredCount = Object.values(walletCtx.restored).filter(Boolean).length;
  if (restoredCount > 0) {
    console.log(`  Restored ${restoredCount}/3 child wallets from persistent cache.`);
  }

  console.log('  Syncing with network state...');
  const syncStartTime = Date.now();
  const syncInterval = setInterval(() => {
    const elapsedSeconds = Math.round((Date.now() - syncStartTime) / 1000);
    process.stdout.write(`\r  Sync in progress... (${elapsedSeconds}s elapsed)   `);
  }, 5000);
  const syncedWalletState = await walletCtx.wallet.waitForSyncedState();
  clearInterval(syncInterval);
  process.stdout.write('\r  Synchronized with network successfully.                     \n');

  await persistWalletState(network, walletCtx);

  const walletBech32Address = walletCtx.unshieldedKeystore.getBech32Address();
  const currentTNightBalance = syncedWalletState.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`\n  Wallet Address: ${walletBech32Address}`);
  console.log(`  Balance: ${currentTNightBalance.toLocaleString()} tNight\n`);

  if (network !== 'undeployed' && networkConfig.faucet) {
    const freshState = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(
      Rx.filter((s) => s.isSynced),
    ));
    const unshieldedBalance = freshState.unshielded.balances[unshieldedToken().raw] ?? 0n;
    if (unshieldedBalance === 0n) {
      console.log('--- Fund Wallet via Faucet -------------------------------------\n');
      console.log(`  Address: ${walletBech32Address}`);
      console.log(`  Faucet:  ${networkConfig.faucet}`);
      console.log('  Awaiting incoming testnet funding (polling every 10s)...');
      const faucetTimeoutConfig = Number(process.env.MIDNIGHT_FAUCET_TIMEOUT_MS);
      const timeoutDurationMs = Number.isFinite(faucetTimeoutConfig) && faucetTimeoutConfig > 0 ? faucetTimeoutConfig : 600_000;
      const pollingStart = Date.now();
      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        const updated = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
        const newBalance = updated.unshielded.balances[unshieldedToken().raw] ?? 0n;
        if (newBalance > 0n) {
          console.log(`\n  Funded! tNIGHT balance: ${newBalance.toLocaleString()}\n`);
          break;
        }
        if (Date.now() - pollingStart > timeoutDurationMs) {
          console.log(`\n  Funding timeout reached (${Math.round(timeoutDurationMs / 60_000)} min).`);
          await walletCtx.wallet.stop();
          process.exit(1);
        }
        const elapsed = Math.round((Date.now() - pollingStart) / 1000);
        process.stdout.write(`\r  ...waiting for funds (${elapsed}s elapsed)`);
      }
    }
  }

  // DUST Registration & Balance Check
  console.log('--- DUST Token Setup -------------------------------------------\n');
  const dustState = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));

  const unregisteredUtxos = dustState.unshielded.availableCoins.filter(
    (coin: any) => !coin.meta?.registeredForDustGeneration,
  );
  if (unregisteredUtxos.length > 0) {
    console.log(`  Registering ${unregisteredUtxos.length} NIGHT UTXOs for DUST generation...`);
    const recipe = await walletCtx.wallet.registerNightUtxosForDustGeneration(
      unregisteredUtxos,
      walletCtx.unshieldedKeystore.getPublicKey(),
      (payload) => walletCtx.unshieldedKeystore.signData(payload),
    );
    const finalized = await walletCtx.wallet.finalizeRecipe(recipe);
    await walletCtx.wallet.submitTransaction(finalized);
  }

  if (dustState.dust.balance(new Date()) === 0n) {
    console.log('  Awaiting DUST token generation...');
    await Rx.firstValueFrom(
      walletCtx.wallet.state().pipe(
        Rx.throttleTime(5000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n),
      ),
    );
  }
  console.log('  DUST tokens ready!\n');

  // Deploy Contract
  console.log('--- Deploy Umbra Escrow ----------------------------------------\n');

  console.log('  Checking proof server connectivity...');
  const isProofServerReady = await waitForProofServer();
  if (!isProofServerReady) {
    console.log('\n  Proof server unreachable. Run: docker compose up -d\n');
    await walletCtx.wallet.stop();
    process.exit(1);
  }
  process.stdout.write('\r  Proof server is responsive!                         \n');

  const cliParams = parseCliArgs(process.argv);
  const buyerSecret = cliParams.buyerSecret;
  const sellerSecret = cliParams.sellerSecret;
  const amount = cliParams.amount;
  const condition = cliParams.condition;

  console.log(`  Buyer secret:  ${buyerSecret.slice(0, 16)}...`);
  console.log(`  Seller secret: ${sellerSecret.slice(0, 16)}...`);
  console.log(`  Amount:        ${amount}`);
  console.log(`  Condition:     ${condition}\n`);

  console.log('  Initializing deployment providers...');
  const providers = await createDeploymentProviders(walletCtx);

  let compiledContract: any = CompiledContract.make('escrow', EscrowContract.Contract);
  compiledContract = CompiledContract.withWitnesses<any, any, any>(compiledContract, {
    buyerSecret: (ctx: any) => [ctx.privateState, encodeStringToBytes32(buyerSecret)],
    sellerSecret: (ctx: any) => [ctx.privateState, encodeStringToBytes32(sellerSecret)],
    escrowAmount: (ctx: any) => [ctx.privateState, encodeStringToBytes32(amount)],
    conditionHash: (ctx: any) => [ctx.privateState, encodeStringToBytes32(condition)],
  } as any);
  compiledContract = CompiledContract.withCompiledFileAssets<any, any, any>(compiledContract, zkConfigPath);

  process.stdout.write('  Stabilizing DUST balance...');
  await new Promise((resolve) => setTimeout(resolve, 6000));
  process.stdout.write(' done.\n');

  console.log('  Submitting on-chain contract deployment transaction...\n');

  const MAX_ATTEMPTS = 20;
  const RETRY_DELAY_MS = 5000;
  let deploymentResult: Awaited<ReturnType<typeof deployContract>> | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      deploymentResult = await deployContract(providers, {
        compiledContract,
        args: [],
        privateStateId: UMBRA_PRIVATE_STATE_ID,
        initialPrivateState: {
          buyerSecret,
          sellerSecret,
          amount,
          condition,
          createdAt: new Date().toISOString(),
        },
      });
      break;
    } catch (err: any) {
      const errorMsg = `${err?.message || ''} ${err?.cause?.message || ''}`;
      const isDustShortage =
        errorMsg.includes('Not enough Dust') ||
        errorMsg.includes('Insufficient Funds') ||
        errorMsg.includes('could not balance dust');

      if (!(isDustShortage && attempt === 1)) {
        console.error(`\n  Attempt ${attempt} error: ${err?.message || err}`);
      }

      if (isDustShortage) {
        const liveState = await walletCtx.wallet.waitForSyncedState();
        const liveDust = liveState.dust.balance(new Date());
        if (attempt < MAX_ATTEMPTS) {
          console.log(`  DUST balance: ${liveDust.toLocaleString()} (attempt ${attempt}/${MAX_ATTEMPTS}); retrying in ${RETRY_DELAY_MS / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        } else {
          console.log(`  DUST balance insufficient after ${MAX_ATTEMPTS} retries.`);
          await walletCtx.wallet.stop();
          process.exit(1);
        }
      } else {
        throw err;
      }
    }
  }

  if (!deploymentResult) throw new Error('Deployment failed after all retries');

  const contractAddress = deploymentResult.deployTxData.public.contractAddress;
  const txHash = (deploymentResult.deployTxData.public as any).txHash as string;

  console.log('  Umbra escrow deployed successfully!\n');
  console.log(`  Contract Address: ${contractAddress}`);
  console.log(`  Transaction:     ${txHash}`);
  console.log(`  Buyer Secret:    ${buyerSecret}`);
  console.log(`  Seller Secret:   ${sellerSecret}\n`);

  recordDeployment(network, contractAddress, walletBech32Address.toString());
  console.log('  Deployment recorded in .midnight-state.json\n');

  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
  console.log('--- Deployment Complete ----------------------------------------\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
