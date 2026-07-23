const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const xlsx = require('xlsx');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5500;
const JWT_SECRET = 'your_jwt_secret_key_jaikashi';

app.use(cors());
app.use(express.json());

// Global Activity Logger
const logActivity = (userId, action, details) => {
  db.run("INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)", [userId, action, details], err => {
    if(err) console.error("Error logging activity:", err.message);
  });
};

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ========================
// Auth Middleware
// ========================
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden: Admins only" });
  next();
};

// ========================
// API: Authentication
// ========================
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields (name, email, password) are required." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const hash = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name.trim(), cleanEmail, hash], function(err) {
    if (err) return res.status(400).json({ error: "Email already exists" });
    logActivity(this.lastID, 'REGISTER', 'User created an account.');
    const token = jwt.sign({ id: this.lastID, role: 'user' }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      message: "Registration successful!",
      token,
      user: { id: this.lastID, name: name.trim(), email: cleanEmail, role: 'user', balance: 0 }
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const cleanEmail = email.trim().toLowerCase();
  db.get("SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ?", [cleanEmail, cleanEmail], (err, user) => {
    if (err || !user) return res.status(401).json({ error: "Invalid email/username or password." });

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) return res.status(401).json({ error: "Invalid email/username or password." });
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
      logActivity(user.id, 'LOGIN', 'User logged in.');
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, balance: user.balance } });
    });
  });
});

// ========================
// API: User Dashboard
// ========================
app.get('/api/user/me', authenticate, (req, res) => {
  db.get("SELECT id, name, email, role, balance, created_at FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });
});

app.get('/api/user/bookings', authenticate, (req, res) => {
  db.all("SELECT * FROM bookings WHERE user_id = ?", [req.user.id], (err, rows) => {
    res.json(rows || []);
  });
});

app.post('/api/user/add_funds', authenticate, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  db.run("UPDATE users SET balance = balance + ? WHERE id = ?", [amount, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: "Database error" });
    
    // Log finance income
    db.run("INSERT INTO finances (type, amount, description) VALUES (?, ?, ?)", 
      ['income', amount, `Wallet Top-up by user ID ${req.user.id}`]);
      
    logActivity(req.user.id, 'ADD_FUNDS', `Added ₹${amount} to wallet.`);

    res.json({ message: `Successfully added ₹${amount} to wallet` });
  });
});

app.post('/api/user/track_search', authenticate, (req, res) => {
  const { location } = req.body;
  if(location) logActivity(req.user.id, 'SEARCH_MAP', `Searched map for: ${location}`);
  res.json({ success: true });
});

app.post('/api/user/book', authenticate, (req, res) => {
  const { package_name, price, date } = req.body;
  
  db.get("SELECT balance FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if(err || !user) return res.status(404).json({error: "User not found"});
    if(user.balance < price) return res.status(400).json({error: "Insufficient funds in wallet."});
    
    // Deduct and Book
    db.run("UPDATE users SET balance = balance - ? WHERE id = ?", [price, req.user.id], (err) => {
      if(err) return res.status(500).json({error: "Transaction failed."});
      
      db.run("INSERT INTO bookings (user_id, package_name, price, date) VALUES (?, ?, ?, ?)", [req.user.id, package_name, price, date], function(err) {
        db.run("INSERT INTO finances (type, amount, description) VALUES (?, ?, ?)", ['income', price, `Booking Payment: ${package_name}`]);
        logActivity(req.user.id, 'BOOKING', `Booked ${package_name} for ₹${price}`);
        res.json({ success: true, booking_id: this.lastID });
      });
    });
  });
});

// ========================
// API: Admin Portal
// ========================
app.get('/api/admin/users', authenticate, requireAdmin, (req, res) => {
  db.all("SELECT id, name, email, role, balance, created_at FROM users", [], (err, rows) => {
    res.json(rows || []);
  });
});

app.delete('/api/admin/users/:id', authenticate, requireAdmin, (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM users WHERE id = ?", [id], (err) => {
    db.run("DELETE FROM bookings WHERE user_id = ?", [id]);
    res.json({ success: true });
  });
});

app.get('/api/admin/finance', authenticate, requireAdmin, (req, res) => {
  db.all("SELECT * FROM finances ORDER BY date DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/admin/logs', authenticate, requireAdmin, (req, res) => {
  db.all(`
    SELECT activity_logs.*, users.name, users.email 
    FROM activity_logs 
    LEFT JOIN users ON activity_logs.user_id = users.id 
    ORDER BY activity_logs.timestamp DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/admin/finance', authenticate, requireAdmin, (req, res) => {
  const { type, amount, description } = req.body;
  db.run("INSERT INTO finances (type, amount, description) VALUES (?, ?, ?)", [type, amount, description], function(err) {
    if (err) return res.status(500).json({ error: "Failed to add transaction" });
    res.json({ success: true, id: this.lastID });
  });
});

// Excel Export
app.get('/api/admin/export', authenticate, requireAdmin, (req, res) => {
  db.all("SELECT id, name, email, role, balance, created_at FROM users", (err, users) => {
    db.all("SELECT * FROM finances", (err, finances) => {
      
      const wb = xlsx.utils.book_new();
      
      const wsUsers = xlsx.utils.json_to_sheet(users);
      xlsx.utils.book_append_sheet(wb, wsUsers, "Users");
      
      const wsFinances = xlsx.utils.json_to_sheet(finances);
      xlsx.utils.book_append_sheet(wb, wsFinances, "Finance Log");
      
      const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Disposition', 'attachment; filename="JaiKashi_Backup.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buf);
    });
  });
});

// Fallback Route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

