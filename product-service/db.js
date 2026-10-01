const Database = require('better-sqlite3');
const db = new Database('product.db');

db.exec(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  price REAL,
  stock INTEGER
)`);

if (db.prepare('SELECT COUNT(*) AS c FROM products').get().c === 0) {
  const ins = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
  ins.run('Laptop', 1000, 5);
  ins.run('Mouse', 20, 50);
  ins.run('Keyboard', 50, 20);
}

module.exports = db;