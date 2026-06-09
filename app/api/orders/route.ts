import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendAdminNotification } from '@/lib/email'
import { CATEGORIES } from '@/lib/courses'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerName, customerEmail, customerPhone, selections, paymentMethod } = body

    if (!customerName || !customerEmail || !selections || selections.length === 0) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Enrich selections with drive links from server-side env vars
    const enrichedSelections = selections.map((sel: { categoryId: string; tier: string; price: number }) => {
      const cat = CATEGORIES.find(c => c.id === sel.categoryId)
      const tierData = cat?.tiers[sel.tier as keyof typeof cat.tiers]
      return {
        categoryId: sel.categoryId,
        categoryName: cat?.name || sel.categoryId,
        tier: sel.tier,
        tierLabel: tierData?.label || sel.tier,
        price: sel.price,
        driveLink: tierData?.driveLink || '#',
      }
    })

    const totalUsd = enrichedSelections.reduce((sum: number, s: { price: number }) => sum + s.price, 0)

    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        selections: enrichedSelections,
        total_usd: totalUsd,
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    await sendAdminNotification({
      id: data.id,
      customerName,
      customerEmail,
      customerPhone,
      selections: enrichedSelections,
      totalUsd,
      paymentMethod,
      approveToken: data.approve_token,
    })

    return NextResponse.json({ success: true, orderId: data.id })
  } catch (err) {
    console.error('Error creating order:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
