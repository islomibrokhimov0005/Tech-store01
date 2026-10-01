const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database("techstore.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT NOT NULL,
    emoji TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    total REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const count = db.prepare("SELECT COUNT(*) AS count FROM products").get().count;
if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, category, price, description, emoji)
    VALUES (?, ?, ?, ?, ?)
  `);

  const products = [
    ["Galaxy S25", "Phones", 899, "Modern smartphone with a bright display and powerful performance.", "📱"],
    ["iPhone 16", "Phones", 999, "Premium smartphone with an advanced camera system.", "📱"],
    ["MacBook Air M4", "Laptops", 1099, "Lightweight laptop designed for study and everyday work.", "💻"],
    ["ASUS ROG Laptop", "Laptops", 1499, "High-performance laptop for gaming and demanding applications.", "💻"],
    ["AirPods Pro", "Accessories", 249, "Wireless earbuds with active noise cancellation.", "🎧"],
    ["Mechanical Keyboard", "Accessories", 89, "RGB mechanical keyboard for work and gaming.", "⌨️"],
    ["Gaming Mouse", "Accessories", 59, "Lightweight precision mouse with programmable buttons.", "🖱️"],
    ["4K Monitor", "Accessories", 399, "27-inch 4K monitor for productivity and entertainment.", "🖥️"]
  ];

  const transaction = db.transaction(() => {
    for (const product of products) insert.run(...product);
  });
  transaction();
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/products", (req, res) => {
  const { category, search } = req.query;
  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category && category !== "All") {
    sql += " AND category = ?";
    params.push(category);
  }

  if (search) {
    sql += " AND (name LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY id DESC";
  res.json(db.prepare(sql).all(...params));
});

app.get("/api/categories", (req, res) => {
  res.json(db.prepare("SELECT DISTINCT category FROM products ORDER BY category").all().map(x => x.category));
});

app.post("/api/orders", (req, res) => {
  const { customerName, customerEmail, total } = req.body;

  if (!customerName || !customerEmail || !Number.isFinite(Number(total))) {
    return res.status(400).json({ error: "Please provide valid customer information." });
  }

  const result = db.prepare(`
    INSERT INTO orders (customer_name, customer_email, total)
    VALUES (?, ?, ?)
  `).run(customerName, customerEmail, Number(total));

  res.status(201).json({
    message: "Order created successfully.",
    orderId: result.lastInsertRowid
  });
});

app.get("/api/orders", (req, res) => {
  res.json(db.prepare("SELECT * FROM orders ORDER BY id DESC").all());
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Tech Store running on http://localhost:${PORT}`);
});