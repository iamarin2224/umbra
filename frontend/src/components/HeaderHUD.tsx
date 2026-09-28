import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { WalletHUD } from './WalletHUD';
import { soundFx } from '../lib/AudioEngine';

export type NavTab = 'home' | 'app' | 'circuits' | 'guide';

interface HeaderHUDProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isBackendOnline: boolean;
  onCreateClick?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  activeTab,
  onTabChange,
  isBackendOnline,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navbar has strictly: APP, CIRCUITS, GUIDES directly in the bar
  const navItems: Array<{ id: NavTab; label: string }> = [
    { id: 'app', label: 'APP' },
    { id: 'circuits', label: 'CIRCUITS' },
    { id: 'guide', label: 'GUIDES' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 80,
        width: 'calc(100% - 32px)',
        maxWidth: 920,
        pointerEvents: 'auto',
      }}
    >
      <div
        className="notch-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '8px 18px',
          borderRadius: 9999,
          background:
            theme === 'dark'
              ? scrolled
                ? 'rgba(4, 5, 8, 0.92)'
                : 'rgba(8, 10, 15, 0.78)'
              : scrolled
              ? 'rgba(255, 255, 255, 0.94)'
              : 'rgba(255, 255, 255, 0.85)',
          border: `1px solid ${
            theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'
          }`,
          backdropFilter: 'blur(32px) saturate(190%)',
          WebkitBackdropFilter: 'blur(32px) saturate(190%)',
          boxShadow:
            theme === 'dark'
              ? '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 16px 36px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Left: Full Name "Umbra" (acts as Home button) + SYS.ONLINE Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            onClick={() => {
              soundFx.playTick();
              onTabChange('home');
            }}
            title="Umbra Home"
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 4,
              cursor: 'pointer',
              userSelect: 'none',
              padding: '2px 4px',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-editorial)',
                fontStyle: 'italic',
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: theme === 'dark' ? '#ffffff' : '#0f172a',
                lineHeight: 1,
              }}
            >
              Umbra
            </span>
          </div>

          {/* SYS.ONLINE Box Badge */}
          <div
            title={isBackendOnline ? 'Midnight Zero-Knowledge Enclave Synced' : 'Protocol State Offline'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 8px',
              borderRadius: 4,
              background: isBackendOnline
                ? 'rgba(16, 185, 129, 0.08)'
                : 'rgba(251, 113, 133, 0.08)',
              border: `1px solid ${
                isBackendOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(251, 113, 133, 0.3)'
              }`,
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              color: isBackendOnline ? 'var(--emerald)' : 'var(--crimson)',
              letterSpacing: '0.08em',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: 1,
                background: isBackendOnline ? 'var(--emerald)' : 'var(--crimson)',
                boxShadow: isBackendOnline ? '0 0 6px var(--emerald)' : 'none',
              }}
            />
            <span>SYS.ONLINE</span>
          </div>
        </div>

        {/* Center: Directly Displayed Monospace Nav Links: HOME, APP, CIRCUITS */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(14px, 2.5vw, 26px)',
          }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playTick();
                  onTabChange(item.id);
                }}
                style={{
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  padding: '6px 2px',
                  color: isActive
                    ? theme === 'dark'
                      ? '#ffffff'
                      : '#0f172a'
                    : theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.55)'
                    : '#64748b',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.14em',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavUnderline"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: theme === 'dark' ? '#ffffff' : '#0f172a',
                      borderRadius: 1,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Theme Toggle + Wallet Connect */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={() => {
                soundFx.playTick();
                onToggleTheme();
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background:
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                border: `1px solid ${
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'
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
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </motion.div>
            </button>
          )}

          {/* Connect / Wallet HUD Pill */}
          <WalletHUD />
        </div>
      </div>
    </header>
  );
};
