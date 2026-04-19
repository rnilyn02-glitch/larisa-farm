export interface AdminStats {
  revenue_total: number
  orders_new: number
  orders_confirmed: number
  orders_paid: number
  orders_delivered: number
  orders_cancelled: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  order_count: number
  total_spent: number
  last_order_date: string
}

export interface ConfirmOrderPayload {
  final_amount: number
}
