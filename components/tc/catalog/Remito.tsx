'use client'

import { useEffect, useRef, useState } from 'react'

export interface RemitoLine {
  key: string
  code: string
  label: string
  sub: string
  price: number
  listPrice?: number
  onRemove?: () => void
}

interface Props {
  lines: RemitoLine[]
  total: number
  listTotal: number
  onClear: () => void
  onContinue: () => void
  ctaLabel: string
  note?: string
  /** Oculta la hoja inferior en mobile (p. ej. durante el checkout) */
  mobileHidden?: boolean
}

// Ports the design's bars() helper: a deterministic pseudo-random barcode
// rendered as a CSS linear-gradient, seeded from a string.
function barsGradient(seed: string, color = '#E8EAF0'): string {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const stops: string[] = []
  let x = 0
  const next = () => {
    h = (h * 1103515245 + 12345) >>> 0
    return h >>> 16
  }
  while (x < 99) {
    const w = 0.6 + (next() % 3) * 0.7
    const g = 0.6 + (next() % 3) * 0.8
    stops.push(`${color} ${x.toFixed(1)}% ${(x + w).toFixed(1)}%`, `transparent ${(x + w).toFixed(1)}% ${(x + w + g).toFixed(1)}%`)
    x += w + g
  }
  return `linear-gradient(90deg,${stops.join(',')})`
}

export default function Remito({ lines, total, listTotal, onClear, onContinue, ctaLabel, note, mobileHidden }: Props) {
  const [orderNo, setOrderNo] = useState<string | null>(null)
  const [today, setToday] = useState<string>('')
  const [pulse, setPulse] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const pulseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Random order number must be generated client-side only (after mount) to
    // avoid a server/client hydration mismatch — this is a one-time init of
    // per-mount display state, not a sync-from-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrderNo('0001-' + String(Math.floor(Math.random() * 90000) + 10000))
    setToday(new Date().toLocaleDateString('es-AR'))
  }, [])

  useEffect(() => {
    const handler = () => {
      setPulse(true)
      if (pulseTimeout.current) clearTimeout(pulseTimeout.current)
      pulseTimeout.current = setTimeout(() => setPulse(false), 600)
    }
    window.addEventListener('tc:remito-pulse', handler)
    return () => {
      window.removeEventListener('tc:remito-pulse', handler)
      if (pulseTimeout.current) clearTimeout(pulseTimeout.current)
    }
  }, [])

  const discount = listTotal - total
  const empty = lines.length === 0
  const statusTxt = empty ? '○ EN ESPERA DE CARGA' : '● LISTO PARA DESPACHO'
  const statusColor = empty ? '#4A4F5C' : '#166534'
  const countTxt = `${lines.length} ${lines.length === 1 ? 'ítem' : 'ítems'}`

  const body = (
    <div className="flex flex-col gap-4 overflow-y-auto p-[18px]">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-2.5">
          <span className="font-display" style={{ fontWeight: 700, fontSize: 24, letterSpacing: '-.02em' }}>Remito</span>
          <span className="font-mono text-xs" style={{ color: '#4A4F5C' }}>Nº {orderNo ?? '····-·····'}</span>
        </div>
        <div className="flex justify-between gap-2.5 font-mono text-[10.5px]" style={{ letterSpacing: '.08em', color: '#4A4F5C' }}>
          <span>FECHA {today}</span>
          <span>DESTINO: TU CARRERA</span>
        </div>
        <span
          className="self-start font-mono text-[10.5px] font-semibold"
          style={{ padding: '6px 9px', border: `1px solid ${statusColor}`, color: statusColor, letterSpacing: '.1em' }}
        >
          {statusTxt}
        </span>
      </div>

      <div
        className="flex justify-between font-mono text-[10px]"
        style={{ padding: '8px 0', borderTop: '1px solid rgba(11,13,18,.2)', borderBottom: '1px solid rgba(11,13,18,.2)', letterSpacing: '.12em', color: '#4A4F5C' }}
      >
        <span>CÓD · ÍTEM</span>
        <span>IMPORTE</span>
      </div>

      {empty && (
        <div className="text-center text-sm" style={{ padding: '22px 14px', border: '1px dashed rgba(11,13,18,.26)', color: '#4A4F5C', lineHeight: 1.5 }}>
          Remito vacío.<br />Cargá un nivel o una especialización.
        </div>
      )}

      <ul className="m-0 flex list-none flex-col p-0">
        {lines.map(ln => (
          <li
            key={ln.key}
            className="grid items-start gap-2.5"
            style={{ gridTemplateColumns: '1fr auto 32px', padding: '12px 0', borderBottom: '1px dashed rgba(11,13,18,.18)' }}
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="font-mono text-[10.5px] font-semibold" style={{ letterSpacing: '.08em', color: '#7E22CE' }}>{ln.code}</span>
              <span className="font-display font-semibold" style={{ fontSize: 14.5, lineHeight: 1.25 }}>{ln.label}</span>
              <span className="font-mono text-[11.5px]" style={{ color: '#4A4F5C', lineHeight: 1.3 }}>{ln.sub}</span>
            </div>
            <div className="flex flex-col items-end gap-1.5 whitespace-nowrap font-mono">
              <span className="font-mono" style={{ fontWeight: 700, fontSize: 15, color: '#0B0D12' }}>USD {ln.price}</span>
              {ln.listPrice != null && ln.listPrice > ln.price && (
                <s className="font-mono text-[11.5px]" style={{ color: '#4A4F5C' }}>USD {ln.listPrice}</s>
              )}
            </div>
            {ln.onRemove ? (
              <button
                type="button"
                onClick={ln.onRemove}
                aria-label={`Quitar ${ln.label}`}
                className="grid place-items-center transition-colors"
                style={{ width: 32, height: 32, border: '1px solid rgba(11,13,18,.2)', background: 'transparent', color: '#4A4F5C', cursor: 'pointer' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            ) : <span />}
          </li>
        ))}
      </ul>

      <dl className="m-0 flex flex-col gap-2.5 font-mono text-[13px]">
        <div className="flex justify-between">
          <dt style={{ color: '#4A4F5C' }}>Subtotal lista</dt>
          <dd className="m-0" style={{ color: '#4A4F5C' }}><s>USD {listTotal}</s></dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt style={{ color: '#B45309' }}>Descuento</dt>
            <dd className="m-0" style={{ color: '#B45309' }}>− USD {discount}</dd>
          </div>
        )}
        <div
          className="flex items-baseline justify-between"
          style={{ paddingTop: 12, marginTop: 4, borderTop: '3px double rgba(255,255,255,.2)' }}
        >
          <dt className="font-mono text-[13px] font-bold" style={{ letterSpacing: '.12em', color: '#0B0D12' }}>TOTAL</dt>
          <dd className="m-0 font-mono" style={{ fontWeight: 700, fontSize: 36, letterSpacing: '-.04em', color: '#7E22CE' }}>USD {total}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => { setSheetOpen(false); onContinue() }}
        disabled={empty}
        className="flex items-center justify-center gap-2.5 font-display transition-colors"
        style={{
          minHeight: 54,
          background: empty ? '#B9BCC4' : '#A855F7',
          color: '#07080B',
          fontWeight: 700,
          fontSize: 15,
          boxShadow: empty ? 'none' : '0 0 32px rgba(168,85,247,.4)',
          border: 'none',
          cursor: empty ? 'not-allowed' : 'pointer',
        }}
      >
        {ctaLabel}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>

      {!empty && (
        <button
          type="button"
          onClick={onClear}
          className="self-center text-[13px] transition-colors"
          style={{ color: '#4A4F5C', background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}
        >
          Limpiar
        </button>
      )}

      {note && (
        <p
          className="m-0 font-mono text-[11.5px]"
          style={{ paddingTop: 12, borderTop: '1px solid rgba(11,13,18,.12)', color: '#4A4F5C', lineHeight: 1.55 }}
        >
          {note}
        </p>
      )}

      <div aria-hidden="true" style={{ height: 26, background: barsGradient(orderNo ?? 'remito', '#0B0D12') }} />
    </div>
  )

  const borderColor = pulse ? '#A855F7' : 'rgba(11,13,18,.2)'
  const boxShadow = pulse
    ? '0 0 0 4px rgba(168,85,247,.15),0 0 48px rgba(168,85,247,.3)'
    : '0 24px 60px rgba(0,0,0,.45)'

  return (
    <aside
      id="remito"
      aria-label="Remito de tu pedido"
      className={`tc-remito flex flex-col${empty || mobileHidden ? ' tc-remito--empty' : ''}`}
      style={{
        background: '#F4F1E8',
        color: '#0B0D12',
        border: `1px solid ${borderColor}`,
        boxShadow,
        transition: 'border-color .3s,box-shadow .3s',
      }}
    >
      <div
        aria-hidden="true"
        className="flex-none"
        style={{ height: 8, background: 'repeating-linear-gradient(-45deg,#A855F7 0 6px,#0B0D12 6px 12px)' }}
      />

      {/* Mobile collapsible header — hidden on desktop via CSS */}
      <button
        type="button"
        onClick={() => setSheetOpen(o => !o)}
        aria-expanded={sheetOpen}
        className="tc-remito-toggle flex w-full flex-none items-center gap-3 px-4 text-left"
        style={{ minHeight: 60, border: 0, background: 'transparent', color: '#0B0D12', cursor: 'pointer' }}
      >
        <span className="flex flex-1 flex-col gap-1">
          <span className="font-display font-bold" style={{ fontSize: 15 }}>Remito · {countTxt}</span>
          <span className="font-mono text-[10.5px]" style={{ letterSpacing: '.1em', color: statusColor }}>{statusTxt}</span>
        </span>
        <span className="font-mono font-bold" style={{ fontSize: 20, color: '#7E22CE' }}>USD {total}</span>
        <span aria-hidden="true" className="font-mono text-sm" style={{ color: '#4A4F5C' }}>{sheetOpen ? '▼' : '▲'}</span>
      </button>

      <div className={`tc-remito-body${sheetOpen ? ' tc-remito-body--open' : ''}`}>{body}</div>
    </aside>
  )
}
