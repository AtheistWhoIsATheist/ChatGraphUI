import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Clock, Fingerprint, Database, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
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
      actor: 'Ingestion Module',
      hash: '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 10),
      details: 'Node ingested from raw drop.'
    },
    {
      id: 'log_2',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      action: 'DENSIFICATION_PROTOCOL',
      actor: 'Synthesis Engine (Cron)',
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
    <div className="flex flex-col h-full bg-zinc-950 border-l-2 border-white/5 overflow-hidden font-mono text-zinc-100">
      <div className="p-6 border-b-2 border-white/5 bg-zinc-900/40">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6 text-zinc-300 animate-pulse" />
          <h2 className="text-xl font-semibold tracking-widest ">Audit Trail</h2>
        </div>
        <p className="text-xs font-bold text-zinc-200  tracking-widest">
          Cryptographic Provenance
        </p>
      </div>

      <div className="p-6 border-b-2 border-white/5 bg-zinc-950">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-zinc-200" />
          <h3 className="text-sm font-bold text-zinc-300 truncate">{node.label}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs mb-6">
          <div className="bg-white/5 p-3 border border-white/5">
            <span className="text-zinc-400 font-bold  tracking-widest block mb-1">Node ID</span>
            <span className="text-zinc-100 font-mono truncate block">{node.id}</span>
          </div>
          <div className="bg-white/5 p-3 border border-white/5">
            <span className="text-zinc-400 font-bold  tracking-widest block mb-1">Status</span>
            <span className="text-zinc-300 font-semibold tracking-widest ">{node.status || 'DENSIFIED'}</span>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4 mt-4 pt-6 border-t-2 border-[#222]">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-transparent opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
            <input
              type="text"
              placeholder="SEARCH LOGS, ACTORS, HASHES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative z-10 w-full bg-zinc-900/40 border border-white/5 rounded-xl transition duration-300 backdrop-blur-md pl-10 pr-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-500 font-bold  tracking-widest focus:outline-none focus:border-white/10 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
            <Filter className="w-4 h-4 text-zinc-200 shrink-0" />
            {uniqueActions.map(action => (
              <button
                key={action}
                onClick={() => setActionFilter(action)}
                className={cn(
                  "px-3 py-1 text-[10px]  font-bold tracking-widest whitespace-nowrap transition-colors border rounded-xl transition duration-300 backdrop-blur-md",
                  actionFilter === action 
                    ? 'bg-zinc-800 text-white border-transparent hover:bg-zinc-700 text-zinc-950 border-white/10 shadow-xl translate-x-[-1px] translate-y-[-1px]' 
                    : 'bg-zinc-900/40 text-zinc-400 border-white/5 hover:text-white hover:border-white/10'
                )}
              >
                {action.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        
        {filteredLogs.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm mt-8  tracking-widest font-bold">
            No audit logs match your search criteria.
          </div>
        ) : (
          <div className="space-y-8 relative z-10">
            {/* Pulsing Timeline Line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-1 bg-[#333]">
              <motion.div 
                animate={{ scaleY: [0, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-full h-1/2 bg-zinc-800 text-white border-transparent hover:bg-zinc-700 origin-top"
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
                <div className="relative z-10 flex items-center justify-center w-10 h-10 border border-white/5 bg-zinc-900/40 text-zinc-400 group-hover:text-zinc-300 group-hover:border-white/10 transition-colors rounded-xl transition duration-300 backdrop-blur-md">
                  <Fingerprint className="w-5 h-5" />
                </div>
                
                <div className="flex-1 p-5 border border-white/5 bg-zinc-950 rounded-xl transition duration-300 backdrop-blur-md group-hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold  tracking-widest text-zinc-300 bg-white/10 px-2 py-1 border border-white/10">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold tracking-widest bg-white/5 px-2 py-1 border border-white/5">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                  
                  <p className="text-sm text-zinc-300 mb-6 leading-relaxed font-mono  tracking-wide">
                    {log.details}
                  </p>
                  
                  <div className="space-y-3 pt-4 border-t-2 border-[#222]">
                    <div className="flex items-center justify-between bg-zinc-900/40 border border-white/5 p-2">
                      <span className="text-[9px] text-zinc-400  tracking-widest font-bold">Operator Proxy</span>
                      <span className="text-[10px] text-zinc-300 font-semibold tracking-widest ">{log.actor}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] text-zinc-400  tracking-widest font-bold">SHA-256 Provenance</span>
                      <div className="flex items-center gap-3 p-2 bg-zinc-900/40 border border-white/5 font-mono text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        <ShieldCheck className="w-4 h-4 opacity-50" />
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
