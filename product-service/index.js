const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

app.get('/products', (req, res) => {
  res.json(db.prepare('SELECT * FROM products').all());
});

app.get('/products/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

app.post('/products/:id/reduce-stock', (req, res) => {
  const { quantity } = req.body;
  const r = db
    .prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?')
    .run(quantity, req.params.id, quantity);
  if (r.changes === 0) return res.status(400).json({ error: 'Not enough stock or product not found' });
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

app.listen(3001, () => console.log('Product Service: 3001'));