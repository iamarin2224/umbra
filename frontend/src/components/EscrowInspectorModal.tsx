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
  ArrowUpRight,
} from 'lucide-react';
import { EscrowRecord, EscrowState, ESCROW_STATE_LABELS, EscrowTimelineEvent, EscrowActionType } from '../types/escrow';
import { StateFlowVisualizer } from './StateFlowVisualizer';
import { TransactionStream } from './TransactionStream';
import { CornerAnchors } from './CornerAnchors';
import { soundFx } from '../lib/AudioEngine';

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
    soundFx.playTick();
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
          background: 'rgba(0, 0, 0, 0.78)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onClick={() => {
          soundFx.playClose();
          onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-sheen)',
            borderRadius: 18,
            width: '100%',
            maxWidth: 760,
            maxHeight: '88vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(0, 240, 255, 0.15)',
          }}
        >
          <CornerAnchors color="rgba(0, 240, 255, 0.3)" size={8} />

          {/* Header Bar */}
          <div
            style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--border-whisper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.015)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(192, 132, 252, 0.15))',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={16} color="var(--cyan)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-editorial)',
                      fontStyle: 'italic',
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--text-hero)',
                    }}
                  >
                    Escrow Enclave Audit
                  </h3>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--cyan)',
                      background: 'rgba(0, 240, 255, 0.08)',
                      border: '1px solid rgba(0, 240, 255, 0.25)',
                      padding: '2px 7px',
                      borderRadius: 5,
                      fontWeight: 600,
                    }}
                  >
                    {escrow.id}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  Zero-Knowledge State Enclave on Midnight Preprod
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClose();
                onClose();
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
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

          {/* Subheader: Segmented Tabs */}
          <div
            style={{
              padding: '8px 22px',
              borderBottom: '1px solid var(--border-whisper)',
              display: 'flex',
              gap: 8,
              background: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            {[
              { id: 'overview', label: 'Enclave Overview', icon: <Layers size={12} /> },
              { id: 'circuit', label: 'Compact Circuit Witness', icon: <Cpu size={12} /> },
              { id: 'events', label: 'ZK Transaction History', icon: <Activity size={12} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playTick();
                  setActiveTab(tab.id as 'overview' | 'circuit' | 'events');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: activeTab === tab.id ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--cyan)' : 'var(--text-sub)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* VIEW 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <>
                {/* State Machine Progression */}
                <StateFlowVisualizer currentState={escrow.state} />

                {/* Financial Summary */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12,
                  }}
                >
                  <div
                    className="hairline-card"
                    style={{
                      padding: '14px',
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                      Shielded Value
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                      <span style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 24, fontWeight: 800, color: 'var(--text-hero)' }}>
                        {escrow.amount}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)', fontWeight: 700 }}>
                        tDUST
                      </span>
                    </div>
                  </div>

                  <div
                    className="hairline-card"
                    style={{
                      padding: '14px',
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                      Current State
                    </div>
                    <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--emerald)' }}>
                      {escrow.stateLabel || ESCROW_STATE_LABELS[escrow.state]}
                    </div>
                  </div>
                </div>

                {/* Counterparties & Witness Parameters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Shielded Counterparties & Parameters
                  </div>

                  <div
                    className="hairline-card"
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>Buyer Shielded Address:</span>
                      <button
                        onClick={() => handleCopy(escrow.buyerAddress, 'buyer')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedField === 'buyer' ? 'var(--emerald)' : 'var(--cyan)',
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {copiedField === 'buyer' ? <Check size={11} /> : <Copy size={11} />}
                        <span>{escrow.buyerAddress.slice(0, 10)}...{escrow.buyerAddress.slice(-8)}</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>Seller Shielded Address:</span>
                      <button
                        onClick={() => handleCopy(escrow.sellerAddress, 'seller')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedField === 'seller' ? 'var(--emerald)' : 'var(--cyan)',
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {copiedField === 'seller' ? <Check size={11} /> : <Copy size={11} />}
                        <span>{escrow.sellerAddress.slice(0, 10)}...{escrow.sellerAddress.slice(-8)}</span>
                      </button>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-whisper)', paddingTop: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                        SETTLEMENT CONDITION WITNESS
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-hero)', lineHeight: 1.5 }}>
                        {escrow.condition}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* VIEW 2: CIRCUIT WITNESS */}
            {activeTab === 'circuit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  The Compact smart contract verifies zero-knowledge Halo2 proofs compiled for the Midnight Network. All state transitions check cryptographic commitments without exposing underlying plaintext secrets.
                </div>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid var(--border-whisper)',
                    borderRadius: 10,
                    padding: '14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: '#a5f3fc',
                    overflowX: 'auto',
                    lineHeight: 1.6,
                  }}
                >
                  <pre>{`// Compact ZK Circuit State Binding
export ledger contractInstance: Address = "${escrow.contractAddress || escrow.id}";
export ledger transactionHash: Bytes<32> = "${escrow.transactionHash || '0x4f82a9...'}";
export ledger escrowState: EscrowState = EscrowState.${escrow.stateLabel || 'STATE_CREATED'};

witness buyerSecret(): Bytes<32>;
witness sellerSecret(): Bytes<32>;`}</pre>
                </div>
              </div>
            )}

            {/* VIEW 3: EVENTS */}
            {activeTab === 'events' && (
              <TransactionStream events={events} escrowId={escrow.id} />
            )}
          </div>

          {/* Footer Action Strip */}
          {allowedActions.length > 0 && (
            <div
              style={{
                padding: '14px 22px',
                borderTop: '1px solid var(--border-whisper)',
                background: 'rgba(255, 255, 255, 0.015)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              {allowedActions.map((act) => (
                <button
                  key={act.action}
                  disabled={isActionLoading}
                  onClick={() => {
                    soundFx.playOpen();
                    onAction?.(escrow, act.action);
                  }}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 8,
                    background:
                      act.action === 'deposit'
                        ? 'linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%)'
                        : act.action === 'release' || act.action === 'resolve'
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : act.action === 'confirmDelivery'
                        ? 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)'
                        : 'rgba(251, 113, 133, 0.1)',
                    color: act.action === 'cancel' || act.action === 'dispute' ? 'var(--crimson)' : '#06080c',
                    border: act.action === 'cancel' || act.action === 'dispute' ? '1px solid rgba(251, 113, 133, 0.3)' : 'none',
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: isActionLoading ? 'not-allowed' : 'pointer',
                    boxShadow: act.action === 'deposit' ? '0 0 14px rgba(0, 240, 255, 0.3)' : 'none',
                  }}
                >
                  {act.label}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
