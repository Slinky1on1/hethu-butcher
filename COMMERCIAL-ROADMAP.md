# Nexvintrix Connect — Commercial roadmap

**Product:** Nexvintrix Connect (multi-tenant SaaS for any local business)  
**Company:** Nexvintrix  
**First client:** Hethu Mobile Butcher (industry: butcher)  
**Control plane:** Nventrix Central Hub (Railway)  
**Product hosting:** Vercel + Supabase  

This document is the master plan from single-client demo → subscription SaaS → full Nexvintrix integration.

---

## Status snapshot (June 2026)

| Area | Status |
|------|--------|
| Hethu demo tenant | Live on Vercel |
| GitHub | [Slinky1on1/hethu-butcher](https://github.com/Slinky1on1/hethu-butcher) |
| Supabase (`hethu-butcher` project) | DB + storage configured |
| Multi-tenant architecture | Code complete — migration pending deploy |
| Nventrix hub heartbeat | Not started |
| Subscription billing (Ozow/Paystack via hub) | Not started |
| Copyright / license files | Phase 0 (local) |

**Live URLs (after migration deploy):**

- Landing: https://hethu-butcher.vercel.app  
- Hethu orders: https://hethu-butcher.vercel.app/b/hethu/order  
- Hethu admin: https://hethu-butcher.vercel.app/b/hethu/admin/login  
- Legacy `/order` and `/admin/*` redirect to `/b/hethu/*`

---

## Phase 0 — Legal, ownership & repo hygiene

**Goal:** Protect IP before onboarding paying clients.

- [x] Proprietary `LICENSE` (co-owned, Nexvintrix-operated)
- [x] `EULA.md` — customer-facing license terms
- [x] `COPYRIGHT.md` — notice and ownership summary
- [x] `package.json` — `private: true`, author, license field
- [ ] Register trading name / IP advice (attorney — optional but recommended for SA)
- [ ] Client contract template (setup fee + monthly subscription + support scope)
- [ ] POPIA privacy policy page (customer phone/address data)
- [ ] Terms of service page on marketing site

**Owners:** Theunis Gerhardus Kerry & Nicolaas Jacobus Robbertse (co-owners)  
**Operator:** Nexvintrix (hosted services, billing, support)

---

## Phase 1 — Hethu handover (single tenant) ✅ mostly done

**Goal:** First paying client live and happy.

- [x] Vercel production deploy
- [x] Supabase PostgreSQL + `product-images` bucket
- [x] 14 products seeded
- [x] Core flows: orders, menu, consignment, owing, QR
- [x] Hethu Capitec bank details on Vercel (MR HT NGWANE · 2480495678 · branch 470010)
- [ ] Set Hethu's real `OWNER_PIN` on Vercel (still `1234` — change with Hethu)
- [ ] Hethu: Add to Home Screen + print QR
- [ ] Connect Vercel ↔ GitHub auto-deploy
- [ ] Invoice Hethu (setup + first month)

---

## Phase 2 — Multi-tenant foundation

**Goal:** One Vercel app serves any business that wants to connect; each tenant sees only their data.

### Database

- [x] Add `Business` model (tenant): slug, name, industry, phone, whatsapp, bank fields, `ownerPinHash`, branding
- [x] Add `businessId` to: `Product`, `Order`, `Shop`, `ConsignmentDrop`
- [x] Migration: existing Hethu data → `Business` row `slug: hethu`
- [x] Index tenant queries on `businessId`
- [ ] Run migration on Supabase production

### Routing

- [x] Path-based URLs: `/b/{slug}/order`, `/b/{slug}/admin`
- [x] Middleware: legacy `/order` and `/admin` redirect to default tenant
- [x] `toBusinessConfig(business)` replaces env-based `businessConfig` per tenant

### Owner settings (self-service)

- [x] Admin → **Settings**: business name, phone, WhatsApp, bank details
- [x] Change PIN (hashed with bcrypt)
- [x] Order link + QR uses tenant slug URL
- [ ] Remove all remaining env fallbacks for tenant branding (optional cleanup)

### Auth

- [x] Session stores `businessId` + `businessSlug` after login
- [x] PIN validated against tenant's `ownerPinHash`
- [x] `requireOwner(slug)` scopes to current business

**Exit criteria:** Client #2 onboarded manually (new `Business` row + seed) without a new Vercel deploy.

---

## Phase 3 — Nventrix Central Hub integration

**Goal:** You and Jaco monitor all Connect clients from existing Railway super-admin.

### Connect app (Vercel)

- [ ] `src/lib/hub-heartbeat.ts` — POST to Nventrix every 5 min (Vercel Cron)
- [ ] Env: `CENTRAL_HUB_URL`, `HUB_SECRET`, `INSTANCE_ID`
- [ ] Payload: `product: "connect"`, industry, DB health, orders today, product count, subscription status
- [ ] Handle hub response: `plan`, `billing`, `paymentPending` → lock admin if overdue
- [ ] Per-tenant heartbeats: `instanceId: connect-{slug}` (recommended)

### Nventrix hub (Railway)

- [ ] Add Connect plans to `DEFAULT_PLANS` (trial / starter / pro)
- [ ] Register Hethu as `connect-hethu` instance in super-admin
- [ ] Assign plan + trial end date
- [ ] Optional: super-admin UI tab for `health_data.butcher` metrics
- [ ] Support proxy to tenant URL (existing `proxy.use` permission)

**Exit criteria:** Hethu visible in Nventrix Instances with green heartbeat; billing alert test works.

---

## Phase 4 — Subscriptions & self-service signup

**Goal:** New clients sign up, pay, and configure themselves without manual Vercel work.

### Signup flow

- [ ] Marketing landing page on `www.nexvintrix.co.za` (or dedicated `/butcher`)
- [ ] Signup form: company, email, phone, plan choice
- [ ] Creates `Business` row + hub instance + trial period

### Billing (via Nventrix hub — already built for Stockly)

- [ ] Ozow / Paystack payment links per instance
- [ ] `hub_invoices` + `hub_instance_plans` for butcher product
- [ ] Heartbeat enforces `paymentPending` lock on butcher admin
- [ ] Email: welcome, invoice reminder, payment received (hub email service)

### Onboarding wizard

- [ ] Step 1: Business details + bank
- [ ] Step 2: Set PIN
- [ ] Step 3: Add first products (or import template menu)
- [ ] Step 4: QR + share link

**Exit criteria:** Client #3 signs up end-to-end without you touching Vercel env vars.

---

## Phase 5 — Platform polish & scale

- [ ] Subdomain per tenant: `{slug}.butcher.nexvintrix.co.za`
- [ ] Custom domain (Pro plan): `orders.clientdomain.co.za`
- [ ] Rate limiting on login + public order endpoint
- [ ] Push notifications for new orders (optional)
- [ ] Super-admin metrics: MRR, churn, active tenants
- [ ] Tenant export / backup
- [ ] Delete tenant (GDPR / POPIA)

---

## Phase 6 — Product packaging & GTM

| Plan | Price (example) | Includes |
|------|-----------------|----------|
| **Trial** | Free 14 days | Full features, Nexvintrix branding |
| **Starter** | R299–R399/mo | 1 business, order PWA, admin, QR |
| **Pro** | R499–R699/mo | + custom domain, priority support |
| **Setup** | R2k–R5k once | Menu load, photos, training (Hethu model) |

- [ ] Pricing page
- [ ] Demo video / screenshots
- [ ] Referral program for butchers
- [ ] WhatsApp support channel for owners

---

## Architecture (target)

```
Customer phone  →  Vercel (Mobile Butcher app)  →  Supabase (tenant-scoped data)
                           ↓ heartbeat every 5min
                   Nventrix Hub (Railway)
                     • Super admin (you + Jaco)
                     • Plans, invoices, Ozow
                     • Health, alerts, support
```

---

## Environment variables (platform-level)

These stay on **Vercel** (not per tenant):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` / `DIRECT_URL` | Supabase Postgres |
| `SESSION_SECRET` | Platform session encryption |
| `NEXT_PUBLIC_SUPABASE_URL` | Storage |
| `SUPABASE_SERVICE_ROLE_KEY` | Image uploads |
| `CENTRAL_HUB_URL` | Nventrix Railway hub URL |
| `HUB_SECRET` | Heartbeat auth (match hub) |
| `NEXT_PUBLIC_APP_URL` | Platform base URL |

Per-tenant settings move to **database** in Phase 2.

---

## Repos & deployment

| Repo | Host | Role |
|------|------|------|
| `Slinky1on1/hethu-butcher` | Vercel | Mobile Butcher product |
| `Slinky1on1/Nventrix` | Railway | Central Hub / super-admin |

---

## Build order (recommended)

1. **Phase 0** — Legal (now)  
2. **Phase 1** — Finish Hethu handover  
3. **Phase 2** — Multi-tenant (unblocks all commercial clients)  
4. **Phase 3** — Nventrix hub (ops visibility)  
5. **Phase 4** — Signup + billing (self-service revenue)  
6. **Phase 5–6** — Polish + GTM  

---

## Next action

Start **Phase 2** implementation: `Business` model + tenant middleware + Settings page.
