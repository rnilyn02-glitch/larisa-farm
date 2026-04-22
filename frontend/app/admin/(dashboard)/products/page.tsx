import { adminApi } from '@/lib/admin-api'
import { ProductForm } from '@/components/admin/ProductForm'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof adminApi.products.list>> = []
  let error = false
  try {
    products = await adminApi.products.list()
  } catch {
    error = true
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Товары</h1>
        <ProductForm />
      </div>

      {error && <p className="text-red-500 mb-4">Не удалось загрузить товары.</p>}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Название</th>
              <th className="text-left px-4 py-3 font-medium">Категория</th>
              <th className="text-right px-4 py-3 font-medium">Цена</th>
              <th className="text-right px-4 py-3 font-medium">Остаток</th>
              <th className="text-center px-4 py-3 font-medium">Активен</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                <td className="px-4 py-3 text-gray-500">{product.category}</td>
                <td className="px-4 py-3 text-right">{product.price} ₽ / {product.unit}</td>
                <td className="px-4 py-3 text-right">{product.stock_qty}</td>
                <td className="px-4 py-3 text-center">{product.is_active ? '✅' : '❌'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <ProductForm product={product} />
                    <DeleteProductButton productId={product.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!error && products.length === 0 && (
          <p className="text-center text-gray-400 py-8">Нет товаров</p>
        )}
      </div>
    </div>
  )
}
