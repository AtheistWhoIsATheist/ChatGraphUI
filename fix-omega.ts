import fs from 'fs';

let content = fs.readFileSync('src/data/corpus.ts', 'utf-8');
content = content.replace(/omega_audit_zenith/g, 'zenith_audit');
fs.writeFileSync('src/data/corpus.ts', content);
