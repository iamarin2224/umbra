import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Inbox,
  Plus,
} from 'lucide-react';
import { EscrowRecord, EscrowState, EscrowFilter, EscrowActionType } from '../types/escrow';
import { EscrowCard } from './EscrowCard';

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
    { id: 'all', label: 'All' },
    { id: EscrowState.Created, label: 'Created' },
    { id: EscrowState.Funded, label: 'Funded' },
    { id: EscrowState.Delivered, label: 'Delivered' },
    { id: EscrowState.Released, label: 'Settled' },
    { id: EscrowState.Disputed, label: 'Disputed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Cohesive Full-Width Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          background: 'rgba(13, 16, 23, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-whisper)',
          borderRadius: 12,
          padding: '8px 12px',
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
            borderRadius: 8,
            padding: '6px 12px',
            minWidth: 240,
            flex: '1 1 240px',
            maxWidth: 360,
          }}
        >
          <Search size={14} color="var(--text-faint)" />
          <input
            type="text"
            placeholder="Filter by ID, address, condition..."
            value={filter.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
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
                onClick={() => onFilterChange({ ...filter, state: opt.id })}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: isSelected ? '1px solid rgba(0, 240, 255, 0.35)' : '1px solid transparent',
                  background: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                  color: isSelected ? 'var(--cyan)' : 'var(--text-sub)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Escrow Cards */}
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
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
            padding: '56px 24px',
            textAlign: 'center',
            background: 'rgba(13, 16, 23, 0.4)',
            border: '1px dashed var(--border-whisper)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-whisper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Inbox size={20} color="var(--text-faint)" />
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 600, color: '#ffffff' }}>
              No Escrow Contracts Found
            </h4>
            <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 4, maxWidth: 360 }}>
              No contracts match the active filter. Deploy a new shielded agreement to initiate on-chain settlement.
            </p>
          </div>
          {onCreateClick && (
            <button
              onClick={onCreateClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #00f0ff, #00b4d8)',
                color: '#07080c',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              <span>Deploy Escrow</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
