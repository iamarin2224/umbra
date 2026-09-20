/**
 * Umbra API Server.
 * Exposes REST endpoints for on-chain Zero-Knowledge escrow operations,
 * state machine actions, wallet telemetry, and Supabase persistence.
 */
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

import {
    deployEscrowOnChain,
    callCircuit,
    getCoinMtIndex,
    getWalletAvailableCoins,
    getWalletCoinPublicKey,
} from './midnight-client.js';
import { env } from './env.js';

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

// ─── Database Client Helper ─────────────────────────────────────────────────

function getSupabaseClient() {
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    }
    return null;
}

// ─── Entity / Database Row Mapping ──────────────────────────────────────────

function recordToRow(record: any) {
    return {
        id: record.id,
        contract_address: record.contractAddress,
        buyer_address: record.buyerAddress,
        seller_address: record.sellerAddress,
        amount: record.amount,
        condition: record.condition,
        state: record.state,
        state_label: record.stateLabel,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        funded_at: record.fundedAt,
        delivered_at: record.deliveredAt,
        released_at: record.releasedAt,
        disputed_at: record.disputedAt,
        resolved_at: record.resolvedAt,
        cancelled_at: record.cancelledAt,
        transaction_hash: record.transactionHash,
        deposit_coin_index: record.depositCoinIndex,
        buyer_secret: record.buyerSecret,
        seller_secret: record.sellerSecret,
        salt: record.salt,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRecord(row: any) {
    return {
        id: row.id,
        contractAddress: row.contract_address,
        buyerAddress: row.buyer_address,
        sellerAddress: row.seller_address,
        amount: row.amount,
        condition: row.condition,
        state: row.state,
        stateLabel: row.state_label,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        fundedAt: row.funded_at,
        deliveredAt: row.delivered_at,
        releasedAt: row.released_at,
        disputedAt: row.disputed_at,
        resolvedAt: row.resolved_at,
        cancelledAt: row.cancelled_at,
        transactionHash: row.transaction_hash,
        depositCoinIndex: row.deposit_coin_index,
        buyerSecret: row.buyer_secret,
        sellerSecret: row.seller_secret,
        salt: row.salt,
    };
}

// ─── State Machine Constants ────────────────────────────────────────────────

const STATE_CREATED = 0;
const STATE_FUNDED = 1;
const STATE_DELIVERED = 2;
const STATE_RELEASED = 3;
const STATE_DISPUTED = 4;
const STATE_RESOLVED = 5;
const STATE_CANCELLED = 6;

const STATE_LABELS: Record<number, string> = {
    [STATE_CREATED]: 'Created',
    [STATE_FUNDED]: 'Funded',
    [STATE_DELIVERED]: 'Delivered',
    [STATE_RELEASED]: 'Released',
    [STATE_DISPUTED]: 'Disputed',
    [STATE_RESOLVED]: 'Resolved',
    [STATE_CANCELLED]: 'Cancelled',
};

const VALID_TRANSITIONS: Record<string, Record<number, number>> = {
    deposit: { [STATE_CREATED]: STATE_FUNDED },
    confirmDelivery: { [STATE_FUNDED]: STATE_DELIVERED },
    release: { [STATE_DELIVERED]: STATE_RELEASED },
    cancel: { [STATE_CREATED]: STATE_CANCELLED },
    dispute: { [STATE_FUNDED]: STATE_DISPUTED, [STATE_DELIVERED]: STATE_DISPUTED },
    resolve: { [STATE_DISPUTED]: STATE_RESOLVED },
};

// In-memory fallback for deposited coin mt_index per escrow ID
const depositCoinIndexStore = new Map<string, string>();

// ─── Health Endpoint ────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ─── Wallet Telemetry Endpoints ─────────────────────────────────────────────

app.get('/api/wallet/coins', async (_req, res) => {
    try {
        const availableCoins = await getWalletAvailableCoins();
        res.json(availableCoins);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get wallet coins';
        console.error('[Umbra-API] Get coins error:', errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});

app.get('/api/wallet/public-key', async (_req, res) => {
    try {
        const coinPubKey = getWalletCoinPublicKey();
        res.json({ publicKey: coinPubKey });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get wallet public key';
        console.error('[Umbra-API] Get public key error:', errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});

// ─── On-Chain Escrow Deployment Endpoint ────────────────────────────────────

app.post('/api/escrows', async (req, res) => {
    try {
        const { buyerAddress, sellerAddress, amount, condition } = req.body;

        if (!buyerAddress || !sellerAddress || !amount || !condition) {
            res.status(400).json({ error: 'Missing required fields: buyerAddress, sellerAddress, amount, condition' });
            return;
        }

        console.log(`[Umbra-API] Deploying escrow: buyer=${buyerAddress.slice(0, 20)}..., amount=${amount}`);

        // Generate counterparty secrets
        const buyerSecret = crypto.randomUUID().replace(/-/g, '');
        const sellerSecret = crypto.randomUUID().replace(/-/g, '');

        // Deploy on-chain
        const deployResult = await deployEscrowOnChain({
            buyerSecret,
            sellerSecret,
            amount,
            condition,
        });

        const timestamp = new Date().toISOString();
        const escrowRecord = {
            id: `escrow_${Date.now().toString(16)}${Math.random().toString(16).slice(2, 6)}`,
            contractAddress: deployResult.contractAddress,
            buyerAddress,
            sellerAddress,
            amount,
            condition,
            state: STATE_CREATED,
            stateLabel: STATE_LABELS[STATE_CREATED],
            createdAt: timestamp,
            updatedAt: timestamp,
            fundedAt: null,
            deliveredAt: null,
            releasedAt: null,
            disputedAt: null,
            resolvedAt: null,
            cancelledAt: null,
            transactionHash: deployResult.transactionHash,
            depositCoinIndex: null,
            buyerSecret: deployResult.buyerSecret,
            sellerSecret: deployResult.sellerSecret,
            salt: '',
        };

        const supabase = getSupabaseClient();
        if (supabase) {
            const insertRow = recordToRow(escrowRecord);
            let { error: insertError } = await supabase.from('escrows').insert(insertRow);
            if (insertError && /column.*deposit_coin_index/i.test(insertError.message)) {
                const { deposit_coin_index: _omitted, ...fallbackRow } = insertRow;
                void _omitted;
                ({ error: insertError } = await supabase.from('escrows').insert(fallbackRow));
            }
            if (insertError) console.error('[Umbra-API] Supabase insert failed:', insertError.message);
        }

        console.log(`[Umbra-API] Escrow deployed: ${escrowRecord.id}, contract: ${deployResult.contractAddress}`);

        res.json(escrowRecord);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Deploy failed';
        console.error('[Umbra-API] Deploy error:', errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});

// ─── Circuit Transition Action Endpoint ─────────────────────────────────────

app.post('/api/escrows/:id/action', async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        if (!action) {
            res.status(400).json({ error: 'Missing required field: action' });
            return;
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            res.status(500).json({ error: 'Supabase not configured' });
            return;
        }

        const { data: row, error: fetchError } = await supabase
            .from('escrows')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !row) {
            res.status(404).json({ error: `Escrow ${id} not found` });
            return;
        }

        const currentState = row.state;
        const transition = VALID_TRANSITIONS[action];

        if (!transition || transition[currentState] === undefined) {
            res.status(400).json({
                error: `Cannot perform ${action} in state ${STATE_LABELS[currentState]}`,
            });
            return;
        }

        const newState = transition[currentState];
        console.log(`[Umbra-API] Action ${action} on ${id}: ${STATE_LABELS[currentState]} -> ${STATE_LABELS[newState]}`);

        const circuitArgs: unknown[] = [];
        let depositCoinIndex: string | null = null;

        if (action === 'deposit') {
            const { value } = req.body;
            if (value === undefined) {
                res.status(400).json({ error: 'Missing value for deposit' });
                return;
            }
            circuitArgs.push(BigInt(value));
        } else if (action === 'release') {
            const { sellerPubKey } = req.body;
            if (!sellerPubKey) {
                res.status(400).json({ error: 'Missing sellerPubKey for release' });
                return;
            }
            const coinIndex = row.deposit_coin_index ?? depositCoinIndexStore.get(id);
            if (!coinIndex) {
                res.status(400).json({ error: 'No deposit coin index — deposit first' });
                return;
            }
            circuitArgs.push({ bytes: Uint8Array.from(Buffer.from(sellerPubKey, 'hex')) });
            circuitArgs.push(BigInt(coinIndex));
        } else if (action === 'cancel') {
            const coinIndex = row.deposit_coin_index ?? depositCoinIndexStore.get(id);
            circuitArgs.push(BigInt(coinIndex ?? 0));
        }

        // Execute circuit on-chain
        const circuitResult = await callCircuit(row.contract_address, action, circuitArgs);

        if (action === 'deposit') {
            try {
                const coinIdx = await getCoinMtIndex(circuitResult.transactionHash, row.contract_address);
                depositCoinIndex = coinIdx.toString();
                depositCoinIndexStore.set(id, depositCoinIndex);
                console.log(`[Umbra-API] Deposit coin mt_index: ${depositCoinIndex}`);
            } catch (err: unknown) {
                console.error('[Umbra-API] Failed to lookup coin mt_index:', err instanceof Error ? err.message : err);
            }
        }

        const updateTimestamp = new Date().toISOString();
        const updatedRow = {
            ...row,
            state: newState,
            state_label: STATE_LABELS[newState],
            updated_at: updateTimestamp,
            transaction_hash: circuitResult.transactionHash,
            ...(action === 'deposit' && { funded_at: updateTimestamp }),
            ...(action === 'confirmDelivery' && { delivered_at: updateTimestamp }),
            ...(action === 'release' && { released_at: updateTimestamp }),
            ...(action === 'dispute' && { disputed_at: updateTimestamp }),
            ...(action === 'resolve' && { resolved_at: updateTimestamp }),
            ...(action === 'cancel' && { cancelled_at: updateTimestamp }),
            ...(depositCoinIndex !== null && { deposit_coin_index: depositCoinIndex }),
        };

        let updateError: { message: string } | null = null;
        const { error: err1 } = await supabase
            .from('escrows')
            .update(updatedRow)
            .eq('id', id);
        updateError = err1;

        if (updateError && /column.*deposit_coin_index/i.test(updateError.message)) {
            const { deposit_coin_index: _omitted, ...baseRow } = updatedRow;
            void _omitted;
            const { error: err2 } = await supabase
                .from('escrows')
                .update(baseRow)
                .eq('id', id);
            updateError = err2;
        }

        if (updateError) console.error('[Umbra-API] Supabase update failed:', updateError.message);

        console.log(`[Umbra-API] Action ${action} completed: ${circuitResult.transactionHash}`);

        res.json({
            success: true,
            transactionHash: circuitResult.transactionHash,
            blockHeight: circuitResult.blockHeight,
            newState,
            newStateLabel: STATE_LABELS[newState],
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Action failed';
        console.error('[Umbra-API] Action error:', errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});

// ─── Query Escrows List Endpoint ────────────────────────────────────────────

app.get('/api/escrows', async (req, res) => {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            res.json([]);
            return;
        }

        let query = supabase.from('escrows').select('*');

        const { buyerAddress } = req.query;
        if (buyerAddress) {
            query = query.eq('buyer_address', buyerAddress as string);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('[Umbra-API] Supabase query failed:', error.message);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json((data || []).map(rowToRecord));
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Query failed';
        res.status(500).json({ error: errorMessage });
    }
});

// ─── Server Listener ────────────────────────────────────────────────────────

app.listen(SERVER_PORT, () => {
    console.log(`\n  Umbra API Server running on http://localhost:${SERVER_PORT}`);
    console.log(`  Health: http://localhost:${SERVER_PORT}/api/health\n`);
});
