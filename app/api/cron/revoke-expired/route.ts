import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { revokeOrderAccess } from '@/lib/drive'

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - NINETY_DAYS_MS).toISOString()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, drive_permission_ids, customer_email')
    .eq('status', 'approved')
    .eq('drive_access_revoked', false)
    .lt('approved_at', cutoff)

  if (error || !orders) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  let revoked = 0
  for (const order of orders) {
    if (!order.drive_permission_ids) continue
    await revokeOrderAccess(order.drive_permission_ids as Record<string, string>)
    await supabase
      .from('orders')
      .update({ drive_access_revoked: true, drive_access_revoked_at: new Date().toISOString() })
      .eq('id', order.id)
    revoked++
  }

  return NextResponse.json({ ok: true, revoked })
}
