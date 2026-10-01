const { execSync } = require('child_process');

const GW = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const docker = (cmd) => execSync(`docker compose ${cmd}`, { stdio: 'ignore' });

async function order(label) {
  const t = Date.now();
  try {
    const res = await fetch(`${GW}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 2, quantity: 1 }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    console.log(`${label} -> ${res.status} | breaker: ${data.breaker || 'CLOSED'} | ${Date.now() - t}ms`);
  } catch (e) {
    console.log(`${label} -> LOI: ${e.message}`);
  }
}

(async () => {
  console.log('--- B1: Product song, breaker CLOSED');
  await order('Dat hang');

  console.log('\n--- B2: TAT Product, goi lien tiep 5 lan');
  docker('stop product-service');
  for (let i = 1; i <= 5; i++) await order(`Lan ${i}`);
  console.log('(3 lan dau goi that bai -> OPEN; lan 4-5 bi tu choi ngay, khong goi Product)');

  console.log('\n--- B3: BAT lai Product, goi ngay -> van bi chan vi breaker dang OPEN');
  docker('start product-service');
  await sleep(3000);
  await order('Dat hang');

  console.log('\n--- B4: Cho het 10s -> HALF-OPEN, thu 1 request -> CLOSED');
  await sleep(8000);
  await order('Dat hang');
  await order('Dat hang');
})();