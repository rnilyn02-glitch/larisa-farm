'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/admin-api'

const confirmSchema = z.object({
  final_amount: z.coerce.number().positive('Введите корректную сумму'),
})
type ConfirmFormData = z.infer<typeof confirmSchema>

interface ConfirmOrderFormProps {
  orderId: string
}

export function ConfirmOrderForm({ orderId }: ConfirmOrderFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmSchema),
  })

  const onSubmit = async (data: ConfirmFormData) => {
    setSubmitting(true)
    setError(null)
    try {
      await adminApi.orders.confirm(orderId, { final_amount: data.final_amount })
      router.refresh()
    } catch {
      setError('Не удалось подтвердить заказ. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <h3 className="font-semibold text-gray-700">Подтверждение заказа</h3>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Итоговая сумма (₽) *</label>
        <input
          {...register('final_amount')}
          type="number"
          step="0.01"
          placeholder="0.00"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d5a1b]"
        />
        {errors.final_amount && (
          <p className="text-red-500 text-xs mt-1">{errors.final_amount.message}</p>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#f0a500] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {submitting ? 'Отправка...' : 'Подтвердить и выставить счёт'}
      </button>
    </form>
  )
}
