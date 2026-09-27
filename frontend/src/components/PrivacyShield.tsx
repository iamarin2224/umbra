import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PrivacyShieldProps {
  value: string;
  isAddress?: boolean;
  label?: string;
  defaultObscured?: boolean;
}

export const PrivacyShield: React.FC<PrivacyShieldProps> = ({
  value,
  isAddress = false,
  label,
  defaultObscured = true,
}) => {
  const [obscured, setObscured] = useState<boolean>(defaultObscured);

  const formatDisplay = (val: string) => {
    if (!val) return '—';
    if (obscured) {
      if (isAddress) {
        return `${val.slice(0, 6)}••••${val.slice(-4)}`;
      }
      return '••••••••••••';
    }
    if (isAddress && val.length > 20) {
      return `${val.slice(0, 8)}...${val.slice(-6)}`;
    }
    return val;
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '3px 8px',
        borderRadius: 6,
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-whisper)',
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        color: obscured ? 'var(--text-sub)' : 'var(--text-hero)',
        maxWidth: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
        {label && <span style={{ color: 'var(--text-faint)', fontSize: 10 }}>{label}:</span>}
        <span style={{ letterSpacing: obscured ? '0.05em' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {formatDisplay(value)}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setObscured(!obscured);
        }}
        title={obscured ? 'Reveal shielded value' : 'Shield value'}
        style={{
          background: 'none',
          border: 'none',
          color: obscured ? 'var(--text-faint)' : 'var(--cyan)',
          cursor: 'pointer',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {obscured ? <EyeOff size={11} /> : <Eye size={11} />}
      </button>
    </div>
  );
};
