import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content.replace(/gemini-1\.5-pro-latest/g, 'gemini-pro-latest');
  newContent = newContent.replace(/gemini-1\.5-flash-latest/g, 'gemini-flash-latest');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

walk('./src');
replaceInFile('./server.ts');
replaceInFile('./densify-all.ts');
