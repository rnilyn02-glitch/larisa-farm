import { z } from 'zod'

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Введите имя (минимум 2 символа)'),
  customer_phone: z
    .string()
    .regex(/^\+7\d{10}$/, 'Формат номера: +79001234567'),
  delivery_address: z.string().min(5, 'Введите адрес доставки'),
  delivery_date: z.string().min(1, 'Выберите дату доставки'),
  payment_method: z.enum(['online', 'cash']),
  comment: z.string().optional(),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
