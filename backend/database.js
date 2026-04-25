const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let dbInstance;

function initDb(userDataPath) {
  const dbDir = userDataPath || __dirname;
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.resolve(dbDir, 'pos.db');

  dbInstance = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database', err);
    } else {
      console.log('Connected to the SQLite database at', dbPath);
      dbInstance.serialize(() => {
        // Products Table
        dbInstance.run(`CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          barcode TEXT UNIQUE NOT NULL,
          price REAL NOT NULL,
          category TEXT,
          stock INTEGER NOT NULL DEFAULT 0
        )`);

        // Transactions Table
        dbInstance.run(`CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          total REAL NOT NULL,
          discount REAL DEFAULT 0,
          vat REAL DEFAULT 0,
          amount_paid REAL NOT NULL,
          change REAL NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Transaction Items Table
        dbInstance.run(`CREATE TABLE IF NOT EXISTS transaction_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transaction_id INTEGER,
          product_id INTEGER,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          FOREIGN KEY (transaction_id) REFERENCES transactions (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )`);
      });
    }
  });
  return dbInstance;
}

function getDb() {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  return dbInstance;
}

module.exports = { initDb, getDb };
