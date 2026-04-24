import fs from 'fs';
import path from 'path';

const BASE_DIR = path.join(process.cwd(), 'Nihilismi Experientia Sacra 2');

export const DIRS = {
  Library: path.join(BASE_DIR, 'Library'),
  Summaries: path.join(BASE_DIR, 'Summaries'),
  Entities: path.join(BASE_DIR, 'Entities'),
  Questions: path.join(BASE_DIR, 'Questions'),
};

export function ensureDirs() {
  Object.values(DIRS).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}
