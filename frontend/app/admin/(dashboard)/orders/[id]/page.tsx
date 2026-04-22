import { notFound } from 'next/navigation'
import { adminApi } from '@/lib/admin-api'
import { ConfirmOrderForm } from '@/components/admin/ConfirmOrderForm'
import { StatusSelect } from '@/components/admin/StatusSelect'

interface OrderDetailPageProps {
  params: { id: string }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  let order: Awaited<ReturnType<typeof adminApi.orders.get>> | undefined

  try {
    order = await adminApi.orders.get(params.id)
  } catch {
    notFound()
  }

  if (!order) notFound()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Заказ #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <StatusSelect orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <h2 className="font-semibold text-gray-700 mb-3">Клиент и доставка</h2>
        <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
          <div><dt className="text-gray-500">Имя</dt><dd className="font-medium">{order.customer_name}</dd></div>
          <div><dt className="text-gray-500">Телефон</dt><dd className="font-medium">{order.customer_phone}</dd></div>
          <div><dt className="text-gray-500">Адрес</dt><dd className="font-medium">{order.delivery_address}</dd></div>
          <div><dt className="text-gray-500">Дата доставки</dt><dd className="font-medium">{new Date(order.delivery_date).toLocaleDateString('ru-RU')}</dd></div>
          <div><dt className="text-gray-500">Оплата</dt><dd className="font-medium">{order.payment_method === 'online' ? 'Онлайн' : 'Наличными'}</dd></div>
          <div><dt className="text-gray-500">Создан</dt><dd className="font-medium">{new Date(order.created_at).toLocaleString('ru-RU')}</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <h2 className="font-semibold text-gray-700 mb-3">Состав</h2>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.product_id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.product_name} × {item.quantity} {item.unit}
              </span>
              <span className="font-medium">
                {(item.price_at_moment * item.quantity).toLocaleString('ru-RU')} ₽
              </span>
            </li>
          ))}
        </ul>
        {order.total_amount != null && (
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-semibold text-sm">
            <span>Итого</span>
            <span className="text-[#2d5a1b]">{order.total_amount.toLocaleString('ru-RU')} ₽</span>
          </div>
        )}
      </div>

      {order.status === 'new' && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <ConfirmOrderForm orderId={order.id} />
        </div>
      )}
    </div>
  )
}
