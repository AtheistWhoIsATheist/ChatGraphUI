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

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm mt-8">
            No audit logs match your search criteria.
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {filteredLogs.map((log, index) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#111] text-zinc-500 group-[.is-active]:text-emerald-500 group-[.is-active]:border-emerald-500/30 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Fingerprint className="w-4 h-4" />
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-[#111] shadow-xl hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 mb-3 leading-relaxed">
                    {log.details}
                  </p>
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <span className="text-[10px] text-zinc-600 uppercase">Actor:</span>
                    <span className="text-xs text-zinc-400">{log.actor}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-zinc-600 uppercase">Hash:</span>
                    <span className="text-[10px] font-mono text-zinc-500 truncate" title={log.hash}>{log.hash}</span>
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
