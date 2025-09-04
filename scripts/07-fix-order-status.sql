-- Fix order status constraint to include payment-related statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'));

-- Add payment-related columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'card';
