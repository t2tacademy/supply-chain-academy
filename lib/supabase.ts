import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || url.includes('TUPROYECTO') || !key || key.includes('COMPLETAR')) {
      throw new Error('Supabase no configurado — completá las variables de entorno.')
    }
    _client = createClient(url, key)
  }
  return _client
}

// Server-side only client (service role) — lazy, no crashea en build
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as any)[prop]
  },
})

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
  comprobante_url?: string | null
  created_at: string
  approved_at?: string
}
