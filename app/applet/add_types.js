const fs = require('fs');
let content = fs.readFileSync('src/data/corpus.ts', 'utf8');

// Add to NodeType if not there
['term', 'elevation_level', 'passage'].forEach(type => {
  if (!content.includes(`| "${type}"`)) {
    content = content.replace('| "axiom"', `| "axiom"\n  | "${type}"`);
  }
});

// Add to EdgeType if not there
['authored', 'classified_as', 'uses_term', 'O_TO_E_transition'].forEach(type => {
  if (!content.includes(`| "${type}"`)) {
    content = content.replace('| "attribution"', `| "attribution"\n    | "${type}"`);
  }
});

fs.writeFileSync('src/data/corpus.ts', content);
console.log('Types added.');
