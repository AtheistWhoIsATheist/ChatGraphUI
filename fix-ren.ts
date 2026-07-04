import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  
  // Replace REN with The Religious Experience of Nihilism
  newContent = newContent.replace(/Journal314 & REN Analysis Engine/g, 'Journal314 & Nihiltheism Analysis Engine');
  newContent = newContent.replace(/REN Stage/g, 'Stage');
  newContent = newContent.replace(/REN-Stage/g, 'Stage');
  newContent = newContent.replace(/REN Stages/g, 'Stages');
  newContent = newContent.replace(/REN-Stages/g, 'Stages');
  newContent = newContent.replace(/REN Topology/g, 'Nihiltheism Topology');
  newContent = newContent.replace(/REN Synthesis Panel/g, 'Synthesis Panel');
  newContent = newContent.replace(/REN Synthesis Engine/g, 'Synthesis Engine');
  newContent = newContent.replace(/REN philosophical network/g, 'Nihiltheism philosophical network');
  newContent = newContent.replace(/Journal314 and REN/g, 'Journal314 and The Religious Experience of Nihilism');
  newContent = newContent.replace(/REN transcripts/g, 'The Religious Experience of Nihilism transcripts');
  newContent = newContent.replace(/REN transcriptions/g, 'The Religious Experience of Nihilism transcriptions');
  newContent = newContent.replace(/REN logs/g, 'The Religious Experience of Nihilism logs');
  newContent = newContent.replace(/REN Encounter/g, 'Encounter');
  newContent = newContent.replace(/REN-Analysis-Exports/g, 'Nihiltheism-Analysis-Exports');
  newContent = newContent.replace(/REN-EXPORTS/g, 'NIHILTHEISM-EXPORTS');
  newContent = newContent.replace(/REN CRYPTOGRAPHIC PROVENANCE REPORT/g, 'NIHILTHEISM PROVENANCE REPORT');
  newContent = newContent.replace(/REN /g, 'The Religious Experience of Nihilism ');
  newContent = newContent.replace(/Recursive Existential Nihilism \(REN\)/g, 'The Religious Experience of Nihilism');
  newContent = newContent.replace(/Recursive Existential Nihilism/g, 'The Religious Experience of Nihilism');
  newContent = newContent.replace(/\(REN\)/g, '(The Religious Experience of Nihilism)');

  // Fix strange language
  newContent = newContent.replace(/phenomenological_extraction/g, 'core_insight');
  newContent = newContent.replace(/Journal314 Occurrence-Elevation Discriminator/g, 'Journal314 Insight Analyzer');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }
}

function walk(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.json') || fullPath.endsWith('.md')) {
      replaceInFile(fullPath);
    }
  }
}

walk('./src');
replaceInFile('./server.ts');
replaceInFile('./AGENTS.md');
replaceInFile('./GEMINI.md');
