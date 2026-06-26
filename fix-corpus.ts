import fs from 'fs';

let content = fs.readFileSync('src/data/corpus.ts', 'utf-8');

content = content.replace(/ANPES Engine/g, 'Meta-cognitive Synthesis Engine');
content = content.replace(/ANPES \(Advanced Nihiltheistic Prompt Engineering System\)/g, 'Meta-cognitive Synthesis Engine');
content = content.replace(/ANPES/g, 'Synthesis Engine');

fs.writeFileSync('src/data/corpus.ts', content);

let aiPrompts = fs.readFileSync('src/backend/ai-prompts.ts', 'utf-8');
aiPrompts = aiPrompts.replace(/"RPEs" \(Radical Philosophical Events\)/g, '"Core Insights"');
aiPrompts = aiPrompts.replace(/rpe \| axiom \| paradox \| concept/g, 'insight | axiom | paradox | concept');
fs.writeFileSync('src/backend/ai-prompts.ts', aiPrompts);

let aiSynthesisPanel = fs.readFileSync('src/components/AISynthesisPanel.tsx', 'utf-8');
aiSynthesisPanel = aiSynthesisPanel.replace(/AxiomForge/g, 'Synthesis Engine');
fs.writeFileSync('src/components/AISynthesisPanel.tsx', aiSynthesisPanel);
