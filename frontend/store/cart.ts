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
