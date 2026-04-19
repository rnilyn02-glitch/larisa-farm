// frontend/app/delivery/page.tsx
export default function DeliveryPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-farm-green mb-6">Доставка и оплата</h1>
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-farm-green mb-3">🚚 Доставка</h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Доставка осуществляется каждое воскресенье</li>
            <li>• Зона доставки — г. Стрежевой</li>
            <li>• Вы выбираете удобную дату при оформлении заказа</li>
            <li>• После подтверждения менеджер сообщит точное время доставки</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-farm-green mb-3">💳 Оплата</h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <strong>Онлайн</strong> — через YooKassa (карта, СБП). Ссылка придёт в Telegram после подтверждения заказа менеджером.</li>
            <li>• <strong>Наличными</strong> — при получении курьеру.</li>
            <li>• Итоговая сумма может быть скорректирована менеджером по фактическому весу.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
