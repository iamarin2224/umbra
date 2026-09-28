import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers,
  FileCode2,
  Wallet,
  Database,
  KeyRound,
  Scale,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Zap,
  Globe,
  CornerDownRight,
  Terminal,
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { soundFx } from '../lib/AudioEngine';

interface AboutUmbraViewProps {
  onLaunchApp?: () => void;
}

export const AboutUmbraView: React.FC<AboutUmbraViewProps> = ({ onLaunchApp }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    soundFx.playTick();
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: 'Do I need tDUST tokens to execute Umbra escrows?',
      a: 'Yes. Umbra operates on the Midnight Preprod testnet using tDUST. Transaction fees and escrow contract deployments utilize tDUST for gas and computational proof validation. You can obtain tDUST through the official Midnight testnet faucet.',
    },
    {
      q: 'Does anyone ever see the locked amount or milestone text?',
      a: 'No. Umbra converts transaction amounts, condition deliverables, and participant identities into domain-separated persistentHash commitments. Only authorized parties with the matching local private witnesses can construct valid zkSNARK proofs to progress the state.',
    },
    {
      q: 'What wallets are supported by the Umbra protocol?',
      a: 'Umbra natively supports Midnight Lace Wallet configured for the Preprod testnet. Your Lace wallet manages your private keys locally and generates shielded addresses (mn_shielded_...) without exposing master keys.',
    },
    {
      q: 'How does off-chain witness generation work in the browser?',
      a: "When you execute a circuit like deposit or confirmDelivery, the client-side Halo2 prover synthesizes a zero-knowledge proof in your browser session. The raw witness data (secret salts, condition strings) never leaves your browser; only the resulting cryptographic proof is submitted to Midnight.",
    },
    {
      q: 'How are disputes arbitrated without leaking contract terms?',
      a: 'If a deal is contested, either party can trigger the dispute circuit. Umbra allows an agreed-upon arbiter to execute the resolve circuit using cryptographic authentication. The state resolves strictly under smart contract validation rules without public ledger exposure.',
    },
    {
      q: 'Can an escrow be cancelled if the buyer changes their mind?',
      a: 'An escrow can be safely cancelled by the buyer while it remains in the Created state before funds are locked. Once the buyer executes deposit, the agreement is cryptographically secured on-chain and proceeds through delivery or dispute resolution.',
    },
    {
      q: 'Is Umbra ready for Midnight Mainnet rollout?',
      a: 'Yes. All Compact (v0.23) contracts and Halo2 circuits are written to the official Midnight specification. Umbra is architected for immediate migration to Midnight Mainnet upon its production launch.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 64, paddingBottom: 60 }}>
      {/* ========================================================
          SECTION 1 — Editorial Guides Hero
      ======================================================== */}
      <section style={{ textAlign: 'center', paddingTop: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Category Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 14px',
              borderRadius: 9999,
              background: 'rgba(0, 240, 255, 0.06)',
              border: '1px solid rgba(0, 240, 255, 0.22)',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--cyan)',
                boxShadow: '0 0 8px var(--cyan)',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.16em',
                color: 'var(--cyan)',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Midnight Network • Zero-Knowledge Architecture
            </span>
          </div>

          {/* Majestic Hero Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              fontSize: 'clamp(36px, 5.5vw, 68px)',
              fontWeight: 800,
              color: 'var(--text-hero)',
              lineHeight: 1.08,
              letterSpacing: '-0.025em',
              maxWidth: 920,
              margin: '0 auto 20px',
            }}
          >
            Cryptographic settlement on private state.
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.08em',
              color: 'var(--text-sub)',
              maxWidth: 680,
              margin: '0 auto 32px',
              lineHeight: 1.8,
              textTransform: 'uppercase',
            }}
          >
            Complete technical specification of Umbra&apos;s zero-knowledge state machine,
            persistent commitments, and client-side Halo2 proving enclaves.
          </p>

          {/* Actions */}
          {onLaunchApp && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
              <button
                onClick={() => {
                  soundFx.playOpen();
                  onLaunchApp();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 28px',
                  borderRadius: 9999,
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  color: 'var(--cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>LAUNCH LIVE ENCLAVE</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 2 — How It Works (4 Steps - Inspired by Image 0)
      ======================================================== */}
      <section>
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: 'var(--text-hero)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            How it works
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-sub)',
              marginTop: 6,
              letterSpacing: '0.04em',
            }}
          >
            Four simple steps to cryptographic settlement.
          </p>
        </div>

        {/* 2x2 Grid Matching Image 0 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 20,
          }}
        >
          {[
            {
              step: '01',
              title: 'Connect Your Wallet',
              icon: <Wallet size={16} color="var(--cyan)" />,
              desc: 'Link your Midnight Lace wallet to establish your shielded cryptographic identity (mn_shielded_...) and authorize client witness generation.',
            },
            {
              step: '02',
              title: 'Initialize Enclave',
              icon: <Lock size={16} color="var(--gold)" />,
              desc: 'Configure counterparty address, locked tDUST volume, and milestone terms. Umbra computes off-chain persistentHash commitments before broadcast.',
            },
            {
              step: '03',
              title: 'Shielded Lock & Milestone',
              icon: <FileCheck size={16} color="var(--amethyst)" />,
              desc: 'Buyer commits capital via the deposit circuit. The seller completes off-chain deliverables and proves condition fulfillment in zero knowledge.',
            },
            {
              step: '04',
              title: 'Autonomous Settlement',
              icon: <CheckCircle2 size={16} color="var(--emerald)" />,
              desc: 'Execution of the release circuit distributes shielded tokens to the seller with mathematical finality and zero public ledger metadata leakage.',
            },
          ].map((item) => (
            <SpotlightCard
              key={item.step}
              spotlightColor="rgba(0, 240, 255, 0.12)"
              anchorColor="rgba(0, 240, 255, 0.25)"
              style={{
                padding: '24px 26px',
                borderRadius: 16,
              }}
            >
              {/* Header: Step Number + Icon + Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-faint)',
                    letterSpacing: '0.12em',
                  }}
                >
                  {item.step}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.icon}
                  <h3
                    style={{
                      fontFamily: 'var(--font-editorial)',
                      fontStyle: 'italic',
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--text-hero)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text-sub)',
                  lineHeight: 1.75,
                  letterSpacing: '0.02em',
                }}
              >
                {item.desc}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 3 — Smart Contract & ZK Circuits (Inspired by Image 1 Top)
      ======================================================== */}
      <section>
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: 'var(--text-hero)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Smart contract
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-sub)',
              marginTop: 6,
              letterSpacing: '0.04em',
            }}
          >
            On-chain functions and Compact ZK circuits powering the settlement engine.
          </p>
        </div>

        {/* 6-Card Bento Grid Matching Image 1 Top */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 16,
          }}
        >
          {[
            {
              circuit: 'create_escrow',
              icon: <FileCode2 size={15} color="var(--cyan)" />,
              desc: 'Initializes contract instance on Midnight with persistentHash commitments for locked amount, condition salt, and counterparties.',
            },
            {
              circuit: 'deposit',
              icon: <Lock size={15} color="var(--gold)" />,
              desc: 'Buyer submits private witness verifying secret key and escrow creation state, locking tDUST securely into the contract enclave.',
            },
            {
              circuit: 'confirm_delivery',
              icon: <CheckCircle2 size={15} color="var(--amethyst)" />,
              desc: 'Seller proves fulfillment of milestone deliverables via off-chain witness hash without exposing plaintext contract terms.',
            },
            {
              circuit: 'release',
              icon: <Zap size={15} color="var(--emerald)" />,
              desc: 'Validates buyer authorization witness and executes shielded token transfer to the seller, completing autonomous settlement.',
            },
            {
              circuit: 'dispute',
              icon: <AlertTriangle size={15} color="var(--crimson)" />,
              desc: 'Locks the agreement into a Disputed state when terms are contested, freezing funds until cryptographic arbitration executes.',
            },
            {
              circuit: 'resolve',
              icon: <Scale size={15} color="var(--cyan)" />,
              desc: 'Permits designated arbiters to submit cryptographic credentials to settle or refund contested funds per protocol rules.',
            },
          ].map((item) => (
            <SpotlightCard
              key={item.circuit}
              spotlightColor="rgba(0, 240, 255, 0.1)"
              anchorColor="rgba(0, 240, 255, 0.2)"
              style={{
                padding: '20px 22px',
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                {item.icon}
                <code
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-hero)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {item.circuit}
                </code>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-sub)',
                  lineHeight: 1.7,
                }}
              >
                {item.desc}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 4 — Security by Design (Inspired by Image 1 Bottom)
      ======================================================== */}
      <section>
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: 'var(--text-hero)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Security by design
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-sub)',
              marginTop: 6,
              letterSpacing: '0.04em',
            }}
          >
            Every layer is hardened against surveillance and unauthorized state manipulation.
          </p>
        </div>

        {/* 2x2 Grid Matching Image 1 Bottom */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 20,
          }}
        >
          {[
            {
              title: 'Zero-Knowledge Commitments',
              icon: <Lock size={16} color="var(--cyan)" />,
              desc: 'Financial amounts, commercial terms, and wallet identifiers are encoded as cryptographic persistentHash commitments. Zero plaintext data is written to the ledger.',
            },
            {
              title: 'Off-Chain Witness Isolation',
              icon: <ShieldCheck size={16} color="var(--gold)" />,
              desc: 'Counterparty private keys and milestone deliverable text remain strictly inside the local client session, shielded from node operators and validators.',
            },
            {
              title: 'Halo2 SNARK Verification',
              icon: <Globe size={16} color="var(--amethyst)" />,
              desc: 'State transitions are authenticated on-chain by verifying mathematical zkSNARK proofs. Validators verify correctness without learning secret inputs.',
            },
            {
              title: 'Autonomous Settlement',
              icon: <Zap size={16} color="var(--emerald)" />,
              desc: 'Funds lock directly inside the Compact smart contract state machine. Transfers occur programmatically upon proof satisfaction with zero middleman risk.',
            },
          ].map((item) => (
            <SpotlightCard
              key={item.title}
              spotlightColor="rgba(0, 240, 255, 0.12)"
              anchorColor="rgba(0, 240, 255, 0.25)"
              style={{
                padding: '24px 26px',
                borderRadius: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {item.icon}
                <h3
                  style={{
                    fontFamily: 'var(--font-editorial)',
                    fontStyle: 'italic',
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--text-hero)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.title}
                </h3>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text-sub)',
                  lineHeight: 1.75,
                  letterSpacing: '0.02em',
                }}
              >
                {item.desc}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 5 — Key Guarantees: Ledger Observability Comparison
      ======================================================== */}
      <section>
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              fontSize: 'clamp(26px, 3.5vw, 36px)',
              fontWeight: 800,
              color: 'var(--text-hero)',
              letterSpacing: '-0.02em',
            }}
          >
            Observability comparison
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-sub)',
              marginTop: 6,
              letterSpacing: '0.04em',
            }}
          >
            What validator nodes observe versus what remains shielded in zero-knowledge.
          </p>
        </div>

        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.12)"
          anchorColor="rgba(0, 240, 255, 0.25)"
          style={{
            padding: 24,
            borderRadius: 16,
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: 20,
              paddingBottom: 14,
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                color: '#fbbf24',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              <Eye size={14} />
              <span>Visible On Public Ledger</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                color: '#10b981',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              <EyeOff size={14} />
              <span>Shielded In Client Witness</span>
            </div>
          </div>

          {/* Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                visible: 'Escrow contract address & on-chain deployment',
                shielded: 'Exact locked amount (hidden via persistentHash)',
              },
              {
                visible: 'Current lifecycle state (Created, Funded, Delivered...)',
                shielded: 'Plaintext milestone specifications & delivery terms',
              },
              {
                visible: 'Transaction hashes, block height, and timestamps',
                shielded: "Buyer's master cryptographic wallet identity",
              },
              {
                visible: 'Valid Halo2 zkSNARK proof verification receipt',
                shielded: "Seller's master cryptographic wallet identity",
              },
              {
                visible: 'Deposit and delivery counter increments',
                shielded: 'Commercial dispute evidence & witness salts',
              },
            ].map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                  gap: 20,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-sub)' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fbbf24', flexShrink: 0 }} />
                  <span>{row.visible}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a7f3d0' }}>
                  <ShieldCheck size={14} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>{row.shielded}</span>
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </section>

      {/* ========================================================
          SECTION 6 — Frequently Asked Questions (Inspired by Image 2)
      ======================================================== */}
      <section>
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: 'var(--text-hero)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Frequently asked
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-sub)',
              marginTop: 6,
              letterSpacing: '0.04em',
            }}
          >
            Core questions about privacy boundaries, network tokens, and dispute handling.
          </p>
        </div>

        {/* Capsule Accordion List Matching Image 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  borderRadius: isOpen ? 16 : 9999,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  borderColor: isOpen ? 'rgba(0, 240, 255, 0.3)' : 'var(--border-whisper)',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-hero)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-editorial)',
                      fontStyle: 'italic',
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {faq.q}
                  </span>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: isOpen ? 'var(--cyan)' : 'var(--text-faint)', flexShrink: 0 }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div
                        style={{
                          padding: '0 24px 20px 24px',
                          fontSize: 12,
                          lineHeight: 1.75,
                          color: 'var(--text-sub)',
                          fontFamily: 'var(--font-mono)',
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          paddingTop: 14,
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
      </section>
    </div>
  );
};

export default AboutUmbraView;
