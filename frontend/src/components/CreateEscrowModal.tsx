import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  Coins,
  FileText,
  UserCheck,
  AlertCircle,
  Terminal,
  Sparkles,
  Lock,
} from 'lucide-react';
import { DEMO_BUYER_ADDRESS, DEMO_SELLER_ADDRESS, useMidnightWallet } from '../context/MidnightWalletContext';

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
  const [sellerAddress, setSellerAddress] = useState(DEMO_SELLER_ADDRESS);
  const [amount, setAmount] = useState('1000');
  const [condition, setCondition] = useState('Delivery and cryptographic verification of milestone specifications.');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

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
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 580,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 50px rgba(0, 240, 255, 0.12)',
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
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Terminal size={18} color="var(--cyan)" />
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
                  Deploy Zero-Knowledge Escrow
                </h3>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                  Initialize Compact ZK State Machine on Midnight
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

          {/* Form Content */}
          <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {validationError && (
              <div
                style={{
                  background: 'rgba(251, 113, 133, 0.12)',
                  border: '1px solid rgba(251, 113, 133, 0.3)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: 'var(--crimson)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <AlertCircle size={16} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Connected Buyer (Witness) */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-sub)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                }}
              >
                Buyer Shielded Address (Origin Enclave)
              </label>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-whisper)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-faint)',
                  wordBreak: 'break-all',
                }}
              >
                {address || DEMO_BUYER_ADDRESS}
              </div>
            </div>

            {/* Seller Address */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-sub)',
                    textTransform: 'uppercase',
                  }}
                >
                  Seller Shielded Address
                </label>
                <button
                  type="button"
                  onClick={() => setSellerAddress(DEMO_SELLER_ADDRESS)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Use Demo Counterparty
                </button>
              </div>
              <input
                type="text"
                value={sellerAddress}
                onChange={(e) => setSellerAddress(e.target.value)}
                placeholder="mn_shielded_..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-whisper)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text-hero)',
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
                  fontSize: 11,
                  color: 'var(--text-sub)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
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
                    borderRadius: 10,
                    padding: '12px 14px',
                    paddingRight: 70,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-hero)',
                    outline: 'none',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
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
                  fontSize: 11,
                  color: 'var(--text-sub)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                }}
              >
                Settlement Condition Witness
              </label>
              <textarea
                rows={3}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Describe milestone conditions (committed as Pedersen SHA-256 hash)..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-whisper)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--text-hero)',
                  outline: 'none',
                  lineHeight: 1.5,
                }}
              />
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>
                * Plaintext remains client-side. Only the 32-byte commitment hash is broadcast on Midnight.
              </span>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
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
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #00f0ff 0%, #0099ff 100%)',
                  color: '#000000',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                }}
              >
                <Lock size={14} />
                <span>{isLoading ? 'Synthesizing Proof...' : 'Deploy Shielded Escrow'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
