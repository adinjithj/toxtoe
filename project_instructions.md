# toxtoe - Project Instructions & Architectural Guardrails

## 1. Project Overview & Identity
**toxtoe** is a curated digital marketplace designed specifically for TouchDesigner artists, developers, and creative technologists to sell and purchase `.tox` (TouchDesigner component) and `.toe` (TouchDesigner project) files.

---

## 2. Core Architectural Constraint: The "Digital Broker" Model (CRITICAL)

> [!IMPORTANT]
> **ZERO FILE HOSTING RULE**: Under no circumstances should `toxtoe` host, store, or stream `.tox` or `.toe` files on its own servers, containers, or object storage buckets (S3, Cloudflare R2, Google Cloud Storage, etc.). 

### Architectural Rationale
- Saves massive storage and egress bandwidth costs.
- Avoids hosting liability, malware scanning complexity, and heavy asset infrastructure.
- Leverages existing file hosting services that creators already use.

### Seller Workflow
1. Sellers upload their `.tox` / `.toe` project files, assets, and documentation to an external file-hosting provider (e.g., **Google Drive**, **MediaFire**, **MEGA**, **Dropbox**).
2. When creating or updating a product on `toxtoe`, the seller provides a secure, shareable download link.
3. This link is stored in the database in the `delivery_url` column of the `Product` model.

### Strict Security & Zero-Leak Constraint
- **NEVER EXPOSE `delivery_url` TO PUBLIC CLIENTS:**
  - The `delivery_url` field must **never** be included in public API responses, product catalog queries, search listings, or server-rendered public pages.
  - All Prisma queries for public consumption MUST use explicit `select` statements that omit `delivery_url`.
- **PURCHASE VERIFICATION GATEWAY:**
  - A user can ONLY receive the `delivery_url` if the backend verifies an active, authenticated session AND a completed `Purchase` record in PostgreSQL for that specific user and product.
  - Delivery links must only be delivered through a protected server action or authenticated API endpoint (e.g., `/api/products/[id]/delivery` or `/api/purchases/[purchaseId]/download`).

#### Verification Logic Pattern (Prisma + Server Route/Action)
```typescript
import { auth } from "@/auth"; // NextAuth / Auth.js
import { prisma } from "@/lib/prisma";

export async function getProductDeliveryUrl(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 1. Verify that the user has successfully purchased this specific product
  const purchase = await prisma.purchase.findUnique({
    where: {
      user_product_purchase: {
        user_id: session.user.id,
        product_id: productId,
      },
    },
  });

  if (!purchase || purchase.status !== "COMPLETED") {
    throw new Error("Forbidden: Valid purchase required to access delivery link");
  }

  // 2. Query only the delivery_url once purchase is verified
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { delivery_url: true, title: true },
  });

  return product?.delivery_url;
}
```

---

## 3. Tech Stack
- **Framework:** Next.js (App Router, React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Payments:** Stripe (Checkout Sessions & Webhook handling)
- **Authentication:** NextAuth (Auth.js v5) with `@auth/prisma-adapter`

---

## 4. Database Models Summary
- **User:** Represents buyers and sellers, integrated with NextAuth (`Account`, `Session`, `VerificationToken`).
- **Product:** Contains product metadata, `title`, `slug`, `price` (in cents), `thumbnail_url`, `file_type` (`TOX`, `TOE`, `BOTH`), and the sensitive `delivery_url`.
- **Purchase:** Tracks completed transactions between `User` (buyer) and `Product`, capturing `stripe_payment_intent_id`, `stripe_checkout_session_id`, `amount_paid`, and `status`.

---

## 5. Security & Development Guidelines
1. **Always exclude `delivery_url` from public Prisma queries** (`select` whitelist pattern).
2. **Handle Stripe Webhooks idempotently** before marking `Purchase.status = "COMPLETED"`.
3. **Never log `delivery_url`** in telemetry, server logs, or client-facing errors.
4. **Validate external URLs** provided by sellers to ensure they are valid URLs using HTTPS.
