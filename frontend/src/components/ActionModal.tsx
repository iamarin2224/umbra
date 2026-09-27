import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
import { EscrowRecord, EscrowActionType, ESCROW_STATE_LABELS } from '../types/escrow';
import { CornerAnchors } from './CornerAnchors';
import { soundFx } from '../lib/AudioEngine';

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
          icon: <Lock size={16} color="var(--cyan)" />,
        };
      case 'confirmDelivery':
        return {
          title: 'Confirm Order Delivery',
          desc: 'Submit zero-knowledge proof satisfying the settlement condition witness.',
          circuit: 'confirmDelivery(witness sellerSecret, witness conditionHash)',
          buttonText: 'Submit Delivery Proof',
          color: 'var(--amethyst)',
          icon: <ShieldCheck size={16} color="var(--amethyst)" />,
        };
      case 'release':
        return {
          title: 'Release Shielded Payment',
          desc: `Release ${escrow.amount} tDUST from contract to the seller's shielded address.`,
          circuit: 'release(witness buyerSecret, sellerPubKey)',
          buttonText: 'Release Shielded Funds',
          color: 'var(--emerald)',
          icon: <Zap size={16} color="var(--emerald)" />,
        };
      case 'dispute':
        return {
          title: 'Initiate Escrow Dispute',
          desc: 'Pause state transitions and request decentralized arbiter intervention.',
          circuit: 'dispute()',
          buttonText: 'Submit Dispute',
          color: 'var(--crimson)',
          icon: <AlertTriangle size={16} color="var(--crimson)" />,
        };
      case 'resolve':
        return {
          title: 'Resolve Arbitration',
          desc: 'Execute final arbiter resolution circuit to distribute escrowed capital.',
          circuit: 'resolve()',
          buttonText: 'Resolve & Settle',
          color: 'var(--emerald)',
          icon: <CheckCircle2 size={16} color="var(--emerald)" />,
        };
      case 'cancel':
        return {
          title: 'Cancel Escrow Agreement',
          desc: 'Terminate the agreement and unlock any unconfirmed state allocations.',
          circuit: 'cancel()',
          buttonText: 'Cancel Agreement',
          color: 'var(--crimson)',
          icon: <ShieldAlert size={16} color="var(--crimson)" />,
        };
      default:
        return {
          title: 'Execute Circuit Action',
          desc: 'Invoke smart contract state transition on Midnight.',
          circuit: 'transition()',
          buttonText: 'Execute Circuit',
          color: 'var(--cyan)',
          icon: <Zap size={16} color="var(--cyan)" />,
        };
    }
  };

  const config = getActionConfig();

  const handleConfirm = async () => {
    setError(null);
    try {
      await onConfirm(escrow.id, actionType);
      soundFx.playSuccess();
      onClose();
    } catch (err: unknown) {
      soundFx.playError();
      setError(err instanceof Error ? err.message : 'Action execution failed');
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
            maxWidth: 480,
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(0, 240, 255, 0.15)',
          }}
        >
          <CornerAnchors color="rgba(0, 240, 255, 0.3)" size={8} />

          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-whisper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.015)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
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
                    fontFamily: 'var(--font-editorial)',
                    fontStyle: 'italic',
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--text-hero)',
                  }}
                >
                  {config.title}
                </h3>
                <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  Enclave {escrow.id}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClose();
                onClose();
              }}
              style={{
                width: 28,
                height: 28,
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

          {/* Body Content */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(251, 113, 133, 0.1)',
                  border: '1px solid rgba(251, 113, 133, 0.3)',
                  color: 'var(--crimson)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {error}
              </div>
            )}

            <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5 }}>
              {config.desc}
            </p>

            {/* Circuit Information */}
            <div
              className="hairline-card"
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--cyan)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                <Cpu size={13} />
                <span>Midnight Compact Circuit</span>
              </div>
              <code style={{ fontSize: 11, color: 'var(--text-hero)', fontFamily: 'var(--font-mono)' }}>
                {config.circuit}
              </code>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClose();
                  onClose();
                }}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-whisper)',
                  color: 'var(--text-sub)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                style={{
                  flex: 2,
                  padding: '10px',
                  borderRadius: 8,
                  background:
                    actionType === 'deposit'
                      ? 'linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%)'
                      : actionType === 'confirmDelivery'
                      ? 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)'
                      : actionType === 'release' || actionType === 'resolve'
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
                  color: '#06080c',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: isLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: `0 0 16px ${config.color}35`,
                }}
              >
                {isLoading ? (
                  <>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        border: '2px solid #06080c',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    <span>Verifying Proof...</span>
                  </>
                ) : (
                  <span>{config.buttonText}</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
