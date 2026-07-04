import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  
  newContent = newContent.replace(/"ren"/g, '"the_religious_experience_of_nihilism"');
  newContent = newContent.replace(/'ren'/g, "'the_religious_experience_of_nihilism'");

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
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.json')) {
      replaceInFile(fullPath);
    }
  }
}

walk('./src');
