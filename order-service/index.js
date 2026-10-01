const express = require('express');
const db = require('./db');
const { trace, route, clear } = require('./trace');
const { reduceStock, getState } = require('./product-client');

const app = express();
app.use(express.json());

app.use(trace('order-service'));
app.get('/_trace', route);
app.delete('/_trace', clear);

app.post('/orders', async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const { ok, data } = await reduceStock(productId, quantity, req.traceId);
    if (!ok) return res.status(400).json({ error: data.error });

    const total = data.price * quantity;
    const r = db
      .prepare('INSERT INTO orders (product_id, quantity, total, status) VALUES (?, ?, ?, ?)')
      .run(productId, quantity, total, 'CONFIRMED');
    res.status(201).json({ id: r.lastInsertRowid, productId, quantity, total, status: 'CONFIRMED' });
  } catch (e) {
        res.status(503).json({ error: 'Product Service unavailable, please try again later', breaker: getState() });
  }
});

app.get('/orders', (req, res) => {
  res.json(db.prepare('SELECT * FROM orders').all());
});

app.listen(3002, () => console.log('Order Service: 3002'));