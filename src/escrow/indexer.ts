import type { OnChainEscrowState, EscrowTransaction } from "./types";

// ─── Umbra Indexer GraphQL Client ───────────────────────────────────────────
// Provides querying capabilities against Midnight network indexers.

const MIDNIGHT_INDEXER_GRAPHQL_ENDPOINT =
    process.env.MIDNIGHT_INDEXER_URL ??
    "https://indexer.preprod.midnight.network/api/v4/graphql";

// ─── GraphQL Query Documents ────────────────────────────────────────────────

const QUERY_CONTRACT_STATE = `
  query GetContractState($address: String!) {
    contractState(address: $address) {
      buyerCommitment
      sellerCommitment
      amountCommitment
      conditionCommitment
      escrowState
      depositCount
      disputeCount
    }
  }
`;

const QUERY_CONTRACT_TRANSACTIONS = `
  query GetContractTransactions($address: String!, $limit: Int) {
    transactions(
      where: { contractAddress: { _eq: $address } }
      order_by: { blockHeight: desc }
      limit: $limit
    ) {
      hash
      blockHeight
      timestamp
      type
    }
  }
`;

const QUERY_LATEST_BLOCK = `
  query GetLatestBlock {
    blocks(order_by: { height: desc }, limit: 1) {
      height
      hash
      timestamp
    }
  }
`;

// ─── Fetch Handlers ─────────────────────────────────────────────────────────

export async function fetchEscrowState(
    contractAddress: string,
): Promise<OnChainEscrowState | null> {
    try {
        const response = await fetch(MIDNIGHT_INDEXER_GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: QUERY_CONTRACT_STATE,
                variables: { address: contractAddress },
            }),
        });

        const payload = (await response.json()) as {
            errors?: unknown[];
            data?: { contractState?: OnChainEscrowState };
        };

        if (payload.errors) {
            console.error("Indexer query errors:", payload.errors);
            return null;
        }

        return payload.data?.contractState ?? null;
    } catch (error) {
        console.error("Failed to fetch on-chain escrow state:", error);
        return null;
    }
}

export async function fetchEscrowTransactions(
    contractAddress: string,
    limit = 10,
): Promise<EscrowTransaction[]> {
    try {
        const response = await fetch(MIDNIGHT_INDEXER_GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: QUERY_CONTRACT_TRANSACTIONS,
                variables: { address: contractAddress, limit },
            }),
        });

        const payload = (await response.json()) as {
            errors?: unknown[];
            data?: { transactions?: EscrowTransaction[] };
        };

        if (payload.errors) {
            console.error("Indexer query errors:", payload.errors);
            return [];
        }

        return payload.data?.transactions ?? [];
    } catch (error) {
        console.error("Failed to fetch on-chain escrow transactions:", error);
        return [];
    }
}

export async function fetchLatestBlock(): Promise<{
    height: number;
    hash: string;
    timestamp: string;
} | null> {
    try {
        const response = await fetch(MIDNIGHT_INDEXER_GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: QUERY_LATEST_BLOCK }),
        });

        const payload = (await response.json()) as {
            errors?: unknown[];
            data?: {
                blocks?: {
                    height: number;
                    hash: string;
                    timestamp: string;
                }[];
            };
        };

        if (payload.errors) {
            console.error("Indexer query errors:", payload.errors);
            return null;
        }

        return payload.data?.blocks?.[0] ?? null;
    } catch (error) {
        console.error("Failed to fetch latest block height:", error);
        return null;
    }
}

export async function contractExists(
    contractAddress: string,
): Promise<boolean> {
    const onChainState = await fetchEscrowState(contractAddress);
    return onChainState !== null;
}

export async function getEscrowSummary(contractAddress: string): Promise<{
    exists: boolean;
    state: number;
    deposits: number;
    disputes: number;
    lastTransaction: EscrowTransaction | null;
}> {
    const [onChainState, transactionsList] = await Promise.all([
        fetchEscrowState(contractAddress),
        fetchEscrowTransactions(contractAddress, 1),
    ]);

    return {
        exists: onChainState !== null,
        state: onChainState?.escrowState ?? -1,
        deposits: onChainState?.depositCount ?? 0,
        disputes: onChainState?.disputeCount ?? 0,
        lastTransaction: transactionsList[0] ?? null,
    };
}
