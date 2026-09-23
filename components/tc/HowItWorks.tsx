'use client'

import { useEffect, useRef, useState } from 'react'

const STEPS = [
  {
    n: '01',
    title: 'Elegí tu camino',
    text: 'Seleccioná una o varias especializaciones y el nivel (Starter, Pro o Expert) que necesitás.',
    chips: ['▲ STARTER', '▲▲ PRO', '▲▲▲ EXPERT'],
  },
  {
    n: '02',
    title: 'Coordiná el pago',
    text: 'Escribinos por WhatsApp para recibir los datos de pago. Aceptamos Mercado Pago, transferencia bancaria y PayPal.',
    chips: ['MERCADO PAGO', 'TRANSFERENCIA', 'PAYPAL'],
  },
  {
    n: '03',
    title: 'Descargá tus cursos',
    text: 'En menos de 24 hs hábiles te enviamos el link de Google Drive. Tenés 3 meses para descargar todos los videos.',
    chips: ['LEAD TIME < 24 HS', 'VENTANA 3 MESES'],
  },
]

const ICONS = [
  <svg key="i1" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <rect x="3" y="4" width="4" height="4" />
    <rect x="17" y="16" width="4" height="4" />
    <path d="M7 6h7a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h7" />
  </svg>,
  <svg key="i2" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <rect x="3" y="6" width="18" height="12" />
    <path d="M3 10h18M7 15h4" />
  </svg>,
  <svg key="i3" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path d="M12 4v11M7 10l5 5 5-5M4 19h16" />
  </svg>,
]

const STEP_POS = [1 / 6, 0.5, 5 / 6]

export default function HowItWorks() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const beltWideRef = useRef<HTMLDivElement>(null)
  const beltNarrowRef = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)
  const motionRef = useRef(true)

  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    motionRef.current = !reduced

    const onScroll = () => {
      const el = wrapRef.current
      if (!el) return
      if (!motionRef.current) {
        setP(1)
        return
      }
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      let np = (vh * 0.85 - r.top) / (r.height * 0.9 + vh * 0.25)
      np = Math.max(0, Math.min(1, np))
      setP(np)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    let raf: number | null = null
    if (motionRef.current) {
      const loop = (ts: number) => {
        const o = (ts / 45) % 22
        if (beltWideRef.current) beltWideRef.current.style.backgroundPosition = `${o}px 0`
        if (beltNarrowRef.current) beltNarrowRef.current.style.backgroundPosition = `0 ${o}px`
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const steps = STEPS.map((step, i) => {
    const pos = STEP_POS[i]
    const st = p < pos - 0.1 ? 0 : p > pos + 0.1 ? 2 : 1
    const status = ['○ EN ESPERA', '● EN PROCESO', '✓ COMPLETO'][st]
    const sc = ['#9AA1B1', '#7E22CE', '#4ADE80'][st]
    const bd = st === 1 ? '#EDEAE2' : st === 2 ? 'rgba(74,222,128,.35)' : 'rgba(255,255,255,.08)'
    const bg = st === 1 ? '#EDEAE2' : 'rgba(22,24,28,.85)'
    const fg = st === 1 ? '#0B0D12' : '#E8EAF0'
    const fg2 = st === 1 ? '#4A4F5C' : '#9AA1B1'
    const ic = st === 1 ? '#7E22CE' : '#C084FC'
    const chb = st === 1 ? 'rgba(11,13,18,.22)' : 'rgba(255,255,255,.12)'
    return { ...step, st, status, sc, bd, bg, fg, fg2, ic, chb, icon: ICONS[i] }
  })

  const boxPos = (p * 100).toFixed(2) + '%'

  return (
    <section id="como" className="relative px-5 py-16 sm:px-8 md:px-14 md:py-24" style={{ background: 'var(--tc-bg)' }}>
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-4"
        style={{ background: 'repeating-linear-gradient(-45deg,#FFB020 0 12px,#0B0D12 12px 24px)' }}
      />
      <div className="mx-auto max-w-[1320px]">
        <div
          className="mb-9 flex items-center justify-between gap-4 border-t border-white/[.12] pt-3.5 font-mono text-[11px] font-medium tracking-[.14em] text-tc-text-2"
        >
          <span>
            <span className="text-tc-violet-2">§04</span> — LÍNEA DE DESPACHO
          </span>
          <span>3 ESTACIONES</span>
        </div>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-16">
          <h2 className="m-0 font-display font-bold leading-[.9] tracking-[-.05em]" style={{ fontSize: 'clamp(44px,6.4vw,100px)' }}>
            ¿Cómo funciona?
          </h2>
          <p className="m-0 max-w-[380px] text-[17px] leading-[1.55] text-tc-text-2">
            Tres estaciones, un lead time de 24 hs hábiles. Sin vueltas, sin quiebre.
          </p>
        </div>

        <div ref={wrapRef} className="relative">
          {/* wide belt (horizontal) */}
          <div className="relative mb-7 hidden h-11 border-y border-white/[.14] min-[900px]:block">
            <div
              ref={beltWideRef}
              className="absolute inset-y-1.5 inset-x-0"
              style={{ backgroundImage: 'repeating-linear-gradient(90deg,rgba(255,255,255,.1) 0 2px,transparent 2px 22px)' }}
            />
            <div
              className="absolute top-1/2 grid h-[30px] w-[52px] -translate-y-1/2 -translate-x-1/2 place-items-center bg-tc-violet font-mono text-[10px] font-bold tracking-[.06em] text-tc-bg"
              style={{ left: boxPos, boxShadow: '0 0 24px rgba(168,85,247,.55)' }}
            >
              PED
            </div>
          </div>

          {/* narrow belt (vertical rail) */}
          <div className="absolute bottom-0 left-0 top-0 w-[22px] border-x border-white/[.14] min-[900px]:hidden">
            <div
              ref={beltNarrowRef}
              className="absolute inset-x-[5px] inset-y-0"
              style={{ backgroundImage: 'repeating-linear-gradient(180deg,rgba(255,255,255,.1) 0 2px,transparent 2px 22px)' }}
            />
            <div
              className="absolute left-1/2 h-[26px] w-[18px] -translate-x-1/2 -translate-y-1/2 bg-tc-violet"
              style={{ top: boxPos, boxShadow: '0 0 18px rgba(168,85,247,.55)' }}
            />
          </div>

          <ol
            className="m-0 grid list-none gap-4 p-0"
            style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))' }}
          >
            {steps.map((step) => (
              <li
                key={step.n}
                className="relative ml-10 flex flex-col gap-4.5 border p-6 transition-colors duration-300 min-[900px]:ml-0"
                style={{ borderColor: step.bd, background: step.bg, color: step.fg }}
              >
                <div className="flex items-center justify-between font-mono text-[11px] font-medium tracking-[.12em]">
                  <span style={{ color: step.fg2 }}>EST. {step.n}</span>
                  <span style={{ color: step.sc }}>{step.status}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="grid h-[52px] w-[52px] flex-none place-items-center border-[1.5px]"
                    style={{ borderColor: step.ic, color: step.ic }}
                  >
                    {step.icon}
                  </span>
                  <h3 className="m-0 font-display text-[22px] font-semibold leading-[1.1] tracking-[-.02em] md:text-[26px]">
                    {step.title}
                  </h3>
                </div>
                <p className="m-0 text-[15.5px] leading-[1.55]" style={{ color: step.fg2 }}>
                  {step.text}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {step.chips.map((ch) => (
                    <span
                      key={ch}
                      className="border px-2.5 py-1.5 font-mono text-[11px] font-medium tracking-[.06em]"
                      style={{ borderColor: step.chb, color: 'inherit' }}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
