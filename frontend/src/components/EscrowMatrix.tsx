import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Layers,
  Inbox,
  Sparkles,
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
  const filterOptions: Array<{ id: EscrowState | 'all'; label: string; count?: number }> = [
    { id: 'all', label: 'All Agreements' },
    { id: EscrowState.Created, label: 'Created' },
    { id: EscrowState.Funded, label: 'Funded' },
    { id: EscrowState.Delivered, label: 'Delivered' },
    { id: EscrowState.Released, label: 'Settled' },
    { id: EscrowState.Disputed, label: 'Disputed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          background: 'rgba(14, 16, 24, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-whisper)',
          borderRadius: 16,
          padding: '12px 18px',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-whisper)',
            borderRadius: 10,
            padding: '8px 14px',
            minWidth: 260,
            flex: '1 1 260px',
            maxWidth: 400,
          }}
        >
          <Search size={16} color="var(--text-faint)" />
          <input
            type="text"
            placeholder="Search by ID, contract hash, condition..."
            value={filter.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-hero)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              width: '100%',
            }}
          />
        </div>

        {/* State Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {filterOptions.map((opt) => {
            const isSelected = (filter.state ?? 'all') === opt.id;
            return (
              <button
                key={String(opt.id)}
                onClick={() => onFilterChange({ ...filter, state: opt.id })}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: isSelected ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid var(--border-whisper)',
                  background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  color: isSelected ? 'var(--cyan)' : 'var(--text-sub)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 20,
          }}
        >
          <AnimatePresence>
            {escrows.map((escrow) => (
              <motion.div
                key={escrow.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
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
            padding: '64px 32px',
            textAlign: 'center',
            background: 'rgba(14, 16, 24, 0.4)',
            border: '1px dashed var(--border-whisper)',
            borderRadius: 18,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-whisper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Inbox size={24} color="var(--text-faint)" />
          </div>
          <div>
            <h4 style={{ fontSize: 16, fontFamily: 'var(--font-display)', color: 'var(--text-hero)' }}>
              No Escrow Contracts Found
            </h4>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4, maxWidth: 400 }}>
              No zero-knowledge escrow agreements match the selected status or query. Deploy a new contract to initialize
              the state machine.
            </p>
          </div>
          {onCreateClick && (
            <button
              onClick={onCreateClick}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #00f0ff, #0099ff)',
                color: '#000000',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Deploy First Escrow
            </button>
          )}
        </div>
      )}
    </div>
  );
};
