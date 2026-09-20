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
- **Architecture**: Express API + Midnight Compact ZK + React/Vite UI.

## API Endpoints (`src/server.ts`)
- `GET  /api/health` — Health and telemetry check
- `GET  /api/wallet/coins` — Shielded available coins from Midnight wallet
- `GET  /api/wallet/public-key` — Coin public key of server wallet
- `POST /api/escrows` — Deploys a new ZK escrow contract on-chain
- `POST /api/escrows/:id/action` — Executes circuit transitions (`deposit`, `confirmDelivery`, `release`, `dispute`, `resolve`, `cancel`)
- `GET  /api/escrows` — Queries escrows from Supabase with optional buyer filter

## Getting Started
```bash
# Install backend dependencies
npm install

# Run test suite
npm test

# Build production dist/
npm run build

# Start API server in dev mode
npm run server
```