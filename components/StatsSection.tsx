'use client'

import { useEffect, useRef, useState } from 'react'

const FLAGS = ['🇦🇷', '🇲🇽', '🇨🇴', '🇵🇪', '🇨🇱', '🇺🇾', '🇧🇷']

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
    <section ref={ref} className="bg-white py-20 border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 space-y-12">

        {/* Tagline */}
        <div
          className={`border-l-[5px] border-purple-500 pl-6 transition-all duration-700 ease-out ${
            started ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}
        >
          <p className="text-gray-800 text-3xl font-semibold italic leading-snug">
            De la teoría a la práctica,<br />y de la práctica al liderazgo.
          </p>
        </div>

        {/* Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: '🏭',
              title: 'Director de Supply Chain · Unilever',
              desc: 'Una experiencia que muy pocos instructores en el mundo pueden ofrecer',
              dx: '-translate-x-4',
              delay: 150,
            },
            {
              icon: '🎓',
              title: 'Director Ingeniería Industrial · ITBA',
              desc: '32 años de experiencia operativa internacional',
              dx: 'translate-x-4',
              delay: 300,
            },
          ].map(c => (
            <div
              key={c.title}
              className={`flex items-start gap-4 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 shadow-sm transition-all duration-700 ease-out ${
                started ? 'opacity-100 translate-x-0' : `opacity-0 ${c.dx}`
              }`}
              style={{ transitionDelay: `${c.delay}ms` }}
            >
              <span className="text-3xl mt-0.5 shrink-0">{c.icon}</span>
              <div>
                <p className="font-bold text-gray-900 text-base">{c.title}</p>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* LATAM flags — cascade */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {FLAGS.map((flag, i) => (
            <span
              key={flag}
              className={`text-4xl transition-all duration-500 ease-out ${
                started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${450 + i * 110}ms` }}
            >
              {flag}
            </span>
          ))}
          <span
            className={`text-gray-400 text-sm font-bold tracking-widest uppercase ml-2 transition-all duration-700 ease-out ${
              started ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '1250ms' }}
          >
            Disponible en toda Latam
          </span>
        </div>

      </div>
    </section>
  )
}
