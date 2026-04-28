/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, HardDrive, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DatabaseStatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodeCount: number;
  lastSync: string;
  onReIndex: () => Promise<void>;
}

export function DatabaseStatusPanel({ isOpen, onClose, nodeCount, lastSync, onReIndex }: DatabaseStatusPanelProps) {
  const [isReindexing, setIsReindexing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const [storageSaturation, setStorageSaturation] = useState(0);

  // Simulate storage saturation calculation
  useEffect(() => {
    if (isOpen) {
      // Mock calculation: nodeCount * random factor / arbitrary limit
      const saturation = Math.min(100, Math.round((nodeCount * 150) / 5000 * 100));
      setStorageSaturation(saturation);
    }
  }, [isOpen, nodeCount]);

  // Heartbeat simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(prev => prev === 'connected' ? 'connected' : 'connected');
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleReIndexClick = async () => {
    setIsReindexing(true);
    try {
      await onReIndex();
      setTimeout(() => setIsReindexing(false), 1500); // Minimum visual duration
    } catch (error) {
      console.error("Re-index failed", error);
      setIsReindexing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-zinc-900/40 border-r border-white/10 z-50 p-8 shadow-xl flex flex-col font-mono text-zinc-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 shadow-xl">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold  tracking-widest text-zinc-300">Nexus</h2>
                  <p className="text-[10px] text-zinc-400  tracking-widest font-bold mt-1">Database Status</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 border border-transparent hover:border-white/10 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors rounded-xl transition duration-300 backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-6 flex-1">
              
              {/* Connection Health */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-xl transition duration-300 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 bg-white/5 border-b-2 border-l-2 border-white/5 text-[9px] text-zinc-300 font-bold">ACTV</div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-400 font-bold  tracking-widest">Connection Health</span>
                  <Activity className="w-5 h-5 text-zinc-300" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full bg-[#00FF66] opacity-75"></span>
                    <span className="relative inline-flex h-4 w-4 bg-[#00FF66]"></span>
                  </div>
                  <span className="text-sm font-semibold tracking-widest text-zinc-300 ">Active / Stable</span>
                </div>
                <div className="mt-4 h-2 w-full bg-[#333] overflow-hidden border border-white/10">
                  <motion.div 
                    className="h-full bg-[#00FF66]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                  />
                </div>
              </div>

              {/* Node Count */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-xl transition duration-300 backdrop-blur-md">
                <span className="text-xs text-zinc-400 font-bold  tracking-widest block mb-2">Total Nodes</span>
                <div className="text-4xl font-semibold text-white tracking-tighter">{nodeCount}</div>
                <div className="text-[10px] text-zinc-300 font-bold mt-2  tracking-widest">Entities Tracked</div>
              </div>

              {/* Storage Saturation */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-xl transition duration-300 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-400 font-bold  tracking-widest">Storage Saturation</span>
                  <span className="text-sm font-semibold text-zinc-200">{storageSaturation}%</span>
                </div>
                <div className="h-2 w-full bg-[#333] overflow-hidden border border-white/10">
                  <motion.div 
                    className="h-full bg-zinc-200 text-black border-transparent hover:bg-zinc-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${storageSaturation}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Last Sync */}
              <div className="bg-white/5 border border-white/5 p-5 flex items-center justify-between rounded-xl transition duration-300 backdrop-blur-md">
                <span className="text-xs text-zinc-400 font-bold  tracking-widest">Last Sync</span>
                <span className="text-xs font-bold text-zinc-100">{lastSync}</span>
              </div>

            </div>

            {/* Actions */}
            <div className="mt-8 pt-8 border-t-2 border-white/5">
              <button
                onClick={handleReIndexClick}
                disabled={isReindexing}
                className="w-full py-4 border border-white/10 bg-white/10 hover:bg-zinc-200 text-black border-transparent hover:bg-zinc-300 text-zinc-200 hover:text-zinc-950 font-semibold text-sm  tracking-widest transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl disabled:shadow-none translate-x-[-2px] translate-y-[-2px] disabled:translate-x-0 disabled:translate-y-0"
              >
                <RefreshCw className={`w-5 h-5 ${isReindexing ? 'animate-spin' : ''}`} />
                {isReindexing ? 'Re-Indexing...' : 'Force Re-Index'}
              </button>
              
              {isReindexing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center justify-center gap-3 text-[10px]  font-bold text-zinc-300 tracking-widest"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Global State Refreshed</span>
                </motion.div>
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
