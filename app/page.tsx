'use client'

import { useState } from 'react'
import { CATEGORIES, TierKey, getLevelTotals, minutesToLabel } from '@/lib/courses'
import CategoryRow from '@/components/CategoryRow'
import PaymentTabs, { PaymentMethod } from '@/components/PaymentTabs'

type Selections = Record<string, TierKey>
type FormState = 'catalog' | 'checkout' | 'success'

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mercadopago: 'Mercado Pago',
  transferencia: 'Transferencia bancaria AR',
  paypal: 'PayPal',
  internacional: 'Transferencia internacional',
}

export default function Home() {
  const [selections, setSelections] = useState<Selections>({})
  const [formState, setFormState] = useState<FormState>('catalog')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedEntries = Object.entries(selections)
  const itemCount = selectedEntries.length

  const total = selectedEntries.reduce((sum, [catId, tier]) => {
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

    setError('')
    setLoading(true)

    const selectionsPayload = selectedEntries.map(([catId, tier]) => {
      const cat = CATEGORIES.find(c => c.id === catId)!
      return { categoryId: catId, tier, price: cat.tiers[tier].price }
    })

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          selections: selectionsPayload,
          paymentMethod,
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
    <div className="min-h-screen bg-[#FAF7F0]">

      {/* ─── HERO ─── */}
      <section className="bg-[#0A0A0F] text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900 opacity-20 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-800 opacity-15 rounded-full blur-3xl translate-y-1/2" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="inline-block bg-purple-900/40 border border-purple-700/50 text-purple-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            T2T Academy · Supply Chain
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Catálogo{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">
              Supply Chain
            </span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Formación práctica basada en experiencia real. Elegí las especializaciones que necesitás y accedé a tu contenido al instante.
          </p>
          <div className="flex flex-wrap justify-center gap-10 mb-10">
            {[
              { num: '158', label: 'cursos disponibles' },
              { num: '9', label: 'especializaciones' },
              { num: '30+', label: 'años de experiencia' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-purple-400">{stat.num}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
          <a href="#catalogo" className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg">
            Ver especializaciones →
          </a>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-white border-y border-amber-100 py-14">
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
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Especializaciones disponibles</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Seleccioná el nivel dentro de cada especialización. Pro y Expert incluyen todos los niveles anteriores con descuento acumulado.
            </p>
          </div>

          {/* Global level cards */}
          <div className="mb-3">
            <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase mb-3 text-center">
              Comprá todo el catálogo de una vez — o seleccioná categorías individuales abajo
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
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
                    className="bg-white rounded-2xl border-2 border-gray-100 p-4 text-left hover:border-amber-300 hover:shadow-md transition-all group"
                  >
                    <div className="text-amber-600 font-bold text-xs tracking-wide mb-2">
                      {ICONS[tier]} {NAMES[tier]}
                    </div>
                    <div className="font-extrabold text-2xl text-amber-600 leading-none mb-1">
                      ${totals.price}
                      <span className="text-xs font-normal text-gray-400 ml-1">USD</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-2">
                      <span className="text-xs text-gray-400 line-through">Lista ${totals.listPrice}</span>
                      <span className="text-xs font-semibold text-emerald-600">Ahorrás {savingsPct}%</span>
                    </div>
                    <p className="text-xs text-gray-400">{totals.courses} cursos · {minutesToLabel(totals.minutes)}</p>
                    <p className="text-xs text-amber-600 font-semibold mt-2 group-hover:underline">Aplicar a todas →</p>
                  </button>
                )
              })}
            </div>
            {itemCount > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => setSelections({})}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Limpiar selección
                </button>
              </div>
            )}
          </div>

          {/* Category rows */}
          <div className="space-y-4">
            {CATEGORIES.map(cat => (
              <CategoryRow
                key={cat.id}
                category={cat}
                selected={selections[cat.id] ?? null}
                onSelect={handleSelect}
              />
            ))}
          </div>

          <div className="mt-6 bg-white border border-amber-100 rounded-xl p-4 text-xs text-gray-500 text-center">
            Los precios ya incluyen descuento acumulado. Pro incluye todos los cursos Starter + los propios. Expert incluye todos los niveles.
          </div>
        </section>
      )}

      {/* ─── CHECKOUT ─── */}
      {formState === 'checkout' && (
        <section id="checkout-section" className="max-w-3xl mx-auto px-6 pb-24 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setFormState('catalog')}
              className="text-gray-400 hover:text-gray-700 text-sm flex items-center gap-1 transition-colors"
            >
              ← Volver al catálogo
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Completá tu orden</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left: form */}
            <div className="md:col-span-3 space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Tus datos</h3>
                <div className="space-y-4">
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
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="juan@empresa.com"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">Aquí recibirás el link de acceso a tus cursos.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono / WhatsApp (opcional)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="+54 9 11 1234-5678"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Método de pago</h3>
                <PaymentTabs selected={paymentMethod} onSelect={setPaymentMethod} />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-base transition-colors"
              >
                {loading ? 'Enviando...' : `Confirmar orden — $${total.toFixed(2)} USD →`}
              </button>

              <p className="text-center text-xs text-gray-400">
                Al confirmar, tu orden queda registrada. El acceso se envía una vez verificado el pago.
              </p>
            </div>

            {/* Right: order summary */}
            <div className="md:col-span-2">
              <div className="bg-white border border-amber-100 rounded-2xl p-5 sticky top-6">
                <h3 className="font-bold text-gray-900 mb-4">Resumen</h3>
                <div className="space-y-3 mb-4">
                  {selectedEntries.map(([catId, tier]) => {
                    const cat = CATEGORIES.find(c => c.id === catId)!
                    const t = cat.tiers[tier]
                    return (
                      <div key={catId} className="flex justify-between items-start gap-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-800">{cat.name}</p>
                          <p className="text-gray-400 text-xs">{t.label} · {t.courses} cursos · {minutesToLabel(t.minutes)}</p>
                        </div>
                        <span className="font-semibold text-gray-800 flex-shrink-0">${t.price.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-extrabold text-purple-700 text-xl">${total.toFixed(2)} USD</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Método: {PAYMENT_METHOD_LABELS[paymentMethod]}</p>
              </div>
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
          <div className="bg-[#0A0A0F] border-t border-purple-900/50 px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
              <div className="text-white">
                <span className="font-bold text-purple-400 text-lg">
                  {itemCount} especialización{itemCount > 1 ? 'es' : ''}
                </span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-white font-extrabold text-xl">${total.toFixed(2)} USD</span>
              </div>
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setSelections({})}
                  className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => {
                    setFormState('checkout')
                    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100)
                  }}
                  className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
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
