import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Clock,
  ArrowRight,
  ExternalLink,
  Coins,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Zap,
} from 'lucide-react';
import { EscrowRecord, EscrowState, ESCROW_STATE_LABELS, EscrowActionType } from '../types/escrow';
import SpotlightCard from './SpotlightCard';
import { PrivacyShield } from './PrivacyShield';

interface EscrowCardProps {
  escrow: EscrowRecord;
  onSelect?: (escrow: EscrowRecord) => void;
  onAction?: (escrow: EscrowRecord, action: EscrowActionType) => void;
  isActionLoading?: boolean;
}

export const EscrowCard: React.FC<EscrowCardProps> = ({
  escrow,
  onSelect,
  onAction,
  isActionLoading = false,
}) => {
  const getStateColor = (state: EscrowState) => {
    switch (state) {
      case EscrowState.Created:
        return { bg: 'rgba(0, 240, 255, 0.1)', border: 'rgba(0, 240, 255, 0.3)', text: 'var(--cyan)' };
      case EscrowState.Funded:
        return { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)', text: 'var(--gold)' };
      case EscrowState.Delivered:
        return { bg: 'rgba(192, 132, 252, 0.1)', border: 'rgba(192, 132, 252, 0.3)', text: 'var(--amethyst)' };
      case EscrowState.Released:
      case EscrowState.Resolved:
        return { bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.3)', text: 'var(--emerald)' };
      case EscrowState.Disputed:
        return { bg: 'rgba(251, 113, 133, 0.1)', border: 'rgba(251, 113, 133, 0.3)', text: 'var(--crimson)' };
      case EscrowState.Cancelled:
        return { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)', text: 'var(--text-faint)' };
    }
  };

  const stateStyle = getStateColor(escrow.state);

  // Determine available contextual action button
  const getContextualAction = (): { label: string; action: EscrowActionType; color: string } | null => {
    switch (escrow.state) {
      case EscrowState.Created:
        return { label: 'Fund Escrow', action: 'deposit', color: 'var(--cyan)' };
      case EscrowState.Funded:
        return { label: 'Deliver Order', action: 'confirmDelivery', color: 'var(--amethyst)' };
      case EscrowState.Delivered:
        return { label: 'Release Payment', action: 'release', color: 'var(--emerald)' };
      case EscrowState.Disputed:
        return { label: 'Resolve Dispute', action: 'resolve', color: 'var(--emerald)' };
      default:
        return null;
    }
  };

  const action = getContextualAction();

  return (
    <SpotlightCard
      spotlightColor="rgba(0, 240, 255, 0.18)"
      onClick={() => onSelect?.(escrow)}
      style={{
        background: 'rgba(14, 16, 24, 0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--border-whisper)',
        borderRadius: 18,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        position: 'relative',
      }}
    >
      {/* Top Row: Escrow ID + State Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-hero)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '3px 8px',
              borderRadius: 6,
              border: '1px solid var(--border-whisper)',
            }}
          >
            {escrow.id}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            {new Date(escrow.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 20,
            background: stateStyle.bg,
            border: `1px solid ${stateStyle.border}`,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            color: stateStyle.text,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: stateStyle.text,
              boxShadow: `0 0 6px ${stateStyle.text}`,
            }}
          />
          <span>{escrow.stateLabel || ESCROW_STATE_LABELS[escrow.state]}</span>
        </div>
      </div>

      {/* Amount & Currency */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '12px 16px',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text-hero)',
            letterSpacing: '-0.02em',
          }}
        >
          {escrow.amount}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--cyan)',
            fontWeight: 600,
          }}
        >
          tDUST
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-faint)',
          }}
        >
          Zero-Knowledge Escrow
        </span>
      </div>

      {/* Condition Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
          SETTLEMENT CONDITION WITNESS:
        </span>
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-sub)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {escrow.condition}
        </p>
      </div>

      {/* Shielded Address Badges */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          paddingTop: 8,
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <PrivacyShield label="Buyer" value={escrow.buyerAddress} isAddress />
        <PrivacyShield label="Seller" value={escrow.sellerAddress} isAddress />
      </div>

      {/* Action Footer Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 'auto',
          paddingTop: 12,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(escrow);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-sub)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span>Inspect ZK Proof</span>
          <ExternalLink size={12} />
        </button>

        {action && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isActionLoading}
            onClick={(e) => {
              e.stopPropagation();
              onAction?.(escrow, action.action);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              background: action.color === 'var(--cyan)'
                ? 'linear-gradient(135deg, #00f0ff, #0099ff)'
                : action.color === 'var(--amethyst)'
                ? 'linear-gradient(135deg, #c084fc, #9333ea)'
                : 'linear-gradient(135deg, #34d399, #059669)',
              color: '#000000',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 600,
              cursor: isActionLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
            }}
          >
            <Zap size={13} fill="#000" />
            <span>{action.label}</span>
          </motion.button>
        )}
      </div>
    </SpotlightCard>
  );
};
