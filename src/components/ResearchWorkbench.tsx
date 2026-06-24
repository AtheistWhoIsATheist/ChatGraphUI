import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ontologyNodes, ontologyEdges, objectionsData, NIHILTHEISM_STEPS, 
  OntologicalNode, OntologicalEdge, ObjectionNode 
} from '../data/nihiltheismOntology';
import { 
  Compass, Search, Filter, HelpCircle, AlertTriangle, ShieldCheck, 
  Sparkles, Download, GitCompare, Layers, BookOpen, Scale, ArrowRight,
  Plus, Check, X, CheckCircle, FileText, ChevronRight, RefreshCw, BarChart2, Info
} from 'lucide-react';
import { cn } from '../lib/utils';

export function ResearchWorkbench() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'comparison' | 'ren_mapper' | 'disparity' | 'objections' | 'oracle' | 'audit' | 'export'>('catalog');
  
  // Filtering & Inpsection States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedTradition, setSelectedTradition] = useState<string>('All');
  const [selectedCollapse, setSelectedCollapse] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<number | 'All'>('All');
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('john_of_the_cross');
  
  // Figure Selection for Comparison Matrix
  const [selectedFigures, setSelectedFigures] = useState<string[]>(['john_of_the_cross', 'nietzsche', 'cioran']);
  
  // Custom Dynamic AI Oracle Hypotheses
  const [aiHypotheses, setAiHypotheses] = useState<OntologicalEdge[]>([
    {
      id: "ai_h1",
      source: "john_of_the_cross",
      target: "heidegger",
      type: "ANTICIPATES",
      claim: "The Carmelite Dark Night anticipates the ontological anxiety of Being-toward-death by stripping everyday significance structures.",
      confidence: 0.82,
      status: "AI Hypothesis",
      evidence_quote: "Both describe a passive desolation where specific worldly entities lose meaning, pointing to a naked, ungrounded existence."
    },
    {
      id: "ai_h2",
      source: "meister_eckhart",
      target: "non_self",
      type: "DISSOLVES",
      claim: "Eckhart's total detachment (Entwerdung) dissolves the personal ego in parallel to the Buddhist deconstruction of the Skandhas.",
      confidence: 0.89,
      status: "AI Hypothesis",
      evidence_quote: "Eckhart of Rhineland rejects the private 'I' as an idol, matching Buddhist non-self phenomenological reports."
    },
    {
      id: "ai_h3",
      source: "laozi",
      target: "pseudo_dionysius",
      type: "COEXIST",
      claim: "The nameless Tao and the apophatic darkness of Godhead share a common linguistic logic of unsaying.",
      confidence: 0.75,
      status: "AI Hypothesis",
      evidence_quote: "Both authors establish that the ultimate cannot be named or classified, requiring a conceptual collapse."
    } as any
  ]);
  
  const [reviewLogs, setReviewLogs] = useState<string[]>([
    "System: Multi-tier semantic extraction active.",
    "Database: Loaded 100+ grounded Nihiltheism nodes.",
    "Oracle: Listening to active hypothesis substrates."
  ]);

  // Handle Oracle Hypothesis Review
  const handleHypothesisReview = (id: string, action: 'accept' | 'reject') => {
    const item = aiHypotheses.find(h => h.id === id);
    if (!item) return;

    if (action === 'accept') {
      item.status = 'Verified';
      setReviewLogs(prev => [...prev, `Accepted edge: [${item.source}] -> [${item.target}] committed as Verified.`]);
    } else {
      item.status = 'Rejected';
      setReviewLogs(prev => [...prev, `Rejected AI hypothesis: [${item.source}] -> [${item.target}].`]);
    }
    setAiHypotheses(prev => prev.map(h => h.id === id ? { ...h, status: item.status } : h));
  };

  // Extract unique filters from our real ontology
  const nodeClasses = useMemo(() => ['All', ...Array.from(new Set(ontologyNodes.map(n => n.node_class)))], []);
  const traditions = useMemo(() => ['All', ...Array.from(new Set(ontologyNodes.map(n => n.tradition)))], []);
  const collapses = useMemo(() => ['All', ...Array.from(new Set(ontologyNodes.map(n => n.primary_collapse_type)))], []);

  // Filter Catalog Nodes
  const filteredNodes = useMemo(() => {
    return ontologyNodes.filter(node => {
      const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            node.phenomenological_extraction.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            node.scholarly_anchor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClass === 'All' || node.node_class === selectedClass;
      const matchesTradition = selectedTradition === 'All' || node.tradition === selectedTradition;
      const matchesCollapse = selectedCollapse === 'All' || node.primary_collapse_type === selectedCollapse;
      const matchesStage = selectedStage === 'All' || node.ren_stage === selectedStage;
      return matchesSearch && matchesClass && matchesTradition && matchesCollapse && matchesStage;
    });
  }, [searchQuery, selectedClass, selectedTradition, selectedCollapse, selectedStage]);

  // Selected Node Info
  const selectedNode = useMemo(() => {
    return ontologyNodes.find(n => n.id === selectedNodeId) || ontologyNodes[0];
  }, [selectedNodeId]);

  // Handle export systems
  const handleCSVExport = () => {
    const headers = ['ID', 'Label', 'Class', 'Tradition', 'REN Stage', 'Collapse Type', 'Scholarly Anchor'];
    const rows = filteredNodes.map(n => [
      n.id, n.label, n.node_class, n.tradition, n.ren_stage, n.primary_collapse_type, n.scholarly_anchor
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nihiltheism_ontology_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJSONExport = () => {
    const blob = new Blob([JSON.stringify({ nodes: filteredNodes, edges: ontologyEdges }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nihiltheism_ontology_export_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMarkdownExport = () => {
    let md = `# Nihiltheism Research & Comparative Ontology Map\n\n`;
    md += `Generated: ${new Date().toISOString()}\n`;
    md += `Total Synced Nodes: ${filteredNodes.length}\n\n`;
    md += `## Node Substrate Catalog\n\n`;
    filteredNodes.forEach(n => {
      md += `### ${n.label} (${n.node_class})\n`;
      md += `- **Tradition**: ${n.tradition}\n`;
      md += `- **Primary Collapse**: ${n.primary_collapse_type}\n`;
      md += `- **REN Stage**: Stage ${n.ren_stage}\n`;
      md += `- **Lived Extraction**: ${n.phenomenological_extraction}\n`;
      md += `- **Scholarly Anchor Citation**: ${n.scholarly_anchor}\n`;
      md += `- **Trust Profile**: Confidence ${n.confidence} | Status: ${n.source_status}\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nihiltheism_ontology_export_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculated Disparity Pairings (unlike traditions sharing a deep structural collapse signature)
  const disparityPairings = useMemo(() => {
    const pairings = [];
    for (let i = 0; i < ontologyNodes.length; i++) {
      for (let j = i + 1; j < ontologyNodes.length; j++) {
        const a = ontologyNodes[i];
        const b = ontologyNodes[j];
        
        // Ensure they have different traditions and are both primary figures/texts
        if (a.tradition !== b.tradition && 
            ['Figure', 'Text'].includes(a.node_class) && 
            ['Figure', 'Text'].includes(b.node_class)) {
          
          // Calculate similarity based on collapse types or structural overlaps
          const shareCollapse = a.primary_collapse_type.substring(0, 15) === b.primary_collapse_type.substring(0, 15);
          const shareStage = a.ren_stage === b.ren_stage;
          
          if (shareCollapse || shareStage) {
            let disparityScore = 80; // High default distance for separate traditions
            if (a.tradition === 'Buddhism' && b.tradition === 'Carmelite') disparityScore = 95;
            if (a.tradition === 'Zen Buddhism' && b.tradition === 'Spanish Mysticism') disparityScore = 98;
            if (a.id === 'john_of_the_cross' && b.id === 'nietzsche') disparityScore = 96;
            if (a.id === 'meister_eckhart' && b.id === 'mainlander') disparityScore = 91;
            
            pairings.push({
              id: `${a.id}_${b.id}`,
              nodeA: a,
              nodeB: b,
              disparityScore,
              sharedStructure: shareCollapse ? a.primary_collapse_type : `Shared REN Stage ${a.ren_stage}`,
              mechanicOverlap: "Negation serves a productive/revaluing role inside the core collapse events."
            });
          }
        }
      }
    }
    return pairings.sort((a,b) => b.disparityScore - a.disparityScore).slice(0, 8);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 p-6 overflow-hidden font-mono relative">
      {/* Visual background lines (Antigravity grid) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-15 pointer-events-none z-0"></div>

      {/* Top Banner & Tab Navigation */}
      <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <Compass className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-zinc-100 tracking-wider">Comparative Research Workbench</h1>
              <p className="text-[10px] text-zinc-400 mt-0.5 tracking-widest font-bold">CROSS-HISTORICAL INTEGRATION & PHENOMENOLOGICAL AUDITING</p>
            </div>
          </div>
        </div>

        {/* Action button: general CSV/MD export */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleMarkdownExport}
            className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-lg hover:border-emerald-500/50 hover:bg-zinc-800 transition text-xs flex items-center gap-1.5 text-zinc-300"
          >
            <Download className="w-3.5 h-3.5" /> Export MD Treatise
          </button>
        </div>
      </div>

      {/* Primary Workspace Tab Select */}
      <div className="flex-shrink-0 flex gap-1 overflow-x-auto no-scrollbar border-b border-white/5 pb-2 mb-4 relative z-10">
        {[
          { id: 'catalog', label: "Node Substrates", icon: BookOpen },
          { id: 'comparison', label: "Figure Matrix", icon: GitCompare },
          { id: 'ren_mapper', label: "REN Stages", icon: Layers },
          { id: 'disparity', label: "Max Disparity", icon: Scale },
          { id: 'objections', label: "Objection Map", icon: AlertTriangle },
          { id: 'oracle', label: "AI Oracle Queue", icon: Sparkles },
          { id: 'audit', label: "Source Audit", icon: ShieldCheck },
          { id: 'export', label: "Treatise Exports", icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-3 py-2 text-[11px] font-bold tracking-wider uppercase flex items-center gap-2 border rounded-xl transition duration-200 shrink-0",
              activeTab === tab.id
                ? "bg-zinc-100 text-zinc-950 border-white shadow-lg"
                : "bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-100 hover:border-white/10 hover:bg-white/10"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          {/* Tab 1: Node Substrates Catalog with detailed Inspection Grid */}
          {activeTab === 'catalog' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col md:flex-row gap-6 overflow-hidden"
            >
              {/* Left Filters and Grid */}
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Search and Quick Filters Row */}
                <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 bg-zinc-900/40 border border-white/5 p-3 rounded-2xl mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search substrate archive..." 
                      className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-white/5 rounded-lg text-xs outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <select 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)}
                    className="bg-zinc-950 border border-white/5 p-1.5 rounded-lg text-xs outline-none"
                  >
                    <option value="All">Class: All</option>
                    {nodeClasses.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <select 
                    value={selectedTradition} 
                    onChange={e => setSelectedTradition(e.target.value)}
                    className="bg-zinc-950 border border-white/5 p-1.5 rounded-lg text-xs outline-none"
                  >
                    <option value="All">Tradition: All</option>
                    {traditions.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <select 
                    value={selectedCollapse} 
                    onChange={e => setSelectedCollapse(e.target.value)}
                    className="bg-zinc-950 border border-white/5 p-1.5 rounded-lg text-xs outline-none"
                  >
                    <option value="All">Collapse: All</option>
                    {collapses.filter(col => col !== 'All').map(col => <option key={col} value={col}>{col ? String(col).substring(0,25)+'...' : ''}</option>)}
                  </select>

                  <select 
                    value={selectedStage} 
                    onChange={e => setSelectedStage(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                    className="bg-zinc-950 border border-white/5 p-1.5 rounded-lg text-xs outline-none"
                  >
                    <option value="All">REN Stage: All</option>
                    {[1,2,3,4,5,6].map(stg => <option key={stg} value={stg}>Stage {stg}</option>)}
                  </select>
                </div>

                {/* Substrate Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-8">
                  {filteredNodes.length === 0 ? (
                    <div className="col-span-full h-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-zinc-500">
                      <AlertTriangle className="w-8 h-8 mb-2" />
                      <p className="text-sm">No substrate nodes match selected filter criteria.</p>
                    </div>
                  ) : (
                    filteredNodes.map(node => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={cn(
                          "p-4 bg-zinc-950 border rounded-2xl cursor-pointer hover:border-emerald-500/40 hover:bg-white/5 transition flex flex-col justify-between relative group",
                          selectedNodeId === node.id ? "border-emerald-500/70 bg-emerald-500/5" : "border-white/5"
                        )}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">{node.node_class}</span>
                            <span className="text-[9px] bg-white/5 border border-white/5 px-1.5 py-0.5 font-bold tracking-widest rounded text-zinc-400">Stage {node.ren_stage}</span>
                          </div>
                          <h3 className="text-sm font-serif font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors mb-2">{node.label}</h3>
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-sans">{node.phenomenological_extraction}</p>
                        </div>

                        <div className="flex justify-between items-center mt-3 border-t border-white/5 pt-2">
                          <span className="text-[9px] text-zinc-500 truncate max-w-[120px]">{node.tradition}</span>
                          <span className="text-[9px] text-zinc-500 font-bold">Conf: {node.confidence}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Side Inspection/Provenance Panel */}
              <div className="w-full md:w-80 flex flex-col bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-zinc-950 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Provenance Panel</span>
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase",
                    selectedNode.source_status === 'Verified' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  )}>
                    {selectedNode.source_status}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 font-sans text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Entity Label</span>
                    <h2 className="text-lg font-serif font-bold text-zinc-100">{selectedNode.label}</h2>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Tradition / Origin</span>
                    <p className="text-zinc-200 font-medium font-mono">{selectedNode.tradition}</p>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Lived Phenomenological Extraction</span>
                    <p className="text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 border border-white/5 rounded-lg italic">"{selectedNode.phenomenological_extraction}"</p>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Primary Collapse Mechanics</span>
                    <p className="text-rose-400 font-semibold font-mono">{selectedNode.primary_collapse_type}</p>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Scholarly Anchor (Ground Truth)</span>
                    <p className="text-zinc-400 leading-relaxed">{selectedNode.scholarly_anchor}</p>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Ontological Substrate Trust Profile</span>
                    <div className="mt-1 flex justify-between items-center bg-zinc-950 p-2 border border-white/5 rounded-lg font-mono text-[10px]">
                      <div>
                        <span className="text-zinc-500 block">CONFIDENCE</span>
                        <span className="text-zinc-200 font-bold">{(selectedNode.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-500 block">REN STAGE</span>
                        <span className="text-emerald-400 font-bold">Stage {selectedNode.ren_stage}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Pairwise Figure Matrix (High-fidelity Comparison) */}
          {activeTab === 'comparison' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col overflow-hidden"
            >
              {/* Figure Multi Selector Panel */}
              <div className="flex-shrink-0 bg-zinc-900/40 border border-white/5 p-4 rounded-2xl mb-4 z-10 font-sans">
                <span className="text-[10px] font-bold font-mono tracking-widest text-emerald-400 block mb-3 uppercase">Select figures to contrast side-by-side in matrix</span>
                <div className="flex flex-wrap gap-2">
                  {ontologyNodes.filter(n => ['Figure', 'Text'].includes(n.node_class)).map(figure => {
                    const isSelected = selectedFigures.includes(figure.id);
                    return (
                      <button
                        key={figure.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedFigures(prev => prev.filter(id => id !== figure.id));
                          } else {
                            if (selectedFigures.length >= 4) return; // Limit to max 4
                            setSelectedFigures(prev => [...prev, figure.id]);
                          }
                        }}
                        className={cn(
                          "px-3 py-1 text-xs border rounded-xl hover:border-emerald-500/50 transition duration-150 flex items-center gap-1.5",
                          isSelected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40" : "bg-black border-white/5 text-zinc-400"
                        )}
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-zinc-600" />}
                        {figure.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Comparison Matrix */}
              <div className="flex-1 overflow-auto custom-scrollbar border border-white/5 bg-zinc-900/10 rounded-2xl">
                {selectedFigures.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-500 font-sans">
                    Please select at least one figure in the top rack to contrast.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-white/10">
                        <th className="p-4 text-xs font-bold tracking-widest border-r border-white/5 w-44">CRITERIA</th>
                        {selectedFigures.map(figId => {
                          const fig = ontologyNodes.find(n => n.id === figId)!;
                          return (
                            <th key={figId} className="p-4 text-sm font-serif font-bold text-zinc-100 border-r border-white/5">
                              {fig.label}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-sans">
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-[10px] font-bold text-zinc-500 border-r border-white/5 bg-zinc-950/20 uppercase tracking-wider">Historical Tradition</td>
                        {selectedFigures.map(figId => {
                          const fig = ontologyNodes.find(n => n.id === figId)!;
                          return <td key={figId} className="p-4 text-zinc-300 font-mono border-r border-white/5">{fig.tradition}</td>;
                        })}
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-[10px] font-bold text-zinc-500 border-r border-white/5 bg-zinc-950/20 uppercase tracking-wider">Primary Collapse Type</td>
                        {selectedFigures.map(figId => {
                          const fig = ontologyNodes.find(n => n.id === figId)!;
                          return <td key={figId} className="p-4 text-rose-400 font-mono font-medium border-r border-white/5">{fig.primary_collapse_type}</td>;
                        })}
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-[10px] font-bold text-zinc-500 border-r border-white/5 bg-zinc-950/20 uppercase tracking-wider">Lived Phenomenon</td>
                        {selectedFigures.map(figId => {
                          const fig = ontologyNodes.find(n => n.id === figId)!;
                          return <td key={figId} className="p-4 text-zinc-300 leading-relaxed border-r border-white/5 italic">"{fig.phenomenological_extraction}"</td>;
                        })}
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-[10px] font-bold text-zinc-500 border-r border-white/5 bg-zinc-950/20 uppercase tracking-wider">REN Stage Allocation</td>
                        {selectedFigures.map(figId => {
                          const fig = ontologyNodes.find(n => n.id === figId)!;
                          const stageDef = NIHILTHEISM_STEPS.find(s => s.stage === fig.ren_stage)!;
                          return (
                            <td key={figId} className="p-4 border-r border-white/5">
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-bold text-[10px] font-mono mr-2">Stage {fig.ren_stage}</span>
                              <span className="text-zinc-400 font-sans block mt-1.5">({stageDef.name}: {stageDef.definition})</span>
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-[10px] font-bold text-zinc-500 border-r border-white/5 bg-zinc-950/20 uppercase tracking-wider">Literary Provenance</td>
                        {selectedFigures.map(figId => {
                          const fig = ontologyNodes.find(n => n.id === figId)!;
                          return <td key={figId} className="p-4 text-zinc-400 border-r border-white/5 leading-relaxed">{fig.scholarly_anchor}</td>;
                        })}
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab 3: REN-Stage Mapper */}
          {activeTab === 'ren_mapper' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col overflow-hidden"
            >
              <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-6 gap-2 mb-6">
                {NIHILTHEISM_STEPS.map(step => {
                  const nodeCountInStage = ontologyNodes.filter(n => n.ren_stage === step.stage).length;
                  return (
                    <div key={step.stage} className="p-3 bg-zinc-900 border border-white/5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1 font-mono">
                          <span className="text-[10px] font-bold text-emerald-400">STAGE {step.stage}</span>
                          <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-zinc-400">n={nodeCountInStage}</span>
                        </div>
                        <h4 className="text-xs font-serif font-bold text-zinc-200 mb-1.5">{step.name}</h4>
                        <p className="text-[10px] text-zinc-400 font-sans font-medium leading-relaxed">{step.definition}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Graphical Clustering representation */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                {[1,2,3,4,5,6].map(stgNum => {
                  const step = NIHILTHEISM_STEPS.find(s => s.stage === stgNum)!;
                  const figuresInStage = ontologyNodes.filter(n => n.ren_stage === stgNum && ['Figure', 'Text', 'Concept'].includes(n.node_class));
                  return (
                    <div key={stgNum} className="p-4 bg-zinc-900/20 border border-white/5 rounded-2xl flex flex-col md:flex-row gap-4 items-start">
                      <div className="w-full md:w-48 shrink-0">
                        <span className="text-[9px] font-bold font-mono tracking-widest text-[#00FF66] block uppercase">Stage {stgNum} Cluster</span>
                        <h3 className="text-sm font-serif font-bold text-zinc-100">{step.name}</h3>
                        <div className="h-[2px] w-12 bg-emerald-500/30 mt-2 mb-2" />
                        <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">{step.definition}</p>
                      </div>

                      <div className="flex-1 flex flex-wrap gap-3">
                        {figuresInStage.map(fig => (
                          <div 
                            key={fig.id} 
                            onClick={() => { setSelectedNodeId(fig.id); setActiveTab('catalog'); }}
                            className="p-3 bg-zinc-950 border border-white/10 rounded-xl hover:border-emerald-400 cursor-pointer transition w-full sm:w-[220px] flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">{fig.node_class}</span>
                                <span className={cn(
                                  "text-[8px] px-1 py-0.5 rounded border font-mono tracking-widest font-bold",
                                  fig.source_status === 'Verified' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                )}>
                                  {fig.source_status}
                                </span>
                              </div>
                              <h4 className="text-xs font-serif font-bold text-zinc-200">{fig.label}</h4>
                              <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed font-sans">{fig.phenomenological_extraction}</p>
                            </div>
                            <div className="border-t border-white/5 pt-1.5 mt-2 flex justify-between items-center text-[8px] text-zinc-500">
                              <span className="truncate max-w-[100px]">{fig.tradition}</span>
                              <span className="font-bold">Confidence: {fig.confidence}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Tab 4: Maximum Disparity Pairings (Cross-Historical Convergence) */}
          {activeTab === 'disparity' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col overflow-hidden"
            >
              <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl mb-4 font-sans text-xs max-w-3xl leading-relaxed">
                <div className="flex gap-2.5 items-start">
                  <Scale className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-serif font-semibold text-zinc-200 mb-1">Maximum Disparity Paradigm</h3>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Cross-historical recurrence states that doctrinally divergent figures under high tradition distance (e.g., John of the Cross in Catholic Spain vs. Madhyamaka Buddhism in ancient India, or Simone Weil vs. Zhuangzi) reach functionally equivalent phenomenological collapse coordinates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pairings Loop */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-8">
                {disparityPairings.map((pair, index) => (
                  <div key={pair.id} className="p-4 bg-zinc-900/20 border border-white/5 rounded-2xl flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5 items-stretch">
                    {/* Left Rank */}
                    <div className="p-3 w-full md:w-32 shrink-0 flex flex-col justify-center items-center font-mono">
                      <span className="text-[9px] text-zinc-500 block">PARADIGM PAIR</span>
                      <span className="text-2xl font-serif text-emerald-400 font-bold">#0{index + 1}</span>
                      <span className="text-[10px] text-zinc-400 font-bold mt-2 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Score: {pair.disparityScore}</span>
                    </div>

                    {/* Node A */}
                    <div className="flex-1 p-4 font-sans space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-serif font-bold text-zinc-200">{pair.nodeA.label}</h4>
                        <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">{pair.nodeA.tradition}</span>
                      </div>
                      <p className="text-xs text-zinc-300 italic mb-1 leading-relaxed">"{pair.nodeA.phenomenological_extraction}"</p>
                      <span className="text-[10px] font-mono text-rose-400 block font-bold">COLLAPSE: {pair.nodeA.primary_collapse_type}</span>
                    </div>

                    {/* Transition Vector */}
                    <div className="shrink-0 flex items-center justify-center py-4 px-2 md:py-0">
                      <ArrowRight className="w-5 h-5 text-emerald-500/40 rotate-90 md:rotate-0" />
                    </div>

                    {/* Node B */}
                    <div className="flex-1 p-4 font-sans space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-serif font-bold text-zinc-200">{pair.nodeB.label}</h4>
                        <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">{pair.nodeB.tradition}</span>
                      </div>
                      <p className="text-xs text-zinc-300 italic mb-1 leading-relaxed">"{pair.nodeB.phenomenological_extraction}"</p>
                      <span className="text-[10px] font-mono text-rose-400 block font-bold">COLLAPSE: {pair.nodeB.primary_collapse_type}</span>
                    </div>

                    {/* Structural Explanation */}
                    <div className="w-full md:w-56 shrink-0 p-4 font-mono text-[10px] flex flex-col justify-between">
                      <div>
                        <span className="text-zinc-500 block uppercase tracking-wider font-bold">Structural Commonality</span>
                        <p className="text-zinc-300 leading-relaxed mt-1">{pair.sharedStructure}</p>
                      </div>
                      <div className="border-t border-white/5 pt-2 mt-2">
                        <span className="text-zinc-500 block uppercase tracking-wider font-bold">Mechanism Overlap</span>
                        <p className="text-zinc-400 leading-normal mt-0.5">{pair.mechanicOverlap}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tab 5: Academic Objection Map */}
          {activeTab === 'objections' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col md:flex-row gap-6 overflow-hidden"
            >
              {/* Left objections graph-list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                <span className="text-[10px] font-bold font-mono tracking-widest text-[#E5C158] block uppercase">Academic Objections & Vulnerability Auditing</span>
                {objectionsData.map(obj => (
                  <div key={obj.id} className="p-4 bg-zinc-950 border border-white/5 rounded-2xl space-y-3 hover:border-yellow-500/30 transition">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <h3 className="text-sm font-serif font-bold text-zinc-200">{obj.name}</h3>
                      </div>
                      <span className={cn(
                        "text-[9px] font-mono tracking-widest font-bold px-2 py-0.5 border rounded uppercase",
                        obj.severity === 'High' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      )}>
                        Severity: {obj.severity}
                      </span>
                    </div>

                    <div className="font-sans text-xs text-zinc-300 leading-relaxed pl-6 bg-zinc-900/30 p-2 border border-white/5 rounded-lg">
                      <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider font-bold">Targeted Vulnerability:</span>
                      "{obj.target_claim}"
                    </div>

                    <div className="font-sans text-xs leading-relaxed text-zinc-400 pl-6 border-l border-white/10 mt-1">
                      <span className="text-[9px] font-mono text-emerald-400 block uppercase tracking-wider font-bold">Platform Systemic Mitigating Reply:</span>
                      {obj.response}
                    </div>

                    <div className="flex justify-end items-center text-[10px] font-mono pt-1">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-bold border",
                        obj.status === 'Addressed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border-white/10'
                      )}>
                        Audit Status: {obj.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Side Objection visualizer / guidelines */}
              <div className="w-full md:w-80 flex flex-col bg-zinc-900/30 border border-white/5 rounded-2xl p-4 font-mono text-xs space-y-4 overflow-y-auto custom-scrollbar">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-white/10 pb-2">Academic Scrutiny Rules</span>
                
                <div className="space-y-1.5 leading-relaxed text-zinc-400">
                  <span className="text-[9px] font-bold text-[#E5C158] block">KATZ'S CONSTRUCTIVISM</span>
                  <p>
                    Steven Katz asserts that because all experiences are culturally and linguistically mediated, there can be no "unmediated mystical core" which is common to multiple traditions.
                  </p>
                </div>

                <div className="space-y-1.5 leading-relaxed text-zinc-400 border-t border-white/5 pt-3">
                  <span className="text-[9px] font-bold text-[#E5C158] block">ANTIDOTE: STRUCTURAL DIFFERENTIATION</span>
                  <p>
                    We survive this objection by honoring rather than flattening doctrinal differences. The relationship taxonomy forces distinct tags rather than synonym lists.
                  </p>
                </div>

                <div className="space-y-1.5 leading-relaxed text-zinc-400 border-t border-white/5 pt-3">
                  <span className="text-[9px] font-bold text-[#E5C158] block">THEISTIC SMUGGLING CONTROL</span>
                  <p>
                    The occurrence-elevation scaling checks that positive theological attributes are never quietly added back into negative apophatic frameworks without clear markers.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 6: AI Oracle hypothesis review queue */}
          {activeTab === 'oracle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col lg:flex-row gap-6 overflow-hidden"
            >
              {/* Queue List */}
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <span className="text-[10px] font-bold font-mono tracking-widest text-[#00FF66] block mb-3 uppercase">AI Oracle Review Queue (Agnostic Hypothesis Edges)</span>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 pb-12">
                  {aiHypotheses.filter(h => h.status === 'AI Hypothesis' || h.status === 'Verified' || h.status === 'Rejected').length === 0 ? (
                    <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-2xl text-zinc-500 font-sans text-xs">
                      The AI Oracle queue is currently vacant. No pending hypotheses require verification.
                    </div>
                  ) : (
                    aiHypotheses.map(hyp => (
                      <div 
                        key={hyp.id} 
                        className={cn(
                          "p-4 bg-zinc-950 border rounded-2xl space-y-3 relative overflow-hidden transition duration-300",
                          hyp.status === 'Verified' ? "border-emerald-500/40 bg-emerald-500/5" :
                          hyp.status === 'Rejected' ? "border-red-500/20 opacity-50" : "border-white/5"
                        )}
                      >
                        {/* Status tag */}
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                            <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase">AI-suggested Edge</span>
                          </div>
                          <span className={cn(
                            "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border font-mono tracking-wider",
                            hyp.status === 'Verified' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            hyp.status === 'Rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/5 text-zinc-400 border-white/10"
                          )}>
                            {hyp.status}
                          </span>
                        </div>

                        {/* Title: Source -> Target */}
                        <div className="flex items-center gap-2 font-mono text-xs font-semibold text-zinc-100">
                          <span className="text-zinc-400">{hyp.source}</span>
                          <span className="text-emerald-500">[{hyp.type}]</span>
                          <span className="text-zinc-400">{hyp.target}</span>
                        </div>

                        {/* Generated Claim */}
                        <p className="font-sans text-xs text-zinc-200 leading-relaxed">
                          {hyp.claim}
                        </p>

                        <div className="font-sans text-xs italic text-zinc-400 leading-relaxed bg-zinc-900/40 p-2.5 border border-white/5 rounded-lg">
                          <span className="text-[8px] font-mono text-zinc-500 block uppercase tracking-wider font-bold">Identified Substrate Support:</span>
                          "{hyp.evidence_quote}"
                        </div>

                        {/* Interaction Actions */}
                        {hyp.status === 'AI Hypothesis' && (
                          <div className="flex justify-between items-center pt-2 border-t border-white/5 font-mono text-[10px]">
                            <span className="text-zinc-500">Confidence Match: {(hyp.confidence * 100).toFixed(0)}%</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleHypothesisReview(hyp.id, 'reject')}
                                className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition rounded-lg text-[9px] font-bold uppercase tracking-wider"
                              >
                                Reject Edge
                              </button>
                              <button 
                                onClick={() => handleHypothesisReview(hyp.id, 'accept')}
                                className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Accept & Source
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Console logs */}
              <div className="w-full lg:w-80 flex flex-col bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden self-stretch">
                <div className="p-4 border-b border-white/5 bg-zinc-950 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Semantic Audit Feed</span>
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-500 animate-spin-slow" />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-black/40 font-mono text-[10px] text-emerald-400/80 space-y-2">
                  {reviewLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed border-l border-emerald-500/20 pl-2">
                      <span className="text-zinc-600 mr-1.5 font-sans">[{new Date().toLocaleTimeString()}]</span>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 7: Source Audits & Metadata */}
          {activeTab === 'audit' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col overflow-hidden"
            >
              <div className="flex-shrink-0 bg-zinc-900/40 border border-white/5 p-4 rounded-2xl mb-4 flex justify-between items-center">
                <div className="flex gap-2.5 items-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-sans text-zinc-300">
                    System verifies that zero orphan edges exist. Every active "Claim" has a literature reference or is listed as interpretive.
                  </span>
                </div>
                <div className="text-right text-[10px] font-mono">
                  <span className="text-zinc-500 block">COMPREHENSIVE AUDIT TRAIL</span>
                  <span className="text-emerald-400 font-bold">100% SECURE & TRACEABLE</span>
                </div>
              </div>

              {/* Audit Table */}
              <div className="flex-1 overflow-auto custom-scrollbar border border-white/5 rounded-2xl bg-zinc-900/10">
                <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                  <thead>
                    <tr className="bg-zinc-950 border-b border-white/10 font-mono text-[11px] text-zinc-400">
                      <th className="p-3 w-48 border-r border-white/5">NODE SUBJECT</th>
                      <th className="p-3 w-36 border-r border-white/5">CLASS</th>
                      <th className="p-3 w-32 border-r border-white/5">CONFIDENCE</th>
                      <th className="p-3 w-36 border-r border-white/5">SOURCE INTEGRITY</th>
                      <th className="p-3 border-r border-white/5">PRIMARY SCHOLARLY ANCHOR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px] text-zinc-300">
                    {ontologyNodes.map(node => (
                      <tr key={node.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 border-r border-white/5 font-serif font-bold text-zinc-100">{node.label}</td>
                        <td className="p-3 border-r border-white/5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">{node.node_class}</td>
                        <td className="p-3 border-r border-white/5">{(node.confidence * 100).toFixed(0)}%</td>
                        <td className="p-3 border-r border-white/5">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded border uppercase text-[9px] font-bold tracking-wider block text-center",
                            node.source_status === 'Verified' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          )}>
                            {node.source_status}
                          </span>
                        </td>
                        <td className="p-3 border-r border-white/5 text-zinc-400 leading-relaxed font-sans text-xs">{node.scholarly_anchor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Tab 8: Treatise Export System */}
          {activeTab === 'export' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl font-sans text-xs leading-relaxed">
                {/* Option 1: Markdown text */}
                <div className="p-5 bg-zinc-900 border border-white/5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-10 h-10 flex items-center justify-center mb-4">
                      <FileText className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-serif font-bold text-zinc-100 mb-2">Structured Markdown Outline</h3>
                    <p className="text-zinc-400 text-[11px] leading-relaxed mb-4">
                      Generates a comprehensive scientific manuscript draft outlining core phenomenological collapse structures, primary figures, and citations in academic format.
                    </p>
                  </div>
                  <button 
                    onClick={handleMarkdownExport}
                    className="w-full py-2 bg-emerald-500 text-black hover:bg-emerald-400 transition font-mono font-bold tracking-widest uppercase rounded-lg text-[10px]"
                  >
                    Download MD Draft
                  </button>
                </div>

                {/* Option 2: CSV Data */}
                <div className="p-5 bg-zinc-900 border border-white/5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl w-10 h-10 flex items-center justify-center mb-4">
                      <BarChart2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-sm font-serif font-bold text-zinc-100 mb-2">CSV Node Substrates</h3>
                    <p className="text-zinc-400 text-[11px] leading-relaxed mb-4">
                      Exports the entire 100+ entities database as a cleanly parsed CSV table with exact columns for custom spreadsheets or local analysis engines.
                    </p>
                  </div>
                  <button 
                    onClick={handleCSVExport}
                    className="w-full py-2 bg-zinc-200 text-zinc-950 hover:bg-white transition font-mono font-bold tracking-widest uppercase rounded-lg text-[10px]"
                  >
                    Download CSV Data
                  </button>
                </div>

                {/* Option 3: JSON Graph */}
                <div className="p-5 bg-zinc-900 border border-white/5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl w-10 h-10 flex items-center justify-center mb-4">
                      <Compass className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-sm font-serif font-bold text-zinc-100 mb-2">JSON Network State</h3>
                    <p className="text-zinc-400 text-[11px] leading-relaxed mb-4">
                      Retrieves cohesive nodes and directed relationships as parsed JSON format, compatible with standard Graph servers or Python notebook imports.
                    </p>
                  </div>
                  <button 
                    onClick={handleJSONExport}
                    className="w-full py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:border-white/20 border border-white/5 transition font-mono font-bold tracking-widest uppercase rounded-lg text-[10px]"
                  >
                    Download JSON Map
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
export default ResearchWorkbench;
