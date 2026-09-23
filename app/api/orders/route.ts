import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { OrderSelection } from '@/lib/supabase'
import { sendAdminNotification } from '@/lib/email'
import { CATEGORIES, BUNDLE_PRICES, UPGRADE_PRICES, TierKey, UpgradeKey } from '@/lib/courses'
import { findQualifyingOrder } from '@/lib/upgrades'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerName, customerEmail, customerPhone, selections, paymentMethod, upgradeType, receiptBase64, receiptContentType, receiptFileName } = body

    if (!customerName || !customerEmail) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }
    if (!upgradeType && (!Array.isArray(selections) || selections.length === 0)) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Los precios se calculan acá desde lib/courses.ts — nunca se confía en lo que manda el navegador
    let enrichedSelections: OrderSelection[]
    let totalUsd: number

    if (upgradeType) {
      const upg = UPGRADE_PRICES[upgradeType as UpgradeKey]
      if (!upg) {
        return NextResponse.json({ error: 'Upgrade inválido' }, { status: 400 })
      }
      if (!(await findQualifyingOrder(customerEmail, upgradeType as UpgradeKey))) {
        return NextResponse.json({ error: `No hay una compra aprobada del nivel ${upg.from} para ese email` }, { status: 400 })
      }
      // For upgrades, create a synthetic selection entry
      enrichedSelections = [{
        categoryId: upgradeType,
        categoryName: upg.label,
        tier: 'upgrade',
        tierLabel: 'Upgrade',
        price: upg.price,
        driveLink: '#',
      }]
      totalUsd = upg.price
    } else {
      // Una selección por especialización (igual que el carrito)
      const byCategory = new Map<string, TierKey>()
      for (const sel of selections as Array<{ categoryId: string; tier: string }>) {
        const cat = CATEGORIES.find(c => c.id === sel?.categoryId)
        if (!cat || !Object.hasOwn(cat.tiers, sel.tier)) {
          return NextResponse.json({ error: 'Selección inválida' }, { status: 400 })
        }
        byCategory.set(cat.id, sel.tier as TierKey)
      }

      enrichedSelections = [...byCategory].map(([categoryId, tier]) => {
        const cat = CATEGORIES.find(c => c.id === categoryId)!
        const tierData = cat.tiers[tier]
        return {
          categoryId,
          categoryName: cat.name,
          tier,
          tierLabel: tierData.label,
          price: tierData.price,
          driveLink: tierData.driveLink,
        }
      })

      // Catálogo completo: las 7 especializaciones al mismo nivel → precio de bundle
      const tiers = [...byCategory.values()]
      const bundleTier = byCategory.size === CATEGORIES.length && tiers.every(t => t === tiers[0]) ? tiers[0] : null
      totalUsd = bundleTier
        ? BUNDLE_PRICES[bundleTier].price
        : enrichedSelections.reduce((sum, s) => sum + s.price, 0)
    }

    // Upload receipt to Supabase Storage (bucket privado — se guarda la ruta, no una URL pública)
    let comprobante_url: string | null = null
    if (receiptBase64 && receiptContentType) {
      try {
        const buffer = Buffer.from(receiptBase64, 'base64')
        const ext = (receiptFileName?.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5) || 'jpg'
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(fileName, buffer, { contentType: receiptContentType })
        if (!uploadError) {
          comprobante_url = fileName
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
