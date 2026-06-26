import { getNodesCollection, connectDB } from './src/backend/db.js';

async function check() {
  await connectDB();
  const nodes = getNodesCollection();
  const node = await nodes.findOne({ label: 'Miguel de Unamuno' });
  console.log(node);
}

check();
