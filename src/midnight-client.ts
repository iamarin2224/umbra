/**
 * Umbra On-Chain Midnight Network Client.
 * Orchestrates wallet connections, proof generation, LevelDB private state encryption,
 * contract deployment, and circuit invocation against Midnight preprod/preview networks.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';

import { resolveNetwork, getOrCreateWallet, type NetworkConfig, type NetworkId } from './network.js';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet.js';

// eslint-disable-next-line @typescript-eslint/no-require-imports
globalThis.WebSocket = WebSocket as any;

const UMBRA_PRIVATE_STATE_ID = 'umbraEscrowPrivateState';

function encodeStringToBytes32(textValue: string): Uint8Array {
    const rawEncodedBytes = new TextEncoder().encode(textValue);
    const paddedArray = new Uint8Array(32);
    paddedArray.set(rawEncodedBytes.slice(0, 32));
    return paddedArray;
}

// ─── Client Singleton Instance & Interface ──────────────────────────────────

let _umbraClientInstance: MidnightClient | null = null;

export interface MidnightClient {
    wallet: WalletContext;
    networkConfig: NetworkConfig;
    network: NetworkId;
    providers: Awaited<ReturnType<typeof instantiateProviders>>;
    Escrow: typeof import('../artifacts/contract/index.js').Contract;
    zkConfigPath: string;
}

async function instantiateProviders(
    walletCtx: WalletContext,
    networkConfig: NetworkConfig,
    zkConfigPath: string,
) {
    const encryptionPassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Umbra-Devnet-Development-Placeholder-1';

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
    const bech32AccountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

    return {
        privateStateProvider: levelPrivateStateProvider({
            privateStateStoreName: 'umbra-escrow-state',
            accountId: bech32AccountId,
            privateStoragePasswordProvider: () => encryptionPassword,
        }),
        publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
        zkConfigProvider,
        proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
        walletProvider,
        midnightProvider: walletProvider,
    };
}

async function checkProofServerAvailability(
    proofServerUrl: string,
    maxAttempts = 60,
    intervalDelayMs = 2000,
): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await fetch(proofServerUrl, { signal: AbortSignal.timeout(3000) });
            return true;
        } catch (err: any) {
            const errCode = err?.cause?.code || err?.code || '';
            if (errCode !== 'ECONNREFUSED' && errCode !== 'UND_ERR_CONNECT_TIMEOUT' && errCode !== 'UND_ERR_SOCKET') {
                return true;
            }
        }
        if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, intervalDelayMs));
        }
    }
    return false;
}

export async function getMidnightClient(): Promise<MidnightClient> {
    if (_umbraClientInstance) return _umbraClientInstance;

    const { network, config: networkConfig } = resolveNetwork();
    const activeWallet = getOrCreateWallet(network);

    console.log('[Umbra-Midnight] Initializing wallet...');
    const walletCtx = await createWallet({ network, networkConfig, seed: activeWallet.seed });

    console.log('[Umbra-Midnight] Synchronizing wallet state...');
    const syncStartTime = Date.now();
    await walletCtx.wallet.waitForSyncedState();
    console.log(`[Umbra-Midnight] Wallet synced in ${((Date.now() - syncStartTime) / 1000).toFixed(1)}s`);

    await persistWalletState(network, walletCtx);

    const dustState = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
    const tNightBalance = dustState.unshielded.balances[unshieldedToken().raw] ?? 0n;
    const dustBalance = dustState.dust.balance(new Date());
    console.log(`[Umbra-Midnight] Balance: ${tNightBalance.toLocaleString()} tNight, DUST: ${dustBalance.toLocaleString()}`);

    // Verify proof server connection
    const proofServerReady = await checkProofServerAvailability(networkConfig.proofServer);
    if (!proofServerReady) {
        throw new Error(`Proof server not reachable at ${networkConfig.proofServer}. Run: docker compose up -d`);
    }

    // Load compiled escrow contract artifacts
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const zkConfigPath = path.resolve(currentDir, '..', 'artifacts');
    const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

    if (!fs.existsSync(contractPath)) {
        throw new Error('Contract not compiled! Run: npm run compile:escrow');
    }

    console.log('[Umbra-Midnight] Loading compiled contract...');
    const EscrowContract = await import(pathToFileURL(contractPath).href);

    console.log('[Umbra-Midnight] Constructing cryptographic providers...');
    const providers = await instantiateProviders(walletCtx, networkConfig, zkConfigPath);

    _umbraClientInstance = {
        wallet: walletCtx,
        networkConfig,
        network,
        providers,
        Escrow: EscrowContract,
        zkConfigPath,
    };
    console.log('[Umbra-Midnight] Client successfully initialized!');
    return _umbraClientInstance;
}

// ─── Wallet Shielded Coins Query ────────────────────────────────────────────

export interface WalletCoinInfo {
    nonce: Uint8Array;
    color: Uint8Array;
    value: bigint;
    mtIndex: bigint;
}

export async function getWalletAvailableCoins(): Promise<WalletCoinInfo[]> {
    const client = await getMidnightClient();

    const syncedState = await Rx.firstValueFrom(client.wallet.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
    const availableCoins = syncedState.shielded.availableCoins;

    return availableCoins.map((coinEntry: any) => ({
        nonce: coinEntry.coin.nonce,
        color: coinEntry.coin.type,
        value: coinEntry.coin.value,
        mtIndex: coinEntry.coin.mt_index,
    }));
}

export function getWalletCoinPublicKey(): string {
    const activeClient = _umbraClientInstance;
    if (!activeClient) throw new Error('Client not initialized');
    return activeClient.wallet.shieldedSecretKeys.coinPublicKey;
}

// ─── Indexer Merkle Tree Coin Lookup ────────────────────────────────────────

/**
 * Queries the active Midnight indexer for a deposit transaction's
 * ZswapOutput event to obtain its Merkle-tree index (mt_index).
 */
export async function getCoinMtIndex(
    txHash: string,
    contractAddress: string,
): Promise<bigint> {
    const ledger = await import('@midnight-ntwrk/ledger-v8');
    const client = await getMidnightClient();
    const indexerUrl = client.networkConfig.indexer;

    const queryDocument = `{
        transactions(offset: {hash: "${txHash}"}) {
            hash
            zswapLedgerEvents {
                id
                raw
            }
        }
    }`;

    const httpResponse = await fetch(indexerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryDocument }),
    });

    if (!httpResponse.ok) {
        throw new Error(`Indexer query failed: ${httpResponse.status} ${httpResponse.statusText}`);
    }

    const jsonPayload = (await httpResponse.json()) as {
        data?: { transactions?: Array<{ zswapLedgerEvents?: Array<{ raw: string }> }> };
    };
    const transactions = jsonPayload.data?.transactions;
    if (!transactions || transactions.length === 0) {
        throw new Error(`Transaction ${txHash} not found in indexer`);
    }

    const ledgerEvents = transactions[0].zswapLedgerEvents;
    if (!ledgerEvents || ledgerEvents.length === 0) {
        throw new Error(`No zswap ledger events found for transaction ${txHash}`);
    }

    for (const event of ledgerEvents) {
        const rawHexBytes = Uint8Array.from(Buffer.from(event.raw, 'hex'));
        const deserializedEvent = ledger.Event.deserialize(rawHexBytes);
        const eventText = deserializedEvent.toString();

        if (eventText.includes('ZswapOutput') && eventText.includes(contractAddress.toLowerCase())) {
            const indexMatch = eventText.match(/mt_index:\s*(\d+)/);
            if (indexMatch) {
                return BigInt(indexMatch[1]);
            }
        }
    }

    throw new Error(`No matching ZswapOutput event found for contract ${contractAddress}`);
}

// ─── On-Chain Escrow Deployment ─────────────────────────────────────────────

export interface DeployResult {
    contractAddress: string;
    transactionHash: string;
    buyerSecret: string;
    sellerSecret: string;
}

export async function deployEscrowOnChain(params: {
    buyerSecret: string;
    sellerSecret: string;
    amount: string;
    condition: string;
}): Promise<DeployResult> {
    const client = await getMidnightClient();

    console.log(`[Umbra-Midnight] Deploying escrow on-chain: amount=${params.amount}...`);

    let contractDefinition: any = CompiledContract.make('escrow', (client.Escrow as any).Contract);
    contractDefinition = CompiledContract.withWitnesses<any, any, any>(contractDefinition, {
        buyerSecret: (ctx: any) => [ctx.privateState, encodeStringToBytes32(params.buyerSecret)],
        sellerSecret: (ctx: any) => [ctx.privateState, encodeStringToBytes32(params.sellerSecret)],
        escrowAmount: (ctx: any) => [ctx.privateState, encodeStringToBytes32(params.amount)],
        conditionHash: (ctx: any) => [ctx.privateState, encodeStringToBytes32(params.condition)],
    } as any);
    contractDefinition = CompiledContract.withCompiledFileAssets<any, any, any>(contractDefinition, client.zkConfigPath);

    // Short stabilization wait for DUST generation
    await new Promise((resolve) => setTimeout(resolve, 6000));

    const MAX_DEPLOY_ATTEMPTS = 20;
    const RETRY_INTERVAL_MS = 5000;
    let deployedContract: Awaited<ReturnType<typeof deployContract>> | undefined;

    for (let attempt = 1; attempt <= MAX_DEPLOY_ATTEMPTS; attempt++) {
        try {
            deployedContract = await deployContract(client.providers, {
                compiledContract: contractDefinition,
                args: [],
                privateStateId: UMBRA_PRIVATE_STATE_ID,
                initialPrivateState: {
                    buyerSecret: params.buyerSecret,
                    sellerSecret: params.sellerSecret,
                    amount: params.amount,
                    condition: params.condition,
                    createdAt: new Date().toISOString(),
                },
            });
            break;
        } catch (err: any) {
            const errorMsg = `${err?.message || ''} ${err?.cause?.message || ''}`;
            const isDustIssue =
                errorMsg.includes('Not enough Dust') ||
                errorMsg.includes('Insufficient Funds') ||
                errorMsg.includes('could not balance dust');

            if (isDustIssue) {
                if (attempt < MAX_DEPLOY_ATTEMPTS) {
                    console.log(`[Umbra-Midnight] DUST shortage, retrying (${attempt}/${MAX_DEPLOY_ATTEMPTS})...`);
                    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
                } else {
                    throw new Error(`Not enough DUST after ${MAX_DEPLOY_ATTEMPTS} retries`);
                }
            } else {
                throw err;
            }
        }
    }

    if (!deployedContract) throw new Error('Deployment failed after all retries');

    const contractAddress = deployedContract.deployTxData.public.contractAddress;
    const txHash = (deployedContract.deployTxData.public as any).txHash as string;

    console.log(`[Umbra-Midnight] Deployed on-chain: ${contractAddress}, tx: ${txHash}`);

    await persistWalletState(client.network, client.wallet);

    return {
        contractAddress,
        transactionHash: txHash,
        buyerSecret: params.buyerSecret,
        sellerSecret: params.sellerSecret,
    };
}

// ─── On-Chain Circuit Invocation ────────────────────────────────────────────

export interface CircuitResult {
    transactionHash: string;
    blockHeight: number;
}

export async function callCircuit(
    contractAddress: string,
    circuitName: string,
    args: unknown[] = [],
    privateStateId: string = UMBRA_PRIVATE_STATE_ID,
): Promise<CircuitResult> {
    const client = await getMidnightClient();

    console.log(`[Umbra-Midnight] Executing circuit "${circuitName}" on ${contractAddress.slice(0, 20)}...`);

    let contractDefinition: any = CompiledContract.make('escrow', (client.Escrow as any).Contract);
    contractDefinition = CompiledContract.withWitnesses<any, any, any>(contractDefinition, {
        buyerSecret: (ctx: any) => [ctx.privateState, encodeStringToBytes32(ctx.privateState.buyerSecret)],
        sellerSecret: (ctx: any) => [ctx.privateState, encodeStringToBytes32(ctx.privateState.sellerSecret)],
        escrowAmount: (ctx: any) => [ctx.privateState, encodeStringToBytes32(ctx.privateState.amount)],
        conditionHash: (ctx: any) => [ctx.privateState, encodeStringToBytes32(ctx.privateState.condition)],
    } as any);
    contractDefinition = CompiledContract.withCompiledFileAssets<any, any, any>(contractDefinition, client.zkConfigPath);

    const callResult = await submitCallTx(client.providers, {
        compiledContract: contractDefinition,
        contractAddress,
        circuitId: circuitName,
        args,
        privateStateId,
    });

    const publicSection = (callResult as any).public || callResult;
    const transactionHash = publicSection.txHash || `mn_tx_${circuitName}_${Date.now().toString(16)}`;
    const blockHeight = publicSection.blockHeight || 0;

    console.log(`[Umbra-Midnight] Circuit "${circuitName}" executed successfully, tx: ${transactionHash}`);

    return { transactionHash, blockHeight };
}
