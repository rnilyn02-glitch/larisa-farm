'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin',            label: 'Дашборд',  exact: true },
  { href: '/admin/orders',     label: 'Заказы',   exact: false },
  { href: '/admin/products',   label: 'Товары',   exact: false },
  { href: '/admin/customers',  label: 'Клиенты',  exact: false },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className="w-52 bg-[#1a3a1a] text-white flex flex-col min-h-screen shrink-0">
      <div className="p-4 border-b border-white/10">
        <p className="font-bold text-sm">🌿 Larisa Farm</p>
        <p className="text-white/50 text-xs">Панель управления</p>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 p-2 space-y-0.5">
        {NAV.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Выйти
        </button>
      </div>
    </aside>
  )
}
