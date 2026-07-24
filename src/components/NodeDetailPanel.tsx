import React from 'react';
import { OntologyNode, CorpusText } from '../data/ontology';
import { BookOpen, Sparkles, AlertCircle } from 'lucide-react';

interface NodeDetailPanelProps {
  node: OntologyNode;
  corpusTexts: CorpusText[];
  onSelectQuestion: (question: string) => void;
  onNavigateToTab: (tab: 'graph' | 'journal' | 'corpus' | 'paradox') => void;
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  node,
  corpusTexts,
  onSelectQuestion,
  onNavigateToTab
}) => {
  // Find related corpus fragments based on text content and tags
  const relatedCorpus = corpusTexts.filter(text => {
    const nodeTerms = [node.label.toLowerCase(), node.id.toLowerCase(), ...node.type.toLowerCase().split(' ')];
    const matchesTag = text.tags.some(tag => 
      nodeTerms.some(term => term.includes(tag.toLowerCase()) || tag.toLowerCase().includes(term))
    );
    const matchesContent = text.fragment.toLowerCase().includes(node.id.toLowerCase()) || 
                           text.title.toLowerCase().includes(node.id.toLowerCase());
    return matchesTag || matchesContent;
  });

  return (
    <div id="node-inspector-panel" className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col h-full justify-between gap-6 abyssal-glow">
      <div className="flex flex-col gap-4">
        {/* Header Metadata */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 bg-neutral-900 px-2.5 py-1 rounded-full border border-neutral-850">
              {node.type}
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight text-white mt-2">
              {node.label}
            </h2>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Resonance</span>
            <span className="font-display text-lg font-semibold text-white">
              {node.resonance}%
            </span>
          </div>
        </div>

        {/* Era/Temporal Metadata */}
        <div className="flex items-center gap-2 border-b border-neutral-900 pb-3 text-xs text-neutral-400 font-mono">
          <span className="text-neutral-600">Philosophical Era:</span>
          <span>{node.era}</span>
        </div>

        {/* Abstract/Summary */}
        <p className="text-neutral-300 text-sm leading-relaxed font-sans mt-1">
          {node.summary}
        </p>

        {/* Related Corpus Sources */}
        <div className="mt-2">
          <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
            <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
            Resonating Corpus Fragments
          </h4>
          {relatedCorpus.length > 0 ? (
            <div className="flex flex-col gap-2">
              {relatedCorpus.map(text => (
                <div 
                  key={text.id} 
                  className="bg-neutral-900/50 border border-neutral-900 p-3 rounded-xl hover:border-neutral-800 transition-colors cursor-pointer group"
                  onClick={() => onNavigateToTab('corpus')}
                >
                  <p className="text-xs text-neutral-400 italic line-clamp-2 leading-relaxed font-sans">
                    "{text.fragment}"
                  </p>
                  <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-neutral-500">
                    <span className="group-hover:text-neutral-300 transition-colors">
                      {text.author} — {text.title}
                    </span>
                    <span>{text.period}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-600 font-mono italic">
              No direct textual echoes mapped in primary archives.
            </p>
          )}
        </div>
      </div>

      {/* Socratic Inquiry List */}
      <div className="border-t border-neutral-900 pt-4 mt-auto">
        <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
          Apophatic Inquiry Lines
        </h4>
        <div className="flex flex-col gap-2">
          {node.questions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuestion(question)}
              className="w-full text-left bg-neutral-900/30 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 px-4 py-3 rounded-xl text-xs text-neutral-300 leading-relaxed transition-all duration-200 flex items-start gap-2.5 group"
            >
              <span className="text-[10px] font-mono text-neutral-600 mt-0.5 group-hover:text-neutral-400 transition-colors">
                Q{idx + 1}.
              </span>
              <span className="flex-1 group-hover:text-neutral-100 transition-colors">
                {question}
              </span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-neutral-500">
          <AlertCircle className="w-3 h-3 text-neutral-600 flex-shrink-0" />
          <span>Select any inquiry line above to enter the Reflection Chamber.</span>
        </div>
      </div>
    </div>
  );
};
