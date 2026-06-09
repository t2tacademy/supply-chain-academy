'use client'

import { useState, useRef, useEffect } from 'react'
import { CATEGORIES, TierKey, minutesToLabel } from '@/lib/courses'

const TIERS: TierKey[] = ['starter', 'pro', 'expert']

const TIER_META: Record<TierKey, { icon: string; name: string; includes: string | null }> = {
  starter: { icon: '▲',   name: 'Starter', includes: null },
  pro:     { icon: '▲▲',  name: 'Pro',     includes: 'Incluye Starter' },
  expert:  { icon: '▲▲▲', name: 'Expert',  includes: 'Incluye Starter + Pro' },
}

const COURSE_TIER_LABEL: Record<TierKey, string> = {
  starter: 'Starter',
  pro:     'Pro (adicionales)',
  expert:  'Expert (adicionales)',
}

const BADGE_COLORS: Record<TierKey, string> = {
  starter: 'bg-emerald-100 text-emerald-700',
  pro:     'bg-sky-100 text-sky-700',
  expert:  'bg-violet-100 text-violet-700',
}

interface Props {
  selections: Record<string, TierKey>
  onSelect: (categoryId: string, tier: TierKey | null) => void
}

export default function CategoryCompareTable({ selections, onSelect }: Props) {
  const [activeCatId, setActiveCatId] = useState(CATEGORIES[0].id)
  const cat = CATEGORIES.find(c => c.id === activeCatId)!
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el && window.innerWidth < 640) {
      // On mobile, start scroll past the label column (w-32 = 128px) to show all 3 tiers
      el.scrollLeft = 128
    }
  }, [activeCatId])

  const colClass = (tier: TierKey) => {
    const sel = selections[cat.id] === tier
    return `border-l border-gray-100 cursor-pointer transition-colors ${
      sel ? 'bg-purple-50/70' : 'hover:bg-purple-50/30'
    }`
  }

  const toggle = (tier: TierKey) =>
    onSelect(cat.id, selections[cat.id] === tier ? null : tier)

  return (
    <div>
      {/* ── Category tabs ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCatId(c.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all border ${
              activeCatId === c.id
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* ── Category description ── */}
      <p className="text-sm text-gray-500 mb-4">{cat.description}</p>

      {/* ── Comparison table ── */}
      <div ref={scrollRef} className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 w-32" />
              {TIERS.map(tier => {
                const m = TIER_META[tier]
                const isSelected = selections[cat.id] === tier
                return (
                  <th
                    key={tier}
                    onClick={() => toggle(tier)}
                    className={`p-4 text-center border-l border-gray-200 cursor-pointer transition-colors select-none ${
                      isSelected ? 'bg-purple-100' : 'hover:bg-purple-50/30'
                    }`}
                  >
                    {isSelected && (
                      <div className="flex justify-center mb-1">
                        <span className="text-xs font-bold text-white bg-purple-600 px-2 py-0.5 rounded-full">
                          ✓ Seleccionado
                        </span>
                      </div>
                    )}
                    <div className={`font-extrabold text-base ${isSelected ? 'text-purple-700' : 'text-gray-800'}`}>
                      {m.icon} {m.name.toUpperCase()}
                    </div>
                    {m.includes && (
                      <div className="text-xs text-gray-400 font-normal mt-0.5">{m.includes}</div>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {/* ── Precio ── */}
            <tr className="border-b border-gray-100">
              <td className="p-4 text-sm font-semibold text-gray-600 bg-gray-50/60">Precio</td>
              {TIERS.map(tier => {
                const t = cat.tiers[tier]
                const isSelected = selections[cat.id] === tier
                return (
                  <td key={tier} onClick={() => toggle(tier)} className={`p-4 text-center ${colClass(tier)}`}>
                    <span className={`font-extrabold text-xl ${isSelected ? 'text-purple-700' : 'text-gray-800'}`}>
                      ${t.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">USD</span>
                  </td>
                )
              })}
            </tr>

            {/* ── Precio lista + ahorro ── */}
            <tr className="border-b border-gray-100">
              <td className="p-4 text-sm font-semibold text-gray-600 bg-gray-50/60">Precio lista</td>
              {TIERS.map(tier => {
                const t = cat.tiers[tier]
                return (
                  <td key={tier} onClick={() => toggle(tier)} className={`p-4 text-center ${colClass(tier)}`}>
                    <span className="text-xs text-gray-400 line-through">${t.listPrice.toFixed(2)}</span>
                    <span className="text-xs font-bold text-emerald-600 ml-1.5">−{t.savings}%</span>
                  </td>
                )
              })}
            </tr>

            {/* ── Cursos ── */}
            <tr className="border-b border-gray-100">
              <td className="p-4 text-sm font-semibold text-gray-600 bg-gray-50/60">Cursos</td>
              {TIERS.map(tier => {
                const t = cat.tiers[tier]
                return (
                  <td key={tier} onClick={() => toggle(tier)} className={`p-4 text-center ${colClass(tier)}`}>
                    <span className="font-bold text-gray-800">{t.courses}</span>
                    <span className="text-xs text-gray-400 ml-1">cursos</span>
                  </td>
                )
              })}
            </tr>

            {/* ── Duración ── */}
            <tr className="border-b border-gray-200">
              <td className="p-4 text-sm font-semibold text-gray-600 bg-gray-50/60">Duración</td>
              {TIERS.map(tier => {
                const t = cat.tiers[tier]
                return (
                  <td key={tier} onClick={() => toggle(tier)} className={`p-4 text-center ${colClass(tier)}`}>
                    <span className="text-sm font-medium text-gray-700">{minutesToLabel(t.minutes)}</span>
                  </td>
                )
              })}
            </tr>

            {/* ── Contenido ── */}
            <tr>
              <td className="p-4 text-sm font-semibold text-gray-600 bg-gray-50/60 align-top">
                Contenido
              </td>
              {TIERS.map(tier => {
                const titles = cat.courseTitles[tier]
                const isSelected = selections[cat.id] === tier
                return (
                  <td
                    key={tier}
                    onClick={() => toggle(tier)}
                    className={`p-4 align-top ${colClass(tier)}`}
                  >
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mb-3 ${BADGE_COLORS[tier]}`}>
                      {TIER_META[tier].icon} {COURSE_TIER_LABEL[tier]}
                    </span>
                    <ul className="space-y-1.5">
                      {titles.map((title, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-gray-600 leading-snug">
                          <span className={`mt-0.5 shrink-0 ${isSelected ? 'text-purple-400' : 'text-gray-300'}`}>›</span>
                          <span>{title}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
