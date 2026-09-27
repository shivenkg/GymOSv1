# GymOS™ — Enterprise Gym Operating System

GymOS is a cloud-native, multi-tenant enterprise gym management system featuring real-time attendance telemetry, live QR terminal check-in, class & PT scheduling, CRM pipeline, staff HR tracking, automated UPI payments ledger, and database-enforced RBAC tenant isolation.

---

## 🏗️ Architecture Overview

GymOS is designed around a decoupled, 12-factor architecture:

```
┌────────────────────────────────────────────────────────┐
│               Frontend: React 19 + Vite                │
│  - Tailwind CSS v4, Motion, Glassmorphism UI           │
│  - Centralized ApiClient with JWT Bearer attachment    │
│  - Dynamic DEMO_MODE toggle with resilient offline UI  │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON (Port 3000)
┌──────────────────────────▼─────────────────────────────┐
│             Backend API: Node.js + Express             │
│  - /server/src/config     (Env loading, pg.Pool)       │
│  - /server/src/db         (Schema, migrations, seed)   │
│  - /server/src/middleware (JWT, RBAC, tenant isolation)│
│  - /server/src/routes     (REST endpoints)             │
│  - /server/src/services   (Tenant-scoped business logic│
└──────────────────────────┬─────────────────────────────┘
                           │ Connection Pool (pg.Pool)
┌──────────────────────────▼─────────────────────────────┐
│                PostgreSQL 16 Database                  │
│  - Multi-tenant schemas with foreign-key isolation     │
│  - Bcrypt hashed passwords & role permissions mapping  │
└────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Architecture

1. **Zero Hardcoded Secrets**: All credentials, database connection strings, and cryptographic secrets are strictly sourced from environment variables.
2. **Stateless JWT Authentication**: Issues signed HS256 tokens encoding `userId`, `tenantId`, and `role`. Verified on every request.
3. **Database-Enforced Tenant Isolation**: All queries filter strictly by `req.user.tenantId` extracted from the cryptographically verified JWT token. Client-supplied query/body `tenant_id` spoofing is rejected with `403 Forbidden`.
4. **Server-Side RBAC**: Route handlers verify granular role capabilities (`members:read`, `members:write`, `payments:read`, `attendance:scan`, `crm:manage`, `staff:manage`, etc.).
5. **Brute-Force Rate Limiting**: `express-rate-limit` enforces 10 authentication attempts per 15 minutes on `/api/auth/login`.
6. **Structured Audit Logging**: Pino structured logger with automatic redaction of authorization headers, passwords, and tokens.

---

## 📋 Environment Configuration

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP server port | `3000` |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://gymos_user:secure_password_here@localhost:5432/gymos_db` |
| `DB_POOL_MIN` | Minimum connections in pool | `2` |
| `DB_POOL_MAX` | Maximum connections in pool | `10` |
| `DB_SSL` | Enable SSL for remote databases (AWS RDS, Neon, Cloud SQL) | `false` |
| `JWT_SECRET` | 64+ character random secret for HS256 token signing | *(Required in production)* |
| `VITE_API_URL` | Backend API base path | `/api` |

---

## 🚀 Quick Start (Local Development)

### Option A: Running with Docker Compose (Recommended)

Spins up a local PostgreSQL 16 container and the GymOS unified application container:

```bash
# 1. Start containers
docker compose up -d

# 2. View logs
docker compose logs -f app

# App will be accessible at: http://localhost:3000
# Health check: http://localhost:3000/health
```

### Option B: Running Locally with Node & Local PostgreSQL

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and supply your local DATABASE_URL

# 3. Run database migrations
npm run migrate

# 4. Seed database (generates real admin user with random password printed once)
npm run seed

# 5. Start unified full-stack dev server (Express backend + Vite HMR on port 3000)
npm run dev
```

---

## 🗄️ Database Migrations & Seeding

* **Run Migrations:**
  ```bash
  npm run migrate
  ```
  Applies tracked SQL migrations from `server/src/db/migrations/001_initial_schema.sql` creating all 14 multi-tenant tables.

* **Seed Initial Data:**
  ```bash
  npm run seed
  ```
  Seeds default system permissions, the initial tenant (`IronCore Fitness Club`), membership plans, and generates a real branch administrator with a randomly generated, uncommitted password printed once to your terminal.

---

## 🧪 Testing & Validation

```bash
# Run automated regression test suite (includes tenant isolation & security tests)
npm run test

# Type checking & linting
npm run lint

# Build production assets
npm run build
npm run build:server
```

---

## 📡 API Reference

### Health & Diagnostics
* `GET /health` — DB connectivity check (Returns `200 UP` or `503 DOWN`).

### Authentication (`/api/auth`)
* `POST /api/auth/login` — Authenticate user, rate limited, returns JWT + user profile.
* `GET /api/auth/me` — Retrieve active user profile and granted permissions.
* `POST /api/auth/logout` — Invalidate client session.

### Operations & Resource APIs (Tenant-Isolated)
* `GET /api/members` / `POST /api/members` / `PUT /api/members/:id` / `DELETE /api/members/:id`
* `GET /api/payments` / `POST /api/payments`
* `GET /api/attendance` / `POST /api/attendance/check-in`
* `GET /api/crm/leads` / `POST /api/crm/leads` / `PUT /api/crm/leads/:id`
* `GET /api/staff` / `POST /api/staff` / `PUT /api/staff/:id`
* `GET /api/tenants` / `GET /api/tenants/roles`

### SuperAdmin Diagnostics (`/api/admin`)
* `POST /api/admin/db-config/test` — Safely test external database connectivity with short-lived client without logging passwords.
* `GET /api/admin/db-config/status` — Inspect active connection pool telemetry and latency.

---

## 🚢 Production Deployment

The provided multi-stage `Dockerfile` produces an unprivileged, minimal Alpine production image:

```bash
docker build -t gymos:latest .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/gymos?sslmode=require" \
  -e DB_SSL="true" \
  -e JWT_SECRET="your-production-secret" \
  gymos:latest
```
