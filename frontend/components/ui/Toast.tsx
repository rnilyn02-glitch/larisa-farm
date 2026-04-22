// frontend/components/ui/Toast.tsx
'use client'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'error' | 'success'
  onClose: () => void
}

export function Toast({ message, type = 'error', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-lg px-4 py-3 text-white text-sm shadow-lg ${
        type === 'error' ? 'bg-farm-error' : 'bg-farm-green'
      }`}
    >
      {message}
    </div>
  )
}
