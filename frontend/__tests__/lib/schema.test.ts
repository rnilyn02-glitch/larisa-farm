import { describe, it, expect } from 'vitest'
import { checkoutSchema } from '@/components/checkout/schema'

const valid = {
  customer_name: 'Иван Иванов',
  customer_phone: '+79001234567',
  delivery_address: 'ул. Ленина 5, кв. 10',
  delivery_date: '2026-04-27',
  payment_method: 'online' as const,
}

describe('checkoutSchema', () => {
  it('accepts valid data', () => {
    expect(() => checkoutSchema.parse(valid)).not.toThrow()
  })

  it('rejects name shorter than 2 characters', () => {
    expect(checkoutSchema.safeParse({ ...valid, customer_name: 'И' }).success).toBe(false)
  })

  it('rejects phone without +7 prefix', () => {
    expect(checkoutSchema.safeParse({ ...valid, customer_phone: '89001234567' }).success).toBe(false)
  })

  it('rejects phone with wrong digit count', () => {
    expect(checkoutSchema.safeParse({ ...valid, customer_phone: '+7900123456' }).success).toBe(false)
  })

  it('rejects address shorter than 5 characters', () => {
    expect(checkoutSchema.safeParse({ ...valid, delivery_address: 'ул' }).success).toBe(false)
  })

  it('rejects empty delivery_date', () => {
    expect(checkoutSchema.safeParse({ ...valid, delivery_date: '' }).success).toBe(false)
  })

  it('rejects invalid payment_method', () => {
    expect(checkoutSchema.safeParse({ ...valid, payment_method: 'card' as 'online' }).success).toBe(false)
  })

  it('allows optional comment to be omitted', () => {
    const { comment: _c, ...noComment } = { ...valid, comment: undefined }
    expect(() => checkoutSchema.parse(noComment)).not.toThrow()
  })
})
