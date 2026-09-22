import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Activity,
  Layers,
  Cpu,
  Info,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { WalletHUD } from './WalletHUD';

export type NavTab = 'escrows' | 'stats' | 'explorer' | 'about';

interface HeaderHUDProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isBackendOnline: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onCreateClick?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  activeTab,
  onTabChange,
  isBackendOnline,
  refreshing = false,
  onRefresh,
  onCreateClick,
}) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'escrows', label: 'Command Matrix', icon: <Layers size={14} /> },
    { id: 'stats', label: 'Telemetry', icon: <Activity size={14} /> },
    { id: 'explorer', label: 'ZK Circuit Lab', icon: <Cpu size={14} /> },
    { id: 'about', label: 'Protocol Docs', icon: <Info size={14} /> },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '16px 24px',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        background: 'rgba(4, 5, 7, 0.72)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {/* Brand & Network Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
            onClick={() => onTabChange('escrows')}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(192, 132, 252, 0.2))',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)',
              }}
            >
              <Shield size={20} color="#00f0ff" />
            </div>
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #ffffff 40%, rgba(255, 255, 255, 0.6))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  UMBRA
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 6,
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    color: 'var(--cyan)',
                    letterSpacing: '0.05em',
                  }}
                >
                  ZK-ESCROW
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-faint)',
                  marginTop: -2,
                }}
              >
                Midnight Shielded Enclave
              </div>
            </div>
          </div>

          {/* Online Network Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-whisper)',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isBackendOnline ? 'var(--emerald)' : 'var(--gold)',
                boxShadow: isBackendOnline ? '0 0 8px var(--emerald)' : '0 0 8px var(--gold)',
              }}
            />
            <span style={{ color: isBackendOnline ? '#e2e8f0' : 'var(--gold)' }}>
              {isBackendOnline ? 'API Synced' : 'Offline Mock Mode'}
            </span>
          </div>
        </div>

        {/* Tactical Nav Tabs */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(14, 16, 24, 0.7)',
            padding: '4px',
            borderRadius: 14,
            border: '1px solid var(--border-whisper)',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-sub)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
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
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      boxShadow: '0 0 15px rgba(0, 240, 255, 0.1)',
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Refresh, Deploy Escrow, Wallet HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              title="Refresh on-chain state"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(14, 16, 24, 0.6)',
                border: '1px solid var(--border-whisper)',
                color: 'var(--text-sub)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <RefreshCw
                size={15}
                className={refreshing ? 'animate-spin' : ''}
                style={{
                  transition: 'transform 0.5s ease',
                  transform: refreshing ? 'rotate(180deg)' : 'none',
                }}
              />
            </button>
          )}

          {onCreateClick && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #00f0ff 0%, #0099ff 100%)',
                color: '#000000',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 600,
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                cursor: 'pointer',
              }}
            >
              <Terminal size={15} />
              <span>Deploy Escrow</span>
            </motion.button>
          )}

          <WalletHUD />
        </div>
      </div>
    </header>
  );
};
