import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X } from 'lucide-react';
import { ShiftingVoidExplanation } from './ShiftingVoidExplanation';

export function TheoryOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-6 right-6 z-40 px-6 py-4 bg-white text-black border border-white/10 hover:bg-emerald-400 transition-all flex items-center gap-3 shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-2xl group active:scale-[0.98]"
      >
        <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Theoretical Framework</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute bottom-24 right-6 z-40 w-[600px] max-h-[70vh] overflow-hidden bg-zinc-950/90 border border-white/10 shadow-2xl flex flex-col rounded-[2rem] backdrop-blur-3xl"
          >
            <div className="p-6 flex justify-between items-center border-b border-white/5 bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-zinc-200 text-[10px] font-bold tracking-[0.2em] uppercase">Semantics & Ontology</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 transition-all rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar relative p-4">
              <ShiftingVoidExplanation />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
