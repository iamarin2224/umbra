# Umbra

Private, Zero-Knowledge Escrow on the Midnight Blockchain.

## System Status
- **Phase 1**: Project Scaffolding & Configuration initialized.
- **Phase 2**: Database Schema & Environment Layer configured (`supabase/schema.sql`, `src/env.ts`).
- **Phase 3**: Compact Contract & Compiled ZK Artifacts synchronized (`contracts/escrow.compact`, `artifacts/`).
- **Architecture**: Express API + Midnight Compact ZK + React/Vite UI.

## Contract Capabilities
- Zero-Knowledge circuit execution on Midnight Network
- State-machine lifecycle (`Created` -> `Funded` -> `Delivered` -> `Released` / `Disputed` / `Resolved` / `Cancelled`)
- Shielded token minting and settlement

## Getting Started
```bash
# Install backend dependencies
npm install

# Typecheck and lint
npm run typecheck
npm run lint
```