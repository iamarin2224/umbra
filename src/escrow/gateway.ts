import {
    deployEscrowOnChain,
    callCircuit,
    getCoinMtIndex,
} from "../midnight-client.js";

// ─── Chain Gateway Abstraction ──────────────────────────────────────────────
// The only production implementation talks to the real Midnight network via
// src/midnight-client.ts. Test doubles live exclusively under tests/.

export interface ChainGatewayDeployParams {
    buyerSecret: string;
    sellerSecret: string;
    amount: string;
    condition: string;
    privateStateId: string;
}

export interface ChainGatewayDeployResult {
    contractAddress: string;
    transactionHash: string;
}

export interface ChainGatewayCallParams {
    contractAddress: string;
    circuit: string;
    args: unknown[];
    privateStateId: string;
}

export interface ChainGatewayCallResult {
    transactionHash: string;
    blockHeight: number;
}

export interface ChainGateway {
    deployEscrow(params: ChainGatewayDeployParams): Promise<ChainGatewayDeployResult>;
    callCircuit(params: ChainGatewayCallParams): Promise<ChainGatewayCallResult>;
    getCoinMtIndex(txHash: string, contractAddress: string): Promise<bigint>;
}

export function createMidnightChainGateway(): ChainGateway {
    return {
        async deployEscrow(params) {
            const result = await deployEscrowOnChain({
                buyerSecret: params.buyerSecret,
                sellerSecret: params.sellerSecret,
                amount: params.amount,
                condition: params.condition,
                privateStateId: params.privateStateId,
            });
            return {
                contractAddress: result.contractAddress,
                transactionHash: result.transactionHash,
            };
        },
        async callCircuit(params) {
            return callCircuit(
                params.contractAddress,
                params.circuit,
                params.args,
                params.privateStateId,
            );
        },
        getCoinMtIndex,
    };
}
