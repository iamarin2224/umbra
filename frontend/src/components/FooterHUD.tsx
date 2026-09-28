import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { soundFx } from '../lib/AudioEngine';

interface FooterHUDProps {
  onNavigateTab?: (tab: 'home' | 'app' | 'circuits' | 'guide') => void;
}

export const FooterHUD: React.FC<FooterHUDProps> = ({
  onNavigateTab,
}) => {
  return (
    <footer
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(6, 8, 12, 0.1) 0%, rgba(6, 8, 12, 0.8) 18%, rgba(4, 5, 8, 0.96) 100%)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '64px 24px 36px',
        overflow: 'hidden',
        zIndex: 20,
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Top Grid: Brand & Links */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 48,
            marginBottom: 48,
          }}
        >
          {/* Brand Column */}
          <div style={{ maxWidth: 440 }}>
            <h2
              style={{
                fontFamily: 'var(--font-editorial)',
                fontStyle: 'italic',
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                marginBottom: 14,
                lineHeight: 1,
              }}
            >
              Umbra
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-sub)',
                letterSpacing: '0.08em',
                lineHeight: 1.8,
                textTransform: 'uppercase',
              }}
            >
              The cryptographic standard for shielded zero-knowledge escrow settlement on the Midnight network.
            </p>
          </div>

          {/* Protocol Links */}
          <div>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-faint)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              Protocol
            </span>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                padding: 0,
                margin: 0,
              }}
            >
              <li>
                <button
                  onClick={() => {
                    soundFx.playTick();
                    onNavigateTab?.('guide');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--text-hero)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'color 0.15s ease',
                  }}
                >
                  <span>Architecture Guide & Spec</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    soundFx.playTick();
                    onNavigateTab?.('circuits');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--text-hero)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'color 0.15s ease',
                  }}
                >
                  <span>Circuit Enclave Lab</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    soundFx.playTick();
                    onNavigateTab?.('app');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--text-hero)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'color 0.15s ease',
                  }}
                >
                  <span>Live App & Enclaves</span>
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/iamarin2224/umbra"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--text-hero)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'color 0.15s ease',
                  }}
                >
                  <span>Github Repository</span>
                  <ArrowUpRight size={11} color="var(--text-faint)" />
                </a>
              </li>
            </ul>
          </div>

          {/* Network Status */}
          <div>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-faint)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              Network
            </span>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                padding: 0,
                margin: 0,
              }}
            >
              {[
                { name: 'Midnight Preprod', detail: 'Chain ID: preprod' },
                { name: 'Compact ZK Compiler', detail: 'v0.23 Runtime' },
                { name: 'Halo2 SNARK Prover', detail: 'Client Enclave' },
              ].map((item) => (
                <li
                  key={item.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--text-hero)',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--emerald)',
                      boxShadow: '0 0 8px var(--emerald)',
                      flexShrink: 0,
                    }}
                  />
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Clear & Majestic Watermark Typography */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            userSelect: 'none',
            pointerEvents: 'none',
            textAlign: 'center',
            lineHeight: 0.85,
            margin: '20px 0',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              fontSize: 'clamp(80px, 16vw, 220px)',
              fontWeight: 900,
              letterSpacing: '0.1em',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.04) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block',
              whiteSpace: 'nowrap',
              filter: 'drop-shadow(0 0 30px rgba(0, 240, 255, 0.1))',
            }}
          >
            U M B R A
          </span>
        </div>

        {/* Thin Divider Line */}
        <div
          style={{
            width: '100%',
            height: 1,
            background: 'rgba(255, 255, 255, 0.12)',
            marginBottom: 24,
          }}
        />

        {/* Bottom Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-faint)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          <div>© 2026 UMBRA</div>
          <div>ZERO-KNOWLEDGE ENCLAVE ON MIDNIGHT</div>
        </div>
      </div>
    </footer>
  );
};
