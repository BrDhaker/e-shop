# Quick Setup Guide

## 1. Environment Variables

### Server (.env)
\`\`\`env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key-minimum-32-characters

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Payment Integration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Admin Setup
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Client URL for redirects
CLIENT_URL=http://localhost:3000
\`\`\`

### Client (.env)
\`\`\`env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
\`\`\`

## 2. Supabase Setup

### Create Project
1. Go to https://supabase.com
2. Create a new project
3. Copy the URL and anon key to your .env file

### Configure Authentication
1. Go to Authentication > Settings in Supabase dashboard
2. Enable email authentication
3. Set site URL to `http://localhost:3000`
4. Configure email templates (optional)

### Database Setup
Run these SQL scripts in your Supabase SQL editor in order:

1. `scripts/01-create-tables.sql` - Creates main tables
2. `scripts/02-create-indexes.sql` - Adds performance indexes
3. `scripts/03-insert-sample-data.sql` - Adds sample data with real product images
4. `scripts/04-add-ecommerce-tables.sql` - Adds reviews and wishlist tables
5. `scripts/05-add-auth-tables.sql` - Adds authentication tables
6. `scripts/06-create-admin-user.sql` - Creates admin user
7. `scripts/07-fix-order-status.sql` - Fixes order status constraints

## 3. Payment Setup

### Stripe Setup
1. Create account at https://stripe.com
2. Go to Developers > API keys
3. Copy test keys:
   - Publishable key (pk_test_...) → VITE_STRIPE_PUBLISHABLE_KEY
   - Secret key (sk_test_...) → STRIPE_SECRET_KEY
4. Test card number: 4242 4242 4242 4242

### PayPal Setup
1. Go to https://developer.paypal.com
2. Create a new sandbox app
3. Copy credentials:
   - Client ID → PAYPAL_CLIENT_ID and VITE_PAYPAL_CLIENT_ID
   - Client Secret → PAYPAL_CLIENT_SECRET
4. Create test buyer and seller accounts in sandbox

## 4. Installation

### Install Dependencies
\`\`\`bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd client
npm install
\`\`\`

### Required Packages
The application uses these key packages:
- **Server**: @supabase/supabase-js, stripe, @paypal/paypal-server-sdk
- **Client**: @stripe/react-stripe-js, @paypal/react-paypal-js

## 5. Run the Application

### Terminal 1 (Backend):
\`\`\`bash
cd server
npm run dev
\`\`\`

### Terminal 2 (Frontend):
\`\`\`bash
cd client
npm run dev
\`\`\`

## 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:3000/admin

## 7. Test the Application

### User Registration
1. Register a new account
2. Check email for verification link
3. Verify email and login

### Admin Access
- Email: admin@example.com
- Password: admin123
- Access admin panel at /admin

### Payment Testing
- **Demo Card**: Use any card details (no real processing)
- **Stripe**: Use test card 4242 4242 4242 4242
- **PayPal**: Use sandbox test accounts

## 8. Troubleshooting

### Common Issues

**Server won't start:**
- Check all environment variables are set
- Ensure PORT 5000 is available
- Verify Supabase credentials

**Authentication errors:**
- Check Supabase auth settings
- Verify email verification is enabled


**Database errors:**
- Run all SQL scripts in correct order
- Check Supabase connection
- Verify RLS policies are set correctly

**CORS errors:**
- Ensure both servers are running
- Check API URL in client .env
- Verify ports match configuration

### Debug Mode
Add these console logs to debug issues:
- Check browser console for frontend errors
- Check server terminal for backend errors
- Enable PayPal/Stripe debug logging in code

### Environment Variable Checklist
- [ ] SUPABASE_URL and keys set
- [ ] STRIPE keys set (both publishable and secret)
- [ ] PAYPAL credentials set
- [ ] JWT_SECRET is 32+ characters
- [ ] CLIENT_URL matches frontend URL
- [ ] All VITE_ variables in client .env


