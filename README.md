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
- **Architecture**: Express API + Midnight Compact ZK + React/Vite UI.

## Features & Verification
- **ZK Circuit Witness Bridges**: 32-byte normalization, cryptographic secret generation, and parameter binding.
- **State Transition Guard**: Multi-state transition validator enforcing on-chain state machine rules.
- **Private State Management**: Off-chain sensitive state serialization, browser localStorage caching (`umbra:escrow:`), and in-memory test providers.
- **Offline Mock Escrow Service**: Full simulated lifecycle management, Supabase write-through synchronization, and in-memory query filters.
- **Midnight Network & HD Wallet Layer**: Network resolution (`preprod`/`preview`/`undeployed`), BIP-39 mnemonic phrase management, tripartite child wallet derivation (`ShieldedWallet`, `UnshieldedWallet`, `DustWallet`), and atomic disk caching (`.midnight-wallet-state`).

## Getting Started
```bash
# Install backend dependencies
npm install

# Run complete unit test suite
npm test

# Typecheck and lint
npm run typecheck
npm run lint
```