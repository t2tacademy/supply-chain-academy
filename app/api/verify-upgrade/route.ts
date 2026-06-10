import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { UPGRADE_PRICES, UpgradeKey } from '@/lib/courses'

export async function POST(req: Request) {
  try {
    const { email, upgradeType } = await req.json()

    if (!email || !upgradeType) {
      return NextResponse.json({ verified: false })
    }

    const upg = UPGRADE_PRICES[upgradeType as UpgradeKey]
    if (!upg) {
      return NextResponse.json({ verified: false })
    }

    const requiredTier = upg.from.toLowerCase() // 'starter' or 'pro'

    const { data: orders } = await supabase
      .from('orders')
      .select('id, total_usd, selections, created_at')
      .eq('customer_email', email.toLowerCase().trim())
      .eq('status', 'approved')

    if (!orders || orders.length === 0) {
      return NextResponse.json({ verified: false })
    }

    const matchingOrder = orders.find(order => {
      const sels = order.selections as Array<{ tier: string; categoryId: string }>
      return sels.some(s =>
        s.tier === requiredTier ||
        (requiredTier === 'pro' && s.categoryId === 'starter-to-pro')
      )
    })

    if (matchingOrder) {
      const date = new Date(matchingOrder.created_at).toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
      return NextResponse.json({ verified: true, orderId: matchingOrder.id, orderDate: date })
    }

    return NextResponse.json({ verified: false })
  } catch {
    return NextResponse.json({ verified: false })
  }
}
