import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

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
        return `${val.slice(0, 8)}••••••••••••••••••••••••${val.slice(-6)}`;
      }
      return '••••••••••••••••';
    }
    if (isAddress && val.length > 24) {
      return `${val.slice(0, 12)}...${val.slice(-10)}`;
    }
    return val;
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 8px',
        borderRadius: 6,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: 12,
        fontFamily: 'var(--font-mono)',
        color: obscured ? 'var(--text-sub)' : 'var(--text-hero)',
        maxWidth: '100%',
      }}
    >
      {label && <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>{label}:</span>}
      <span style={{ letterSpacing: obscured ? '0.1em' : 'normal', wordBreak: 'break-all' }}>
        {formatDisplay(value)}
      </span>
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
        }}
      >
        {obscured ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
};
