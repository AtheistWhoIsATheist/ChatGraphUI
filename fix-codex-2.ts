import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  
  newContent = newContent.replace(/codex_a/g, 'framework_apophatic');
  newContent = newContent.replace(/codex_k/g, 'framework_kenotic');
  newContent = newContent.replace(/codex_o/g, 'framework_ontodicy');
  newContent = newContent.replace(/codex_rn/g, 'framework_phenomenology');
  newContent = newContent.replace(/"codex"/g, '"framework"');
  newContent = newContent.replace(/node\.id\.includes\('codex'\)/g, "node.id.includes('framework')");
  newContent = newContent.replace(/n\.id\.includes\('codex'\)/g, "n.id.includes('framework')");
  newContent = newContent.replace(/Operational Codex \(A, K, O, RN\)/g, 'Primary Frameworks');

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
