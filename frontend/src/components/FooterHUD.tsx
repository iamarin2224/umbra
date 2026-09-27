import React from 'react';
import { Shield, ExternalLink, Key, Cpu } from 'lucide-react';

export const FooterHUD: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-whisper)',
        background: 'var(--glass-base)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        padding: '16px 24px',
        position: 'relative',
        zIndex: 20,
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={12} color="var(--cyan)" />
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
            <strong style={{ color: 'var(--text-hero)', fontFamily: 'var(--font-editorial)', fontStyle: 'italic' }}>
              Umbra
            </strong>{' '}
            — Shielded Zero-Knowledge Escrow Protocol
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-faint)',
            }}
          >
            <Key size={12} color="var(--amethyst)" />
            <span>Compact ZK v0.23</span>
          </div>

          <a
            href="https://midnight.network"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--cyan)',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            <span>Midnight Testnet</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </footer>
  );
};
