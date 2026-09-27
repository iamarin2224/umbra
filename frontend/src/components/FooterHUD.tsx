import React from 'react';
import { Shield, ExternalLink, Key } from 'lucide-react';

export const FooterHUD: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-whisper)',
        background: 'rgba(7, 8, 12, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '16px 24px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={14} color="var(--cyan)" />
          <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
            <strong>Umbra</strong> — Shielded Zero-Knowledge Escrow Protocol
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
