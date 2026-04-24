import fs from 'fs';
import path from 'path';

const BASE_DIR = path.join(process.cwd(), 'Nihilismi Experientia Sacra 2');
const LIBRARY_DIR = path.join(BASE_DIR, 'Library');
const ENTITIES_DIR = path.join(BASE_DIR, 'Entities');
const QUESTIONS_DIR = path.join(BASE_DIR, 'Questions');

function getCount(dir: string) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).length;
}

async function generateDigest() {
  console.log('Generating Weekly Void Digest...');
  
  const libraryCount = getCount(LIBRARY_DIR);
  const entitiesCount = getCount(ENTITIES_DIR);
  const questionsCount = getCount(QUESTIONS_DIR);

  const digestContent = `# NES2 Weekly Digest

## Metrics
- Total Library Artifacts: ${libraryCount}
- Total Sovereign Entities: ${entitiesCount}
- Boundary-pushing Questions: ${questionsCount}

*Digest automatically compiled by the continuous ingestion subsystem.*
`;

  console.log(digestContent);
  // Could optionally save to a Digest file
}

generateDigest();
