import React from 'react';
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { EscrowState, ESCROW_STATE_LABELS } from '../types/escrow';

interface StateFlowVisualizerProps {
  currentState: EscrowState;
}

export const StateFlowVisualizer: React.FC<StateFlowVisualizerProps> = ({ currentState }) => {
  const nodes = [
    { state: EscrowState.Created, label: 'Created', circuit: 'deposit()' },
    { state: EscrowState.Funded, label: 'Funded', circuit: 'confirmDelivery()' },
    { state: EscrowState.Delivered, label: 'Delivered', circuit: 'release()' },
    { state: EscrowState.Released, label: 'Settled', circuit: 'settled' },
  ];

  const isDisputed = currentState === EscrowState.Disputed;
  const isResolved = currentState === EscrowState.Resolved;
  const isCancelled = currentState === EscrowState.Cancelled;

  return (
    <div
      style={{
        background: 'rgba(8, 10, 16, 0.6)',
        border: '1px solid var(--border-whisper)',
        borderRadius: 10,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--cyan)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          State Machine Progression
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>
          Current: <strong style={{ color: '#ffffff' }}>{ESCROW_STATE_LABELS[currentState]}</strong>
        </span>
      </div>

      {/* Main Sequential Pipeline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}
      >
        {nodes.map((node) => {
          const isPassed = !isDisputed && !isCancelled && currentState > node.state;
          const isCurrent = currentState === node.state;
          const isUpcoming = currentState < node.state;

          return (
            <div
              key={node.state}
              style={{
                background: isCurrent
                  ? 'rgba(0, 240, 255, 0.08)'
                  : isPassed
                  ? 'rgba(52, 211, 153, 0.05)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: isCurrent
                  ? '1px solid rgba(0, 240, 255, 0.35)'
                  : isPassed
                  ? '1px solid rgba(52, 211, 153, 0.2)'
                  : '1px solid var(--border-whisper)',
                borderRadius: 8,
                padding: '8px 10px',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {isPassed && <CheckCircle2 size={12} color="var(--emerald)" />}
                {isCurrent && <PlayCircle size={12} color="var(--cyan)" />}
                {isUpcoming && <Clock size={12} color="var(--text-faint)" />}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isCurrent ? 'var(--cyan)' : isPassed ? 'var(--emerald)' : 'var(--text-faint)',
                  }}
                >
                  {node.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alternative Branches: Dispute / Resolve / Cancel */}
      {(isDisputed || isResolved || isCancelled) && (
        <div
          style={{
            background: isDisputed
              ? 'rgba(251, 113, 133, 0.08)'
              : isCancelled
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(52, 211, 153, 0.08)',
            border: isDisputed
              ? '1px solid rgba(251, 113, 133, 0.25)'
              : isCancelled
              ? '1px solid var(--border-whisper)'
              : '1px solid rgba(52, 211, 153, 0.25)',
            borderRadius: 8,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {isDisputed && <AlertTriangle size={14} color="var(--crimson)" />}
          {isResolved && <CheckCircle2 size={14} color="var(--emerald)" />}
          {isCancelled && <XCircle size={14} color="var(--text-faint)" />}

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: isDisputed ? 'var(--crimson)' : isResolved ? 'var(--emerald)' : 'var(--text-sub)' }}>
            Branch: {isDisputed ? 'Arbitration in Progress' : isResolved ? 'Arbiter Resolution Complete' : 'Contract Cancelled'}
          </div>
        </div>
      )}
    </div>
  );
};
