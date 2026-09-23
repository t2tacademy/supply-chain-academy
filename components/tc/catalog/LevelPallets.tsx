'use client'

import { getLevelTotals, minutesToLabel, TierKey } from '@/lib/courses'
import { TIER_TRI, TIER_SHORT } from './codes'
import { flyToRemito } from './fly'

const TIERS: TierKey[] = ['starter', 'pro', 'expert']
const TIER_NAME: Record<TierKey, string> = { starter: 'Starter', pro: 'Pro', expert: 'Expert' }
// Purely decorative pallet-layer heights (mirrors the source design's stacked SKU bars)
const LAYER_HEIGHT: Record<TierKey, number> = { starter: 36, pro: 46, expert: 56 }

interface Props {
  activeTier: TierKey | null
  onPick: (tier: TierKey) => void
}

function rank(tier: TierKey): number {
  return TIERS.indexOf(tier) + 1
}

function dropLayers(tierCode: string) {
  if (typeof document === 'undefined') return
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  requestAnimationFrame(() => {
    const layers = [...document.querySelectorAll(`[data-card="${tierCode}"] [data-layer]`)].reverse()
    layers.forEach((layer, i) => {
      layer.animate(
        [
          { transform: 'translateY(-46px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
        { duration: 380, delay: i * 110, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' }
      )
    })
  })
}

export default function LevelPallets({ activeTier, onPick }: Props) {
  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,230px),1fr))' }}>
      {TIERS.map(tier => {
        const totals = getLevelTotals(tier)
        const savings = totals.listPrice > 0 ? Math.round(((totals.listPrice - totals.price) / totals.listPrice) * 100) : 0
        const sel = activeTier === tier
        const tierCode = TIER_SHORT[tier]
        const includedTiers = TIERS.filter(t => rank(t) <= rank(tier)).reverse() // own first, then lower tiers

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
          const wasActive = sel
          onPick(tier)
          if (!wasActive) {
            flyToRemito(e.currentTarget, `CAT-${tierCode} → REMITO`)
            dropLayers(tierCode)
          }
        }

        return (
          <article
            key={tier}
            data-card={tierCode}
            className="relative flex flex-col transition-colors duration-200"
            style={{
              border: `1px solid ${sel ? '#A855F7' : 'rgba(11,13,18,.14)'}`,
              background: sel ? '#0B0D12' : '#F3F5F8',
              boxShadow: sel ? '0 0 0 1px #A855F7,0 24px 60px rgba(88,28,135,.35)' : '0 1px 0 rgba(11,13,18,.06)',
              color: sel ? '#E8EAF0' : '#0B0D12',
            }}
          >
            {/* pallet visualization */}
            <div
              aria-hidden="true"
              className="flex flex-col justify-end px-[18px] pt-[18px]"
              style={{
                height: 196,
                borderBottom: '1px solid rgba(128,128,128,.28)',
                backgroundImage: 'linear-gradient(rgba(128,128,128,.14) 1px,transparent 1px)',
                backgroundSize: '100% 16px',
              }}
            >
              {includedTiers.map(t => {
                const own = t === tier
                return (
                  <div
                    key={t}
                    data-layer="1"
                    className="mt-1 flex items-center justify-between px-3 font-mono"
                    style={{
                      height: LAYER_HEIGHT[t],
                      border: `1px solid ${own ? '#A855F7' : sel ? 'rgba(74,222,128,.5)' : 'rgba(22,101,52,.5)'}`,
                      background: own ? (sel ? 'rgba(168,85,247,.34)' : 'rgba(168,85,247,.14)') : sel ? 'rgba(74,222,128,.08)' : 'rgba(22,101,52,.08)',
                      color: own ? (sel ? '#E8EAF0' : '#3B0764') : sel ? '#4ADE80' : '#166534',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      letterSpacing: '.1em',
                    }}
                  >
                    <span>{TIER_TRI[t]} {TIER_NAME[t].toUpperCase()}</span>
                    <span>{own ? `${getLevelTotals(t).courses} SKU` : 'INCLUIDO'}</span>
                  </div>
                )
              })}
              <div className="mt-1" style={{ height: 6, background: '#3a3e47' }} />
              <div className="flex justify-between" style={{ height: 8 }}>
                <span style={{ width: '18%', background: '#2a2d33' }} />
                <span style={{ width: '18%', background: '#2a2d33' }} />
                <span style={{ width: '18%', background: '#2a2d33' }} />
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3.5 px-[18px] pb-[18px] pt-5">
              <div className="flex items-center justify-between font-mono text-[11px] tracking-[.12em]">
                <span style={{ color: sel ? '#C084FC' : '#7E22CE' }}>CAT-{tierCode}</span>
                <span style={{ color: sel ? '#9AA1B1' : '#4A4F5C' }}>{TIER_TRI[tier]}</span>
              </div>
              <h4 className="m-0 font-display" style={{ fontWeight: 700, fontSize: 28, lineHeight: 1, letterSpacing: '-.03em' }}>
                {TIER_NAME[tier]}
              </h4>
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-sm" style={{ color: sel ? '#9AA1B1' : '#4A4F5C' }}>USD</span>
                <span style={{ fontWeight: 700, fontSize: 52, lineHeight: 1, letterSpacing: '-.05em' }}>{totals.price}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 font-mono text-[13px]">
                <span style={{ color: sel ? '#9AA1B1' : '#4A4F5C' }}>Lista <s>USD {totals.listPrice}</s></span>
                <span className="font-bold" style={{ padding: '4px 7px', background: '#FFB020', color: '#07080B' }}>−{savings}%</span>
              </div>
              <div
                className="font-mono text-[13px]"
                style={{ lineHeight: 1.4, paddingTop: 12, borderTop: '1px dashed rgba(128,128,128,.4)' }}
              >
                {totals.courses} cursos · {minutesToLabel(totals.minutes)}
              </div>
              <button
                type="button"
                onClick={handleClick}
                aria-pressed={sel}
                className="mt-auto flex items-center justify-center gap-2.5 font-display transition-colors duration-200"
                style={{
                  minHeight: 48,
                  border: '1px solid #A855F7',
                  background: sel ? '#A855F7' : '#0B0D12',
                  color: sel ? '#07080B' : '#E8EAF0',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '.02em',
                  cursor: 'pointer',
                }}
              >
                {sel ? '✓ En el remito' : 'Cargar al pedido →'}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
