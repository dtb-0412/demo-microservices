const Database = require('better-sqlite3');
const db = new Database('order.db');

db.exec(`CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  quantity INTEGER,
  total REAL,
  status TEXT
)`);

module.exports = db;