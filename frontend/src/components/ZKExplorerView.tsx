import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Lock, CheckCircle2, Copy, Check, Sparkles, Terminal, Code2 } from 'lucide-react';
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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <motion.section
      key="explorer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
    >
      <div style={{ marginBottom: '32px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--cyan)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          Cryptographic Lab &amp; Verification Inspector
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginTop: '6px' }}>
          Circuit &amp; Commitment Synthesizer
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '6px', maxWidth: '640px' }}>
          Simulate how plaintext contract parameters transform into uninvertible Pedersen commitments before on-chain ledger publication.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Pedersen Simulator Panel */}
        <SpotlightCard className="fluid-glass-panel" spotlightColor="rgba(0, 229, 255, 0.2)">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600 }}>
              Pedersen Lab Simulator
            </h3>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--cyan)',
                background: 'rgba(0, 240, 255, 0.1)',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              CLIENT ENCLAVE
            </span>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Plaintext Delivery Milestone Witness
            </label>
            <textarea
              value={condWitness}
              onChange={(e) => setCondWitness(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-whisper)',
                borderRadius: '10px',
                padding: '12px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-hero)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Private Escrow Balance (tDUST)
            </label>
            <input
              type="number"
              value={amtWitness}
              onChange={(e) => setAmtWitness(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-whisper)',
                borderRadius: '10px',
                padding: '12px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-hero)',
                outline: 'none',
              }}
            />
          </div>

          <div
            style={{
              background: 'rgba(0, 240, 255, 0.03)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '12px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--cyan)',
                  textTransform: 'uppercase',
                }}
              >
                Condition Commitment Hash (On-Chain)
              </span>
              <button
                onClick={() => handleCopy(condCommitment, 'cond')}
                style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', padding: 0 }}
              >
                {copiedField === 'cond' ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
              </button>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--cyan)',
                wordBreak: 'break-all',
                marginTop: '6px',
              }}
            >
              {condCommitment}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(192, 132, 252, 0.03)',
              border: '1px solid rgba(192, 132, 252, 0.15)',
              borderRadius: '10px',
              padding: '14px 16px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--amethyst)',
                  textTransform: 'uppercase',
                }}
              >
                Balance Commitment Hash (On-Chain)
              </span>
              <button
                onClick={() => handleCopy(amtCommitment, 'amt')}
                style={{ background: 'none', border: 'none', color: 'var(--amethyst)', cursor: 'pointer', padding: 0 }}
              >
                {copiedField === 'amt' ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
              </button>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--amethyst)',
                wordBreak: 'break-all',
                marginTop: '6px',
              }}
            >
              {amtCommitment}
            </div>
          </div>
        </SpotlightCard>

        {/* Compact Source Circuit Panel */}
        <SpotlightCard
          spotlightColor="rgba(192, 132, 252, 0.2)"
          style={{
            background: 'rgba(8, 10, 15, 0.7)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid var(--border-whisper)',
            borderRadius: '16px',
            padding: '24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: 1.7,
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Code2 size={15} color="var(--cyan)" />
              <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>CONTRACTS/ESCROW.COMPACT</span>
            </div>
            <span
              style={{
                color: 'var(--text-faint)',
                fontSize: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              COMPACT V0.23
            </span>
          </div>
          <pre style={{ overflowX: 'auto' }}>
            <code>{`// Compact Smart Contract Circuit
pragma language_version >= 0.16.0;

export ledger buyer_commitment: Bytes<32>;
export ledger seller_commitment: Bytes<32>;
export ledger amount_commitment: Bytes<32>;
export ledger condition_commitment: Bytes<32>;
export ledger escrow_state: Uint<8>;

export circuit deposit(witness b_secret: Bytes<32>): Void {
  assert escrow_state == 0;
  assert pedersen_hash(b_secret) == buyer_commitment;
  escrow_state = 1; // Funded
}

export circuit confirm_delivery(
  witness s_secret: Bytes<32>, 
  witness condition: Bytes<32>
): Void {
  assert escrow_state == 1;
  assert pedersen_hash(condition) == condition_commitment;
  escrow_state = 2; // Delivered
}

export circuit release_funds(witness b_secret: Bytes<32>): Void {
  assert escrow_state == 2;
  assert pedersen_hash(b_secret) == buyer_commitment;
  escrow_state = 3; // Terminal Settlement
}

export circuit dispute(): Void {
  assert escrow_state == 1 || escrow_state == 2;
  escrow_state = 4; // Disputed
}

export circuit resolve(): Void {
  assert escrow_state == 4;
  escrow_state = 5; // Resolved
}`}</code>
          </pre>
        </SpotlightCard>
      </div>
    </motion.section>
  );
};
