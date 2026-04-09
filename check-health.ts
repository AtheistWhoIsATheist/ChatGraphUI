async function check() {
  const res = await fetch('http://localhost:3000/api/health');
  const data = await res.json();
  console.log(data);
}
check().catch(console.error);
