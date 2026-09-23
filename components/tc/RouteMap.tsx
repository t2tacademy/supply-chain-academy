'use client'

import { useEffect, useRef } from 'react'

const ROUTES = [
  { code: 'AR→MX', city: 'Ciudad de México', y: 22 },
  { code: 'AR→CO', city: 'Bogotá', y: 60 },
  { code: 'AR→PE', city: 'Lima', y: 98 },
  { code: 'AR→CL', city: 'Santiago', y: 136 },
  { code: 'AR→UY', city: 'Montevideo', y: 174 },
  { code: 'AR→BR', city: 'São Paulo', y: 212 },
]

const ORIGIN = { x: 46, y: 117 }
const DEST_X = 780

export default function RouteMap() {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const pkRefs = useRef<(SVGRectElement | null)[]>([])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mo = !reduced
    const routes = pathRefs.current.map((p, i) => ({ p, L: p ? p.getTotalLength() : 0, r: pkRefs.current[i] }))

    const place = (ts: number) => {
      routes.forEach((o, i) => {
        if (!o.p || !o.r || !o.L) return
        const per = o.L * 14 + 1600
        const ph = mo ? ((ts + i * 700) % per) / per : 0.62
        const pt = o.p.getPointAtLength(ph * o.L)
        o.r.setAttribute('transform', `translate(${pt.x} ${pt.y})`)
        o.r.setAttribute('opacity', String(Math.min(1, Math.min(ph, 1 - ph) * 8)))
      })
    }

    if (!mo) {
      place(0)
      return
    }
    const loop = (ts: number) => {
      place(ts)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="w-full max-w-[900px]" aria-hidden="true">
      <svg ref={svgRef} viewBox="0 0 900 234" className="h-auto w-full" role="presentation">
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r="6" fill="#7E22CE" />
        <text x={ORIGIN.x} y={ORIGIN.y - 14} textAnchor="middle" fontSize="10" fontFamily="'JetBrains Mono', monospace" fill="#4A4F5C">
          BUE · AR
        </text>
        {ROUTES.map((r, i) => {
          const mx = (ORIGIN.x + DEST_X) / 2
          const d = `M${ORIGIN.x} ${ORIGIN.y} C ${mx} ${ORIGIN.y}, ${mx} ${r.y}, ${DEST_X} ${r.y}`
          return (
            <g key={r.code}>
              <path
                ref={(el) => {
                  pathRefs.current[i] = el
                }}
                d={d}
                fill="none"
                stroke="rgba(126,34,206,.45)"
                strokeWidth={1}
                strokeDasharray="2 4"
                strokeLinecap="round"
              />
              <circle cx={DEST_X} cy={r.y} r="4" fill="none" stroke="#7E22CE" strokeWidth={1.5} />
              <text x={DEST_X + 10} y={r.y - 5} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight={600} fill="#0B0D12">
                {r.code}
              </text>
              <text x={DEST_X + 10} y={r.y + 8} fontSize="9" fontFamily="'Plus Jakarta Sans', sans-serif" fill="#4A4F5C">
                {r.city}
              </text>
              <rect
                ref={(el) => {
                  pkRefs.current[i] = el
                }}
                x={-2.5}
                y={-2.5}
                width={5}
                height={5}
                fill="#A855F7"
                opacity={0}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
