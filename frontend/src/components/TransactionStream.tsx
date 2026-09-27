import React from 'react';
import { Activity, ArrowUpRight } from 'lucide-react';
import { EscrowTimelineEvent } from '../types/escrow';

interface TransactionStreamProps {
  events: EscrowTimelineEvent[];
  escrowId?: string;
}

export const TransactionStream: React.FC<TransactionStreamProps> = ({ events, escrowId }) => {
  const displayEvents = escrowId ? events.filter((e) => e.escrowId === escrowId) : events;

  if (displayEvents.length === 0) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-faint)',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 8,
          border: '1px solid var(--border-whisper)',
        }}
      >
        No on-chain zero-knowledge transactions recorded for this contract.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {displayEvents.map((evt) => (
        <div
          key={evt.id}
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-whisper)',
            borderRadius: 8,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={13} color="var(--cyan)" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#ffffff' }}>
                {evt.description}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--text-faint)',
                  marginTop: 1,
                }}
              >
                Tx: {evt.transactionHash.slice(0, 12)}...{evt.transactionHash.slice(-6)}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-faint)',
              }}
            >
              {new Date(evt.timestamp).toLocaleTimeString()}
            </span>
            <a
              href={`https://explorer.preprod.midnight.network/tx/${evt.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--cyan)',
                textDecoration: 'none',
              }}
            >
              <span>Explorer</span>
              <ArrowUpRight size={9} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};
