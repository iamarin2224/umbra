/**
 * Umbra API Server.
 * Exposes REST endpoints for on-chain Zero-Knowledge escrow operations,
 * state machine actions, wallet telemetry, and Supabase persistence.
 *
 * Every escrow mutation is executed against the real Midnight network and
 * persisted to Supabase — there is no offline or simulated fallback. When the
 * database or chain is unreachable, endpoints fail with explicit status codes.
 */
import express from 'express';

import {
    deployEscrow,
    executeEscrowAction,
    getEscrowOrThrow,
    listEscrows,
    listEvents,
    EscrowError,
    isSupabaseConfigured,
} from './escrow/index.js';
import { getMidnightClient, getWalletAvailableCoins, getWalletCoinPublicKey } from './midnight-client.js';
import { resolveNetwork } from './network.js';
import {
    ESCROW_STATE_LABELS,
    type EscrowActionType,
    type EscrowActionParams,
    type EscrowRecord,
} from './escrow/types.js';

const app = express();
app.use(express.json());

// ─── CORS Middleware ────────────────────────────────────────────────────────
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    if (_req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

const SERVER_PORT = process.env.PORT || 3001;

// ─── Error Handling Helper ──────────────────────────────────────────────────

function sendError(res: express.Response, err: unknown, fallbackMessage: string): void {
    if (err instanceof EscrowError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    const message = err instanceof Error ? err.message : fallbackMessage;
    console.error(`[Umbra-API] ${fallbackMessage}:`, message);
    res.status(500).json({ error: message });
}

function requireSupabase(res: express.Response): boolean {
    if (!isSupabaseConfigured()) {
        res.status(503).json({
            error:
                'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY ' +
                '(copy .env.supabase.example to .env.local) and apply supabase/schema.sql.',
        });
        return false;
    }
    return true;
}

// ─── Health Endpoint ────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
    const { network } = resolveNetwork();
    res.json({
        ok: true,
        timestamp: new Date().toISOString(),
        network,
        supabaseConfigured: isSupabaseConfigured(),
    });
});

// ─── Wallet Telemetry Endpoints ─────────────────────────────────────────────

app.get('/api/wallet/coins', async (_req, res) => {
    try {
        const availableCoins = await getWalletAvailableCoins();
        res.json(availableCoins);
    } catch (err: unknown) {
        sendError(res, err, 'Get coins failed');
    }
});

app.get('/api/wallet/public-key', async (_req, res) => {
    try {
        // Initialize the client on first use (wallet sync resumes from cache),
        // otherwise release actions fail before any escrow has been executed.
        await getMidnightClient();
        const coinPubKey = getWalletCoinPublicKey();
        res.json({ publicKey: coinPubKey });
    } catch (err: unknown) {
        sendError(res, err, 'Get public key failed');
    }
});

// ─── On-Chain Escrow Deployment Endpoint ────────────────────────────────────

app.post('/api/escrows', async (req, res) => {
    try {
        if (!requireSupabase(res)) return;

        const { buyerAddress, sellerAddress, amount, condition } = req.body ?? {};
        if (!buyerAddress || !sellerAddress || !amount || !condition) {
            res.status(400).json({
                error: 'Missing required fields: buyerAddress, sellerAddress, amount, condition',
            });
            return;
        }

        console.log(`[Umbra-API] Deploying escrow: buyer=${buyerAddress.slice(0, 20)}..., amount=${amount}`);

        const deployment = await deployEscrow({ buyerAddress, sellerAddress, amount, condition });
        const record: EscrowRecord = await getEscrowOrThrow(deployment.escrowId);

        console.log(`[Umbra-API] Escrow deployed: ${record.id}, contract: ${record.contractAddress}`);
        res.json(record);
    } catch (err: unknown) {
        sendError(res, err, 'Deploy failed');
    }
});

// ─── Circuit Transition Action Endpoint ─────────────────────────────────────

app.post('/api/escrows/:id/action', async (req, res) => {
    try {
        if (!requireSupabase(res)) return;

        const { id } = req.params;
        const { action, secret, value, sellerPubKey } = req.body ?? {};

        if (!action) {
            res.status(400).json({ error: 'Missing required field: action' });
            return;
        }
        if (!secret) {
            res.status(400).json({ error: 'Missing required field: secret' });
            return;
        }

        console.log(`[Umbra-API] Action ${action} on ${id}`);

        const params: EscrowActionParams = { secret, value, sellerPubKey };
        const result = await executeEscrowAction(id, action as EscrowActionType, params);

        console.log(`[Umbra-API] Action ${action} completed: ${result.transactionHash}`);
        res.json({
            success: true,
            transactionHash: result.transactionHash,
            blockHeight: result.blockHeight,
            newState: result.newState,
            newStateLabel: ESCROW_STATE_LABELS[result.newState],
            warning: result.warning,
        });
    } catch (err: unknown) {
        sendError(res, err, 'Action failed');
    }
});

// ─── Query Escrows & Event Log Endpoints ────────────────────────────────────

app.get('/api/escrows', async (req, res) => {
    try {
        if (!requireSupabase(res)) return;

        const { buyerAddress, sellerAddress } = req.query;
        const records = await listEscrows({
            buyerAddress: buyerAddress as string | undefined,
            sellerAddress: sellerAddress as string | undefined,
        });
        res.json(records);
    } catch (err: unknown) {
        sendError(res, err, 'Query failed');
    }
});

app.get('/api/escrows/:id', async (req, res) => {
    try {
        if (!requireSupabase(res)) return;
        const record = await getEscrowOrThrow(req.params.id);
        res.json(record);
    } catch (err: unknown) {
        sendError(res, err, 'Load failed');
    }
});

app.get('/api/escrows/:id/events', async (req, res) => {
    try {
        if (!requireSupabase(res)) return;
        res.json(await listEvents(req.params.id));
    } catch (err: unknown) {
        sendError(res, err, 'Event query failed');
    }
});

app.get('/api/events', async (_req, res) => {
    try {
        if (!requireSupabase(res)) return;
        res.json(await listEvents());
    } catch (err: unknown) {
        sendError(res, err, 'Event query failed');
    }
});

// ─── Server Listener ────────────────────────────────────────────────────────

app.listen(SERVER_PORT, () => {
    console.log(`\n  Umbra API Server running on http://localhost:${SERVER_PORT}`);
    console.log(`  Health: http://localhost:${SERVER_PORT}/api/health`);
    console.log(`  Supabase: ${isSupabaseConfigured() ? 'configured' : 'NOT CONFIGURED (escrow endpoints return 503)'}\n`);
});
