# Hethu Mobile Butcher — Go-live phases

## Phase A — Production infrastructure (required for Vercel)
- [x] PostgreSQL Prisma schema + migrations
- [x] Supabase Storage for product photos (local fallback for dev)
- [x] Production env validation + hide default PIN on login
- [x] Vercel build scripts (`prisma migrate deploy`) + deploy docs
- [ ] **You:** Create Supabase project, set env vars on Vercel, deploy

## Phase B — Business completeness (before handover)
- [x] Mark shop consignment sales as paid (Owing page)
- [x] Prisma transactions for stock + orders + consignment drops
- [x] Error pages + product save error messages
- [x] PWA PNG icons (192/512) — run `npm run icons` after changing `icon.svg`

## Phase C — Deploy & handover (your checklist)
- [ ] Push code to GitHub
- [ ] Supabase: create project → Settings → Database → connection strings (pooler + direct)
- [ ] Supabase: Storage → create public bucket `product-images`
- [ ] Vercel: import repo, add all env vars from `.env.example`
- [ ] Set `NEXT_PUBLIC_APP_URL` to live URL
- [ ] Set Hethu's bank details + strong PIN + SESSION_SECRET (32+ chars)
- [ ] Deploy → verify `/order` and `/admin`
- [ ] Seed products if empty: `npm run db:seed` (against prod URL locally once)
- [ ] Hethu: Add to Home Screen, print QR

## Phase D — Optional (post-launch / paid extra)
- Login rate limiting
- Push notifications for new orders
- Product/shop delete
- Custom domain
- Service worker / offline
