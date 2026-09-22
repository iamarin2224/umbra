/**
 * Umbra Escrow Domain & Protocol Types
 * Shared between Midnight ZK contracts, REST API clients, and React HUD components.
 */

export enum EscrowState {
  Created = 0,
  Funded = 1,
  Delivered = 2,
  Released = 3,
  Disputed = 4,
  Resolved = 5,
  Cancelled = 6,
}

export const ESCROW_STATE_LABELS: Record<EscrowState, string> = {
  [EscrowState.Created]: 'Created',
  [EscrowState.Funded]: 'Funded',
  [EscrowState.Delivered]: 'Delivered',
  [EscrowState.Released]: 'Released',
  [EscrowState.Disputed]: 'Disputed',
  [EscrowState.Resolved]: 'Resolved',
  [EscrowState.Cancelled]: 'Cancelled',
};

export const ESCROW_STATE_COLORS: Record<EscrowState, string> = {
  [EscrowState.Created]: 'var(--cyan)',
  [EscrowState.Funded]: 'var(--gold)',
  [EscrowState.Delivered]: 'var(--amethyst)',
  [EscrowState.Released]: 'var(--emerald)',
  [EscrowState.Disputed]: 'var(--crimson)',
  [EscrowState.Resolved]: 'var(--emerald)',
  [EscrowState.Cancelled]: 'var(--text-faint)',
};

export interface EscrowRecord {
  id: string;
  contractAddress: string;
  buyerAddress: string;
  sellerAddress: string;
  amount: string;
  condition: string;
  state: EscrowState;
  stateLabel: string;
  createdAt: string;
  updatedAt: string;
  fundedAt: string | null;
  deliveredAt: string | null;
  releasedAt: string | null;
  disputedAt: string | null;
  resolvedAt: string | null;
  cancelledAt: string | null;
  transactionHash: string;
  depositCoinIndex?: string | null;
  buyerSecret?: string;
  sellerSecret?: string;
  salt?: string;
}

export interface CreateEscrowRequest {
  buyerAddress: string;
  sellerAddress: string;
  amount: string;
  condition: string;
}

export type EscrowActionType =
  | 'deposit'
  | 'confirmDelivery'
  | 'release'
  | 'cancel'
  | 'dispute'
  | 'resolve';

export interface EscrowActionRequest {
  action: EscrowActionType;
  value?: string;
  sellerPubKey?: string;
  coinIndex?: string;
}

export interface EscrowActionResult {
  success: boolean;
  transactionHash: string;
  blockHeight?: number;
  newState: EscrowState;
  newStateLabel: string;
  error?: string;
}

export interface EscrowDeploymentResult {
  contractAddress: string;
  transactionHash: string;
  buyerCommitment: string;
  sellerCommitment: string;
  amountCommitment: string;
  conditionCommitment: string;
  buyerSecret?: string;
  sellerSecret?: string;
}

export interface WalletCoin {
  nonce: string;
  color: string;
  value: string;
  mtIndex?: string;
  nullifier?: string;
}

export interface WalletAvailableCoinsResponse {
  coins: WalletCoin[];
  totalValue: string;
}

export interface WalletPublicKeyResponse {
  publicKey: string;
}

export interface ApiHealthResponse {
  ok: boolean;
  timestamp: string;
  version?: string;
  network?: string;
}

export interface EscrowFilter {
  state?: EscrowState | 'all';
  searchQuery?: string;
  buyerAddress?: string;
  sellerAddress?: string;
}

export interface EscrowTimelineEvent {
  id: string;
  escrowId: string;
  type: EscrowActionType | 'created';
  fromState?: EscrowState;
  toState: EscrowState;
  transactionHash: string;
  timestamp: string;
  description: string;
}
