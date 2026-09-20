# Umbra

Private, Zero-Knowledge Escrow on the Midnight Blockchain.

## System Status
- **Phase 1**: Project Scaffolding & Configuration initialized.
- **Phase 2**: Database Schema & Environment Layer configured (`supabase/schema.sql`, `src/env.ts`).
- **Phase 3**: Compact Contract & Compiled ZK Artifacts synchronized (`contracts/escrow.compact`, `artifacts/`).
- **Phase 4**: Core Domain Types & Transition Matrix implemented (`src/escrow/types.ts`, `src/escrow/contract.ts`).
- **Phase 5**: Domain Verification & Witness Utilities implemented (`src/escrow/witnesses.ts`, `src/escrow/verification.ts`).
- **Architecture**: Express API + Midnight Compact ZK + React/Vite UI.

## Features & Verification
- **ZK Circuit Witness Bridges**: 32-byte normalization, cryptographic secret generation, and parameter binding.
- **State Transition Guard**: Multi-state transition validator enforcing on-chain state machine rules.
- **Integrity Validation**: Address, amount, condition bounds, and deterministic ID hash generation.

## Getting Started
```bash
# Install backend dependencies
npm install

# Run unit tests
npm test

# Typecheck and lint
npm run typecheck
npm run lint
```