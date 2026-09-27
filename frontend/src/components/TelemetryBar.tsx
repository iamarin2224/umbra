import React from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  ShieldCheck,
  Flame,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { EscrowStats } from '../hooks/useEscrowService';
import { SpotlightCard } from './SpotlightCard';
import { Odometer } from './Odometer';

interface TelemetryBarProps {
  stats: EscrowStats;
  isBackendOnline: boolean;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ stats }) => {
  const metricItems = [
    {
      id: 'tvl',
      label: 'Shielded Volume',
      value: stats.totalVolume,
      suffix: ' tDUST',
      icon: <Coins size={14} color="#00f0ff" />,
      accentColor: '#00f0ff',
      tag: 'LOCKED',
    },
    {
      id: 'active',
      label: 'Active Agreements',
      value: stats.activeCount,
      suffix: '',
      icon: <Flame size={14} color="#fbbf24" />,
      accentColor: '#fbbf24',
      tag: 'IN ENCLAVE',
    },
    {
      id: 'settled',
      label: 'Settled Escrows',
      value: stats.completedCount,
      suffix: '',
      icon: <ShieldCheck size={14} color="#10b981" />,
      accentColor: '#10b981',
      tag: 'ZERO-LEAK',
    },
    {
      id: 'disputes',
      label: 'Dispute Cases',
      value: stats.disputedCount,
      suffix: '',
      icon: (
        <AlertTriangle
          size={14}
          color={stats.disputedCount > 0 ? '#fb7185' : 'var(--text-faint)'}
        />
      ),
      accentColor: stats.disputedCount > 0 ? '#fb7185' : 'var(--text-sub)',
      tag: stats.disputedCount > 0 ? 'ARBITRATION' : 'CLEAN',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}
    >
      {metricItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <SpotlightCard
            spotlightColor={`${item.accentColor}22`}
            anchorColor={`${item.accentColor}44`}
            style={{
              padding: '14px 18px',
              borderRadius: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: `${item.accentColor}15`,
                    border: `1px solid ${item.accentColor}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-sub)',
                  }}
                >
                  {item.label}
                </span>
              </div>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: item.accentColor,
                  background: `${item.accentColor}12`,
                  padding: '1px 6px',
                  borderRadius: 4,
                  border: `1px solid ${item.accentColor}25`,
                  letterSpacing: '0.05em',
                }}
              >
                {item.tag}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontStyle: 'italic',
                  fontSize: 24,
                  fontWeight: 800,
                  color: 'var(--text-hero)',
                  letterSpacing: '-0.02em',
                }}
              >
                <Odometer value={item.value} />
              </span>
              {item.suffix && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: item.accentColor,
                    fontWeight: 600,
                  }}
                >
                  {item.suffix}
                </span>
              )}
            </div>
          </SpotlightCard>
        </motion.div>
      ))}
    </div>
  );
};
