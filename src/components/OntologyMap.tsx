import React from 'react';
import { OntologyNode, OntologyLink, CorpusText } from '../data/ontology';
import { ProductionGraphViewer } from './ProductionGraphViewer';
import { CorpusIngestionBatch } from '../types';

interface OntologyMapProps {
  nodes?: OntologyNode[];
  links?: OntologyLink[];
  corpusTexts?: CorpusText[];
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  onHoverNode?: (nodeId: string | null) => void;
  onSelectQuestion?: (question: string) => void;
  onNavigateToTab?: (tab: any) => void;
  ingestionBatches?: CorpusIngestionBatch[];
  initialFocusSource?: string | null;
}

export const OntologyMap: React.FC<OntologyMapProps> = ({
  nodes,
  links,
  onNavigateToTab,
  ingestionBatches,
  initialFocusSource
}) => {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-neutral-900 bg-neutral-950">
      <ProductionGraphViewer
        customNodes={nodes}
        customLinks={links}
        onNavigateToTab={onNavigateToTab}
        ingestionBatches={ingestionBatches}
        initialFocusSource={initialFocusSource}
      />
    </div>
  );
};

