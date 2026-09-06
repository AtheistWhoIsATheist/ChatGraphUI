import React from 'react';
import { X, Layers } from 'lucide-react';
import { NoteDocument } from './types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (note: NoteDocument) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate
}) => {
  if (!isOpen) return null;

  const TEMPLATES: Array<{
    name: string;
    description: string;
    folder: string;
    note: Partial<NoteDocument>;
  }> = [
    {
      name: 'Apophatic Axiom Matrix',
      description: 'Systematic negation template mapping an attribute against apophatic void theology.',
      folder: '20 – Philosophy',
      note: {
        title: 'New Apophatic Axiom',
        subtitle: 'Via Negativa decomposition of categorical limits.',
        introParagraph: 'In asserting that the Ultimate is beyond predicative existence, we must dismantle affirmative definitions without falling into mere nihilistic absence.',
        quote: '“To know God truly is to confess that one knows nothing of Him.”\n— Gregory of Nyssa',
        corePrinciples: [
          { number: 1, title: 'Radical Ineffability', description: 'The absolute transcends every signifier.' },
          { number: 2, title: 'Double Negation', description: 'Neither Being nor Non-Being; neither One nor Many.' },
          { number: 3, title: 'Ecstatic Release', description: 'Intellectual collapse yields contemplative tranquility.' }
        ],
        relatedIdeas: ['#apophatic', '#void', '#theology', '#invariance']
      }
    },
    {
      name: 'Dialectic Aporia Log',
      description: 'Template for documenting productive philosophical impasses and paradoxes.',
      folder: '40 – Systems',
      note: {
        title: 'Aporia: Paradox of the Groundless',
        subtitle: 'Phenomenological capture of unresolvable tension.',
        introParagraph: 'An aporia is not a failure of reason, but reason arriving at its authentic structural boundary. Here we document the conflicting claims and their generative tension.',
        quote: '“The paradox is the source of the thinker’s passion, and the thinker without a paradox is like a lover without feeling.”\n— Søren Kierkegaard',
        corePrinciples: [
          { number: 1, title: 'Thesis', description: 'Consciousness requires a persistent center of reference.' },
          { number: 2, title: 'Antithesis', description: 'Deep dissolution reveals no center, only passing flux.' },
          { number: 3, title: 'Generative Synthesis', description: 'The center is an ongoing performance, not a static entity.' }
        ],
        relatedIdeas: ['#aporia', '#dialectic', '#paradox', '#phenomenology']
      }
    },
    {
      name: 'Dissertation Section Draft',
      description: 'Academic manuscript section structured with literature review and PNT topology.',
      folder: '50 – References',
      note: {
        title: 'Section: Pentagonal Nihil-Topology',
        subtitle: 'Formalizing the geometric distribution of apophatic coordinates.',
        introParagraph: 'This section investigates the mathematical absorption coefficients across the five cardinal nihil-nodes, integrating BibTeX citations from primary Kyoto School literature.',
        quote: '“True Emptiness is not the negation of being, but the ground where both being and non-being come to stand.”\n— Keiji Nishitani',
        corePrinciples: [
          { number: 1, title: 'Topological Absorption', description: 'Quantifying eigenvalue decay across null coordinates.' },
          { number: 2, title: 'Corpus Integration', description: 'Cross-validating 24 primary fragments against the dissertation thesis.' },
          { number: 3, title: 'Peer-Review Readiness', description: 'Ensuring rigorous academic notation and BibTeX conformity.' }
        ],
        relatedIdeas: ['#academic', '#pnt', '#dissertation', '#kyoto-school']
      }
    }
  ];

  const handleSelect = (tmpl: typeof TEMPLATES[0]) => {
    const newId = `note-${Date.now()}`;
    const newDoc: NoteDocument = {
      id: newId,
      title: tmpl.note.title || 'Untitled Note',
      subtitle: tmpl.note.subtitle || '',
      folder: tmpl.folder,
      path: `${tmpl.folder.split('–')[1]?.trim() || 'Philosophy'} / ${tmpl.note.title}`,
      introParagraph: tmpl.note.introParagraph || '',
      quote: tmpl.note.quote,
      corePrinciples: tmpl.note.corePrinciples,
      relatedIdeas: tmpl.note.relatedIdeas || ['#void'],
      closingQuote: '“Every thought is a momentary island in an unmeasured sea.”',
      backlinksCount: 0,
      wordCount: 140,
      charCount: 890,
      isCustom: true
    };
    onApplyTemplate(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-xl obsidian-card rounded-2xl border border-white/10 shadow-2xl z-10 flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-violet-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Ontological Note Templates
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-white/40 hover:text-white">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-2.5">
          {TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.name}
              onClick={() => handleSelect(tmpl)}
              className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-violet-500/40 hover:bg-white/[0.06] cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-violet-300 font-serif">
                  {tmpl.name}
                </span>
                <span className="text-[10px] font-mono text-white/40 px-2 py-0.5 rounded bg-white/5">
                  {tmpl.folder}
                </span>
              </div>
              <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                {tmpl.description}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-[10px] text-white/30 font-mono">
          Click any template to instantiate a live interactive document in your active vault.
        </div>
      </div>
    </div>
  );
};
