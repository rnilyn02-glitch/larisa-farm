// frontend/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'

export const metadata: Metadata = {
  title: 'Larisa Farm — Фермерские продукты',
  description: 'Свежие фермерские продукты с доставкой по Стрежевому',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="flex flex-col min-h-screen bg-farm-cream font-serif">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  )
}
