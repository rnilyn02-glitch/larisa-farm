// frontend/app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-farm-green mb-6">О ферме</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 text-gray-700 leading-relaxed">
        <p>
          Фермерское хозяйство <strong>"Larisa-I & Co"</strong> — небольшая семейная ферма в Стрежевом.
          Мы выращиваем кур, разводим огород и производим натуральные продукты без использования
          антибиотиков и ГМО.
        </p>
        <p>
          Все продукты — собственного производства. Яйца, мясо птицы, свежие овощи и готовые наборы
          доставляются напрямую от фермы к вашему столу.
        </p>
        <p>
          Доставка осуществляется еженедельно по воскресеньям по всему Стрежевому.
          Заказы принимаются в течение недели.
        </p>
      </div>
    </div>
  )
}
