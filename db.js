const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let dbPath;
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  dbPath = '/tmp/database.sqlite';
  const sourceDb = path.join(__dirname, 'database.sqlite');
  if (!fs.existsSync(dbPath) && fs.existsSync(sourceDb)) {
    try {
      fs.copyFileSync(sourceDb, dbPath);
    } catch (e) {
      console.error("Could not copy base database to /tmp:", e);
    }
  }
} else {
  dbPath = path.join(__dirname, 'database.sqlite');
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Bookings Table
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    package_name TEXT NOT NULL,
    price REAL NOT NULL,
    status TEXT DEFAULT 'Upcoming',
    date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Finance Table (Ledger)
  db.run(`CREATE TABLE IF NOT EXISTS finances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'income' or 'expense'
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Activity Logs Table
  db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Create default admin user if not exists
  db.get("SELECT id FROM users WHERE LOWER(email) = 'admin@jaikashitours.com'", (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
        ['Admin', 'admin@jaikashitours.com', hash, 'admin']);
      console.log("Admin user created: admin@jaikashitours.com / admin123");
    }
  });
});

module.exports = db;

