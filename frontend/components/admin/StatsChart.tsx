'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { AdminStats } from '@/lib/admin-types'

interface StatsChartProps {
  stats: AdminStats
}

export function StatsChart({ stats }: StatsChartProps) {
  const data = [
    { name: 'Новые',     value: stats.orders_new },
    { name: 'Подтв.',    value: stats.orders_confirmed },
    { name: 'Оплачены',  value: stats.orders_paid },
    { name: 'Доставл.',  value: stats.orders_delivered },
    { name: 'Отменены',  value: stats.orders_cancelled },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" fill="#2d5a1b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
