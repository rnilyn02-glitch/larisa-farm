'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/types'
import { adminApi } from '@/lib/admin-api'

const productSchema = z.object({
  name:        z.string().min(2, 'Введите название'),
  category:    z.enum(['eggs', 'meat', 'veggies', 'sets']),
  price:       z.coerce.number().positive('Цена должна быть положительной'),
  unit:        z.string().min(1, 'Введите единицу'),
  is_active:   z.boolean(),
  stock_qty:   z.coerce.number().int().min(0, 'Не может быть отрицательным'),
  description: z.string().optional(),
})
type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name:        product.name,
          category:    product.category,
          price:       product.price,
          unit:        product.unit,
          is_active:   product.is_active,
          stock_qty:   product.stock_qty,
          description: product.description ?? '',
        }
      : { category: 'eggs', is_active: true, stock_qty: 0 },
  })

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true)
    setError(null)
    try {
      if (product) {
        await adminApi.products.update(product.id, data)
      } else {
        await adminApi.products.create(data)
      }
      setOpen(false)
      reset()
      router.refresh()
    } catch {
      setError('Не удалось сохранить товар.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
          product
            ? 'text-gray-500 hover:text-[#2d5a1b] border border-gray-200 hover:border-[#2d5a1b]'
            : 'bg-[#2d5a1b] text-white hover:bg-[#7ab648]'
        }`}
      >
        {product ? 'Изменить' : '+ Добавить товар'}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {product ? 'Редактировать товар' : 'Добавить товар'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Название</label>
                <input
                  {...register('name')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d5a1b]"
                />
                {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Категория</label>
                  <select
                    {...register('category')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d5a1b]"
                  >
                    <option value="eggs">Яйца</option>
                    <option value="meat">Мясо</option>
                    <option value="veggies">Овощи</option>
                    <option value="sets">Наборы</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Единица (шт, кг…)</label>
                  <input
                    {...register('unit')}
                    placeholder="шт"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d5a1b]"
                  />
                  {errors.unit && <p className="text-red-500 text-xs mt-0.5">{errors.unit.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Цена (₽)</label>
                  <input
                    {...register('price')}
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d5a1b]"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-0.5">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Остаток</label>
                  <input
                    {...register('stock_qty')}
                    type="number"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d5a1b]"
                  />
                  {errors.stock_qty && <p className="text-red-500 text-xs mt-0.5">{errors.stock_qty.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Описание</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d5a1b] resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  {...register('is_active')}
                  type="checkbox"
                  id="is_active"
                  className="accent-[#2d5a1b]"
                />
                <label htmlFor="is_active" className="text-sm text-gray-600">
                  Активен (показывать в каталоге)
                </label>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#2d5a1b] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#7ab648] disabled:opacity-60"
                >
                  {submitting ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  )
}
