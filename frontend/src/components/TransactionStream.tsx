import React from 'react';
import { ShieldCheck, Clock, ExternalLink, Activity, ArrowUpRight } from 'lucide-react';
import { EscrowTimelineEvent, ESCROW_STATE_LABELS } from '../types/escrow';

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
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text-faint)',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 10,
          border: '1px solid var(--border-whisper)',
        }}
      >
        No on-chain zero-knowledge transactions recorded for this contract.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {displayEvents.map((evt) => (
        <div
          key={evt.id}
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-whisper)',
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={14} color="var(--cyan)" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-hero)' }}>
                {evt.description}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-faint)',
                  marginTop: 2,
                }}
              >
                Tx: {evt.transactionHash.slice(0, 16)}...{evt.transactionHash.slice(-8)}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
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
                gap: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--cyan)',
                textDecoration: 'none',
              }}
            >
              <span>Midnight Explorer</span>
              <ArrowUpRight size={10} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};
