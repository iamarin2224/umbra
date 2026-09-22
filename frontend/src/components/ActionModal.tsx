import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { EscrowRecord, EscrowActionType, ESCROW_STATE_LABELS } from '../types/escrow';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrow: EscrowRecord | null;
  actionType: EscrowActionType | null;
  onConfirm: (escrowId: string, action: EscrowActionType, params?: { value?: string }) => Promise<void>;
  isLoading?: boolean;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  escrow,
  actionType,
  onConfirm,
  isLoading = false,
}) => {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !escrow || !actionType) return null;

  const getActionConfig = () => {
    switch (actionType) {
      case 'deposit':
        return {
          title: 'Deposit & Fund Escrow',
          desc: `Lock ${escrow.amount} tDUST into the shielded smart contract instance.`,
          circuit: 'deposit(witness buyerSecret, uint value)',
          buttonText: 'Execute ZK Deposit',
          color: 'var(--cyan)',
          icon: <Lock size={18} color="var(--cyan)" />,
        };
      case 'confirmDelivery':
        return {
          title: 'Confirm Order Delivery',
          desc: 'Submit zero-knowledge proof satisfying the settlement condition witness.',
          circuit: 'confirmDelivery(witness sellerSecret, witness conditionHash)',
          buttonText: 'Submit Delivery Proof',
          color: 'var(--amethyst)',
          icon: <ShieldCheck size={18} color="var(--amethyst)" />,
        };
      case 'release':
        return {
          title: 'Release Shielded Payment',
          desc: `Release ${escrow.amount} tDUST from contract to the seller's shielded address.`,
          circuit: 'release(witness buyerSecret, sellerPubKey)',
          buttonText: 'Release Shielded Funds',
          color: 'var(--emerald)',
          icon: <Zap size={18} color="var(--emerald)" />,
        };
      case 'dispute':
        return {
          title: 'Initiate Escrow Dispute',
          desc: 'Pause state machine transitions and request decentralized arbiter intervention.',
          circuit: 'dispute()',
          buttonText: 'Submit Formal Dispute',
          color: 'var(--crimson)',
          icon: <AlertTriangle size={18} color="var(--crimson)" />,
        };
      case 'resolve':
        return {
          title: 'Resolve Arbitration',
          desc: 'Execute final arbiter resolution circuit to distribute escrowed capital.',
          circuit: 'resolve()',
          buttonText: 'Resolve & Settle',
          color: 'var(--emerald)',
          icon: <CheckCircle2 size={18} color="var(--emerald)" />,
        };
      case 'cancel':
        return {
          title: 'Cancel Escrow Agreement',
          desc: 'Terminate the agreement and unlock any unconfirmed state allocations.',
          circuit: 'cancel()',
          buttonText: 'Cancel Agreement',
          color: 'var(--crimson)',
          icon: <ShieldAlert size={18} color="var(--crimson)" />,
        };
      default:
        return {
          title: 'Execute Circuit Action',
          desc: 'Invoke smart contract state transition on Midnight.',
          circuit: 'transition()',
          buttonText: 'Execute Circuit',
          color: 'var(--cyan)',
          icon: <Zap size={18} color="var(--cyan)" />,
        };
    }
  };

  const config = getActionConfig();

  const handleExecute = async () => {
    setError(null);
    try {
      await onConfirm(escrow.id, actionType, { value: escrow.amount });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'State transition failed');
    }
  };

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
          background: 'rgba(0, 0, 0, 0.78)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
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
            background: 'rgba(12, 15, 24, 0.96)',
            border: `1px solid ${config.color === 'var(--crimson)' ? 'rgba(251, 113, 133, 0.3)' : 'rgba(0, 240, 255, 0.3)'}`,
            borderRadius: 20,
            width: '100%',
            maxWidth: 520,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
          }}
        >
          {/* Header */}
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
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-whisper)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {config.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--text-hero)',
                  }}
                >
                  {config.title}
                </h3>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                  Target: {escrow.id} ({escrow.amount} tDUST)
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

          {/* Body */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div
                style={{
                  background: 'rgba(251, 113, 133, 0.12)',
                  border: '1px solid rgba(251, 113, 133, 0.3)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  color: 'var(--crimson)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {error}
              </div>
            )}

            <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>{config.desc}</p>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-whisper)',
                borderRadius: 10,
                padding: '12px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-faint)',
              }}
            >
              <span style={{ color: config.color, fontWeight: 600 }}>ZK Circuit: </span>
              <span>{config.circuit}</span>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-whisper)',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span style={{ color: 'var(--text-faint)' }}>CURRENT STATE:</span>
              <span style={{ color: 'var(--text-hero)', fontWeight: 600 }}>
                {escrow.stateLabel || ESCROW_STATE_LABELS[escrow.state]}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: '1px solid var(--border-whisper)',
                  color: 'var(--text-sub)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleExecute}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  background: config.color === 'var(--crimson)'
                    ? 'linear-gradient(135deg, #fb7185, #e11d48)'
                    : config.color === 'var(--amethyst)'
                    ? 'linear-gradient(135deg, #c084fc, #9333ea)'
                    : config.color === 'var(--emerald)'
                    ? 'linear-gradient(135deg, #34d399, #059669)'
                    : 'linear-gradient(135deg, #00f0ff, #0099ff)',
                  color: config.color === 'var(--crimson)' ? '#ffffff' : '#000000',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Zap size={14} />
                <span>{isLoading ? 'Generating Proof...' : config.buttonText}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
