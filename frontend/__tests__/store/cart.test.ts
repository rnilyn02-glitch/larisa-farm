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
  beforeEach(() => {
    localStorage.clear()
    useCartStore.setState({ items: [], drawerOpen: false })
  })

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
