import fs from 'fs';

let content = fs.readFileSync('src/data/corpus.ts', 'utf-8');
content = content.replace(/"ckip"/g, '"continuous_kenotic_integration"');
fs.writeFileSync('src/data/corpus.ts', content);
