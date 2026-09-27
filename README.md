# Umbra

Private, Zero-Knowledge Escrow on the Midnight Blockchain.

## Live Deployment (preprod)
- **Network**: Midnight preprod
- **Contract Address**: `8a8c0c34b97869f04c5a07e5439ea05b92795fe18682c7c5fe64f037a055435d`
- **Deploy Tx**: `61f60fbd2403599adbc2a78fcdd438581425051f8b88b2545ecf11a7712e6055`
- **Deployer**: `mn_addr_preprod1xxfn5sa5jaae6mudj4x0rzd66ml7uaxuq5ghtu0m4hxn6l33m02q7mernw`
- **Deployed At**: `2026-09-24T21:35:45.301Z` (recorded in `.midnight-state.json`, gitignored)
- **Deploy command**: `npm run deploy:escrow -- --network preprod` (proof server on `:6300`, faucet auto-funds, ~100min first-run wallet sync; resumes from `.midnight-wallet-state/`)

## System Status
- **Phase 1**: Project Scaffolding & Configuration initialized.
- **Phase 2**: Database Schema & Environment Layer configured (`supabase/schema.sql`, `src/env.ts`).
- **Phase 3**: Compact Contract & Compiled ZK Artifacts synchronized (`contracts/escrow.compact`, `artifacts/`).
- **Phase 4**: Core Domain Types & Transition Matrix implemented (`src/escrow/types.ts`, `src/escrow/contract.ts`).
- **Phase 5**: Domain Verification & Witness Utilities implemented (`src/escrow/witnesses.ts`, `src/escrow/verification.ts`).
- **Phase 6**: Private State Management Layer implemented (`src/escrow/private-state.ts`).
- **Phase 7**: Escrow Service & Domain Barrel Export implemented (`src/escrow/service.ts`, `src/escrow/index.ts`).
- **Phase 8**: Network & Wallet Management Layer implemented (`src/network.ts`, `src/wallet.ts`, `src/wallet-state.ts`).
- **Phase 9**: On-Chain Midnight Client (ZK & Prover Integration) implemented (`src/midnight-client.ts`).
- **Phase 10**: Escrow Indexer Query Client & Verified Test Suite (`src/escrow/indexer.ts`, `tests/indexer.test.ts`).
- **Phase 11**: Express API Server & Route Controllers implemented (`src/server.ts`, `src/index.ts`).
- **Phase 12**: CLI Deploy Script, E2E Suite & Diagnostic Testing Harness implemented (`scripts/deploy.ts`, `tests/e2e-preprod.ts`, `diagnostic/index.html`).
- **Phase 13**: Modern Frontend Tooling & React 19 Scaffolding (`frontend/package.json`, `frontend/vite.config.ts`, TypeScript config).
- **Phase 14**: Visual Design Engine, WebGL 3D Galaxy Parallax (`@react-bits/Backgrounds-TS-TW`), Interactive Spotlight Cards (`@react-bits/Components-TS-TW`), Smoked Obsidian Glassmorphism, and Centered Apple-Style HUD.
- **Phase 15**: Frontend Domain Types, API Client & Data Access Layer (`frontend/src/types/`, `frontend/src/lib/api.ts`, `frontend/src/lib/supabase.ts`).
- **Phase 16**: Midnight Wallet Integration Layer & Lace DApp Connector (`frontend/src/context/MidnightWalletContext.tsx`, `frontend/src/components/WalletHUD.tsx`).
- **Phase 17**: Escrow State Hook & Reactive Business Logic (`frontend/src/hooks/useEscrowService.ts`).
- **Phase 18**: Header HUD Command Bar & Telemetry Metrics (`frontend/src/components/HeaderHUD.tsx`, `frontend/src/components/TelemetryBar.tsx`, `frontend/src/components/FooterHUD.tsx`).
- **Phase 19**: Escrow Command Matrix & Interactive Spotlight Cards (`frontend/src/components/EscrowMatrix.tsx`, `frontend/src/components/EscrowCard.tsx`, `frontend/src/components/PrivacyShield.tsx`).
- **Phase 20**: Tactical Creation & Transition Modals (`frontend/src/components/CreateEscrowModal.tsx`, `frontend/src/components/ActionModal.tsx`).
- **Phase 21**: Deep Audit Inspector Terminal & State Visualizer (`frontend/src/components/EscrowInspectorModal.tsx`, `frontend/src/components/StateFlowVisualizer.tsx`, `frontend/src/components/TransactionStream.tsx`).
- **Phase 22**: Auxiliary Views Modularization & Complete E2E Verification (`frontend/src/components/ZKExplorerView.tsx`, `frontend/src/components/ProtocolMetricsView.tsx`, `frontend/src/components/AboutUmbraView.tsx`).
- **Umbra System Complete**: 100% of the 22-phase architecture, smart contracts, ZK circuit bindings, Express API server, and cyber-obsidian frontend application are built and verified.
- **Realtime Hardening**: All mock/simulated data paths removed from product code. Escrow orchestration runs against a real Midnight `ChainGateway` and Supabase `EscrowRepository` (dependency-injected; test doubles live only in `tests/fakes.ts`). The frontend streams live `escrows` + `escrow_events` rows over Supabase Realtime — no localStorage cache, no fallback demo records, no wallet demo mode.

## Architecture: Realtime Data Plane

```
Browser (React)
  ├─ REST ──────────────► Express API (src/server.ts)
  │                         └─ EscrowService (src/escrow/service.ts)
  │                              ├─ ChainGateway ──► Midnight network (deploy / callCircuit)
  │                              └─ EscrowRepository ──► Supabase (escrows, escrow_events)
  └─ Supabase Realtime ─► postgres_changes on escrows + escrow_events (push updates)
```

- Writes always go through the API; the browser never mutates Supabase directly.
- Escrow state changes and event-log inserts arrive in realtime; the UI reloads on change (no data polling — only a 15s health ping).
- Missing configuration is surfaced as real errors (API returns 503; the UI shows an error banner), never as fabricated data.

## API Endpoints (`src/server.ts`)
- `GET  /api/health` — Health and telemetry check
- `GET  /api/wallet/coins` — Shielded available coins from Midnight wallet
- `GET  /api/wallet/public-key` — Coin public key of server wallet
- `POST /api/escrows` — Deploys a new ZK escrow contract on-chain
- `POST /api/escrows/:id/action` — Executes circuit transitions (`deposit`, `confirmDelivery`, `release`, `dispute`, `resolve`, `cancel`)
- `GET  /api/escrows` — Queries escrows from Supabase with optional buyer/seller filters
- `GET  /api/escrows/:id` — Fetch a single escrow
- `GET  /api/escrows/:id/events` — Event log for one escrow
- `GET  /api/events` — Global append-only event log

## Environment

### Backend (`.env.local`, loaded by `npm run server`)
```bash
cp .env.supabase.example .env.local   # then fill in values
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | yes | Supabase project URL (repository + realtime source of truth) |
| `SUPABASE_ANON_KEY` | yes | Supabase anon key |
| `MIDNIGHT_NETWORK` | no | `preprod` (default) or other Midnight network |
| `MIDNIGHT_INDEXER_URL` | no | Indexer GraphQL endpoint |
| `MIDNIGHT_WALLET_SEED` | yes (on-chain ops) | Deployer/operator wallet seed |
| `PORT` | no | API port (default `3001`) |

### Frontend (`frontend/.env.local`)
```bash
cp frontend/.env.example frontend/.env.local
```

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Umbra Express API base URL (default `http://localhost:3001`) |
| `VITE_SUPABASE_URL` | Supabase URL for realtime subscriptions + fallback reads |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_MIDNIGHT_NETWORK` | Network id passed to the Lace/DApp connector (default `preprod`) |

### Supabase realtime setup
Run `supabase/schema.sql` against your project. It creates `escrows` and `escrow_events`, enables RLS policies, and runs:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.escrows;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.escrow_events;
ALTER TABLE public.escrows REPLICA IDENTITY FULL;
ALTER TABLE public.escrow_events REPLICA IDENTITY FULL;
```

Without this, the UI stays on `REALTIME STREAM OFFLINE` (still loads via REST).

## Frontend Application (`frontend/`)
A modern, cyber-obsidian single-page application built on React 19, Vite, OGL WebGL, and Framer Motion:
- **3D Galaxy Starfield**: Interactive parallax particle physics with cursor repulsion and celestial depth.
- **Spotlight Cards**: Dynamic radial cursor illumination on agreement cards, telemetry, and circuit inspectors.
- **Magnetic Fluid Cursor**: Responsive smoothed indicator with element magnetic snapping.
- **Live status strip**: Realtime stream + API link indicators; real errors surface in an alert banner.

## Diagnostic Harness
A lightweight standalone dashboard is available in `diagnostic/index.html` to interact with and verify live endpoints.

## Getting Started

### Backend
```bash
# Install backend dependencies
npm install

# Run the 109-test unit suite (service tests use injected fakes in tests/fakes.ts)
npm test

# Typecheck and lint
npm run typecheck
npm run lint

# Build production dist/
npm run build

# Start API server in dev mode
npm run server
```

### Frontend
```bash
cd frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev

# Build for production
npm run build
```