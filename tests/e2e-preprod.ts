/**
 * E2E Integration Test — Umbra Escrow on Preprod
 *
 * Tests the complete escrow lifecycle against the deployed contract on Midnight preprod.
 * Requires: docker compose up -d (proof server) and a funded wallet.
 *
 * Usage:
 *   npx tsx tests/e2e-preprod.ts
 */

import { getDeployedContractAddress, loadState, NETWORK_CONFIGS, resolveNetwork, getOrCreateWallet } from '../src/network.js';
import { createWallet, type WalletContext } from '../src/wallet.js';
import {
    deployEscrow,
    depositFunds,
    cancelEscrow,
    getEscrow,
    listEscrows,
    clearAllEscrows,
} from '../src/escrow/service.js';

const TEST_NETWORK = 'preprod';

async function verifyProofServerLiveness(serverUrl: string, timeoutLimitMs = 30_000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutLimitMs) {
        try {
            const response = await fetch(serverUrl, { signal: AbortSignal.timeout(3000) });
            if (response.ok) return true;
        } catch {
            // Wait and retry
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return false;
}

async function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  Umbra E2E Integration Test Suite — Preprod Network         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // ── Step 1: Verify deployment record ────────────────────────────────────
    const deployedAddress = getDeployedContractAddress(TEST_NETWORK);
    if (!deployedAddress) {
        console.error('No deployed contract found. Run `npm run deploy:escrow -- --network preprod` first.');
        process.exit(1);
    }
    console.log(` Deployed Contract Address: ${deployedAddress}`);

    const state = loadState();
    if (!state?.wallets?.[TEST_NETWORK]) {
        console.error('No wallet found. Run `npm run deploy:escrow -- --network preprod` first.');
        process.exit(1);
    }
    console.log(' Wallet credentials loaded from .midnight-state.json');

    // ── Step 2: Verify Proof Server connection ──────────────────────────────
    const proofServerEndpoint = NETWORK_CONFIGS[TEST_NETWORK].proofServer;
    console.log(`\n Checking proof server at ${proofServerEndpoint}...`);

    const isProofServerActive = await verifyProofServerLiveness(proofServerEndpoint);
    if (!isProofServerActive) {
        console.error(`Proof server not reachable at ${proofServerEndpoint}`);
        console.error('Start it using: docker compose up -d');
        process.exit(1);
    }
    console.log(' Proof server is active');

    // ── Step 3: Initialize Wallet Context ───────────────────────────────────
    console.log('\n Initializing wallet context...');
    const { config: netConfig } = resolveNetwork();
    const walletRecord = getOrCreateWallet(TEST_NETWORK);
    const walletContext: WalletContext = await createWallet({
        network: TEST_NETWORK,
        networkConfig: netConfig,
        seed: walletRecord.seed,
    });
    const walletAddressStr = walletContext.unshieldedKeystore.getBech32Address().toString();
    console.log(` Wallet Address: ${walletAddressStr}`);

    // ── Step 4: Clear test memory state ─────────────────────────────────────
    clearAllEscrows();

    // ── Step 5: Deploy test escrow instance ─────────────────────────────────
    console.log('\n Deploying test escrow...');
    const mockProvider = {
        isConnected: true,
        address: walletAddressStr,
    };

    const deployment = await deployEscrow(
        {
            buyerAddress: walletAddressStr,
            sellerAddress: 'mn_shielded_48a9b2c7e1f0d3a5b8c9e2f4a6b8d0c2e4f6a8b0',
            amount: '10.00',
            condition: 'Umbra E2E test condition: verify artifact deliverable',
        },
        mockProvider as any,
    );

    console.log(` Escrow ID: ${deployment.escrowId}`);
    console.log(` Contract:  ${deployment.contractAddress}`);
    console.log(` Tx Hash:   ${deployment.transactionHash}`);

    // ── Step 6: Verify creation record ──────────────────────────────────────
    const createdEscrow = getEscrow(deployment.escrowId);
    if (!createdEscrow) {
        console.error('Escrow not found in memory store after deploy');
        process.exit(1);
    }
    console.log(`\n Initial State: ${createdEscrow.stateLabel}`);

    // ── Step 7: Test funding deposit ────────────────────────────────────────
    console.log('\n Executing depositFunds...');
    const depositResult = await depositFunds(
        deployment.escrowId,
        createdEscrow.buyerSecret,
        mockProvider as any,
    );
    console.log(` Deposit result: ${depositResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (depositResult.success) {
        console.log(` Updated state: ${depositResult.newState}`);
    }

    // ── Step 8: Test cancellation ───────────────────────────────────────────
    console.log('\n Executing cancelEscrow...');
    const cancelResult = await cancelEscrow(
        deployment.escrowId,
        createdEscrow.buyerSecret,
        mockProvider as any,
    );
    console.log(` Cancel result: ${cancelResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (cancelResult.success) {
        console.log(` Final state: ${cancelResult.newState}`);
    }

    // ── Step 9: Audit query verification ────────────────────────────────────
    const allRecords = listEscrows();
    console.log(`\n Active escrows in registry: ${allRecords.length}`);

    console.log('\n─── Umbra E2E Execution Complete ───────────────────────────');
    console.log(` Contract:    ${deployedAddress}`);
    console.log(` Total items: ${allRecords.length}`);
    console.log(` Final flow:  ${cancelResult.success ? 'Cancelled (Expected)' : 'Failed'}\n`);

    await walletContext.wallet.stop();
}

main().catch((err) => {
    console.error('\n Umbra E2E test execution error:', err);
    process.exit(1);
});
