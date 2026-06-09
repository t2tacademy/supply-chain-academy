'use client'

import { useState } from 'react'
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

interface Props {
  selections: Record<string, TierKey>
  onSelect: (categoryId: string, tier: TierKey | null) => void
}

export default function CategoryCompareTable({ selections, onSelect }: Props) {
  const [activeCatId, setActiveCatId] = useState(CATEGORIES[0].id)
  const cat = CATEGORIES.find(c => c.id === activeCatId)!

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
      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-32" />
              {TIERS.map(tier => {
                const m = TIER_META[tier]
                const isSelected = selections[cat.id] === tier
                return (
                  <th
                    key={tier}
                    className={`p-4 text-center border-l border-gray-200 ${isSelected ? 'bg-purple-50' : ''}`}
                  >
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
                  <td key={tier} className={`p-4 text-center border-l border-gray-100 ${isSelected ? 'bg-purple-50/60' : ''}`}>
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
                const isSelected = selections[cat.id] === tier
                return (
                  <td key={tier} className={`p-4 text-center border-l border-gray-100 ${isSelected ? 'bg-purple-50/60' : ''}`}>
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
                const isSelected = selections[cat.id] === tier
                return (
                  <td key={tier} className={`p-4 text-center border-l border-gray-100 ${isSelected ? 'bg-purple-50/60' : ''}`}>
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
                const isSelected = selections[cat.id] === tier
                return (
                  <td key={tier} className={`p-4 text-center border-l border-gray-100 ${isSelected ? 'bg-purple-50/60' : ''}`}>
                    <span className="text-sm font-medium text-gray-700">{minutesToLabel(t.minutes)}</span>
                  </td>
                )
              })}
            </tr>

            {/* ── Botón de selección ── */}
            <tr className="border-b border-gray-200">
              <td className="p-4 bg-gray-50/60" />
              {TIERS.map(tier => {
                const isSelected = selections[cat.id] === tier
                return (
                  <td key={tier} className={`p-4 text-center border-l border-gray-200 ${isSelected ? 'bg-purple-50/60' : ''}`}>
                    <button
                      onClick={() => onSelect(cat.id, isSelected ? null : tier)}
                      className={`w-full py-2 px-3 rounded-xl text-sm font-bold transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                      }`}
                    >
                      {isSelected ? '✓ Seleccionado' : 'Seleccionar'}
                    </button>
                  </td>
                )
              })}
            </tr>

            {/* ── Contenido ── */}
            <tr>
              <td className="p-4 text-sm font-semibold text-gray-600 bg-gray-50/60 align-top">
                Contenido
              </td>
              {TIERS.map((tier, i) => {
                const titles = cat.courseTitles[tier]
                const isSelected = selections[cat.id] === tier
                const badgeColors: Record<TierKey, string> = {
                  starter: 'bg-emerald-100 text-emerald-700',
                  pro:     'bg-sky-100 text-sky-700',
                  expert:  'bg-violet-100 text-violet-700',
                }
                return (
                  <td
                    key={tier}
                    className={`p-4 border-l border-gray-100 align-top ${isSelected ? 'bg-purple-50/40' : ''}`}
                  >
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mb-3 ${badgeColors[tier]}`}>
                      {TIER_META[tier].icon} {COURSE_TIER_LABEL[tier]}
                    </span>
                    <ul className="space-y-1.5">
                      {titles.map((title, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-gray-600 leading-snug">
                          <span className="text-gray-300 mt-0.5 shrink-0">›</span>
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
