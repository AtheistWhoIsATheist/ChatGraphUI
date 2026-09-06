import React from 'react';
import { X, Check, Brain, Sparkles, Inbox, Trash2 } from 'lucide-react';

interface InboxItem {
  id: string;
  title: string;
  source: string;
  snippet: string;
  type: 'aporia' | 'synthesis' | 'invariant';
  timestamp: string;
}

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptToVault: (item: InboxItem) => void;
  onOpenDialectic?: () => void;
}

export const InboxModal: React.FC<InboxModalProps> = ({
  isOpen,
  onClose,
  onAcceptToVault,
  onOpenDialectic
}) => {
  const [items, setItems] = React.useState<InboxItem[]>([
    {
      id: 'inbox-1',
      title: 'Absence as Presence (Synthesis #4)',
      source: 'Meister Eckhart / Sermon 52',
      snippet: 'The Godhead is an unconditioned desert where no distinctions obtain. In Nihiltheism, this absence operates as a generative fullness.',
      type: 'synthesis',
      timestamp: '12m ago'
    },
    {
      id: 'inbox-2',
      title: 'Aporia: The Dissolution Witness',
      source: 'Ontology Invariance Engine',
      snippet: 'If total dissolution occurs, is memory of the encounter authentic or retrospective confabulation?',
      type: 'aporia',
      timestamp: '1h ago'
    },
    {
      id: 'inbox-3',
      title: 'Invariant Audit: Nagarjuna Sunyata Gap',
      source: 'Madhyamaka Comparative Batch',
      snippet: 'Boundary tension theta held steady at 0.18 under mutual negation. Ready for academic citation inclusion.',
      type: 'invariant',
      timestamp: '3h ago'
    }
  ]);

  if (!isOpen) return null;

  const handleDismiss = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md h-full obsidian-card border-l border-white/10 shadow-2xl z-10 flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <Inbox size={14} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Inbox Triage ({items.length})
              </h2>
              <p className="text-[11px] text-white/50">Pending ontological reflections</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* List of Inbox Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-16 text-center text-xs text-white/40 space-y-2">
              <Sparkles size={24} className="mx-auto text-violet-400/40" />
              <p>The inbox is quiet. All insights have returned to the vault.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 hover:border-violet-500/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase">
                    {item.type}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">{item.timestamp}</span>
                </div>
                <h3 className="text-xs font-semibold text-white font-serif">{item.title}</h3>
                <p className="text-[11px] text-white/60 leading-relaxed font-sans">{item.snippet}</p>
                <div className="text-[10px] font-mono text-white/40">{item.source}</div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <button
                    onClick={() => {
                      onAcceptToVault(item);
                      handleDismiss(item.id);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 transition-colors"
                  >
                    <Check size={11} /> Accept to Vault
                  </button>

                  <div className="flex items-center gap-1.5">
                    {onOpenDialectic && (
                      <button
                        onClick={() => {
                          onOpenDialectic();
                          onClose();
                        }}
                        className="p-1 rounded text-white/40 hover:text-violet-300 transition-colors"
                        title="Probe in Dialectic"
                      >
                        <Brain size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(item.id)}
                      className="p-1 rounded text-white/40 hover:text-rose-400 transition-colors"
                      title="Discard"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 font-mono">
          <span>Continuous Abyssal Ingestion</span>
          <button
            onClick={() => setItems([])}
            className="hover:text-white transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};
