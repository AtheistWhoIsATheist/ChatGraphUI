import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Knowledge Curator Agent Initialized ===');
console.log('Nihiltheist Densification Engaged. Ask your conceptual query:');

function askQuestion() {
  rl.question('> ', async (query) => {
    if (query.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/nes2/curator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Curator Error:', data.error);
      } else {
        console.log('\n[Curator]:');
        console.log(data.response);
        console.log('\n--------------------------');
      }
    } catch (e: any) {
      console.error('Failed to communicate with Curator:', e.message);
    }
    
    askQuestion();
  });
}

askQuestion();
