import React, { useState, useEffect } from 'react';
import { CanvasFluidBackground } from './components/CanvasFluidBackground';
import { FluidCursor } from './components/FluidCursor';
import { HeaderHUD, NavTab } from './components/HeaderHUD';
import { CommandPalette, MagicDraftPayload } from './components/CommandPalette';
import { PageTransition } from './components/PageTransition';
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
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [actionModalEscrow, setActionModalEscrow] = useState<EscrowRecord | null>(null);
  const [pendingActionType, setPendingActionType] = useState<EscrowActionType | null>(null);
  const [magicDraftData, setMagicDraftData] = useState<MagicDraftPayload | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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
    error,
  } = useEscrowService();

  // Initialize theme from storage or default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem('umbra_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('umbra_theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenActionModal = (escrow: EscrowRecord, action: EscrowActionType) => {
    setActionModalEscrow(escrow);
    setPendingActionType(action);
  };

  const handleExecuteAction = async (escrowId: string, action: EscrowActionType, params?: { value?: string }) => {
    await executeAction(escrowId, action, params);
  };

  const handleDeployEscrow = async (data: { sellerAddress: string; amount: string; condition: string }) => {
    await createEscrow(data);
    setMagicDraftData(null);
  };

  const handleOpenCreateWithPrefill = (prefill?: MagicDraftPayload) => {
    if (prefill) {
      setMagicDraftData(prefill);
    } else {
      setMagicDraftData(null);
    }
    setCreateModalOpen(true);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Zero-Dependency Fluid Particle Flow Canvas ── */}
      <CanvasFluidBackground theme={theme} />

      {/* ── Original Smooth Interactive Fluid Cursor ── */}
      <FluidCursor />

      {/* ── Floating Dynamic Island Notch Bar ── */}
      <HeaderHUD
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        isBackendOnline={isBackendOnline}
        refreshing={refreshing}
        onRefresh={refresh}
        onCreateClick={() => handleOpenCreateWithPrefill()}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ── Main Spatial Workspace ── */}
      <main
        style={{
          flex: 1,
          padding: '100px 0 60px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
          {/* ── Error Banner ── */}
          {error && (
            <div
              role="alert"
              style={{
                maxWidth: 800,
                margin: '0 auto 20px',
                background: 'rgba(251, 113, 133, 0.1)',
                border: '1px solid rgba(251, 113, 133, 0.35)',
                borderRadius: 12,
                padding: '12px 18px',
                color: 'var(--crimson)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(251, 113, 133, 0.15)',
              }}
            >
              {error}
            </div>
          )}

          {/* ── Hero Editorial Title & Subtitle ── */}
          <div style={{ marginBottom: 28, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--cyan)',
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  padding: '2px 8px',
                  borderRadius: 9999,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Midnight Shielded Enclave
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-editorial)',
                fontStyle: 'italic',
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 800,
                color: 'var(--text-hero)',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                margin: '4px 0',
              }}
            >
              Shielded Zero-Knowledge Escrow Protocol
            </h1>

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-sub)',
                marginTop: 6,
                maxWidth: 680,
                lineHeight: 1.5,
              }}
            >
              Autonomous, zero-leakage peer-to-peer settlement infrastructure powered by Halo2 zkSNARK circuits and Compact state machines.
            </p>
          </div>

          {/* ── Bento Telemetry Bar with Odometers ── */}
          <TelemetryBar stats={stats} isBackendOnline={isBackendOnline} />

          {/* ── Liquid Warp SVG Displacement Route Page Transition ── */}
          <PageTransition routeKey={activeTab}>
            {/* VIEW 1: COMMAND MATRIX */}
            {activeTab === 'escrows' && (
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
                onCreateClick={() => handleOpenCreateWithPrefill()}
              />
            )}

            {/* VIEW 2: TELEMETRY */}
            {activeTab === 'stats' && (
              <ProtocolMetricsView stats={stats} isBackendOnline={isBackendOnline} />
            )}

            {/* VIEW 3: CIRCUIT LAB */}
            {activeTab === 'explorer' && (
              <ZKExplorerView />
            )}

            {/* VIEW 4: DOCS & ARCHITECTURE */}
            {activeTab === 'about' && (
              <AboutUmbraView />
            )}
          </PageTransition>
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
        onClose={() => {
          setCreateModalOpen(false);
          setMagicDraftData(null);
        }}
        onSubmit={handleDeployEscrow}
        isLoading={actionLoading}
        initialData={magicDraftData}
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

      {/* ── NLP Magic Draft Command Palette (Cmd+K) ── */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenCreateModal={(prefill) => handleOpenCreateWithPrefill(prefill)}
        onRefresh={refresh}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ── Minimalist Precision Bottom HUD ── */}
      <FooterHUD />
    </div>
  );
}
