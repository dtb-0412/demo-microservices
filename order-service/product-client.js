const BASE = process.env.PRODUCT_URL || 'http://localhost:3001';

async function callProduct(productId, quantity, traceId) {
  const res = await fetch(`${BASE}/products/${productId}/reduce-stock`, {
    method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-trace-id': traceId, 'x-caller': 'order-service' },
    body: JSON.stringify({ quantity }),
    signal: AbortSignal.timeout(2000), // timeout 2s
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

const THRESHOLD = 3;     // so loi lien tiep de ngat
const RESET_MS = 10000;  // thoi gian cho truoc khi thu lai
const breaker = { state: 'CLOSED', failures: 0, openedAt: 0 };

async function reduceStock(productId, quantity, traceId) {
  if (breaker.state === 'OPEN') {
    if (Date.now() - breaker.openedAt >= RESET_MS) {
      breaker.state = 'HALF-OPEN';
      console.log('[breaker] HALF-OPEN');
    } else {
      throw new Error('Circuit OPEN'); // tu choi ngay, khong goi Product
    }
  }
  try {
    const result = await callProduct(productId, quantity, traceId);
    if (breaker.state !== 'CLOSED') console.log('[breaker] CLOSED');
    breaker.state = 'CLOSED';
    breaker.failures = 0;
    return result;
  } catch (e) {
    breaker.failures++;
    if (breaker.state === 'HALF-OPEN' || breaker.failures >= THRESHOLD) {
      breaker.state = 'OPEN';
      breaker.openedAt = Date.now();
      console.log('[breaker] OPEN');
    }
    throw e;
  }
}

const getState = () => breaker.state;

module.exports = { reduceStock, getState };