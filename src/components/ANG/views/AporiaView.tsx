import React from 'react';
import { HelpCircle, Archive, MessageSquare } from 'lucide-react';
import { AporiaNode } from '../../../types/ang';

interface AporiaViewProps {
  aporias: AporiaNode[];
}

export const AporiaView: React.FC<AporiaViewProps> = ({ aporias }) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#0D0D0D] overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-8 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-6">
          <div>
            <h1 className="text-xl font-display text-[#C8C0B0] flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-[#6A6A2A]" />
              Questions & Aporia
            </h1>
            <p className="text-sm font-mono text-[#8A8278] mt-2 tracking-widest uppercase">
              "The questions that must remain open"
            </p>
          </div>
          <div className="flex gap-3 text-xs font-mono">
            <button className="px-4 py-2 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#C8C0B0] border border-[#2A2A2A] rounded-xl transition-colors">+ New Question</button>
            <select className="px-4 py-2 bg-[#121212] text-[#8A8278] border border-[#1E1E1E] rounded-xl outline-none focus:border-[#3A6A3A]">
              <option>Filter: All</option>
              <option>Status: Confirmed</option>
              <option>Status: Exploring</option>
            </select>
            <select className="px-4 py-2 bg-[#121212] text-[#8A8278] border border-[#1E1E1E] rounded-xl outline-none focus:border-[#3A6A3A]">
              <option>Sort: Recent</option>
              <option>Sort: Oldest</option>
            </select>
          </div>
        </div>

        {/* Aporia List */}
        <div className="flex flex-col gap-6">
          {aporias.map(aporia => (
            <div key={aporia.id} className="bg-[#121212] border-l-2 border-[#6A6A2A] border-y border-r border-y-[#1E1E1E] border-r-[#1E1E1E] rounded-r-2xl p-6 flex flex-col md:flex-row gap-6 hover:bg-[#161616] transition-colors group">
              
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase">
                  {aporia.status === 'CONFIRMED' ? (
                    <span className="text-[#6A6A2A] font-bold flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rotate-45 border border-current" />
                      CONFIRMED APORIA
                    </span>
                  ) : (
                    <span className="text-[#8A8278] flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full border border-current" />
                      OPEN QUESTION
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg text-[#C8C0B0] font-medium leading-relaxed">
                  "{aporia.text}"
                </h3>
                
                <div className="text-[10px] font-mono text-[#5A5450] flex gap-4 uppercase tracking-wider">
                  {aporia.sourceId && <span>Source: {aporia.sourceId}</span>}
                  <span>Added: {new Date(aporia.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#1E1E1E] mt-auto">
                  <button className="text-[10px] font-mono text-[#8A8278] hover:text-[#C8C0B0] flex items-center gap-1.5 uppercase font-bold tracking-widest transition-colors">
                    <MessageSquare className="w-3 h-3" /> Explore with Curator
                  </button>
                  {aporia.status === 'CONFIRMED' && (
                    <button className="text-[10px] font-mono text-[#8A8278] hover:text-[#6A3A6A] flex items-center gap-1.5 uppercase font-bold tracking-widest transition-colors">
                      View Paradox
                    </button>
                  )}
                  <button className="text-[10px] font-mono text-[#5A5450] hover:text-[#8A8278] flex items-center gap-1.5 uppercase font-bold tracking-widest transition-colors ml-auto">
                    <Archive className="w-3 h-3" /> Archive
                  </button>
                </div>
              </div>

              {/* Detail Panel Preview (Normally slide-out, shown inline for width > MD) */}
              <div className="hidden md:flex flex-col gap-4 w-72 shrink-0 border-l border-[#1E1E1E] pl-6 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div>
                  <h4 className="text-[10px] font-mono text-[#5A5450] uppercase tracking-widest font-bold mb-1">Why Unresolvable:</h4>
                  <p className="text-xs text-[#8A8278] leading-relaxed line-clamp-3">{aporia.whyUnresolvable}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-mono text-[#5A5450] uppercase tracking-widest font-bold mb-1">Functional Value:</h4>
                  <p className="text-xs text-[#8A8278] leading-relaxed line-clamp-2">{aporia.functionalValue}</p>
                </div>
              </div>

            </div>
          ))}

          {aporias.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-4 text-[#5A5450]">
              <HelpCircle className="w-12 h-12 opacity-50" />
              <p className="font-mono text-sm uppercase tracking-widest">No open tensions recorded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
