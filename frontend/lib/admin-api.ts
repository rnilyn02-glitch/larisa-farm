import type { Product, Order } from './types'
import type { AdminStats, Customer, ConfirmOrderPayload } from './admin-types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.ramirezi1.online'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/webhook${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export interface ProductFormData {
  name: string
  category: 'eggs' | 'meat' | 'veggies' | 'sets'
  price: number
  unit: string
  is_active: boolean
  stock_qty: number
  description?: string
}

export const adminApi = {
  stats: {
    get: () => request<AdminStats>('/stats'),
  },
  orders: {
    list: (status?: string) =>
      request<Order[]>(`/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`),
    get: (id: string) =>
      request<Order>(`/orders/${encodeURIComponent(id)}`),
    confirm: (id: string, payload: ConfirmOrderPayload) =>
      request<{ ok: boolean }>(`/orders/${encodeURIComponent(id)}/confirm`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    updateStatus: (id: string, status: Order['status']) =>
      request<{ ok: boolean }>(`/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
  products: {
    list: () => request<Product[]>('/products'),
    create: (payload: ProductFormData) =>
      request<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<ProductFormData>) =>
      request<Product>(`/products/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
  },
  customers: {
    list: () => request<Customer[]>('/customers'),
  },
}
