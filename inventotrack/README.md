# InventoTrack — B2B Inventory Management System

Dashboard for mid-sized retail businesses to track stock levels, sales trends and supplier orders.

**Stack:** React 18 (Vite), Redux Toolkit, React Router, Recharts · Node.js, Express · MongoDB + Mongoose · JWT auth with role-based access.

## Features
- Dashboard: stock value, low-stock alerts, 30-day revenue trend, top sellers (auto-refreshes every 15s)
- Products: search, category filter, low-stock filter, pagination, quick +/- stock adjust, add/edit
- Checkout: Redux cart → atomic stock deduction with rollback if any item is short
- Supplier orders: place order, mark received (adds to stock), cancel
- Roles: `admin` (everything), `manager` (edit products/orders), `staff` (view + sell)

## Performance work
- Compound/text/reference indexes on `Product`, `Sale`, `SupplierOrder`
- `.lean()` reads, field projection, server-side pagination, parallel queries with `Promise.all`
- Aggregation pipelines for dashboard metrics instead of loading documents into Node

## Run locally
Requires Node 18+ and MongoDB (local or Atlas).
```bash
npm run install:all
cp server/.env.example server/.env     # edit MONGO_URI and JWT_SECRET
npm run seed                            # demo data
npm run dev:server                      # http://localhost:5000
npm run dev:client                      # http://localhost:5173 (new terminal)
```
Demo logins: `admin@inventotrack.com / admin123`, `manager@inventotrack.com / manager123`, `staff@inventotrack.com / staff123`

## API
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /login | public |
| GET | /api/auth/me | any |
| GET | /api/products | any |
| POST/PUT/PATCH | /api/products, /:id, /:id/stock | admin, manager |
| DELETE | /api/products/:id | admin |
| POST | /api/sales/checkout | any |
| GET | /api/dashboard | any |
| GET/POST | /api/suppliers, /api/suppliers/orders | read: any, write: admin/manager |
| PATCH | /api/suppliers/orders/:id/receive, /cancel | admin, manager |
