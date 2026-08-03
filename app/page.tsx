'use client';

import React, { useState, useEffect } from 'react';
import {
  mapComparison,
  getRegisterBadgeStyle,
  processCommand,
  filterMessagesByRegister,
  AgentMessage
} from '../nihil-engine.js';
import {
  Brain,
  Activity,
  Layers,
  Sparkles,
  Send,
  RotateCcw,
  BarChart3,
  Filter,
  Check,
  ChevronRight,
  Network,
  ExternalLink
} from 'lucide-react';

const PRESET_COMPARISONS = [
  { label: 'Nietzsche vs. Sartre', cmd: '/map "Nietzsche: Will to Power" "Sartre: Being and Nothingness"' },
  { label: 'Śūnyatā vs. Western Nihilism', cmd: '/map "Nagarjuna: Mulamadhyamakakarika" "Schopenhauer: World as Will"' },
  { label: 'Camus vs. Cioran', cmd: '/map "Camus: Myth of Sisyphus" "Cioran: Heights of Despair"' },
  { label: 'Socratic Epoché vs. Cartesian Doubt', cmd: '/map "Plato: Apology" "Descartes: Meditations"' },
];

export interface ReasoningEnginePageProps {
  onNavigateToNode?: (nodeId: string) => void;
}

export default function ReasoningEnginePage({ onNavigateToNode }: ReasoningEnginePageProps = {}) {
  const [messages, setMessages] = useState<AgentMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nihil_reasoning_messages');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.error('Failed to load reasoning messages from localStorage:', err);
      }
    }
    return [
      {
        id: 'init-1',
        sender: 'agent',
        type: 'agent_response',
        content: 'Nihil Reasoning Engine active. Epoché suspension framework loaded across Structural, Doctrinal, and Rhetorical registers. Submit a question or run /map to analyze conceptual disparity.',
        registers: ['STRUCTURAL', 'DOCTRINAL', 'RHETORICAL'],
        relatedNodeId: 'epoche',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 'init-2',
        sender: 'agent',
        type: 'map_response',
        content: 'Comparison between "Nietzsche: Will to Power" and "Sartre: Being and Nothingness" yields a total Disparity Index of 68/100. Sub-metric breakdown: Structural Divergence (72%), Doctrinal Gap (85%), Rhetorical Variance (47%).',
        registers: ['STRUCTURAL', 'DOCTRINAL', 'RHETORICAL'],
        comparison: mapComparison('Nietzsche: Will to Power', 'Sartre: Being and Nothingness'),
        relatedNodeId: 'nihil',
        timestamp: new Date().toLocaleTimeString()
      }
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nihil_reasoning_messages', JSON.stringify(messages));
      } catch (err) {
        console.error('Failed to save reasoning messages to localStorage:', err);
      }
    }
  }, [messages]);

  const [inputVal, setInputVal] = useState('');
  const [activeRegisterFilter, setActiveRegisterFilter] = useState<'STRUCTURAL' | 'DOCTRINAL' | 'RHETORICAL' | null>(null);
  const [selectedDocA, setSelectedDocA] = useState('Nietzsche: Will to Power');
  const [selectedDocB, setSelectedDocB] = useState('Sartre: Being and Nothingness');

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: inputVal,
      registers: [],
      timestamp: new Date().toLocaleTimeString()
    };

    const agentResp = processCommand(inputVal) as AgentMessage;

    setMessages(prev => [...prev, userMsg, agentResp]);
    setInputVal('');
  };

  const handleRunMapPreset = (cmd: string) => {
    setInputVal(cmd);
    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: cmd,
      registers: [],
      timestamp: new Date().toLocaleTimeString()
    };
    const agentResp = processCommand(cmd) as AgentMessage;
    setMessages(prev => [...prev, userMsg, agentResp]);
    setInputVal('');
  };

  const handleRunCustomMap = () => {
    const cmd = `/map "${selectedDocA}" "${selectedDocB}"`;
    handleRunMapPreset(cmd);
  };

  const filteredMessages = filterMessagesByRegister(messages, activeRegisterFilter);

  // Latest map comparison for top visual panel
  const latestMapMessage = [...messages].reverse().find(m => m.comparison)?.comparison || mapComparison(selectedDocA, selectedDocB);

  return (
    <div className="w-full min-h-screen bg-black text-neutral-100 flex flex-col font-sans border-t border-neutral-900">
      {/* Header Bar */}
      <header className="px-6 py-4 bg-neutral-950/80 border-b border-neutral-900 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold font-mono tracking-wide flex items-center gap-2 text-white">
              <span>Nihil Reasoning Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE PREVIEW
              </span>
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Visual Disparity Graph & Register Analysis Framework
            </p>
          </div>
        </div>

        {/* Interactive Clickable Register Chips Header Selector */}
        <div className="flex items-center gap-2 bg-neutral-900/60 p-1.5 rounded-xl border border-neutral-800">
          <span className="text-[10px] uppercase font-mono text-neutral-500 px-2 flex items-center gap-1 font-bold">
            <Filter className="w-3 h-3 text-neutral-400" />
            <span>Filter Register:</span>
          </span>

          {(['STRUCTURAL', 'DOCTRINAL', 'RHETORICAL'] as const).map(regType => {
            const style = getRegisterBadgeStyle(regType);
            const isActive = activeRegisterFilter === regType;
            return (
              <button
                key={regType}
                onClick={() => setActiveRegisterFilter(isActive ? null : regType)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? `${style.bgClass} ${style.textClass} ${style.borderClass} ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/40`
                    : 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style.dotColor }} />
                <span>{style.label}</span>
                {isActive && <Check className="w-3 h-3 text-white" />}
              </button>
            );
          })}

          {activeRegisterFilter && (
            <button
              onClick={() => setActiveRegisterFilter(null)}
              className="px-2 py-1 text-[10px] font-mono text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
            >
              Show All
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual Disparity Graph & /map Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Visual Disparity Graph Panel */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Visual Disparity Index</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                0–100 Metrics
              </span>
            </div>

            {/* Document Titles */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-300 bg-neutral-900/40 p-3 rounded-xl border border-neutral-850">
              <div className="truncate">
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Source A</span>
                <span className="text-cyan-300 font-bold truncate block">{latestMapMessage.docA}</span>
              </div>
              <div className="truncate text-right">
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Source B</span>
                <span className="text-purple-300 font-bold truncate block">{latestMapMessage.docB}</span>
              </div>
            </div>

            {/* Total Disparity Index Bar */}
            <div className="flex flex-col gap-2 bg-black/60 p-4 rounded-xl border border-neutral-900">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-neutral-400 font-semibold uppercase tracking-wider">Overall Disparity Index</span>
                <span className="text-2xl font-black text-amber-400">{latestMapMessage.disparityIndex}<span className="text-xs text-neutral-500 font-normal">/100</span></span>
              </div>
              <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-orange-500 to-fuchsia-500 transition-all duration-700 shadow-md"
                  style={{ width: `${latestMapMessage.disparityIndex}%` }}
                />
              </div>
            </div>

            {/* Exact Sub-Metrics Breakdown */}
            <div className="flex flex-col gap-3 font-mono text-xs pt-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Exact Sub-Metrics Breakdown
              </span>

              {/* 1. Structural Divergence (Blue) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-blue-950/20 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-blue-400">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Structural Divergence</span>
                  </span>
                  <span className="font-bold text-blue-300">{latestMapMessage.subMetrics.structuralDivergence}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-blue-900/50">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${latestMapMessage.subMetrics.structuralDivergence}%` }}
                  />
                </div>
              </div>

              {/* 2. Doctrinal Gap (Orange) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-orange-950/20 border border-orange-500/30">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-orange-400">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    <span>Doctrinal Gap</span>
                  </span>
                  <span className="font-bold text-orange-300">{latestMapMessage.subMetrics.doctrinalGap}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-orange-900/50">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${latestMapMessage.subMetrics.doctrinalGap}%` }}
                  />
                </div>
              </div>

              {/* 3. Rhetorical Variance (Fuchsia) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-fuchsia-950/20 border border-fuchsia-500/30">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-fuchsia-400">
                    <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
                    <span>Rhetorical Variance</span>
                  </span>
                  <span className="font-bold text-fuchsia-300">{latestMapMessage.subMetrics.rhetoricalVariance}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-fuchsia-900/50">
                  <div
                    className="h-full bg-fuchsia-500 rounded-full transition-all duration-500"
                    style={{ width: `${latestMapMessage.subMetrics.rhetoricalVariance}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Custom Interactive /map Launcher */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <h2 className="text-xs font-mono font-bold uppercase text-neutral-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Interactive /map Comparitor</span>
            </h2>

            <div className="flex flex-col gap-2.5">
              <div>
                <label className="text-[10px] font-mono text-neutral-500 block mb-1 uppercase font-bold">Document / Concept A</label>
                <input
                  type="text"
                  value={selectedDocA}
                  onChange={(e) => setSelectedDocA(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-500 block mb-1 uppercase font-bold">Document / Concept B</label>
                <input
                  type="text"
                  value={selectedDocB}
                  onChange={(e) => setSelectedDocB(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleRunCustomMap}
                className="mt-1 w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Activity className="w-4 h-4 text-amber-300" />
                <span>Execute /map Comparison</span>
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-900">
              <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold">Quick Presets</span>
              <div className="flex flex-col gap-1.5">
                {PRESET_COMPARISONS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRunMapPreset(preset.cmd)}
                    className="text-left px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 text-xs font-mono text-neutral-300 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span>{preset.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Agent Message Feed */}
        <div className="lg:col-span-7 flex flex-col bg-neutral-950 border border-neutral-900 rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">
          
          {/* Feed Header */}
          <div className="p-4 bg-neutral-900/40 border-b border-neutral-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Reasoning Feed</span>
              {activeRegisterFilter && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Filtered: [{activeRegisterFilter}]
                </span>
              )}
            </div>

            <button
              onClick={() => setMessages([])}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Clear Feed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[650px]">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 font-mono text-xs">
                No messages found matching register filter [{activeRegisterFilter}].
              </div>
            ) : (
              filteredMessages.map((msg: AgentMessage) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-xl border transition-all ${
                    msg.sender === 'user'
                      ? 'bg-neutral-900/60 border-neutral-800 text-neutral-200 ml-8'
                      : 'bg-black border-neutral-850 text-neutral-100 mr-2 shadow-lg shadow-black/80'
                  }`}
                >
                  {/* Sender Header & Register Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-neutral-900/80">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      {msg.sender === 'user' ? (
                        <span className="text-amber-400">● User Inquiry</span>
                      ) : (
                        <span className="text-purple-400 flex items-center gap-1">
                          <Brain className="w-3 h-3 text-purple-400" />
                          <span>Nihil Agent</span>
                        </span>
                      )}
                      <span className="text-neutral-600 font-normal">({msg.timestamp})</span>
                    </span>

                    {/* Agent Message Colored Register Badges */}
                    {msg.sender === 'agent' && (
                      <div className="flex items-center gap-1.5">
                        {(['STRUCTURAL', 'DOCTRINAL', 'RHETORICAL'] as const).map(regType => {
                          const style = getRegisterBadgeStyle(regType);
                          const isHighlighted = activeRegisterFilter === regType;
                          return (
                            <button
                              key={regType}
                              onClick={() => setActiveRegisterFilter(isHighlighted ? null : regType)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${style.bgClass} ${style.textClass} ${style.borderClass} ${
                                isHighlighted ? 'ring-2 ring-purple-400' : 'hover:opacity-80'
                              }`}
                            >
                              {style.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Text Content */}
                  <p className="text-xs font-mono leading-relaxed text-neutral-300">
                    {msg.content}
                  </p>

                  {/* Clickable Node Anchor Chip when relatedNodeId is present */}
                  {msg.relatedNodeId && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => {
                          if (onNavigateToNode) {
                            onNavigateToNode(msg.relatedNodeId!);
                          } else if (typeof window !== 'undefined') {
                            window.location.hash = `#node-${msg.relatedNodeId}`;
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 hover:border-purple-400 transition-all cursor-pointer group shadow-sm"
                        title={`Navigate directly to node "${msg.relatedNodeId}" in Ontology Map`}
                      >
                        <Network className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span>Node Anchor: [{msg.relatedNodeId}]</span>
                        <ExternalLink className="w-3 h-3 text-purple-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </div>
                  )}

                  {/* Inline Comparison Breakdown if /map response */}
                  {msg.comparison && (
                    <div className="mt-3 p-3 rounded-lg bg-neutral-950 border border-neutral-850 flex flex-col gap-2 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-amber-400 font-bold border-b border-neutral-900 pb-1">
                        <span>Disparity Breakdown</span>
                        <span>{msg.comparison.disparityIndex}/100</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center pt-1">
                        <div className="p-1.5 rounded bg-blue-950/30 border border-blue-500/30 text-blue-300">
                          <span className="block text-[9px] text-blue-400 uppercase font-bold">Structural</span>
                          <span className="font-bold">{msg.comparison.subMetrics.structuralDivergence}%</span>
                        </div>
                        <div className="p-1.5 rounded bg-orange-950/30 border border-orange-500/30 text-orange-300">
                          <span className="block text-[9px] text-orange-400 uppercase font-bold">Doctrinal</span>
                          <span className="font-bold">{msg.comparison.subMetrics.doctrinalGap}%</span>
                        </div>
                        <div className="p-1.5 rounded bg-fuchsia-950/30 border border-fuchsia-500/30 text-fuchsia-300">
                          <span className="block text-[9px] text-fuchsia-400 uppercase font-bold">Rhetorical</span>
                          <span className="font-bold">{msg.comparison.subMetrics.rhetoricalVariance}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Command Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-neutral-900/60 border-t border-neutral-900 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type a question or command (e.g., /map &quot;Text A&quot; &quot;Text B&quot;)..."
              className="flex-1 bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-purple-950/50"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
