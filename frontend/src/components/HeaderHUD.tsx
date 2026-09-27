import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Activity,
  Layers,
  Cpu,
  BookOpen,
  Plus,
  RefreshCw,
  Search,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Menu,
  X,
  Command,
} from 'lucide-react';
import { WalletHUD } from './WalletHUD';
import { soundFx } from '../lib/AudioEngine';

export type NavTab = 'escrows' | 'stats' | 'explorer' | 'about';

interface HeaderHUDProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isBackendOnline: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onCreateClick?: () => void;
  onOpenCommandPalette?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  activeTab,
  onTabChange,
  isBackendOnline,
  refreshing = false,
  onRefresh,
  onCreateClick,
  onOpenCommandPalette,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(soundFx.getIsMuted());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAudioToggle = () => {
    const muted = soundFx.toggleMute();
    setIsAudioMuted(muted);
  };

  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'escrows', label: 'Command Matrix', icon: <Layers size={13} /> },
    { id: 'stats', label: 'Telemetry', icon: <Activity size={13} /> },
    { id: 'explorer', label: 'Circuit Lab', icon: <Cpu size={13} /> },
    { id: 'about', label: 'Architecture', icon: <BookOpen size={13} /> },
  ];

  return (
    <>
      {/* ── Floating Dynamic Island Notch Bar ── */}
      <header
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 80,
          width: 'calc(100% - 32px)',
          maxWidth: 1080,
          pointerEvents: 'auto',
        }}
      >
        <div
          className="notch-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '8px 14px',
            borderRadius: 9999,
            background:
              theme === 'dark'
                ? scrolled
                  ? 'rgba(6, 8, 12, 0.88)'
                  : 'rgba(10, 13, 20, 0.72)'
                : scrolled
                ? 'rgba(255, 255, 255, 0.92)'
                : 'rgba(255, 255, 255, 0.78)',
            border: `1px solid ${
              theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'
            }`,
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            boxShadow:
              theme === 'dark'
                ? '0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 16px 36px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Left: Brand Identity + System Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              onClick={() => {
                soundFx.playTick();
                onTabChange('escrows');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                userSelect: 'none',
                padding: '4px 8px',
                borderRadius: 20,
                transition: 'opacity 0.2s',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background:
                    'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(192, 132, 252, 0.2))',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(0, 240, 255, 0.2)',
                }}
              >
                <Shield size={14} color="#00f0ff" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-editorial)',
                    fontStyle: 'italic',
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: theme === 'dark' ? '#ffffff' : '#0f172a',
                  }}
                >
                  Umbra
                </span>
              </div>
            </div>

            {/* SYS.ONLINE Status Pill */}
            <div
              title={isBackendOnline ? 'Midnight Zero-Knowledge Enclave Synced' : 'Protocol State Offline'}
              style={{
                display: 'none',
                alignItems: 'center',
                gap: 5,
                padding: '3px 8px',
                borderRadius: 9999,
                background: isBackendOnline
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'rgba(251, 113, 133, 0.08)',
                border: `1px solid ${
                  isBackendOnline ? 'rgba(16, 185, 129, 0.25)' : 'rgba(251, 113, 133, 0.25)'
                }`,
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                color: isBackendOnline ? 'var(--emerald)' : 'var(--crimson)',
                letterSpacing: '0.04em',
              }}
              className="sm:!inline-flex"
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: isBackendOnline ? 'var(--emerald)' : 'var(--crimson)',
                  boxShadow: isBackendOnline ? '0 0 8px var(--emerald)' : 'none',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
              <span>{isBackendOnline ? 'SYS.ONLINE' : 'SYS.OFFLINE'}</span>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs with Framer Motion layoutId */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 2,
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)',
              padding: '3px',
              borderRadius: 9999,
              border: `1px solid ${
                theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
              }`,
            }}
            className="md:!flex"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundFx.playTick();
                    onTabChange(tab.id);
                  }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 9999,
                    border: 'none',
                    background: 'transparent',
                    color: isActive
                      ? theme === 'dark'
                        ? '#ffffff'
                        : '#0f172a'
                      : theme === 'dark'
                      ? 'var(--text-sub)'
                      : '#64748b',
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 450,
                    cursor: 'pointer',
                    transition: 'color 0.15s ease',
                    zIndex: 1,
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 9999,
                        background:
                          theme === 'dark'
                            ? 'rgba(255, 255, 255, 0.12)'
                            : 'rgba(255, 255, 255, 0.95)',
                        border: `1px solid ${
                          theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)'
                        }`,
                        boxShadow:
                          theme === 'dark'
                            ? '0 2px 10px rgba(0, 0, 0, 0.35)'
                            : '0 2px 8px rgba(0, 0, 0, 0.08)',
                        zIndex: -1,
                      }}
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster: Cmd+K, Audio, Theme, Refresh, Deploy CTA, Wallet */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Command Palette Trigger */}
            {onOpenCommandPalette && (
              <button
                onClick={() => {
                  soundFx.playTick();
                  onOpenCommandPalette();
                }}
                title="Search & NLP Magic Draft (⌘K)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 9px',
                  borderRadius: 9999,
                  background:
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                  border: `1px solid ${
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
                  }`,
                  color: theme === 'dark' ? 'var(--text-sub)' : '#64748b',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Search size={12} color="var(--cyan)" />
                <div
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: 2,
                    opacity: 0.75,
                  }}
                  className="sm:!inline-flex"
                >
                  <Command size={10} />
                  <span>K</span>
                </div>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={handleAudioToggle}
              title={isAudioMuted ? 'Enable Audio Haptics' : 'Mute Audio Haptics'}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background:
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                border: `1px solid ${
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
                }`,
                color: isAudioMuted
                  ? theme === 'dark'
                    ? 'var(--text-faint)'
                    : '#9ca3af'
                  : 'var(--emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isAudioMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>

            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={() => {
                  soundFx.playTick();
                  onToggleTheme();
                }}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background:
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                  border: `1px solid ${
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
                  }`,
                  color: theme === 'dark' ? '#fbbf24' : '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
                </motion.div>
              </button>
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={() => {
                  soundFx.playTick();
                  onRefresh();
                }}
                disabled={refreshing}
                title="Resync on-chain ledger state"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background:
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                  border: `1px solid ${
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
                  }`,
                  color: theme === 'dark' ? 'var(--text-sub)' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw
                  size={12}
                  style={{
                    transition: 'transform 0.5s ease',
                    transform: refreshing ? 'rotate(180deg)' : 'none',
                  }}
                />
              </button>
            )}

            {/* Deploy Escrow Primary Action CTA */}
            {onCreateClick && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  soundFx.playOpen();
                  onCreateClick();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  borderRadius: 9999,
                  background: 'linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%)',
                  color: '#06080c',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  fontWeight: 700,
                  boxShadow: '0 0 16px rgba(0, 240, 255, 0.35)',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                <Plus size={13} strokeWidth={3} />
                <span className="hidden sm:inline">Deploy</span>
              </motion.button>
            )}

            {/* Wallet HUD */}
            <WalletHUD />

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background:
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                border: `1px solid ${
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
                }`,
                color: theme === 'dark' ? '#ffffff' : '#0f172a',
                cursor: 'pointer',
              }}
              className="md:!hidden"
            >
              {mobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              style={{
                marginTop: 8,
                padding: 10,
                borderRadius: 16,
                background:
                  theme === 'dark' ? 'rgba(10, 13, 20, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                border: `1px solid ${
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'
                }`,
                backdropFilter: 'blur(24px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              }}
              className="md:!hidden"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundFx.playTick();
                      onTabChange(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: 'none',
                      background: isActive
                        ? theme === 'dark'
                          ? 'rgba(0, 240, 255, 0.12)'
                          : 'rgba(0, 0, 0, 0.08)'
                        : 'transparent',
                      color: isActive
                        ? 'var(--cyan)'
                        : theme === 'dark'
                        ? '#e2e8f0'
                        : '#334155',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
