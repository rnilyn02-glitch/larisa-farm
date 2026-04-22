import { adminApi } from '@/lib/admin-api'
import { StatsChart } from '@/components/admin/StatsChart'

export default async function DashboardPage() {
  let stats = null
  try {
    stats = await adminApi.stats.get()
  } catch {
    // show error state
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Дашборд</h1>

      {!stats && (
        <p className="text-red-500 mb-6">Не удалось загрузить статистику.</p>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {([
              { label: 'Новых',        value: stats.orders_new,       color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: 'Подтверждено', value: stats.orders_confirmed, color: 'bg-amber-50 text-amber-700 border-amber-200' },
              { label: 'Оплачено',     value: stats.orders_paid,      color: 'bg-green-50 text-green-700 border-green-200' },
              { label: 'Доставлено',   value: stats.orders_delivered, color: 'bg-purple-50 text-purple-700 border-purple-200' },
            ] as const).map((card) => (
              <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">Заказы по статусу</h2>
            <StatsChart stats={stats} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Итого выручка</p>
            <p className="text-2xl font-bold text-[#2d5a1b]">
              {stats.revenue_total.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </>
      )}
    </div>
  )
}
