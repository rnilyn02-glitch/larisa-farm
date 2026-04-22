import { Suspense } from 'react'
import { api } from '@/lib/api'
import type { Product } from '@/lib/types'
import { ProductCard } from '@/components/catalog/ProductCard'
import { CategoryFilter } from '@/components/catalog/CategoryFilter'

interface CatalogPageProps {
  searchParams: { category?: string }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  let products: Product[] = []
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
