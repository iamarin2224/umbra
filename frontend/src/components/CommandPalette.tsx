import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Zap,
  Layers,
  Activity,
  Cpu,
  BookOpen,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  RefreshCw,
  Plus,
  ArrowRight,
  Shield,
  Command,
} from 'lucide-react';
import Fuse from 'fuse.js';
import { soundFx } from '../lib/AudioEngine';
import { NavTab } from './HeaderHUD';

export interface MagicDraftPayload {
  amount: string;
  condition: string;
  sellerAddress?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenCreateModal: (prefill?: MagicDraftPayload) => void;
  onRefresh?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Actions' | 'Appearance' | 'System';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenCreateModal,
  onRefresh,
  theme,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(soundFx.getIsMuted());
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      soundFx.playOpen();
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  // Magic Draft NLP Parser Regex
  const parseMagicDraft = (text: string): MagicDraftPayload | null => {
    const trimmed = text.trim();
    const match = trimmed.match(
      /^(?:split|log|add|pay|deploy|lock|create|escrow|fund)\s+(?:(?:\$|tDUST)?\s*)?(\d+(?:\.\d+)?)(?:\s*(?:tdust|dust|usd|xlm))?\s+for\s+(.*?)(?:\s+(?:with|to)\s+(.*))?$/i
    );

    if (match) {
      const amount = match[1];
      const condition = match[2]?.trim() || '';
      const sellerAddress = match[3]?.trim() || '';
      return {
        amount,
        condition: condition || 'Delivery and verification of milestone specifications.',
        sellerAddress,
      };
    }
    return null;
  };

  const magicDraft = parseMagicDraft(query);

  const baseCommands: CommandItem[] = [
    {
      id: 'nav-matrix',
      title: 'Command Matrix',
      subtitle: 'View live escrow agreements, commitments & filters',
      category: 'Navigation',
      icon: <Layers size={15} color="#00f0ff" />,
      shortcut: '⌘ 1',
      action: () => {
        onSelectTab('escrows');
        onClose();
      },
    },
    {
      id: 'nav-telemetry',
      title: 'Protocol Telemetry',
      subtitle: 'Prover performance, volume benchmarks & metrics',
      category: 'Navigation',
      icon: <Activity size={15} color="#34d399" />,
      shortcut: '⌘ 2',
      action: () => {
        onSelectTab('stats');
        onClose();
      },
    },
    {
      id: 'nav-circuit',
      title: 'Circuit Lab',
      subtitle: 'Compact ZK compiler preview & witness generation',
      category: 'Navigation',
      icon: <Cpu size={15} color="#c084fc" />,
      shortcut: '⌘ 3',
      action: () => {
        onSelectTab('explorer');
        onClose();
      },
    },
    {
      id: 'nav-docs',
      title: 'Architecture Docs',
      subtitle: 'Learn about Midnight Halo2 SNARK verification & states',
      category: 'Navigation',
      icon: <BookOpen size={15} color="#fbbf24" />,
      shortcut: '⌘ 4',
      action: () => {
        onSelectTab('about');
        onClose();
      },
    },
    {
      id: 'act-deploy',
      title: 'Deploy New Shielded Escrow',
      subtitle: 'Initialize a state machine enclave with confidential parameters',
      category: 'Actions',
      icon: <Plus size={15} color="#00f0ff" />,
      shortcut: '⌘ N',
      action: () => {
        onClose();
        onOpenCreateModal();
      },
    },
    {
      id: 'act-refresh',
      title: 'Refresh Ledger State',
      subtitle: 'Resynchronize contracts with the Midnight node',
      category: 'Actions',
      icon: <RefreshCw size={15} color="#d1d5db" />,
      shortcut: '⌘ R',
      action: () => {
        onRefresh?.();
        onClose();
      },
    },
    {
      id: 'app-theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: 'Toggle between pure obsidian void and clean light theme',
      category: 'Appearance',
      icon: theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#c084fc" />,
      shortcut: '⌘ T',
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: 'app-audio',
      title: isAudioMuted ? 'Unmute Spatial Haptics' : 'Mute Spatial Haptics',
      subtitle: 'Synthesized Web Audio tactile ticks & arpeggios',
      category: 'Appearance',
      icon: isAudioMuted ? <VolumeX size={15} color="#fb7185" /> : <Volume2 size={15} color="#34d399" />,
      action: () => {
        const muted = soundFx.toggleMute();
        setIsAudioMuted(muted);
      },
    },
  ];

  // Fuzzy Search setup
  const fuse = new Fuse(baseCommands, {
    keys: ['title', 'subtitle', 'category'],
    threshold: 0.35,
  });

  const filteredCommands: CommandItem[] = query.trim()
    ? fuse.search(query).map((res) => res.item)
    : baseCommands;

  const totalResults = (magicDraft ? 1 : 0) + filteredCommands.length;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      soundFx.playClose();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      soundFx.playTick();
      setSelectedIndex((prev) => (prev + 1) % Math.max(totalResults, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      soundFx.playTick();
      setSelectedIndex((prev) => (prev - 1 + totalResults) % Math.max(totalResults, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (magicDraft && selectedIndex === 0) {
        soundFx.playSuccess();
        onClose();
        onOpenCreateModal(magicDraft);
      } else {
        const targetIndex = magicDraft ? selectedIndex - 1 : selectedIndex;
        if (filteredCommands[targetIndex]) {
          soundFx.playSuccess();
          filteredCommands[targetIndex].action();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[99999] flex items-start justify-center pt-20 sm:pt-28 px-4"
        style={{
          background: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onClick={() => {
          soundFx.playClose();
          onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 620,
            background: theme === 'dark' ? 'rgba(10, 12, 18, 0.95)' : 'rgba(255, 255, 255, 0.96)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)'}`,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(0, 240, 255, 0.15)',
          }}
        >
          {/* Search Header Bar */}
          <div
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
            }}
          >
            <Search
              size={18}
              color={theme === 'dark' ? 'var(--cyan)' : '#0284c7'}
              style={{ flexShrink: 0 }}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder='Type a command or natural language (e.g. "deploy 500 for audits")...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 14,
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#f5f5f5' : '#111827',
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 7px',
                borderRadius: 6,
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: theme === 'dark' ? 'var(--text-sub)' : '#6b7280',
                flexShrink: 0,
              }}
            >
              <Command size={10} />
              <span>ESC</span>
            </div>
          </div>

          {/* Results List */}
          <div
            style={{
              maxHeight: 380,
              overflowY: 'auto',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {/* NLP MAGIC DRAFT SUGGESTION ITEM */}
            {magicDraft && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  soundFx.playSuccess();
                  onClose();
                  onOpenCreateModal(magicDraft);
                }}
                onMouseEnter={() => {
                  soundFx.playTick();
                  setSelectedIndex(0);
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background:
                    selectedIndex === 0
                      ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.18), rgba(192, 132, 252, 0.18))'
                      : 'rgba(0, 240, 255, 0.06)',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #00f0ff, #c084fc)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#07080c',
                    }}
                  >
                    <Zap size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: theme === 'dark' ? '#ffffff' : '#0f172a',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        ⚡ Magic Draft: Deploy {magicDraft.amount} tDUST Escrow
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: theme === 'dark' ? 'var(--text-sub)' : '#64748b',
                        marginTop: 2,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      Condition: &ldquo;{magicDraft.condition}&rdquo;{' '}
                      {magicDraft.sellerAddress ? `→ ${magicDraft.sellerAddress.slice(0, 10)}...` : ''}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--cyan)',
                  }}
                >
                  <span>Enter</span>
                  <ArrowRight size={12} />
                </div>
              </motion.div>
            )}

            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd, idx) => {
                const itemIndex = magicDraft ? idx + 1 : idx;
                const isSelected = selectedIndex === itemIndex;

                return (
                  <div
                    key={cmd.id}
                    onClick={() => {
                      soundFx.playSuccess();
                      cmd.action();
                    }}
                    onMouseEnter={() => {
                      soundFx.playTick();
                      setSelectedIndex(itemIndex);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isSelected
                        ? theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.06)'
                        : 'transparent',
                      border: `1px solid ${
                        isSelected
                          ? theme === 'dark'
                            ? 'rgba(255, 255, 255, 0.14)'
                            : 'rgba(0, 0, 0, 0.12)'
                          : 'transparent'
                      }`,
                      transition: 'background 0.1s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          background: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {cmd.icon}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: isSelected ? 600 : 450,
                            color: theme === 'dark' ? '#ffffff' : '#0f172a',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          {cmd.title}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: theme === 'dark' ? 'var(--text-sub)' : '#64748b',
                            marginTop: 1,
                          }}
                        >
                          {cmd.subtitle}
                        </div>
                      </div>
                    </div>

                    {cmd.shortcut && (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: theme === 'dark' ? 'var(--text-faint)' : '#9ca3af',
                          background: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {cmd.shortcut}
                      </span>
                    )}
                  </div>
                );
              })
            ) : !magicDraft ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: theme === 'dark' ? 'var(--text-faint)' : '#9ca3af',
                }}
              >
                No actions or navigation routes matched &ldquo;{query}&rdquo;
              </div>
            ) : null}
          </div>

          {/* Footer Bar */}
          <div
            style={{
              padding: '10px 18px',
              background: theme === 'dark' ? 'rgba(6, 8, 12, 0.7)' : 'rgba(245, 245, 247, 0.8)',
              borderTop: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: theme === 'dark' ? 'var(--text-faint)' : '#6b7280',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={12} color="var(--cyan)" />
              <span>Umbra Command Palette</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>↑↓ Navigate</span>
              <span>↵ Execute</span>
              <span>Esc Dismiss</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
