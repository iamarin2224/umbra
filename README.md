# Umbra

Private, Zero-Knowledge Escrow on the Midnight Blockchain.

## System Status
- **Phase 1**: Project Scaffolding & Configuration initialized.
- **Phase 2**: Database Schema & Environment Layer configured (`supabase/schema.sql`, `src/env.ts`).
- **Phase 3**: Compact Contract & Compiled ZK Artifacts synchronized (`contracts/escrow.compact`, `artifacts/`).
- **Phase 4**: Core Domain Types & Transition Matrix implemented (`src/escrow/types.ts`, `src/escrow/contract.ts`).
- **Phase 5**: Domain Verification & Witness Utilities implemented (`src/escrow/witnesses.ts`, `src/escrow/verification.ts`).
- **Phase 6**: Private State Management Layer implemented (`src/escrow/private-state.ts`).
- **Phase 7**: Offline Mock Escrow Service & Domain Barrel Export implemented (`src/escrow/service.ts`, `src/escrow/index.ts`).
- **Phase 8**: Network & Wallet Management Layer implemented (`src/network.ts`, `src/wallet.ts`, `src/wallet-state.ts`).
- **Phase 9**: On-Chain Midnight Client (ZK & Prover Integration) implemented (`src/midnight-client.ts`).
- **Phase 10**: Escrow Indexer Query Client & Verified Test Suite (`src/escrow/indexer.ts`, `tests/indexer.test.ts`).
- **Phase 11**: Express API Server & Route Controllers implemented (`src/server.ts`, `src/index.ts`).
- **Phase 12**: CLI Deploy Script, E2E Suite & Diagnostic Testing Harness implemented (`scripts/deploy.ts`, `tests/e2e-preprod.ts`, `diagnostic/index.html`).
- **Backend Build Complete**: 100% of backend architecture, ZK circuits, and API endpoints are fully verified.

## API Endpoints (`src/server.ts`)
- `GET  /api/health` — Health and telemetry check
- `GET  /api/wallet/coins` — Shielded available coins from Midnight wallet
- `GET  /api/wallet/public-key` — Coin public key of server wallet
- `POST /api/escrows` — Deploys a new ZK escrow contract on-chain
- `POST /api/escrows/:id/action` — Executes circuit transitions (`deposit`, `confirmDelivery`, `release`, `dispute`, `resolve`, `cancel`)
- `GET  /api/escrows` — Queries escrows from Supabase with optional buyer filter

## Diagnostic Harness
A lightweight standalone dashboard is available in `diagnostic/index.html` to interact with and verify live endpoints.

## Getting Started
```bash
# Install backend dependencies
npm install

# Run 100-test unit test suite
npm test

# Typecheck and lint
npm run typecheck
npm run lint

# Build production dist/
npm run build

# Start API server in dev mode
npm run server
```