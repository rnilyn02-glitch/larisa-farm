'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Order } from '@/lib/types'
import { adminApi } from '@/lib/admin-api'

const STATUS_OPTIONS: Array<{ value: Order['status']; label: string }> = [
  { value: 'new',       label: 'Новый' },
  { value: 'confirmed', label: 'Подтверждён' },
  { value: 'paid',      label: 'Оплачен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
]

interface StatusSelectProps {
  orderId: string
  currentStatus: Order['status']
}

export function StatusSelect({ orderId, currentStatus }: StatusSelectProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as Order['status']
    setSaving(true)
    try {
      await adminApi.orders.updateStatus(orderId, status)
      router.refresh()
    } catch {
      alert('Не удалось обновить статус')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={saving}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#2d5a1b] disabled:opacity-60"
      >
        {STATUS_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {saving && <span className="text-sm text-gray-400">Сохранение...</span>}
    </div>
  )
}
