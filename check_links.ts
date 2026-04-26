import { corpusLinks } from './src/data/corpus.js';

const links = corpusLinks.map(l => `${l.source}-${l.target}`);
const duplicates = links.filter((item, index) => links.indexOf(item) !== index);
console.log("Duplicate links:", duplicates);
