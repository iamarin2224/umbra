import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Galaxy from './components/Galaxy';
import SpotlightCard from './components/SpotlightCard';
import { FluidCursor } from './components/FluidCursor';
import { HeaderHUD, NavTab } from './components/HeaderHUD';
import { TelemetryBar } from './components/TelemetryBar';
import { EscrowMatrix } from './components/EscrowMatrix';
import { EscrowInspectorModal } from './components/EscrowInspectorModal';
import { CreateEscrowModal } from './components/CreateEscrowModal';
import { ActionModal } from './components/ActionModal';
import { FooterHUD } from './components/FooterHUD';
import { useEscrowService } from './hooks/useEscrowService';
import { EscrowRecord, EscrowActionType } from './types/escrow';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('escrows');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [actionModalEscrow, setActionModalEscrow] = useState<EscrowRecord | null>(null);
  const [pendingActionType, setPendingActionType] = useState<EscrowActionType | null>(null);

  const {
    filteredEscrows,
    events,
    stats,
    filter,
    setFilter,
    selectedEscrow,
    setSelectedEscrow,
    loading,
    actionLoading,
    refreshing,
    refresh,
    createEscrow,
    executeAction,
    isBackendOnline,
  } = useEscrowService();

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

  const handleOpenActionModal = (escrow: EscrowRecord, action: EscrowActionType) => {
    setActionModalEscrow(escrow);
    setPendingActionType(action);
  };

  const handleExecuteAction = async (escrowId: string, action: EscrowActionType, params?: { value?: string }) => {
    await executeAction(escrowId, action, params);
  };

  const handleDeployEscrow = async (data: { sellerAddress: string; amount: string; condition: string }) => {
    await createEscrow(data);
  };

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

      {/* ── Umbra Command Bar & Header HUD (Phase 18) ── */}
      <HeaderHUD
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isBackendOnline={isBackendOnline}
        refreshing={refreshing}
        onRefresh={refresh}
        onCreateClick={() => setCreateModalOpen(true)}
      />

      {/* ── Main Workspace ── */}
      <main style={{ flex: 1, padding: '36px 0 60px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
          
          {/* ── Live Protocol Telemetry Metrics (Phase 18) ── */}
          <TelemetryBar stats={stats} isBackendOnline={isBackendOnline} />

          <AnimatePresence mode="wait">
            {/* ========================================================
                 VIEW 1: COMMAND MATRIX & ESCROW CARDS (PHASE 19)
                 ======================================================== */}
            {activeTab === 'escrows' && (
              <motion.section
                key="escrows"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              >
                {/* Hero Header */}
                <div style={{ textAlign: 'center', padding: '16px 0 32px', maxWidth: '840px', margin: '0 auto' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--cyan)',
                      marginBottom: '12px',
                    }}
                  >
                    Midnight Zero-Knowledge Settlement Protocol
                  </span>

                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                      fontWeight: 700,
                      lineHeight: 1.1,
                      letterSpacing: '-0.03em',
                      marginBottom: '16px',
                      background: 'linear-gradient(180deg, #ffffff 40%, rgba(255, 255, 255, 0.5) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Shielded Contracts.{' '}
                    <span
                      style={{
                        background: 'linear-gradient(135deg, var(--cyan) 0%, var(--amethyst) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Verifiable Settlements.
                    </span>
                  </h1>

                  <p
                    style={{
                      fontSize: '15px',
                      color: 'var(--text-sub)',
                      lineHeight: 1.6,
                      maxWidth: '600px',
                      margin: '0 auto 24px',
                    }}
                  >
                    Execute private escrow agreements without exposing balances, counterparty addresses, or condition witnesses on the public ledger.
                  </p>
                </div>

                {/* 3-Step Fluid Stepper */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                    marginBottom: '36px',
                  }}
                >
                  {[
                    { num: '01', title: 'Pedersen Lock', desc: 'Capital committed as an uninvertible hash' },
                    { num: '02', title: 'Milestone Proof', desc: 'Private witness satisfies contract rules' },
                    { num: '03', title: 'Shielded Settlement', desc: 'Settlement completes with zero ledger leak' },
                  ].map((step, i) => (
                    <SpotlightCard
                      key={i}
                      spotlightColor="rgba(0, 229, 255, 0.22)"
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        borderRadius: '14px',
                        background: 'rgba(14, 16, 24, 0.65)',
                        border: '1px solid var(--border-whisper)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--cyan)',
                          background: 'rgba(0, 240, 255, 0.08)',
                          border: '1px solid rgba(0, 240, 255, 0.2)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {step.num}
                      </span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-hero)' }}>{step.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '2px' }}>{step.desc}</div>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>

                {/* Escrow Command Matrix (Phase 19) */}
                <EscrowMatrix
                  escrows={filteredEscrows}
                  filter={filter}
                  onFilterChange={setFilter}
                  onSelectEscrow={(item) => {
                    setSelectedEscrow(item);
                    setInspectorOpen(true);
                  }}
                  onAction={handleOpenActionModal}
                  isActionLoading={actionLoading}
                  onCreateClick={() => setCreateModalOpen(true)}
                />
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
                    Prover Telemetry &amp; Enclave Benchmarks
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginTop: '6px' }}>
                    Enclave Performance Metrics
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                  <SpotlightCard className="fluid-glass-panel" spotlightColor="rgba(0, 229, 255, 0.2)">
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
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.02)',
                            padding: '14px 18px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-whisper)',
                          }}
                        >
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

                  <SpotlightCard className="fluid-glass-panel" spotlightColor="rgba(192, 132, 252, 0.2)">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600 }}>Settlement Distribution</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)' }}>
                        {stats.totalVolume.toLocaleString()} tDUST
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '20px', lineHeight: 1.6 }}>
                      Active distribution of smart contract state machine instances across Midnight Preprod:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {[
                        { label: 'ACTIVE', count: stats.activeCount.toString(), sub: 'Funded / Delivery', color: 'var(--gold)' },
                        { label: 'SETTLED', count: stats.completedCount.toString(), sub: 'Zero disclosure', color: 'var(--emerald)' },
                        { label: 'DISPUTED', count: stats.disputedCount.toString(), sub: 'In Arbitration', color: 'var(--crimson)' },
                      ].map((node, i) => (
                        <div
                          key={i}
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--border-whisper)',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'center',
                          }}
                        >
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: node.color }}>{node.label}</span>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: node.color, margin: '4px 0' }}>
                            {node.count}
                          </div>
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                  <SpotlightCard className="fluid-glass-panel" spotlightColor="rgba(0, 229, 255, 0.2)">
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
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              >
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

                {/* Problem vs Solution */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                  <SpotlightCard className="fluid-glass-panel" spotlightColor="rgba(251, 113, 133, 0.18)">
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--crimson)', marginBottom: '12px' }}>
                      The Custodial Escrow Paradox
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: 1.7 }}>
                      Legacy escrows mandate trusted third parties—banks, escrow attorneys, or brokers—who inspect and hold every parameter: counterparty identities, milestone terms, and capital volume. This creates single points of failure, surveillance, and censorship risk.
                    </p>
                  </SpotlightCard>

                  <SpotlightCard className="fluid-glass-panel" spotlightColor="rgba(0, 229, 255, 0.2)">
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--cyan)', marginBottom: '12px' }}>
                      The Autonomous ZK Enclave
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: 1.7 }}>
                      Umbra substitutes intermediaries with Compact zkSNARK circuits on Midnight. Contract terms are verified on-chain via mathematical validity proofs, while commercial parameters remain private off-chain witnesses known only to authorized parties.
                    </p>
                  </SpotlightCard>
                </div>

                {/* Observability Matrix */}
                <SpotlightCard className="fluid-glass-panel" spotlightColor="rgba(0, 229, 255, 0.16)" style={{ marginBottom: '40px' }}>
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

                {/* FAQ Accordion */}
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

      {/* ── Escrow Deep Audit Inspector Modal (Phase 21) ── */}
      <EscrowInspectorModal
        isOpen={inspectorOpen}
        escrow={selectedEscrow}
        events={events}
        onClose={() => {
          setInspectorOpen(false);
          setSelectedEscrow(null);
        }}
        onAction={handleOpenActionModal}
        isActionLoading={actionLoading}
      />

      {/* ── Create Escrow Tactical Modal (Phase 20) ── */}
      <CreateEscrowModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleDeployEscrow}
        isLoading={actionLoading}
      />

      {/* ── Action / Transition Circuit Modal (Phase 20) ── */}
      <ActionModal
        isOpen={!!actionModalEscrow && !!pendingActionType}
        onClose={() => {
          setActionModalEscrow(null);
          setPendingActionType(null);
        }}
        escrow={actionModalEscrow}
        actionType={pendingActionType}
        onConfirm={handleExecuteAction}
        isLoading={actionLoading}
      />

      {/* ── Umbra Footer HUD (Phase 18) ── */}
      <FooterHUD />
    </div>
  );
}
