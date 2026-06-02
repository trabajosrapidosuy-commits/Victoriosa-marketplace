# Victoriosa Marketplace - Project Roadmap

## Project Overview
**Victoriosa** is a Shopify-like ecommerce platform designed for beauty, aesthetics, and skincare products with dropshipping integration and AI commerce capabilities. Built with Next.js, Supabase, and Vercel.

**Target Market:** Uruguay (UYU currency)  
**Brand:** Victoriosa  
**Infrastructure:** Supabase + Vercel + WhatsApp Commerce

---

## Phase 1: MVP Foundation (Prompts 01-05)
### Prompt 01: Preflight - Repo & Secure Branch ✅
- Initialize repository
- Create safe development branch: `codex/victoriosa-bootstrap-marketplace`
- Verify folder structure

### Prompt 02: Bootstrap Next.js ✅
- Initialize Next.js + TypeScript + Tailwind
- Configure Supabase connection
- Set up authentication skeleton
- Create `.env.example` with all required variables

### Prompt 03: Supabase Setup & RLS (In Progress)
- Create Supabase database schema ✅
- Enable Row-Level Security (RLS) on all tables ✅
- Set up authentication policies ✅
- Create tables: users, products, orders, supplier_imports ✅
- Database type definitions created ✅

### Prompt 04: Product Admin (CRUD) ✅
- Build admin dashboard (protected route) ✅
- Product upload/edit/delete functionality ✅
- CSV/JSON import support for suppliers ✅
- Draft-only mode (no auto-publishing) ✅

### Prompt 05: Storefront Display ✅
- Product catalog view with search/filtering ✅
- Product detail pages ✅
- Shopping cart (localStorage) ✅
- Basic order creation ✅

---

## Phase 2: Commerce & Integration (Prompts 06-10)
### Prompt 06: Pricing & Margins ✅
- Supplier cost input ✅
- Margin calculation (60-90% configurable) ✅
- Final price display ✅
- Bulk edit support ✅
- Margin presets ✅
- Category-based bulk updates ✅

### Prompt 07: WhatsApp Integration ✅
- WhatsApp button on product pages ✅
- Order confirmation via WhatsApp ✅
- Consultation request handler ✅
- Product inquiry tracking ✅
- Analytics events logging ✅
- Admin WhatsApp dashboard ✅

### Prompt 08: Order Management
- Order creation flow
- Order status tracking
- Supplier notification system
- Customer communication templates

### Prompt 09: Analytics & Reporting
- Dashboard metrics
- Sales reports
- Product performance
- Supplier metrics

### Prompt 10: Supplier Management
- Supplier list/profiles
- API key management (if applicable)
- Product sync status
- Performance metrics

---

## Phase 3: AI & Refinement (Prompts 11-13)
### Prompt 11: AI Product Assistant
- Natural language product search
- Product recommendations
- AI-powered descriptions (optional enhancement)
- Chat interface

### Prompt 12: Email & Notifications
- Order confirmation emails
- Product alerts
- Newsletter template (optional)
- Push notifications (if needed)

### Prompt 13: Performance & UX Optimization
- Image optimization
- Page load speed
- Mobile responsiveness
- Accessibility audit

---

## Phase 4: Deployment (Prompts 14-15)
### Prompt 14: Staging & Testing
- Full end-to-end testing
- Security audit checklist
- Performance benchmarks
- Pre-production validation

### Prompt 15: Production Deployment & Pilot Sales
- Deploy to Vercel production
- Enable real Supabase credentials
- Run pilot sales campaign
- Monitor and iterate

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Headless (custom + Shadcn/ui optional) |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Deployment | Vercel (preview until human approval) |
| Database | PostgreSQL (via Supabase) |
| Storage | Supabase Storage for images |
| Commerce | Dropshipping-ready, WhatsApp-based |

---

## Critical Security Rules

🔒 **Never commit to repo:**
- `.env` files with real secrets
- API keys or service role keys
- Database passwords
- WhatsApp business credentials

🔒 **Always in code:**
- RLS enabled on sensitive tables
- service_role key only server-side (never frontend)
- Public data only in NEXT_PUBLIC_ variables
- No auto-publishing of products (always draft mode)
- No real payments (consultation flow only)

---

## Data Requirements Checklist

Before proceeding to Prompt 02:
- [ ] GitHub repository access confirmed
- [ ] Supabase project created and accessible
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY obtained
- [ ] SUPABASE_SERVICE_ROLE_KEY secured (server-side only)
- [ ] WhatsApp Business number obtained (+598XXXXXXXX format)
- [ ] Instagram/TikTok business handles defined
- [ ] Business address & hours documented
- [ ] Default margin percentage selected (60-90%)
- [ ] Supplier method decided (CSV export vs API vs manual)

---

## Success Criteria

- ✅ Zero secrets in version control
- ✅ All RLS policies correctly configured
- ✅ MVP features fully functional
- ✅ Products in draft mode only
- ✅ WhatsApp integration working
- ✅ Performance > 90 Lighthouse score
- ✅ Mobile responsive (UI works on 320px+)
- ✅ Accessibility level AA compliant

---

**Current Status:** 🚀 Phase 1 - Prompt 02 (Bootstrap)  
**Last Updated:** 2026-05-30  
**Next Milestone:** Complete Prompt 02, begin Prompt 03
