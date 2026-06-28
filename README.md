# Mobile Butcher

**Nexvintrix** — mobile-first PWA for meat businesses: customer orders, owner admin, consignment, and stock.

First production client: **Hethu Mobile Butcher** · Live: https://hethu-butcher.vercel.app

> **Commercial roadmap:** [COMMERCIAL-ROADMAP.md](./COMMERCIAL-ROADMAP.md)  
> **Copyright © 2026** Theunis Gerhardus Kerry & Nicolaas Jacobus Robbertse. Proprietary — see [LICENSE](./LICENSE).
## Quick start (local)

1. Copy `.env.example` to `.env`
2. Create a free [Supabase](https://supabase.com) project and paste your Postgres URLs into `DATABASE_URL` and `DIRECT_URL`
3. Run:

```bash
npm install
npm run db:setup
npm run dev
```

- **Customer order page:** http://localhost:3000/order
- **Owner admin:** http://localhost:3000/admin/login (PIN: `1234` by default)

Product photos save to `public/uploads/` locally. On Vercel, configure Supabase Storage (see deploy below).

## Configure

- `OWNER_PIN` — login PIN for the owner (use a strong PIN in production)
- `SESSION_SECRET` — at least 32 random characters in production
- `NEXT_PUBLIC_*` — business name, phone, WhatsApp, bank details
- `NEXT_PUBLIC_APP_URL` — your public URL when deployed

## Owner features

- Edit menu (products, prices, photos, stock)
- Manage consignment shops
- Log consignment drops
- Record sales (cash / EFT, paid / unpaid)
- Customers owing — mark order and shop sales as paid
- Manage customer orders
- QR code for the order link

## Test on Hethu's phone (same Wi-Fi)

1. Run `npm run dev` on your PC
2. Find your PC's local IP (e.g. `192.168.1.5`)
3. On his phone, open `http://192.168.1.5:3000/order`
4. Set `NEXT_PUBLIC_APP_URL=http://192.168.1.5:3000` in `.env`

## Deploy to Vercel + Supabase

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. **Database** → copy connection strings:
   - **Transaction pooler** → `DATABASE_URL` (port 6543)
   - **Direct** → `DIRECT_URL` (port 5432)
3. **Storage** → create a **public** bucket named `product-images`
4. **Settings → API** → copy project URL and `service_role` key

### 2. Vercel

1. Push this repo to GitHub and import in [Vercel](https://vercel.com)
2. Add all variables from `.env.example`:
   - Strong `OWNER_PIN` and `SESSION_SECRET` (32+ chars)
   - Hethu's real bank details
   - `NEXT_PUBLIC_APP_URL` = your Vercel URL (e.g. `https://hethu.vercel.app`)
   - Supabase `DATABASE_URL`, `DIRECT_URL`, storage keys
3. Deploy — the build runs `prisma migrate deploy` automatically

### 3. Seed products (first deploy only)

If the menu is empty, run once from your PC with production `DATABASE_URL` in `.env`:

```bash
npm run db:seed
```

### 4. Handover

- Hethu opens the site in Chrome → **Add to Home Screen**
- Print QR from **Admin → QR code** for flyers
- Change PIN and bank details in Vercel env vars if needed

See `PHASES.md` for the full go-live checklist.
