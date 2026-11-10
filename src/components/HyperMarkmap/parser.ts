import { HyperNode, CANONICAL_TRADITIONS } from './types';

/**
 * Extracts dialectical or philosophical operators from text
 */
export function extractOperator(text: string): { cleanText: string; operator?: string } {
  const match = text.match(/([∅⚖⇄🜏⟁])/);
  if (match) {
    return {
      cleanText: text.replace(match[0], '').trim(),
      operator: match[0]
    };
  }
  return { cleanText: text };
}

/**
 * Detects matching traditions in text based on keywords
 */
export function detectTraditions(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const t of CANONICAL_TRADITIONS) {
    if (lower.includes(t.kw.toLowerCase())) {
      matched.push(t.id);
    }
  }
  return matched;
}

/**
 * Recursively computes descendant counts for all nodes in the tree
 */
export function computeDescendantCounts(node: HyperNode): number {
  const children = node.children || node._children || [];
  let count = children.length;
  for (const child of children) {
    count += computeDescendantCounts(child);
  }
  node.descendantCount = count;
  return count;
}

/**
 * Computes tradition counts across the entire tree
 */
export function computeTraditionCounts(root: HyperNode): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of CANONICAL_TRADITIONS) {
    counts[t.id] = 0;
  }

  function traverse(n: HyperNode) {
    if (n.traditions && n.traditions.length > 0) {
      for (const tid of n.traditions) {
        if (counts[tid] !== undefined) {
          counts[tid] += 1;
        }
      }
    }
    const children = n.children || n._children || [];
    for (const child of children) {
      traverse(child);
    }
  }

  traverse(root);
  return counts;
}

/**
 * Parses CommonMark / Markdown into a hierarchical HyperNode tree
 */
export function parseMarkdownToTree(markdown: string): HyperNode {
  if (!markdown || !markdown.trim()) {
    return {
      id: 'root',
      name: 'HyperMarkmap Root',
      depth: 0,
      children: [],
      traditions: []
    };
  }

  const lines = markdown.split(/\r?\n/);
  const root: HyperNode = {
    id: 'root',
    name: 'Untitled Map',
    depth: 0,
    children: [],
    traditions: []
  };

  // Stack of active ancestor nodes
  // Each element is { node: HyperNode, level: number }
  const stack: { node: HyperNode; level: number }[] = [{ node: root, level: 0 }];

  let hasExplicitRoot = false;
  let nodeIdCounter = 1;
  let activeHeadingBaseLevel = 100;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) continue;
    if (trimmed.startsWith('```') || trimmed.startsWith('---')) continue;

    // Check for ATX Headings: # Heading
    const headingMatch = rawLine.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const headingCount = headingMatch[1].length;
      const headingRank = headingCount * 100;
      activeHeadingBaseLevel = headingRank;

      const text = headingMatch[2].trim();
      const { cleanText, operator } = extractOperator(text);
      const traditions = detectTraditions(cleanText);

      if (headingCount === 1 && !hasExplicitRoot) {
        root.name = cleanText || 'HyperMarkmap Root';
        root.operator = operator;
        root.traditions = traditions;
        hasExplicitRoot = true;
        stack[0] = { node: root, level: headingRank };
        continue;
      }

      const newNode: HyperNode = {
        id: `node-${nodeIdCounter++}`,
        name: cleanText,
        depth: headingCount,
        operator,
        traditions,
        children: []
      };

      // Pop stack until we find a parent with level < headingRank
      while (stack.length > 1 && stack[stack.length - 1].level >= headingRank) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].node;
      if (!parent.children) parent.children = [];
      parent.children.push(newNode);
      stack.push({ node: newNode, level: headingRank });
      continue;
    }

    // Check for List items: - Item, * Item, + Item, 1. Item
    const listMatch = rawLine.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const indentSpaces = listMatch[1].replace(/\t/g, '  ').length;
      const text = listMatch[3].trim();
      const { cleanText, operator } = extractOperator(text);
      const traditions = detectTraditions(cleanText);

      // Virtual list level based on indentation (every 2 spaces = 1 depth tier)
      const listTier = Math.floor(indentSpaces / 2) + 1;
      const effectiveLevel = activeHeadingBaseLevel + (listTier * 10);
      const visualDepth = Math.floor(activeHeadingBaseLevel / 100) + listTier;

      const newNode: HyperNode = {
        id: `node-${nodeIdCounter++}`,
        name: cleanText,
        depth: visualDepth,
        operator,
        traditions,
        children: []
      };

      // Pop until parent level is strictly lower
      while (stack.length > 1 && stack[stack.length - 1].level >= effectiveLevel) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].node;
      if (!parent.children) parent.children = [];
      parent.children.push(newNode);
      stack.push({ node: newNode, level: effectiveLevel });
      continue;
    }

    // Check for Blockquote: > Text
    const quoteMatch = rawLine.match(/^>\s+(.*)$/);
    if (quoteMatch) {
      const quoteText = quoteMatch[1].trim();
      const currentTarget = stack[stack.length - 1].node;
      if (currentTarget) {
        currentTarget.notes = currentTarget.notes
          ? `${currentTarget.notes}\n${quoteText}`
          : quoteText;
        // Also add any traditions detected in blockquote notes
        const quoteTraditions = detectTraditions(quoteText);
        if (quoteTraditions.length > 0) {
          currentTarget.traditions = Array.from(new Set([...(currentTarget.traditions || []), ...quoteTraditions]));
        }
      }
    }
  }

  computeDescendantCounts(root);
  return root;
}

/**
 * Parses JSON into a normalized HyperNode tree.
 * Supports simpleMindMap structure (root with { data: { text: ... }, children: [...] })
 * or standard { name, children } trees.
 */
export function parseJsonToTree(jsonInput: string | object): HyperNode {
  let raw: any;
  if (typeof jsonInput === 'string') {
    try {
      raw = JSON.parse(jsonInput);
    } catch (e) {
      return {
        id: 'err-root',
        name: 'Invalid JSON',
        depth: 0,
        children: []
      };
    }
  } else {
    raw = jsonInput;
  }

  // Detect simpleMindMap schema where root has data or is wrapped in root: {...}
  let targetRoot = raw;
  if (raw.data && typeof raw.data === 'object') {
    targetRoot = raw.data;
  } else if (raw.root && (raw.root.data || raw.root.children)) {
    targetRoot = raw.root;
  }

  let nodeIdCounter = 1;

  function normalize(item: any, depth: number): HyperNode {
    let d = item;
    if (item.data && typeof item.data === 'object') {
      d = item.data;
    }

    let name = d.text || d.name || d.title || d.label || item.name || item.text || item.title || 'Untitled';
    let notes = d.note || d.notes || d.description || item.note || item.notes || item.description;

    const { cleanText, operator } = extractOperator(String(name).trim());
    const fullTextForTraditions = `${cleanText} ${notes || ''}`;
    const traditions = detectTraditions(fullTextForTraditions);

    const node: HyperNode = {
      id: item.id || d.id || `json-node-${nodeIdCounter++}`,
      name: cleanText,
      depth,
      operator,
      notes,
      traditions,
      children: []
    };

    const rawChildren = d.children || item.children || d.nodes || item.nodes || [];
    if (Array.isArray(rawChildren)) {
      node.children = rawChildren.map((child: any) => normalize(child, depth + 1));
    }

    return node;
  }

  const result = normalize(targetRoot, 0);
  computeDescendantCounts(result);
  return result;
}

/**
 * Converts a HyperNode tree into clean Markdown format
 */
export function treeToMarkdown(node: HyperNode, level: number = 1): string {
  let md = '';
  const prefix = level <= 6 ? '#'.repeat(level) + ' ' : '  '.repeat(level - 6) + '- ';
  const op = node.operator ? ` ${node.operator}` : '';
  md += `${prefix}${node.name}${op}\n`;

  if (node.notes) {
    const quoteLines = node.notes.split('\n').map((l) => `> ${l}`).join('\n');
    md += `${quoteLines}\n`;
  }

  const children = node.children || node._children || [];
  for (const child of children) {
    md += treeToMarkdown(child, level + 1);
  }

  return md;
}

/**
 * Clones a tree deeply to prevent state pollution
 */
export function cloneTree(node: HyperNode): HyperNode {
  const copy: HyperNode = {
    ...node,
    traditions: node.traditions ? [...node.traditions] : undefined,
    children: node.children ? node.children.map(cloneTree) : undefined,
    _children: node._children ? node._children.map(cloneTree) : undefined
  };
  return copy;
}
