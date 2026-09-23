'use client'

import { useEffect, useRef, useState } from 'react'

export type HeroStat = { value: number; suffix: string; label: string; code: string }

type Node = { c: number; fy: number; id: string }
type Edge = { a: number; b: number }
type Packet = { e: number; t: number; v: number }
type NetState = { nodes: Node[]; edges: Edge[]; pk: Packet[] }

const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const fmt = (n: number) => n.toLocaleString('es-AR')

function initNet(): NetState {
  const cols = [3, 2, 3, 4]
  const nodes: Node[] = []
  cols.forEach((n, c) => {
    for (let i = 0; i < n; i++) nodes.push({ c, fy: (i + 1) / (n + 1), id: 'N-' + c + i })
  })
  const edges: Edge[] = []
  nodes.forEach((a, ai) =>
    nodes.forEach((b, bi) => {
      if (b.c === a.c + 1 && Math.abs(a.fy - b.fy) < 0.45) edges.push({ a: ai, b: bi })
    })
  )
  const pk: Packet[] = []
  for (let i = 0; i < 14; i++) pk.push({ e: Math.floor(Math.random() * edges.length), t: Math.random(), v: 0.0025 + Math.random() * 0.004 })
  return { nodes, edges, pk }
}

export default function Hero({ stats }: { stats: HeroStat[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const netRef = useRef<NetState | null>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef(0)
  const [heroT, setHeroT] = useState(1)

  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mo = !reduced
    // One-time reset before the count-up animation starts (mirrors componentDidMount in the source design).
    if (mo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHeroT(0)
    }

    const el = sectionRef.current
    let io: IntersectionObserver | null = null
    if (mo && el) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            io?.unobserve(entry.target)
            const t0 = performance.now()
            const step = (ts: number) => {
              const t = Math.min(1, (ts - t0) / 1700)
              setHeroT(t)
              if (t < 1) requestAnimationFrame(step)
            }
            requestAnimationFrame(step)
          })
        },
        { threshold: 0.25 }
      )
      io.observe(el)
    }

    netRef.current = initNet()

    const drawNet = () => {
      const cv = canvasRef.current
      const net = netRef.current
      if (!cv || !net) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const W = cv.clientWidth
      const H = cv.clientHeight
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr)
        cv.height = Math.round(H * dpr)
      }
      const ctx = cv.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const narrow = W < 900
      const xs = narrow ? [0.1, 0.37, 0.63, 0.9] : [0.5, 0.64, 0.78, 0.92]
      ctx.globalAlpha = narrow ? 0.4 : 1
      const m = mo ? mouseRef.current : { x: -9999, y: -9999 }
      const R = 170
      const pos = net.nodes.map((n) => {
        let x = W * xs[n.c]
        let y = H * (0.2 + 0.62 * n.fy)
        const dx = x - m.x
        const dy = y - m.y
        const d = Math.hypot(dx, dy)
        let near = 0
        if (d < R) {
          near = 1 - d / R
          x += (dx / (d || 1)) * near * 20
          y += (dy / (d || 1)) * near * 20
        }
        return { x, y, near }
      })
      ctx.font = "500 10px 'JetBrains Mono', monospace"
      ctx.textAlign = 'center'
      ;['PROVEEDOR', 'PLANTA', 'DEPÓSITO', 'CLIENTE'].forEach((l, i) => {
        const x = W * xs[i]
        ctx.fillStyle = 'rgba(154,161,177,.75)'
        ctx.fillText(l, x, H * 0.13)
        ctx.strokeStyle = 'rgba(255,255,255,.05)'
        ctx.setLineDash([2, 6])
        ctx.beginPath()
        ctx.moveTo(x, H * 0.15)
        ctx.lineTo(x, H * 0.9)
        ctx.stroke()
        ctx.setLineDash([])
      })
      const bez = (e: number, t: number) => {
        const a = pos[net.edges[e].a]
        const b = pos[net.edges[e].b]
        const mx = (a.x + b.x) / 2
        const u = 1 - t
        return {
          x: u * u * u * a.x + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * b.x,
          y: u * u * u * a.y + 3 * u * u * t * a.y + 3 * u * t * t * b.y + t * t * t * b.y,
        }
      }
      net.edges.forEach((e) => {
        const a = pos[e.a]
        const b = pos[e.b]
        const mx = (a.x + b.x) / 2
        const nr = Math.max(a.near, b.near)
        ctx.strokeStyle = nr > 0 ? `rgba(192,132,252,${0.12 + nr * 0.5})` : 'rgba(255,255,255,.09)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.bezierCurveTo(mx, a.y, mx, b.y, b.x, b.y)
        ctx.stroke()
      })
      net.pk.forEach((p) => {
        const e = net.edges[p.e]
        const nr = Math.max(pos[e.a].near, pos[e.b].near)
        if (mo) p.t += (p.v * lastDt) / 16 * (1 + nr * 2)
        if (p.t >= 1) {
          const end = e.b
          const outs = net.edges.map((x, i) => (x.a === end ? i : -1)).filter((i) => i >= 0)
          if (outs.length) p.e = outs[Math.floor(Math.random() * outs.length)]
          else {
            const st = net.edges.map((x, i) => (net.nodes[x.a].c === 0 ? i : -1)).filter((i) => i >= 0)
            p.e = st[Math.floor(Math.random() * st.length)]
          }
          p.t = 0
        }
        const pt = bez(p.e, p.t)
        const toCli = net.nodes[net.edges[p.e].b].c === 3
        ctx.fillStyle = toCli ? '#4ADE80' : '#C084FC'
        ctx.shadowColor = ctx.fillStyle
        ctx.shadowBlur = 10
        ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6)
        ctx.shadowBlur = 0
      })
      pos.forEach((p, i) => {
        ctx.fillStyle = '#0B0D12'
        ctx.strokeStyle = p.near > 0 ? '#C084FC' : 'rgba(232,234,240,.55)'
        ctx.lineWidth = 1.5
        ctx.fillRect(p.x - 5, p.y - 5, 10, 10)
        ctx.strokeRect(p.x - 5, p.y - 5, 10, 10)
        if (p.near > 0.35) {
          ctx.fillStyle = '#C084FC'
          ctx.textAlign = 'left'
          ctx.fillText(net.nodes[i].id, p.x + 10, p.y - 8)
          ctx.textAlign = 'center'
        }
      })
      ctx.globalAlpha = 1
    }

    let lastDt = 16
    lastRef.current = performance.now()
    const loop = (ts: number) => {
      const dt = Math.min(50, ts - lastRef.current)
      lastRef.current = ts
      lastDt = dt
      drawNet()
      if (mo) rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    const onMove = (e: MouseEvent) => {
      const c = canvasRef.current
      if (!c) return
      const r = c.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    if (mo && el) {
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      io?.disconnect()
      if (el) {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      }
    }
  }, [])

  const he = ease(heroT)

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative z-[2] flex min-h-[min(90vh,860px)] items-center overflow-hidden border-b border-white/[.07] px-5 py-14 sm:px-8 md:px-14 md:py-20"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[7vw] -right-[3vw] select-none font-display font-bold leading-[.8] tracking-[-.06em] text-transparent"
        style={{ fontSize: 'clamp(220px,34vw,520px)', WebkitTextStroke: '1.5px rgba(168,85,247,.28)' }}
      >
        59
      </div>
      <div className="relative mx-auto w-full max-w-[1320px] pointer-events-none">
        <div className="flex max-w-[780px] flex-col gap-7 pointer-events-auto">
          <div className="flex flex-wrap gap-2.5 font-mono text-[11px] font-medium tracking-[.12em]">
            <span className="border px-2.5 py-1.5 text-tc-violet-2" style={{ borderColor: 'rgba(192,132,252,.5)' }}>
              [SC-00] CATÁLOGO
            </span>
            <span
              className="flex items-center gap-1.5 border px-2.5 py-1.5 text-tc-green"
              style={{ borderColor: 'rgba(74,222,128,.4)' }}
            >
              <span className="h-1.5 w-1.5 bg-tc-green" />
              STOCK DISPONIBLE
            </span>
          </div>
          <h1
            className="m-0 font-display font-bold leading-[.84] tracking-[-.055em]"
            style={{ fontSize: 'clamp(58px,11vw,176px)', textWrap: 'balance' }}
          >
            <span className="block">Catálogo</span>
            <span
              className="block text-transparent"
              style={{ WebkitTextStroke: '2px #C084FC', textShadow: '0 0 40px rgba(168,85,247,.25)' }}
            >
              Supply
            </span>
            <span className="block" style={{ paddingLeft: 'clamp(40px,12vw,200px)' }}>
              Chain<span className="text-tc-violet">.</span>
            </span>
          </h1>
          <p className="m-0 max-w-[520px] text-tc-text-2" style={{ fontSize: 'clamp(17px,1.6vw,20px)', lineHeight: 1.55, textWrap: 'pretty' }}>
            Formación práctica basada en experiencia real. Elegí las especializaciones que necesitás y accedé a tu
            contenido al instante.
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <a
              href="#catalogo"
              className="flex h-14 items-center gap-3 bg-tc-violet px-6 font-display text-base font-bold text-tc-bg transition-colors hover:bg-tc-violet-2"
              style={{ boxShadow: '0 0 0 1px #C084FC,0 0 40px rgba(168,85,247,.45)' }}
            >
              Ver especializaciones
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a
              href="#como"
              className="flex h-14 items-center border border-white/[.14] px-5 text-[15px] font-medium text-tc-text transition-colors hover:border-tc-violet-2"
            >
              ¿Cómo funciona?
            </a>
          </div>
          <dl
            className="mt-3 grid border border-white/10 bg-[#0B0D12]/[.72] backdrop-blur-sm"
            style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}
          >
            {stats.map((m) => (
              <div key={m.code} className="flex flex-col gap-2.5 border-b border-r border-white/[.07] p-4">
                <dt className="flex items-center justify-between gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[.1em] text-tc-text-2">
                  <span>{m.label}</span>
                  <span className="text-tc-violet-2">{m.code}</span>
                </dt>
                <dd
                  className="m-0 font-mono font-bold leading-none tracking-[-.04em] text-tc-text"
                  style={{ fontSize: 'clamp(34px,3.6vw,48px)' }}
                >
                  {fmt(Math.round(m.value * he))}
                  {m.suffix}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
