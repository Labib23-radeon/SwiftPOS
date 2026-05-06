const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const selfsigned = require('selfsigned');
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

// GET local network IP and Tunnel URL for mobile scanner
const os = require('os');
app.get('/api/ip', (req, res) => {
  const nets = os.networkInterfaces();
  let ip = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1)
      if (net.family === 'IPv4' && !net.internal) {
        ip = net.address;
        break;
      }
    }
    if (ip !== 'localhost') break;
  }
  res.json({ ip, httpsPort: req.app.locals.httpsPort || 3002 });
});

// Generic error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

function initServer(userDataPath, port = 3001) {
  initDb(userDataPath);
  
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Please close any other instances.`);
    } else {
      console.error(`Server error: ${e.message}`);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`Backend running on http://localhost:${port}`);
  });

  // Start HTTPS server on port + 1 to bypass mobile camera restrictions
  (async () => {
    try {
      const os = require('os');
      const nets = os.networkInterfaces();
      let ip = 'localhost';
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            ip = net.address;
            break;
          }
        }
        if (ip !== 'localhost') break;
      }

      const attrs = [{ name: 'commonName', value: ip }];
      const opts = {
        days: 365,
        extensions: [{
          name: 'subjectAltName',
          altNames: [
            { type: 2, value: 'localhost' }, // DNS
            { type: 7, ip: '127.0.0.1' },    // IP
            { type: 7, ip: ip }              // IP
          ]
        }]
      };
      
      const pems = await selfsigned.generate(attrs, opts);
      const httpsServer = https.createServer({ key: pems.private, cert: pems.cert }, app);
      io.attach(httpsServer);
      
      const httpsPort = parseInt(port) + 1;
      app.locals.httpsPort = httpsPort;
      
      httpsServer.listen(httpsPort, '0.0.0.0', () => {
        console.log(`Secure Backend running on https://localhost:${httpsPort}`);
      });
      
      httpsServer.on('error', (e) => {
        console.error(`HTTPS Server error: ${e.message}`);
      });
    } catch (err) {
      console.error('Failed to start local HTTPS server:', err);
    }
  })();

  return { app, server, io };
}

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  initServer(null, PORT);
}

module.exports = { initServer };
