import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side only client (service role)
export const supabase = createClient(supabaseUrl, supabaseKey)

export interface OrderSelection {
  categoryId: string
  categoryName: string
  tier: string
  tierLabel: string
  price: number
  driveLink: string
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  selections: OrderSelection[]
  total_usd: number
  payment_method: string
  status: 'pending' | 'approved' | 'rejected'
  approve_token: string
  created_at: string
  approved_at?: string
}
