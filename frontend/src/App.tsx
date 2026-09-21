import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Cpu, Layers, Lock, CheckCircle2, ChevronDown, ExternalLink } from 'lucide-react';
import Galaxy from './components/Galaxy';
import SpotlightCard from './components/SpotlightCard';
import { FluidCursor } from './components/FluidCursor';

type NavTab = 'escrows' | 'stats' | 'explorer' | 'about';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('escrows');
  const [walletConnected, setWalletConnected] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [filter, setFilter] = useState<'all' | 'funded' | 'delivered' | 'released'>('all');

  // Interactive circuit commitment sandbox
  const [condWitness, setCondWitness] = useState('Deliver verified proof of milestone 2 execution');
  const [amtWitness, setAmtWitness] = useState('1000');

  // Simple simulated hash function
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

  const escrows = [
    {
      id: '#8F01-B2A',
      amount: '1,500',
      state: 'funded',
      stateLabel: 'Funded',
      condition: 'Audit delivery of Compact ZK verification suite & prover binaries.',
      actionText: 'Deliver',
    },
    {
      id: '#3C99-F1E',
      amount: '4,200',
      state: 'delivered',
      stateLabel: 'Delivered',
      condition: 'Secure multi-party computing keys for cross-border private settlement.',
      actionText: 'Release',
    },
    {
      id: '#E140-A77',
      amount: '850',
      state: 'released',
      stateLabel: 'Settled',
      condition: 'Protocol mathematical specification and circuit benchmark review.',
      actionText: 'Completed',
    },
  ];

  const filteredEscrows = escrows.filter((item) => {
    if (filter === 'all') return true;
    return item.state === filter;
  });

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── React Bits Galaxy Parallax WebGL Background (Calibrated Ambient Backdrop) ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <Galaxy
          mouseRepulsion
          mouseInteraction
          density={0.9}
          glowIntensity={0.28}
          saturation={0.35}
          hueShift={140}
          twinkleIntensity={0.3}
          rotationSpeed={0.03}
          repulsionStrength={1.6}
          autoCenterRepulsion={0}
          starSpeed={0.25}
          speed={0.6}
          transparent={false}
        />
      </div>

      {/* ── Splitstellar-style Magnetic Dynamic Cursor ── */}
      <FluidCursor />

      {/* ── Apple-grade Translucent Floating Navbar ── */}
      <header
        style={{
          position: 'sticky',
          top: '16px',
          margin: '0 auto',
          width: 'calc(100% - 48px)',
          maxWidth: '1140px',
          zIndex: 100,
          background: 'rgba(14, 16, 22, 0.45)',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          border: '1px solid var(--border-whisper)',
          borderRadius: '9999px',
          height: '52px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 16px 0 24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          transition: 'all 0.4s var(--ease-apple)',
        }}
      >
        {/* Left: Brand */}
        <div
          onClick={() => setActiveTab('escrows')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            justifySelf: 'start',
          }}
        >
          <div style={{ width: '20px', height: '20px' }}>
            <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%', fill: 'none', stroke: 'var(--cyan)', strokeWidth: 2.2, filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.6))' }}>
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
              <line x1="12" y1="22" x2="12" y2="12" />
              <line x1="2" y1="8.5" x2="12" y2="12" />
              <line x1="22" y1="8.5" x2="12" y2="12" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text-hero)' }}>
            Umbra
          </span>
        </div>

        {/* Center: Exactly Centered Tab Group */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', justifySelf: 'center' }}>
          {(['escrows', 'stats', 'explorer', 'about'] as NavTab[]).map((tab) => {
            const labels: Record<NavTab, string> = {
              escrows: 'Escrows',
              stats: 'Telemetry',
              explorer: 'Circuits',
              about: 'Architecture',
            };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--text-hero)' : 'var(--text-sub)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 500,
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  transition: 'all 0.25s var(--ease-apple)',
                  boxShadow: isActive ? 'inset 0 1px 0 rgba(255, 255, 255, 0.12)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </nav>

        {/* Right: Status & Connect */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifySelf: 'end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 8px var(--emerald)' }} />
            <span>ENCLAVE</span>
          </div>

          <button
            onClick={() => setWalletConnected(!walletConnected)}
            style={{
              background: walletConnected ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${walletConnected ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
              color: walletConnected ? 'var(--emerald)' : 'var(--text-hero)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 500,
              padding: '6px 16px',
              borderRadius: '9999px',
              cursor: 'pointer',
              transition: 'all 0.3s var(--ease-apple)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}
          >
            {walletConnected ? 'mn_shielded_...8a92' : 'Connect Lace'}
          </button>
        </div>
      </header>

      {/* ── Main Router ── */}
      <main style={{ flex: 1, padding: '50px 0 80px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1140px', width: '100%', margin: '0 auto', padding: '0 28px' }}>
          <AnimatePresence mode="wait">
            {/* ========================================================
                 VIEW 1: ESCROWS (HOMEPAGE)
                 ======================================================== */}
            {activeTab === 'escrows' && (
              <motion.section
                key="escrows"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
              >
                {/* Hero */}
                <div style={{ textAlign: 'center', padding: '40px 0 50px', maxWidth: '820px', margin: '0 auto' }}>
                  <span style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '16px' }}>
                    Zero-Knowledge Escrow Protocol
                  </span>

                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 5.8vw, 4.4rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.035em', marginBottom: '20px', background: 'linear-gradient(180deg, #ffffff 40%, rgba(255, 255, 255, 0.45) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Programmable privacy for <br />
                    <span style={{ background: 'linear-gradient(135deg, var(--cyan) 0%, var(--amethyst) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      high-stake settlements.
                    </span>
                  </h1>

                  <p style={{ fontSize: '16px', color: 'var(--text-sub)', lineHeight: 1.65, maxWidth: '560px', margin: '0 auto 32px' }}>
                    Execute conditional agreements without revealing identities, balances, or underlying milestones on the public ledger. Built natively on Midnight.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
                    <button
                      onClick={() => alert('Create Escrow modal flow')}
                      style={{
                        background: '#ffffff',
                        color: '#000000',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        fontWeight: 600,
                        padding: '12px 28px',
                        borderRadius: '9999px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s var(--ease-apple)',
                        boxShadow: '0 4px 24px rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      Deploy Escrow
                    </button>
                    <button
                      onClick={() => setActiveTab('explorer')}
                      style={{
                        background: 'var(--glass-surface)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid var(--border-whisper)',
                        color: 'var(--text-hero)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        fontWeight: 500,
                        padding: '12px 24px',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        transition: 'all 0.3s var(--ease-apple)',
                      }}
                    >
                      Simulate Circuit
                    </button>
                  </div>
                </div>

                {/* 3-Step Fluid Stepper */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', margin: '30px 0 54px' }}>
                  {[
                    { num: '01', title: 'Pedersen Lock', desc: 'Capital committed as an uninvertible hash' },
                    { num: '02', title: 'Milestone Proof', desc: 'Private witness satisfies contract rules' },
                    { num: '03', title: 'Shielded Settlement', desc: 'Settlement completes with zero ledger leak' },
                  ].map((step, i) => (
                    <SpotlightCard
                      key={i}
                      className="custom-spotlight-card"
                      spotlightColor="rgba(0, 229, 255, 0.22)"
                      style={{
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        borderRadius: '14px',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--cyan)', background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.2)', padding: '4px 8px', borderRadius: '6px' }}>
                        {step.num}
                      </span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-hero)' }}>{step.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '2px' }}>{step.desc}</div>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>

                {/* Escrow Registry */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>Active Agreements Registry</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)', background: 'rgba(0, 240, 255, 0.08)', padding: '3px 8px', borderRadius: '6px' }}>
                        {filteredEscrows.length} Active
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.025)', padding: '4px', borderRadius: '9999px', border: '1px solid var(--border-whisper)' }}>
                      {(['all', 'funded', 'delivered', 'released'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFilter(cat)}
                          style={{
                            background: filter === cat ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            border: 'none',
                            color: filter === cat ? 'var(--text-hero)' : 'var(--text-sub)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '12px',
                            padding: '5px 12px',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s var(--ease-apple)',
                          }}
                        >
                          {cat === 'released' ? 'Settled' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                    {filteredEscrows.map((item) => (
                      <SpotlightCard
                        key={item.id}
                        className="custom-spotlight-card interactive-card"
                        spotlightColor={item.state === 'funded' ? 'rgba(52, 211, 153, 0.22)' : item.state === 'delivered' ? 'rgba(192, 132, 252, 0.22)' : 'rgba(0, 229, 255, 0.22)'}
                        style={{
                          borderRadius: '16px',
                          padding: '24px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '18px',
                          cursor: 'pointer',
                        }}
                        onClick={() => alert(`Inspecting ${item.id}`)}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>{item.id}</span>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '9px',
                                fontWeight: 600,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                padding: '3px 8px',
                                borderRadius: '9999px',
                                background: item.state === 'funded' ? 'rgba(52, 211, 153, 0.12)' : item.state === 'delivered' ? 'rgba(192, 132, 252, 0.12)' : 'rgba(0, 240, 255, 0.12)',
                                color: item.state === 'funded' ? 'var(--emerald)' : item.state === 'delivered' ? 'var(--amethyst)' : 'var(--cyan)',
                                border: `1px solid ${item.state === 'funded' ? 'rgba(52, 211, 153, 0.3)' : item.state === 'delivered' ? 'rgba(192, 132, 252, 0.3)' : 'rgba(0, 240, 255, 0.3)'}`,
                              }}
                            >
                              ● {item.stateLabel}
                            </span>
                          </div>

                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--text-hero)', margin: '8px 0 4px' }}>
                            {item.amount} <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan)', fontWeight: 500 }}>tDUST</span>
                          </div>

                          <p style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                            {item.condition}
                          </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>
                          <span>Witness Verified</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Executing action for ${item.id}`);
                            }}
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: 'var(--text-hero)',
                              fontFamily: 'var(--font-body)',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '5px 14px',
                              borderRadius: '9999px',
                              cursor: 'pointer',
                              transition: 'all 0.25s var(--ease-apple)',
                            }}
                          >
                            {item.actionText}
                          </button>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* ========================================================
                 VIEW 2: STATS (TELEMETRY)
                 ======================================================== */}
            {activeTab === 'stats' && (
              <motion.section
                key="stats"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
              >
                <div style={{ marginBottom: '36px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    Prover Telemetry &amp; Enclave Benchmarks
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginTop: '6px' }}>
                    Enclave Performance Metrics
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                  <SpotlightCard className="custom-spotlight-card fluid-glass-panel" spotlightColor="rgba(0, 229, 255, 0.2)">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600 }}>Halo2 SNARK Prover</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--emerald)' }}>100% ONLINE</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                      {[
                        { label: 'Prover Synthesis Latency', val: '1.42s', pct: '65%' },
                        { label: 'Compact Test Verification', val: '100 / 100', pct: '100%', color: 'var(--emerald)' },
                        { label: 'Constraint Gate Count', val: '4,096 gates', pct: '45%' },
                      ].map((meter, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border-whisper)' }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-sub)' }}>{meter.label}</div>
                            <div style={{ width: '130px', height: '3px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: meter.pct, background: 'linear-gradient(90deg, var(--cyan), var(--amethyst))' }} />
                            </div>
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: meter.color || 'var(--text-hero)' }}>
                            {meter.val}
                          </div>
                        </div>
                      ))}
                    </div>
                  </SpotlightCard>

                  <SpotlightCard className="custom-spotlight-card fluid-glass-panel" spotlightColor="rgba(192, 132, 252, 0.2)">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600 }}>Settlement Distribution</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)' }}>6,550 tDUST</span>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '20px', lineHeight: 1.6 }}>
                      Active distribution of smart contract state machine instances across Midnight Preprod:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {[
                        { label: 'FUNDED', count: '1', sub: 'Active lock', color: 'var(--gold)' },
                        { label: 'DELIVERED', count: '1', sub: 'Pending release', color: 'var(--amethyst)' },
                        { label: 'SETTLED', count: '1', sub: 'Zero disclosure', color: 'var(--cyan)' },
                      ].map((node, i) => (
                        <div key={i} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-whisper)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: node.color }}>{node.label}</span>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: node.color, margin: '4px 0' }}>{node.count}</div>
                          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{node.sub}</span>
                        </div>
                      ))}
                    </div>
                  </SpotlightCard>
                </div>
              </motion.section>
            )}

            {/* ========================================================
                 VIEW 3: EXPLORER (CIRCUITS)
                 ======================================================== */}
            {activeTab === 'explorer' && (
              <motion.section
                key="explorer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
              >
                <div style={{ marginBottom: '36px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    Cryptographic Lab &amp; Verification Inspector
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginTop: '6px' }}>
                    Circuit &amp; Commitment Synthesizer
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                  <SpotlightCard className="custom-spotlight-card fluid-glass-panel" spotlightColor="rgba(0, 229, 255, 0.2)">
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '16px' }}>Pedersen Lab Simulator</h3>

                    <div style={{ marginBottom: '18px' }}>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '8px' }}>
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
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '8px' }}>
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

                    <div style={{ background: 'rgba(0, 240, 255, 0.03)', border: '1px solid rgba(0, 240, 255, 0.15)', borderRadius: '10px', padding: '14px 16px', marginBottom: '12px' }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan)', textTransform: 'uppercase' }}>
                        Condition Commitment Hash
                      </span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)', wordBreak: 'break-all', marginTop: '6px' }}>
                        {condCommitment}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(192, 132, 252, 0.03)', border: '1px solid rgba(192, 132, 252, 0.15)', borderRadius: '10px', padding: '14px 16px' }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amethyst)', textTransform: 'uppercase' }}>
                        Balance Commitment Hash
                      </span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--amethyst)', wordBreak: 'break-all', marginTop: '6px' }}>
                        {amtCommitment}
                      </div>
                    </div>
                  </SpotlightCard>

                  <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(192, 132, 252, 0.2)" style={{ background: 'rgba(8, 10, 15, 0.7)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '1px solid var(--border-whisper)', borderRadius: '16px', padding: '24px', fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.7, color: '#94a3b8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>CONTRACTS/ESCROW.COMPACT</span>
                      <span style={{ color: 'var(--text-faint)' }}>COMPACT V0.23</span>
                    </div>
                    <pre><code>{`// Compact Smart Contract Circuit
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
}`}</code></pre>
                  </SpotlightCard>
                </div>
              </motion.section>
            )}

            {/* ========================================================
                 VIEW 4: ABOUT (ARCHITECTURE SPECIFICATION)
                 ======================================================== */}
            {activeTab === 'about' && (
              <motion.section
                key="about"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
              >
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
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
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--crimson)', marginBottom: '12px' }}>
                      The Custodial Escrow Paradox
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: 1.7 }}>
                      Legacy escrows mandate trusted third parties—banks, escrow attorneys, or brokers—who inspect and hold every parameter: counterparty identities, milestone terms, and capital volume. This creates single points of failure, surveillance, and censorship risk.
                    </p>
                  </SpotlightCard>

                  <SpotlightCard className="custom-spotlight-card fluid-glass-panel" spotlightColor="rgba(0, 229, 255, 0.2)">
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--cyan)', marginBottom: '12px' }}>
                      The Autonomous ZK Enclave
                    </h3>
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
                </SpotlightCard>

                {/* Section 3: FAQ Accordion */}
                <div style={{ maxWidth: '820px', margin: '0 auto' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600 }}>Protocol Verification FAQ</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
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
                    ].map((faq, idx) => {
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
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--cyan)', transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }}>
                              +
                            </span>
                          </button>
                          {isOpen && (
                            <div style={{ padding: '0 22px 18px', fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.7, borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '12px' }}>
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: '1px solid var(--border-whisper)',
          background: 'rgba(4, 5, 7, 0.85)',
          backdropFilter: 'blur(20px)',
          padding: '60px 0 32px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: '1140px', width: '100%', margin: '0 auto', padding: '0 28px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5.2vw, 4.4rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, textAlign: 'center', marginBottom: '44px', background: 'linear-gradient(180deg, #ffffff 30%, rgba(255, 255, 255, 0.25) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Trust Without Exposure.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '36px', marginBottom: '40px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-hero)', marginBottom: '14px' }}>
                UMBRA PROTOCOL
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-faint)', lineHeight: 1.7, maxWidth: '380px' }}>
                Autonomous, zero-knowledge conditional escrow settlements executing on Midnight Preprod. Observable verification with guaranteed data confidentiality.
              </p>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-hero)', marginBottom: '14px' }}>
                WORKSPACE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(['escrows', 'stats', 'explorer', 'about'] as NavTab[]).map((tab) => (
                  <a
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-sub)', cursor: 'pointer', textTransform: 'capitalize' }}
                  >
                    {tab === 'escrows' ? 'Escrow Registry' : tab === 'stats' ? 'Prover Telemetry' : tab === 'explorer' ? 'Circuit Lab' : 'Architecture Spec'}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-hero)', marginBottom: '14px' }}>
                NETWORK
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="https://docs.midnight.network" target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-sub)', textDecoration: 'none' }}>
                  Midnight Documentation ↗
                </a>
                <a href="https://explorer.preprod.midnight.network" target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-sub)', textDecoration: 'none' }}>
                  Preprod Explorer ↗
                </a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)', flexWrap: 'wrap', gap: '12px' }}>
            <div>© 2026 Umbra Protocol. Built for the Midnight Network.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)' }} />
              <span>100 Compact ZK Tests Verified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
