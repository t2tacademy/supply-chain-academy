import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { OrderSelection } from '@/lib/supabase'
import { sendAdminNotification } from '@/lib/email'
import { CATEGORIES, BUNDLE_PRICES, UPGRADE_PRICES, TierKey, UpgradeKey } from '@/lib/courses'
import { findQualifyingOrder } from '@/lib/upgrades'

const PAYMENT_METHODS = ['mercadopago', 'transferencia', 'bbva-usd', 'paypal']
const RECEIPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
// Vercel corta los requests en ~4.5 MB y el base64 agrega ~33%
const MAX_RECEIPT_BYTES = 3 * 1024 * 1024

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { selections, upgradeType, receiptBase64, receiptContentType } = body

    const customerName = str(body.customerName, 120)
    const customerEmail = str(body.customerEmail, 200).toLowerCase()
    const customerPhone = str(body.customerPhone, 40)
    const paymentMethod = str(body.paymentMethod, 40)

    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Medio de pago inválido' }, { status: 400 })
    }
    if (typeof receiptBase64 !== 'string' || !RECEIPT_TYPES.includes(receiptContentType)) {
      return NextResponse.json({ error: 'Adjuntá el comprobante en JPG, PNG, WEBP, HEIC o PDF' }, { status: 400 })
    }
    if (Buffer.byteLength(receiptBase64, 'base64') > MAX_RECEIPT_BYTES) {
      return NextResponse.json({ error: 'El comprobante supera los 3 MB' }, { status: 400 })
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
        const ext = receiptContentType === 'application/pdf' ? 'pdf' : receiptContentType.split('/')[1].replace('jpeg', 'jpg')
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
