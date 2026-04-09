import { getDb, connectDB } from './src/backend/db';

async function check() {
  await connectDB();
  const db = getDb();
  if (db) {
    const nodes = db.prepare('SELECT * FROM nodes').all();
    const saturated = nodes.filter((n: any) => n.saturation_level === 100);
    console.log(`Total nodes: ${nodes.length}, Saturated: ${saturated.length}`);
    if (nodes.length > 0) {
      console.log('Metadata of first node:', nodes[0].metadata);
    }
  }
}

check().catch(console.error);
