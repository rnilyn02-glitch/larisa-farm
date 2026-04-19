# Frontend Design: Larisa-I & Co Farm App

**Date:** 2026-04-19  
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand · React Hook Form · Zod · SWR  
**Backend:** n8n webhooks at `https://api.ramirezi1.online`  
**Container:** Docker, served via Traefik reverse proxy

---

## 1. Scope & Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Customer auth | None — no registration | Small local farm, friction reduction |
| Admin panel location | `/admin` route in same Next.js app | Single deploy, simpler ops |
| Data access | All via n8n GET/POST webhooks | Backend already owns all DB logic |
| Admin auth | Login/password form → JWT cookie | Simple, no external dependencies |
| Visual style | Natural/Organic — green (#2d5a1b), earthy cream (#f5f0e8) | Matches farm brand |
| Device priority | Mobile-first | Primary audience uses smartphones |
| Delivery date | Full date picker (user chooses any date) | Per owner preference |
| State management | Zustand (cart) + SWR (admin data) | Minimal, appropriate for scope |

---

## 2. Route Structure

### Public (customer-facing)

```
app/
  layout.tsx              — Header (logo, cart icon), footer, CartDrawer
  page.tsx                — Landing: hero banner + category grid
  catalog/
    page.tsx              — Product catalog with category filter chips
  cart/
    page.tsx              — Cart page with item list and totals
  checkout/
    page.tsx              — Order form
  order/[id]/
    page.tsx              — Order status page (SSR by order ID)
  about/page.tsx          — About the farm
  delivery/page.tsx       — Delivery & payment info
  contacts/page.tsx       — Contacts
```

### Admin panel

```
app/admin/
  login/page.tsx          — Login form (email/password → JWT cookie)
  layout.tsx              — Dark green sidebar navigation
  page.tsx                — Dashboard
  orders/
    page.tsx              — Orders list with status filter tabs
    [id]/page.tsx         — Order detail + confirm form
  products/
    page.tsx              — Products CRUD table
  customers/
    page.tsx              — Customer list with purchase history
```

### Middleware

`middleware.ts` intercepts all `/admin/*` requests (except `/admin/login`) and redirects to `/admin/login` if no valid JWT session cookie is present. Credentials stored in environment variables.

---

## 3. Components & Data Flow

### Server Components (SSR / ISR)

| Component | Data source | Cache |
|---|---|---|
| `CatalogPage` | GET n8n webhook → products list | ISR revalidate: 60s |
| `OrderStatusPage` | GET n8n webhook → order by ID | SSR (no cache) |
| `admin/OrdersPage` | GET n8n webhook → orders list | SSR |
| `admin/DashboardPage` | GET n8n webhook → stats | SSR |
| `admin/ProductsPage` | GET n8n webhook → products | SSR |
| `admin/CustomersPage` | GET n8n webhook → customers | SSR |

### Client Components (interactive)

| Component | Purpose |
|---|---|
| `CartStore` (Zustand) | Cart state persisted to localStorage. Add / remove / clear items. |
| `CartDrawer` | Slide-in drawer showing cart contents, accessible from header icon |
| `CheckoutForm` | React Hook Form + Zod. On submit: POST to n8n Workflow 1. On success: redirect to `/order/[id]`. |
| `admin/LoginForm` | POST credentials to `/api/admin/login` (Next.js Route Handler) → sets JWT cookie |
| `admin/ConfirmOrderForm` | Final amount field + "Confirm & Invoice" button → POST to n8n Workflow 2 |
| `admin/ProductForm` | CRUD modal. POST/PATCH/DELETE to n8n webhooks. Invalidates SWR cache on success. |
| `admin/StatusSelect` | Dropdown to change order status → POST to n8n webhook |

### Order lifecycle flow

```
Cart → CheckoutForm → POST n8n Workflow 1
                              ↓
                    /order/[id] (status: new)
                              ↓
              Manager: ConfirmOrderForm → POST n8n Workflow 2
                              ↓
                    YooKassa payment link → Telegram to customer
                              ↓
              YooKassa webhook → n8n Workflow 3 → status: paid
                              ↓
              Sunday cron → n8n Workflow 4 → delivery list to courier
```

---

## 4. n8n Webhook API Contract

The following webhooks must exist in n8n (GET webhooks need to be created in addition to existing POST ones):

| Method | Path | Purpose |
|---|---|---|
| GET | `/webhook/products` | List all active products (optionally filtered by `?category=`) |
| GET | `/webhook/orders` | List orders (admin). Supports `?status=` filter |
| GET | `/webhook/orders/:id` | Single order with items |
| GET | `/webhook/customers` | Customer list (admin) |
| GET | `/webhook/stats` | Dashboard stats: revenue, order counts by status |
| POST | `/webhook/orders` | Create new order (Workflow 1) |
| POST | `/webhook/orders/:id/confirm` | Confirm order with final amount (Workflow 2) |
| POST | `/webhook/products` | Create product (admin) |
| PATCH | `/webhook/products/:id` | Update product (admin) |
| DELETE | `/webhook/products/:id` | Delete product (admin) |
| PATCH | `/webhook/orders/:id/status` | Update order status (admin) |

---

## 5. Authentication (Admin)

- `POST /api/admin/login` — Next.js Route Handler validates credentials against `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars, signs a JWT, sets as `httpOnly` cookie (`admin_session`, 24h expiry)
- `middleware.ts` — reads cookie, verifies JWT, redirects to `/admin/login` on failure
- Logout: DELETE `/api/admin/logout` clears the cookie

---

## 6. Key Dependencies

```json
{
  "zustand": "^4",
  "swr": "^2",
  "react-hook-form": "^7",
  "zod": "^3",
  "jose": "^5",
  "react-datepicker": "^6",
  "recharts": "^2"
}
```

---

## 7. Error Handling

| Scenario | Behavior |
|---|---|
| n8n webhook unavailable | Toast notification, form remains unblocked |
| Invalid form fields | Zod inline errors below each field |
| Order ID not found | 404 page with "Go home" button |
| Admin auth failure | Redirect to `/admin/login` |
| Product out of stock (`stock_qty = 0`) | Card shown with "Out of stock" badge, add-to-cart disabled |

---

## 8. Visual Design Tokens

| Token | Value |
|---|---|
| Primary green | `#2d5a1b` |
| Light green | `#7ab648` |
| Background cream | `#f5f0e8` |
| Card white | `#ffffff` |
| Admin sidebar | `#1a3a1a` |
| Warning/confirm | `#f0a500` |
| Error/new badge | `#e74c3c` |
| Font (public) | System serif stack or Lora (Google Fonts) |
| Font (admin) | System sans-serif |

---

## 9. Testing Plan

1. Full order cycle: catalog → cart → checkout → `/order/[id]`
2. Manager confirms order → check Telegram notification → payment link sent
3. Admin login / logout, middleware redirect for unauthenticated access
4. Product CRUD in admin panel
5. TypeScript + ESLint as static correctness checks
