import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Code2, Terminal, Cpu, Sparkles, Hash } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { CornerAnchors } from './CornerAnchors';
import { soundFx } from '../lib/AudioEngine';

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

export circuit confirmDelivery(witnessConditionHash: Bytes<32>): [] {
  const seller = sellerSecret();
  assert(conditionCommitment == witnessConditionHash, "Invalid condition proof");
  assert(escrowState == EscrowState.STATE_FUNDED, "Must be funded");
  escrowState = EscrowState.STATE_DELIVERED;
}

export circuit release(): [] {
  assert(escrowState == EscrowState.STATE_DELIVERED, "Not delivered");
  escrowState = EscrowState.STATE_RELEASED;
}`;

  const handleCopy = (text: string, field: string) => {
    soundFx.playTick();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <motion.section
      key="explorer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Header */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-editorial)',
            fontStyle: 'italic',
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--text-hero)',
            letterSpacing: '-0.02em',
          }}
        >
          Circuit Lab & Compact Smart Contract Explorer
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px' }}>
          Inspect the zero-knowledge escrow circuits compiled for Midnight Network and test off-chain witness commitment hashing.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {/* Compact Code Sandbox */}
        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.12)"
          anchorColor="rgba(0, 240, 255, 0.3)"
          style={{
            padding: '22px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code2 size={16} color="var(--cyan)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-hero)', fontFamily: 'var(--font-mono)' }}>
                EscrowEnclave.compact
              </span>
            </div>
            <button
              onClick={() => handleCopy(compactCode, 'code')}
              style={{
                background: 'transparent',
                border: 'none',
                color: copiedField === 'code' ? 'var(--emerald)' : 'var(--cyan)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {copiedField === 'code' ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedField === 'code' ? 'Copied' : 'Copy Source'}</span>
            </button>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-whisper)',
              borderRadius: '10px',
              padding: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#d1d5db',
              overflowX: 'auto',
              maxHeight: '380px',
              lineHeight: 1.6,
            }}
          >
            <pre>{compactCode}</pre>
          </div>
        </SpotlightCard>

        {/* Live Witness & Commitment Generator */}
        <SpotlightCard
          spotlightColor="rgba(192, 132, 252, 0.12)"
          anchorColor="rgba(192, 132, 252, 0.3)"
          style={{
            padding: '22px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={16} color="var(--amethyst)" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-hero)' }}>
              Live Witness Commitment Calculator
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-sub)', lineHeight: 1.5 }}>
            Witness data stays strictly in client memory. Only the evaluated <code style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>persistentHash</code> commitment is submitted to the ledger.
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Condition Witness (Plaintext Secret)
            </label>
            <input
              type="text"
              value={condWitness}
              onChange={(e) => setCondWitness(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-whisper)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            />
          </div>

          <div
            className="hairline-card"
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Condition persistentHash Commitment
              </span>
              <button
                onClick={() => handleCopy(condCommitment, 'condCommit')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedField === 'condCommit' ? 'var(--emerald)' : 'var(--cyan)',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                {copiedField === 'condCommit' ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedField === 'condCommit' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)', wordBreak: 'break-all' }}>
              {condCommitment}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Amount Value (tDUST)
            </label>
            <input
              type="number"
              value={amtWitness}
              onChange={(e) => setAmtWitness(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-whisper)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            />
          </div>

          <div
            className="hairline-card"
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Amount persistentHash Commitment
              </span>
              <button
                onClick={() => handleCopy(amtCommitment, 'amtCommit')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedField === 'amtCommit' ? 'var(--emerald)' : 'var(--amethyst)',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                {copiedField === 'amtCommit' ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedField === 'amtCommit' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--amethyst)', wordBreak: 'break-all' }}>
              {amtCommitment}
            </div>
          </div>
        </SpotlightCard>
      </div>
    </motion.section>
  );
};
