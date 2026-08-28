import React from 'react';
import { Search } from 'lucide-react';
import { CorpusBrowser } from '../../CorpusBrowser';
import { CorpusText } from '../../../data/ontology';
import { Marginalia } from '../../../types';

interface LibraryViewProps {
  corpusTexts: CorpusText[];
  marginalia: Marginalia[];
  onSaveMarginalia: (corpusId: string, noteText: string) => void;
  onDeleteMarginalia: (id: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ 
  corpusTexts, 
  marginalia, 
  onSaveMarginalia, 
  onDeleteMarginalia 
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#0D0D0D]">
      <div className="border-b border-[#1E1E1E] p-4 flex gap-4 shrink-0 bg-[#121212]">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#5A5450] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search sources, passages, speakers... (Ctrl+F)"
            className="w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl pl-9 pr-4 py-2 text-sm text-[#C8C0B0] placeholder:text-[#5A5450] focus:outline-none focus:border-[#3A6A3A] transition-colors"
          />
        </div>
        <select className="px-4 py-2 bg-[#0D0D0D] text-[#8A8278] text-xs font-mono uppercase tracking-widest border border-[#1E1E1E] rounded-xl outline-none focus:border-[#3A6A3A]">
          <option>All Types ▼</option>
        </select>
        <select className="px-4 py-2 bg-[#0D0D0D] text-[#8A8278] text-xs font-mono uppercase tracking-widest border border-[#1E1E1E] rounded-xl outline-none focus:border-[#3A6A3A]">
          <option>All Traditions ▼</option>
        </select>
        <select className="px-4 py-2 bg-[#0D0D0D] text-[#8A8278] text-xs font-mono uppercase tracking-widest border border-[#1E1E1E] rounded-xl outline-none focus:border-[#3A6A3A]">
          <option>NT Relevance ▼</option>
        </select>
      </div>
      <div className="flex-1 overflow-hidden">
        {/* We reuse the existing CorpusBrowser here for now, but style it via the parent context if needed */}
        <CorpusBrowser 
          corpusTexts={corpusTexts} 
          marginalia={marginalia} 
          onSaveMarginalia={onSaveMarginalia} 
          onDeleteMarginalia={onDeleteMarginalia} 
        />
      </div>
    </div>
  );
};
