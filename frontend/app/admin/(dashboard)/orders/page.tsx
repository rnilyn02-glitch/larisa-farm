import Link from 'next/link'
import { adminApi } from '@/lib/admin-api'

const STATUSES = ['all', 'new', 'confirmed', 'paid', 'delivered', 'cancelled'] as const
type StatusKey = typeof STATUSES[number]

const STATUS_LABELS: Record<StatusKey | string, string> = {
  all: 'Все', new: 'Новые', confirmed: 'Подтверждённые',
  paid: 'Оплаченные', delivered: 'Доставленные', cancelled: 'Отменённые',
}
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  delivered: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
}

interface OrdersPageProps {
  searchParams: { status?: string }
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const statusFilter = searchParams.status && searchParams.status !== 'all'
    ? searchParams.status
    : undefined

  let orders: Awaited<ReturnType<typeof adminApi.orders.list>> = []
  let error = false
  try {
    orders = await adminApi.orders.list(statusFilter)
  } catch {
    error = true
  }

  const active = searchParams.status ?? 'all'

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Заказы</h1>

      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders${s !== 'all' ? `?status=${s}` : ''}`}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              active === s
                ? 'bg-[#1a3a1a] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {error && <p className="text-red-500">Не удалось загрузить заказы.</p>}
      {!error && orders.length === 0 && <p className="text-gray-400">Заказов нет.</p>}

      <div className="space-y-2">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{order.customer_name}</p>
                <p className="text-sm text-gray-500">
                  {order.customer_phone} · {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {order.total_amount != null && (
                  <span className="font-semibold text-[#2d5a1b]">
                    {order.total_amount.toLocaleString('ru-RU')} ₽
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? ''}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
