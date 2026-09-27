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
  Zap,
  Activity,
} from 'lucide-react';
import { EscrowRecord, EscrowState, ESCROW_STATE_LABELS, EscrowTimelineEvent, EscrowActionType } from '../types/escrow';
import { StateFlowVisualizer } from './StateFlowVisualizer';
import { TransactionStream } from './TransactionStream';

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
          { label: 'Cancel & Refund', action: 'cancel', color: 'var(--crimson)' },
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
          padding: 16,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(11, 14, 20, 0.98)',
            border: '1px solid var(--border-sheen)',
            borderRadius: 14,
            width: '100%',
            maxWidth: 720,
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-whisper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={15} color="var(--cyan)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: '#ffffff' }}>
                    Escrow Enclave Audit
                  </h3>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--cyan)',
                      background: 'rgba(0, 240, 255, 0.08)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    {escrow.id}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 1 }}>
                  Zero-Knowledge State Enclave on Midnight Preprod
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-whisper)',
                color: 'var(--text-sub)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Sub Nav Tabs */}
          <div
            style={{
              padding: '8px 20px',
              borderBottom: '1px solid var(--border-whisper)',
              display: 'flex',
              gap: 6,
              background: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            {[
              { id: 'overview', label: 'Overview', icon: <Layers size={12} /> },
              { id: 'circuit', label: 'Compact State', icon: <Cpu size={12} /> },
              { id: 'events', label: 'Proof Stream', icon: <Activity size={12} /> },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: isSelected ? '1px solid rgba(0, 240, 255, 0.35)' : '1px solid transparent',
                    background: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                    color: isSelected ? 'var(--cyan)' : 'var(--text-sub)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
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
          <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeTab === 'overview' && (
              <>
                <StateFlowVisualizer currentState={escrow.state} />

                {/* Core Parameters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-whisper)', borderRadius: 8, padding: '12px' }}>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                      COMMITTED CAPITAL
                    </div>
                    <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
                      {escrow.amount} <span style={{ fontSize: 11, color: 'var(--cyan)' }}>tDUST</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-whisper)', borderRadius: 8, padding: '12px' }}>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                      CURRENT STATE
                    </div>
                    <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--cyan)', marginTop: 4 }}>
                      ● {escrow.stateLabel || ESCROW_STATE_LABELS[escrow.state]}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-whisper)', borderRadius: 8, padding: '12px' }}>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                      INITIALIZED AT
                    </div>
                    <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', marginTop: 4 }}>
                      {new Date(escrow.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Condition Witness */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-whisper)', borderRadius: 8, padding: '12px' }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                    SETTLEMENT CONDITION (WITNESS SPECIFICATION)
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-body)', marginTop: 4, lineHeight: 1.5 }}>
                    {escrow.condition}
                  </p>
                </div>

                {/* Contract & Tx Hash */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-whisper)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>CONTRACT ADDRESS</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ffffff' }}>{escrow.contractAddress}</div>
                    </div>
                    <button onClick={() => handleCopy(escrow.contractAddress, 'contract')} style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}>
                      {copiedField === 'contract' ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
                    </button>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-whisper)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>LATEST TRANSACTION</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)' }}>{escrow.transactionHash}</div>
                    </div>
                    <a href={`https://explorer.preprod.midnight.network/tx/${escrow.transactionHash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)' }}>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'circuit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <StateFlowVisualizer currentState={escrow.state} />
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-whisper)',
                    borderRadius: 8,
                    padding: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: '#94a3b8',
                  }}
                >
                  <div style={{ color: 'var(--cyan)', fontWeight: 600, marginBottom: 6 }}>
                    // Active Compact State:
                  </div>
                  <pre style={{ lineHeight: 1.5, overflowX: 'auto', margin: 0 }}>
                    {`export ledger buyerCommitment: Bytes<32>;
export ledger sellerCommitment: Bytes<32>;
export ledger amountCommitment: Bytes<32>;
export ledger conditionCommitment: Bytes<32>;
export ledger escrowState: Uint<8>; // State: ${escrow.state}`}
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
                padding: '12px 20px',
                borderTop: '1px solid var(--border-whisper)',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              {allowedActions.map((act) => (
                <button
                  key={act.action}
                  disabled={isActionLoading}
                  onClick={() => onAction?.(escrow, act.action)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 7,
                    background: act.color === 'var(--cyan)'
                      ? 'linear-gradient(135deg, #00f0ff, #00b4d8)'
                      : act.color === 'var(--amethyst)'
                      ? 'linear-gradient(135deg, #c084fc, #9333ea)'
                      : act.color === 'var(--crimson)'
                      ? 'linear-gradient(135deg, #fb7185, #e11d48)'
                      : 'linear-gradient(135deg, #34d399, #059669)',
                    color: act.color === 'var(--crimson)' ? '#ffffff' : '#07080c',
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
                  <Zap size={12} />
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
