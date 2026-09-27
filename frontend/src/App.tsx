import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Galaxy from './components/Galaxy';
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
    actionLoading,
    refreshing,
    refresh,
    createEscrow,
    executeAction,
    isBackendOnline,
    isLiveConnected,
    error,
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
      {/* ── Ambient WebGL Galaxy Canvas ── */}
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
          density={0.8}
          glowIntensity={0.22}
          saturation={0.3}
          hueShift={140}
          twinkleIntensity={0.25}
          rotationSpeed={0.02}
          repulsionStrength={1.4}
          autoCenterRepulsion={0}
          starSpeed={0.2}
          speed={0.5}
          transparent={false}
        />
      </div>

      {/* ── Custom Dynamic Cursor ── */}
      <FluidCursor />

      {/* ── Minimalist Global Navigation Bar ── */}
      <HeaderHUD
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isBackendOnline={isBackendOnline}
        refreshing={refreshing}
        onRefresh={refresh}
        onCreateClick={() => setCreateModalOpen(true)}
      />

      {/* ── Main Workspace ── */}
      <main style={{ flex: 1, padding: '24px 0 48px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '0 24px' }}>

          {/* ── Error Banner ── */}
          {error && (
            <div
              role="alert"
              style={{
                maxWidth: 800,
                margin: '0 auto 16px',
                background: 'rgba(251, 113, 133, 0.08)',
                border: '1px solid rgba(251, 113, 133, 0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                color: 'var(--crimson)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {/* ── Sleek Horizontal Telemetry Bar ── */}
          <TelemetryBar stats={stats} isBackendOnline={isBackendOnline} />

          <AnimatePresence mode="wait">
            {/* ── VIEW 1: COMMAND MATRIX ── */}
            {activeTab === 'escrows' && (
              <motion.section
                key="escrows"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Compact Linear Stepper Strip */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: 12,
                    marginBottom: 18,
                  }}
                >
                  {[
                    { step: '01', title: 'Commitment Hash', desc: 'Capital locked as persistentHash' },
                    { step: '02', title: 'Milestone Proof', desc: 'Off-chain witness verified via zkSNARK' },
                    { step: '03', title: 'Shielded Settlement', desc: 'Autonomous payout with zero leak' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(13, 16, 23, 0.5)',
                        border: '1px solid var(--border-whisper)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--cyan)',
                          background: 'rgba(0, 240, 255, 0.08)',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {item.step}
                      </span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Escrow Matrix List & Toolbar */}
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

            {/* ── VIEW 2: TELEMETRY ── */}
            {activeTab === 'stats' && (
              <ProtocolMetricsView stats={stats} isBackendOnline={isBackendOnline} />
            )}

            {/* ── VIEW 3: CIRCUIT LAB ── */}
            {activeTab === 'explorer' && (
              <ZKExplorerView />
            )}

            {/* ── VIEW 4: DOCS & ARCHITECTURE ── */}
            {activeTab === 'about' && (
              <AboutUmbraView />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Modals & Drawers ── */}
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

      <CreateEscrowModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleDeployEscrow}
        isLoading={actionLoading}
      />

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

      {/* ── Minimalist Footer ── */}
      <FooterHUD />
    </div>
  );
}
