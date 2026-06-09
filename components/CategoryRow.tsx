'use client'

import { useState } from 'react'
import { Category, TierKey, minutesToLabel } from '@/lib/courses'

const TIER_ICONS: Record<TierKey, string> = {
  starter: '▲',
  pro: '▲▲',
  expert: '▲▲▲',
}

const TIERS: TierKey[] = ['starter', 'pro', 'expert']

function getCourseList(category: Category, tier: TierKey) {
  const items: { levelLabel: string; levelKey: TierKey; titles: string[] }[] = []
  if (tier === 'starter') {
    items.push({ levelLabel: 'Starter', levelKey: 'starter', titles: category.courseTitles.starter })
  } else if (tier === 'pro') {
    items.push({ levelLabel: 'Starter', levelKey: 'starter', titles: category.courseTitles.starter })
    items.push({ levelLabel: 'Pro (adicionales)', levelKey: 'pro', titles: category.courseTitles.pro })
  } else {
    items.push({ levelLabel: 'Starter', levelKey: 'starter', titles: category.courseTitles.starter })
    items.push({ levelLabel: 'Pro (adicionales)', levelKey: 'pro', titles: category.courseTitles.pro })
    items.push({ levelLabel: 'Expert (adicionales)', levelKey: 'expert', titles: category.courseTitles.expert })
  }
  return items
}

interface Props {
  category: Category
  selected: TierKey | null
  onSelect: (categoryId: string, tier: TierKey | null) => void
}

export default function CategoryRow({ category, selected, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false)

  const handleTierClick = (tier: TierKey) => {
    onSelect(category.id, selected === tier ? null : tier)
    if (selected === tier) setExpanded(false)
  }

  const courseItems = getCourseList(category, selected ?? 'expert')
  const selectedTier = selected ? category.tiers[selected] : null

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
      selected
        ? 'border-purple-400 shadow-lg shadow-purple-100/60'
        : 'border-gray-100 shadow-sm hover:border-gray-200'
    }`}>
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-xl mt-0.5 shrink-0">{category.icon}</span>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base leading-tight">{category.name}</h3>
              <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{category.description}</p>
            </div>
          </div>
          {selectedTier && (
            <div className="shrink-0 text-right">
              <span className="text-purple-700 font-extrabold text-xl">${selectedTier.price}</span>
              <span className="text-xs text-gray-400 ml-1">USD</span>
            </div>
          )}
        </div>

        {/* ── Tier buttons ── */}
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map(tier => {
            const t = category.tiers[tier]
            const isSelected = selected === tier

            return (
              <button
                key={tier}
                onClick={() => handleTierClick(tier)}
                className={`relative text-left rounded-xl px-3 py-3 border-2 transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-100 bg-gray-50 hover:border-purple-200 hover:bg-purple-50/50'
                }`}
              >
                {/* Level label */}
                <div className={`text-xs font-bold tracking-wide mb-2 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`}>
                  {TIER_ICONS[tier]} {t.label.toUpperCase()}
                </div>

                {/* Price hero */}
                <div className={`font-extrabold text-xl leading-none mb-1.5 ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>
                  ${t.price}
                  <span className="text-xs font-normal ml-0.5 text-gray-400">USD</span>
                </div>

                {/* List price + savings */}
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-1.5">
                  <span className="text-xs text-gray-400 line-through">Lista ${t.listPrice}</span>
                  <span className="text-xs font-semibold text-emerald-600">−{t.savings}%</span>
                </div>

                {/* Stats */}
                <div className="text-xs text-gray-400 leading-relaxed">
                  {t.courses} cursos<br />{minutesToLabel(t.minutes)}
                </div>

                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Expandable course list ── */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs text-gray-400 hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold tracking-wide">
            {expanded ? '▲' : '▼'} Ver qué contiene esta especialización
          </span>
          {selected && (
            <span className="text-purple-600 font-semibold">
              {category.tiers[selected].courses} cursos · {minutesToLabel(category.tiers[selected].minutes)}
            </span>
          )}
        </button>

        {expanded && (
          <div className="px-5 pb-5 bg-gray-50 space-y-4">
            {courseItems.map(({ levelLabel, levelKey, titles }) => (
              <div key={levelKey}>
                <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded mb-2 ${
                  levelKey === 'starter' ? 'bg-emerald-100 text-emerald-700' :
                  levelKey === 'pro'     ? 'bg-sky-100 text-sky-700' :
                                          'bg-violet-100 text-violet-700'
                }`}>
                  {TIER_ICONS[levelKey]} {levelLabel}
                </div>
                <ul className="space-y-1.5 ml-1">
                  {titles.map((title, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="text-gray-300 mt-0.5 shrink-0">›</span>
                      <span>{title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
