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
