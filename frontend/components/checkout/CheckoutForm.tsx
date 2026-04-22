// frontend/components/checkout/CheckoutForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ru } from 'date-fns/locale'
import { checkoutSchema, type CheckoutFormData } from './schema'
import { api } from '@/lib/api'
import { useCartStore } from '@/store/cart'
import { Toast } from '@/components/ui/Toast'

export function CheckoutForm() {
  const router = useRouter()
  const { items, total, clear } = useCartStore()
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { payment_method: 'online' },
  })

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      setToastMsg('Добавьте товары в корзину')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          price_at_moment: i.product.price,
        })),
      }
      const { id } = await api.orders.create(payload)
      clear()
      router.push(`/order/${id}`)
    } catch {
      setToastMsg('Не удалось оформить заказ. Попробуйте ещё раз.')
      setSubmitting(false)
    }
  }

  return (
    <>
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Personal data */}
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-farm-green">Ваши данные</h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Имя *</label>
            <input
              {...register('customer_name')}
              placeholder="Иван Иванов"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-farm-green"
            />
            {errors.customer_name && (
              <p className="text-farm-error text-xs mt-1">{errors.customer_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Телефон *</label>
            <input
              {...register('customer_phone')}
              placeholder="+79001234567"
              type="tel"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-farm-green"
            />
            {errors.customer_phone && (
              <p className="text-farm-error text-xs mt-1">{errors.customer_phone.message}</p>
            )}
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-farm-green">Доставка</h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Адрес *</label>
            <input
              {...register('delivery_address')}
              placeholder="ул. Ленина 5, кв. 10"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-farm-green"
            />
            {errors.delivery_address && (
              <p className="text-farm-error text-xs mt-1">{errors.delivery_address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Дата доставки *</label>
            <Controller
              control={control}
              name="delivery_date"
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date: Date | null) => field.onChange(date?.toISOString().split('T')[0] ?? '')}
                  dateFormat="dd.MM.yyyy"
                  minDate={new Date()}
                  locale={ru}
                  placeholderText="Выберите дату"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-farm-green"
                />
              )}
            />
            {errors.delivery_date && (
              <p className="text-farm-error text-xs mt-1">{errors.delivery_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Комментарий</label>
            <textarea
              {...register('comment')}
              rows={2}
              placeholder="Уточнения по заказу или адресу"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-farm-green resize-none"
            />
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-farm-green">Оплата</h2>
          <div className="flex gap-3">
            {(['online', 'cash'] as const).map((method) => (
              <label key={method} className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('payment_method')}
                  type="radio"
                  value={method}
                  className="accent-farm-green"
                />
                <span className="text-sm text-gray-700">
                  {method === 'online' ? '💳 Онлайн' : '💵 Наличными'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-farm-green/5 rounded-xl p-4 border border-farm-green/20">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Товаров: {items.reduce((s, i) => s + i.quantity, 0)} шт</span>
            <span className="font-semibold text-farm-green">{total().toLocaleString('ru-RU')} ₽*</span>
          </div>
          <p className="text-xs text-gray-400">* Сумма предварительная. Менеджер уточнит итоговую.</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-farm-green text-white py-3 rounded-lg font-semibold hover:bg-farm-green-light transition-colors disabled:opacity-60"
        >
          {submitting ? 'Отправляем...' : 'Оформить заказ'}
        </button>
      </form>
    </>
  )
}
