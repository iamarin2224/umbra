/**
 * E2E Integration Test — Umbra Escrow on Preprod (fully real, no mocks)
 *
 * Executes the complete escrow lifecycle against the deployed Compact contract
 * on Midnight preprod, persisting every step to Supabase and verifying the
 * append-only event log.
 *
 * Requirements:
 *   1. docker compose up -d          (proof server on :6300)
 *   2. A funded wallet + deployment  (npm run deploy:escrow -- --network preprod)
 *   3. Supabase configured           (SUPABASE_URL, SUPABASE_ANON_KEY in .env.local)
 *   4. supabase/schema.sql applied   (escrows + escrow_events tables)
 *
 * Usage:
 *   npx tsx tests/e2e-preprod.ts
 *   # or: npm run test:e2e
 */
import {
    getDeployedContractAddress,
    loadState,
    NETWORK_CONFIGS,
} from '../src/network.js';
import {
    configureEscrowService,
    resetEscrowService,
    deployEscrow,
    executeEscrowAction,
    getEscrow,
    listEvents,
} from '../src/escrow/service.js';
import { createSupabaseEscrowRepository, isSupabaseConfigured } from '../src/escrow/repository.js';
import { createMidnightChainGateway } from '../src/escrow/gateway.js';
import { getMidnightClient, getWalletCoinPublicKey } from '../src/midnight-client.js';
import { EscrowState } from '../src/escrow/types.js';

const TEST_NETWORK = 'preprod';

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(`ASSERTION FAILED: ${message}`);
    }
}

async function verifyProofServerLiveness(serverUrl: string, timeoutLimitMs = 30_000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutLimitMs) {
        try {
            const response = await fetch(serverUrl, { signal: AbortSignal.timeout(3000) });
            if (response.ok) return true;
        } catch {
            // retry until timeout
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return false;
}

async function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  Umbra E2E Integration Test Suite — Preprod Network         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // ── Step 1: Preflight — deployment record ───────────────────────────────
    const deployedAddress = getDeployedContractAddress(TEST_NETWORK);
    if (!deployedAddress) {
        console.error('No deployed contract found. Run `npm run deploy:escrow -- --network preprod` first.');
        process.exit(1);
    }
    console.log(`✓ Deployed Contract Address: ${deployedAddress}`);

    const state = loadState();
    if (!state?.wallets?.[TEST_NETWORK]) {
        console.error('No wallet found. Run `npm run deploy:escrow -- --network preprod` first.');
        process.exit(1);
    }
    console.log('✓ Wallet credentials loaded from .midnight-state.json');

    // ── Step 2: Preflight — Supabase (required, no offline fallback) ────────
    if (!isSupabaseConfigured()) {
        console.error('SUPABASE_URL / SUPABASE_ANON_KEY are not set.');
        console.error('Copy .env.supabase.example to .env.local, fill in values, and re-run.');
        process.exit(1);
    }
    console.log('✓ Supabase configuration present');

    // ── Step 3: Preflight — proof server ────────────────────────────────────
    const proofServerEndpoint = NETWORK_CONFIGS[TEST_NETWORK].proofServer;
    console.log(`\nChecking proof server at ${proofServerEndpoint}...`);
    const isProofServerActive = await verifyProofServerLiveness(proofServerEndpoint);
    if (!isProofServerActive) {
        console.error(`Proof server not reachable at ${proofServerEndpoint}`);
        console.error('Start it using: docker compose up -d');
        process.exit(1);
    }
    console.log('✓ Proof server is active');

    // ── Step 4: Wire the real service (Supabase repo + Midnight gateway) ────
    resetEscrowService();
    configureEscrowService({
        repository: createSupabaseEscrowRepository(),
        gateway: createMidnightChainGateway(),
    });
    console.log('✓ Service wired to real Supabase repository and Midnight chain gateway');

    // ── Step 5: Initialize wallet & client (funds, DUST, contract assets) ──
    console.log('\nInitializing Midnight client (wallet sync + proof provider)...');
    await getMidnightClient();
    const sellerCoinPubKey = getWalletCoinPublicKey();
    console.log(`✓ Client ready. Enclave coin public key: ${sellerCoinPubKey.slice(0, 16)}...`);

    // ── Step 6: Happy path — create → deposit → confirmDelivery → release ──
    console.log('\n─── Scenario A: Full settlement lifecycle ─────────────────────');
    const deploymentA = await deployEscrow({
        buyerAddress: `e2e_buyer_${Date.now()}`,
        sellerAddress: `e2e_seller_${Date.now()}`,
        amount: '1000',
        condition: 'Umbra E2E: deliver verification artifacts',
    });
    console.log(`✓ Escrow A deployed: ${deploymentA.escrowId}`);
    console.log(`  Contract: ${deploymentA.contractAddress}`);
    console.log(`  Tx:       ${deploymentA.transactionHash}`);

    let recordA = await getEscrow(deploymentA.escrowId);
    assert(recordA, 'escrow A must exist after deploy');
    assert(recordA.state === EscrowState.Created, 'escrow A must start in Created');

    const depositA = await executeEscrowAction(deploymentA.escrowId, 'deposit', {
        secret: recordA.buyerSecret,
        value: recordA.amount,
    });
    console.log(`✓ deposit → ${depositA.newState} (tx ${depositA.transactionHash})`);
    if (depositA.warning) console.warn(`  warning: ${depositA.warning}`);

    recordA = await getEscrow(deploymentA.escrowId);
    assert(recordA?.state === EscrowState.Funded, 'escrow A must be Funded after deposit');
    assert(recordA?.depositCoinIndex, 'deposit coin index must be persisted');

    const confirmA = await executeEscrowAction(deploymentA.escrowId, 'confirmDelivery', {
        secret: recordA.sellerSecret,
    });
    console.log(`✓ confirmDelivery → ${confirmA.newState} (tx ${confirmA.transactionHash})`);

    recordA = await getEscrow(deploymentA.escrowId);
    assert(recordA?.state === EscrowState.Delivered, 'escrow A must be Delivered');

    const releaseA = await executeEscrowAction(deploymentA.escrowId, 'release', {
        secret: recordA.buyerSecret,
        sellerPubKey: sellerCoinPubKey,
    });
    console.log(`✓ release → ${releaseA.newState} (tx ${releaseA.transactionHash})`);

    recordA = await getEscrow(deploymentA.escrowId);
    assert(recordA?.state === EscrowState.Released, 'escrow A must be Released');

    // ── Step 7: Cancel path — create → cancel ───────────────────────────────
    console.log('\n─── Scenario B: Cancellation lifecycle ────────────────────────');
    const deploymentB = await deployEscrow({
        buyerAddress: `e2e_buyer_cancel_${Date.now()}`,
        sellerAddress: `e2e_seller_cancel_${Date.now()}`,
        amount: '500',
        condition: 'Umbra E2E: cancel path',
    });
    console.log(`✓ Escrow B deployed: ${deploymentB.escrowId}`);

    const recordB = await getEscrow(deploymentB.escrowId);
    assert(recordB, 'escrow B must exist after deploy');

    const cancelB = await executeEscrowAction(deploymentB.escrowId, 'cancel', {
        secret: recordB.buyerSecret,
    });
    console.log(`✓ cancel → ${cancelB.newState} (tx ${cancelB.transactionHash})`);

    const finalB = await getEscrow(deploymentB.escrowId);
    assert(finalB?.state === EscrowState.Cancelled, 'escrow B must be Cancelled');

    // ── Step 8: Verify the persisted event log ──────────────────────────────
    console.log('\n─── Event log verification ────────────────────────────────────');
    const eventsA = await listEvents(deploymentA.escrowId);
    const actionsA = eventsA.map((e) => e.action).reverse();
    console.log(`Escrow A events: ${actionsA.join(' → ')}`);
    assert(
        JSON.stringify(actionsA) === JSON.stringify(['created', 'deposit', 'confirmDelivery', 'release']),
        `unexpected event sequence for escrow A: ${actionsA.join(',')}`,
    );

    const eventsB = await listEvents(deploymentB.escrowId);
    const actionsB = eventsB.map((e) => e.action).reverse();
    console.log(`Escrow B events: ${actionsB.join(' → ')}`);
    assert(
        JSON.stringify(actionsB) === JSON.stringify(['created', 'cancel']),
        `unexpected event sequence for escrow B: ${actionsB.join(',')}`,
    );

    console.log('\n─── Umbra E2E Execution Complete ───────────────────────────────');
    console.log(`Escrow A (Released): ${deploymentA.escrowId} @ ${deploymentA.contractAddress}`);
    console.log(`Escrow B (Cancelled): ${deploymentB.escrowId} @ ${deploymentB.contractAddress}`);
    console.log('All assertions passed against live Midnight preprod + Supabase.\n');
}

main().then(() => {
    // Wallet/WebSocket handles keep the event loop alive after success —
    // exit explicitly so `npm run test:e2e` terminates with a clean code.
    process.exit(0);
}).catch((err) => {
    console.error('\n✗ Umbra E2E test execution error:', err);
    process.exit(1);
});
