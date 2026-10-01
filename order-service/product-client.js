const BASE = process.env.PRODUCT_URL || 'http://localhost:3001';

async function reduceStock(productId, quantity) {
  const res = await fetch(`${BASE}/products/${productId}/reduce-stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
    signal: AbortSignal.timeout(2000), // timeout 2s
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

module.exports = { reduceStock };