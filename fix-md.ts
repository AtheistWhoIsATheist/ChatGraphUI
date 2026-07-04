import fs from 'fs';

let agentsContent = fs.readFileSync('AGENTS.md', 'utf-8');
agentsContent = agentsContent.replace(/AxiomForge/g, 'The Synthesis Engine');
agentsContent = agentsContent.replace(/Journal314 & REN Analysis Engine/g, 'Journal314 & Nihiltheism Analysis Engine');
agentsContent = agentsContent.replace(/Recursive Existential Nihilism \(REN\)/g, 'The Religious Experience of Nihilism');
fs.writeFileSync('AGENTS.md', agentsContent);

let geminiContent = fs.readFileSync('GEMINI.md', 'utf-8');
geminiContent = geminiContent.replace(/AxiomForge/g, 'The Synthesis Engine');
geminiContent = geminiContent.replace(/Journal314 REN/g, 'Journal314 and The Religious Experience of Nihilism');
fs.writeFileSync('GEMINI.md', geminiContent);
