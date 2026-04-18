import fs from 'fs';

async function testPayload() {
  const largeText = 'A'.repeat(5 * 1024 * 1024); // 5MB
  
  const payload = {
    file_name: 'huge_test.md',
    file_type: 'md',
    extracted: {
      text: largeText
    }
  };

  try {
    const res = await fetch('http://localhost:3000/functions/v1/ingest-philosophical-data?mode=preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      console.error('Failed:', res.status, await res.text());
    } else {
      console.log('Success!', await res.json());
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testPayload();
