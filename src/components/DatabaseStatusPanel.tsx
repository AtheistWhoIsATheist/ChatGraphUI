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
            className="fixed left-0 top-0 bottom-0 w-80 bg-[#050505] border-r-4 border-[#00E5FF] z-50 p-8 shadow-[10px_0_30px_rgba(0,229,255,0.2)] flex flex-col font-mono text-[#eee]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-[#333]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#111] border-2 border-[#00E5FF] flex items-center justify-center text-[#00E5FF] shadow-[4px_4px_0_rgba(0,229,255,0.4)]">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-[#00E5FF]">Nexus</h2>
                  <p className="text-[10px] text-[#888] uppercase tracking-[0.2em] font-bold mt-1">Database Status</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 border-2 border-transparent hover:border-[#FF3A00] hover:bg-[#FF3A00]/10 flex items-center justify-center text-[#888] hover:text-[#FF3A00] transition-colors neo-flat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-6 flex-1">
              
              {/* Connection Health */}
              <div className="bg-[#111] border-2 border-[#333] p-5 neo-flat relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 bg-[#111] border-b-2 border-l-2 border-[#333] text-[9px] text-[#00FF66] font-bold">ACTV</div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#888] font-bold uppercase tracking-widest">Connection Health</span>
                  <Activity className="w-5 h-5 text-[#00FF66]" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full bg-[#00FF66] opacity-75"></span>
                    <span className="relative inline-flex h-4 w-4 bg-[#00FF66]"></span>
                  </div>
                  <span className="text-sm font-black tracking-widest text-[#00FF66] uppercase">Active / Stable</span>
                </div>
                <div className="mt-4 h-2 w-full bg-[#333] overflow-hidden border border-[#444]">
                  <motion.div 
                    className="h-full bg-[#00FF66]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                  />
                </div>
              </div>

              {/* Node Count */}
              <div className="bg-[#111] border-2 border-[#333] p-5 neo-flat">
                <span className="text-xs text-[#888] font-bold uppercase tracking-widest block mb-2">Total Nodes</span>
                <div className="text-4xl font-black text-[#fff] tracking-tighter">{nodeCount}</div>
                <div className="text-[10px] text-[#00E5FF] font-bold mt-2 uppercase tracking-widest">Entities in the Void</div>
              </div>

              {/* Storage Saturation */}
              <div className="bg-[#111] border-2 border-[#333] p-5 neo-flat">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#888] font-bold uppercase tracking-widest">Storage Saturation</span>
                  <span className="text-sm font-black text-[#FF3A00]">{storageSaturation}%</span>
                </div>
                <div className="h-2 w-full bg-[#333] overflow-hidden border border-[#444]">
                  <motion.div 
                    className="h-full bg-[#FF3A00]"
                    initial={{ width: 0 }}
                    animate={{ width: `${storageSaturation}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Last Sync */}
              <div className="bg-[#111] border-2 border-[#333] p-5 flex items-center justify-between neo-flat">
                <span className="text-xs text-[#888] font-bold uppercase tracking-widest">Last Sync</span>
                <span className="text-xs font-bold text-[#eee]">{lastSync}</span>
              </div>

            </div>

            {/* Actions */}
            <div className="mt-8 pt-8 border-t-2 border-[#333]">
              <button
                onClick={handleReIndexClick}
                disabled={isReindexing}
                className="w-full py-4 border-2 border-[#FF3A00] bg-[#FF3A00]/10 hover:bg-[#FF3A00] text-[#FF3A00] hover:text-[#000] font-black text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[4px_4px_0_rgba(255,58,0,0.4)] disabled:shadow-none translate-x-[-2px] translate-y-[-2px] disabled:translate-x-0 disabled:translate-y-0"
              >
                <RefreshCw className={`w-5 h-5 ${isReindexing ? 'animate-spin' : ''}`} />
                {isReindexing ? 'Re-Indexing...' : 'Force Re-Index'}
              </button>
              
              {isReindexing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center justify-center gap-3 text-[10px] uppercase font-bold text-[#00E5FF] tracking-widest"
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
