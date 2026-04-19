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
