import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendAdminNotification } from '@/lib/email'
import { CATEGORIES } from '@/lib/courses'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerName, customerEmail, customerPhone, selections, paymentMethod, bundlePrice, upgradeType, upgradeLabel, upgradePrice, receiptBase64, receiptContentType, receiptFileName } = body

    if (!customerName || !customerEmail) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }
    if (!upgradeType && (!selections || selections.length === 0)) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // For upgrades, create a synthetic selection entry
    const enrichedSelections = upgradeType
      ? [{
          categoryId: upgradeType,
          categoryName: upgradeLabel || upgradeType,
          tier: 'upgrade',
          tierLabel: 'Upgrade',
          price: upgradePrice,
          driveLink: '#',
        }]
      : selections.map((sel: { categoryId: string; tier: string; price: number }) => {
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

    const totalUsd = bundlePrice ?? enrichedSelections.reduce((sum: number, s: { price: number }) => sum + s.price, 0)

    // Upload receipt to Supabase Storage
    let comprobante_url: string | null = null
    if (receiptBase64 && receiptContentType) {
      try {
        const buffer = Buffer.from(receiptBase64, 'base64')
        const ext = receiptFileName?.split('.').pop() || 'jpg'
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(fileName, buffer, { contentType: receiptContentType })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('comprobantes').getPublicUrl(fileName)
          comprobante_url = urlData.publicUrl
        }
      } catch {
        // Non-fatal: order is created even if receipt upload fails
      }
    }

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
        comprobante_url,
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
      comprobanteUrl: comprobante_url,
    })

    return NextResponse.json({ success: true, orderId: data.id })
  } catch (err) {
    console.error('Error creating order:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
