// frontend/components/layout/Footer.tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-farm-green text-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-bold text-base mb-2">🌿 Larisa Farm</p>
            <p className="text-white/70">Фермерское хозяйство "Larisa-I & Co"</p>
            <p className="text-white/70">г. Стрежевой</p>
          </div>
          <div>
            <p className="font-semibold mb-2">Навигация</p>
            <ul className="space-y-1 text-white/70">
              <li><Link href="/catalog" className="hover:text-white">Каталог</Link></li>
              <li><Link href="/delivery" className="hover:text-white">Доставка и оплата</Link></li>
              <li><Link href="/about" className="hover:text-white">О ферме</Link></li>
              <li><Link href="/contacts" className="hover:text-white">Контакты</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Контакты</p>
            <p className="text-white/70">Телефон: уточняйте при заказе</p>
            <p className="text-white/70 mt-1">Доставка по воскресеньям</p>
          </div>
        </div>
        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} Larisa-I & Co
        </p>
      </div>
    </footer>
  )
}
