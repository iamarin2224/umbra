import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Layers, Server } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import { EscrowStats } from '../hooks/useEscrowService';

interface ProtocolMetricsViewProps {
  stats: EscrowStats;
  isBackendOnline: boolean;
}

export const ProtocolMetricsView: React.FC<ProtocolMetricsViewProps> = ({ stats, isBackendOnline }) => {
  return (
    <motion.section
      key="stats"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>
          Enclave Telemetry & Benchmarks
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px' }}>
          Zero-knowledge prover status, indexed contract distributions, and Midnight node synchronizations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {/* Prover Status & Indexing Metrics */}
        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.12)"
          style={{
            background: 'rgba(13, 16, 23, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-whisper)',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={15} color="var(--cyan)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                Halo2 SNARK Prover Pipeline
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: isBackendOnline ? 'var(--emerald)' : 'var(--gold)',
                background: isBackendOnline ? 'rgba(52, 211, 153, 0.08)' : 'rgba(251, 191, 36, 0.08)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {isBackendOnline ? 'Operational' : 'Offline'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                label: 'Contracts Indexed',
                val: stats.totalCount.toString(),
                pct: stats.totalCount > 0 ? 100 : 0,
              },
              {
                label: 'Settlement Ratio',
                val: `${stats.totalCount > 0 ? Math.round((stats.completedCount / stats.totalCount) * 100) : 0}%`,
                pct: stats.totalCount > 0 ? Math.round((stats.completedCount / stats.totalCount) * 100) : 0,
                color: 'var(--emerald)',
              },
              {
                label: 'Dispute Ratio',
                val: `${stats.totalCount > 0 ? Math.round((stats.disputedCount / stats.totalCount) * 100) : 0}%`,
                pct: stats.totalCount > 0 ? Math.round((stats.disputedCount / stats.totalCount) * 100) : 0,
                color: stats.disputedCount > 0 ? 'var(--crimson)' : 'var(--text-sub)',
              },
            ].map((metric, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-whisper)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                    {metric.label}
                  </span>
                  <span style={{ fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: 700, color: metric.color || '#ffffff' }}>
                    {metric.val}
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${metric.pct}%`,
                      background: 'linear-gradient(90deg, var(--cyan), var(--amethyst))',
                      borderRadius: '2px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* State Machine Distribution */}
        <SpotlightCard
          spotlightColor="rgba(192, 132, 252, 0.12)"
          style={{
            background: 'rgba(13, 16, 23, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-whisper)',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={15} color="var(--amethyst)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                Settlement State Distribution
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)' }}>
              {stats.totalVolume.toLocaleString()} tDUST
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Active', count: stats.activeCount.toString(), color: 'var(--gold)' },
              { label: 'Settled', count: stats.completedCount.toString(), color: 'var(--emerald)' },
              { label: 'Disputed', count: stats.disputedCount.toString(), color: 'var(--crimson)' },
            ].map((node, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-whisper)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: node.color, textTransform: 'uppercase' }}>
                  {node.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: node.color,
                    marginTop: '2px',
                  }}
                >
                  {node.count}
                </div>
              </div>
            ))}
          </div>

          {/* Enclave Health Footer */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-whisper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: 'var(--text-sub)' }}>
              <Server size={13} color="var(--cyan)" />
              <span>Midnight Network Preprod Enclave</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: isBackendOnline ? 'var(--emerald)' : 'var(--gold)',
              }}
            >
              {isBackendOnline ? 'Synced' : 'Connecting'}
            </span>
          </div>
        </SpotlightCard>
      </div>
    </motion.section>
  );
};
