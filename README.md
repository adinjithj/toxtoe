# toxtoe — The Premier Digital Broker for TouchDesigner Assets

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-v7-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com/)

> **toxtoe** is a curated digital marketplace and broker platform purpose-built for the **TouchDesigner** creative coding, new media, and VJ community to buy and sell premium `.tox` (component) and `.toe` (project network) files.

---

## 🌟 Overview

TouchDesigner networks can range from lightweight GLSL shader operators to massive multi-gigabyte point-cloud, generative simulation, and live show control projects. 

Traditional digital marketplaces force creators into rigid upload limits or charge exorbitant platform cuts to offset massive bandwidth and file hosting expenses. **toxtoe** solves this with an innovative **"Digital Broker" architecture**, delivering a high-performance storefront designed to feel like an extension of the TouchDesigner canvas.

---

## 🏗️ The "Digital Broker" Architecture

```mermaid
flowchart TD
    subgraph Seller Flow
        S[Creator / Seller] -->|1. Uploads heavy .tox / .toe assets| Storage[(External Cloud Storage\nMEGA / Google Drive / MediaFire)]
        S -->|2. Submits shareable delivery link| API[toxtoe Backend API]
        API -->|3. Encrypts & stores link in escrow| DB[(Neon PostgreSQL\nProduct.delivery_url)]
    end

    subgraph Buyer Flow
        B[Buyer] -->|4. Browses catalog| Storefront[toxtoe Glassmorphism UI\npublic metadata only]
        B -->|5. Initiates Checkout| Stripe[Stripe Checkout]
        Stripe -->|6. Webhook verifies payment| Webhook[toxtoe Webhook Gateway]
        Webhook -->|7. Creates verified record| Purchase[(Purchase: COMPLETED)]
        B -->|8. Requests asset access| AuthGate{Backend Purchase\nVerification Gate}
        Purchase -.-> AuthGate
        AuthGate -->|9. Authorized release| Deliver[Protected Delivery Link]
        AuthGate -.->|Not purchased| Reject[403 Forbidden]
    end
```

### Key Architectural Tenets:
1. **Zero Storage & Bandwidth Overhead:** 
   `toxtoe` does not host binary `.tox` or `.toe` files on its web servers or S3 buckets. Sellers retain ownership of their assets on trusted external drives (MediaFire, Google Drive, MEGA, Dropbox).
2. **Database as a Secure Escrow:**
   The seller's shareable delivery link is stored in the database within `Product.delivery_url`.
3. **Zero-Leak Security Constraint:**
   - The `delivery_url` is **never exposed** through public API endpoints, GraphQL queries, or server-rendered catalog pages (`select` whitelist query projection).
   - Only an authenticated user with a verified `Purchase` record (`status: "COMPLETED"`) can unlock and access the delivery link via a secured server route.

---

## 💻 Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router)** | Server Components, Turbopack bundling, streaming SSR, and API route handlers. |
| **Language** | **TypeScript 5** | Strict end-to-end type safety for database models and UI props. |
| **Styling** | **Tailwind CSS v4** | Custom dark-mode visual-arts aesthetic featuring TouchDesigner node grid patterns and glassmorphism. |
| **Database** | **Neon PostgreSQL** | Serverless Postgres featuring instant branching, compute autoscaling, and connection pooling. |
| **ORM & Driver** | **Prisma 7** + `@prisma/adapter-neon` | Modern type-safe data modeling leveraging WebSocket pooled connections. |
| **Payments** | **Stripe Checkout & Webhooks** | PCI-compliant payments with webhook idempotency. |
| **Authentication** | **NextAuth (Auth.js v5)** | Session handling with `@auth/prisma-adapter` integration. |

---

## 🎨 Design System & Aesthetic

Built specifically for visual artists, creative technologists, and live visual performers:
- **Default Dark Mode:** Deep `#090a0f` obsidian canvas with node-inspired ambient glows.
- **Operator Palette Accents:**
  - <span style="color:#10b981;">**TOP Green (`.tox`)**</span>: Component operators.
  - <span style="color:#06b6d4;">**SOP Cyan (`.toe`)**</span>: Full project network files.
  - <span style="color:#a855f7;">**DAT Purple**</span>: Project bundles & multi-asset packages.
- **Tactile Micro-interactions:** Glassmorphic card surfaces with subtle hover scale and reactive border illumination.

---

## 🚀 Getting Started (Local Development)

Follow these steps to clone, configure, and run **toxtoe** locally:

### 1. Clone the Repository
```bash
git clone https://github.com/adinjithj/toxtoe.git
cd toxtoe
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database and API credentials (see [Environment Variables](#-environment-variables) below).

### 4. Sync the Database Schema
Push the Prisma models to your Neon PostgreSQL database:
```bash
npx prisma db push
```

### 5. Launch the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

The application requires the following variables configured in `.env.local`:

```bash
# ==============================================================================
# Database (Neon Serverless PostgreSQL)
# ==============================================================================
# Pooled connection string for regular queries and serverless runtimes
DATABASE_URL="postgresql://user:pass@ep-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Direct unpooled connection string for schema migrations (Prisma db push / migrate)
DATABASE_URL_UNPOOLED="postgresql://user:pass@ep-direct.region.aws.neon.tech/neondb?sslmode=require"

# ==============================================================================
# NextAuth / Auth.js
# ==============================================================================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-32-character-secret"
AUTH_SECRET="your-32-character-secret"
NEXTAUTH_URL="http://localhost:3000"

# ==============================================================================
# Stripe Payments
# ==============================================================================
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ==============================================================================
# Application URL
# ==============================================================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📁 Repository Structure

```text
toxtoe/
├── .agents/skills/            # Official Neon Database Agent Skills
├── components/                # Root component exports (compatibility layer)
├── prisma/
│   └── schema.prisma          # Database schema (User, Product, Purchase, Auth.js)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── health/        # Neon Postgres database health check endpoint
│   │   ├── globals.css        # Tailwind CSS theme & TouchDesigner grid backdrop
│   │   ├── layout.tsx         # Dark mode root layout with Geist fonts
│   │   └── page.tsx           # Storefront landing page & responsive product grid
│   ├── components/
│   │   └── ProductCard.tsx    # Reusable glassmorphic asset card
│   └── lib/
│       └── prisma.ts          # Singleton Prisma Client with Neon Serverless Adapter
├── neon.ts                    # Neon project configuration & branch policies
├── prisma.config.ts           # Prisma 7 datasource & migration configuration
├── project_instructions.md    # Core "Digital Broker" architectural rules & guidelines
└── README.md                  # Project documentation
```

---

## 🛡️ License

Built by the TouchDesigner community, for the TouchDesigner community. Distributed under the [MIT License](LICENSE).
