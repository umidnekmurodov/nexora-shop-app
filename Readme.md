# Nexora — Online Clothing Store

A full-stack e-commerce platform for men's and women's clothing, featuring a customer-facing storefront and a complete admin dashboard for managing products and users.

## Features

### Customer side
- Browse products by gender (Men / Women) with category, price, size, and color filters
- Product search with live results
- Product detail view with image gallery, sizes, and colors
- Shopping cart with quantity controls (add, increase, decrease, remove)
- User registration and login with JWT authentication
- Order checkout

### Admin panel
- Protected `/admin` route — accessible only to `admin` / `superadmin` roles
- **Products**: full CRUD (create, edit, delete) with image and category management
- **Users**: view all registered users, block/unblock accounts (no destructive delete)
- Dashboard with live store statistics
- Secure logout

## Tech Stack

**Frontend**
- React + TypeScript
- React Router
- Custom CSS (no UI framework)

**Backend**
- Node.js + Express (TypeScript)
- PostgreSQL
- JWT authentication, bcrypt password hashing

## Project Structure

```
nexora-shop-app/
├── backend/          # Express API + PostgreSQL
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── db.ts
└── frontend/         # React + TypeScript client
    └── src/
        ├── components/
        ├── api.ts
        └── App.tsx
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/nexora
JWT_SECRET=your-secret-key
```

Run the database schema (see `backend/db` or your SQL migration files), then start the server:

```bash
npm run dev
```

Server runs on `http://localhost:3000`.

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`.

## Database Schema (overview)

The project uses a normalized PostgreSQL schema: `users`, `products`, `categories`, `product_variants` (size + color + stock), `product_images`, `carts`, `cart_items`, `orders`, `order_items`, `reviews`, `genders`, `brands`.

## Author

**Umidjon Nekmurodov**
Frontend Developer — React / TypeScript