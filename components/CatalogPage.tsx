'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TierKey, minutesToLabel, UpgradeKey } from '@/lib/courses'
import { useCatalog } from '@/components/CatalogProvider'
import CategoryCompareTable from '@/components/CategoryCompareTable'
import PaymentTabs, { PaymentMethod } from '@/components/PaymentTabs'
import TechGrid from '@/components/tc/TechGrid'
import Header from '@/components/tc/Header'
import Hero from '@/components/tc/Hero'
import Authority from '@/components/tc/Authority'
import ForWhom from '@/components/tc/ForWhom'
import HowItWorks from '@/components/tc/HowItWorks'
import Closing from '@/components/tc/Closing'
import Footer from '@/components/tc/Footer'
import WhatsAppFloat from '@/components/tc/WhatsAppFloat'
import CatalogSection, { OptionHeader, CatalogNote } from '@/components/tc/catalog/CatalogSection'
import LevelPallets from '@/components/tc/catalog/LevelPallets'
import UpgradeCards from '@/components/tc/catalog/UpgradeCards'
import Remito, { type RemitoLine } from '@/components/tc/catalog/Remito'
import { SPEC_CODES, TIER_SHORT } from '@/components/tc/catalog/codes'

type Selections = Record<string, TierKey>
type FormState = 'catalog' | 'verify-upgrade' | 'checkout'

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mercadopago:  'Mercado Pago',
  transferencia: 'BBVA Pesos (ARS)',
  'bbva-usd':   'BBVA Dólares (USD)',
  paypal:       'PayPal',
}

export default function CatalogPage() {
  const router = useRouter()
  // Precios, cursos y duraciones vienen del catálogo publicado desde /admin/catalogo
  const { categories: CATEGORIES, bundles: BUNDLE_PRICES, upgrades: UPGRADE_PRICES, uniqueCourses } = useCatalog()
  const getLevelTotals = (tier: TierKey) => BUNDLE_PRICES[tier]
  const [selections, setSelections] = useState<Selections>({})
  const [upgradeType, setUpgradeType] = useState<UpgradeKey | null>(null)
  const [upgradeVerified, setUpgradeVerified] = useState(false)
  const [upgradePrevEmail, setUpgradePrevEmail] = useState('')
  const [upgradeVerifying, setUpgradeVerifying] = useState(false)
  const [upgradeVerifyError, setUpgradeVerifyError] = useState('')
  const [upgradeVerifiedInfo, setUpgradeVerifiedInfo] = useState<{ orderId: string; orderDate: string } | null>(null)
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
      setPaymentMethod('bbva-usd')
    }
  }

  const selectedEntries = Object.entries(selections)
  const itemCount = selectedEntries.length

  // Detect full-bundle selection (all 7 categories at the same tier)
  const bundleTier: TierKey | null = (() => {
    if (selectedEntries.length !== CATEGORIES.length) return null
    const tier = selectedEntries[0]?.[1]
    return selectedEntries.every(([, t]) => t === tier) ? tier as TierKey : null
  })()

  const total = upgradeType
    ? UPGRADE_PRICES[upgradeType].price
    : bundleTier
    ? BUNDLE_PRICES[bundleTier].price
    : selectedEntries.reduce((sum, [catId, tier]) => {
        const cat = CATEGORIES.find(c => c.id === catId)
        return sum + (cat?.tiers[tier]?.price ?? 0)
      }, 0)

  const cartActive = upgradeType !== null || itemCount > 0

  const checkoutWhatsappUrl = (() => {
    const lines: string[] = ['¡Hola Gustavo! Quiero comprar del Catálogo Supply Chain 📚']
    lines.push('')
    if (upgradeType) {
      lines.push(`- ${UPGRADE_PRICES[upgradeType].label} ($${UPGRADE_PRICES[upgradeType].price} USD)`)
    } else if (bundleTier) {
      lines.push(`- Catálogo Completo ${bundleTier === 'starter' ? 'Starter' : bundleTier === 'pro' ? 'Pro' : 'Expert'} ($${BUNDLE_PRICES[bundleTier].price} USD)`)
    } else {
      selectedEntries.forEach(([catId, tier]) => {
        const cat = CATEGORIES.find(c => c.id === catId)
        if (cat) lines.push(`- ${cat.name} ${cat.tiers[tier].label} ($${cat.tiers[tier].price} USD)`)
      })
    }
    lines.push('')
    lines.push(`Total: $${total} USD`)
    lines.push(`Método de pago: ${PAYMENT_METHOD_LABELS[paymentMethod]}`)
    lines.push('')
    lines.push('¿Me podés pasar los datos para pagar?')
    lines.push('')
    lines.push('Una vez que pague, subo el comprobante en la página para activar el acceso. ¡Gracias!')
    return `https://wa.me/5491134030955?text=${encodeURIComponent(lines.join('\n'))}`
  })()

  const handleSelect = (categoryId: string, tier: TierKey | null) => {
    setUpgradeType(null)
    setUpgradeVerified(false)
    setUpgradeVerifiedInfo(null)
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

  const handleVerifyUpgrade = async () => {
    if (!upgradePrevEmail.trim()) {
      setUpgradeVerifyError('Por favor ingresá tu email.')
      return
    }
    setUpgradeVerifying(true)
    setUpgradeVerifyError('')
    try {
      const res = await fetch('/api/verify-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: upgradePrevEmail.trim(), upgradeType }),
      })
      const data = await res.json()
      if (data.verified) {
        setUpgradeVerified(true)
        setUpgradeVerifiedInfo({ orderId: data.orderId, orderDate: data.orderDate })
        setCustomerEmail(upgradePrevEmail.trim())
        setFormState('checkout')
        setTimeout(() => document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
      } else {
        setUpgradeVerifyError(
          `No encontramos una compra aprobada del nivel ${UPGRADE_PRICES[upgradeType!].from} para ese email. Revisá que sea el mismo email con el que compraste, o contactanos a t2tscacademy@gmail.com`
        )
      }
    } catch {
      setUpgradeVerifyError('Error de conexión. Intentá de nuevo.')
    } finally {
      setUpgradeVerifying(false)
    }
  }

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setError('Por favor completá nombre, email y WhatsApp.')
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
    if (receiptFile.size > 3 * 1024 * 1024) {
      setError('El comprobante supera los 3 MB. Probá con una captura o un PDF más liviano.')
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

      const upgradePayload = upgradeType ? {
        upgradeType,
        upgradeLabel: UPGRADE_PRICES[upgradeType].label,
        upgradePrice: UPGRADE_PRICES[upgradeType].price,
      } : {}

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          selections: upgradeType ? [] : selectionsPayload,
          paymentMethod,
          bundlePrice: upgradeType
            ? UPGRADE_PRICES[upgradeType].price
            : bundleTier ? BUNDLE_PRICES[bundleTier].price : undefined,
          ...upgradePayload,
          receiptBase64,
          receiptContentType: receiptFile.type,
          receiptFileName: receiptFile.name,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(res.status === 400 && data?.error ? data.error : 'Hubo un error al enviar tu orden. Por favor intentá de nuevo.')
        return
      }
      router.push('/gracias')
    } catch {
      setError('Hubo un error al enviar tu orden. Por favor intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const clearCart = () => {
    setSelections({})
    setUpgradeType(null)
    setUpgradeVerified(false)
    setUpgradeVerifiedInfo(null)
    setUpgradePrevEmail('')
  }

  const continueCheckout = () => {
    if (upgradeType && !upgradeVerified) {
      setFormState('verify-upgrade')
      setTimeout(() => document.getElementById('verify-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } else {
      setFormState('checkout')
      setTimeout(() => document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  const pickLevel = (tier: TierKey) => {
    setUpgradeType(null)
    setUpgradeVerified(false)
    setUpgradeVerifiedInfo(null)
    const next: Record<string, TierKey> = {}
    CATEGORIES.forEach(c => { next[c.id] = tier })
    setSelections(next)
  }

  const pickUpgrade = (key: UpgradeKey) => {
    const isActive = upgradeType === key
    setSelections({})
    setUpgradeVerified(false)
    setUpgradeVerifiedInfo(null)
    setUpgradePrevEmail('')
    setUpgradeVerifyError('')
    setUpgradeType(isActive ? null : key)
  }

  // Líneas del remito — solo presentación de lo que ya calcula la página
  const remitoLines: RemitoLine[] = upgradeType
    ? [{
        key: 'upg',
        code: upgradeType === 'starter-to-pro' ? 'UPG-01' : 'UPG-02',
        label: UPGRADE_PRICES[upgradeType].label,
        sub: 'Catálogo completo · requiere verificar tu compra anterior',
        price: UPGRADE_PRICES[upgradeType].price,
        onRemove: clearCart,
      }]
    : bundleTier
    ? [{
        key: 'cat',
        code: 'CAT-' + TIER_SHORT[bundleTier],
        label: 'Catálogo completo · ' + CATEGORIES[0].tiers[bundleTier].label,
        sub: `${CATEGORIES.length} especializaciones · ${getLevelTotals(bundleTier).courses} cursos · ${minutesToLabel(getLevelTotals(bundleTier).minutes)}`,
        price: BUNDLE_PRICES[bundleTier].price,
        listPrice: BUNDLE_PRICES[bundleTier].listPrice,
        onRemove: () => setSelections({}),
      }]
    : selectedEntries.map(([catId, tier]) => {
        const cat = CATEGORIES.find(c => c.id === catId)!
        const t = cat.tiers[tier]
        return {
          key: catId,
          code: `${SPEC_CODES[catId] ?? catId} · ${TIER_SHORT[tier]}`,
          label: `${cat.name} · ${t.label}`,
          sub: `${t.courses} cursos · ${minutesToLabel(t.minutes)}`,
          price: t.price,
          listPrice: t.listPrice,
          onRemove: () => handleSelect(catId, null),
        }
      })

  const remitoListTotal = remitoLines.reduce((sum, l) => sum + (l.listPrice ?? l.price), 0)

  const inputCls = 'w-full bg-tc-bg-2 border border-white/15 px-4 py-3 text-sm text-tc-text placeholder:text-tc-text-2/60 focus:outline-none focus:border-tc-violet focus:ring-1 focus:ring-tc-violet'
  const labelCls = 'block font-mono text-[11px] tracking-[.12em] uppercase text-tc-text-2 mb-2'
  const panelCls = 'border border-white/10 bg-tc-surface/80 p-6'

  return (
    <div className="relative min-h-screen bg-tc-bg text-tc-text overflow-x-clip">
      <TechGrid />
      <Header stock={uniqueCourses} />

      <main className="relative">
        <Hero
          stats={[
            { value: uniqueCourses, suffix: '', label: 'Cursos únicos', code: 'M-01' },
            { value: CATEGORIES.length, suffix: '', label: 'Especializaciones', code: 'M-02' },
            { value: 32, suffix: '+', label: 'Años en supply chain', code: 'M-03' },
            { value: 16, suffix: '+', label: 'Años como director / asesor', code: 'M-04' },
          ]}
        />
        <Authority />
        <ForWhom />
        <HowItWorks />

        <CatalogSection
          remito={
            <Remito
              lines={remitoLines}
              total={total}
              listTotal={remitoListTotal}
              onClear={clearCart}
              onContinue={continueCheckout}
              ctaLabel={upgradeType && !upgradeVerified ? 'Verificar y continuar →' : 'Continuar con la compra →'}
              note="Después cargás tus datos, coordinás el pago y adjuntás el comprobante."
              mobileHidden={formState !== 'catalog'}
            />
          }
        >
          <OptionHeader n={1} title="Catálogo completo por nivel" text="Elegí un nivel y llevate las 7 especializaciones. El precio ya incluye el ~50% de descuento." />
          <LevelPallets activeTier={upgradeType === null ? bundleTier : null} onPick={pickLevel} />
          <UpgradeCards activeUpgrade={upgradeType} onPick={pickUpgrade} />

          <OptionHeader n={2} title="Por especialización y nivel" text="Elegí la especialización y compará los niveles. Seleccioná el que querés agregar." />
          <CategoryCompareTable selections={selections} onSelect={handleSelect} />
          <CatalogNote />
        </CatalogSection>

        {/* ─── VERIFY UPGRADE ─── */}
        {formState === 'verify-upgrade' && upgradeType && (
          <section id="verify-section" className="relative px-5 sm:px-8 py-20 animate-fade-in">
            <div className="max-w-lg mx-auto">
              <button
                onClick={() => setFormState('catalog')}
                className="font-mono text-xs tracking-[.12em] text-tc-text-2 hover:text-tc-text transition-colors mb-8"
              >
                ← VOLVER AL CATÁLOGO
              </button>

              <div className="border border-tc-hazard/60 bg-tc-surface/90 p-8">
                <p className="font-mono text-[11px] tracking-[.14em] text-tc-hazard mb-3">CONTROL DE ORIGEN · {upgradeType === 'starter-to-pro' ? 'UPG-01' : 'UPG-02'}</p>
                <h2 className="font-display text-3xl font-bold tracking-tight mb-3">
                  Verificá tu compra anterior
                </h2>
                <p className="text-tc-text-2 text-sm mb-6 leading-relaxed">
                  Para acceder al precio de <span className="font-semibold text-tc-hazard">{UPGRADE_PRICES[upgradeType].label}</span>, verificamos que tengas el nivel <strong className="text-tc-text">{UPGRADE_PRICES[upgradeType].from}</strong> activo.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>
                      Email con el que compraste el nivel {UPGRADE_PRICES[upgradeType].from}
                    </label>
                    <input
                      type="email"
                      value={upgradePrevEmail}
                      onChange={e => { setUpgradePrevEmail(e.target.value); setUpgradeVerifyError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleVerifyUpgrade()}
                      placeholder="tu@email.com"
                      className={inputCls}
                    />
                  </div>

                  {upgradeVerifyError && (
                    <div className="border border-red-400/50 bg-red-500/10 text-red-300 p-3 text-sm leading-relaxed">
                      {upgradeVerifyError}
                    </div>
                  )}

                  <button
                    onClick={handleVerifyUpgrade}
                    disabled={upgradeVerifying}
                    className="w-full bg-tc-hazard hover:brightness-110 disabled:opacity-60 text-tc-ink font-display font-bold py-3.5 transition"
                  >
                    {upgradeVerifying ? 'Verificando...' : 'Verificar compra anterior →'}
                  </button>
                </div>

                <p className="text-xs text-tc-text-2 text-center mt-5">
                  ¿Problemas? Contactanos a{' '}
                  <a href="mailto:t2tscacademy@gmail.com" className="text-tc-hazard hover:underline">
                    t2tscacademy@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ─── CHECKOUT ─── */}
        {formState === 'checkout' && (
          <section id="checkout-section" className="relative px-5 sm:px-8 pt-16 pb-28 animate-fade-in">
            <div className="max-w-5xl mx-auto">
              <button
                onClick={() => setFormState('catalog')}
                className="font-mono text-xs tracking-[.12em] text-tc-text-2 hover:text-tc-text transition-colors mb-8"
              >
                ← VOLVER AL CATÁLOGO
              </button>
              <p className="font-mono text-[11px] tracking-[.14em] text-tc-violet-2 mb-2">HOJA DE DESPACHO</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-8">Completá tu orden</h2>

              {/* ── Steps indicator ── */}
              {(() => {
                const datosOk = customerName.trim() !== '' && customerEmail.trim() !== '' && customerPhone.trim() !== ''
                const activeStep = receiptFile ? 3 : datosOk ? 2 : 1
                return (
                  <div className="flex items-center mb-10">
                    {[
                      { n: 1, label: 'Tus datos' },
                      { n: 2, label: 'Medio de pago' },
                      { n: 3, label: 'Comprobante' },
                    ].map((s, i) => {
                      const done = s.n < activeStep
                      const current = s.n === activeStep
                      return (
                        <div key={s.n} className="flex items-center flex-1 last:flex-none">
                          <div className="flex items-center gap-2 shrink-0">
                            <div className={`w-8 h-8 grid place-items-center font-mono text-xs font-bold border transition-colors ${
                              done    ? 'bg-tc-green border-tc-green text-tc-ink' :
                              current ? 'bg-tc-violet border-tc-violet text-tc-ink shadow-[0_0_18px_rgba(168,85,247,.45)]' :
                                        'border-white/15 text-tc-text-2'
                            }`}>
                              {done ? '✓' : '0' + s.n}
                            </div>
                            <span className={`font-mono text-[11px] tracking-[.12em] uppercase hidden sm:block transition-colors ${
                              current ? 'text-tc-violet-2' : done ? 'text-tc-green' : 'text-tc-text-2'
                            }`}>{s.label}</span>
                          </div>
                          {i < 2 && <div className={`flex-1 h-px mx-3 transition-colors ${done ? 'bg-tc-green/60' : 'bg-white/10'}`} />}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* ── Row 1: Datos + Resumen ── */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                <div className={`md:col-span-3 ${panelCls}`}>
                  <h3 className="font-display text-xl font-bold mb-5">Tus datos</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>
                          Nombre completo <span className="text-tc-hazard">*</span>
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          placeholder="Juan García"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          WhatsApp <span className="text-tc-hazard">*</span>
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          placeholder="+54 9 11 ..."
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>
                          Email <span className="text-tc-hazard">*</span>
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={e => !upgradeVerified && setCustomerEmail(e.target.value)}
                          placeholder="juan@empresa.com"
                          readOnly={upgradeVerified}
                          className={`${inputCls} ${upgradeVerified ? 'opacity-60 cursor-not-allowed' : ''}`}
                        />
                        {upgradeVerified ? (
                          <p className="text-xs text-tc-green font-semibold mt-1.5">✓ Email verificado — debe coincidir con tu compra anterior.</p>
                        ) : (
                          <p className="text-xs text-tc-text-2 mt-1.5">Aquí recibirás el link de acceso.</p>
                        )}
                      </div>
                      <div>
                        <label className={labelCls}>País</label>
                        <select
                          value={country}
                          onChange={e => handleCountryChange(e.target.value as 'argentina' | 'internacional')}
                          className={inputCls}
                        >
                          <option value="argentina">Argentina</option>
                          <option value="internacional">Otro país</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-tc-paper text-tc-ink border border-black/20 p-5">
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="font-display text-xl font-bold">Resumen</h3>
                    <span className="font-mono text-[10px] tracking-[.14em] text-tc-ink-2">REMITO</span>
                  </div>
                  <div className="space-y-3 mb-4">
                    {upgradeType ? (
                      <div className="flex justify-between items-start gap-2 text-sm">
                        <div>
                          <p className="font-semibold">{UPGRADE_PRICES[upgradeType].label}</p>
                          <p className="text-tc-ink-2 text-xs">Catálogo completo · 7 especializaciones</p>
                          {upgradeVerifiedInfo && (
                            <p className="text-xs text-tc-green-ink font-semibold mt-0.5">
                              ✓ Compra anterior verificada · {upgradeVerifiedInfo.orderDate}
                            </p>
                          )}
                        </div>
                        <span className="font-mono font-bold shrink-0">USD {UPGRADE_PRICES[upgradeType].price}</span>
                      </div>
                    ) : bundleTier ? (
                      <div className="flex justify-between items-start gap-2 text-sm">
                        <div>
                          <p className="font-semibold">Catálogo Completo</p>
                          <p className="text-tc-ink-2 text-xs">
                            {bundleTier === 'starter' ? 'Starter' : bundleTier === 'pro' ? 'Pro' : 'Expert'} · 7 especializaciones · {minutesToLabel(getLevelTotals(bundleTier).minutes)}
                          </p>
                        </div>
                        <span className="font-mono font-bold shrink-0">USD {BUNDLE_PRICES[bundleTier].price}</span>
                      </div>
                    ) : (
                      selectedEntries.map(([catId, tier]) => {
                        const cat = CATEGORIES.find(c => c.id === catId)!
                        const t = cat.tiers[tier]
                        return (
                          <div key={catId} className="flex justify-between items-start gap-2 text-sm">
                            <div>
                              <p className="font-semibold">{cat.name}</p>
                              <p className="text-tc-ink-2 text-xs">{t.label} · {t.courses} cursos · {minutesToLabel(t.minutes)}</p>
                            </div>
                            <span className="font-mono font-bold shrink-0">USD {t.price}</span>
                          </div>
                        )
                      })
                    )}
                  </div>
                  <div className="border-t border-dashed border-black/30 pt-3 flex justify-between items-center">
                    <span className="font-mono text-xs tracking-[.14em]">TOTAL</span>
                    <span className="font-display font-bold text-2xl text-tc-violet-ink">USD {total}</span>
                  </div>
                  <p className="font-mono text-[11px] text-tc-ink-2 mt-2">MÉTODO: {PAYMENT_METHOD_LABELS[paymentMethod].toUpperCase()}</p>
                </div>
              </div>

              {/* ── Row 2: Medio de pago ── */}
              <div className={`${panelCls} mb-6`}>
                <h3 className="font-display text-xl font-bold mb-1">Medio de pago</h3>
                <p className="text-xs text-tc-text-2 mb-5">Elegí tu método y escribinos por WhatsApp para recibir los datos de transferencia.</p>
                <PaymentTabs selected={paymentMethod} onSelect={setPaymentMethod} country={country} whatsappUrl={checkoutWhatsappUrl} />
              </div>

              {/* ── Row 3: Comprobante + Submit ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={panelCls}>
                  <h3 className="font-display text-xl font-bold mb-1">
                    Adjuntá tu comprobante <span className="text-tc-hazard">*</span>
                  </h3>
                  <p className="font-mono text-[11px] tracking-[.1em] text-tc-text-2 mb-4">JPG, PNG O PDF · MÁX. 3 MB</p>
                  <label className={`flex flex-col items-center justify-center gap-3 border border-dashed p-8 cursor-pointer transition-colors ${
                    receiptFile ? 'border-tc-green bg-tc-green/5' : 'border-white/20 hover:border-tc-violet hover:bg-tc-violet/5'
                  }`}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
                      className="sr-only"
                      onChange={e => setReceiptFile(e.target.files?.[0] ?? null)}
                    />
                    {receiptFile ? (
                      <>
                        <span className="font-mono text-xs tracking-[.14em] text-tc-green">✓ ADJUNTO</span>
                        <span className="text-sm font-medium text-tc-text text-center break-all">{receiptFile.name}</span>
                        <span className="text-xs text-tc-text-2">Hacé clic para cambiar</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-tc-text-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                        </svg>
                        <span className="text-sm text-tc-text-2">Hacé clic para subir el comprobante</span>
                      </>
                    )}
                  </label>
                </div>

                <div className="flex flex-col justify-between gap-4">
                  <div className="border border-white/10 bg-tc-bg-2 p-5 text-sm text-tc-text-2 space-y-2.5">
                    <p><span className="font-mono text-[11px] text-tc-violet-2 mr-2">ACCESO</span><strong className="text-tc-text">¿Cómo recibís el acceso?</strong> Confirmado el pago, te enviamos el link de tu carpeta de Google Drive con todos los videos.</p>
                    <p><span className="font-mono text-[11px] text-tc-violet-2 mr-2">VENTANA</span>Tenés <strong className="text-tc-text">3 meses para descargar</strong> los videos desde la fecha de activación.</p>
                    <p><span className="font-mono text-[11px] text-tc-violet-2 mr-2">LEAD TIME</span>Menos de 24 hs hábiles desde que recibimos el comprobante.</p>
                  </div>
                  {error && (
                    <div className="border border-red-400/50 bg-red-500/10 text-red-300 p-3 text-sm">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-tc-violet hover:bg-tc-violet-2 disabled:opacity-60 text-tc-ink font-display font-bold py-4 text-base transition-colors shadow-[0_0_32px_rgba(168,85,247,.4)]"
                  >
                    {loading ? 'Enviando...' : `Confirmar orden — USD ${total} →`}
                  </button>
                  <p className="text-center text-xs text-tc-text-2">
                    Al confirmar, tu orden queda registrada. El acceso se envía una vez verificado el pago.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <Closing />
      </main>

      <Footer extraBottomPadding={cartActive && formState === 'catalog'} />
      <WhatsAppFloat raised={cartActive && formState === 'catalog'} />
    </div>
  )
}
