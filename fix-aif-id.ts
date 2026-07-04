import fs from 'fs';

let content = fs.readFileSync('src/data/corpus.ts', 'utf-8');
content = content.replace(/"aif"/g, '"abyssal_integration_factor"');
fs.writeFileSync('src/data/corpus.ts', content);
