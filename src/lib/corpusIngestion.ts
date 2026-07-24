import { CanonicalChunk } from '../types';

/**
 * Calculates SHA-256 hash of a text string using standard Web Crypto API.
 */
export async function calculateSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalizes line endings to standard LF (\n) and strips Byte Order Mark (BOM).
 */
export function normalizeText(text: string): string {
  // Strip BOM if present
  let clean = text.startsWith('\uFEFF') ? text.slice(1) : text;
  // Normalize \r\n and \r to \n
  return clean.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Parses frontmatter metadata (YAML style between --- delimiters)
 */
export function parseFrontmatter(text: string): {
  metadata: Record<string, string>;
  contentWithoutFrontmatter: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/;
  const match = text.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, contentWithoutFrontmatter: text };
  }

  const rawMetadata = match[1];
  const contentWithoutFrontmatter = text.slice(match[0].length);
  const metadata: Record<string, string> = {};

  rawMetadata.split('\n').forEach((line) => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();
      // Strip surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      metadata[key] = value;
    }
  });

  return { metadata, contentWithoutFrontmatter };
}

/**
 * Splits document into semantic chunks (chapters, sections, headers, paragraphs, or stanzas)
 */
export function semanticChunking(text: string): CanonicalChunk[] {
  const normalized = normalizeText(text);
  const lines = normalized.split('\n');
  const chunks: CanonicalChunk[] = [];

  let currentChunkLines: string[] = [];
  let currentStartLine = 1;
  let currentType: CanonicalChunk['structuralType'] = 'paragraph';

  const finalizeChunk = (endLine: number) => {
    const chunkText = currentChunkLines.join('\n').trim();
    if (chunkText.length > 0) {
      const firstLine = chunkText.split('\n')[0] || '';
      const summary =
        firstLine.length > 80 ? firstLine.slice(0, 77) + '...' : firstLine;

      chunks.push({
        id: `chunk_${chunks.length + 1}_L${currentStartLine}-${endLine}`,
        startPosition: currentStartLine,
        endPosition: endLine,
        structuralType: currentType,
        summary: summary || 'Semantic passage',
        text: chunkText,
      });
    }
    currentChunkLines = [];
  };

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const isHeading = /^#{1,6}\s+/.test(line) || /^Chapter\s+\d+/i.test(line);
    const isBlank = line.trim().length === 0;

    if (isHeading) {
      if (currentChunkLines.length > 0) {
        finalizeChunk(lineNumber - 1);
      }
      currentStartLine = lineNumber;
      currentType = line.toLowerCase().includes('chapter') ? 'chapter' : 'section';
      currentChunkLines.push(line);
    } else if (isBlank) {
      if (currentChunkLines.length > 0) {
        finalizeChunk(lineNumber);
      }
      currentStartLine = lineNumber + 1;
      currentType = 'paragraph';
    } else {
      if (currentChunkLines.length === 0) {
        currentStartLine = lineNumber;
      }
      currentChunkLines.push(line);
    }
  });

  if (currentChunkLines.length > 0) {
    finalizeChunk(lines.length);
  }

  // Fallback if no chunks were created
  if (chunks.length === 0 && normalized.trim().length > 0) {
    chunks.push({
      id: 'chunk_1_L1-end',
      startPosition: 1,
      endPosition: lines.length,
      structuralType: 'fragment',
      summary: normalized.slice(0, 80),
      text: normalized,
    });
  }

  return chunks;
}
