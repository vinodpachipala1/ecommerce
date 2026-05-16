# 🛒 PrimeCart – Full Stack E-Commerce Platform

PrimeCart is a full-stack real-time e-commerce platform built using the PERN stack with separate customer and seller workflows, JWT authentication, Socket.IO realtime updates, PostgreSQL integration, inventory management, shopping cart workflows, and order management systems.

🔗 Live Demo: https://ecommerce-theta-rose-83.vercel.app

---

# 📌 Features

## 👤 Authentication & Authorization
- JWT-based authentication
- Role-based login system
- Customer & Seller accounts
- Protected API routes
- Secure password hashing using bcrypt
- Token verification middleware

---

## 🛍️ Customer Features
- Browse products
- View product details
- Add/remove items from cart
- Update cart quantity
- Checkout workflow
- Place orders
- View order history
- Track order status
- Manage profile and address information

---

## 🏪 Seller Features
- Seller dashboard
- Add new products
- Upload product images
- Manage inventory
- Delete products
- Receive customer orders
- Manage and update order statuses
- Real-time stock synchronization

---

## ⚡ Real-Time Features

Implemented using Socket.IO.

- Live product updates
- Real-time stock changes
- Instant seller order notifications
- Live order status tracking
- Dynamic inventory synchronization

---

# 🧰 Tech Stack

## Frontend
- React.js
- React Router DOM
- Axios
- Socket.IO Client
- Tailwind CSS

## Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcryptjs
- Multer
- Socket.IO
- CORS
- dotenv

---

# 🏗️ System Architecture

```text
Frontend (React)
        ↓
REST APIs + Socket.IO
        ↓
Backend (Express.js)
        ↓
Controllers → Services → Modules
        ↓
PostgreSQL Database
```

---

# 🔐 Authentication Flow

## Login Process

1. User submits credentials
2. Backend validates email and password
3. Password compared using bcrypt
4. JWT token generated
5. Token returned to frontend
6. Frontend stores token
7. Protected requests use:

```http
Authorization: Bearer <token>
```

---

# 🛒 Order Placement Workflow

1. Customer adds products to cart
2. Checkout initiated
3. Backend validates inventory availability
4. PostgreSQL transaction begins
5. Order created
6. Inventory updated
7. Cart cleared
8. Transaction committed
9. Socket.IO broadcasts stock updates

This workflow prevents:
- partial order writes
- inconsistent inventory states
- concurrency-related stock issues

---

# 📂 Project Structure

## Backend

```text
backend/
│
├── server.js
├── src/
│   ├── app.js
│   ├── Controllers/
│   ├── Middleware/
│   ├── Modules/
│   ├── Routes/
│   ├── Services/
│   └── server/
```

---

## Frontend

```text
frontend/src/
│
├── AppRouter/
├── components/
│   ├── customer/
│   ├── seller/
│   └── common/
├── pages/
└── socket.js
```

---

# 📡 API Endpoints

## Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login user |
| GET | `/auth/verifyLogin` | Verify JWT token |
| GET | `/auth/getProfileDetails` | Get user profile |

---

## Product APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/product/getProducts` | Get all products |
| GET | `/product/getBrands` | Get available brands |

---

## Seller Product APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/seller/getallProducts` | Seller product list |
| POST | `/seller/addProduct` | Add product |
| DELETE | `/seller/deleteProduct` | Delete product |

---

## Cart APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/cart/addToCart` | Add item to cart |
| GET | `/cart/getCartAndAddress` | Get cart and address |
| PUT | `/cart/updateQuantity` | Update cart quantity |
| DELETE | `/cart/removeCartItem/:productId` | Remove cart item |

---

## Order APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders/placeOrder` | Place order |
| GET | `/orders/getOrders` | Customer orders |
| GET | `/orders/getOrder/:orderGroupId` | Single order details |

---

## Seller Order APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/sellerOrder/getOrdersReceived` | Seller received orders |
| PUT | `/sellerOrder/updateOrderStatus` | Update order status |

---

# 🔄 Real-Time Events

| Event | Purpose |
|---|---|
| `productAdded` | Sync new products |
| `productDeleted` | Remove deleted products |
| `stockUpdated` | Update inventory live |
| `newOrder` | Notify sellers |
| `orderStatusUpdated` | Notify customers |

---

# 🗄️ Database Tables

## Users
Stores:
- customer and seller accounts
- authentication data
- profile details

## Products
Stores:
- title
- description
- stock
- price
- category
- image
- seller_id

## Cart
Stores customer cart items.

## Orders
Stores customer order details and statuses.

## Address
Stores delivery information.

---

# 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Protected routes
- Role-based access control
- Environment variable configuration
- Secure API handling

---

# 🌟 Engineering Challenges Solved

- Prevented inconsistent inventory states using PostgreSQL transactions
- Implemented real-time stock synchronization using Socket.IO
- Designed RBAC middleware for customer/seller separation
- Structured scalable REST APIs for multi-role workflows
- Managed concurrent order workflows safely

---

# ⚙️ Installation & Setup

## Clone Repository

```bash
git clone https://github.com/vinodpachipala1/ecommerce.git
cd ecommerce
```

---

# 🔧 Backend Setup

## Install Dependencies

```bash
cd backend
npm install
```

## Create `.env`

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

## Start Backend

```bash
npm start
```

---

# 💻 Frontend Setup

## Install Dependencies

```bash
cd frontend
npm install
```

## Create `.env`

```env
VITE_API_URL=http://localhost:5000
```

## Start Frontend

```bash
npm run dev
```

---

# 📈 Future Improvements

- Payment gateway integration
- Wishlist functionality
- Product reviews and ratings
- Search and filtering enhancements
- Admin dashboard
- Order analytics
- Email notifications
- Pagination and caching

---

# 👨‍💻 Author

## Vinod Pachipala

- GitHub: https://github.com/vinodpachipala1
- LinkedIn: https://www.linkedin.com/in/vinod-pachipala-891375372/
