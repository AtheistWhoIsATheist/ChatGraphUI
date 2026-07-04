import fs from 'fs';

let content = fs.readFileSync('src/data/corpus.ts', 'utf-8');
content = content.replace(/"anpes"/g, '"synthesis_engine"');
fs.writeFileSync('src/data/corpus.ts', content);

let aiPanel = fs.readFileSync('src/components/AISynthesisPanel.tsx', 'utf-8');
aiPanel = aiPanel.replace(/AXIOMFORGE/g, 'SYNTHESIS ENGINE');
fs.writeFileSync('src/components/AISynthesisPanel.tsx', aiPanel);
