import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertCircle,
  Lock,
  Plus,
  Zap,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { CornerAnchors } from './CornerAnchors';
import { soundFx } from '../lib/AudioEngine';
import { MagicDraftPayload } from './CommandPalette';

interface CreateEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { sellerAddress: string; amount: string; condition: string }) => Promise<void>;
  isLoading?: boolean;
  initialData?: MagicDraftPayload | null;
}

export const CreateEscrowModal: React.FC<CreateEscrowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
}) => {
  const { address } = useMidnightWallet();
  const [sellerAddress, setSellerAddress] = useState('');
  const [amount, setAmount] = useState('1000');
  const [condition, setCondition] = useState('Delivery and cryptographic verification of milestone specifications.');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.amount) setAmount(initialData.amount);
      if (initialData.condition) setCondition(initialData.condition);
      if (initialData.sellerAddress) setSellerAddress(initialData.sellerAddress);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!address) {
      soundFx.playError();
      setValidationError('Connect a Midnight wallet first — buyer address is bound to your active wallet.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      soundFx.playError();
      setValidationError('Please specify a valid escrow amount greater than 0.');
      return;
    }

    if (!sellerAddress.trim()) {
      soundFx.playError();
      setValidationError('Seller shielded address is required.');
      return;
    }

    if (!condition.trim()) {
      soundFx.playError();
      setValidationError('Settlement condition witness is required.');
      return;
    }

    try {
      await onSubmit({
        sellerAddress: sellerAddress.trim(),
        amount: amount.trim(),
        condition: condition.trim(),
      });
      soundFx.playSuccess();
      onClose();
    } catch (err: unknown) {
      soundFx.playError();
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
            maxWidth: 520,
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
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(192, 132, 252, 0.2))',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lock size={15} color="var(--cyan)" />
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
                  Deploy Shielded Escrow
                </h3>
                <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  Initialize Compact state machine on Midnight
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

          {/* Form Content */}
          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {validationError && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(251, 113, 133, 0.1)',
                  border: '1px solid rgba(251, 113, 133, 0.3)',
                  color: 'var(--crimson)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Shielded Amount */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-sub)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 6,
                }}
              >
                Escrow Value (tDUST)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-whisper)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14,
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

            {/* Seller Address */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-sub)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 6,
                }}
              >
                Seller Shielded Address
              </label>
              <input
                type="text"
                required
                value={sellerAddress}
                onChange={(e) => setSellerAddress(e.target.value)}
                placeholder="mn_shield_..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-whisper)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                }}
              />
            </div>

            {/* Condition Witness */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-sub)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 6,
                }}
              >
                Settlement Condition Witness
              </label>
              <textarea
                rows={3}
                required
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Cryptographic deliverable criteria..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-whisper)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  resize: 'none',
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Deploy CTA Button */}
            <div style={{ marginTop: 8 }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%)',
                  color: '#06080c',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
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
                    <span>Compiling ZK Proof & Deploying...</span>
                  </>
                ) : (
                  <>
                    <Plus size={15} strokeWidth={2.5} />
                    <span>Deploy Shielded Escrow Enclave</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
