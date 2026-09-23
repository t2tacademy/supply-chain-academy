'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import RouteMap from './RouteMap'

const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const fmt = (n: number) => n.toLocaleString('es-AR')

const CERTS = [
  { n: '001', title: 'Ex Director de Supply Chain', origin: 'UNILEVER LATAM' },
  { n: '002', title: 'Director de Ingeniería Industrial', origin: 'ITBA' },
  { n: '003', title: 'Consultor en supply chain', origin: 'INDUSTRIA LATAM' },
  { n: '004', title: 'Speaker · 150+ conferencias', origin: '20+ PAÍSES' },
]

const STATS = [
  { v: 32, s: '+', label: 'Años en supply chain' },
  { v: 16, s: '+', label: 'Años como director / asesor' },
  { v: 12500, s: '+', label: 'Seguidores en LinkedIn' },
]

const COUNTRIES = [
  { flag: '/tc/flag-ar.png', name: 'Argentina' },
  { flag: '/tc/flag-mx.png', name: 'México' },
  { flag: '/tc/flag-co.png', name: 'Colombia' },
  { flag: '/tc/flag-pe.png', name: 'Perú' },
  { flag: '/tc/flag-cl.png', name: 'Chile' },
  { flag: '/tc/flag-uy.png', name: 'Uruguay' },
  { flag: '/tc/flag-br.png', name: 'Brasil' },
]

export default function Authority() {
  const sectionRef = useRef<HTMLElement>(null)
  const [authT, setAuthT] = useState(1)

  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    // One-time reset before the count-up animation starts (mirrors componentDidMount in the source design).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthT(0)
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          io.unobserve(entry.target)
          const t0 = performance.now()
          const step = (ts: number) => {
            const t = Math.min(1, (ts - t0) / 1700)
            setAuthT(t)
            if (t < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        })
      },
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const ae = ease(authT)

  return (
    <section
      id="autoridad"
      ref={sectionRef}
      className="relative overflow-hidden px-5 py-16 sm:px-8 md:px-14 md:py-24"
      style={{
        backgroundColor: '#EDEAE2',
        color: '#0B0D12',
        backgroundImage:
          'linear-gradient(rgba(11,13,18,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(11,13,18,.05) 1px,transparent 1px)',
        backgroundSize: '64px 64px',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-3 w-full"
        style={{ background: 'radial-gradient(circle at 10px 0,#07080B 7px,transparent 7.5px) 0 0/20px 12px repeat-x' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[4vw] top-5 whitespace-nowrap font-display font-bold leading-[.8] tracking-[-.06em] text-transparent md:top-14"
        style={{ fontSize: 'clamp(120px,21vw,320px)', WebkitTextStroke: '1.5px rgba(11,13,18,.12)' }}
      >
        32 AÑOS
      </div>

      <div className="relative mx-auto max-w-[1320px]">
        <div
          className="mb-9 flex items-center justify-between gap-4 border-t pt-3.5 font-mono text-[11px] font-medium tracking-[.14em]"
          style={{ borderColor: 'rgba(11,13,18,.2)', color: '#4A4F5C' }}
        >
          <span>
            <span style={{ color: '#7E22CE' }}>§02</span> — CERTIFICADO DE ORIGEN
          </span>
          <span className="hidden sm:inline">S 34°36′ · W 58°22′</span>
        </div>

        <div className="grid items-start gap-8 md:gap-16" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))' }}>
          <figure className="m-0 flex flex-col gap-3">
            <div
              className="relative overflow-hidden border"
              style={{ aspectRatio: '4/5', borderColor: 'rgba(11,13,18,.2)', background: 'var(--tc-surface)' }}
            >
              <Image
                src="/gustavo.png"
                alt="Gustavo Rodríguez"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover object-top"
                style={{ filter: 'grayscale(1) contrast(1.15)' }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(160deg,#7E22CE 0%,#6B21A8 55%,#1a0b2e 100%)', mixBlendMode: 'multiply' }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(180deg,rgba(168,85,247,.18),transparent 40%)', mixBlendMode: 'screen' }}
              />
              <div aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-[22px] w-[22px] border-l-[1.5px] border-t-[1.5px] border-tc-text" />
              <div aria-hidden="true" className="pointer-events-none absolute right-3 top-3 h-[22px] w-[22px] border-r-[1.5px] border-t-[1.5px] border-tc-text" />
              <div aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 h-[22px] w-[22px] border-b-[1.5px] border-r-[1.5px] border-tc-text" />
            </div>
            <figcaption
              className="flex items-center justify-between gap-3 font-mono text-[11px] tracking-[.1em]"
              style={{ color: '#4A4F5C' }}
            >
              <span>FIG. 01 — GUSTAVO RODRÍGUEZ</span>
              <span>ORIGEN: BUE, AR</span>
            </figcaption>
          </figure>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3.5">
              <p className="m-0 font-mono text-xs font-medium tracking-[.14em]" style={{ color: '#7E22CE' }}>
                ¿QUIÉN ESTÁ DETRÁS DEL CATÁLOGO?
              </p>
              <h2
                className="m-0 font-display font-bold leading-[.92] tracking-[-.045em]"
                style={{ fontSize: 'clamp(44px,6vw,88px)' }}
              >
                Gustavo Rodríguez
              </h2>
              <p className="m-0 max-w-[520px] text-[17px] leading-[1.55]" style={{ color: '#4A4F5C' }}>
                Creador del Catálogo Supply Chain. Una experiencia que muy pocos instructores en el mundo pueden
                ofrecer.
              </p>
            </div>

            <blockquote
              className="m-0 border-l-[1.5px] py-5 pl-6 font-display leading-[1.2] tracking-[-.02em]"
              style={{ borderColor: 'var(--tc-violet)', fontSize: 'clamp(24px,2.6vw,34px)', color: '#0B0D12', textWrap: 'balance' }}
            >
              &ldquo;De la teoría a la práctica, y de la práctica al liderazgo.&rdquo;
            </blockquote>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,230px),1fr))' }}>
              {CERTS.map((c) => (
                <div
                  key={c.n}
                  className="relative flex flex-col gap-3.5 border border-dashed p-4"
                  style={{ borderColor: 'rgba(11,13,18,.3)', background: '#F6F4EE' }}
                >
                  <div className="flex items-center justify-between font-mono text-[10.5px] font-medium tracking-[.1em]" style={{ color: '#4A4F5C' }}>
                    <span>CERT. Nº {c.n}</span>
                    <span className="border px-1.5 py-1" style={{ borderColor: '#166534', color: '#166534', transform: 'rotate(-5deg)' }}>
                      VERIFICADO
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7E22CE" strokeWidth={1.5} aria-hidden="true" className="flex-none">
                      <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    <div className="flex flex-col gap-1.5">
                      <span className="font-display text-[17px] font-semibold leading-tight">{c.title}</span>
                      <span className="font-mono text-[11px] font-medium tracking-[.08em]" style={{ color: '#4A4F5C' }}>
                        ORIGEN: {c.origin}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid border-y" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', borderColor: 'rgba(11,13,18,.2)' }}>
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col gap-2 py-4.5">
                  <span className="font-mono font-bold leading-none tracking-[-.04em]" style={{ fontSize: 'clamp(30px,3.2vw,42px)', color: '#0B0D12' }}>
                    {fmt(Math.round(s.v * ae))}
                    {s.s}
                  </span>
                  <span className="pr-3 font-mono text-[11px] font-medium uppercase tracking-[.08em]" style={{ color: '#4A4F5C' }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="https://www.linkedin.com/in/gustavorodriguezsc/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-2.5 py-2.5 font-display text-[15px] font-semibold transition-colors hover:text-[#0B0D12]"
              style={{ color: '#7E22CE' }}
            >
              Ver perfil en LinkedIn
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t pt-7 md:mt-16" style={{ borderColor: 'rgba(11,13,18,.2)' }}>
          <span className="font-display text-lg font-semibold tracking-[-.01em] md:text-xl" style={{ color: '#0B0D12' }}>
            Disponible en toda Latam
          </span>
          <ul aria-label="Países" className="m-0 flex list-none flex-wrap justify-center gap-4 p-0 md:gap-8">
            {COUNTRIES.map((c) => (
              <li key={c.name} className="flex flex-col items-center gap-2">
                <Image
                  src={c.flag}
                  alt=""
                  width={28}
                  height={19}
                  className="block border"
                  style={{ borderColor: 'rgba(11,13,18,.15)', width: 28, height: 'auto' }}
                />
                <span className="text-[13px]" style={{ color: '#0B0D12' }}>
                  {c.name}
                </span>
              </li>
            ))}
          </ul>
          <RouteMap />
        </div>
      </div>
    </section>
  )
}
