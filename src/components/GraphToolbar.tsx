import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Filter, Atom, Sparkles, Network, SlidersHorizontal, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface GraphToolbarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTypes: Set<string>;
  setActiveTypes: (types: Set<string>) => void;
  activeStatuses: Set<string>;
  setActiveStatuses: (statuses: Set<string>) => void;
  clusterMode: boolean;
  setClusterMode: (mode: boolean) => void;
  showLatent: boolean;
  setShowLatent: (show: boolean) => void;
  structuralIntegrity: boolean;
  setStructuralIntegrity: (integ: boolean) => void;
  gravity: number;
  setGravity: (g: number) => void;
  onAddNode: () => void;
}

export function GraphToolbar({
  isOpen,
  setIsOpen,
  searchQuery,
  setSearchQuery,
  activeTypes,
  setActiveTypes,
  activeStatuses,
  setActiveStatuses,
  clusterMode,
  setClusterMode,
  showLatent,
  setShowLatent,
  structuralIntegrity,
  setStructuralIntegrity,
  gravity,
  setGravity,
  onAddNode
}: GraphToolbarProps) {
  const toggleSetItem = (set: Set<string>, item: string) => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    return next;
  };

  return (
    <div className="absolute top-6 left-6 z-40 flex flex-col gap-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          title="Toggle Toolbar"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <button
          onClick={onAddNode}
          className="p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl text-zinc-400 hover:text-emerald-400 hover:bg-white/5 transition-colors"
          title="Add Manual Node"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-4"
          >
            {/* Scented Search */}
            <div className="pointer-events-auto bg-zinc-950 border border-white/5 hover:border-white/10 transition-colors p-3 w-64 flex items-center gap-3 rounded-2xl backdrop-blur-md">
              <Search className="w-5 h-5 text-zinc-300" />
              <input
                type="text"
                placeholder="Scented Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-zinc-100 placeholder:text-zinc-500 w-full font-mono tracking-widest"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-white/5">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              )}
            </div>

            {/* Filter Group */}
            <div className="pointer-events-auto bg-zinc-950 border border-white/5 p-5 w-64 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-zinc-200 tracking-widest uppercase">
                <Filter className="w-4 h-4" /> Filters
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {['concept', 'thinker', 'treatise', 'question', 'axiom', 'praxis'].map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveTypes(toggleSetItem(activeTypes, type))}
                    className={cn(
                      "text-[10px] px-3 py-1 font-bold tracking-widest border transition-all cursor-pointer uppercase",
                      activeTypes.has(type)
                        ? "bg-zinc-100 text-black border-white/10 shadow-2xl scale-105"
                        : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 border-t-2 border-[#111] pt-4">
                {['VERIFIED', 'INFERENCE', 'HYPOTHESIS'].map(status => (
                  <button
                    key={status}
                    onClick={() => setActiveStatuses(toggleSetItem(activeStatuses, status))}
                    className={cn(
                      "text-[10px] px-3 py-1 font-bold tracking-widest border transition-all cursor-pointer",
                      activeStatuses.has(status)
                        ? "bg-amber-500/20 border-white/10 text-zinc-100 shadow-2xl scale-105"
                        : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Toggles */}
            <div className="pointer-events-auto flex flex-col gap-3">
              <button
                onClick={() => setClusterMode(!clusterMode)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 border transition-all duration-300 font-bold rounded-2xl",
                  clusterMode
                    ? "bg-zinc-100 text-black border-white/10 shadow-2xl scale-105"
                    : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                )}
              >
                <Atom className={cn("w-5 h-5", clusterMode && "animate-spin-slow")} />
                <span className="text-xs tracking-widest uppercase">Cluster Mode</span>
              </button>

              <button
                onClick={() => setShowLatent(!showLatent)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 border transition-all duration-300 font-bold rounded-2xl",
                  showLatent
                    ? "bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40 shadow-2xl scale-105"
                    : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                )}
              >
                <Sparkles className={cn("w-5 h-5", showLatent && "animate-pulse")} />
                <span className="text-xs tracking-widest uppercase">Gap Synthesis</span>
              </button>

              <button
                onClick={() => setStructuralIntegrity(!structuralIntegrity)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 border transition-all duration-300 font-bold rounded-2xl",
                  structuralIntegrity
                    ? "bg-zinc-100 text-black border-white/10 shadow-2xl scale-105"
                    : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                )}
              >
                <Network className={cn("w-5 h-5", structuralIntegrity && "animate-pulse")} />
                <span className="text-xs tracking-widest uppercase">Structural Integrity</span>
              </button>

              {/* Gravity Slider */}
              <div className="bg-zinc-900/50 border border-white/5 p-4 flex flex-col gap-3 font-mono font-bold tracking-widest rounded-2xl backdrop-blur-md">
                <div className="flex items-center justify-between text-[10px] text-zinc-300 uppercase">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Gravity Breakdown</span>
                  </div>
                  <span>{gravity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gravity}
                  onChange={(e) => setGravity(parseInt(e.target.value))}
                  className="w-full accent-[#FF3A00] h-1 bg-white/10 appearance-none cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
