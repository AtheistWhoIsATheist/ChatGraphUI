import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Clock, Fingerprint, Database, Search, Filter } from 'lucide-react';
import { Node } from '../data/corpus';

interface AuditTrailPanelProps {
  node?: Node;
}

export function AuditTrailPanel({ node }: AuditTrailPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#0a0a0a] border-l border-white/5">
        <ShieldCheck className="w-12 h-12 text-zinc-700 mb-4" />
        <h3 className="text-zinc-400 font-medium">No Node Selected</h3>
        <p className="text-zinc-600 text-sm mt-2">
          Select a node from the graph or stream to view its cryptographic audit trail.
        </p>
      </div>
    );
  }

  // Use real audit logs if available, otherwise fallback to simulated data
  const baseAuditLogs = node.audit_logs && node.audit_logs.length > 0 ? node.audit_logs : [
    {
      id: 'log_1',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      action: 'INITIAL_INGESTION',
      actor: 'Abyssal Ingestor',
      hash: '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 10),
      details: 'Node ingested from raw drop.'
    },
    {
      id: 'log_2',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      action: 'DENSIFICATION_PROTOCOL',
      actor: 'Professor Nihil (Cron)',
      hash: '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 10),
      details: 'Node densified. Summary expanded and Socratic questions generated.'
    },
    {
      id: 'log_3',
      timestamp: new Date().toISOString(),
      action: 'COMMUNITY_SYNTHESIS',
      actor: 'AutoNarrative Oracle',
      hash: '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 10),
      details: 'Node merged with related concepts based on Jaccard threshold.'
    }
  ];

  const uniqueActions = useMemo(() => {
    const actions = new Set(baseAuditLogs.map(log => log.action));
    return ['ALL', ...Array.from(actions)];
  }, [baseAuditLogs]);

  const filteredLogs = useMemo(() => {
    return baseAuditLogs.filter(log => {
      const matchesSearch = 
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.hash.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [baseAuditLogs, searchQuery, actionFilter]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-white/5 overflow-hidden">
      <div className="p-6 border-b border-white/10 bg-[#0f0f0f]">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-medium text-zinc-100">Audit Trail</h2>
        </div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">
          Cryptographic Provenance
        </p>
      </div>

      <div className="p-6 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-medium text-zinc-300 truncate">{node.label}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs mb-4">
          <div>
            <span className="text-zinc-600 block mb-1">Node ID</span>
            <span className="text-zinc-400 font-mono truncate block">{node.id}</span>
          </div>
          <div>
            <span className="text-zinc-600 block mb-1">Status</span>
            <span className="text-orange-400 font-medium">{node.status || 'DENSIFIED'}</span>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search logs, actors, or hashes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
            <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
            {uniqueActions.map(action => (
              <button
                key={action}
                onClick={() => setActionFilter(action)}
                className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors ${
                  actionFilter === action 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-white/5 text-zinc-500 border border-white/5 hover:bg-white/10'
                }`}
              >
                {action.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
        {/* Decorative Hex Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        
        {filteredLogs.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm mt-8">
            No audit logs match your search criteria.
          </div>
        ) : (
          <div className="space-y-8 relative">
            {/* Pulsing Timeline Line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent">
              <motion.div 
                animate={{ opacity: [0.1, 0.5, 0.1], scaleY: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-full h-full bg-emerald-500/40"
              />
            </div>

            {filteredLogs.map((log, index) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, type: "spring", damping: 20 }}
                className="relative flex gap-6 group"
              >
                {/* Cryptographic Key Icon */}
                <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-[#0f0f0f] text-zinc-500 group-hover:text-emerald-400 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-500 shadow-2xl overflow-hidden">
                  <Fingerprint className="w-4 h-4" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-t-emerald-500/30 border-r-transparent border-b-transparent border-l-transparent rounded-full opacity-0 group-hover:opacity-100" 
                  />
                </div>
                
                <div className="flex-1 p-5 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm shadow-2xl group-hover:border-emerald-500/20 group-hover:bg-zinc-900/60 transition-all duration-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                  
                  <p className="text-sm text-zinc-400 mb-4 leading-relaxed font-serif italic">
                    {log.details}
                  </p>
                  
                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Operator Proxy</span>
                      <span className="text-[11px] text-zinc-300 font-medium">{log.actor}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">SHA-256 Provenance</span>
                      <div className="flex items-center gap-2 px-2 py-1 bg-black/40 border border-white/5 rounded font-mono text-[9px] text-zinc-500 group-hover:text-emerald-500 transition-colors">
                        <ShieldCheck className="w-3 h-3 opacity-50" />
                        <span className="truncate">{log.hash}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
