import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, ChevronDown, CheckCircle2, ArrowRight } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

export const AboutUmbraView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Umbra achieve zero-knowledge privacy on Midnight?',
      a: "Umbra leverages Midnight's Compact language and Halo2 zkSNARK circuits. All financial parameters (balances, milestones, seller addresses) are converted into domain-separated persistentHash commitments. Zero plaintext data is written to the ledger.",
    },
    {
      q: 'What happens to private witness data in the browser?',
      a: 'Witness values (e.g. buyer private key, milestone description text) remain entirely inside the client session. The local proof generator synthesizes a zk-proof verifying the statement without revealing the underlying secrets.',
    },
    {
      q: 'Which network and currency does Umbra operate on?',
      a: 'Umbra is deployed on the Midnight Preprod network utilizing tDUST testnet tokens. It executes state transitions autonomously through Compact smart contracts.',
    },
    {
      q: 'How are disputed agreements arbitrated?',
      a: 'If a buyer or seller initiates a dispute, the contract enters the Disputed state. An arbiter can then execute the resolve() circuit with valid cryptographic credentials to settle the escrow according to predetermined rules.',
    },
  ];

  return (
    <motion.section
      key="about"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>
          Protocol Architecture & Cryptographic Specification
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px' }}>
          Technical overview of Umbra's zero-knowledge state machine, shielded witnesses, and ledger privacy boundaries.
        </p>
      </div>

      {/* 2-Column Architectural Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <SpotlightCard
          spotlightColor="rgba(251, 113, 133, 0.1)"
          style={{
            background: 'rgba(13, 16, 23, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-whisper)',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '10px' }}>
            <Lock size={15} color="var(--crimson)" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--crimson)' }}>
              Traditional Public Escrows
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-sub)', lineHeight: 1.6 }}>
            Public smart contracts on Ethereum or EVM expose counterparty wallet addresses, exact transaction amounts, and delivery descriptions on open block explorers, allowing competitor surveillance and front-running.
          </p>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.12)"
          style={{
            background: 'rgba(13, 16, 23, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-whisper)',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '10px' }}>
            <Shield size={15} color="var(--cyan)" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cyan)' }}>
              Umbra Shielded Enclave
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-sub)', lineHeight: 1.6 }}>
            Umbra proves valid execution mathematically via Compact zkSNARKs without revealing contract balances, participants, or settlement conditions to the public ledger.
          </p>
        </SpotlightCard>
      </div>

      {/* Observability Matrix Table */}
      <SpotlightCard
        spotlightColor="rgba(0, 240, 255, 0.08)"
        style={{
          background: 'rgba(13, 16, 23, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-whisper)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Observability Matrix</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan)', background: 'rgba(0, 240, 255, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>
            Compact V0.23
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-whisper)' }}>
                  Observed On-Chain (Midnight Ledger)
                </th>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-whisper)' }}>
                  Confidential Off-Chain (Shielded Witness)
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { on: 'State Machine Node (Created, Funded, Delivered, Released)', off: 'Escrow volume / balance integer' },
                { on: 'Transaction timestamps & proof verification receipts', off: 'Milestone delivery specification text' },
                { on: '32-byte persistentHash commitments', off: 'Buyer & Seller private key identifiers' },
                { on: 'State transition validity proofs', off: 'Dispute rationale & resolution details' },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
                    ● {row.on}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
                    ✓ {row.off}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      {/* FAQ Accordion */}
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>
          Frequently Asked Questions
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(13, 16, 23, 0.6)',
                  border: '1px solid var(--border-whisper)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#ffffff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={14}
                    color="var(--text-sub)"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 18px 14px',
                      fontSize: '12px',
                      color: 'var(--text-sub)',
                      lineHeight: 1.6,
                      borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                      paddingTop: '10px',
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
