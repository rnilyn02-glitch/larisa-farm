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
