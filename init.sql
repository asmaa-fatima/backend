CREATE TABLE IF NOT EXISTS products (
    product_id   INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category     VARCHAR(50),
    price        DECIMAL(10, 2) NOT NULL,
    stock        INT DEFAULT 0
);

INSERT INTO products (product_name, category, price, stock) VALUES
('Wireless Mouse',         'Electronics', 1500.00, 50),
('Cotton T-Shirt',         'Clothing',     899.00, 120),
('Stainless Water Bottle', 'Kitchen',      650.00, 75),
('Notebook (A5)',          'Stationery',   250.00, 200),
('Bluetooth Headphones',   'Electronics', 4500.00, 30);