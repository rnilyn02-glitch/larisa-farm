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
