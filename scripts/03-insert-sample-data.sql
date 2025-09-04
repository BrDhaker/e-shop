-- Insert sample categories with image URLs
INSERT INTO categories (name, description, image_url) VALUES
('Electronics', 'Electronic devices and gadgets', '/images/category-electronics.png'),
('Clothing', 'Fashion and apparel', '/images/category-clothing.png'),
('Books', 'Books and literature', '/images/category-books.png'),
('Home & Garden', 'Home improvement and gardening supplies', '/images/category-home-garden.png'),
('Sports', 'Sports equipment and accessories', '/images/category-sports.png')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products with real descriptions and image URLs
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) 
SELECT 
    'iPhone 15 Pro Max', 
    'The most advanced iPhone ever with titanium design, A17 Pro chip, and professional camera system. Features 6.7-inch Super Retina XDR display, 5G connectivity, and all-day battery life.', 
    1199.99, 
    25, 
    c.id,
    '/images/smartphone-pro-max.png'
FROM categories c WHERE c.name = 'Electronics'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) 
SELECT 
    'Sony WH-1000XM5 Headphones', 
    'Industry-leading noise canceling wireless headphones with exceptional sound quality. Features 30-hour battery life, quick charge, and crystal-clear hands-free calling.', 
    399.99, 
    50, 
    c.id,
    '/images/wireless-headphones.png'
FROM categories c WHERE c.name = 'Electronics'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) 
SELECT 
    'MacBook Air M2', 
    'Supercharged by the M2 chip, the redesigned MacBook Air combines incredible performance and up to 18 hours of battery life into its strikingly thin aluminum enclosure.', 
    1299.99, 
    15, 
    c.id,
    '/images/laptop-computer.png'
FROM categories c WHERE c.name = 'Electronics'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) 
SELECT 
    'Premium Cotton T-Shirt', 
    'Ultra-soft 100% organic cotton t-shirt with perfect fit and breathable fabric. Available in multiple colors with reinforced seams for lasting durability.', 
    34.99, 
    100, 
    c.id,
    '/images/cotton-t-shirt.png'
FROM categories c WHERE c.name = 'Clothing'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) 
SELECT 
    'Travel Backpack Pro', 
    'Durable 35L travel backpack with laptop compartment, multiple pockets, and water-resistant material. Perfect for business trips, hiking, and daily commuting.', 
    89.99, 
    75, 
    c.id,
    '/images/backpack.png'
FROM categories c WHERE c.name = 'Clothing'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) 
SELECT 
    'JavaScript: The Complete Guide', 
    'Master modern JavaScript from basics to advanced concepts. Covers ES6+, async programming, DOM manipulation, and popular frameworks. Perfect for beginners and experienced developers.', 
    59.99, 
    40, 
    c.id,
    '/images/programming-guide-book.png'
FROM categories c WHERE c.name = 'Books'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) 
SELECT 
    'Smart Coffee Maker', 
    'WiFi-enabled coffee maker with app control, programmable brewing, and thermal carafe. Brew the perfect cup from anywhere with customizable strength and temperature settings.', 
    199.99, 
    30, 
    c.id,
    '/images/coffee-maker.png'
FROM categories c WHERE c.name = 'Home & Garden'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) 
SELECT 
    'Ultra Running Shoes', 
    'Lightweight running shoes with advanced cushioning and breathable mesh upper. Designed for long-distance running with superior comfort and energy return.', 
    149.99, 
    60, 
    c.id,
    '/images/running-shoes.png'
FROM categories c WHERE c.name = 'Sports'
ON CONFLICT DO NOTHING;
