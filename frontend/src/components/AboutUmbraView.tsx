import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, Key, ChevronDown, CheckCircle2, Cpu, ExternalLink } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

export const AboutUmbraView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What makes Umbra different from standard blockchain escrows?',
      a: "Unlike Ethereum or EVM escrows where transaction amounts, sender/receiver addresses, and token values are publicly viewable on Etherscan, Umbra utilizes Midnight's Compact zkSNARKs to keep balances, milestones, and parties completely shielded.",
    },
    {
      q: 'What happens to my private witness data?',
      a: 'Private witness data never leaves your browser as plaintext. The amount and condition strings are committed as uninvertible Pedersen hashes. Your identity is a private witness statement validated in zero-knowledge.',
    },
    {
      q: 'What tokens are used for transactions on Preprod?',
      a: 'Umbra currently runs on Midnight Preprod using tDUST (testnet DUST). It carries no monetary value and is obtained via the Midnight Preprod faucet to test contract deployment and proof execution.',
    },
    {
      q: 'How is arbitration handled in a private contract?',
      a: 'If an escrow is challenged, it enters the Disputed state. The designated resolution circuit executes to resolve the escrow according to mathematical rules encoded into the Compact contract.',
    },
  ];

  return (
    <motion.section
      key="about"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
    >
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--cyan)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          Protocol Architecture &amp; Cryptographic Specification
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5.2vw, 3.8rem)', fontWeight: 700, margin: '8px 0 14px' }}>
          Trust Without Exposure.
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--text-sub)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.7 }}>
          An architectural breakdown of Umbra's zero-knowledge state machine, shielded witnesses, on-chain commitments, and execution pipeline on the Midnight Network.
        </p>
      </div>

      {/* Section 1: Problem vs Solution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <SpotlightCard className="custom-spotlight-card fluid-glass-panel" spotlightColor="rgba(251, 113, 133, 0.18)">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
            <Lock size={18} color="var(--crimson)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--crimson)' }}>
              The Custodial Escrow Paradox
            </h3>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: 1.7 }}>
            Legacy escrows mandate trusted third parties—banks, escrow attorneys, or brokers—who inspect and hold every parameter: counterparty identities, milestone terms, and capital volume. This creates single points of failure, surveillance, and censorship risk.
          </p>
        </SpotlightCard>

        <SpotlightCard className="custom-spotlight-card fluid-glass-panel" spotlightColor="rgba(0, 229, 255, 0.2)">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
            <Shield size={18} color="var(--cyan)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--cyan)' }}>
              The Autonomous ZK Enclave
            </h3>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: 1.7 }}>
            Umbra substitutes intermediaries with Compact zkSNARK circuits on Midnight. Contract terms are verified on-chain via mathematical validity proofs, while commercial parameters remain private off-chain witnesses known only to authorized parties.
          </p>
        </SpotlightCard>
      </div>

      {/* Section 2: Observability Matrix */}
      <SpotlightCard className="custom-spotlight-card fluid-glass-panel" spotlightColor="rgba(0, 229, 255, 0.16)" style={{ marginBottom: '40px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Cryptographic Observability &amp; Ledger Guarantees</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan)', background: 'rgba(0, 240, 255, 0.08)', padding: '3px 8px', borderRadius: '6px' }}>
            AUDITED SPEC
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-faint)', padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid var(--border-whisper)' }}>
                  Public Ledger Observes (On-Chain)
                </th>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-faint)', padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid var(--border-whisper)' }}>
                  Umbra Keeps Confidential (Shielded Enclave)
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { on: '● Contract instance deployed on Midnight', off: '✓ Escrow capital integer (committed via Pedersen hash)' },
                { on: '● State Machine Node (Created, Funded, Delivered, Released)', off: '✓ Milestone delivery description & SLA specs (SHA-256 witness)' },
                { on: '● Transaction block height & timestamp receipts', off: '✓ Buyer shielded public key (enclave witness verification)' },
                { on: '● zkSNARK mathematical proof validity', off: '✓ Seller payout address & wallet balance' },
                { on: '● Transition invocation count', off: '✓ Dispute cause & counterparty communications' },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--gold)' }}>{row.on}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{row.off}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      {/* Section 3: FAQ Accordion */}
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600 }}>
            Protocol Verification FAQ
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="fluid-glass-panel"
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  padding: 0,
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '18px 22px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'var(--text-hero)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>{faq.q}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '16px',
                      color: 'var(--cyan)',
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 22px 18px',
                      fontSize: '13px',
                      color: 'var(--text-sub)',
                      lineHeight: 1.7,
                      borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                      paddingTop: '12px',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};
