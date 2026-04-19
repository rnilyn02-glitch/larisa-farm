// frontend/app/order/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  new:        { label: 'Принят',           color: 'bg-blue-100 text-blue-700',   emoji: '📬' },
  confirmed:  { label: 'Подтверждён',      color: 'bg-amber-100 text-amber-700', emoji: '✅' },
  paid:       { label: 'Оплачен',          color: 'bg-green-100 text-green-700', emoji: '💳' },
  delivered:  { label: 'Доставлен',        color: 'bg-purple-100 text-purple-700',emoji: '🚚' },
  cancelled:  { label: 'Отменён',          color: 'bg-red-100 text-red-700',     emoji: '❌' },
}

interface OrderPageProps {
  params: { id: string }
}

export default async function OrderPage({ params }: OrderPageProps) {
  let order

  try {
    order = await api.orders.get(params.id)
  } catch {
    notFound()
  }

  const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.new

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-farm-green mb-6">Заказ</h1>

      {/* Status card */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{statusInfo.emoji}</span>
          <div>
            <p className="text-sm text-gray-500">Статус</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {order.status === 'new' && (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            Ваш заказ принят. Менеджер свяжется с вами в ближайшее время для подтверждения.
          </p>
        )}

        {order.status === 'confirmed' && order.payment_url && (
          <div className="bg-farm-amber/10 border border-farm-amber/30 rounded-lg p-3 mt-2">
            <p className="text-sm text-gray-700 mb-2">Заказ подтверждён. Оплатите для оформления доставки:</p>
            <a
              href={order.payment_url}
              className="block w-full bg-farm-amber text-white text-center py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Оплатить {order.total_amount?.toLocaleString('ru-RU')} ₽
            </a>
          </div>
        )}

        {order.status === 'confirmed' && !order.payment_url && order.payment_method === 'cash' && (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mt-2">
            Заказ подтверждён. Оплата наличными при получении.
            {order.total_amount && ` Итоговая сумма: ${order.total_amount.toLocaleString('ru-RU')} ₽`}
          </p>
        )}
      </div>

      {/* Order details */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <h2 className="font-semibold text-farm-green mb-3">Детали</h2>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Дата доставки</dt>
            <dd className="font-medium">{new Date(order.delivery_date).toLocaleDateString('ru-RU')}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Адрес</dt>
            <dd className="font-medium text-right max-w-[60%]">{order.delivery_address}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Оплата</dt>
            <dd className="font-medium">{order.payment_method === 'online' ? 'Онлайн' : 'Наличные'}</dd>
          </div>
        </dl>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <h2 className="font-semibold text-farm-green mb-3">Состав заказа</h2>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.product_id} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.product_name} × {item.quantity} {item.unit}</span>
              <span className="font-medium">{(item.price_at_moment * item.quantity).toLocaleString('ru-RU')} ₽</span>
            </li>
          ))}
        </ul>
        {order.total_amount && (
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-semibold">
            <span>Итого</span>
            <span className="text-farm-green">{order.total_amount.toLocaleString('ru-RU')} ₽</span>
          </div>
        )}
      </div>

      <Link href="/" className="block text-center text-farm-green text-sm hover:underline">
        ← На главную
      </Link>
    </div>
  )
}
