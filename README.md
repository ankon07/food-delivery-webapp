# University Canteen Food Ordering System

A full-stack application for ordering food from the university canteen. This system allows students and staff to browse the menu, place orders, pay online via bKash or opt for cash on pickup/delivery, and track their order status. Canteen staff can manage the menu and process orders through a dedicated admin portal.

## Features

### Customer Features
- User authentication (register, login, logout)
- Browse menu items by category
- Add items to cart
- Place orders with delivery options
- Pay via bKash or cash
- Track order status in real-time
- View order history

### Admin Features
- Manage menu categories and items
- Process incoming orders
- Update order status
- View order history
- Set canteen operating hours

## Tech Stack

### Backend
- Node.js
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Socket.IO for real-time updates
- JWT for authentication
- bcrypt for password hashing

### Frontend (Customer & Admin)
- React.js
- TypeScript
- Axios for API requests
- Context API for state management
- Socket.IO client for real-time updates

### Payment Integration
- bKash Payment Gateway

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd university-canteen-food-ordering-system
```

### 2. Set up the backend

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your database credentials and other settings

# Set up the database
npx prisma migrate dev
npx prisma generate

# Start the development server
npm run dev
```

### 3. Set up the frontend (Customer)

```bash
cd frontend/customer

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Set up the frontend (Admin)

```bash
cd frontend/admin

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Environment
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/university_canteen?schema=public"

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# bKash API (Replace with actual credentials in production)
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password
BKASH_BASE_URL=https://checkout.sandbox.bka.sh/v1.2.0-beta
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Menu Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a category by ID
- `POST /api/categories` - Create a new category (staff only)
- `PUT /api/categories/:id` - Update a category (staff only)
- `DELETE /api/categories/:id` - Delete a category (staff only)

### Menu Items
- `GET /api/menu-items` - Get all menu items
- `GET /api/menu-items/category/:categoryId` - Get menu items by category
- `GET /api/menu-items/:id` - Get a menu item by ID
- `POST /api/menu-items` - Create a new menu item (staff only)
- `PUT /api/menu-items/:id` - Update a menu item (staff only)
- `DELETE /api/menu-items/:id` - Delete a menu item (staff only)
- `PATCH /api/menu-items/:id/toggle-availability` - Toggle menu item availability (staff only)

### Orders
- `GET /api/orders` - Get all orders (staff only)
- `GET /api/orders/user` - Get orders by user
- `GET /api/orders/:id` - Get an order by ID
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/:id/status` - Update order status (staff only)
- `PATCH /api/orders/:id/payment` - Update payment status (staff only)
- `PATCH /api/orders/:id/cancel` - Cancel an order

### Payments
- `POST /api/payments/bkash/create` - Create a bKash payment
- `POST /api/payments/bkash/callback` - Handle bKash payment callback
- `GET /api/payments/bkash/status/:paymentId` - Check bKash payment status

### Settings
- `GET /api/settings` - Get canteen settings
- `PUT /api/settings` - Update canteen settings (staff only)
- `PATCH /api/settings/toggle` - Toggle canteen open/closed status (staff only)

## Socket.IO Events

### Server to Client
- `new-order` - New order created
- `order-status-update` - Order status updated
- `payment-status-update` - Payment status updated
- `canteen-status-update` - Canteen status updated

### Client to Server
- `join-user-room` - Join a user-specific room
- `join-staff-room` - Join the staff room

## License

This project is licensed under the MIT License.
