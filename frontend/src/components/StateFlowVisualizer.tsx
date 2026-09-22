import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  AlertTriangle,
  XCircle,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';
import { EscrowState, ESCROW_STATE_LABELS } from '../types/escrow';

interface StateFlowVisualizerProps {
  currentState: EscrowState;
}

export const StateFlowVisualizer: React.FC<StateFlowVisualizerProps> = ({ currentState }) => {
  // Linear & branch representations of the Compact ZK state machine
  const nodes = [
    {
      state: EscrowState.Created,
      label: 'Created',
      circuit: 'deposit()',
      desc: 'Enclave deployment',
    },
    {
      state: EscrowState.Funded,
      label: 'Funded',
      circuit: 'confirmDelivery()',
      desc: 'Capital locked',
    },
    {
      state: EscrowState.Delivered,
      label: 'Delivered',
      circuit: 'release()',
      desc: 'Milestone verified',
    },
    {
      state: EscrowState.Released,
      label: 'Settled',
      circuit: 'settled',
      desc: 'Shielded payout',
    },
  ];

  const isTerminal =
    currentState === EscrowState.Released ||
    currentState === EscrowState.Resolved ||
    currentState === EscrowState.Cancelled;

  const isDisputed = currentState === EscrowState.Disputed;
  const isResolved = currentState === EscrowState.Resolved;
  const isCancelled = currentState === EscrowState.Cancelled;

  return (
    <div
      style={{
        background: 'rgba(8, 10, 16, 0.65)',
        border: '1px solid var(--border-whisper)',
        borderRadius: 14,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--cyan)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Zero-Knowledge State Machine Path
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-faint)',
          }}
        >
          Current Node: <strong style={{ color: 'var(--text-hero)' }}>{ESCROW_STATE_LABELS[currentState]}</strong>
        </span>
      </div>

      {/* Main Sequential Pipeline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          position: 'relative',
        }}
      >
        {nodes.map((node, idx) => {
          const isPassed = !isDisputed && !isCancelled && currentState > node.state;
          const isCurrent = currentState === node.state;
          const isUpcoming = currentState < node.state;

          return (
            <div
              key={node.state}
              style={{
                position: 'relative',
                background: isCurrent
                  ? 'rgba(0, 240, 255, 0.1)'
                  : isPassed
                  ? 'rgba(52, 211, 153, 0.06)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: isCurrent
                  ? '1px solid rgba(0, 240, 255, 0.4)'
                  : isPassed
                  ? '1px solid rgba(52, 211, 153, 0.25)'
                  : '1px solid var(--border-whisper)',
                borderRadius: 10,
                padding: '12px 14px',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                {isPassed && <CheckCircle2 size={13} color="var(--emerald)" />}
                {isCurrent && <PlayCircle size={13} color="var(--cyan)" className="animate-pulse" />}
                {isUpcoming && <Clock size={13} color="var(--text-faint)" />}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: isCurrent ? 'var(--cyan)' : isPassed ? 'var(--emerald)' : 'var(--text-faint)',
                  }}
                >
                  {node.label}
                </span>
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>{node.desc}</div>

              {node.circuit !== 'settled' && (
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: 'var(--text-faint)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '2px 4px',
                    borderRadius: 4,
                    display: 'inline-block',
                  }}
                >
                  &rarr; {node.circuit}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Alternative Branches: Dispute / Resolve / Cancel */}
      {(isDisputed || isResolved || isCancelled) && (
        <div
          style={{
            background: isDisputed
              ? 'rgba(251, 113, 133, 0.1)'
              : isCancelled
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(52, 211, 153, 0.1)',
            border: isDisputed
              ? '1px solid rgba(251, 113, 133, 0.3)'
              : isCancelled
              ? '1px solid var(--border-whisper)'
              : '1px solid rgba(52, 211, 153, 0.3)',
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {isDisputed && <AlertTriangle size={18} color="var(--crimson)" />}
          {isResolved && <CheckCircle2 size={18} color="var(--emerald)" />}
          {isCancelled && <XCircle size={18} color="var(--text-faint)" />}

          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 600,
                color: isDisputed ? 'var(--crimson)' : isResolved ? 'var(--emerald)' : 'var(--text-faint)',
              }}
            >
              Branch: {isDisputed ? 'Dispute Arbitration Branch' : isResolved ? 'Resolved Branch' : 'Cancelled Agreement'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
              {isDisputed
                ? 'Contract entered dispute circuit. Arbiter signature required for settlement.'
                : isResolved
                ? 'Arbiter resolve() circuit executed. Final funds redistributed.'
                : 'Agreement cancelled prior to deposit funding.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
