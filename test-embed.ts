import { getAi } from './src/backend/nes2-router.ts';
const ai = getAi();
async function run() {
  const res = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: 'hello world'
  });
  console.log(res.embeddings?.[0]?.values?.length);
}
run().catch(console.error);
