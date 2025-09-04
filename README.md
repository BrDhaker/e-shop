# React Node.js E-Commerce Application

A complete full-stack e-commerce application built with React (Vite), Node.js, Express, and Supabase database integration featuring real payment processing with Stripe and PayPal.

## 🚀 Features

### Customer Features
- 🛍️ Product browsing with advanced filtering and search
- 🛒 Shopping cart with persistent storage
- 👤 User authentication with Supabase built-in auth
- 📧 Email verification and password reset
- 📦 Order management 
- ⭐ Product reviews and ratings system
- 💳 Multiple payment methods:
  - Demo card payment for testing
  - Real Stripe integration (test environment)
  - Real PayPal integration (sandbox environment)
- 📱 Fully responsive design

### Admin Features
- 📊 Comprehensive admin dashboard
- 🏷️ Product management (CRUD operations)
- 📂 Category management
- 📋 Order status management


## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- React Router DOM for navigation
- Tailwind CSS for styling
- Context API for state management
- Stripe React SDK (@stripe/react-stripe-js)
- PayPal React SDK (@paypal/react-paypal-js)

**Backend:**
- Node.js with Express.js (ES6 modules)
- Supabase built-in authentication
- JWT token handling
- Stripe SDK for payments
- PayPal Server SDK for payments
- Express middleware for authentication

**Database:**
- Supabase (PostgreSQL)
- Built-in authentication system
- Row Level Security (RLS)

## ⚡ Quick Start

### 1. Environment Setup

**Server (.env):**
\`\`\`env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-jwt-secret-minimum-32-characters
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

**Client (.env):**
\`\`\`env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
\`\`\`

### 2. Database Setup

1. Create a Supabase project at https://supabase.com
2. Enable email authentication in Supabase Auth settings
3. Run the SQL scripts in order:
   - `scripts/01-create-tables.sql`
   - `scripts/02-create-indexes.sql`
   - `scripts/03-insert-sample-data.sql`
   - `scripts/04-add-ecommerce-tables.sql`
   - `scripts/05-add-auth-tables.sql`
   - `scripts/06-create-admin-user.sql`
   - `scripts/07-fix-order-status.sql`

### 3. Payment Setup

**Stripe Setup:**
1. Create account at https://stripe.com
2. Get test API keys from dashboard
3. Add keys to environment variables

**PayPal Setup:**
1. Create developer account at https://developer.paypal.com
2. Create sandbox application
3. Copy Client ID and Secret to environment variables

### 4. Installation & Running

\`\`\`bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Run backend (Terminal 1)
cd server
npm run dev

# Run frontend (Terminal 2)
cd client
npm run dev
\`\`\`

### 5. Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Admin Panel:** http://localhost:3000/admin

## 🔐 Authentication System

- **Supabase Built-in Authentication**
- Email verification with automatic emails
- Password reset functionality
- JWT token management
- Role-based authorization (user/admin)
- Secure session handling
- Auto-refresh token mechanism

## 💳 Payment Integration

### Demo Card Payment
- Test payment method for development
- No real payment processing
- Instant order creation

### Stripe Integration
- Real test environment integration
- Embedded checkout experience
- Test card: 4242 4242 4242 4242
- Automatic order creation and inventory updates
- Secure payment processing

### PayPal Integration
- Sandbox environment for testing
- Official PayPal SDK integration
- Real PayPal test accounts supported
- Complete order lifecycle management

## 📊 Database Schema

### Core Tables
- **users** - User accounts and profiles
- **products** - Product catalog with real images
- **categories** - Product categories
- **orders** - Order management with payment tracking
- **order_items** - Order line items
- **cart** - Shopping cart storage
- **addresses** - Shipping addresses



### Authentication
- Uses Supabase built-in auth tables
- Custom user profiles linked to auth.users

## 🛡️ Security Features

- Supabase Row Level Security (RLS)
- Express middleware for Secure authentication
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Environment variable protection
- Secure payment processing
- Token-based authentication



## 📝 API Documentation

### Authentication Endpoints
\`\`\`
POST /api/auth/register     # User registration with email verification
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
GET  /api/auth/profile      # Get user profile
PUT  /api/auth/profile      # Update user profile
POST /api/auth/forgot-password  # Request password reset
POST /api/auth/reset-password   # Reset password
POST /api/auth/resend-verification # Resend verification email
\`\`\`

### Payment Endpoints
\`\`\`
POST /api/payments/create-checkout-session  # Create Stripe session
GET  /api/payments/session-status          # Check Stripe session status
POST /api/payments/paypal/orders           # Create PayPal order
POST /api/payments/paypal/orders/:id/capture # Capture PayPal payment
\`\`\`

### Product Endpoints
\`\`\`
GET    /api/products        # Get all products (with filters)
GET    /api/products/:id    # Get single product
POST   /api/products        # Create product (Admin)
PUT    /api/products/:id    # Update product (Admin)
DELETE /api/products/:id    # Delete product (Admin)
\`\`\`

### Order Management
\`\`\`
GET  /api/orders           # Get user orders
POST /api/orders           # Create new order
GET  /api/orders/:id       # Get order details
PUT  /api/orders/:id/status # Update order status (Admin)
\`\`\`

### E-commerce Features
\`\`\`
GET    /api/cart           # Get user cart
POST   /api/cart           # Add to cart
PUT    /api/cart/:id       # Update cart item
DELETE /api/cart/:id       # Remove from cart

GET    /api/wishlist       # Get user wishlist
POST   /api/wishlist       # Add to wishlist
DELETE /api/wishlist/:id   # Remove from wishlist

GET    /api/reviews/product/:id  # Get product reviews
POST   /api/reviews        # Add review
PUT    /api/reviews/:id    # Update review
DELETE /api/reviews/:id    # Delete review
\`\`\`

## 🎯 Key Features Implemented

### Payment Processing
- **Three Payment Methods**: Demo card, Stripe test, PayPal sandbox
- **Order Tracking**: Complete order lifecycle from creation to delivery
- **Inventory Management**: Automatic stock updates after purchase
- **Payment Verification**: Secure payment confirmation and order creation

### User Experience
- **Responsive Design**: Works on all device sizes
- **Smooth Checkout**: Streamlined payment process
- **Order History**: Complete order tracking and status updates

### Admin Management
- **Product Management**: Full CRUD operations with image uploads
- **Order Management**: Status updates and order tracking


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For setup issues or questions:
1. Check the SETUP.md file for detailed instructions
2. Verify all environment variables are set correctly
3. Ensure database scripts have been run in order
4. Check that both servers are running on correct ports
5. Verify Supabase authentication is properly configured
6. Test payment integrations with provided test credentials

## 🔄 Future Work

- Wishlist functionality (Already API Created)
- Product reviews and ratings (Already API Created for reviews)
- PayPal Payment method Rendering Buttons issues
- Order Tracking
- For Admin : 
  - User management 
  - Sales analytics and reporting
  - Role-based access control
- For Database : 
  - Real-time subscriptions
  - Automated backups

## 💖 Like what you see?

Give this repo a **star** ⭐ and share it with others!  
It only takes a second, but it means a lot. 🙌
