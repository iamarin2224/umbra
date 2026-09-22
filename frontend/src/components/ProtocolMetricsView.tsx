import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Cpu, Database, Zap, Layers, Server } from 'lucide-react';
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
    >
      <div style={{ marginBottom: '32px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--cyan)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          Prover Telemetry &amp; Enclave Benchmarks
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginTop: '6px' }}>
          Enclave Performance Metrics
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '6px' }}>
          Cryptographic benchmark latency, zero-knowledge test verification, and on-chain state machine telemetry.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Halo2 Prover Benchmark Card */}
        <SpotlightCard className="fluid-glass-panel" spotlightColor="rgba(0, 229, 255, 0.2)">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={16} color="var(--cyan)" />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600 }}>
                Halo2 SNARK Prover
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: isBackendOnline ? 'var(--emerald)' : 'var(--gold)',
                background: isBackendOnline ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                padding: '2px 8px',
                borderRadius: 6,
              }}
            >
              {isBackendOnline ? '100% ONLINE' : 'SIMULATED MOCK'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {[
              { label: 'Prover Synthesis Latency', val: '1.42s', pct: '65%' },
              { label: 'Compact Test Verification', val: '100 / 100', pct: '100%', color: 'var(--emerald)' },
              { label: 'Constraint Gate Count', val: '4,096 gates', pct: '45%' },
              { label: 'Proof Server Port', val: ':6300', pct: '100%', color: 'var(--cyan)' },
            ].map((meter, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-whisper)',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-sub)' }}>
                    {meter.label}
                  </div>
                  <div
                    style={{
                      width: '130px',
                      height: '3px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '2px',
                      marginTop: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: meter.pct,
                        background: 'linear-gradient(90deg, var(--cyan), var(--amethyst))',
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: meter.color || 'var(--text-hero)',
                  }}
                >
                  {meter.val}
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* Settlement Distribution Card */}
        <SpotlightCard className="fluid-glass-panel" spotlightColor="rgba(192, 132, 252, 0.2)">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={16} color="var(--amethyst)" />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600 }}>
                Settlement Distribution
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)' }}>
              {stats.totalVolume.toLocaleString()} tDUST
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '20px', lineHeight: 1.6 }}>
            Active distribution of smart contract state machine instances across Midnight Preprod:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'ACTIVE', count: stats.activeCount.toString(), sub: 'Funded / Delivery', color: 'var(--gold)' },
              { label: 'SETTLED', count: stats.completedCount.toString(), sub: 'Zero disclosure', color: 'var(--emerald)' },
              { label: 'DISPUTED', count: stats.disputedCount.toString(), sub: 'In Arbitration', color: 'var(--crimson)' },
            ].map((node, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-whisper)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: node.color }}>{node.label}</span>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '26px',
                    fontWeight: 700,
                    color: node.color,
                    margin: '4px 0',
                  }}
                >
                  {node.count}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{node.sub}</span>
              </div>
            ))}
          </div>

          {/* Enclave Health Box */}
          <div
            style={{
              marginTop: '18px',
              padding: '14px 16px',
              borderRadius: 12,
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-whisper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-sub)' }}>
              <Server size={14} color="var(--cyan)" />
              <span>Midnight Network API Enclave</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: isBackendOnline ? 'var(--emerald)' : 'var(--gold)',
              }}
            >
              {isBackendOnline ? 'Preprod Sync Active' : 'Local Standalone'}
            </span>
          </div>
        </SpotlightCard>
      </div>
    </motion.section>
  );
};
