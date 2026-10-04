const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection pool (change credentials to match your setup)
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "your_password",
  database: process.env.DB_NAME || "your_database",
  waitForConnections: true,
  connectionLimit: 10,
});

(async function connectWithRetry(retries = 10) {
  try {
    const conn = await db.getConnection();
    console.log("Connected to MySQL database");
    conn.release();
  } catch (err) {
    if (retries === 0) {
      console.error("Database connection failed:", err.message);
      process.exit(1);
    }
    console.log(`DB not ready, retrying in 3s... (${retries} left)`);
    setTimeout(() => connectWithRetry(retries - 1), 3000);
  }
})();

// ---------------- CRUD ROUTES ----------------

// CREATE - add a new product
app.post("/products", async (req, res) => {
  try {
    const { product_name, category, price, stock } = req.body;

    if (!product_name || price === undefined) {
      return res.status(400).json({ error: "product_name and price are required" });
    }

    const [result] = await db.query(
      "INSERT INTO products (product_name, category, price, stock) VALUES (?, ?, ?, ?)",
      [product_name, category || null, price, stock || 0]
    );

    res.status(201).json({
      message: "Product created successfully",
      product_id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - get all products
app.get("/products", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - get a single product by id
app.get("/products/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE product_id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - update a product by id
app.put("/products/:id", async (req, res) => {
  try {
    const { product_name, category, price, stock } = req.body;

    const [result] = await db.query(
      `UPDATE products
       SET product_name = ?, category = ?, price = ?, stock = ?
       WHERE product_id = ?`,
      [product_name, category, price, stock, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - delete a product by id
app.delete("/products/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM products WHERE product_id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});