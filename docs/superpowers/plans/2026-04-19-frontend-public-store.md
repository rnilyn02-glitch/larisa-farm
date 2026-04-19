# Frontend Plan 1: Foundation + Public Store

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the customer-facing part of the Larisa-I & Co farm web app — product catalog, shopping cart, checkout form, and order status page.

**Architecture:** Next.js 14 App Router with Server Components for data-fetching pages (ISR/SSR) and Client Components for interactivity. Cart state lives in Zustand persisted to localStorage. All data comes from n8n webhooks at `https://api.ramirezi1.online`. No customer authentication.

**Tech Stack:** Next.js 14 · TypeScript · Tailwind CSS · Zustand 4 · React Hook Form 7 · Zod 3 · react-datepicker · Vitest · @testing-library/react

---

## File Map

### New files
```
frontend/
  lib/
    types.ts                     — Shared TypeScript interfaces
    api.ts                       — n8n webhook fetch client
  store/
    cart.ts                      — Zustand cart + drawer state
  components/
    layout/
      Header.tsx                 — Top nav bar (Client Component)
      Footer.tsx                 — Bottom links
      CartDrawer.tsx             — Slide-in cart panel (Client Component)
    catalog/
      ProductCard.tsx            — Single product tile (Client Component)
      CategoryFilter.tsx         — Filter chips (Client Component)
    checkout/
      schema.ts                  — Zod validation schema
      CheckoutForm.tsx           — Order form (Client Component)
    ui/
      Toast.tsx                  — Error/success toast (Client Component)
  __tests__/
    store/cart.test.ts
    lib/schema.test.ts
  vitest.config.ts
  vitest.setup.ts
```

### Modified files
```
frontend/
  package.json                   — Add new deps + test scripts
  tailwind.config.ts             — Add farm color tokens + Lora font
  app/
    layout.tsx                   — Add Header, Footer, CartDrawer
    globals.css                  — Add Lora import, base cream background
    page.tsx                     — Landing page (hero + category grid)
    catalog/page.tsx             — Catalog with ISR (create)
    cart/page.tsx                — Cart page (create)
    checkout/page.tsx            — Checkout page wrapper (create)
    order/[id]/page.tsx          — Order status SSR page (create)
    about/page.tsx               — Static page (create)
    delivery/page.tsx            — Static page (create)
    contacts/page.tsx            — Static page (create)
```

---

## Task 1: Install dependencies, configure Tailwind, set up Vitest

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/tailwind.config.ts`
- Modify: `frontend/app/globals.css`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/vitest.setup.ts`

- [ ] **Step 1: Install production dependencies**

```bash
cd frontend
npm install zustand react-hook-form zod react-datepicker
npm install react-datepicker
```

- [ ] **Step 2: Install dev/test dependencies**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Add test scripts to package.json**

Open `frontend/package.json` and replace the `"scripts"` block:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
// frontend/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 5: Create vitest.setup.ts**

```typescript
// frontend/vitest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Update tailwind.config.ts with design tokens**

```typescript
// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          green: '#2d5a1b',
          'green-light': '#7ab648',
          cream: '#f5f0e8',
          amber: '#f0a500',
          error: '#e74c3c',
          card: '#ffffff',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 7: Update globals.css**

```css
/* frontend/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-farm-cream font-serif;
  }
}
```

- [ ] **Step 8: Verify Tailwind compiles**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 9: Commit**

```bash
cd ..
git add frontend/package.json frontend/package-lock.json frontend/tailwind.config.ts frontend/app/globals.css frontend/vitest.config.ts frontend/vitest.setup.ts
git commit -m "feat: add dependencies, Tailwind tokens, Vitest setup"
```

---

## Task 2: TypeScript types and API client

**Files:**
- Create: `frontend/lib/types.ts`
- Create: `frontend/lib/api.ts`

- [ ] **Step 1: Create lib/types.ts**

```typescript
// frontend/lib/types.ts
export interface Product {
  id: string
  name: string
  category: 'eggs' | 'meat' | 'veggies' | 'sets'
  price: number
  unit: string
  is_active: boolean
  stock_qty: number
  description?: string
  image_url?: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price_at_moment: number
  unit: string
}

export interface Order {
  id: string
  status: 'new' | 'confirmed' | 'paid' | 'delivered' | 'cancelled'
  total_amount: number | null
  payment_method: 'online' | 'cash'
  delivery_address: string
  delivery_date: string
  created_at: string
  customer_name: string
  customer_phone: string
  items: OrderItem[]
  payment_url?: string
}

export interface CreateOrderPayload {
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_date: string
  payment_method: 'online' | 'cash'
  comment?: string
  items: Array<{ product_id: string; quantity: number; price_at_moment: number }>
}
```

- [ ] **Step 2: Create lib/api.ts**

```typescript
// frontend/lib/api.ts
import type { Product, Order, CreateOrderPayload } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.ramirezi1.online'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/webhook${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  products: {
    list: (category?: string) =>
      request<Product[]>(
        `/products${category ? `?category=${encodeURIComponent(category)}` : ''}`,
        { next: { revalidate: 60 } } as RequestInit,
      ),
  },
  orders: {
    create: (payload: CreateOrderPayload) =>
      request<{ id: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    get: (id: string) =>
      request<Order>(`/orders/${encodeURIComponent(id)}`, { cache: 'no-store' } as RequestInit),
  },
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/types.ts frontend/lib/api.ts
git commit -m "feat: add TypeScript types and n8n API client"
```

---

## Task 3: Zustand cart store + tests

**Files:**
- Create: `frontend/store/cart.ts`
- Create: `frontend/__tests__/store/cart.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// frontend/__tests__/store/cart.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/lib/types'

const mockProduct: Product = {
  id: 'p1',
  name: 'Яйца домашние',
  category: 'eggs',
  price: 120,
  unit: 'шт',
  is_active: true,
  stock_qty: 50,
}

describe('cart store', () => {
  beforeEach(() => useCartStore.setState({ items: [], drawerOpen: false }))

  it('adds item to empty cart', () => {
    useCartStore.getState().add(mockProduct)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(1)
  })

  it('increments quantity when adding existing item', () => {
    useCartStore.getState().add(mockProduct)
    useCartStore.getState().add(mockProduct)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('removes item by id', () => {
    useCartStore.getState().add(mockProduct)
    useCartStore.getState().remove('p1')
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('updateQty removes item when qty reaches 0', () => {
    useCartStore.getState().add(mockProduct)
    useCartStore.getState().updateQty('p1', 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('calculates total correctly', () => {
    useCartStore.getState().add(mockProduct)
    useCartStore.getState().add(mockProduct)
    expect(useCartStore.getState().total()).toBe(240)
  })

  it('clears all items', () => {
    useCartStore.getState().add(mockProduct)
    useCartStore.getState().clear()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('count returns total quantity across items', () => {
    useCartStore.getState().add(mockProduct)
    useCartStore.getState().add(mockProduct)
    expect(useCartStore.getState().count()).toBe(2)
  })

  it('openDrawer and closeDrawer toggle drawerOpen', () => {
    useCartStore.getState().openDrawer()
    expect(useCartStore.getState().drawerOpen).toBe(true)
    useCartStore.getState().closeDrawer()
    expect(useCartStore.getState().drawerOpen).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd frontend && npm test
```

Expected: FAIL — `Cannot find module '@/store/cart'`

- [ ] **Step 3: Create store/cart.ts**

```typescript
// frontend/store/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/lib/types'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartStore {
  items: CartItem[]
  drawerOpen: boolean
  add: (product: Product) => void
  remove: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clear: () => void
  openDrawer: () => void
  closeDrawer: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,

      add: (product) =>
        set((s) => {
          const existing = s.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            }
          }
          return { items: [...s.items, { product, quantity: 1 }] }
        }),

      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) })),

      updateQty: (productId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.product.id !== productId)
              : s.items.map((i) =>
                  i.product.id === productId ? { ...i, quantity: qty } : i,
                ),
        })),

      clear: () => set({ items: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'larisa-cart', partialize: (s) => ({ items: s.items }) },
  ),
)
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: 8 passing tests in `cart.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add frontend/store/cart.ts frontend/__tests__/store/cart.test.ts
git commit -m "feat: Zustand cart store with drawer state"
```

---

## Task 4: Checkout validation schema + tests

**Files:**
- Create: `frontend/components/checkout/schema.ts`
- Create: `frontend/__tests__/lib/schema.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// frontend/__tests__/lib/schema.test.ts
import { describe, it, expect } from 'vitest'
import { checkoutSchema } from '@/components/checkout/schema'

const valid = {
  customer_name: 'Иван Иванов',
  customer_phone: '+79001234567',
  delivery_address: 'ул. Ленина 5, кв. 10',
  delivery_date: '2026-04-27',
  payment_method: 'online' as const,
}

describe('checkoutSchema', () => {
  it('accepts valid data', () => {
    expect(() => checkoutSchema.parse(valid)).not.toThrow()
  })

  it('rejects name shorter than 2 characters', () => {
    expect(checkoutSchema.safeParse({ ...valid, customer_name: 'И' }).success).toBe(false)
  })

  it('rejects phone without +7 prefix', () => {
    expect(checkoutSchema.safeParse({ ...valid, customer_phone: '89001234567' }).success).toBe(false)
  })

  it('rejects phone with wrong digit count', () => {
    expect(checkoutSchema.safeParse({ ...valid, customer_phone: '+7900123456' }).success).toBe(false)
  })

  it('rejects address shorter than 5 characters', () => {
    expect(checkoutSchema.safeParse({ ...valid, delivery_address: 'ул' }).success).toBe(false)
  })

  it('rejects empty delivery_date', () => {
    expect(checkoutSchema.safeParse({ ...valid, delivery_date: '' }).success).toBe(false)
  })

  it('rejects invalid payment_method', () => {
    expect(checkoutSchema.safeParse({ ...valid, payment_method: 'card' as 'online' }).success).toBe(false)
  })

  it('allows optional comment to be omitted', () => {
    const { comment: _c, ...noComment } = { ...valid, comment: undefined }
    expect(() => checkoutSchema.parse(noComment)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd frontend && npm test
```

Expected: FAIL — `Cannot find module '@/components/checkout/schema'`

- [ ] **Step 3: Create components/checkout/schema.ts**

```typescript
// frontend/components/checkout/schema.ts
import { z } from 'zod'

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Введите имя (минимум 2 символа)'),
  customer_phone: z
    .string()
    .regex(/^\+7\d{10}$/, 'Формат номера: +79001234567'),
  delivery_address: z.string().min(5, 'Введите адрес доставки'),
  delivery_date: z.string().min(1, 'Выберите дату доставки'),
  payment_method: z.enum(['online', 'cash']),
  comment: z.string().optional(),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: 8 passing in `schema.test.ts` + 8 passing in `cart.test.ts` = 16 total.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/checkout/schema.ts frontend/__tests__/lib/schema.test.ts
git commit -m "feat: checkout Zod validation schema"
```

---

## Task 5: Root layout — Header, Footer, CartDrawer

**Files:**
- Create: `frontend/components/layout/Header.tsx`
- Create: `frontend/components/layout/Footer.tsx`
- Create: `frontend/components/layout/CartDrawer.tsx`
- Create: `frontend/components/ui/Toast.tsx`
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: Create components/ui/Toast.tsx**

```tsx
// frontend/components/ui/Toast.tsx
'use client'
import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'error' | 'success'
  onClose: () => void
}

export function Toast({ message, type = 'error', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-lg px-4 py-3 text-white text-sm shadow-lg ${
        type === 'error' ? 'bg-farm-error' : 'bg-farm-green'
      }`}
    >
      {message}
    </div>
  )
}
```

- [ ] **Step 2: Create components/layout/CartDrawer.tsx**

```tsx
// frontend/components/layout/CartDrawer.tsx
'use client'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'

export function CartDrawer() {
  const { items, drawerOpen, closeDrawer, remove, updateQty, total, count } = useCartStore()

  if (!drawerOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={closeDrawer} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-farm-green">Корзина</h2>
          <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Корзина пуста
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.price} ₽ / {product.unit}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(product.id, quantity - 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 text-sm flex items-center justify-center"
                    >−</button>
                    <span className="w-6 text-center text-sm">{quantity}</span>
                    <button
                      onClick={() => updateQty(product.id, quantity + 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 text-sm flex items-center justify-center"
                    >+</button>
                  </div>
                  <button
                    onClick={() => remove(product.id)}
                    className="text-gray-300 hover:text-farm-error text-lg leading-none"
                  >&times;</button>
                </li>
              ))}
            </ul>

            <div className="p-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-between font-semibold">
                <span>Итого ({count()} шт)</span>
                <span className="text-farm-green">{total().toLocaleString('ru-RU')} ₽</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="block w-full bg-farm-green text-white text-center py-3 rounded-lg font-semibold hover:bg-farm-green-light transition-colors"
              >
                Оформить заказ
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 3: Create components/layout/Header.tsx**

```tsx
// frontend/components/layout/Header.tsx
'use client'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'

export function Header() {
  const { count, openDrawer } = useCartStore()
  const cartCount = count()

  return (
    <header className="bg-farm-green text-white sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-serif font-bold text-lg tracking-wide">
          🌿 Larisa Farm
        </Link>

        <nav className="hidden sm:flex items-center gap-5 text-sm">
          <Link href="/catalog" className="hover:text-farm-cream transition-colors">Каталог</Link>
          <Link href="/about" className="hover:text-farm-cream transition-colors">О ферме</Link>
          <Link href="/delivery" className="hover:text-farm-cream transition-colors">Доставка</Link>
          <Link href="/contacts" className="hover:text-farm-cream transition-colors">Контакты</Link>
        </nav>

        <button
          onClick={openDrawer}
          className="relative flex items-center gap-1 text-sm hover:text-farm-cream transition-colors"
          aria-label="Корзина"
        >
          <span className="text-xl">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-farm-error text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Create components/layout/Footer.tsx**

```tsx
// frontend/components/layout/Footer.tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-farm-green text-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-bold text-base mb-2">🌿 Larisa Farm</p>
            <p className="text-white/70">Фермерское хозяйство "Larisa-I & Co"</p>
            <p className="text-white/70">г. Стрежевой</p>
          </div>
          <div>
            <p className="font-semibold mb-2">Навигация</p>
            <ul className="space-y-1 text-white/70">
              <li><Link href="/catalog" className="hover:text-white">Каталог</Link></li>
              <li><Link href="/delivery" className="hover:text-white">Доставка и оплата</Link></li>
              <li><Link href="/about" className="hover:text-white">О ферме</Link></li>
              <li><Link href="/contacts" className="hover:text-white">Контакты</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Контакты</p>
            <p className="text-white/70">Телефон: уточняйте при заказе</p>
            <p className="text-white/70 mt-1">Доставка по воскресеньям</p>
          </div>
        </div>
        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} Larisa-I & Co
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Update app/layout.tsx**

```tsx
// frontend/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'

export const metadata: Metadata = {
  title: 'Larisa Farm — Фермерские продукты',
  description: 'Свежие фермерские продукты с доставкой по Стрежевому',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="flex flex-col min-h-screen bg-farm-cream font-serif">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Run dev server and verify layout renders**

```bash
cd frontend && npm run dev
```

Open http://localhost:3000. Expected: green header with logo and cart icon, cream background, green footer.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/ frontend/app/layout.tsx
git commit -m "feat: root layout with Header, Footer, CartDrawer"
```

---

## Task 6: Landing page

**Files:**
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Rewrite app/page.tsx**

```tsx
// frontend/app/page.tsx
import Link from 'next/link'

const CATEGORIES = [
  { slug: 'eggs',   label: 'Яйца',   emoji: '🥚' },
  { slug: 'meat',   label: 'Мясо',   emoji: '🍗' },
  { slug: 'veggies',label: 'Овощи',  emoji: '🥕' },
  { slug: 'sets',   label: 'Наборы', emoji: '🎁' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-farm-green to-farm-green-light text-white px-4 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Свежие продукты с фермы
        </h1>
        <p className="text-white/80 mb-8 text-lg">
          Доставка по Стрежевому каждое воскресенье
        </p>
        <Link
          href="/catalog"
          className="inline-block bg-white text-farm-green font-semibold px-8 py-3 rounded-full hover:bg-farm-cream transition-colors"
        >
          Смотреть каталог →
        </Link>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold text-farm-green mb-6 text-center">Категории</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalog?category=${cat.slug}`}
              className="bg-white rounded-2xl p-6 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-4xl">{cat.emoji}</span>
              <span className="text-farm-green font-medium">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-white py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl mb-2">🌱</div>
            <h3 className="font-semibold text-farm-green mb-1">Натуральные продукты</h3>
            <p className="text-gray-500 text-sm">Без антибиотиков и ГМО. Всё с нашей фермы.</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🚚</div>
            <h3 className="font-semibold text-farm-green mb-1">Доставка на дом</h3>
            <p className="text-gray-500 text-sm">Каждое воскресенье по всему Стрежевому.</p>
          </div>
          <div>
            <div className="text-3xl mb-2">💳</div>
            <h3 className="font-semibold text-farm-green mb-1">Удобная оплата</h3>
            <p className="text-gray-500 text-sm">Онлайн через YooKassa или наличными.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Visit http://localhost:3000. Expected: hero gradient banner, 4 category tiles, 3 feature cards.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "feat: landing page with hero and category grid"
```

---

## Task 7: Catalog page + ProductCard + CategoryFilter

**Files:**
- Create: `frontend/app/catalog/page.tsx`
- Create: `frontend/components/catalog/ProductCard.tsx`
- Create: `frontend/components/catalog/CategoryFilter.tsx`

- [ ] **Step 1: Create components/catalog/ProductCard.tsx**

```tsx
// frontend/components/catalog/ProductCard.tsx
'use client'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { add, openDrawer } = useCartStore()

  const handleAdd = () => {
    add(product)
    openDrawer()
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="h-36 bg-gradient-to-br from-farm-green-light to-farm-green flex items-center justify-center text-white text-4xl">
        {product.category === 'eggs' && '🥚'}
        {product.category === 'meat' && '🍗'}
        {product.category === 'veggies' && '🥕'}
        {product.category === 'sets' && '🎁'}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-gray-500 text-sm mb-2 flex-1">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-bold text-farm-green text-lg">
            {product.price.toLocaleString('ru-RU')} ₽
            <span className="text-xs text-gray-400 font-normal ml-1">/ {product.unit}</span>
          </span>
          {product.stock_qty === 0 ? (
            <span className="text-xs text-farm-error border border-farm-error rounded-full px-3 py-1">
              Нет в наличии
            </span>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-farm-green text-white text-sm px-4 py-1.5 rounded-full hover:bg-farm-green-light transition-colors"
            >
              В корзину
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create components/catalog/CategoryFilter.tsx**

```tsx
// frontend/components/catalog/CategoryFilter.tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = [
  { slug: '',         label: 'Все' },
  { slug: 'eggs',     label: 'Яйца' },
  { slug: 'meat',     label: 'Мясо' },
  { slug: 'veggies',  label: 'Овощи' },
  { slug: 'sets',     label: 'Наборы' },
]

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('category') ?? ''

  const select = (slug: string) => {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    router.push(`/catalog${slug ? `?${params}` : ''}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => select(cat.slug)}
          className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
            active === cat.slug
              ? 'bg-farm-green text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-farm-green'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create app/catalog/page.tsx**

```tsx
// frontend/app/catalog/page.tsx
import { Suspense } from 'react'
import { api } from '@/lib/api'
import { ProductCard } from '@/components/catalog/ProductCard'
import { CategoryFilter } from '@/components/catalog/CategoryFilter'

interface CatalogPageProps {
  searchParams: { category?: string }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  let products = []
  let error = false

  try {
    products = await api.products.list(searchParams.category)
  } catch {
    error = true
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-farm-green mb-6">Каталог</h1>

      <Suspense>
        <CategoryFilter />
      </Suspense>

      {error && (
        <p className="text-farm-error mt-6 text-center">
          Не удалось загрузить товары. Попробуйте позже.
        </p>
      )}

      {!error && products.length === 0 && (
        <p className="text-gray-400 mt-6 text-center">Товары в этой категории не найдены.</p>
      )}

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Visit http://localhost:3000/catalog. Expected: filter chips at top, product grid below (or "Товары не найдены" if n8n webhooks not yet created).

- [ ] **Step 5: Commit**

```bash
git add frontend/app/catalog/ frontend/components/catalog/
git commit -m "feat: catalog page with ProductCard and category filter"
```

---

## Task 8: Cart page

**Files:**
- Create: `frontend/app/cart/page.tsx`

- [ ] **Step 1: Create app/cart/page.tsx**

```tsx
// frontend/app/cart/page.tsx
'use client'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'

export default function CartPage() {
  const { items, remove, updateQty, total, count, clear } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h1 className="text-xl font-semibold text-gray-700 mb-4">Корзина пуста</h1>
        <Link
          href="/catalog"
          className="inline-block bg-farm-green text-white px-6 py-2.5 rounded-full hover:bg-farm-green-light transition-colors"
        >
          Перейти в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-farm-green">Корзина</h1>
        <button onClick={clear} className="text-sm text-gray-400 hover:text-farm-error transition-colors">
          Очистить
        </button>
      </div>

      <ul className="space-y-3 mb-8">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="flex-1">
              <p className="font-medium text-gray-800">{product.name}</p>
              <p className="text-sm text-gray-500">{product.price} ₽ / {product.unit}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(product.id, quantity - 1)}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-farm-green"
              >−</button>
              <span className="w-6 text-center font-medium">{quantity}</span>
              <button
                onClick={() => updateQty(product.id, quantity + 1)}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-farm-green"
              >+</button>
            </div>

            <span className="w-20 text-right font-semibold text-farm-green">
              {(product.price * quantity).toLocaleString('ru-RU')} ₽
            </span>

            <button onClick={() => remove(product.id)} className="text-gray-300 hover:text-farm-error text-xl">
              &times;
            </button>
          </li>
        ))}
      </ul>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex justify-between text-lg font-semibold mb-4">
          <span>Итого ({count()} шт)</span>
          <span className="text-farm-green">{total().toLocaleString('ru-RU')} ₽</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          * Окончательная сумма может быть скорректирована менеджером (по весу/наличию).
        </p>
        <Link
          href="/checkout"
          className="block w-full bg-farm-green text-white text-center py-3 rounded-lg font-semibold hover:bg-farm-green-light transition-colors"
        >
          Оформить заказ
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Add a product via http://localhost:3000/catalog, then visit http://localhost:3000/cart. Expected: item list with quantity controls and total.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/cart/page.tsx
git commit -m "feat: cart page"
```

---

## Task 9: Checkout page and CheckoutForm

**Files:**
- Create: `frontend/components/checkout/CheckoutForm.tsx`
- Create: `frontend/app/checkout/page.tsx`

- [ ] **Step 1: Create components/checkout/CheckoutForm.tsx**

```tsx
// frontend/components/checkout/CheckoutForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ru } from 'date-fns/locale'
import { checkoutSchema, type CheckoutFormData } from './schema'
import { api } from '@/lib/api'
import { useCartStore } from '@/store/cart'
import { Toast } from '@/components/ui/Toast'

export function CheckoutForm() {
  const router = useRouter()
  const { items, total, clear } = useCartStore()
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { payment_method: 'online' },
  })

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      setToastMsg('Добавьте товары в корзину')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          price_at_moment: i.product.price,
        })),
      }
      const { id } = await api.orders.create(payload)
      clear()
      router.push(`/order/${id}`)
    } catch {
      setToastMsg('Не удалось оформить заказ. Попробуйте ещё раз.')
      setSubmitting(false)
    }
  }

  return (
    <>
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Personal data */}
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-farm-green">Ваши данные</h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Имя *</label>
            <input
              {...register('customer_name')}
              placeholder="Иван Иванов"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-farm-green"
            />
            {errors.customer_name && (
              <p className="text-farm-error text-xs mt-1">{errors.customer_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Телефон *</label>
            <input
              {...register('customer_phone')}
              placeholder="+79001234567"
              type="tel"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-farm-green"
            />
            {errors.customer_phone && (
              <p className="text-farm-error text-xs mt-1">{errors.customer_phone.message}</p>
            )}
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-farm-green">Доставка</h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Адрес *</label>
            <input
              {...register('delivery_address')}
              placeholder="ул. Ленина 5, кв. 10"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-farm-green"
            />
            {errors.delivery_address && (
              <p className="text-farm-error text-xs mt-1">{errors.delivery_address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Дата доставки *</label>
            <Controller
              control={control}
              name="delivery_date"
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date?.toISOString().split('T')[0] ?? '')}
                  dateFormat="dd.MM.yyyy"
                  minDate={new Date()}
                  locale={ru}
                  placeholderText="Выберите дату"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-farm-green"
                />
              )}
            />
            {errors.delivery_date && (
              <p className="text-farm-error text-xs mt-1">{errors.delivery_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Комментарий</label>
            <textarea
              {...register('comment')}
              rows={2}
              placeholder="Уточнения по заказу или адресу"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-farm-green resize-none"
            />
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-farm-green">Оплата</h2>
          <div className="flex gap-3">
            {(['online', 'cash'] as const).map((method) => (
              <label key={method} className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('payment_method')}
                  type="radio"
                  value={method}
                  className="accent-farm-green"
                />
                <span className="text-sm text-gray-700">
                  {method === 'online' ? '💳 Онлайн' : '💵 Наличными'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-farm-green/5 rounded-xl p-4 border border-farm-green/20">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Товаров: {items.reduce((s, i) => s + i.quantity, 0)} шт</span>
            <span className="font-semibold text-farm-green">{total().toLocaleString('ru-RU')} ₽*</span>
          </div>
          <p className="text-xs text-gray-400">* Сумма предварительная. Менеджер уточнит итоговую.</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-farm-green text-white py-3 rounded-lg font-semibold hover:bg-farm-green-light transition-colors disabled:opacity-60"
        >
          {submitting ? 'Отправляем...' : 'Оформить заказ'}
        </button>
      </form>
    </>
  )
}
```

- [ ] **Step 2: Install @hookform/resolvers and date-fns**

```bash
cd frontend && npm install @hookform/resolvers date-fns
```

- [ ] **Step 3: Create app/checkout/page.tsx**

```tsx
// frontend/app/checkout/page.tsx
import { CheckoutForm } from '@/components/checkout/CheckoutForm'

export default function CheckoutPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-farm-green mb-6">Оформление заказа</h1>
      <CheckoutForm />
    </div>
  )
}
```

- [ ] **Step 4: Verify form in browser**

Visit http://localhost:3000/checkout. Expected: form with name/phone/address fields, date picker, payment radio buttons, submit button. Fill invalid phone — see error message.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/checkout/CheckoutForm.tsx frontend/app/checkout/ frontend/package.json frontend/package-lock.json
git commit -m "feat: checkout form with Zod validation and date picker"
```

---

## Task 10: Order status page

**Files:**
- Create: `frontend/app/order/[id]/page.tsx`

- [ ] **Step 1: Create app/order/[id]/page.tsx**

```tsx
// frontend/app/order/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  new:        { label: 'Принят',           color: 'bg-blue-100 text-blue-700',   emoji: '📬' },
  confirmed:  { label: 'Подтверждён',      color: 'bg-amber-100 text-amber-700', emoji: '✅' },
  paid:       { label: 'Оплачен',          color: 'bg-green-100 text-green-700', emoji: '💳' },
  delivered:  { label: 'Доставлен',        color: 'bg-purple-100 text-purple-700',emoji: '🚚' },
  cancelled:  { label: 'Отменён',          color: 'bg-red-100 text-red-700',     emoji: '❌' },
}

interface OrderPageProps {
  params: { id: string }
}

export default async function OrderPage({ params }: OrderPageProps) {
  let order

  try {
    order = await api.orders.get(params.id)
  } catch {
    notFound()
  }

  const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.new

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-farm-green mb-6">Заказ</h1>

      {/* Status card */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{statusInfo.emoji}</span>
          <div>
            <p className="text-sm text-gray-500">Статус</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {order.status === 'new' && (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            Ваш заказ принят. Менеджер свяжется с вами в ближайшее время для подтверждения.
          </p>
        )}

        {order.status === 'confirmed' && order.payment_url && (
          <div className="bg-farm-amber/10 border border-farm-amber/30 rounded-lg p-3 mt-2">
            <p className="text-sm text-gray-700 mb-2">Заказ подтверждён. Оплатите для оформления доставки:</p>
            <a
              href={order.payment_url}
              className="block w-full bg-farm-amber text-white text-center py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Оплатить {order.total_amount?.toLocaleString('ru-RU')} ₽
            </a>
          </div>
        )}

        {order.status === 'confirmed' && !order.payment_url && order.payment_method === 'cash' && (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mt-2">
            Заказ подтверждён. Оплата наличными при получении.
            {order.total_amount && ` Итоговая сумма: ${order.total_amount.toLocaleString('ru-RU')} ₽`}
          </p>
        )}
      </div>

      {/* Order details */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <h2 className="font-semibold text-farm-green mb-3">Детали</h2>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Дата доставки</dt>
            <dd className="font-medium">{new Date(order.delivery_date).toLocaleDateString('ru-RU')}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Адрес</dt>
            <dd className="font-medium text-right max-w-[60%]">{order.delivery_address}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Оплата</dt>
            <dd className="font-medium">{order.payment_method === 'online' ? 'Онлайн' : 'Наличные'}</dd>
          </div>
        </dl>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <h2 className="font-semibold text-farm-green mb-3">Состав заказа</h2>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.product_id} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.product_name} × {item.quantity} {item.unit}</span>
              <span className="font-medium">{(item.price_at_moment * item.quantity).toLocaleString('ru-RU')} ₽</span>
            </li>
          ))}
        </ul>
        {order.total_amount && (
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-semibold">
            <span>Итого</span>
            <span className="text-farm-green">{order.total_amount.toLocaleString('ru-RU')} ₽</span>
          </div>
        )}
      </div>

      <Link href="/" className="block text-center text-farm-green text-sm hover:underline">
        ← На главную
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Verify 404 behavior**

Visit http://localhost:3000/order/nonexistent. Expected: Next.js 404 page.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/order/
git commit -m "feat: order status page with payment link support"
```

---

## Task 11: Static info pages

**Files:**
- Create: `frontend/app/about/page.tsx`
- Create: `frontend/app/delivery/page.tsx`
- Create: `frontend/app/contacts/page.tsx`

- [ ] **Step 1: Create app/about/page.tsx**

```tsx
// frontend/app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-farm-green mb-6">О ферме</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 text-gray-700 leading-relaxed">
        <p>
          Фермерское хозяйство <strong>"Larisa-I & Co"</strong> — небольшая семейная ферма в Стрежевом.
          Мы выращиваем кур, разводим огород и производим натуральные продукты без использования
          антибиотиков и ГМО.
        </p>
        <p>
          Все продукты — собственного производства. Яйца, мясо птицы, свежие овощи и готовые наборы
          доставляются напрямую от фермы к вашему столу.
        </p>
        <p>
          Доставка осуществляется еженедельно по воскресеньям по всему Стрежевому.
          Заказы принимаются в течение недели.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create app/delivery/page.tsx**

```tsx
// frontend/app/delivery/page.tsx
export default function DeliveryPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-farm-green mb-6">Доставка и оплата</h1>
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-farm-green mb-3">🚚 Доставка</h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Доставка осуществляется каждое воскресенье</li>
            <li>• Зона доставки — г. Стрежевой</li>
            <li>• Вы выбираете удобную дату при оформлении заказа</li>
            <li>• После подтверждения менеджер сообщит точное время доставки</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-farm-green mb-3">💳 Оплата</h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <strong>Онлайн</strong> — через YooKassa (карта, СБП). Ссылка придёт в Telegram после подтверждения заказа менеджером.</li>
            <li>• <strong>Наличными</strong> — при получении курьеру.</li>
            <li>• Итоговая сумма может быть скорректирована менеджером по фактическому весу.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create app/contacts/page.tsx**

```tsx
// frontend/app/contacts/page.tsx
export default function ContactsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-farm-green mb-6">Контакты</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 text-gray-700">
        <div>
          <p className="text-sm text-gray-500 mb-1">Организация</p>
          <p className="font-medium">Фермерское хозяйство "Larisa-I & Co"</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Местонахождение</p>
          <p className="font-medium">г. Стрежевой, Томская область</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Телефон для справок</p>
          <p className="font-medium">Уточняйте при оформлении заказа</p>
        </div>
        <div className="bg-farm-green/5 rounded-lg p-4 text-sm">
          По всем вопросам вы можете написать в Telegram — менеджер свяжется с вами
          после оформления заказа.
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify all static pages in browser**

Visit http://localhost:3000/about, /delivery, /contacts. Expected: each page renders with correct content and layout.

- [ ] **Step 5: Run all tests**

```bash
cd frontend && npm test
```

Expected: 16 tests passing (8 cart + 8 schema).

- [ ] **Step 6: Run build to verify no TypeScript errors**

```bash
npm run build
```

Expected: build succeeds. Note any warnings.

- [ ] **Step 7: Final commit**

```bash
git add frontend/app/about/ frontend/app/delivery/ frontend/app/contacts/
git commit -m "feat: static info pages — about, delivery, contacts"
```

---

## End-to-End Smoke Test

After completing all tasks, manually verify the full customer flow:

1. Visit http://localhost:3000 — landing page loads with hero and categories
2. Click a category → catalog page with product cards
3. Click "В корзину" on a product → CartDrawer slides in
4. Visit /cart — item visible with quantity controls
5. Click "Оформить заказ" → /checkout form loads
6. Submit form with invalid phone → error message appears inline
7. Fill valid data and submit (requires n8n webhook `/webhook/orders` to be live) → redirects to /order/[id]
8. Visit /about, /delivery, /contacts — all render correctly

---

## Notes for Plan 2 (Admin Panel)

Plan 2 will cover:
- `middleware.ts` + JWT auth via `jose`
- `/admin/login` page + `/api/admin/login` route handler
- Admin layout with dark sidebar
- Dashboard with recharts revenue chart
- Orders list + order detail with confirm form (n8n Workflow 2)
- Products CRUD
- Customers list
