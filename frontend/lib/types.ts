export interface Product {
  id: string
  name: string
  category: 'eggs' | 'meat' | 'veggies' | 'sets'
  price: number
  unit: string
  is_active: boolean
  stock_qty: number
  description?: string
  image_url?: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price_at_moment: number
  unit: string
}

export interface Order {
  id: string
  status: 'new' | 'confirmed' | 'paid' | 'delivered' | 'cancelled'
  total_amount: number | null
  payment_method: 'online' | 'cash'
  delivery_address: string
  delivery_date: string
  created_at: string
  customer_name: string
  customer_phone: string
  items: OrderItem[]
  payment_url?: string
}

export interface CreateOrderPayload {
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_date: string
  payment_method: 'online' | 'cash'
  comment?: string
  items: Array<{ product_id: string; quantity: number; price_at_moment: number }>
}
