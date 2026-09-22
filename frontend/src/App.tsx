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
import { ZKExplorerView } from './components/ZKExplorerView';
import { ProtocolMetricsView } from './components/ProtocolMetricsView';
import { AboutUmbraView } from './components/AboutUmbraView';
import { FooterHUD } from './components/FooterHUD';
import { useEscrowService } from './hooks/useEscrowService';
import { EscrowRecord, EscrowActionType } from './types/escrow';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('escrows');
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
                 VIEW 2: STATS (TELEMETRY - PHASE 22 MODULAR VIEW)
                 ======================================================== */}
            {activeTab === 'stats' && (
              <ProtocolMetricsView stats={stats} isBackendOnline={isBackendOnline} />
            )}

            {/* ========================================================
                 VIEW 3: EXPLORER (CIRCUITS - PHASE 22 MODULAR VIEW)
                 ======================================================== */}
            {activeTab === 'explorer' && (
              <ZKExplorerView />
            )}

            {/* ========================================================
                 VIEW 4: ABOUT (ARCHITECTURE SPEC - PHASE 22 MODULAR VIEW)
                 ======================================================== */}
            {activeTab === 'about' && (
              <AboutUmbraView />
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
