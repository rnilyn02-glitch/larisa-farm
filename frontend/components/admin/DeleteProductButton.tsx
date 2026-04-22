'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/admin-api'

interface DeleteProductButtonProps {
  productId: string
}

export function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Удалить товар? Это действие нельзя отменить.')) return
    setDeleting(true)
    try {
      await adminApi.products.delete(productId)
      router.refresh()
    } catch {
      alert('Не удалось удалить товар')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-sm text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
    >
      {deleting ? '...' : 'Удалить'}
    </button>
  )
}
