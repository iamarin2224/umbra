import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Code2, Terminal } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

export const ZKExplorerView: React.FC = () => {
  const [condWitness, setCondWitness] = useState('Deliver verified proof of milestone 2 execution');
  const [amtWitness, setAmtWitness] = useState('1000');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Deterministic simulation hash function for client preview
  const hashString = (val: string, prefix: string) => {
    let hash = 0;
    for (let i = 0; i < val.length; i++) {
      hash = (hash << 5) - hash + val.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${prefix}${hex}a9c21ef9a820c741e2f9821ef9a820c741e2f9821ef9a820c741e2f9821e`;
  };

  const condCommitment = hashString(condWitness, '0x');
  const amtCommitment = hashString(amtWitness, '0x820c741e2f9821ef');

  const compactCode = `pragma language_version 0.23;
import CompactStandardLibrary;

export enum EscrowState { STATE_CREATED, STATE_FUNDED, STATE_DELIVERED, STATE_RELEASED, STATE_DISPUTED, STATE_CANCELLED }

export ledger buyerCommitment: Bytes<32>;
export ledger sellerCommitment: Bytes<32>;
export ledger amountCommitment: Bytes<32>;
export ledger conditionCommitment: Bytes<32>;
export ledger escrowState: EscrowState;
export ledger hasDeposit: Boolean;

witness buyerSecret(): Bytes<32>;
witness sellerSecret(): Bytes<32>;

circuit commitBuyer(secret: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "midnight-lock:v1:buyer:"), secret]);
}

export circuit deposit(value: Uint<64>): [] {
  const buyer = buyerSecret();
  assert(buyerCommitment == commitBuyer(buyer), "Not the buyer");
  assert(escrowState == EscrowState.STATE_CREATED, "Invalid state");
  escrowState = EscrowState.STATE_FUNDED;
}

export circuit confirmDelivery(conditionProof: Bytes<32>): [] {
  assert(escrowState == EscrowState.STATE_FUNDED, "Must be funded");
  assert(conditionCommitment == conditionProof, "Condition mismatch");
  escrowState = EscrowState.STATE_DELIVERED;
}

export circuit release(sellerPubKey: ZswapCoinPublicKey): [] {
  assert(escrowState == EscrowState.STATE_DELIVERED, "Not delivered");
  sendShielded(sellerPubKey);
  escrowState = EscrowState.STATE_RELEASED;
}

export circuit cancel(): [] {
  assert(escrowState == EscrowState.STATE_CREATED || escrowState == EscrowState.STATE_FUNDED, "Cannot cancel");
  escrowState = EscrowState.STATE_CANCELLED;
}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <motion.section
      key="explorer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* View Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>
          Circuit Lab & Commitment Synthesizer
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px' }}>
          Simulate persistentHash commitments from client-side witnesses and inspect the Compact smart contract state machine.
        </p>
      </div>

      {/* Split-Pane IDE/Workbench */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 420px) 1fr',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* Left Pane: Witness & Commitment Simulator */}
        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.12)"
          style={{
            background: 'rgba(13, 16, 23, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-whisper)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-display)', color: '#ffffff' }}>
              Witness Commitment Inputs
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--cyan)',
                background: 'rgba(0, 240, 255, 0.08)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              Client Enclave
            </span>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                marginBottom: '6px',
                letterSpacing: '0.04em',
              }}
            >
              Plaintext Milestone Condition
            </label>
            <textarea
              value={condWitness}
              onChange={(e) => setCondWitness(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-whisper)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: '#ffffff',
                outline: 'none',
                lineHeight: 1.5,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                marginBottom: '6px',
                letterSpacing: '0.04em',
              }}
            >
              Committed Amount (tDUST)
            </label>
            <input
              type="number"
              value={amtWitness}
              onChange={(e) => setAmtWitness(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-whisper)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#ffffff',
                outline: 'none',
              }}
            />
          </div>

          {/* Commitment Previews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            <div
              style={{
                background: 'rgba(0, 240, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.15)',
                borderRadius: '8px',
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', textTransform: 'uppercase' }}>
                  Condition Commitment Hash
                </span>
                <button
                  onClick={() => handleCopy(condCommitment, 'cond')}
                  style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', padding: 0 }}
                >
                  {copiedField === 'cond' ? <Check size={11} color="var(--emerald)" /> : <Copy size={11} />}
                </button>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)', wordBreak: 'break-all' }}>
                {condCommitment}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(192, 132, 252, 0.03)',
                border: '1px solid rgba(192, 132, 252, 0.15)',
                borderRadius: '8px',
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--amethyst)', textTransform: 'uppercase' }}>
                  Amount Commitment Hash
                </span>
                <button
                  onClick={() => handleCopy(amtCommitment, 'amt')}
                  style={{ background: 'none', border: 'none', color: 'var(--amethyst)', cursor: 'pointer', padding: 0 }}
                >
                  {copiedField === 'amt' ? <Check size={11} color="var(--emerald)" /> : <Copy size={11} />}
                </button>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--amethyst)', wordBreak: 'break-all' }}>
                {amtCommitment}
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Right Pane: Code Editor Terminal */}
        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.08)"
          style={{
            background: 'rgba(11, 13, 19, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-whisper)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Editor Header Bar */}
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border-whisper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code2 size={14} color="var(--cyan)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#e2e8f0', fontWeight: 500 }}>
                contracts/escrow.compact
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--text-faint)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                COMPACT v0.23
              </span>
              <button
                onClick={() => handleCopy(compactCode, 'code')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedField === 'code' ? 'var(--emerald)' : 'var(--text-sub)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                {copiedField === 'code' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedField === 'code' ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Editor Code Content */}
          <div
            style={{
              padding: '16px 20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: 1.6,
              color: '#94a3b8',
              maxHeight: '480px',
              overflowY: 'auto',
            }}
          >
            <pre style={{ margin: 0, overflowX: 'auto' }}>
              <code>{compactCode}</code>
            </pre>
          </div>
        </SpotlightCard>
      </div>
    </motion.section>
  );
};
