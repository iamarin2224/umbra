import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  ChevronDown,
  Zap,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { EscrowRecord, EscrowState, ESCROW_STATE_LABELS, EscrowActionType } from '../types/escrow';
import { SpotlightCard } from './SpotlightCard';
import { PrivacyShield } from './PrivacyShield';
import { soundFx } from '../lib/AudioEngine';

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
        return { bg: 'rgba(0, 240, 255, 0.08)', border: 'rgba(0, 240, 255, 0.3)', text: 'var(--cyan)' };
      case EscrowState.Funded:
        return { bg: 'rgba(251, 191, 36, 0.08)', border: 'rgba(251, 191, 36, 0.3)', text: 'var(--gold)' };
      case EscrowState.Delivered:
        return { bg: 'rgba(192, 132, 252, 0.08)', border: 'rgba(192, 132, 252, 0.3)', text: 'var(--amethyst)' };
      case EscrowState.Released:
      case EscrowState.Resolved:
        return { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.3)', text: 'var(--emerald)' };
      case EscrowState.Disputed:
        return { bg: 'rgba(251, 113, 133, 0.08)', border: 'rgba(251, 113, 133, 0.3)', text: 'var(--crimson)' };
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
        return { label: 'Release Payment', action: 'release', color: '#10b981', icon: <CheckCircle2 size={12} /> };
      case EscrowState.Disputed:
        return { label: 'Resolve Dispute', action: 'resolve', color: '#10b981', icon: <AlertTriangle size={12} /> };
      default:
        return null;
    }
  };

  const action = getContextualAction();

  return (
    <SpotlightCard
      spotlightColor="rgba(0, 240, 255, 0.12)"
      anchorColor="rgba(0, 240, 255, 0.25)"
      onClick={() => {
        soundFx.playOpen();
        onSelect?.(escrow);
      }}
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        cursor: 'pointer',
        height: '100%',
        minHeight: 280,
      }}
    >
      {/* Top Header: ID + State Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-hero)',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '2px 8px',
              borderRadius: 6,
              border: '1px solid var(--border-whisper)',
              letterSpacing: '0.04em',
            }}
          >
            {escrow.id}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            {new Date(escrow.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: 9999,
            background: stateStyle.bg,
            border: `1px solid ${stateStyle.border}`,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            color: stateStyle.text,
            letterSpacing: '0.04em',
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: stateStyle.text,
              boxShadow: `0 0 6px ${stateStyle.text}`,
            }}
          />
          <span>{escrow.stateLabel || ESCROW_STATE_LABELS[escrow.state]}</span>
        </div>
      </div>

      {/* Amount Display (Editorial Luxury Styling) */}
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
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--text-hero)',
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
              fontWeight: 700,
            }}
          >
            tDUST
          </span>
        </div>
        <span
          style={{
            fontSize: 9,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Shielded Locked
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
            WebkitLineClamp: detailsExpanded ? 'unset' : 2,
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
          paddingTop: 12,
          borderTop: '1px solid var(--border-whisper)',
          marginTop: 'auto',
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playOpen();
            onSelect?.(escrow);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-sub)',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: 0,
            transition: 'color 0.15s',
          }}
        >
          <span>Audit Enclave</span>
          <ArrowUpRight size={12} color="var(--cyan)" />
        </button>

        {action && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isActionLoading}
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playOpen();
              onAction?.(escrow, action.action);
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              background:
                action.color === '#00f0ff'
                  ? 'linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%)'
                  : action.color === '#c084fc'
                  ? 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#06080c',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              fontWeight: 700,
              cursor: isActionLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: `0 0 14px ${action.color}35`,
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
