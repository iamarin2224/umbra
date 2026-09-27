import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useMidnightWallet } from '../context/MidnightWalletContext';

interface CreateEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { sellerAddress: string; amount: string; condition: string }) => Promise<void>;
  isLoading?: boolean;
}

export const CreateEscrowModal: React.FC<CreateEscrowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { address } = useMidnightWallet();
  const [sellerAddress, setSellerAddress] = useState('');
  const [amount, setAmount] = useState('1000');
  const [condition, setCondition] = useState('Delivery and cryptographic verification of milestone specifications.');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!address) {
      setValidationError('Connect a Midnight wallet first — the buyer address comes from your live wallet.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Please specify a valid escrow amount greater than 0.');
      return;
    }

    if (!sellerAddress.trim()) {
      setValidationError('Seller shielded address is required.');
      return;
    }

    if (!condition.trim()) {
      setValidationError('Settlement condition witness is required.');
      return;
    }

    try {
      await onSubmit({
        sellerAddress: sellerAddress.trim(),
        amount: amount.trim(),
        condition: condition.trim(),
      });
      onClose();
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : 'Failed to deploy escrow contract');
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
            maxWidth: 500,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-whisper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#ffffff',
                }}
              >
                Deploy Shielded Escrow
              </h3>
              <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
                Initialize Compact state machine on Midnight
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

          {/* Form Content */}
          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {validationError && (
              <div
                style={{
                  background: 'rgba(251, 113, 133, 0.08)',
                  border: '1px solid rgba(251, 113, 133, 0.25)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--crimson)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <AlertCircle size={14} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Connected Buyer */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-sub)',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Buyer Address (Connected)
              </label>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-whisper)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: address ? '#ffffff' : 'var(--crimson)',
                  wordBreak: 'break-all',
                }}
              >
                {address || 'Wallet not connected — connect wallet to proceed'}
              </div>
            </div>

            {/* Seller Address */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-sub)',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Seller Shielded Address
              </label>
              <input
                type="text"
                value={sellerAddress}
                onChange={(e) => setSellerAddress(e.target.value)}
                placeholder="mn_shielded_..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-whisper)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>

            {/* Amount */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-sub)',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Escrow Value (tDUST)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-whisper)',
                    borderRadius: 8,
                    padding: '9px 12px',
                    paddingRight: 60,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#ffffff',
                    outline: 'none',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--cyan)',
                    fontWeight: 600,
                  }}
                >
                  tDUST
                </span>
              </div>
            </div>

            {/* Condition Witness */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-sub)',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Settlement Condition Witness
              </label>
              <textarea
                rows={3}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Describe milestone terms..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-whisper)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: '#ffffff',
                  outline: 'none',
                  lineHeight: 1.4,
                }}
              />
            </div>

            {/* Submit Actions */}
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid var(--border-whisper)',
                  color: 'var(--text-sub)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%)',
                  color: '#07080c',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Lock size={12} />
                <span>{isLoading ? 'Synthesizing Proof...' : 'Deploy Escrow'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
