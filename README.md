# Tavrix Bank — Backend API

A secure, full-stack banking platform built with **Nuxt 3** (Nitro/H3 server routes), **Drizzle ORM** (PostgreSQL), **Zod** validation, and **JWT** authentication.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 4 (Nitro/H3) |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Validation | Zod |
| Auth | JWT (access + refresh tokens) + bcrypt |
| Sessions | DB-persisted refresh token rotation |

---

## Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** database running locally or remotely

---

## Environment Setup

Copy the example and fill in your values:

```bash
cp .env .env.local
```

Edit `.env` with your values:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/TAVRIX

JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_REFRESH_EXPIRY_REMEMBER_ME=30d
```

---

## Installation

```bash
npm install
```

---

## Database Setup

### 1. Generate Migrations

After modifying schema files in `server/database/schema/`, generate migration SQL:

```bash
npm run db:generate
```

### 2. Apply Migrations

Run pending migrations against your database:

```bash
npm run db:migrate
```

### 3. Seed Database

Populate the database with test users, accounts, and transactions:

```bash
npm run db:seed
```

**Default seed accounts:**

| Email | Password | Role |
|---|---|---|
| `admin@TAVRIX.com` | `Admin123!` | Admin |
| `john.smith@example.com` | `Password123!` | User |
| `jane.doe@example.com` | `Password123!` | User |
| `michael.b@example.com` | `Password123!` | User (Suspended) |

### 4. Drizzle Studio (optional GUI)

```bash
npm run db:studio
```

---

## Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` for the frontend and the API is available at `http://localhost:3000/api/*`.

---

## API Reference

### Auth Endpoints (public)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login and get tokens |
| `POST` | `/api/auth/logout` | Invalidate session |
| `GET`  | `/api/auth/me` | Get current user profile |
| `POST` | `/api/auth/refresh-token` | Rotate refresh token |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password via token |
| `POST` | `/api/auth/change-password` | Authenticated password change |
| `POST` | `/api/auth/verify-email` | Email verification |
| `GET`  | `/api/auth/sessions` | List active sessions |
| `DELETE` | `/api/auth/sessions` | Revoke all other sessions |
| `DELETE` | `/api/auth/sessions/:id` | Revoke specific session |

### Dashboard Endpoints (user auth required)

| Method | Endpoint | Description |
|---|---|---|
| `GET`  | `/api/dashboard/account/balance` | Checking account balance |
| `GET`  | `/api/dashboard/account/transactions` | Transaction history |
| `GET`  | `/api/dashboard/account/transactions/:id` | Single transaction |
| `GET`  | `/api/dashboard/accounts` | All user accounts |
| `GET`  | `/api/dashboard/transfers` | Transfer history |
| `POST` | `/api/dashboard/transfers` | Create transfer |
| `GET`  | `/api/dashboard/deposits` | Deposit history |
| `POST` | `/api/dashboard/deposits` | Submit deposit request |
| `GET`  | `/api/dashboard/profile` | Get profile |
| `PUT`  | `/api/dashboard/profile` | Update profile |
| `GET`  | `/api/dashboard/kyc` | KYC document status |
| `POST` | `/api/dashboard/kyc` | Submit KYC documents |
| `GET`  | `/api/dashboard/notifications` | List notifications |
| `PUT`  | `/api/dashboard/notifications/:id/read` | Mark notification as read |

### Admin Endpoints (admin role required)

| Method | Endpoint | Description |
|---|---|---|
| `GET`  | `/api/admin/dashboard` | Stats overview |
| `GET`  | `/api/admin/users` | List all users |
| `POST` | `/api/admin/users` | Create user |
| `GET`  | `/api/admin/users/:id` | User detail |
| `POST` | `/api/admin/users/:id/deposit` | Admin deposit to user |
| `POST` | `/api/admin/users/:id/deduct` | Admin deduct from user |
| `PUT`  | `/api/admin/users/:id/contact` | Update user contact info |
| `GET`  | `/api/admin/users/:id/transactions` | User transactions |
| `PUT`  | `/api/admin/users/:id/ban` | Ban/unban user |
| `PUT`  | `/api/admin/users/:id/role` | Change user role |
| `GET`  | `/api/admin/transactions` | All transactions |
| `PUT`  | `/api/admin/transactions/:id/approve` | Approve transaction |
| `PUT`  | `/api/admin/transactions/:id/reverse` | Reverse transaction |
| `GET`  | `/api/admin/kyc` | KYC submissions |
| `PUT`  | `/api/admin/kyc/:id/approve` | Approve KYC |
| `PUT`  | `/api/admin/kyc/:id/reject` | Reject KYC |
| `GET`  | `/api/admin/deposits` | All deposit requests |
| `PUT`  | `/api/admin/deposits/:id/approve` | Approve + fund deposit |
| `PUT`  | `/api/admin/deposits/:id/reject` | Reject deposit |
| `GET`  | `/api/admin/logs` | Admin audit logs |
| `POST` | `/api/admin/notifications` | Send/broadcast notifications |

### Compatibility Aliases (legacy `/api/v1/*` paths)

The `/api/v1/*` routes are proxied to the canonical `/api/*` routes for backwards compatibility.

---

## Security Features

- **Passwords**: bcrypt with cost factor 12
- **Access Tokens**: Short-lived JWT (15 min)
- **Refresh Tokens**: Long-lived (7d / 30d), stored hashed in DB, rotated on use
- **Rate Limiting**: Auth and password reset endpoints rate-limited per IP
- **RBAC Middleware**: All admin routes require `role = admin` validation
- **Email Enumeration Protection**: Forgot-password returns generic response
- **Audit Logs**: All admin actions are recorded in `admin_logs` table

---

## Database Schema

9 tables: `users`, `accounts`, `transactions`, `sessions`, `kyc_documents`, `deposits`, `transfers`, `notifications`, `admin_logs`

---

## Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```
