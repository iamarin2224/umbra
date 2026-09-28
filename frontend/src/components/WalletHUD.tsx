import React, { useState, useRef, useEffect } from 'react';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { Copy, Check, ShieldCheck, Power, Wallet, ChevronDown, ExternalLink, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WalletHUD: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    address,
    shortAddress,
    networkId,
    error,
    connect,
    disconnect,
  } = useMidnightWallet();

  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => connect()}
          disabled={isConnecting}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#ffffff',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            padding: '7px 20px',
            borderRadius: 9999,
            cursor: isConnecting ? 'wait' : 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'uppercase',
          }}
        >
          {isConnecting ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span>CONNECTING...</span>
            </>
          ) : (
            <span>CONNECT</span>
          )}
        </button>

        {error && (
          <div
            title={error}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--crimson)',
              cursor: 'help',
            }}
          >
            <AlertCircle size={14} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Wallet Trigger Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#ffffff',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          padding: '6px 14px',
          borderRadius: 9999,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--emerald)',
            boxShadow: '0 0 6px var(--emerald)',
          }}
        />
        <span>{shortAddress || 'Shielded'}</span>
        <ChevronDown
          size={12}
          color="var(--text-sub)"
          style={{
            transform: dropdownOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Floating Dropdown Menu */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: '290px',
              background: 'rgba(11, 14, 20, 0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--border-sheen)',
              borderRadius: '12px',
              padding: '14px',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
              zIndex: 200,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-faint)',
                }}
              >
                Connected Enclave
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--cyan)',
                  background: 'rgba(0, 240, 255, 0.08)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {networkId}
              </span>
            </div>

            {/* Address Display & Copy */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-whisper)',
                borderRadius: '8px',
                padding: '8px 10px',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                  Wallet Address
                </span>
                <button
                  onClick={() => handleCopy(address || '')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copied ? 'var(--emerald)' : 'var(--cyan)',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-hero)',
                  wordBreak: 'break-all',
                }}
              >
                {address}
              </div>
            </div>

            {/* External Explorer Links & Disconnect */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-whisper)',
              }}
            >
              <a
                href="https://explorer.preprod.midnight.network"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '11px',
                  color: 'var(--text-sub)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Explorer</span>
                <ExternalLink size={10} />
              </a>

              <button
                onClick={() => {
                  disconnect();
                  setDropdownOpen(false);
                }}
                style={{
                  background: 'rgba(251, 113, 133, 0.08)',
                  border: '1px solid rgba(251, 113, 133, 0.25)',
                  color: 'var(--crimson)',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Power size={11} />
                <span>Disconnect</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
