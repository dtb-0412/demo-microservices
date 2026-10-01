const { execSync } = require('child_process');

const GW = 'http://localhost:3000';
const PRODUCT = 'http://localhost:3001';
const ORDER = 'http://localhost:3002';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const docker = (cmd) => execSync(`docker compose ${cmd}`, { stdio: 'ignore' });

async function call(title, method, url, body) {
  console.log(`\n--- ${title}`);
  console.log(`${method} ${url}${body ? ' ' + JSON.stringify(body) : ''}`);
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000),
    });
    const text = await res.text();
    console.log(`-> ${res.status}`, text.slice(0, 150));
  } catch (e) {
    console.log('-> LOI KET NOI:', e.message);
  }
}

async function stop(name) {
  console.log(`\n##### TAT ${name}`);
  docker(`stop ${name}`);
}

async function start(name) {
  console.log(`\n##### BAT ${name}`);
  docker(`start ${name}`);
  await sleep(3000);
}

(async () => {
  console.log('===== KICH BAN 0: TAT CA SERVICE DEU CHAY =====');
  await call('Xem san pham', 'GET', `${GW}/products`);
  await call('Dat hang', 'POST', `${GW}/orders`, { productId: 2, quantity: 1 });

  console.log('\n===== KICH BAN 1: TAT PRODUCT, ORDER VA GATEWAY VAN SONG =====');
  await stop('product-service');
  await call('Order service van song', 'GET', `${ORDER}/orders`);
  await call('Dat hang (can Product) -> loi co kiem soat', 'POST', `${GW}/orders`, { productId: 2, quantity: 1 });
  await call('Xem san pham qua gateway -> loi', 'GET', `${GW}/products`);
  await call('Xem don hang qua gateway -> van chay', 'GET', `${GW}/orders`);

  console.log('\n===== KICH BAN 2: BAT LAI PRODUCT, TAT ORDER =====');
  await start('product-service');
  await stop('order-service');
  await call('Product van chay doc lap', 'GET', `${GW}/products`);
  await call('Dat hang -> loi (Order tat)', 'POST', `${GW}/orders`, { productId: 2, quantity: 1 });

  console.log('\n===== KICH BAN 3: TAT GATEWAY, SERVICE VAN DUNG DUOC TRUC TIEP =====');
  await start('order-service');
  await stop('gateway');
  await call('Goi thang Product', 'GET', `${PRODUCT}/products`);
  await call('Goi thang Order', 'GET', `${ORDER}/orders`);
  await call('Qua gateway -> khong ket noi duoc', 'GET', `${GW}/products`);

  console.log('\n===== KICH BAN 4: PHUC HOI =====');
  await start('gateway');
  await call('Dat hang lai binh thuong', 'POST', `${GW}/orders`, { productId: 2, quantity: 1 });
  await call('Danh sach don hang', 'GET', `${GW}/orders`);

  console.log('\n===== XONG =====');
})();