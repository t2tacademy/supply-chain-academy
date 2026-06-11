import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendCustomerAccess } from '@/lib/email'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('approve_token', token)
    .single()

  if (error || !order) {
    return NextResponse.json({ ok: false, message: 'Orden no encontrada' }, { status: 404 })
  }

  if (order.status !== 'approved') {
    return NextResponse.json({ ok: false, message: 'La orden no está aprobada' }, { status: 400 })
  }

  await sendCustomerAccess({
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    selections: order.selections,
    totalUsd: order.total_usd,
  })

  return NextResponse.json({ ok: true })
}
