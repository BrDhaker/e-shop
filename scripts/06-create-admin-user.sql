-- Create admin user in Supabase users table
-- Note: You'll need to create the Supabase auth user first via Supabase dashboard or auth.signUp
-- This script creates the corresponding database record

-- First, let's ensure we have a clean users table
DELETE FROM users WHERE email = 'admin@example.com';

-- Insert admin user (you'll need to replace the UUID with the actual Supabase auth user ID)
-- For now, we'll create a placeholder that can be updated
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  email_verified,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Placeholder UUID - replace with actual Supabase user ID
  'admin@example.com',
  'Admin',
  'User',
  'admin',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_active = true,
  email_verified = true,
  updated_at = NOW();

-- Create a few sample users for testing
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  email_verified,
  created_at,
  updated_at
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'user@example.com',
  'Test',
  'User',
  'user',
  true,
  true,
  NOW(),
  NOW()
),
(
  '22222222-2222-2222-2222-222222222222',
  'john@example.com',
  'John',
  'Doe',
  'user',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
