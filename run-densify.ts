import fetch from 'node-fetch';

async function runDensificationCycles(cycles: number) {
  for (let i = 1; i <= cycles; i++) {
    console.log(`[Cycle ${i}/${cycles}] Triggering densification...`);
    try {
      const response = await fetch('http://localhost:3000/api/densify', {
        method: 'POST',
      });
      const data = await response.json();
      console.log(`[Cycle ${i}/${cycles}] Result:`, data);
      
      // Stop early if no more nodes require densification
      if (data.message === 'No nodes require densification.') {
        console.log('All nodes reached 100% saturation early. Stopping cycles.');
        break;
      }
    } catch (error) {
      console.error(`[Cycle ${i}/${cycles}] Error during densification:`, error);
    }
  }
  console.log('Densification cycles complete.');
}

runDensificationCycles(5);
