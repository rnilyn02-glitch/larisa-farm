import { adminApi } from '@/lib/admin-api'

export default async function CustomersPage() {
  let customers: Awaited<ReturnType<typeof adminApi.customers.list>> = []
  let error = false
  try {
    customers = await adminApi.customers.list()
  } catch {
    error = true
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Клиенты</h1>

      {error && <p className="text-red-500 mb-4">Не удалось загрузить клиентов.</p>}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Имя</th>
              <th className="text-left px-4 py-3 font-medium">Телефон</th>
              <th className="text-right px-4 py-3 font-medium">Заказов</th>
              <th className="text-right px-4 py-3 font-medium">Потрачено</th>
              <th className="text-right px-4 py-3 font-medium">Последний заказ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3 font-medium text-gray-800">{customer.name}</td>
                <td className="px-4 py-3 text-gray-500">{customer.phone}</td>
                <td className="px-4 py-3 text-right">{customer.order_count}</td>
                <td className="px-4 py-3 text-right">
                  {customer.total_spent.toLocaleString('ru-RU')} ₽
                </td>
                <td className="px-4 py-3 text-right">
                  {new Date(customer.last_order_date).toLocaleDateString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!error && customers.length === 0 && (
          <p className="text-center text-gray-400 py-8">Нет клиентов</p>
        )}
      </div>
    </div>
  )
}
