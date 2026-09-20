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
- **Architecture**: Express API + Midnight Compact ZK + React/Vite UI.

## Features & Verification
- **ZK Circuit Witness Bridges**: 32-byte normalization, cryptographic secret generation, and parameter binding.
- **State Transition Guard**: Multi-state transition validator enforcing on-chain state machine rules.
- **Private State Management**: Off-chain sensitive state serialization, browser localStorage caching (`umbra:escrow:`), LevelDB encrypted store (`umbra-escrow-state`), and in-memory test providers.
- **Offline Mock Escrow Service**: Full simulated lifecycle management, Supabase write-through synchronization, and in-memory query filters.
- **Midnight Network & HD Wallet Layer**: Network resolution (`preprod`/`preview`/`undeployed`), BIP-39 mnemonic phrase management, tripartite child wallet derivation (`ShieldedWallet`, `UnshieldedWallet`, `DustWallet`), and atomic disk caching.
- **On-Chain Midnight Client**: Singleton client interfacing with `midnight-js`, Proof Server (:6300), LevelDB encrypted private state, on-chain deployment (`deployEscrowOnChain`), circuit execution (`callCircuit`), and Merkle tree index lookups (`getCoinMtIndex`).
- **Indexer GraphQL Client**: Non-throwing resilient queries for on-chain state, block height, transaction history, and contract summaries.

## Getting Started
```bash
# Install backend dependencies
npm install

# Run complete unit test suite (100+ tests)
npm test

# Typecheck and lint
npm run typecheck
npm run lint
```