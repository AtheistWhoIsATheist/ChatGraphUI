import fs from 'fs';

let content = fs.readFileSync('src/data/corpus.ts', 'utf-8');

content = content.replace(/AIF \(Abyssal Integration Factor\)/g, 'Abyssal Integration Factor');
content = content.replace(/\bAIF\b/g, 'Abyssal Integration Factor'); // This might replace the 'aif' id? Wait, \b matches boundaries so 'aif' won't be matched by 'AIF' unless case insensitive.
content = content.replace(/Abyssal Integration Factor: Apophatic Inscription Failure/g, 'Apophatic Inscription Failure');
content = content.replace(/CKIP \(Continuous Kenotic Integration Protocol\)/g, 'Continuous Kenotic Integration');
content = content.replace(/\bCKIP\b/g, 'Continuous Kenotic Integration');
content = content.replace(/OMEGA-AUDIT-ZENITH/g, 'Zenith Audit');

fs.writeFileSync('src/data/corpus.ts', content);
