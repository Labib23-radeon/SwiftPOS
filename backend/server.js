const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { initDb, getDb } = require('./database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
// Serve static files for the mobile scanner
app.get('/scanner', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'scanner.html'));
});

// Socket.IO for real-time barcode scanning
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('barcode_scanned', (data) => {
    console.log('Barcode scanned via mobile:', data.barcode);
    // Broadcast the barcode to the POS frontend
    io.emit('pos_barcode', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// REST API
// GET all products
app.get('/api/products', (req, res) => {
  getDb().all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET product by barcode
app.get('/api/products/:barcode', (req, res) => {
  getDb().get('SELECT * FROM products WHERE barcode = ?', [req.params.barcode], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  });
});

// POST add new product
app.post('/api/products', (req, res) => {
  const { name, barcode, price, category, stock } = req.body;
  if (!name || !barcode || price === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO products (name, barcode, price, category, stock) VALUES (?, ?, ?, ?, ?)';
  getDb().run(query, [name, barcode, price, category, stock || 0], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, barcode, price, category, stock });
  });
});

// POST checkout transaction
app.post('/api/checkout', (req, res) => {
  const { total, discount, vat, amount_paid, change, items } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: 'No items in cart' });

  getDb().serialize(() => {
    const database = getDb();
    database.run('BEGIN TRANSACTION');

    const insertTransaction = 'INSERT INTO transactions (total, discount, vat, amount_paid, change) VALUES (?, ?, ?, ?, ?)';
    database.run(insertTransaction, [total, discount || 0, vat || 0, amount_paid, change], function(err) {
      if (err) {
        database.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }

      const transactionId = this.lastID;
      let itemsProcessed = 0;
      let hasError = false;

      const stmt = database.prepare('INSERT INTO transaction_items (transaction_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
      const updateStockStmt = database.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

      items.forEach(item => {
        if (hasError) return;
        stmt.run([transactionId, item.id, item.quantity, item.price], (err) => {
          if (err) hasError = true;
        });
        updateStockStmt.run([item.quantity, item.id], (err) => {
          if (err) hasError = true;
          
          itemsProcessed++;
          if (itemsProcessed === items.length) {
            if (hasError) {
              database.run('ROLLBACK');
              return res.status(500).json({ error: 'Error processing items' });
            } else {
              database.run('COMMIT');
              res.json({ success: true, transactionId });
            }
          }
        });
      });
      stmt.finalize();
      updateStockStmt.finalize();
    });
  });
});

// GET dashboard stats
app.get('/api/stats', (req, res) => {
  getDb().get('SELECT COUNT(*) as transactions, SUM(total) as revenue FROM transactions WHERE date(timestamp) = date("now")', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    getDb().all('SELECT * FROM products WHERE stock < 10', (err, lowStock) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        dailyRevenue: row.revenue || 0,
        transactions: row.transactions || 0,
        lowStockItems: lowStock
      });
    });
  });
});

// GET local network IP for mobile scanner
const os = require('os');
app.get('/api/ip', (req, res) => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1)
      if (net.family === 'IPv4' && !net.internal) {
        return res.json({ ip: net.address });
      }
    }
  }
  res.json({ ip: 'localhost' });
});

function initServer(userDataPath, port = 3001) {
  initDb(userDataPath);
  server.listen(port, '0.0.0.0', () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
  return { app, server, io };
}

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  initServer(null, PORT);
}

module.exports = { initServer };
