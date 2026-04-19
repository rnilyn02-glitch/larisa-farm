// frontend/components/layout/Header.tsx
'use client'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'

export function Header() {
  const { count, openDrawer } = useCartStore()
  const cartCount = count()

  return (
    <header className="bg-farm-green text-white sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-serif font-bold text-lg tracking-wide">
          🌿 Larisa Farm
        </Link>

        <nav className="hidden sm:flex items-center gap-5 text-sm">
          <Link href="/catalog" className="hover:text-farm-cream transition-colors">Каталог</Link>
          <Link href="/about" className="hover:text-farm-cream transition-colors">О ферме</Link>
          <Link href="/delivery" className="hover:text-farm-cream transition-colors">Доставка</Link>
          <Link href="/contacts" className="hover:text-farm-cream transition-colors">Контакты</Link>
        </nav>

        <button
          onClick={openDrawer}
          className="relative flex items-center gap-1 text-sm hover:text-farm-cream transition-colors"
          aria-label="Корзина"
        >
          <span className="text-xl">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-farm-error text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
