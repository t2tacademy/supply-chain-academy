'use client'

import { Category, TierKey, minutesToLabel } from '@/lib/courses'

const TIER_COLORS: Record<TierKey, { badge: string; button: string }> = {
  starter: { badge: 'bg-green-100 text-green-800', button: 'border-green-400' },
  pro:     { badge: 'bg-blue-100 text-blue-800',   button: 'border-blue-400' },
  expert:  { badge: 'bg-purple-100 text-purple-800', button: 'border-purple-500' },
}

interface Props {
  category: Category
  selected: TierKey | null
  onSelect: (categoryId: string, tier: TierKey | null) => void
}

export default function CategoryCard({ category, selected, onSelect }: Props) {
  const tiers: TierKey[] = ['starter', 'pro', 'expert']

  const handleClick = (tier: TierKey) => {
    onSelect(category.id, selected === tier ? null : tier)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{category.icon}</span>
          <h3 className="font-bold text-gray-900 text-lg leading-tight">{category.name}</h3>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">{category.description}</p>
      </div>

      {/* Tier options */}
      <div className="p-4 space-y-2">
        {tiers.map((tier) => {
          const t = category.tiers[tier]
          const isSelected = selected === tier
          const colors = TIER_COLORS[tier]

          return (
            <button
              key={tier}
              onClick={() => handleClick(tier)}
              className={`tier-card w-full text-left rounded-xl border-2 p-3 cursor-pointer ${
                isSelected ? 'tier-card-selected' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                        {t.label}
                      </span>
                      <span className="text-gray-500 text-xs truncate">{t.includes}</span>
                    </div>
                  </div>
                </div>
                <span className={`font-bold text-base flex-shrink-0 ml-2 ${isSelected ? 'text-purple-700' : 'text-gray-800'}`}>
                  ${t.price.toFixed(2)}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="px-4 pb-4">
          <div className="bg-purple-50 rounded-lg px-3 py-2 text-xs text-purple-700">
            ✓ {category.tiers[selected].includes}
          </div>
        </div>
      )}
    </div>
  )
}
