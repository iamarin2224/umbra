import React from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  ShieldCheck,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { EscrowStats } from '../hooks/useEscrowService';
import SpotlightCard from './SpotlightCard';

interface TelemetryBarProps {
  stats: EscrowStats;
  isBackendOnline: boolean;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ stats }) => {
  const metricItems = [
    {
      id: 'tvl',
      label: 'Locked Volume',
      value: `${stats.totalVolume.toLocaleString()} tDUST`,
      icon: <Coins size={15} color="var(--cyan)" />,
      accentColor: 'var(--cyan)',
    },
    {
      id: 'active',
      label: 'Active Agreements',
      value: stats.activeCount.toString(),
      icon: <Flame size={15} color="var(--gold)" />,
      accentColor: 'var(--gold)',
    },
    {
      id: 'settled',
      label: 'Settled Escrows',
      value: stats.completedCount.toString(),
      icon: <ShieldCheck size={15} color="var(--emerald)" />,
      accentColor: 'var(--emerald)',
    },
    {
      id: 'disputes',
      label: 'Disputed Cases',
      value: stats.disputedCount.toString(),
      icon: <AlertTriangle size={15} color={stats.disputedCount > 0 ? 'var(--crimson)' : 'var(--text-faint)'} />,
      accentColor: stats.disputedCount > 0 ? 'var(--crimson)' : 'var(--text-sub)',
    },
  ];

  return (
    <div
      style={{
        marginBottom: '24px',
      }}
    >
      <SpotlightCard
        spotlightColor="rgba(0, 240, 255, 0.12)"
        style={{
          background: 'rgba(13, 16, 23, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-whisper)',
          borderRadius: '12px',
          padding: '0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          {metricItems.map((item, idx) => (
            <div
              key={item.id}
              style={{
                padding: '16px 20px',
                borderRight: idx < metricItems.length - 1 ? '1px solid var(--border-whisper)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-sub)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {item.value}
                </div>
              </div>

              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-whisper)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
            </div>
          ))}
        </div>
      </SpotlightCard>
    </div>
  );
};
