import React, { useState, useEffect } from 'react';
import { CanvasFluidBackground } from './components/CanvasFluidBackground';
import { FluidCursor } from './components/FluidCursor';
import { HeaderHUD, NavTab } from './components/HeaderHUD';
import { LandingHero } from './components/LandingHero';
import { CommandPalette, MagicDraftPayload } from './components/CommandPalette';
import { EscrowMatrix } from './components/EscrowMatrix';
import { EscrowInspectorModal } from './components/EscrowInspectorModal';
import { CreateEscrowModal } from './components/CreateEscrowModal';
import { ActionModal } from './components/ActionModal';
import { ZKExplorerView } from './components/ZKExplorerView';
import { AboutUmbraView } from './components/AboutUmbraView';
import { FooterHUD } from './components/FooterHUD';
import { PageTransition } from './components/PageTransition';
import { useEscrowService } from './hooks/useEscrowService';
import { EscrowRecord, EscrowActionType } from './types/escrow';
import { soundFx } from './lib/AudioEngine';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
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

  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        onTabChange={handleNavigate}
        isBackendOnline={isBackendOnline}
        onCreateClick={() => handleOpenCreateWithPrefill()}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ── Main Dedicated View Container ── */}
      <main
        style={{
          flex: 1,
          padding: '90px 0 60px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
          {/* Error Banner */}
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

          {/* ── Dedicated Page Transition Routing ── */}
          <PageTransition routeKey={activeTab}>
            {/* 1. HOME VIEW */}
            {activeTab === 'home' && (
              <LandingHero
                onLaunchApp={() => handleNavigate('app')}
                onReadArchitecture={() => handleNavigate('guide')}
                isBackendOnline={isBackendOnline}
                stats={stats}
              />
            )}

            {/* 2. APP VIEW (Live Enclave Workspace) */}
            {activeTab === 'app' && (
              <section style={{ paddingTop: '20px', marginBottom: '80px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.15em',
                        color: 'var(--cyan)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Live Enclaves
                    </span>
                    <h2
                      style={{
                        fontFamily: 'var(--font-editorial)',
                        fontStyle: 'italic',
                        fontSize: 32,
                        fontWeight: 800,
                        color: 'var(--text-hero)',
                        marginTop: 4,
                      }}
                    >
                      Active Escrow Agreements
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playOpen();
                      handleOpenCreateWithPrefill();
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 9999,
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1px solid rgba(0, 240, 255, 0.35)',
                      color: 'var(--cyan)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>+ DEPLOY NEW ESCROW</span>
                  </button>
                </div>

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
              </section>
            )}

            {/* 3. CIRCUITS VIEW */}
            {activeTab === 'circuits' && (
              <section style={{ paddingTop: '20px', marginBottom: '80px' }}>
                <ZKExplorerView />
              </section>
            )}

            {/* 4. GUIDE VIEW (Architecture Specification) */}
            {activeTab === 'guide' && (
              <section style={{ paddingTop: '20px', marginBottom: '80px' }}>
                <AboutUmbraView />
              </section>
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
        onSelectTab={handleNavigate}
        onOpenCreateModal={(prefill) => handleOpenCreateWithPrefill(prefill)}
        onRefresh={refresh}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ── Editorial Watermark Footer ── */}
      <FooterHUD
        onNavigateTab={handleNavigate}
      />
    </div>
  );
}
