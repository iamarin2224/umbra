import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, ChevronDown, CheckCircle2, ArrowRight, Sparkles, Key, Cpu, EyeOff } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { CornerAnchors } from './CornerAnchors';
import { soundFx } from '../lib/AudioEngine';

export const AboutUmbraView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Umbra achieve zero-knowledge privacy on Midnight?',
      a: "Umbra leverages Midnight's Compact smart contract language and Halo2 zkSNARK circuits. All financial parameters (balances, milestones, seller addresses) are converted into domain-separated persistentHash commitments. Zero plaintext financial data is ever written to the public ledger.",
    },
    {
      q: 'What happens to private witness data in the browser?',
      a: 'Witness values (such as buyer private keys, milestone text deliverables, and arbitrary condition parameters) remain strictly inside the client session enclave. The local proof generator synthesizes a zk-proof verifying the statement without leaking secrets.',
    },
    {
      q: 'Which network and currency does Umbra operate on?',
      a: 'Umbra is deployed on the Midnight Preprod network utilizing tDUST testnet tokens. It executes state transitions autonomously through Compact smart contracts.',
    },
    {
      q: 'How are disputed agreements arbitrated?',
      a: 'If a buyer or seller initiates a dispute, the contract enters the Disputed state. An authorized arbiter can then execute the resolve() circuit with valid cryptographic credentials to settle the escrow according to predetermined rules.',
    },
  ];

  return (
    <motion.section
      key="about"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
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
          Protocol Architecture & Cryptographic Specification
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px' }}>
          Technical overview of Umbra&apos;s zero-knowledge state machine, shielded witnesses, and ledger privacy boundaries.
        </p>
      </div>

      {/* 2-Column Bento Architectural Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {/* Legacy Escrows */}
        <SpotlightCard
          spotlightColor="rgba(251, 113, 133, 0.12)"
          anchorColor="rgba(251, 113, 133, 0.25)"
          style={{
            padding: '22px',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(251, 113, 133, 0.1)',
                border: '1px solid rgba(251, 113, 133, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={16} color="var(--crimson)" />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-hero)' }}>
              Traditional Public Escrows
            </h3>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--text-sub)' }}>
            {[
              'Buyer and seller wallet addresses are exposed to everyone on-chain',
              'Exact transaction volume and asset values are publicly visible',
              'Business milestone agreements and sensitive contracts leaked in plaintext',
              'Front-running bots and surveillance scanners monitor contract state',
            ].map((item, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--crimson)', fontWeight: 'bold' }}>✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SpotlightCard>

        {/* Umbra Shielded Enclaves */}
        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.14)"
          anchorColor="rgba(0, 240, 255, 0.3)"
          style={{
            padding: '22px',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={16} color="var(--cyan)" />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-hero)' }}>
              Umbra Shielded Enclaves (Midnight ZK)
            </h3>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--text-sub)' }}>
            {[
              'PersistentHash cryptographic commitments mask counterparties',
              'Shielded values verified through off-chain client witnesses without balance leaks',
              'Milestone specifications verified via Halo2 SNARK proofs in browser',
              'State transitions execute autonomously with mathematical settlement integrity',
            ].map((item, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={14} color="var(--cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SpotlightCard>
      </div>

      {/* Interactive FAQs */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-editorial)',
            fontStyle: 'italic',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-hero)',
            marginBottom: '14px',
          }}
        >
          Frequently Asked Questions
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="hairline-card"
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => {
                    soundFx.playTick();
                    setOpenFaq(isOpen ? null : index);
                  }}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-hero)',
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-body)' }}>{faq.q}</span>
                  <ChevronDown
                    size={15}
                    color="var(--cyan)"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.25s ease',
                      flexShrink: 0,
                      marginLeft: 12,
                    }}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        style={{
                          padding: '0 20px 16px',
                          fontSize: '12px',
                          color: 'var(--text-sub)',
                          lineHeight: 1.6,
                          borderTop: '1px solid var(--border-whisper)',
                          paddingTop: '12px',
                        }}
                      >
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};
