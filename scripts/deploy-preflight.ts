/**
 * Preflight for `npm run deploy:escrow -- --network preprod`.
 * Loads every module/artifact the deploy script needs — does NOT deploy.
 * Run: npx tsx scripts/deploy-preflight.ts
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results: Array<{ ok: boolean; name: string; detail?: string }> = [];

function ok(name: string, detail?: string) {
    results.push({ ok: true, name, detail });
}
function fail(name: string, err: unknown) {
    results.push({ ok: false, name, detail: err instanceof Error ? err.message : String(err) });
}

async function main() {
    // 1) Network flag (exact argv npm passes)
    const net = await import('../src/network.js');
    const resolved = net.resolveNetwork({
        argv: ['node', path.join(root, 'scripts/deploy.ts'), '--network', 'preprod'],
        env: {},
        cwd: root,
    });
    if (resolved.network === 'preprod' && resolved.source === 'flag') {
        ok('resolveNetwork --network preprod', resolved.config.proofServer);
    } else {
        fail('resolveNetwork', new Error(`network=${resolved.network} source=${resolved.source}`));
    }

    // 2) Wallet bootstrap path (idempotent — creates .midnight-state.json if missing)
    try {
        const w = net.getOrCreateWallet('preprod', { env: {}, cwd: root });
        ok('getOrCreateWallet(preprod)', `created=${w.created} seedLen=${w.seed.length}`);
    } catch (e) {
        fail('getOrCreateWallet(preprod)', e);
    }

    // 3) Contract artifact present + exports Contract
    const contractPath = path.join(root, 'artifacts/contract/index.js');
    if (!fs.existsSync(contractPath)) {
        fail('artifacts/contract/index.js', new Error('missing — run npm run compile:escrow'));
    } else {
        try {
            const Escrow: any = await import(pathToFileURL(contractPath).href);
            if (typeof Escrow.Contract !== 'function') {
                throw new Error(`Contract is ${typeof Escrow.Contract}; exports=${Object.keys(Escrow)}`);
            }
            ok('Contract export', Object.keys(Escrow).join(','));

            // 4) Same CompiledContract wiring deploy.ts uses
            const { CompiledContract } = await import('@midnight-ntwrk/midnight-js-protocol/compact-js');
            let c: any = CompiledContract.make('escrow', Escrow.Contract);
            c = (CompiledContract as any).withWitnesses(c, {
                buyerSecret: (ctx: any) => [ctx.privateState, new Uint8Array(32)],
                sellerSecret: (ctx: any) => [ctx.privateState, new Uint8Array(32)],
                escrowAmount: (ctx: any) => [ctx.privateState, new Uint8Array(32)],
                conditionHash: (ctx: any) => [ctx.privateState, new Uint8Array(32)],
            });
            const zkPath = path.join(root, 'artifacts');
            c = (CompiledContract as any).withCompiledFileAssets(c, zkPath);
            ok('CompiledContract + witnesses + file assets');
        } catch (e) {
            fail('CompiledContract wiring', e);
        }
    }

    // 5) ZK keys for every circuit NodeZkConfigProvider will read
    try {
        const { NodeZkConfigProvider } = await import('@midnight-ntwrk/midnight-js-node-zk-config-provider');
        const zk = new NodeZkConfigProvider(path.join(root, 'artifacts'));
        for (const name of ['deposit', 'confirmDelivery', 'release', 'dispute', 'resolve', 'cancel']) {
            await zk.getProverKey(name as any);
            await zk.getVerifierKey(name as any);
            await zk.getZKIR(name as any);
            ok(`zk keys: ${name}`);
        }
    } catch (e) {
        fail('NodeZkConfigProvider', e);
    }

    // 6) Exports deploy.ts imports
    const exportChecks: Array<[string, string, string]> = [
        ['deployContract', '@midnight-ntwrk/midnight-js-contracts', 'deployContract'],
        ['httpClientProofProvider', '@midnight-ntwrk/midnight-js-http-client-proof-provider', 'httpClientProofProvider'],
        ['indexerPublicDataProvider', '@midnight-ntwrk/midnight-js-indexer-public-data-provider', 'indexerPublicDataProvider'],
        ['levelPrivateStateProvider', '@midnight-ntwrk/midnight-js-level-private-state-provider', 'levelPrivateStateProvider'],
        ['NodeZkConfigProvider', '@midnight-ntwrk/midnight-js-node-zk-config-provider', 'NodeZkConfigProvider'],
    ];
    for (const [label, mod, exp] of exportChecks) {
        try {
            const m: any = await import(mod);
            if (typeof m[exp] !== 'function') throw new Error(`${exp} not a function`);
            ok(label);
        } catch (e) {
            fail(label, e);
        }
    }
    try {
        const ws: any = await import('ws');
        if (!ws.WebSocket) throw new Error('WebSocket missing');
        ok('ws.WebSocket');
    } catch (e) {
        fail('ws.WebSocket', e);
    }

    // 7) wallet.ts + wallet-state.ts load (deploy imports them)
    try {
        const wallet = await import('../src/wallet.js');
        if (typeof wallet.createWallet !== 'function') throw new Error('createWallet missing');
        if (typeof wallet.persistWalletState !== 'function') throw new Error('persistWalletState missing');
        ok('src/wallet.ts exports');
    } catch (e) {
        fail('src/wallet.ts exports', e);
    }

    // 8) Live proof server (expected FAIL until docker compose up -d)
    try {
        const res = await fetch(resolved.config.proofServer, { signal: AbortSignal.timeout(2000) });
        ok('proof server reachable', `HTTP ${res.status}`);
    } catch (e) {
        fail('proof server reachable (docker compose up -d)', e);
    }

    // 9) State file summary (informational)
    try {
        const st = net.loadState({ cwd: root });
        ok(
            '.midnight-state.json',
            st
                ? `wallets=${Object.keys(st.wallets || {})} deployments=${Object.keys(st.deployments || {})}`
                : 'absent (deploy will create it)',
        );
    } catch (e) {
        fail('.midnight-state.json', e);
    }

    for (const r of results) {
        console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
    }
    const fails = results.filter((r) => !r.ok);
    console.log(`\n${results.length - fails.length} ok, ${fails.length} fail`);
    process.exit(fails.length ? 1 : 0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
