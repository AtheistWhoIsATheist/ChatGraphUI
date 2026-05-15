import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database } from 'lucide-react';
import { Node } from '../data/corpus';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (node: Node) => void;
}

export function AddNodeModal({ isOpen, onClose, onAddNode }: AddNodeModalProps) {
  const [newNode, setNewNode] = useState({ label: '', type: 'concept' });

  const handleInitialize = () => {
    if (!newNode.label.trim()) return;
    const id = `manual_${Date.now()}`;
    onAddNode({
      id,
      label: newNode.label,
      type: newNode.type as any,
      status: 'ACTIVE',
      metadata: { 
        source: 'Manual Ingestion', 
        timestamp: new Date().toISOString() 
      }
    } as Node);
    onClose();
    setNewNode({ label: '', type: 'concept' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-8 text-emerald-400 relative z-10">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-widest font-mono uppercase">Manual Ingestion</h3>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Force Structural Inbound</div>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 pl-1">Node Context Label</label>
                <input
                  type="text"
                  value={newNode.label}
                  onChange={e => setNewNode({ ...newNode, label: e.target.value })}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-5 py-4 text-zinc-100 outline-none focus:border-emerald-500/50 transition-all font-mono placeholder:text-zinc-700"
                  placeholder="Enter semantic identifier..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 pl-1">Topological Class</label>
                <div className="relative">
                  <select
                    value={newNode.type}
                    onChange={e => setNewNode({ ...newNode, type: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-5 py-4 text-zinc-100 outline-none focus:border-emerald-500/50 transition-all font-mono appearance-none uppercase text-xs tracking-widest"
                  >
                    <option value="concept">Concept</option>
                    <option value="thinker">Thinker</option>
                    <option value="axiom">Axiom</option>
                    <option value="question">Question</option>
                    <option value="theme">Theme</option>
                    <option value="praxis">Praxis</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                    <Database className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleInitialize}
                disabled={!newNode.label.trim()}
                className="w-full py-5 bg-emerald-500 text-black font-bold tracking-[0.2em] rounded-2xl hover:bg-emerald-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed font-mono shadow-[0_0_40px_rgba(16,185,129,0.2)] active:scale-[0.98] mt-4"
              >
                INITIALIZE NODE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
