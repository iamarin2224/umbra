import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { soundFx } from '../lib/AudioEngine';
import { SpotlightCard } from './SpotlightCard';
import { EscrowStats } from '../hooks/useEscrowService';

interface LandingHeroProps {
  onLaunchApp: () => void;
  onReadArchitecture: () => void;
  isBackendOnline: boolean;
  stats: EscrowStats;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLaunchApp,
  onReadArchitecture,
  isBackendOnline,
  stats,
}) => {
  const [headlineHovered, setHeadlineHovered] = useState(false);

  return (
    <section
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        padding: '30px 0 60px',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '48px',
          alignItems: 'center',
        }}
      >
        {/* ── Left Column: Interactive Editorial Headline & Actions ── */}
        <div style={{ maxWidth: 640 }}>
          {/* Top Decorative Line */}
          <div
            style={{
              width: 44,
              height: 1.5,
              background: 'rgba(255, 255, 255, 0.4)',
              marginBottom: 20,
            }}
          />

          {/* Category Tag */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              letterSpacing: '0.18em',
              color: 'var(--text-hero)',
              textTransform: 'uppercase',
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            Umbra.
          </div>

          {/* Interactive Color-Changing Headline */}
          <h1
            onMouseEnter={() => {
              soundFx.playTick();
              setHeadlineHovered(true);
            }}
            onMouseLeave={() => setHeadlineHovered(false)}
            style={{
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              fontSize: 'clamp(42px, 6vw, 72px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: headlineHovered ? '#00f0ff' : 'var(--text-hero)',
              marginBottom: 26,
              cursor: 'pointer',
              transition: 'color 0.4s ease, text-shadow 0.4s ease',
              textShadow: headlineHovered
                ? '0 0 40px rgba(0, 240, 255, 0.45)'
                : 'none',
              userSelect: 'none',
            }}
          >
            The zero-knowledge
            <br />
            layer for private
            <br />
            settlement.
          </h1>

          {/* Interactive Monospace Tagline Narrative */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              lineHeight: 1.85,
              color: 'var(--text-sub)',
              letterSpacing: '0.04em',
              maxWidth: 540,
              marginBottom: 36,
            }}
          >
            Built on Midnight&apos;s Compact zkSNARK state machine. Umbra guarantees
            complete privacy for milestone commitments, shielded capital locking,
            and autonomous release with zero public ledger exposure.
          </p>

          {/* Actions Row */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            {/* Primary Pill Button -> Redirects to App */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                soundFx.playOpen();
                onLaunchApp();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 26px',
                borderRadius: 9999,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                color: 'var(--text-hero)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span>INITIALIZE APP</span>
              <ArrowRight size={13} />
            </motion.button>

            {/* Secondary Text Link -> Redirects to Guide */}
            <button
              onClick={() => {
                soundFx.playTick();
                onReadArchitecture();
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.1em',
                color: 'var(--text-sub)',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'color 0.15s ease',
              }}
            >
              Read Architecture
            </button>
          </div>
        </div>

        {/* ── Right Column: Telemetry & Volume Spotlight Card (Image 1 UI format) ── */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <SpotlightCard
            spotlightColor="rgba(0, 240, 255, 0.14)"
            anchorColor="rgba(0, 240, 255, 0.3)"
            style={{
              width: '100%',
              maxWidth: 480,
              borderRadius: 20,
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(0, 240, 255, 0.1)',
            }}
          >
            {/* Header: Telemetry & Volume + Synced Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 16,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: 'var(--text-faint)',
                  textTransform: 'uppercase',
                }}
              >
                Telemetry & Volume
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: isBackendOnline ? 'var(--emerald)' : 'var(--crimson)',
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: isBackendOnline ? 'var(--emerald)' : 'var(--crimson)',
                    boxShadow: isBackendOnline ? '0 0 8px var(--emerald)' : 'none',
                  }}
                />
                <span>{isBackendOnline ? 'SYNCED' : 'OFFLINE'}</span>
              </div>
            </div>

            {/* 4 Metric Rows: Shielded Volume, Active Agreements, Settled Escrows, Dispute Cases */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                marginBottom: 20,
              }}
            >
              {[
                {
                  label: 'Shielded Volume',
                  value: `${stats.totalVolume.toLocaleString()} tDUST`,
                  color: '#00f0ff',
                },
                {
                  label: 'Active Agreements',
                  value: `${stats.activeCount}`,
                  color: '#fbbf24',
                },
                {
                  label: 'Settled Escrows',
                  value: `${stats.completedCount}`,
                  color: '#10b981',
                },
                {
                  label: 'Dispute Cases',
                  value: `${stats.disputedCount}`,
                  color: stats.disputedCount > 0 ? '#fb7185' : 'var(--text-hero)',
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: 'var(--text-sub)' }}>{row.label}</span>
                  <span style={{ color: row.color || 'var(--text-hero)', fontWeight: 600 }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: 'rgba(255, 255, 255, 0.08)',
                marginBottom: 16,
              }}
            />

            {/* Code Snippet Box */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 10,
                padding: '12px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: '#a5f3fc',
                overflowX: 'auto',
                lineHeight: 1.6,
              }}
            >
              <code>
                circuit deposit(witness buyerSecret: Bytes&lt;32&gt;, val: Uint&lt;64&gt;) -&gt; Result&lt;(), ZkError&gt;
              </code>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
};
