import { supabase } from '@/lib/supabase'
import { UPGRADE_PRICES, UpgradeKey } from '@/lib/courses'

// Busca una orden aprobada del nivel requerido para el upgrade (Starter para Starter → Pro, Pro para Pro → Expert)
export async function findQualifyingOrder(email: string, upgradeType: UpgradeKey) {
  const requiredTier = UPGRADE_PRICES[upgradeType].from.toLowerCase() // 'starter' or 'pro'

  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_usd, selections, created_at')
    .eq('customer_email', email.toLowerCase().trim())
    .eq('status', 'approved')

  if (!orders || orders.length === 0) return null

  return orders.find(order => {
    const sels = order.selections as Array<{ tier: string; categoryId: string }>
    return sels.some(s =>
      s.tier === requiredTier ||
      (requiredTier === 'pro' && s.categoryId === 'starter-to-pro')
    )
  }) ?? null
}
