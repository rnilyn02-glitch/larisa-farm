import Link from 'next/link'

const CATEGORIES = [
  { slug: 'eggs',    label: 'Яйца',   emoji: '🥚' },
  { slug: 'meat',    label: 'Мясо',   emoji: '🍗' },
  { slug: 'veggies', label: 'Овощи',  emoji: '🥕' },
  { slug: 'sets',    label: 'Наборы', emoji: '🎁' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-farm-green to-farm-green-light text-white px-4 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Свежие продукты с фермы
        </h1>
        <p className="text-white/80 mb-8 text-lg">
          Доставка по Стрежевому каждое воскресенье
        </p>
        <Link
          href="/catalog"
          className="inline-block bg-white text-farm-green font-semibold px-8 py-3 rounded-full hover:bg-farm-cream transition-colors"
        >
          Смотреть каталог →
        </Link>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold text-farm-green mb-6 text-center">Категории</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalog?category=${cat.slug}`}
              className="bg-white rounded-2xl p-6 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-4xl">{cat.emoji}</span>
              <span className="text-farm-green font-medium">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-white py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl mb-2">🌱</div>
            <h3 className="font-semibold text-farm-green mb-1">Натуральные продукты</h3>
            <p className="text-gray-500 text-sm">Без антибиотиков и ГМО. Всё с нашей фермы.</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🚚</div>
            <h3 className="font-semibold text-farm-green mb-1">Доставка на дом</h3>
            <p className="text-gray-500 text-sm">Каждое воскресенье по всему Стрежевому.</p>
          </div>
          <div>
            <div className="text-3xl mb-2">💳</div>
            <h3 className="font-semibold text-farm-green mb-1">Удобная оплата</h3>
            <p className="text-gray-500 text-sm">Онлайн через YooKassa или наличными.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
