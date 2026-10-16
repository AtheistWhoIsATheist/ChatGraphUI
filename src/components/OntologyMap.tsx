import React, { useState } from 'react';
import { ProductionGraphViewer } from './ProductionGraphViewer';
import { OntologyNode, OntologyLink, CorpusText } from '../data/ontology';
import { CorpusIngestionBatch, Marginalia } from '../types';

export interface OntologyMapProps {
  nodes?: OntologyNode[];
  links?: OntologyLink[];
  corpusTexts?: CorpusText[];
  marginalia?: Marginalia[];
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  onHoverNode?: (nodeId: string | null) => void;
  onSelectQuestion?: (question: string) => void;
  onNavigateToTab?: (tab: any) => void;
  ingestionBatches?: CorpusIngestionBatch[];
  initialFocusSource?: string | null;
  onSaveBatch?: (batch: CorpusIngestionBatch) => void;
  onDeleteBatch?: (id: string) => void;
  aporias?: any[];
  onAddAporia?: (aporia: any) => void;
  onSaveMarginalia?: (nodeId: string, noteText: string) => void;
}

export const OntologyMap: React.FC<OntologyMapProps> = ({
  nodes,
  links,
  corpusTexts: _corpusTexts,
  marginalia: _marginalia = [],
  selectedNodeId: _selectedNodeId,
  hoveredNodeId: _hoveredNodeId,
  onSelectNode: _onSelectNode,
  onHoverNode: _onHoverNode,
  onSelectQuestion: _onSelectQuestion,
  onNavigateToTab,
  ingestionBatches = [],
  initialFocusSource,
  onSaveBatch,
  onDeleteBatch,
  aporias: _aporias = [],
  onAddAporia,
  onSaveMarginalia
}) => {
  const [voidDepth, setVoidDepth] = useState<number>(0.35);

  return (
    <div
      id="nihiltheism-knowledge-graph-root"
      className="h-full w-full flex flex-col bg-[#06040c] text-neutral-200 overflow-hidden font-sans select-none relative"
    >
      <ProductionGraphViewer
        customNodes={nodes}
        customLinks={links}
        onNavigateToTab={onNavigateToTab}
        ingestionBatches={ingestionBatches}
        initialFocusSource={initialFocusSource}
        voidDepth={voidDepth}
        onVoidDepthChange={setVoidDepth}
        onSaveBatch={onSaveBatch}
        onDeleteBatch={onDeleteBatch}
        onAddAporia={onAddAporia}
        onSaveMarginalia={onSaveMarginalia}
      />
    </div>
  );
};
