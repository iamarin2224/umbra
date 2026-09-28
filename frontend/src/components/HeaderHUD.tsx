import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Center Navbar Items on Desktop: APP, CIRCUITS, GUIDES
  const navItems: Array<{ id: NavTab; label: string }> = [
    { id: 'app', label: 'APP' },
    { id: 'circuits', label: 'CIRCUITS' },
    { id: 'guide', label: 'GUIDES' },
  ];

  // Mobile Menu Items (includes Home for easy navigation)
  const mobileNavItems: Array<{ id: NavTab; label: string }> = [
    { id: 'home', label: 'HOME' },
    { id: 'app', label: 'APP' },
    { id: 'circuits', label: 'CIRCUITS' },
    { id: 'guide', label: 'GUIDES' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 80,
        width: 'calc(100% - 24px)',
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
          gap: 10,
          padding: '7px 14px',
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
        {/* Left: Brand "Umbra" (acts as Home button) + SYS.ONLINE Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            onClick={() => {
              soundFx.playTick();
              onTabChange('home');
              setMobileMenuOpen(false);
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

          {/* SYS.ONLINE Box Badge - Hidden on narrow mobile to keep notch bar minimal */}
          <div
            title={isBackendOnline ? 'Midnight Zero-Knowledge Enclave Synced' : 'Protocol State Offline'}
            className="sm-badge"
            style={{
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

        {/* Center: Directly Displayed Nav Links on Desktop (strictly hidden on mobile) */}
        {!isMobile && (
          <nav
            className="desktop-only"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
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
                    padding: '8px 14px',
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
                    whiteSpace: 'nowrap',
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
                        left: 14,
                        right: 14,
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
        )}

        {/* Right: Theme Toggle + Connect Wallet + Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={() => {
                soundFx.playTick();
                onToggleTheme();
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              style={{
                width: 30,
                height: 30,
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
                flexShrink: 0,
              }}
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              </motion.div>
            </button>
          )}

          {/* Connect / Wallet HUD Pill (Always visible in mobile & desktop) */}
          <WalletHUD />

          {/* Mobile Hamburger Toggle Button (ONLY visible on mobile) */}
          {isMobile && (
            <button
              onClick={() => {
                soundFx.playTick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="mobile-only"
              title="Toggle Navigation Menu"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background:
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                border: `1px solid ${
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'
                }`,
                color: theme === 'dark' ? '#ffffff' : '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Liquid Glass Dropdown Menu */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mobile-only"
            style={{
              marginTop: 8,
              padding: '10px',
              borderRadius: 16,
              background:
                theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(10, 14, 24, 0.94)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%), rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(36px) saturate(210%) brightness(108%)',
              WebkitBackdropFilter: 'blur(36px) saturate(210%) brightness(108%)',
              border: `1px solid ${
                theme === 'dark' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)'
              }`,
              boxShadow:
                'inset 0 1px 1px 0 rgba(255, 255, 255, 0.18), 0 20px 48px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {mobileNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFx.playTick();
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: isActive
                      ? theme === 'dark'
                        ? 'rgba(0, 240, 255, 0.1)'
                        : 'rgba(2, 132, 199, 0.1)'
                      : 'transparent',
                    color: isActive
                      ? 'var(--cyan)'
                      : theme === 'dark'
                      ? 'var(--text-sub)'
                      : '#334155',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '0.1em',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: 'var(--cyan)',
                        boxShadow: '0 0 6px var(--cyan)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
