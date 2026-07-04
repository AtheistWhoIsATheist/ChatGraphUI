import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  
  newContent = newContent.replace(/\bNT\b/g, 'Nihiltheism');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }
}

replaceInFile('src/data/corpus.ts');
replaceInFile('src/data/nt_schema.ts');
replaceInFile('src/components/SystemTopology.tsx');
