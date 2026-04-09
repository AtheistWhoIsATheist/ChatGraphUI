async function trigger() {
  const res = await fetch('http://localhost:3000/api/densify', { method: 'POST' });
  const data = await res.json();
  console.log(data);
}
trigger().catch(console.error);
