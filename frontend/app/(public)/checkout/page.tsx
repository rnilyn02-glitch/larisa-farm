// frontend/app/checkout/page.tsx
import { CheckoutForm } from '@/components/checkout/CheckoutForm'

export default function CheckoutPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-farm-green mb-6">Оформление заказа</h1>
      <CheckoutForm />
    </div>
  )
}
