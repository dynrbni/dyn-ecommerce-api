# 🛒 DYN E-Commerce API

REST API untuk aplikasi e-commerce yang dibangun menggunakan **Express.js**, **TypeScript**, **Prisma ORM**, dan **PostgreSQL**. Dilengkapi dengan integrasi pembayaran **Midtrans** dan berbagai fitur seperti autentikasi JWT, role-based access control, validasi input dengan Zod, serta rate limiting.

---

## 📋 Daftar Isi

- [Tech Stack](#-tech-stack)
- [Fitur](#-fitur)
- [Database Schema](#-database-schema)
- [Instalasi](#-instalasi)
- [Environment Variables](#-environment-variables)
- [Menjalankan Server](#-menjalankan-server)
- [API Endpoints](#-api-endpoints)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Categories](#categories)
  - [Products](#products)
  - [Cart](#cart)
  - [Orders](#orders)
  - [Midtrans Webhook](#midtrans-webhook)
- [Middleware](#-middleware)
- [Struktur Folder](#-struktur-folder)

---

## 🛠 Tech Stack

| Teknologi | Deskripsi |
|---|---|
| **Node.js + Express JS** | Web framework |
| **TypeScript** | Type-safe JavaScript |
| **Prisma ORM** | Database ORM |
| **PostgreSQL** | Relational database |
| **JSON Web Token** | Autentikasi |
| **Bcrypt** | Hashing password |
| **Zod** | Validasi schema request body |
| **Midtrans** | Payment gateway |
| **express-rate-limit** | Rate limiting |

---

## ✨ Fitur

- **Autentikasi & Otorisasi** — Register, login dengan JWT, role-based access (USER / ADMIN)
- **Manajemen User** — CRUD user dengan soft delete
- **Manajemen Kategori** — CRUD kategori produk dengan soft delete (Admin only)
- **Manajemen Produk** — CRUD produk dengan soft delete dan manajemen stok (Admin only)
- **Keranjang Belanja** — Tambah, update, hapus item di keranjang
- **Order & Checkout** — Checkout langsung atau dari keranjang, otomatis mengurangi stok
- **Pembayaran Midtrans** — Integrasi Snap Midtrans untuk pemrosesan pembayaran
- **Webhook Midtrans** — Menerima notifikasi status pembayaran secara real-time
- **Validasi Input** — Validasi request body menggunakan Zod schema
- **Rate Limiting** — Membatasi 10 request per menit per IP
- **Soft Delete** — Data user, produk, dan kategori tidak dihapus permanen

---

## 🗄 Database Schema

```
User          Category        Product
├── id          ├── id          ├── id
├── name        ├── name        ├── name
├── email       ├── products[]  ├── description
├── password    ├── createdAt   ├── price
├── role        └── deletedAt   ├── stock
├── cart                        ├── categoryId
├── orders[]                    ├── createdAt
├── createdAt                   ├── updatedAt
├── updatedAt                   └── deletedAt
└── deletedAt

Cart          CartItem        Order
├── id          ├── id          ├── id
├── userId      ├── cartId      ├── userId
├── items[]     ├── productId   ├── totalPrice
└── createdAt   └── quantity    ├── paymentStatus
                                ├── shippingStatus
OrderItem     Payment         ├── items[]
├── id          ├── id          ├── payment
├── orderId     ├── orderId     ├── createdAt
├── productId   ├── transactionId └── updatedAt
├── quantity    ├── paymentType
└── priceSnapshot ├── transactionStatus
                ├── fraudStatus
                ├── grossAmount
                ├── signatureKey
                ├── midtransOrderId
                ├── createdAt
                └── updatedAt
```

### Enums

| Enum | Values |
|---|---|
| **Role** | `USER`, `ADMIN` |
| **PaymentStatus** | `PENDING`, `SUCCESS`, `FAILED`, `EXPIRED`, `REFUND`, `CANCELLED` |
| **ShippingStatus** | `NOT_SHIPPED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `RETURNED`, `CANCELLED` |

---

## 🚀 Instalasi

### Prasyarat

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/)
- [Midtrans Sandbox Account](https://dashboard.sandbox.midtrans.com/)

### Langkah-langkah

```bash
# 1. Clone repository
git clone https://github.com/username/dyn-ecommerce-api.git
cd dyn-ecommerce-api

# 2. Install dependencies
npm install

# 3. Setup file environment
cp .env.example .env
# Isi variabel di file .env (lihat bagian Environment Variables)

# 4. Jalankan migrasi database
npx prisma migrate dev

# 5. Generate Prisma Client
npx prisma generate
```

---

## 🔐 Environment Variables

Buat file `.env` di root project dengan isi berikut:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT
JWT_SECRET="your-jwt-secret-key"

# Server
PORT=3000

# Midtrans
SERVER_KEY="your-midtrans-server-key"
CLIENT_KEY="your-midtrans-client-key"
```

> **Catatan:** Untuk Midtrans, gunakan Server Key dan Client Key dari [Midtrans Sandbox Dashboard](https://dashboard.sandbox.midtrans.com/) untuk mode development.

---

## ▶ Menjalankan Server

```bash
# Development mode (dengan hot-reload)
npm run dev
```

Server akan berjalan di `http://localhost:3000` (atau port yang ditentukan di `.env`).

---

## 📡 API Endpoints

Base URL: `http://localhost:3000/api`

> Semua endpoint (kecuali Register & Login) membutuhkan header:
> ```
> Authorization: Bearer <token>
> ```

---

### Authentication

| Method | Endpoint | Deskripsi | Auth | Role |
|---|---|---|---|---|
| `POST` | `/api/register` | Registrasi user baru | ❌ | - |
| `POST` | `/api/login` | Login dan mendapatkan token JWT | ❌ | - |

#### Register

```
POST /api/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```
POST /api/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "msg": "Berhasil login",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Users

| Method | Endpoint | Deskripsi | Auth | Role |
|---|---|---|---|---|
| `GET` | `/api/users` | Mendapatkan semua user | ✅ | Any |
| `GET` | `/api/users/:id` | Mendapatkan user berdasarkan ID | ✅ | Any |
| `PATCH` | `/api/users/:id` | Update data user | ✅ | Admin |
| `DELETE` | `/api/users/:id` | Soft delete user | ✅ | Admin |

---

### Categories

| Method | Endpoint | Deskripsi | Auth | Role |
|---|---|---|---|---|
| `GET` | `/api/categories` | Mendapatkan semua kategori | ✅ | Any |
| `GET` | `/api/categories/:id` | Mendapatkan kategori berdasarkan ID | ✅ | Any |
| `POST` | `/api/categories` | Membuat kategori baru | ✅ | Admin |
| `PATCH` | `/api/categories/:id` | Update kategori | ✅ | Admin |
| `DELETE` | `/api/categories/:id` | Soft delete kategori | ✅ | Admin |

#### Create Category (Admin)

```
POST /api/categories
```

**Request Body:**
```json
{
  "name": "Electronics"
}
```

---

### Products

| Method | Endpoint | Deskripsi | Auth | Role |
|---|---|---|---|---|
| `GET` | `/api/products` | Mendapatkan semua produk | ✅ | Any |
| `GET` | `/api/products/:id` | Mendapatkan produk berdasarkan ID | ✅ | Any |
| `POST` | `/api/products` | Membuat produk baru | ✅ | Admin |
| `PATCH` | `/api/products/:id` | Update produk | ✅ | Admin |
| `DELETE` | `/api/products/:id` | Soft delete produk | ✅ | Admin |

#### Create Product (Admin)

```
POST /api/products
```

**Request Body:**
```json
{
  "name": "Wireless Mouse",
  "description": "Mouse wireless ergonomis",
  "price": 150000,
  "stock": 50,
  "categoryId": "uuid-kategori"
}
```

---

### Cart

| Method | Endpoint | Deskripsi | Auth | Role |
|---|---|---|---|---|
| `GET` | `/api/cart` | Mendapatkan keranjang user | ✅ | Any |
| `GET` | `/api/cart/:id` | Mendapatkan item keranjang berdasarkan ID | ✅ | Any |
| `POST` | `/api/cart` | Menambahkan produk ke keranjang | ✅ | Any |
| `PATCH` | `/api/cart` | Update quantity item di keranjang | ✅ | Any |
| `DELETE` | `/api/cart` | Menghapus item dari keranjang | ✅ | Any |

#### Add to Cart

```
POST /api/cart
```

**Request Body:**
```json
{
  "productId": "uuid-produk",
  "quantity": 2
}
```

#### Update Cart Item

```
PATCH /api/cart
```

**Request Body:**
```json
{
  "cartItemId": "uuid-cart-item",
  "quantity": 5
}
```

#### Remove Cart Item

```
DELETE /api/cart
```

**Request Body:**
```json
{
  "cartItemId": "uuid-cart-item"
}
```

---

### Orders

| Method | Endpoint | Deskripsi | Auth | Role |
|---|---|---|---|---|
| `GET` | `/api/orders` | Mendapatkan semua order user | ✅ | Any |
| `GET` | `/api/orders/:id` | Mendapatkan order berdasarkan ID | ✅ | Any |
| `POST` | `/api/orders/checkout-cart` | Checkout dari keranjang | ✅ | Any |
| `POST` | `/api/orders/checkout` | Checkout langsung (tanpa keranjang) | ✅ | Any |
| `PATCH` | `/api/orders/:id` | Update status order | ✅ | Admin |

#### Checkout dari Keranjang

```
POST /api/orders/checkout-cart
```

**Request Body:**
```json
{
  "cartItemId": ["uuid-cart-item-1", "uuid-cart-item-2"]
}
```

**Response:**
```json
{
  "msg": "Berhasil checkout produk",
  "data": {
    "orderId": "uuid-order",
    "totalPrice": 300000,
    "shippingStatus": "NOT_SHIPPED",
    "paymentUrl": "https://app.sandbox.midtrans.com/snap/v4/redirection/...",
    "items": [
      {
        "productId": "uuid-produk",
        "quantity": 2,
        "priceSnapshot": 150000
      }
    ]
  }
}
```

#### Checkout Langsung

```
POST /api/orders/checkout
```

**Request Body:**
```json
{
  "productId": "uuid-produk",
  "quantity": 1
}
```

---

### Midtrans Webhook

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/midtrans/webhook` | Menerima notifikasi pembayaran dari Midtrans |

Webhook ini secara otomatis memperbarui `paymentStatus` dan `shippingStatus` order berdasarkan notifikasi dari Midtrans:

| Transaction Status | Payment Status | Shipping Status |
|---|---|---|
| `capture` / `settlement` | `SUCCESS` | `PROCESSING` |
| `cancel` | `CANCELLED` | `CANCELLED` |
| `expire` | `EXPIRED` | `CANCELLED` |
| `pending` | `PENDING` | - (tidak berubah) |

> **Setup Webhook:** Atur Notification URL di [Midtrans Dashboard](https://dashboard.sandbox.midtrans.com/) ke `https://your-domain.com/api/midtrans/webhook`. Untuk development, gunakan [ngrok](https://ngrok.com/) untuk mendapatkan public URL.

---

## 🔒 Middleware

| Middleware | Deskripsi |
|---|---|
| **JWT Verify** | Memverifikasi token JWT dari header `Authorization: Bearer <token>` |
| **Role Validation** | Memvalidasi role user (USER / ADMIN) untuk akses endpoint tertentu |
| **Zod Validation** | Memvalidasi request body menggunakan Zod schema |
| **Rate Limiter** | Membatasi 10 request per menit per IP address |

---

## 📂 Struktur Folder

```
dyn-ecommerce-api/
├── controllers/          # Request handler / business logic
│   ├── cart.ts
│   ├── category.ts
│   ├── midtrans.ts
│   ├── orders.ts
│   ├── products.ts
│   └── users.ts
├── database/
│   └── prismaClient.ts   # Prisma client instance
├── middleware/
│   ├── jwtVerify.ts       # JWT authentication middleware
│   ├── rateLimit.ts       # Rate limiting middleware
│   ├── roleValidation.ts  # Role-based authorization middleware
│   └── zodValidation.ts   # Request body validation middleware
├── prisma/
│   ├── schema.prisma      # Database schema definition
│   └── migrations/        # Database migration files
├── routes/                # Route definitions
│   ├── cart.ts
│   ├── category.ts
│   ├── orders.ts
│   ├── products.ts
│   └── users.ts
├── services/
│   ├── jwtCreate.ts       # JWT token generation
│   └── midtrans.ts        # Midtrans Snap integration
├── types/
│   └── express.d.ts       # Custom Express type definitions
├── zodSchemas/            # Zod validation schemas
│   ├── cart.schemas.ts
│   ├── category.schemas.ts
│   ├── orders.schemas.ts
│   ├── products.schemas.ts
│   └── users.schemas.ts
├── server.ts              # Entry point aplikasi
├── package.json
└── tsconfig.json
```

---

## 📝 Lisensi

ISC

---

**Made by King Dean** 👑
