'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 158, suffix: '',  label: 'CURSOS'      },
  { value: 9,   suffix: '',  label: 'CATEGORÍAS'  },
  { value: 3,   suffix: '',  label: 'NIVELES'      },
  { value: 37,  suffix: 'h', label: 'CONTENIDO'   },
]

const FLAGS = ['🇦🇷', '🇲🇽', '🇨🇴', '🇵🇪', '🇨🇱', '🇺🇾', '🇧🇷']

function useCountUp(target: number, started: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!started) return
    const duration = 1600
    const start = Date.now()
    const id = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(target * eased))
      if (p >= 1) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [started, target])
  return count
}

function StatCard({
  value, suffix, label, started, delay,
}: { value: number; suffix: string; label: string; started: boolean; delay: number }) {
  const count = useCountUp(value, started)
  return (
    <div
      className={`bg-white rounded-2xl border border-amber-100 p-6 text-center shadow-sm transition-all duration-700 ease-out ${
        started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-4xl md:text-5xl font-extrabold text-amber-600 leading-none mb-2 tabular-nums">
        {count}{suffix}
      </div>
      <div className="text-gray-400 text-xs font-bold tracking-widest">{label}</div>
    </div>
  )
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.25 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="bg-[#FAF7F0] py-16 border-b border-amber-100/60">
      <div className="max-w-4xl mx-auto px-6 space-y-10">

        {/* Tagline */}
        <div
          className={`border-l-4 border-amber-400 pl-5 transition-all duration-700 ease-out ${
            started ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}
          style={{ transitionDelay: '0ms' }}
        >
          <p className="text-gray-700 text-xl font-medium italic leading-relaxed">
            De la teoría a la práctica,<br />y de la práctica al liderazgo.
          </p>
        </div>

        {/* Stats 2×2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <StatCard key={s.label} {...s} started={started} delay={i * 130} />
          ))}
        </div>

        {/* Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              icon: '🏭',
              title: 'Director de Supply Chain · Unilever',
              desc: 'Una experiencia que muy pocos instructores en el mundo pueden ofrecer',
              dx: '-translate-x-4',
              delay: 400,
            },
            {
              icon: '🎓',
              title: 'Director Ingeniería Industrial · ITBA',
              desc: '32 años de experiencia operativa internacional',
              dx: 'translate-x-4',
              delay: 550,
            },
          ].map(c => (
            <div
              key={c.title}
              className={`flex items-start gap-3 bg-white border border-amber-100 rounded-2xl px-5 py-4 shadow-sm transition-all duration-700 ease-out ${
                started ? `opacity-100 translate-x-0` : `opacity-0 ${c.dx}`
              }`}
              style={{ transitionDelay: `${c.delay}ms` }}
            >
              <span className="text-xl mt-0.5 shrink-0">{c.icon}</span>
              <div>
                <p className="font-bold text-gray-900 text-sm">{c.title}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* LATAM flags — cascade */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {FLAGS.map((flag, i) => (
            <span
              key={flag}
              className={`text-3xl transition-all duration-500 ease-out ${
                started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${700 + i * 110}ms` }}
            >
              {flag}
            </span>
          ))}
          <span
            className={`text-gray-400 text-xs font-bold tracking-widest uppercase ml-1 transition-all duration-700 ease-out ${
              started ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '1500ms' }}
          >
            Disponible en toda Latam
          </span>
        </div>

      </div>
    </section>
  )
}
