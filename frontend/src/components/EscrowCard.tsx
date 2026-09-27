import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  ChevronDown,
  Zap,
  Lock,
  CheckCircle2,
  AlertTriangle,
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
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const getStateBadge = (state: EscrowState) => {
    switch (state) {
      case EscrowState.Created:
        return { bg: 'rgba(0, 240, 255, 0.08)', border: 'rgba(0, 240, 255, 0.25)', text: 'var(--cyan)' };
      case EscrowState.Funded:
        return { bg: 'rgba(251, 191, 36, 0.08)', border: 'rgba(251, 191, 36, 0.25)', text: 'var(--gold)' };
      case EscrowState.Delivered:
        return { bg: 'rgba(192, 132, 252, 0.08)', border: 'rgba(192, 132, 252, 0.25)', text: 'var(--amethyst)' };
      case EscrowState.Released:
      case EscrowState.Resolved:
        return { bg: 'rgba(52, 211, 153, 0.08)', border: 'rgba(52, 211, 153, 0.25)', text: 'var(--emerald)' };
      case EscrowState.Disputed:
        return { bg: 'rgba(251, 113, 133, 0.08)', border: 'rgba(251, 113, 133, 0.25)', text: 'var(--crimson)' };
      case EscrowState.Cancelled:
        return { bg: 'rgba(255, 255, 255, 0.03)', border: 'rgba(255, 255, 255, 0.1)', text: 'var(--text-faint)' };
    }
  };

  const stateStyle = getStateBadge(escrow.state);

  // Contextual primary action
  const getContextualAction = (): { label: string; action: EscrowActionType; color: string; icon: React.ReactNode } | null => {
    switch (escrow.state) {
      case EscrowState.Created:
        return { label: 'Fund Escrow', action: 'deposit', color: '#00f0ff', icon: <Lock size={12} /> };
      case EscrowState.Funded:
        return { label: 'Deliver Order', action: 'confirmDelivery', color: '#c084fc', icon: <Zap size={12} /> };
      case EscrowState.Delivered:
        return { label: 'Release Payment', action: 'release', color: '#34d399', icon: <CheckCircle2 size={12} /> };
      case EscrowState.Disputed:
        return { label: 'Resolve Dispute', action: 'resolve', color: '#34d399', icon: <AlertTriangle size={12} /> };
      default:
        return null;
    }
  };

  const action = getContextualAction();

  return (
    <SpotlightCard
      spotlightColor="rgba(0, 240, 255, 0.12)"
      onClick={() => onSelect?.(escrow)}
      style={{
        background: 'rgba(13, 16, 23, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-whisper)',
        borderRadius: '12px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s var(--ease-apple)',
        position: 'relative',
      }}
    >
      {/* Top Header: ID + State */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 600,
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '2px 7px',
              borderRadius: 5,
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            borderRadius: '9999px',
            background: stateStyle.bg,
            border: `1px solid ${stateStyle.border}`,
            fontSize: 11,
            fontWeight: 500,
            fontFamily: 'var(--font-mono)',
            color: stateStyle.text,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: stateStyle.text,
            }}
          />
          <span>{escrow.stateLabel || ESCROW_STATE_LABELS[escrow.state]}</span>
        </div>
      </div>

      {/* Amount Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            {escrow.amount}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--cyan)',
              fontWeight: 600,
            }}
          >
            tDUST
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Shielded Value
        </span>
      </div>

      {/* Condition & Witness Snapshot */}
      <div>
        <p
          style={{
            fontSize: 12,
            color: 'var(--text-sub)',
            lineHeight: 1.5,
            display: detailsExpanded ? 'block' : '-webkit-box',
            WebkitLineClamp: detailsExpanded ? 'unset' : 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {escrow.condition}
        </p>
      </div>

      {/* Counterparties Masked Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
        }}
      >
        <PrivacyShield label="Buyer" value={escrow.buyerAddress} isAddress />
        <PrivacyShield label="Seller" value={escrow.sellerAddress} isAddress />
      </div>

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          paddingTop: 8,
          borderTop: '1px solid var(--border-whisper)',
          marginTop: 'auto',
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
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span>Audit Enclave</span>
          <ExternalLink size={11} />
        </button>

        {action && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isActionLoading}
            onClick={(e) => {
              e.stopPropagation();
              onAction?.(escrow, action.action);
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 7,
              background: action.color === '#00f0ff'
                ? 'linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%)'
                : action.color === '#c084fc'
                ? 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)'
                : 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
              color: '#07080c',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 600,
              cursor: isActionLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {action.icon}
            <span>{action.label}</span>
          </motion.button>
        )}
      </div>
    </SpotlightCard>
  );
};
