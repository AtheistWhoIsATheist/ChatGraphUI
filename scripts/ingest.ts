import fs from 'fs';

async function ingest() {
  const args = process.argv.slice(2);
  let source = '';
  let type = 'md';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i+1]) {
      source = args[i+1];
      i++;
    } else if (args[i] === '--type' && args[i+1]) {
      type = args[i+1];
      i++;
    }
  }

  if (!source) {
    console.error('Usage: bun scripts/ingest.ts --source <path> --type <md|url|pdf|video>');
    process.exit(1);
  }

  // To simplify this implementation, assuming local file path for extraction
  let content = '';
  try {
    content = fs.readFileSync(source, 'utf8');
  } catch (err: any) {
    console.error('Could not read source file:', err.message);
    process.exit(1);
  }

  console.log('Sending artifact to the ingestion engine...');
  const res = await fetch('http://localhost:3000/api/nes2/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, content, sourceType: type })
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Ingestion failed:', data.error);
  } else {
    console.log('Ingestion succeeded:', data);
  }
}

ingest();
