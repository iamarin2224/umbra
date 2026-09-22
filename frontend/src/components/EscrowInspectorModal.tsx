import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  ExternalLink,
  Copy,
  Check,
  Cpu,
  Layers,
  FileCode,
  Zap,
  Activity,
  Lock,
} from 'lucide-react';
import { EscrowRecord, EscrowState, ESCROW_STATE_LABELS, EscrowTimelineEvent, EscrowActionType } from '../types/escrow';
import { StateFlowVisualizer } from './StateFlowVisualizer';
import { TransactionStream } from './TransactionStream';
import { PrivacyShield } from './PrivacyShield';

interface EscrowInspectorModalProps {
  escrow: EscrowRecord | null;
  events: EscrowTimelineEvent[];
  isOpen: boolean;
  onClose: () => void;
  onAction?: (escrow: EscrowRecord, action: EscrowActionType) => void;
  isActionLoading?: boolean;
}

export const EscrowInspectorModal: React.FC<EscrowInspectorModalProps> = ({
  escrow,
  events,
  isOpen,
  onClose,
  onAction,
  isActionLoading = false,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'circuit' | 'events'>('overview');

  if (!isOpen || !escrow) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Determine allowed circuits based on state
  const getAllowedActions = (): Array<{ label: string; action: EscrowActionType; color: string }> => {
    switch (escrow.state) {
      case EscrowState.Created:
        return [
          { label: 'Deposit (Fund)', action: 'deposit', color: 'var(--cyan)' },
          { label: 'Cancel Agreement', action: 'cancel', color: 'var(--crimson)' },
        ];
      case EscrowState.Funded:
        return [
          { label: 'Confirm Delivery', action: 'confirmDelivery', color: 'var(--amethyst)' },
          { label: 'Initiate Dispute', action: 'dispute', color: 'var(--crimson)' },
        ];
      case EscrowState.Delivered:
        return [
          { label: 'Release Funds', action: 'release', color: 'var(--emerald)' },
          { label: 'Initiate Dispute', action: 'dispute', color: 'var(--crimson)' },
        ];
      case EscrowState.Disputed:
        return [
          { label: 'Resolve Dispute', action: 'resolve', color: 'var(--emerald)' },
        ];
      default:
        return [];
    }
  };

  const allowedActions = getAllowedActions();

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(10, 13, 20, 0.94)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 820,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 240, 255, 0.1)',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-whisper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={18} color="var(--cyan)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--text-hero)',
                    }}
                  >
                    Deep Audit Inspector
                  </h3>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--cyan)',
                      background: 'rgba(0, 240, 255, 0.1)',
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {escrow.id}
                  </span>
                </div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                  On-chain Zero-Knowledge State Enclave
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-whisper)',
                color: 'var(--text-sub)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Sub Navigation Bar */}
          <div
            style={{
              padding: '10px 24px',
              borderBottom: '1px solid var(--border-whisper)',
              display: 'flex',
              gap: 8,
              background: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            {[
              { id: 'overview', label: 'Protocol Ledger', icon: <Layers size={13} /> },
              { id: 'circuit', label: 'Compact State Machine', icon: <Cpu size={13} /> },
              { id: 'events', label: 'Proof Stream', icon: <Activity size={13} /> },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: isSelected ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                    background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                    color: isSelected ? 'var(--cyan)' : 'var(--text-sub)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {activeTab === 'overview' && (
              <>
                {/* Visual State Progress Bar */}
                <StateFlowVisualizer currentState={escrow.state} />

                {/* Core Parameters Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-whisper)',
                      borderRadius: 12,
                      padding: '14px 16px',
                    }}
                  >
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                      COMMITTED AMOUNT
                    </span>
                    <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-hero)', marginTop: 4 }}>
                      {escrow.amount} <span style={{ fontSize: 12, color: 'var(--cyan)' }}>tDUST</span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-whisper)',
                      borderRadius: 12,
                      padding: '14px 16px',
                    }}
                  >
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                      CURRENT LEDGER STATE
                    </span>
                    <div style={{ fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--cyan)', marginTop: 6 }}>
                      ● {escrow.stateLabel || ESCROW_STATE_LABELS[escrow.state]}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-whisper)',
                      borderRadius: 12,
                      padding: '14px 16px',
                    }}
                  >
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                      CONTRACT CREATED
                    </span>
                    <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', marginTop: 6 }}>
                      {new Date(escrow.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Condition Witness */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-whisper)',
                    borderRadius: 12,
                    padding: '16px',
                  }}
                >
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                    SETTLEMENT CONDITION (WITNESS SPECIFICATION)
                  </span>
                  <p style={{ fontSize: 13, color: 'var(--text-hero)', marginTop: 6, lineHeight: 1.6 }}>
                    {escrow.condition}
                  </p>
                </div>

                {/* Cryptographic Hashes & Addresses */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-whisper)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                        CONTRACT ADDRESS
                      </span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-hero)' }}>
                        {escrow.contractAddress}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(escrow.contractAddress, 'contract')}
                      style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}
                    >
                      {copiedField === 'contract' ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-whisper)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                        LATEST TX HASH
                      </span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--cyan)' }}>
                        {escrow.transactionHash}
                      </div>
                    </div>
                    <a
                      href={`https://explorer.preprod.midnight.network/tx/${escrow.transactionHash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--cyan)' }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'circuit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <StateFlowVisualizer currentState={escrow.state} />

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid var(--border-whisper)',
                    borderRadius: 12,
                    padding: '16px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: '#94a3b8',
                  }}
                >
                  <div style={{ color: 'var(--cyan)', fontWeight: 600, marginBottom: 8 }}>
                    // Active Compact Verification Circuit:
                  </div>
                  <pre style={{ lineHeight: 1.6, overflowX: 'auto' }}>
                    {`export ledger buyerCommitment: Bytes<32>;
export ledger sellerCommitment: Bytes<32>;
export ledger amountCommitment: Bytes<32>;
export ledger conditionCommitment: Bytes<32>;
export ledger escrowState: Uint<8>; // Current: ${escrow.state}`}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <TransactionStream events={events} escrowId={escrow.id} />
            )}
          </div>

          {/* Action Footer */}
          {allowedActions.length > 0 && (
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-whisper)',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 12,
              }}
            >
              {allowedActions.map((act) => (
                <button
                  key={act.action}
                  disabled={isActionLoading}
                  onClick={() => onAction?.(escrow, act.action)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 10,
                    background: act.color === 'var(--cyan)'
                      ? 'linear-gradient(135deg, #00f0ff, #0099ff)'
                      : act.color === 'var(--amethyst)'
                      ? 'linear-gradient(135deg, #c084fc, #9333ea)'
                      : act.color === 'var(--crimson)'
                      ? 'linear-gradient(135deg, #fb7185, #e11d48)'
                      : 'linear-gradient(135deg, #34d399, #059669)',
                    color: act.color === 'var(--crimson)' ? '#ffffff' : '#000000',
                    border: 'none',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: isActionLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Zap size={14} />
                  <span>{act.label}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
