const BASE = 'http://localhost:3000';

async function call(title, method, path, body) {
  console.log(`\n=== ${title} ===`);
  console.log(`${method} ${path}${body ? ' ' + JSON.stringify(body) : ''}`);
  try {
    const res = await fetch(BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000),
    });
    console.log(`-> ${res.status}`, await res.json());
  } catch (e) {
    console.log('-> LOI KET NOI:', e.message);
  }
}

(async () => {
  await call('1. Danh sach san pham', 'GET', '/products');
  await call('2. Dat hang hop le', 'POST', '/orders', { productId: 1, quantity: 2 });
  await call('3. Dat vuot ton kho', 'POST', '/orders', { productId: 1, quantity: 999 });
  await call('4. Kiem tra ton kho sau khi dat', 'GET', '/products/1');
  await call('5. Danh sach don hang', 'GET', '/orders');
})();