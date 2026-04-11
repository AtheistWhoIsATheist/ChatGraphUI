import { readFileToText, chunkText, extractGraphElements, mergeIntoGraph, ExtractedElement } from './ingestionPipeline';
import { Node, Link } from '../data/corpus';

export interface IngestionFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'idle' | 'ingesting' | 'parsing' | 'complete' | 'error';
  uploadDate: string;
  raw: File;
}

export async function runIngestion(
  file: IngestionFile,
  existingNodes: Node[],
  existingLinks: Link[],
  onStatusUpdate: (id: string, status: IngestionFile['status']) => void
) {
  try {
    console.log(`[INGESTION] Starting ingestion for: ${file.name} (${file.type})`);
    onStatusUpdate(file.id, 'ingesting');

    // 1. Read
    const rawText = await readFileToText(file.raw);
    console.log(`[INGESTION] File read successfully. Length: ${rawText.length}`);

    onStatusUpdate(file.id, 'parsing');

    // 2. Chunk
    const chunks = chunkText(rawText);
    console.log(`[INGESTION] Text chunked into ${chunks.length} parts.`);

    // 3. Extract per chunk + accumulate
    let accumulated: ExtractedElement = { nodes: [], edges: [] };
    for (let i = 0; i < chunks.length; i++) {
      console.log(`[INGESTION] Extracting chunk ${i + 1}/${chunks.length}...`);
      const extracted = await extractGraphElements(chunks[i]);
      accumulated.nodes.push(...extracted.nodes);
      accumulated.edges.push(...extracted.edges);
    }
    console.log(`[INGESTION] Extraction complete. Found ${accumulated.nodes.length} nodes and ${accumulated.edges.length} edges.`);

    // 4. Merge
    const result = mergeIntoGraph(accumulated, existingNodes, existingLinks);
    console.log(`[INGESTION] Merge complete. New nodes: ${result.delta.newNodes.length}, New links: ${result.delta.newLinks.length}`);

    onStatusUpdate(file.id, 'complete');

    return result;
  } catch (error: any) {
    console.error('[INGESTION] Failed:', error);
    onStatusUpdate(file.id, 'error');
    throw error;
  }
}
