import fs from 'fs';

const data = fs.readFileSync('src/data/graph-data.json', 'utf-8');
const json = JSON.parse(data);
console.log("Concepts found:", json.index?.concepts?.length);
