import React from 'react';
import { Shield, ExternalLink, GitBranch, Key, Activity } from 'lucide-react';

export const FooterHUD: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-whisper)',
        background: 'rgba(4, 5, 7, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '24px 32px',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={16} color="var(--cyan)" />
          <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>
            <strong>Umbra</strong> — Shielded Non-Custodial Zero-Knowledge Escrow Protocol
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-faint)',
            }}
          >
            <Key size={13} color="var(--amethyst)" />
            <span>Compact ZK v0.23</span>
          </div>

          <a
            href="https://midnight.network"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--cyan)',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            <span>Midnight Testnet</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
};
