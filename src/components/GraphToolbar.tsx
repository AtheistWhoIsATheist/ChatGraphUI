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
  
  // Custom styling states & options
  nodeStylePreset: 'void-glow' | 'glass' | 'neon' | 'solid';
  setNodeStylePreset: (preset: 'void-glow' | 'glass' | 'neon' | 'solid') => void;
  nodeSpacing: number;
  setNodeSpacing: (spacing: number) => void;
  availableTypes: string[];
  availableStatuses: string[];
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
  onAddNode,
  
  nodeStylePreset,
  setNodeStylePreset,
  nodeSpacing,
  setNodeSpacing,
  availableTypes,
  availableStatuses
}: GraphToolbarProps) {
  const toggleSetItem = (set: Set<string>, item: string) => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    return next;
  };

  return (
    <div className="absolute top-6 left-6 z-40 flex flex-col gap-4 pointer-events-none max-h-[90vh] overflow-y-auto pr-2 no-scrollbar">
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
          title="Toggle Toolbar"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <button
          onClick={onAddNode}
          className="p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl text-zinc-400 hover:text-emerald-400 hover:bg-white/5 transition-colors cursor-pointer"
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
            className="flex flex-col gap-3"
          >
            {/* Scented Search */}
            <div className="pointer-events-auto bg-zinc-950 border border-white/5 hover:border-white/10 transition-colors p-3 w-64 flex items-center gap-3 rounded-2xl backdrop-blur-md">
              <Search className="w-5 h-5 text-zinc-305" />
              <input
                type="text"
                placeholder="Scented Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-zinc-100 placeholder:text-zinc-500 w-full font-mono tracking-widest"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-white/5 cursor-pointer">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              )}
            </div>

            {/* Filter Group */}
            <div className="pointer-events-auto bg-zinc-950 border border-white/5 p-4 w-62 rounded-2xl backdrop-blur-md flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-200 tracking-widest uppercase">
                <Filter className="w-3.5 h-3.5" /> Filter Substrates
              </div>

              {/* Node Types Section */}
              <div className="border-t border-white/5 pt-2">
                <div className="text-[9px] uppercase text-zinc-400 font-extrabold tracking-wider mb-2 flex justify-between items-center">
                  <span>Node Types</span>
                  <div className="flex gap-2 font-mono">
                    <button 
                      onClick={() => setActiveTypes(new Set<string>())} 
                      className="hover:text-white text-zinc-500 text-[8px] cursor-pointer"
                      title="Clear Filters (Show All)"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2 max-h-[120px] overflow-y-auto no-scrollbar pr-1">
                  {availableTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setActiveTypes(toggleSetItem(activeTypes, type))}
                      className={cn(
                        "text-[9px] px-2 py-0.5 font-bold tracking-widest border transition-all cursor-pointer uppercase",
                        activeTypes.has(type)
                          ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/50 shadow-sm"
                          : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Section */}
              <div className="border-t border-white/5 pt-2">
                <div className="text-[9px] uppercase text-zinc-400 font-extrabold tracking-wider mb-2 flex justify-between items-center">
                  <span>Status Registry</span>
                  <div className="flex gap-2 font-mono">
                    <button 
                      onClick={() => setActiveStatuses(new Set<string>())} 
                      className="hover:text-white text-zinc-500 text-[8px] cursor-pointer"
                      title="Clear Filters (Show All)"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {availableStatuses.map(status => (
                    <button
                      key={status}
                      onClick={() => setActiveStatuses(toggleSetItem(activeStatuses, status))}
                      className={cn(
                        "text-[9px] px-2 py-0.5 font-bold tracking-widest border transition-all cursor-pointer",
                        activeStatuses.has(status)
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm"
                          : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-[8px] font-mono text-zinc-500 leading-tight">
                * No active selection filters displays all nodes.
              </div>
            </div>

            {/* Action Toggles */}
            <div className="pointer-events-auto flex flex-col gap-2">
              <button
                onClick={() => setClusterMode(!clusterMode)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 border transition-all duration-300 font-bold rounded-2xl cursor-pointer",
                  clusterMode
                    ? "bg-zinc-100 text-black border-white/10 shadow-2xl scale-102"
                    : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                )}
              >
                <Atom className={cn("w-4.5 h-4.5", clusterMode && "animate-spin-slow")} />
                <span className="text-xs tracking-widest uppercase">Cluster Mode</span>
              </button>

              <button
                onClick={() => setShowLatent(!showLatent)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 border transition-all duration-300 font-bold rounded-2xl cursor-pointer",
                  showLatent
                    ? "bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40 shadow-2xl scale-102"
                    : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                )}
              >
                <Sparkles className={cn("w-4.5 h-4.5", showLatent && "animate-pulse")} />
                <span className="text-xs tracking-widest uppercase">Gap Synthesis</span>
              </button>

              <button
                onClick={() => setStructuralIntegrity(!structuralIntegrity)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 border transition-all duration-300 font-bold rounded-2xl cursor-pointer",
                  structuralIntegrity
                    ? "bg-zinc-100 text-black border-white/10 shadow-2xl scale-102"
                    : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                )}
              >
                <Network className={cn("w-4.5 h-4.5", structuralIntegrity && "animate-pulse")} />
                <span className="text-xs tracking-widest uppercase">Structural Integrity</span>
              </button>

              {/* Node Visual Presets */}
              <div className="bg-zinc-900/50 border border-white/5 p-3.5 flex flex-col gap-2 font-mono font-bold tracking-widest rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-2 text-[9px] text-zinc-300 uppercase mb-0.5">
                  <span>Visual Presets</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'void-glow', label: 'Holo' },
                    { id: 'glass', label: 'Glass' },
                    { id: 'neon', label: 'Neon' },
                    { id: 'solid', label: 'Solid' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setNodeStylePreset(p.id as any)}
                      className={cn(
                        "text-[8px] py-1 font-bold tracking-widest border transition-all cursor-pointer uppercase rounded-md",
                        nodeStylePreset === p.id
                          ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40 shadow-sm"
                          : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gravity Slider */}
              <div className="bg-zinc-900/50 border border-white/5 p-3.5 flex flex-col gap-2 font-mono font-bold tracking-widest rounded-2xl backdrop-blur-md">
                <div className="flex items-center justify-between text-[9px] text-zinc-300 uppercase">
                  <div className="flex items-center gap-1.55">
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Gravity</span>
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

              {/* Spacing Slider */}
              <div className="bg-zinc-900/50 border border-white/5 p-3.5 flex flex-col gap-2 font-mono font-bold tracking-widest rounded-2xl backdrop-blur-md">
                <div className="flex items-center justify-between text-[9px] text-zinc-300 uppercase">
                  <div className="flex items-center gap-1.55">
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Node Spacing</span>
                  </div>
                  <span>{nodeSpacing}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={nodeSpacing}
                  onChange={(e) => setNodeSpacing(parseInt(e.target.value))}
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
