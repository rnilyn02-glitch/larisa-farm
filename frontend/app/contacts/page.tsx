// frontend/app/contacts/page.tsx
export default function ContactsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-farm-green mb-6">Контакты</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 text-gray-700">
        <div>
          <p className="text-sm text-gray-500 mb-1">Организация</p>
          <p className="font-medium">Фермерское хозяйство "Larisa-I & Co"</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Местонахождение</p>
          <p className="font-medium">г. Стрежевой, Томская область</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Телефон для справок</p>
          <p className="font-medium">Уточняйте при оформлении заказа</p>
        </div>
        <div className="bg-farm-green/5 rounded-lg p-4 text-sm">
          По всем вопросам вы можете написать в Telegram — менеджер свяжется с вами
          после оформления заказа.
        </div>
      </div>
    </div>
  )
}
