import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Inbox,
  Plus,
  Shield,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';
import { EscrowRecord, EscrowState, EscrowFilter, EscrowActionType } from '../types/escrow';
import { EscrowCard } from './EscrowCard';
import { CornerAnchors } from './CornerAnchors';
import { soundFx } from '../lib/AudioEngine';

interface EscrowMatrixProps {
  escrows: EscrowRecord[];
  filter: EscrowFilter;
  onFilterChange: (filter: EscrowFilter) => void;
  onSelectEscrow: (escrow: EscrowRecord) => void;
  onAction: (escrow: EscrowRecord, action: EscrowActionType) => void;
  isActionLoading?: boolean;
  onCreateClick?: () => void;
}

export const EscrowMatrix: React.FC<EscrowMatrixProps> = ({
  escrows,
  filter,
  onFilterChange,
  onSelectEscrow,
  onAction,
  isActionLoading = false,
  onCreateClick,
}) => {
  const filterOptions: Array<{ id: EscrowState | 'all'; label: string }> = [
    { id: 'all', label: 'All Enclaves' },
    { id: EscrowState.Created, label: 'Created' },
    { id: EscrowState.Funded, label: 'Funded' },
    { id: EscrowState.Delivered, label: 'Delivered' },
    { id: EscrowState.Released, label: 'Settled' },
    { id: EscrowState.Disputed, label: 'Disputed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Linear Architecture Stepper Strip ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
        }}
      >
        {[
          {
            step: '01',
            title: 'Commitment Hash',
            desc: 'Capital locked as persistentHash witness in Compact ledger',
            color: 'var(--cyan)',
          },
          {
            step: '02',
            title: 'Milestone Proof',
            desc: 'Off-chain witness verified via Halo2 zkSNARK circuits',
            color: 'var(--amethyst)',
          },
          {
            step: '03',
            title: 'Shielded Settlement',
            desc: 'Autonomous coin distribution with zero metadata leakage',
            color: 'var(--emerald)',
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="hairline-card"
            style={{
              position: 'relative',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              borderRadius: 12,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                color: item.color,
                background: `${item.color}15`,
                border: `1px solid ${item.color}35`,
                padding: '3px 8px',
                borderRadius: 6,
              }}
            >
              {item.step}
            </span>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-hero)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-sub)',
                  marginTop: 2,
                  lineHeight: 1.4,
                }}
              >
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Cohesive Bento Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          background: 'var(--glass-base)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--border-whisper)',
          borderRadius: 14,
          padding: '10px 14px',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-whisper)',
            borderRadius: 10,
            padding: '7px 14px',
            minWidth: 260,
            flex: '1 1 260px',
            maxWidth: 380,
          }}
        >
          <Search size={14} color="var(--cyan)" />
          <input
            type="text"
            placeholder="Search enclave ID, addresses, witnesses..."
            value={filter.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-hero)',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              width: '100%',
            }}
          />
        </div>

        {/* State Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {filterOptions.map((opt) => {
            const isSelected = (filter.state ?? 'all') === opt.id;
            return (
              <button
                key={String(opt.id)}
                onClick={() => {
                  soundFx.playTick();
                  onFilterChange({ ...filter, state: opt.id });
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: isSelected ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                  background: isSelected ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                  color: isSelected ? 'var(--cyan)' : 'var(--text-sub)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: isSelected ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.02em',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bento Grid of Escrow Cards ── */}
      {escrows.length > 0 ? (
        <motion.div
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          <AnimatePresence>
            {escrows.map((escrow) => (
              <motion.div
                key={escrow.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <EscrowCard
                  escrow={escrow}
                  onSelect={onSelectEscrow}
                  onAction={onAction}
                  isActionLoading={isActionLoading}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <div
          style={{
            padding: '56px 20px',
            textAlign: 'center',
            background: 'var(--glass-base)',
            border: '1px dashed var(--border-sheen)',
            borderRadius: 16,
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Inbox size={22} color="var(--cyan)" />
          </div>
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-editorial)',
                fontStyle: 'italic',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-hero)',
              }}
            >
              No Escrow Enclaves Found
            </h4>
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-sub)',
                marginTop: 4,
                maxWidth: 420,
              }}
            >
              No on-chain agreements match your current filter criteria or search query.
            </p>
          </div>

          {onCreateClick && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                soundFx.playOpen();
                onCreateClick();
              }}
              style={{
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%)',
                color: '#06080c',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)',
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Deploy First Escrow</span>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};
