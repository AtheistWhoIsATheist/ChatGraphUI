import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs
const PDFJS_VERSION = '5.6.205'; // Match package.json
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

export async function readFileToText(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (file.type === 'application/pdf' || extension === 'pdf') {
    return extractTextFromPDF(file);
  }

  // Handle markdown, text, json
  if (file.type.startsWith('text/') || 
      file.type === 'application/json' || 
      ['md', 'txt', 'json'].includes(extension || '')) {
    console.log(`[PIPELINE] Reading file as text: ${file.name} (Type: ${file.type}, Ext: ${extension})`);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsText(file);
    });
  }

  console.error(`[PIPELINE] Unsupported file type: ${file.type} (.${extension})`);
  throw new Error(`The Abyssal Archives do not support the format: .${extension} (${file.type || 'unknown type'})`);
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

export function chunkText(text: string, chunkSize = 3000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize - overlap;
  }
  return chunks;
}

export interface ExtractedElement {
  nodes: {
    id: string;
    label: string;
    type: string;
    definition: string;
    tradition?: string;
  }[];
  edges: {
    source: string;
    target: string;
    relation: string;
    confidence: number;
  }[];
}

export async function extractGraphElements(chunk: string): Promise<ExtractedElement> {
  const response = await fetch('/api/extract-graph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: chunk })
  });

  if (!response.ok) {
    throw new Error('Failed to extract graph elements');
  }

  return response.json();
}

import { Node, Link, NodeType, NodeStatus } from '../data/corpus';

export function mergeIntoGraph(
  extracted: ExtractedElement, 
  existingNodes: Node[], 
  existingLinks: Link[]
) {
  const existingIds = new Set(existingNodes.map(n => n.id));
  const existingEdgeKeys = new Set(
    existingLinks.map(e => `${e.source}→${e.target}→${e.type || e.label}`)
  );

  const newNodes: Node[] = extracted.nodes
    .filter(n => !existingIds.has(n.id))
    .map(n => ({
      id: n.id,
      label: n.label,
      type: (n.type.toLowerCase() as NodeType) || 'concept',
      status: 'RAW' as NodeStatus,
      blocks: [
        {
          id: `blk_${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          content: n.definition,
          metadata: { lastEdited: Date.now() }
        }
      ],
      metadata: {
        tags: [n.type, n.tradition].filter(Boolean) as string[],
        date_added: new Date().toISOString()
      }
    }));

  const newLinks: Link[] = extracted.edges
    .filter(e => {
      const key = `${e.source}→${e.target}→${e.relation}`;
      return !existingEdgeKeys.has(key);
    })
    .map(e => ({
      source: e.source,
      target: e.target,
      label: e.relation,
      type: 'explores' // Default type, could be mapped from relation
    }));

  return {
    nodes: [...existingNodes, ...newNodes],
    links: [...existingLinks, ...newLinks],
    delta: { newNodes, newLinks }
  };
}
