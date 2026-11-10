import React from 'react';
import { Filter, Check, X, Eye, EyeOff } from 'lucide-react';
import { CANONICAL_TRADITIONS, TraditionLane } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedTraditionIds: string[];
  onToggleTradition: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  muteZeroCount: boolean;
  onToggleMuteZero: () => void;
  traditionCounts: Record<string, number>;
}

export const TraditionDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedTraditionIds,
  onToggleTradition,
  onSelectAll,
  onClearAll,
  muteZeroCount,
  onToggleMuteZero,
  traditionCounts
}) => {
  if (!isOpen) return null;

  // Filter out traditions if muteZeroCount is active
  const visibleTraditions: TraditionLane[] = CANONICAL_TRADITIONS.filter((t) => {
    if (!muteZeroCount) return true;
    const count = traditionCounts[t.id] || 0;
    return count > 0;
  });

  const allActive = selectedTraditionIds.length === 0 || selectedTraditionIds.length === CANONICAL_TRADITIONS.length;

  return (
    <div className="absolute top-11 left-4 z-50 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg shadow-2xl p-3 text-slate-200 text-xs font-sans select-none animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 font-semibold uppercase tracking-wider">
          <Filter size={12} className="text-slate-400" />
          <span>Tradition Filter Drawer</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:text-white text-slate-400 rounded hover:bg-slate-800/60 transition-colors"
          title="Close drawer"
        >
          <X size={13} />
        </button>
      </div>

      {/* Quick Action Bar: All, None, Mute Inactive */}
      <div className="flex items-center justify-between gap-1 mb-2.5 px-1 font-mono text-[10px]">
        <div className="flex items-center gap-1">
          <button
            onClick={onSelectAll}
            className={`px-2 py-0.5 rounded border transition-colors ${
              allActive
                ? 'bg-slate-800 border-slate-600 text-white font-medium'
                : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={onClearAll}
            className="px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            None
          </button>
        </div>

        <button
          onClick={onToggleMuteZero}
          className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
            muteZeroCount
              ? 'bg-slate-800 border-slate-700 text-slate-200'
              : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-400'
          }`}
          title="Hide zero-count traditions from list"
        >
          {muteZeroCount ? <EyeOff size={11} className="text-amber-400" /> : <Eye size={11} />}
          <span>Mute Inactive (0)</span>
        </button>
      </div>

      {/* Tradition Items Grid / List */}
      <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
        {visibleTraditions.map((tradition) => {
          const count = traditionCounts[tradition.id] || 0;
          const isSelected = selectedTraditionIds.length === 0 || selectedTraditionIds.includes(tradition.id);

          return (
            <button
              key={tradition.id}
              onClick={() => onToggleTradition(tradition.id)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded border transition-all text-left ${
                isSelected
                  ? 'bg-slate-800/70 border-slate-700 text-slate-100'
                  : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:bg-slate-900/50 hover:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tradition.color }}
                />
                <span className="font-medium text-[11px]">{tradition.label}</span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span
                  className={`px-1.5 py-0.2 rounded ${
                    count > 0 ? 'text-slate-300 bg-slate-800' : 'text-slate-600 bg-slate-950'
                  }`}
                >
                  {count}
                </span>
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                    isSelected
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'border-slate-800 bg-slate-950 text-transparent'
                  }`}
                >
                  {isSelected && <Check size={10} />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>
          {selectedTraditionIds.length === 0
            ? 'All traditions active'
            : `${selectedTraditionIds.length} of ${CANONICAL_TRADITIONS.length} active`}
        </span>
        <span>Esc to close</span>
      </div>
    </div>
  );
};
