import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  
  newContent = newContent.replace(/"a_series"/g, '"anti_reification"');
  newContent = newContent.replace(/"k_series"/g, '"kenotic_constraints"');
  newContent = newContent.replace(/"o_series"/g, '"ontodicy_collapse"');
  newContent = newContent.replace(/"rn_series"/g, '"ren_phenomenology"');

  // Also replace 'series' check in logic
  newContent = newContent.replace(/n\.id\.includes\('series'\)/g, "['anti_reification', 'kenotic_constraints', 'ontodicy_collapse', 'ren_phenomenology'].includes(n.id)");
  newContent = newContent.replace(/node\.id\.includes\('series'\)/g, "['anti_reification', 'kenotic_constraints', 'ontodicy_collapse', 'ren_phenomenology'].includes(node.id)");

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
