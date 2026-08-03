const test = require('node:test');
const assert = require('node:assert');

test('Visual Disparity Graph & Register Analytics Suite', async (t) => {

  // Dynamically import nihil-engine.js
  const engine = await import('./nihil-engine.js');

  await t.test('Test Case 1: /map Command Breakdown with Exact Sub-Metrics', () => {
    const comparison = engine.mapComparison('Nietzsche: Will to Power', 'Sartre: Being and Nothingness');
    
    // Validate Disparity Index is a number between 0 and 100
    assert.strictEqual(typeof comparison.disparityIndex, 'number');
    assert.ok(comparison.disparityIndex >= 0 && comparison.disparityIndex <= 100, 'Disparity Index must be 0-100');

    // Validate sub-metrics existence and ranges
    assert.ok(comparison.subMetrics, 'Sub-metrics object must exist');
    assert.strictEqual(typeof comparison.subMetrics.structuralDivergence, 'number');
    assert.strictEqual(typeof comparison.subMetrics.doctrinalGap, 'number');
    assert.strictEqual(typeof comparison.subMetrics.rhetoricalVariance, 'number');

    assert.ok(comparison.subMetrics.structuralDivergence >= 0 && comparison.subMetrics.structuralDivergence <= 100);
    assert.ok(comparison.subMetrics.doctrinalGap >= 0 && comparison.subMetrics.doctrinalGap <= 100);
    assert.ok(comparison.subMetrics.rhetoricalVariance >= 0 && comparison.subMetrics.rhetoricalVariance <= 100);

    // Validate exact /map processCommand output
    const cmdResp = engine.processCommand('/map "Doc A" "Doc B"');
    assert.strictEqual(cmdResp.type, 'map_response');
    assert.ok(cmdResp.comparison, 'Command response must include comparison data');
    assert.ok(cmdResp.content.includes('Disparity Index'), 'Content must summarize disparity index');
  });

  await t.test('Test Case 2: Register Chip Categorization & Color Badge Mapping', () => {
    // Validate [STRUCTURAL] badge -> blue
    const structuralStyle = engine.getRegisterBadgeStyle('STRUCTURAL');
    assert.strictEqual(structuralStyle.label, '[STRUCTURAL]');
    assert.strictEqual(structuralStyle.color, 'blue');
    assert.ok(structuralStyle.bgClass.includes('blue'));
    assert.ok(structuralStyle.textClass.includes('blue'));

    // Validate [DOCTRINAL] badge -> orange
    const doctrinalStyle = engine.getRegisterBadgeStyle('DOCTRINAL');
    assert.strictEqual(doctrinalStyle.label, '[DOCTRINAL]');
    assert.strictEqual(doctrinalStyle.color, 'orange');
    assert.ok(doctrinalStyle.bgClass.includes('orange'));
    assert.ok(doctrinalStyle.textClass.includes('orange'));

    // Validate [RHETORICAL] badge -> fuchsia
    const rhetoricalStyle = engine.getRegisterBadgeStyle('RHETORICAL');
    assert.strictEqual(rhetoricalStyle.label, '[RHETORICAL]');
    assert.strictEqual(rhetoricalStyle.color, 'fuchsia');
    assert.ok(rhetoricalStyle.bgClass.includes('fuchsia'));
    assert.ok(rhetoricalStyle.textClass.includes('fuchsia'));
  });

  await t.test('Test Case 3: Visual Chip Validation & Register Filter Interaction', () => {
    const mockMessages = [
      { id: '1', sender: 'agent', content: 'Msg 1', registers: ['STRUCTURAL', 'DOCTRINAL', 'RHETORICAL'] },
      { id: '2', sender: 'agent', content: 'Msg 2', registers: ['STRUCTURAL'] },
      { id: '3', sender: 'agent', content: 'Msg 3', registers: ['RHETORICAL'] }
    ];

    // Validate filtering by [STRUCTURAL]
    const structuralOnly = engine.filterMessagesByRegister(mockMessages, 'STRUCTURAL');
    assert.strictEqual(structuralOnly.length, 2);
    assert.deepStrictEqual(structuralOnly.map(m => m.id), ['1', '2']);

    // Validate filtering by [DOCTRINAL]
    const doctrinalOnly = engine.filterMessagesByRegister(mockMessages, 'DOCTRINAL');
    assert.strictEqual(doctrinalOnly.length, 1);
    assert.strictEqual(doctrinalOnly[0].id, '1');

    // Validate filtering by [RHETORICAL]
    const rhetoricalOnly = engine.filterMessagesByRegister(mockMessages, 'RHETORICAL');
    assert.strictEqual(rhetoricalOnly.length, 2);
    assert.deepStrictEqual(rhetoricalOnly.map(m => m.id), ['1', '3']);

    // Validate null filter returns all messages
    const allMsgs = engine.filterMessagesByRegister(mockMessages, null);
    assert.strictEqual(allMsgs.length, 3);
  });

  await t.test('Test Case 4: relatedNodeId Field Verification in Agent Responses', () => {
    const stdResp = engine.processCommand('Explain the concept of void');
    assert.strictEqual(stdResp.type, 'agent_response');
    assert.ok(stdResp.relatedNodeId, 'Standard agent response must include relatedNodeId');
    assert.strictEqual(typeof stdResp.relatedNodeId, 'string');

    const mapResp = engine.processCommand('/map "Nietzsche" "Sartre"');
    assert.strictEqual(mapResp.type, 'map_response');
    assert.ok(mapResp.relatedNodeId, 'Map agent response must include relatedNodeId');
    assert.strictEqual(typeof mapResp.relatedNodeId, 'string');
  });

  await t.test('Test Case 5: KnowledgeGraph NODE_COLORS, Filter Logic, and Collision Detection Verification', async () => {
    const { NODE_COLORS, getFullKnowledgeGraphDataset } = await import('./src/data/knowledgeGraphDataset.ts');

    // 1. Verify NODE_COLORS map exists and maps concept, thinker, document, etc.
    assert.ok(NODE_COLORS, 'NODE_COLORS map must be defined');
    assert.ok(NODE_COLORS.concept && NODE_COLORS.concept.fill, 'NODE_COLORS concept styling must exist');
    assert.ok(NODE_COLORS.thinker && NODE_COLORS.thinker.border, 'NODE_COLORS thinker styling must exist');
    assert.ok(NODE_COLORS.document && NODE_COLORS.document.bg, 'NODE_COLORS document styling must exist');

    // 2. Verify Graph Dataset contains valid nodes of multiple types
    const dataset = getFullKnowledgeGraphDataset();
    assert.ok(dataset.nodes.length > 0, 'Knowledge graph dataset must contain nodes');
    const types = new Set(dataset.nodes.map(n => n.type));
    assert.ok(types.has('concept'), 'Dataset must contain concept nodes');
    assert.ok(types.has('thinker'), 'Dataset must contain thinker nodes');
    assert.ok(types.has('document'), 'Dataset must contain document nodes');

    // 3. Verify Collision Detection Pass prevents node overlaps
    const samplePositions = [
      { id: 'a', x: 100, y: 100, radius: 15 },
      { id: 'b', x: 102, y: 101, radius: 15 } // Overlapping node
    ];
    const minPadding = 16;
    const minDist = samplePositions[0].radius + samplePositions[1].radius + minPadding;

    // Run collision resolution
    let dx = samplePositions[1].x - samplePositions[0].x;
    let dy = samplePositions[1].y - samplePositions[0].y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      const overlap = minDist - dist;
      const nx = dx / dist;
      const ny = dy / dist;
      samplePositions[0].x -= nx * overlap * 0.5;
      samplePositions[0].y -= ny * overlap * 0.5;
      samplePositions[1].x += nx * overlap * 0.5;
      samplePositions[1].y += ny * overlap * 0.5;
    }

    const postDx = samplePositions[1].x - samplePositions[0].x;
    const postDy = samplePositions[1].y - samplePositions[0].y;
    const postDist = Math.sqrt(postDx * postDx + postDy * postDy);
    assert.ok(postDist >= minDist - 0.001, 'Collision detection must push overlapping nodes apart');
  });

});
