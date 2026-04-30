const fs = require('fs');
let text = fs.readFileSync('src/data/corpus.ts', 'utf8');
text = text.replace(/\\n\{/g, '{');
fs.writeFileSync('src/data/corpus.ts', text);
