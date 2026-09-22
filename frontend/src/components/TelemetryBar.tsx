import React from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  ShieldCheck,
  Flame,
  AlertTriangle,
  Lock,
  Layers,
} from 'lucide-react';
import { EscrowStats } from '../hooks/useEscrowService';
import SpotlightCard from './SpotlightCard';

interface TelemetryBarProps {
  stats: EscrowStats;
  isBackendOnline: boolean;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ stats, isBackendOnline }) => {
  const metricCards = [
    {
      id: 'tvl',
      label: 'Locked Volume (TVL)',
      value: `${stats.totalVolume.toLocaleString()} tDUST`,
      sub: 'Shielded in Midnight Enclave',
      icon: <Coins size={18} color="#00f0ff" />,
      accent: 'rgba(0, 240, 255, 0.15)',
      spotlight: 'rgba(0, 240, 255, 0.25)',
      borderColor: 'rgba(0, 240, 255, 0.3)',
    },
    {
      id: 'active',
      label: 'Active Agreements',
      value: stats.activeCount.toString(),
      sub: 'Funded & In-Flight Proofs',
      icon: <Flame size={18} color="#fbbf24" />,
      accent: 'rgba(251, 191, 36, 0.15)',
      spotlight: 'rgba(251, 191, 36, 0.25)',
      borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    {
      id: 'settled',
      label: 'Settled Escrows',
      value: stats.completedCount.toString(),
      sub: '100% Zero-Knowledge Verified',
      icon: <ShieldCheck size={18} color="#34d399" />,
      accent: 'rgba(52, 211, 153, 0.15)',
      spotlight: 'rgba(52, 211, 153, 0.25)',
      borderColor: 'rgba(52, 211, 153, 0.3)',
    },
    {
      id: 'disputes',
      label: 'Disputed Cases',
      value: stats.disputedCount.toString(),
      sub: 'Pending Arbiter Review',
      icon: <AlertTriangle size={18} color={stats.disputedCount > 0 ? '#fb7185' : 'var(--text-faint)'} />,
      accent: stats.disputedCount > 0 ? 'rgba(251, 113, 133, 0.15)' : 'rgba(255, 255, 255, 0.03)',
      spotlight: 'rgba(251, 113, 133, 0.2)',
      borderColor: stats.disputedCount > 0 ? 'rgba(251, 113, 133, 0.3)' : 'var(--border-whisper)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}
    >
      {metricCards.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.08 }}
        >
          <SpotlightCard
            spotlightColor={item.spotlight}
            style={{
              background: 'rgba(14, 16, 24, 0.65)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${item.borderColor}`,
              borderRadius: 16,
              padding: '20px 22px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-sub)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {item.label}
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: item.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </div>
            </div>

            <div
              style={{
                fontSize: 24,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: 'var(--text-hero)',
                letterSpacing: '-0.02em',
                marginBottom: 4,
              }}
            >
              {item.value}
            </div>

            <div
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-faint)',
              }}
            >
              {item.sub}
            </div>
          </SpotlightCard>
        </motion.div>
      ))}
    </div>
  );
};
