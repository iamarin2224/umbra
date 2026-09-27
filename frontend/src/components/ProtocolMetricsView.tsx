import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Layers, Server, Activity, ShieldCheck, Zap, HardDrive, CheckCircle2 } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { CornerAnchors } from './CornerAnchors';
import { Odometer } from './Odometer';
import { EscrowStats } from '../hooks/useEscrowService';

interface ProtocolMetricsViewProps {
  stats: EscrowStats;
  isBackendOnline: boolean;
}

export const ProtocolMetricsView: React.FC<ProtocolMetricsViewProps> = ({ stats, isBackendOnline }) => {
  return (
    <motion.section
      key="stats"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Header */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-editorial)',
            fontStyle: 'italic',
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--text-hero)',
            letterSpacing: '-0.02em',
          }}
        >
          Enclave Telemetry & Cryptographic Benchmarks
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px' }}>
          Zero-knowledge prover status, indexed contract distributions, and Midnight node synchronizations.
        </p>
      </div>

      {/* Bento Grid Architecture */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {/* Prover Status & Indexing Metrics */}
        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.12)"
          anchorColor="rgba(0, 240, 255, 0.3)"
          style={{
            padding: '22px',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cpu size={16} color="var(--cyan)" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-hero)' }}>
                Halo2 SNARK Prover Pipeline
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: isBackendOnline ? 'var(--emerald)' : 'var(--gold)',
                background: isBackendOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(251, 191, 36, 0.08)',
                border: `1px solid ${isBackendOnline ? 'rgba(16, 185, 129, 0.25)' : 'rgba(251, 191, 36, 0.25)'}`,
                padding: '2px 8px',
                borderRadius: '6px',
                letterSpacing: '0.04em',
              }}
            >
              {isBackendOnline ? 'OPERATIONAL' : 'OFFLINE'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              {
                label: 'Contracts Indexed',
                val: stats.totalCount.toString(),
                pct: stats.totalCount > 0 ? 100 : 0,
                color: 'var(--cyan)',
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
                color: 'var(--crimson)',
              },
            ].map((metric) => (
              <div key={metric.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-sub)' }}>{metric.label}</span>
                  <span style={{ color: metric.color || 'var(--text-hero)', fontWeight: 600 }}>{metric.val}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.pct}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: '100%', background: metric.color || 'var(--cyan)', borderRadius: '2px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* Midnight Node & Network Telemetry */}
        <SpotlightCard
          spotlightColor="rgba(192, 132, 252, 0.12)"
          anchorColor="rgba(192, 132, 252, 0.3)"
          style={{
            padding: '22px',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(192, 132, 252, 0.1)',
                  border: '1px solid rgba(192, 132, 252, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Server size={16} color="var(--amethyst)" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-hero)' }}>
                Midnight Node Sync
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--amethyst)',
                background: 'rgba(192, 132, 252, 0.08)',
                border: '1px solid rgba(192, 132, 252, 0.25)',
                padding: '2px 8px',
                borderRadius: '6px',
                letterSpacing: '0.04em',
              }}
            >
              PREPROD-V1
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Prover Latency', val: '~420ms', sub: 'Halo2 Client Circuit' },
              { label: 'Witness Size', val: '256 Bytes', sub: 'BLS12-381 Curve' },
              { label: 'Ledger Engine', val: 'Compact 0.23', sub: 'Native ZK Runtime' },
              { label: 'Token Standard', val: 'tDUST Shielded', sub: 'Domain Masked Coin' },
            ].map((nodeInfo) => (
              <div
                key={nodeInfo.label}
                className="hairline-card"
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                }}
              >
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                  {nodeInfo.label}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-hero)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {nodeInfo.val}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-sub)', marginTop: '2px' }}>
                  {nodeInfo.sub}
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </div>
    </motion.section>
  );
};
