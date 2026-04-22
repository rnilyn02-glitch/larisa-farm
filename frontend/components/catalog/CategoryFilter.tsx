'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = [
  { slug: '',         label: 'Все' },
  { slug: 'eggs',     label: 'Яйца' },
  { slug: 'meat',     label: 'Мясо' },
  { slug: 'veggies',  label: 'Овощи' },
  { slug: 'sets',     label: 'Наборы' },
]

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('category') ?? ''

  const select = (slug: string) => {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    router.push(`/catalog${slug ? `?${params}` : ''}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => select(cat.slug)}
          className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
            active === cat.slug
              ? 'bg-farm-green text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-farm-green'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
