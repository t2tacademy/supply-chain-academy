import { NextResponse } from 'next/server'
import { UPGRADE_PRICES, UpgradeKey } from '@/lib/courses'
import { findQualifyingOrder } from '@/lib/upgrades'

export async function POST(req: Request) {
  try {
    const { email, upgradeType } = await req.json()

    if (!email || !upgradeType || !UPGRADE_PRICES[upgradeType as UpgradeKey]) {
      return NextResponse.json({ verified: false })
    }

    const matchingOrder = await findQualifyingOrder(email, upgradeType as UpgradeKey)

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
