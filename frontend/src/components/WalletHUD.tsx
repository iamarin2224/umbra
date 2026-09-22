import React, { useState, useRef, useEffect } from 'react';
import { useMidnightWallet, DEMO_BUYER_ADDRESS, DEMO_SELLER_ADDRESS } from '../context/MidnightWalletContext';
import { Copy, Check, ShieldCheck, Power, Wallet, ChevronDown, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WalletHUD: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    address,
    shortAddress,
    networkId,
    availableWallets,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b' }} />
          <span>{networkId.toUpperCase()}</span>
        </div>

        <button
          onClick={() => connect()}
          disabled={isConnecting}
          style={{
            background: 'rgba(0, 240, 255, 0.12)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            color: 'var(--cyan)',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 16px',
            borderRadius: '9999px',
            cursor: isConnecting ? 'wait' : 'pointer',
            transition: 'all 0.3s var(--ease-apple)',
            boxShadow: '0 0 16px rgba(0, 240, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isConnecting ? (
            <>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', border: '2px solid var(--cyan)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet size={12} />
              <span>Connect Lace</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Network Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--emerald)' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 8px var(--emerald)' }} />
        <span>SHIELDED</span>
      </div>

      {/* Wallet Trigger Pill */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          background: 'rgba(52, 211, 153, 0.12)',
          border: '1px solid rgba(52, 211, 153, 0.35)',
          color: 'var(--emerald)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 500,
          padding: '6px 14px',
          borderRadius: '9999px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.25s var(--ease-apple)',
          boxShadow: '0 0 12px rgba(52, 211, 153, 0.12)',
        }}
      >
        <ShieldCheck size={13} />
        <span>{shortAddress || 'Shielded Enclave'}</span>
        <ChevronDown size={12} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {/* Floating HUD Dropdown Menu */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '320px',
              background: 'rgba(12, 14, 20, 0.92)',
              backdropFilter: 'blur(28px) saturate(190%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%)',
              border: '1px solid var(--border-sheen)',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 240, 255, 0.08)',
              zIndex: 200,
            }}
          >
            {/* Header / Network */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-whisper)', paddingBottom: '10px', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)' }}>
                Midnight Shielded Enclave
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan)', background: 'rgba(0, 240, 255, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                {networkId}
              </span>
            </div>

            {/* Address Display & Copy */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-whisper)', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Wallet Address</span>
                <button
                  onClick={() => handleCopy(address || '')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copied ? 'var(--emerald)' : 'var(--cyan)',
                    fontSize: '11px',
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-hero)', wordBreak: 'break-all' }}>
                {address}
              </div>
            </div>

            {/* Quick Demo Switchers */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Simulate Enclave Role
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => {
                    localStorage.setItem('umbra_wallet_address', DEMO_BUYER_ADDRESS);
                    window.location.reload();
                  }}
                  style={{
                    background: address === DEMO_BUYER_ADDRESS ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${address === DEMO_BUYER_ADDRESS ? 'var(--cyan)' : 'var(--border-whisper)'}`,
                    color: 'var(--text-hero)',
                    fontSize: '11px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Buyer Profile
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('umbra_wallet_address', DEMO_SELLER_ADDRESS);
                    window.location.reload();
                  }}
                  style={{
                    background: address === DEMO_SELLER_ADDRESS ? 'rgba(192, 132, 252, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${address === DEMO_SELLER_ADDRESS ? 'var(--amethyst)' : 'var(--border-whisper)'}`,
                    color: 'var(--text-hero)',
                    fontSize: '11px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Seller Profile
                </button>
              </div>
            </div>

            {/* External Lace Links & Disconnect */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-whisper)', paddingTop: '10px' }}>
              <a
                href="https://explorer.preprod.midnight.network"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '11px', color: 'var(--text-sub)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
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
                  background: 'rgba(251, 113, 133, 0.12)',
                  border: '1px solid rgba(251, 113, 133, 0.3)',
                  color: 'var(--crimson)',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '5px 12px',
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
