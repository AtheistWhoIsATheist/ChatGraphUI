import fs from 'fs';

let content = fs.readFileSync('src/data/corpus.ts', 'utf-8');

content = content.replace(/Tier 2 Operational Codex/g, 'Core Framework');
content = content.replace(/Tier 1 Operational Codex/g, 'Primary Framework');
content = content.replace(/Operational Codex/g, 'Framework');
content = content.replace(/operational protocols/g, 'guiding principles');

fs.writeFileSync('src/data/corpus.ts', content);
