'use client'

import { useEffect, useState } from 'react'

const MAIL_HREF = `mailto:t2tscacademy@gmail.com?subject=${encodeURIComponent('Consulta — Catálogo Supply Chain')}`

export default function Header({ stock }: { stock: number }) {
  const [clock, setClock] = useState('--:--:--')

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
          hour12: false,
        })
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#07080B]/[.86] backdrop-blur-md">
      {/* ticker bar */}
      <div className="flex h-7 items-center gap-4 overflow-hidden whitespace-nowrap border-b border-white/5 px-5 font-mono text-[11px] font-medium tracking-[.08em] text-tc-text-2 sm:px-8 md:px-14">
        <span className="text-tc-violet-2">T2T/SC-CTRL</span>
        <span>BUE {clock}</span>
        <span className="flex items-center gap-1.5 text-tc-green">
          <span className="h-1.5 w-1.5" style={{ background: 'var(--tc-green)', boxShadow: '0 0 8px var(--tc-green)' }} />
          OPERATIVO
        </span>
        <span className="ml-auto hidden min-[900px]:inline">LEAD TIME 24 HS</span>
        <span className="hidden min-[900px]:inline">
          STOCK {stock}/{stock}
        </span>
        <span className="hidden min-[900px]:inline text-tc-hazard">SIN QUIEBRE</span>
      </div>

      {/* main nav */}
      <div className="flex h-16 items-center gap-5 px-5 sm:px-8 md:px-14">
        <a
          href="https://t2tacademy.com.ar/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-tc-text"
        >
          <span
            className="grid h-[38px] w-[38px] place-items-center border-[1.5px] border-tc-violet font-mono text-xs font-bold text-tc-violet-2"
            style={{ boxShadow: '0 0 18px rgba(168,85,247,.25)' }}
          >
            T2T
          </span>
          <span className="flex flex-col gap-[3px]">
            <span className="font-display text-[15px] font-semibold leading-none tracking-[-.01em]">
              Think to Transform
            </span>
            <span className="font-mono text-[10px] font-medium leading-none tracking-[.14em] text-tc-text-2">
              ACADEMY · SUPPLY CHAIN
            </span>
          </span>
        </a>

        <nav aria-label="Principal" className="ml-auto flex items-center gap-3 text-sm font-medium sm:gap-5 md:gap-7">
          <a
            href="#como"
            className="hidden min-[900px]:inline text-tc-text-2 transition-colors hover:text-tc-text"
          >
            Cómo funciona
          </a>
          <a
            href="https://t2tacademy.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-[900px]:inline text-tc-text-2 transition-colors hover:text-tc-text"
          >
            Habilidades Blandas ↗
          </a>
          <a href={MAIL_HREF} className="hidden min-[900px]:inline text-tc-text-2 transition-colors hover:text-tc-text">
            Contacto
          </a>

          <a
            href="https://t2tacademy.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Habilidades Blandas"
            className="min-[900px]:hidden px-1 py-2.5 font-mono text-xs font-semibold text-tc-text-2"
          >
            HB ↗
          </a>
          <a
            href={MAIL_HREF}
            aria-label="Contacto por email"
            className="min-[900px]:hidden grid h-11 w-11 place-items-center text-tc-text-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" />
              <path d="M3 6l9 7 9-7" />
            </svg>
          </a>

          <a
            href="#catalogo"
            className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap bg-tc-violet px-3 min-[400px]:px-4 font-display text-[13px] font-bold tracking-[.02em] text-tc-bg transition-colors hover:bg-tc-violet-2"
            style={{ boxShadow: '0 0 24px rgba(168,85,247,.35)' }}
          >
            Armar pedido
          </a>
        </nav>
      </div>
    </header>
  )
}
