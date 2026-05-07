const fs = require('fs');
let s = fs.readFileSync('server.ts', 'utf8');

const regex = /const apiKey = process\.env\.GEMINI_API_KEY\?\.trim\(\);\s*if \(!apiKey\) \{\s*return res\.status\(500\)\.json\(\{ error: 'GEMINI_API_KEY is not configured\.' \}\);\s*}\s*(?:const ai = new GoogleGenAI\(\{ apiKey \}\);)?/g;

s = s.replace(regex, "let ai; try { ai = getAi(); } catch(e) { return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' }); }");

fs.writeFileSync('server.ts', s);
console.log('Fixed server.ts');
