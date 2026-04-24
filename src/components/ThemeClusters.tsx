import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

// Initialize Gemini if key exists
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const themeNodes = [
  { id: "Ego Dissolution", group: 1, radius: 25 },
  { id: "Ontological Abyss", group: 1, radius: 30 },
  { id: "Meaning Vacuum", group: 1, radius: 20 },
  { id: "Void-Contact", group: 1, radius: 35 },
  { id: "Groundlessness", group: 1, radius: 28 },
  
  { id: "Temporal Rupture", group: 2, radius: 15 },
  { id: "Silence/Apophasis", group: 2, radius: 28 },
  { id: "Paradox Sustained", group: 2, radius: 18 },
  
  { id: "Transcendent Echo", group: 3, radius: 22 },
  
  { id: "Affective Terror", group: 4, radius: 18 },
  { id: "Existential Dread", group: 4, radius: 25 },
  
  { id: "Ascetic Renunciation", group: 5, radius: 20 },
  { id: "Kenosis", group: 5, radius: 15 },
];

const themeLinks = [
  { source: "Ego Dissolution", target: "Ontological Abyss", value: 5 },
  { source: "Ego Dissolution", target: "Void-Contact", value: 4 },
  { source: "Ontological Abyss", target: "Groundlessness", value: 6 },
  { source: "Groundlessness", target: "Meaning Vacuum", value: 3 },
  { source: "Temporal Rupture", target: "Silence/Apophasis", value: 4 },
  { source: "Silence/Apophasis", target: "Transcendent Echo", value: 5 },
  { source: "Affective Terror", target: "Existential Dread", value: 6 },
  { source: "Affective Terror", target: "Ontological Abyss", value: 3 },
  { source: "Ascetic Renunciation", target: "Kenosis", value: 5 },
  { source: "Kenosis", target: "Ego Dissolution", value: 4 },
  { source: "Paradox Sustained", target: "Transcendent Echo", value: 4 },
  { source: "Paradox Sustained", target: "Void-Contact", value: 3 },
];

export function ThemeClusters() {
  const d3Container = useRef<SVGSVGElement | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => {
    if (themeNodes.length === 0 || !d3Container.current) return;

    const width = d3Container.current.parentElement?.clientWidth || 800;
    const height = d3Container.current.parentElement?.clientHeight || 600;

    const svg = d3.select(d3Container.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height] as any)
      .attr('style', 'max-width: 100%; height: auto;');
      
    // Clear previous elements
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation(themeNodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(themeLinks).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => d.radius + 5).iterations(2));

    const link = g.append("g")
      .attr("stroke", "#3f3f46")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(themeLinks)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    const color = d3.scaleOrdinal()
      .domain(["1", "2", "3", "4", "5"])
      .range(["#d946ef", "#00e5ff", "#f97316", "#ef4444", "#8b5cf6"]);

    const node = g.append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(themeNodes)
      .join("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => color(d.group.toString()) as string)
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        setSelectedGroup(d.group);
      })
      .call(drag(simulation) as any);

    node.append("title")
      .text(d => d.id);

    const labels = g.append("g")
      .selectAll("text")
      .data(themeNodes)
      .join("text")
      .text(d => d.id)
      .attr("font-size", "10px")
      .attr("fill", "#e4e4e7")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
        
      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y + d.radius + 12);
    });

    function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }, []);

  const synthesizeGroup = async () => {
    if (selectedGroup === null || !ai) return;

    const groupNodes = themeNodes.filter(n => n.group === selectedGroup).map(n => n.id);
    if (groupNodes.length === 0) return;

    setIsSynthesizing(true);
    setSynthesis(null);

    try {
      const prompt = `As a Philosophical Densifier executing the Recursive Densification Protocol (RDP), synthesize an overarching phenomenological narrative for the following cluster of themes from the Nihiltheism Graph: ${groupNodes.join(', ')}. 
      
Identify the high-level insight connecting these concepts. Treat this as a Phase 3 Synthesis & Genealogy task. Maintain apophatic discipline (void as operator, not entity). Output a highly dense, academic synthesis in Markdown.`;
      
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt,
      });

      setSynthesis(response.text || 'No synthesis generated.');
    } catch (e) {
      console.error(e);
      setSynthesis('Failed to generate synthesis. Please ensure the API key is valid and you are online.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="w-full h-full flex bg-[#0a0a0a] text-zinc-100 font-sans">
      <div className="flex-1 flex flex-col p-8 overflow-hidden relative">
        <div className="flex-shrink-0 mb-6">
          <h1 className="text-2xl font-light tracking-tight text-emerald-400">Theme Topological Clusters</h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-2xl leading-relaxed">
            Force-directed visualization of THEME node relationships. Clusters indicate highly correlated phenomenological experiences within the archive. Click on a node to select its cluster for AI synthesis.
          </p>
        </div>
        <div className="flex-1 bg-black rounded-xl border border-white/10 overflow-hidden relative">
          <svg ref={d3Container} className="w-full h-full cursor-move" />
        </div>
      </div>
      
      {/* Right Sidebar for Synthesis */}
      <div className="w-80 bg-zinc-900 border-l border-white/10 flex flex-col pt-8">
         <div className="px-6 pb-6 border-b border-white/10">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-emerald-400 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Cluster Insights
            </h2>
            {selectedGroup !== null ? (
              <div className="mt-4">
                <p className="text-xs text-zinc-400 mb-2">Selected Cluster {selectedGroup}:</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {themeNodes.filter(n => n.group === selectedGroup).map(n => (
                    <span key={n.id} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-zinc-300">
                      {n.id}
                    </span>
                  ))}
                </div>
                <button
                  onClick={synthesizeGroup}
                  disabled={isSynthesizing || !ai}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium py-2 rounded flex items-center justify-center gap-2 transition-colors"
                >
                  {isSynthesizing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
                  {ai ? 'Synthesize Narrative' : 'API Key Required'}
                </button>
                {!ai && <p className="text-[10px] text-red-400 mt-2">VITE_GEMINI_API_KEY environment variable missing.</p>}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic mt-4">Select a node in the graph to view cluster details.</p>
            )}
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
           {isSynthesizing && (
             <div className="flex items-center justify-center h-full text-zinc-500">
               <Loader2 className="w-6 h-6 animate-spin" />
             </div>
           )}
           {synthesis && !isSynthesizing && (
             <div className="prose prose-invert prose-p:text-xs prose-headings:text-sm prose-a:text-emerald-400 max-w-none">
               <Markdown>{synthesis}</Markdown>
             </div>
           )}
         </div>
      </div>
    </div>
  );
}
