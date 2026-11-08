# toxtoe — Vercel Deployment Checklist

Pre-flight checklist for deploying this Next.js marketplace to Vercel. The app
is build-verified (`npm run build` passes with zero TypeScript errors; `npm run
lint` passes with zero application warnings).

---

## 1. Environment Variables

Vercel does **not** read `.env.local` (it is git-ignored). Every variable below
must be entered manually under **Project → Settings → Environment Variables**
before the first deployment.

### Required — must be set on Vercel

| Variable | Value | Source / Notes |
| --- | --- | --- |
| `DATABASE_URL` | Neon pooled connection string | Used by `src/lib/prisma.ts` for all queries. |
| `DATABASE_URL_UNPOOLED` | Neon direct connection string | Used by Prisma CLI (migrations / seed). Not read by the app itself. |
| `AUTH_SECRET` | `openssl rand -base64 32` (same value as `NEXTAUTH_SECRET` if both are set) | Signs NextAuth JWT sessions. Must be stable across deploys. |
| `NEXTAUTH_SECRET` | Same random value | Legacy alias; NextAuth v5 reads `AUTH_SECRET` first. Set both to the same value for safety. |
| `AUTH_TRUST_HOST` | `true` | Required behind Vercel's proxy so NextAuth resolves callback URLs to the public host. |
| `NEXT_PUBLIC_APP_URL` | `https://<your-app>.vercel.app` | Base URL of the app (reserved for future use, e.g. OAuth redirects). |

### Optional / already present locally

| Variable | Notes |
| --- | --- |
| `TEST_USER_PASSWORD` | Password for the seeded test accounts (`src/auth.ts`). Only needed in development. |
| `NEON_BRANCH` | Neon branch name; used only as a label by `/api/health`. |
| `NEON_BRANCH_ID` | Neon project metadata; not read by app code. |
| `NEON_FUNCTION_HOST_SUFFIX` | Neon metadata for Function hosting; not read by app code. |
| `NEXTAUTH_URL` | Optional. Prefer `AUTH_TRUST_HOST=true`; set this explicitly only if callback URLs still mismatch. |

---

## 2. Database (Neon)

- Run migrations / seed before or right after the first deploy:
  - `npx prisma migrate deploy` (uses `DATABASE_URL_UNPOOLED`)
  - `npx tsx prisma/seed.ts`
- The `postinstall` script in `package.json` runs `prisma generate` automatically on Vercel's install step, so the generated client is always available at build time.

---

## 3. Build

- Local verification already green:
  - `npm run build` → compiles + type-checks, zero errors.
  - `npm run lint` → zero application warnings (`.agents/**` tooling is excluded).
- Vercel will run `npm run build` using **Node 20+**; no custom build command is required.

---

## 4. Post-deploy smoke test

- [ ] `GET /api/health` returns `{"ok":true}` (confirms DB connectivity).
- [ ] Sign in with a seeded account (login flow works on the deployed host).
- [ ] Open a product → **Claim Free** → redirected to the dashboard instantly.
- [ ] Dashboard shows the claimed asset with the delivery button.
- [ ] Claiming a product a second time returns "You already own this asset."
- [ ] Seller → Analytics lists the claim as a transaction ($0.00 earnings).
