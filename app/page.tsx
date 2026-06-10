'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CATEGORIES, TierKey, getLevelTotals, minutesToLabel, BUNDLE_PRICES } from '@/lib/courses'
import CategoryCompareTable from '@/components/CategoryCompareTable'
import PaymentTabs, { PaymentMethod } from '@/components/PaymentTabs'
import StatsSection from '@/components/StatsSection'

type Selections = Record<string, TierKey>
type FormState = 'catalog' | 'checkout' | 'success'

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mercadopago: 'Mercado Pago',
  transferencia: 'Transferencia bancaria AR',
  paypal: 'PayPal',
  internacional: 'Transferencia internacional',
}

function useCountUp(target: number, delayMs: number = 0) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      const duration = 1800
      const start = Date.now()
      const id = setInterval(() => {
        const p = Math.min((Date.now() - start) / duration, 1)
        setCount(Math.round(target * (1 - Math.pow(1 - p, 3))))
        if (p >= 1) clearInterval(id)
      }, 16)
      return () => clearInterval(id)
    }, delayMs)
    return () => clearTimeout(t)
  }, [target, delayMs])
  return count
}

export default function Home() {
  const [selections, setSelections] = useState<Selections>({})
  const [formState, setFormState] = useState<FormState>('catalog')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago')
  const [country, setCountry] = useState<'argentina' | 'internacional'>('argentina')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCountryChange = (c: 'argentina' | 'internacional') => {
    setCountry(c)
    if (c === 'internacional' && (paymentMethod === 'mercadopago' || paymentMethod === 'transferencia')) {
      setPaymentMethod('paypal')
    }
  }

  const heroCount158 = useCountUp(158, 400)
  const heroCount9   = useCountUp(9,   600)
  const heroCount20  = useCountUp(20,  800)

  const selectedEntries = Object.entries(selections)
  const itemCount = selectedEntries.length

  // Detect full-bundle selection (all 9 categories at the same tier)
  const bundleTier: TierKey | null = (() => {
    if (selectedEntries.length !== CATEGORIES.length) return null
    const tier = selectedEntries[0]?.[1]
    return selectedEntries.every(([, t]) => t === tier) ? tier as TierKey : null
  })()

  const total = bundleTier
    ? BUNDLE_PRICES[bundleTier].price
    : selectedEntries.reduce((sum, [catId, tier]) => {
        const cat = CATEGORIES.find(c => c.id === catId)
        return sum + (cat?.tiers[tier]?.price ?? 0)
      }, 0)

  const handleSelect = (categoryId: string, tier: TierKey | null) => {
    setSelections(prev => {
      const next = { ...prev }
      if (tier === null) {
        delete next[categoryId]
      } else {
        next[categoryId] = tier
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Por favor completá nombre y email.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      setError('Email inválido.')
      return
    }
    if (!receiptFile) {
      setError('Por favor adjuntá el comprobante de pago.')
      return
    }

    setError('')
    setLoading(true)

    const selectionsPayload = selectedEntries.map(([catId, tier]) => {
      const cat = CATEGORIES.find(c => c.id === catId)!
      return { categoryId: catId, tier, price: cat.tiers[tier].price }
    })

    try {
      // Encode receipt as base64
      const receiptBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(receiptFile)
      })

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          selections: selectionsPayload,
          paymentMethod,
          bundlePrice: bundleTier ? BUNDLE_PRICES[bundleTier].price : undefined,
          receiptBase64,
          receiptContentType: receiptFile.type,
          receiptFileName: receiptFile.name,
        }),
      })
      if (!res.ok) throw new Error()
      setFormState('success')
    } catch {
      setError('Hubo un error al enviar tu orden. Por favor intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-40 bg-[#050E1A] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo T2T — link a la plataforma */}
          <a
            href="https://t2tacademy.sabionet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 group"
          >
            <div className="relative w-10 h-10 shrink-0">
              <Image src="/t2t-logo.jpg" alt="T2T Academy" fill className="object-contain rounded-full group-hover:ring-2 group-hover:ring-purple-400 transition-all" sizes="40px" />
            </div>
            <span className="text-white font-semibold text-sm hidden sm:block group-hover:text-purple-300 transition-colors">Think to Transform · Academy</span>
          </a>

          {/* Contacto: WhatsApp + Email */}
          <div className="flex items-center gap-3">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/5491134030955?text=${encodeURIComponent('¡Hola Gustavo! 👋 Estuve viendo el Catálogo Supply Chain y me parece una oportunidad increíble. Me gustaría saber más sobre los módulos y cómo empezar. ¡Muchas gracias!')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-green-500/20 transition-colors flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.549 4.107 1.51 5.836L0 24l6.335-1.484A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.36-.214-3.722.872.938-3.63-.235-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
              </div>
              <span className="text-sm hidden sm:block">+54 9 11 3403-0955</span>
            </a>

            {/* Email — abre Gmail en nueva pestaña */}
            <a
              href={`https://mail.google.com/mail/?view=cm&to=t2tscacademy@gmail.com&su=${encodeURIComponent('Consulta — Catálogo Supply Chain')}&body=${encodeURIComponent('¡Hola Gustavo! 👋\n\nEstuve viendo el Catálogo Supply Chain y me parece una oportunidad increíble para potenciar mi carrera. Me entusiasmó mucho la propuesta — especialmente la combinación de experiencia real con formación práctica.\n\nMe gustaría saber más sobre los módulos disponibles y cómo puedo empezar. ¿Podés contarme los próximos pasos?\n\n¡Muchas gracias y saludos!')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-purple-500/20 transition-colors flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <span className="text-sm hidden sm:block">t2tscacademy@gmail.com</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #050E1A 0%, #0B1829 45%, #0F1E40 100%)' }}>
        {/* Glow blobs */}
        <div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-purple-600 opacity-[0.13] rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-blue-700 opacity-[0.13] rounded-full blur-3xl translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-indigo-500 opacity-[0.09] rounded-full blur-3xl -translate-y-1/2" />
        <div className="relative max-w-6xl mx-auto px-6 py-10 md:py-28">
          <div className="flex flex-col md:flex-row items-center gap-10">

            {/* ── Left: text ── */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block bg-purple-900/40 border border-purple-700/50 text-purple-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
                T2T Academy · Supply Chain
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                Catálogo{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">
                  Supply Chain
                </span>
              </h1>
              <p className="text-gray-300 text-lg max-w-xl mb-10 leading-relaxed">
                Formación práctica basada en experiencia real. Elegí las especializaciones que necesitás y accedé a tu contenido al instante.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-10 mb-10">
                {[
                  { num: heroCount158,      suffix: '',  label: 'cursos disponibles' },
                  { num: heroCount9,        suffix: '',  label: 'especializaciones'  },
                  { num: heroCount20,       suffix: '+', label: 'años de experiencia'},
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-extrabold text-purple-400 tabular-nums">{stat.num}{stat.suffix}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
              <a href="#catalogo" className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg">
                Ver especializaciones →
              </a>
            </div>

            {/* ── Right: instructor card ── */}
            <div className="shrink-0 w-full md:w-[480px]">
              {/* No overflow-hidden on outer so the circle can overlap banner→content */}
              <a
                href="https://www.linkedin.com/in/gustavorodriguez-/"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-3xl border border-white/10 hover:border-blue-400/40 transition-all group shadow-2xl shadow-black/60 hover:shadow-blue-900/40"
              >
                {/* Wrapper — relative but NO overflow-hidden so circle can bleed out */}
                <div className="relative">
                  {/* Banner — rounded top corners only */}
                  <div className="rounded-t-3xl overflow-hidden">
                    <Image
                      src="/gustavo-banner.jpg"
                      alt="Banner Gustavo Rodriguez"
                      width={1400}
                      height={350}
                      className="w-full h-auto block"
                    />
                  </div>
                  {/* Circle anchored to THIS wrapper (no overflow-hidden here) */}
                  <div className="absolute bottom-0 left-6 translate-y-1/2 z-10">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden ring-[5px] ring-[#07111F] shadow-2xl">
                      <Image
                        src="/gustavo.png"
                        alt="Gustavo Rodriguez"
                        fill
                        className="object-cover object-top"
                        sizes="112px"
                      />
                    </div>
                  </div>
                </div>

                {/* Content — pt-20 leaves room for the overlapping circle */}
                <div className="bg-[#07111F] pt-20 px-6 pb-6 rounded-b-3xl">
                  <p className="font-extrabold text-white text-xl leading-tight mb-1">
                    Gustavo Rodriguez
                  </p>
                  <p className="text-purple-300 text-sm font-semibold mb-2">
                    Creador del Catálogo Supply Chain
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">
                    Ex Director SC Unilever Latam · Consultor · Speaker · Director ITBA · 12.500+ seguidores
                  </p>
                  <div className="flex items-center gap-2 bg-[#0A66C2] group-hover:bg-[#0856a8] transition-colors text-white font-bold text-sm px-5 py-3 rounded-xl w-fit">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Ver perfil en LinkedIn
                  </div>
                </div>
              </a>
            </div>

          </div>
        </div>
      </section>

      <StatsSection />

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-white border-y border-purple-100 py-14">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-10">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '🎯', title: 'Elegí tu camino', desc: 'Seleccioná una o varias especializaciones y el nivel (Starter, Pro o Expert) que necesitás.' },
              { step: '02', icon: '💳', title: 'Realizá el pago', desc: 'Transferí por CBU, Mercado Pago, PayPal o transferencia internacional al importe total.' },
              { step: '03', icon: '📁', title: 'Recibí tu acceso', desc: 'En menos de 24 hs hábiles te enviamos el link de Google Drive con todos tus cursos. Acceso permanente.' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-xs font-bold text-purple-600 mb-2 tracking-widest">PASO {item.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATALOG ─── */}
      {formState !== 'success' && (
        <section id="catalogo" className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Especializaciones disponibles</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Dos formas de armar tu catálogo. Podés elegir un nivel completo o personalizar especialización por especialización.
            </p>
          </div>

          {/* ── OPCIÓN 1: Catálogo completo ── */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-extrabold text-white bg-purple-600 px-2.5 py-1 rounded-full tracking-wide">OPCIÓN 1</span>
              <h3 className="font-extrabold text-gray-900 text-lg">Catálogo completo por nivel</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Elegí un nivel y llevate las 9 especializaciones. El precio ya incluye el descuento acumulado.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['starter', 'pro', 'expert'] as TierKey[]).map(tier => {
                const totals = getLevelTotals(tier)
                const savingsPct = Math.round((totals.listPrice - totals.price) / totals.listPrice * 100)
                const ICONS: Record<TierKey, string> = { starter: '▲', pro: '▲▲', expert: '▲▲▲' }
                const NAMES: Record<TierKey, string> = { starter: 'STARTER', pro: 'PRO', expert: 'EXPERT' }
                return (
                  <button
                    key={tier}
                    onClick={() => {
                      const next: Record<string, TierKey> = {}
                      CATEGORIES.forEach(c => { next[c.id] = tier })
                      setSelections(next)
                    }}
                    className="bg-white rounded-2xl border-2 border-purple-100 p-4 text-left hover:border-purple-400 hover:shadow-md transition-all group"
                  >
                    <div className="text-purple-600 font-bold text-xs tracking-wide mb-2">
                      {ICONS[tier]} {NAMES[tier]}
                    </div>
                    <div className="font-extrabold text-2xl text-purple-700 leading-none mb-1">
                      ${totals.price}
                      <span className="text-xs font-normal text-gray-400 ml-1">USD</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-2">
                      <span className="text-xs text-gray-400 line-through">Lista ${totals.listPrice}</span>
                      <span className="text-xs font-semibold text-emerald-600">Ahorrás {savingsPct}%</span>
                    </div>
                    <p className="text-xs text-gray-400">{totals.courses} cursos · {minutesToLabel(totals.minutes)}</p>
                    <p className="text-xs text-purple-600 font-semibold mt-2 group-hover:underline">Seleccionar →</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm font-bold text-gray-400 px-2">ó</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── OPCIÓN 2: Por especialización ── */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-extrabold text-white bg-gray-500 px-2.5 py-1 rounded-full tracking-wide">OPCIÓN 2</span>
              <h3 className="font-extrabold text-gray-900 text-lg">Por especialización y nivel</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Elegí la especialización y comparé los niveles. Seleccioná el que querés agregar.
            </p>
            <CategoryCompareTable selections={selections} onSelect={handleSelect} />
            {itemCount > 0 && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => setSelections({})}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Limpiar selección
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 bg-white border border-purple-100 rounded-xl p-4 text-xs text-gray-500 text-center">
            Los precios ya incluyen descuento acumulado. Pro incluye todos los cursos Starter + los propios. Expert incluye todos los niveles.
          </div>
        </section>
      )}

      {/* ─── CHECKOUT ─── */}
      {formState === 'checkout' && (
        <section id="checkout-section" className="max-w-5xl mx-auto px-6 pb-24 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setFormState('catalog')}
              className="text-gray-400 hover:text-gray-700 text-sm flex items-center gap-1 transition-colors"
            >
              ← Volver al catálogo
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Completá tu orden</h2>

          {/* ── Row 1: Datos + Resumen ── */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <div className="md:col-span-3 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Tus datos</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Juan García"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp (opcional)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="+54 9 11 ..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="juan@empresa.com"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">Aquí recibirás el link de acceso.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                    <select
                      value={country}
                      onChange={e => handleCountryChange(e.target.value as 'argentina' | 'internacional')}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value="argentina">Argentina</option>
                      <option value="internacional">Otro país</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Resumen</h3>
              <div className="space-y-3 mb-4">
                {bundleTier ? (
                  <div className="flex justify-between items-start gap-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-800">Catálogo Completo</p>
                      <p className="text-gray-400 text-xs">
                        {bundleTier === 'starter' ? 'Starter' : bundleTier === 'pro' ? 'Pro' : 'Expert'} · 9 especializaciones · {minutesToLabel(getLevelTotals(bundleTier).minutes)}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-800 flex-shrink-0">${BUNDLE_PRICES[bundleTier].price}</span>
                  </div>
                ) : (
                  selectedEntries.map(([catId, tier]) => {
                    const cat = CATEGORIES.find(c => c.id === catId)!
                    const t = cat.tiers[tier]
                    return (
                      <div key={catId} className="flex justify-between items-start gap-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-800">{cat.name}</p>
                          <p className="text-gray-400 text-xs">{t.label} · {t.courses} cursos · {minutesToLabel(t.minutes)}</p>
                        </div>
                        <span className="font-semibold text-gray-800 flex-shrink-0">${t.price}</span>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-purple-700 text-xl">${total} USD</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Método: {PAYMENT_METHOD_LABELS[paymentMethod]}</p>
            </div>
          </div>

          {/* ── Row 2: Medio de pago (full width) ── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="font-bold text-gray-900 mb-1">Medio de pago</h3>
            <p className="text-xs text-gray-400 mb-4">Completá la transferencia antes de confirmar la orden.</p>
            <PaymentTabs selected={paymentMethod} onSelect={setPaymentMethod} country={country} />
          </div>

          {/* ── Row 3: Comprobante + Submit ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-1">
                Adjuntá tu comprobante <span className="text-red-500">*</span>
              </h3>
              <p className="text-xs text-gray-400 mb-4">JPG, PNG o PDF · Máx. 10 MB</p>
              <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
                receiptFile ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={e => setReceiptFile(e.target.files?.[0] ?? null)}
                />
                {receiptFile ? (
                  <>
                    <span className="text-2xl">✅</span>
                    <span className="text-sm font-medium text-purple-700 text-center">{receiptFile.name}</span>
                    <span className="text-xs text-gray-400">Hacé clic para cambiar</span>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                    <span className="text-sm text-gray-500">Hacé clic para subir el comprobante</span>
                  </>
                )}
              </label>
            </div>

            <div className="flex flex-col justify-between gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-600 space-y-2">
                <p>📁 <strong>¿Cómo recibís el acceso?</strong> Confirmado el pago, te enviamos el link de tu carpeta privada de Google Drive con todos los videos. El acceso es permanente.</p>
                <p>⏱ <strong>Tiempo:</strong> menos de 24 hs hábiles desde que recibimos el comprobante.</p>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-base transition-colors"
              >
                {loading ? 'Enviando...' : `Confirmar orden — $${total} USD →`}
              </button>
              <p className="text-center text-xs text-gray-400">
                Al confirmar, tu orden queda registrada. El acceso se envía una vez verificado el pago.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ─── SUCCESS ─── */}
      {formState === 'success' && (
        <section className="max-w-lg mx-auto px-6 py-24 text-center animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">¡Orden registrada!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Tu orden fue enviada con éxito. Una vez que confirmemos tu pago (<strong>menos de 24 hs hábiles</strong>), te enviamos los links de acceso a <strong>{customerEmail}</strong>.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800 text-left space-y-1">
              <p>📁 Recibirás un email con los links de Google Drive para cada especialización.</p>
              <p>💬 ¿Dudas? Escribinos a <strong>pagos@t2tacademy.com</strong></p>
            </div>
          </div>
        </section>
      )}

      {/* ─── FLOATING CART BAR ─── */}
      {itemCount > 0 && formState === 'catalog' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in">
          <div className="bg-[#0A0A0F] border-t border-purple-900/50 px-4 py-3 sm:px-6 sm:py-4">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="text-white">
                <span className="font-bold text-purple-400 text-base sm:text-lg">
                  {itemCount} especialización{itemCount > 1 ? 'es' : ''}
                </span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-white font-extrabold text-lg sm:text-xl">${total} USD</span>
              </div>
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setSelections({})}
                  className="text-gray-500 hover:text-gray-300 text-sm transition-colors whitespace-nowrap"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => {
                    setFormState('checkout')
                    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100)
                  }}
                  className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-center text-sm sm:text-base"
                >
                  Continuar con la compra →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {itemCount > 0 && formState === 'catalog' && <div className="h-24" />}

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0A0A0F] text-gray-500 text-center py-8 text-sm border-t border-gray-800">
        <p className="mb-1">
          <span className="text-purple-400 font-semibold">T2T Academy</span> · Catálogo Supply Chain
        </p>
        <p>
          ¿Consultas?{' '}
          <a href="mailto:pagos@t2tacademy.com" className="text-purple-400 hover:text-purple-300">
            pagos@t2tacademy.com
          </a>
        </p>
      </footer>
    </div>
  )
}
