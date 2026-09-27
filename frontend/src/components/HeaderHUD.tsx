import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Activity,
  Layers,
  Cpu,
  BookOpen,
  Plus,
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
    { id: 'escrows', label: 'Command Matrix', icon: <Layers size={13} /> },
    { id: 'stats', label: 'Telemetry', icon: <Activity size={13} /> },
    { id: 'explorer', label: 'Circuit Lab', icon: <Cpu size={13} /> },
    { id: 'about', label: 'Docs', icon: <BookOpen size={13} /> },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '12px 24px',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        background: 'rgba(7, 8, 12, 0.82)',
        borderBottom: '1px solid var(--border-whisper)',
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Left: Brand + Health Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => onTabChange('escrows')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(192, 132, 252, 0.15))',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={16} color="#00f0ff" />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}
            >
              UMBRA
            </span>
          </div>

          {/* Compact Single Health Indicator */}
          <div
            title={isBackendOnline ? 'Protocol API Synced & Operational' : 'Protocol API Offline'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px',
              borderRadius: '9999px',
              background: isBackendOnline ? 'rgba(52, 211, 153, 0.08)' : 'rgba(251, 113, 133, 0.08)',
              border: `1px solid ${isBackendOnline ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 113, 133, 0.2)'}`,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: isBackendOnline ? 'var(--emerald)' : 'var(--crimson)',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: isBackendOnline ? 'var(--emerald)' : 'var(--crimson)',
                boxShadow: isBackendOnline ? '0 0 6px var(--emerald)' : 'none',
              }}
            />
            <span>{isBackendOnline ? 'Synced' : 'Offline'}</span>
          </div>
        </div>

        {/* Center: Sleek Segmented Pill Tabs */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '3px',
            borderRadius: 10,
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
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 7,
                  border: 'none',
                  background: 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-sub)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
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
                      borderRadius: 7,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster: Network Pill, Refresh, Deploy CTA, Wallet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Subtle Network Badge */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-faint)',
              padding: '4px 8px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-whisper)',
              letterSpacing: '0.04em',
            }}
          >
            Midnight Preprod
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              title="Refresh on-chain state"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-whisper)',
                color: 'var(--text-sub)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw
                size={13}
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
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%)',
                color: '#07080c',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                fontWeight: 600,
                boxShadow: '0 0 14px rgba(0, 240, 255, 0.25)',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Deploy Escrow</span>
            </motion.button>
          )}

          <WalletHUD />
        </div>
      </div>
    </header>
  );
};
