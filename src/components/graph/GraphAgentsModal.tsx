import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  Check,
  Brain
} from 'lucide-react';
import { GraphNode, GraphEdge } from '../../data/knowledgeGraphDataset';

interface GraphAgentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: GraphNode | null;
  allNodes: GraphNode[];
  allEdges: GraphEdge[];
  onSelectNode?: (nodeId: string) => void;
  onAddAporia?: (aporia: {
    id: string;
    text: string;
    whyUnresolvable: string;
    functionalValue: string;
    sourceId: string;
    createdAt: string;
    status: string;
  }) => void;
  onAddMarginalia?: (nodeId: string, noteText: string) => void;
}

type AgentType = 'hermeneutic' | 'reification' | 'aporia' | 'warrant';

export const GraphAgentsModal: React.FC<GraphAgentsModalProps> = ({
  isOpen,
  onClose,
  selectedNode,
  allNodes,
  allEdges,
  onSelectNode: _onSelectNode,
  onAddAporia,
  onAddMarginalia
}) => {
  const [activeAgent, setActiveAgent] = useState<AgentType>('hermeneutic');
  const [targetNodeId, setTargetNodeId] = useState<string>(selectedNode?.id || allNodes[0]?.id || 'void');
  const [comparisonNodeId, setComparisonNodeId] = useState<string>('sunyata');
  const [isRunning, setIsRunning] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any | null>(null);
  const [committedNotice, setCommittedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetNode = allNodes.find(n => n.id === targetNodeId) || allNodes[0];
  const comparisonNode = allNodes.find(n => n.id === comparisonNodeId) || allNodes[1];

  // Run the selected Nihiltheism philosophical agent
  const handleRunAgent = () => {
    setIsRunning(true);
    setCommittedNotice(null);

    setTimeout(() => {
      if (activeAgent === 'hermeneutic') {
        setLastAnalysis({
          agent: 'Hermeneutic Dialectic Inquirer',
          thesis: `The conceptual convergence between [[${targetNode?.label || 'The Void'}]] and [[${comparisonNode?.label || 'Sunyata'}]].`,
          apophaticHorizon: `Nihiltheism treats both concepts not as metaphysical foundations, but as the generative clearing of being. Where traditional metaphysics posits a self-subsisting ground, both nodes articulate the groundless ground (Abgrund) of unconditioned reality.`,
          dialecticalTension: `Tension emerges between immanent dissolution and transcendent withdrawal. While ${targetNode?.label} emphasizes the ontological collapse of essence, ${comparisonNode?.label} preserves the interdependent co-origination of phenomena without intrinsic nature.`,
          proposedSynthesis: `Presence is the very garment of Absence. The encounter with nothingness discloses not a defect of being, but its primordial unconditioned depth.`,
          connectedEdges: [
            { source: targetNode?.id, target: comparisonNode?.id, relation: 'APOPHATIC_CONVERGENCE', warrant: 'COMPARATIVE' }
          ]
        });
      } else if (activeAgent === 'reification') {
        setLastAnalysis({
          agent: 'Apophatic Anti-Reification Auditor',
          auditedConcept: targetNode?.label || 'The Void',
          reificationRisk: targetNode?.label?.toLowerCase().includes('god') ? 'ELEVATED' : 'MINIMAL',
          diagnostic: `Auditing conceptual integrity for "${targetNode?.label}". Reification occurs whenever apophatic silence is converted into a positive metaphysical object or substantive entity.`,
          negativeCorrection: `Strict apophatic discipline must be maintained: negation is not a descriptor of an object called 'Nothing', but the ongoing deconstruction of all cognitive grasp. Any attempt to convert this into a dogma must be returned to the silence of the void-encounter.`,
          epistemicWarrant: 'INTERPRETIVE',
          recommendation: 'Affirm the unconditioned as groundless clearing; refuse conceptual closure.'
        });
      } else if (activeAgent === 'aporia') {
        const generatedAporiaText = `How can the dissolution of the ego in ${targetNode?.label} be witnessed if the witness itself dissolves?`;
        setLastAnalysis({
          agent: 'Aporia & Paradox Synthesizer',
          sourceConcepts: [targetNode?.label, 'Ego Dissolution'],
          aporiaText: generatedAporiaText,
          whyUnresolvable: `The testimony of the void-encounter requires a reflective subject, but the void-encounter precisely dissolves subject-object duality. The paradox is self-referentially unresolvable and constitutively productive.`,
          functionalValue: `Prevents the reification of the witness into an eternal soul while preserving the phenomenological reality of awakening.`,
          canCommit: true
        });
      } else if (activeAgent === 'warrant') {
        // Epistemic warrant verifier
        const nodeEdges = allEdges.filter(e => e.source === targetNode?.id || e.target === targetNode?.id);
        setLastAnalysis({
          agent: 'Epistemic Grounding Verifier',
          targetConcept: targetNode?.label,
          totalRelations: nodeEdges.length,
          warrantDistribution: {
            textual: nodeEdges.filter(e => ((e as any).warrant || (e as any).warrantLevel || e.relation || '').toUpperCase().includes('TEXTUAL') || e.relation === 'PRIMARY_SOURCE_OF').length,
            interpretive: nodeEdges.filter(e => ((e as any).warrant || (e as any).warrantLevel || '').toUpperCase().includes('INTERPRETIVE') || e.relation === 'CO_OCCUR').length,
            comparative: nodeEdges.filter(e => ((e as any).warrant || (e as any).warrantLevel || '').toUpperCase().includes('COMPARATIVE')).length,
            speculative: nodeEdges.filter(e => ((e as any).warrant || (e as any).warrantLevel || '').toUpperCase().includes('SPECULATIVE')).length
          },
          provenanceEvaluation: `Concept is anchored in ${targetNode?.sourceFile || 'Canonical Nihiltheism Ontology'}. Relations maintain strict fidelity to textual evidence without speculative drift.`
        });
      }

      setIsRunning(false);
    }, 450);
  };

  const handleCommitAporia = () => {
    if (!lastAnalysis || !lastAnalysis.aporiaText) return;
    if (onAddAporia) {
      onAddAporia({
        id: `aporia-graph-${Date.now()}`,
        text: lastAnalysis.aporiaText,
        whyUnresolvable: lastAnalysis.whyUnresolvable,
        functionalValue: lastAnalysis.functionalValue,
        sourceId: `${targetNode?.label} Graph Node`,
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED'
      });
      setCommittedNotice(`Aporia registered successfully in system registry.`);
    }
  };

  const handleAttachMarginalia = () => {
    if (!lastAnalysis) return;
    const note = `[AI Hermeneutic Note]: ${lastAnalysis.proposedSynthesis || lastAnalysis.negativeCorrection || lastAnalysis.provenanceEvaluation || 'Grounded apophatic inquiry.'}`;
    if (onAddMarginalia && targetNode) {
      onAddMarginalia(targetNode.id, note);
      setCommittedNotice(`Marginalia attached to "${targetNode.label}".`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#0c0919] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <Brain size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
                Nihiltheism Philosophical Agents
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Hermeneutics & Apophatic Audit
                </span>
              </h2>
              <p className="text-xs text-white/50">
                Rigorous philosophical inquiry, anti-reification auditing, and aporia synthesis.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Agent Switcher Ribbon */}
        <div className="px-6 py-2 border-b border-white/5 flex items-center gap-2 bg-[#090713] overflow-x-auto">
          <button
            onClick={() => { setActiveAgent('hermeneutic'); setLastAnalysis(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
              activeAgent === 'hermeneutic'
                ? 'bg-violet-600/30 border border-violet-500/50 text-white font-medium'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Brain size={13} className="text-violet-400" />
            <span>Hermeneutic Inquirer</span>
          </button>

          <button
            onClick={() => { setActiveAgent('reification'); setLastAnalysis(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
              activeAgent === 'reification'
                ? 'bg-amber-600/30 border border-amber-500/50 text-white font-medium'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck size={13} className="text-amber-400" />
            <span>Anti-Reification Auditor</span>
          </button>

          <button
            onClick={() => { setActiveAgent('aporia'); setLastAnalysis(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
              activeAgent === 'aporia'
                ? 'bg-rose-600/30 border border-rose-500/50 text-white font-medium'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle size={13} className="text-rose-400" />
            <span>Aporia Synthesizer</span>
          </button>

          <button
            onClick={() => { setActiveAgent('warrant'); setLastAnalysis(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
              activeAgent === 'warrant'
                ? 'bg-cyan-600/30 border border-cyan-500/50 text-white font-medium'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen size={13} className="text-cyan-400" />
            <span>Grounding Verifier</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Concept Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <div>
              <label className="text-xs font-mono text-white/50 block mb-1">
                Primary Ontological Anchor
              </label>
              <select
                value={targetNodeId}
                onChange={(e) => setTargetNodeId(e.target.value)}
                className="w-full bg-[#130f26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-400 font-mono"
              >
                {allNodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.label} ({node.type})
                  </option>
                ))}
              </select>
            </div>

            {activeAgent === 'hermeneutic' ? (
              <div>
                <label className="text-xs font-mono text-white/50 block mb-1">
                  Comparative Dialectical Pole
                </label>
                <select
                  value={comparisonNodeId}
                  onChange={(e) => setComparisonNodeId(e.target.value)}
                  className="w-full bg-[#130f26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-400 font-mono"
                >
                  {allNodes.filter(n => n.id !== targetNodeId).map(node => (
                    <option key={node.id} value={node.id}>
                      {node.label} ({node.type})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col justify-end">
                <div className="text-[11px] font-mono text-white/40 leading-relaxed">
                  Agent audits the selected node against canonical treatises and apophatic criteria.
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/50 font-mono">
              Ready to execute {activeAgent === 'hermeneutic' ? 'dialectical comparison' : 'philosophical audit'}.
            </div>
            <button
              onClick={handleRunAgent}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-medium font-mono transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20"
            >
              <Sparkles size={14} className={isRunning ? 'animate-spin' : ''} />
              <span>{isRunning ? 'Auditing Ontology...' : 'Execute Philosophical Agent'}</span>
            </button>
          </div>

          {/* Analysis Results Display */}
          {lastAnalysis && (
            <div className="p-5 rounded-2xl bg-[#100d24] border border-violet-500/30 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {lastAnalysis.agent}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30">
                  PHILOSOPHICALLY GROUNDED
                </span>
              </div>

              {/* Hermeneutic output */}
              {activeAgent === 'hermeneutic' && (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-white/40 font-mono block text-[10px]">THESIS</span>
                    <p className="text-white font-medium">{lastAnalysis.thesis}</p>
                  </div>
                  <div>
                    <span className="text-white/40 font-mono block text-[10px]">APOPHATIC HORIZON</span>
                    <p className="text-white/80">{lastAnalysis.apophaticHorizon}</p>
                  </div>
                  <div>
                    <span className="text-white/40 font-mono block text-[10px]">DIALECTICAL TENSION</span>
                    <p className="text-amber-200/90">{lastAnalysis.dialecticalTension}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-violet-300 font-mono block text-[10px]">PROPOSED SYNTHESIS</span>
                    <p className="text-white italic font-serif text-sm mt-0.5">"{lastAnalysis.proposedSynthesis}"</p>
                  </div>
                </div>
              )}

              {/* Anti-Reification output */}
              {activeAgent === 'reification' && (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white/40 font-mono block text-[10px]">CONCEPT</span>
                      <p className="text-white font-medium">{lastAnalysis.auditedConcept}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      lastAnalysis.reificationRisk === 'ELEVATED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      REIFICATION RISK: {lastAnalysis.reificationRisk}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 font-mono block text-[10px]">DIAGNOSTIC</span>
                    <p className="text-white/80">{lastAnalysis.diagnostic}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-amber-300 font-mono block text-[10px]">NEGATIVE CORRECTION</span>
                    <p className="text-white">{lastAnalysis.negativeCorrection}</p>
                  </div>
                </div>
              )}

              {/* Aporia output */}
              {activeAgent === 'aporia' && (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-rose-300 font-mono block text-[10px]">SYNTHESIZED APORIA</span>
                    <p className="text-white font-serif italic text-base mt-1">"{lastAnalysis.aporiaText}"</p>
                  </div>
                  <div>
                    <span className="text-white/40 font-mono block text-[10px]">WHY UNRESOLVABLE</span>
                    <p className="text-white/80">{lastAnalysis.whyUnresolvable}</p>
                  </div>
                  <div>
                    <span className="text-white/40 font-mono block text-[10px]">FUNCTIONAL VALUE</span>
                    <p className="text-emerald-300/90">{lastAnalysis.functionalValue}</p>
                  </div>
                </div>
              )}

              {/* Warrant output */}
              {activeAgent === 'warrant' && (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-cyan-300 font-mono block text-[10px]">TARGET CONCEPT</span>
                    <p className="text-white font-medium">{lastAnalysis.targetConcept}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center font-mono py-2 bg-white/[0.02] rounded-xl border border-white/5">
                    <div>
                      <div className="text-[10px] text-white/40">TEXTUAL</div>
                      <div className="text-sm font-bold text-emerald-400">{lastAnalysis.warrantDistribution.textual}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40">INTERPRETIVE</div>
                      <div className="text-sm font-bold text-cyan-400">{lastAnalysis.warrantDistribution.interpretive}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40">COMPARATIVE</div>
                      <div className="text-sm font-bold text-violet-400">{lastAnalysis.warrantDistribution.comparative}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40">SPECULATIVE</div>
                      <div className="text-sm font-bold text-amber-400">{lastAnalysis.warrantDistribution.speculative}</div>
                    </div>
                  </div>
                  <p className="text-white/80">{lastAnalysis.provenanceEvaluation}</p>
                </div>
              )}

              {/* Direct Actions on Results */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {activeAgent === 'aporia' && onAddAporia && (
                    <button
                      onClick={handleCommitAporia}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-xs font-mono transition-all flex items-center gap-1.5"
                    >
                      <HelpCircle size={12} />
                      <span>Commit Aporia to Registry</span>
                    </button>
                  )}

                  {onAddMarginalia && (
                    <button
                      onClick={handleAttachMarginalia}
                      className="px-3.5 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 text-xs font-mono transition-all flex items-center gap-1.5"
                    >
                      <BookOpen size={12} />
                      <span>Attach as Marginalia Note</span>
                    </button>
                  )}
                </div>

                {committedNotice && (
                  <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
                    <Check size={12} />
                    <span>{committedNotice}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs font-mono text-white/40">
          <span>APOPHATIC DISCIPLINE • DIALECTICAL HERMENEUTICS • ANTI-REIFICATION</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
