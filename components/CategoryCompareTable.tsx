'use client'

import { useState } from 'react'
import { CATEGORIES, TierKey, minutesToLabel } from '@/lib/courses'
import { SPEC_CODES, TIER_TRI } from '@/components/tc/catalog/codes'
import { flyToRemito } from '@/components/tc/catalog/fly'

const TIERS: TierKey[] = ['starter', 'pro', 'expert']
const TIER_NAME: Record<TierKey, string> = { starter: 'Starter', pro: 'Pro', expert: 'Expert' }

interface Props {
  selections: Record<string, TierKey>
  onSelect: (categoryId: string, tier: TierKey | null) => void
}

// Deterministic pseudo-random barcode gradient, same algorithm as the source
// design's bars() helper (also ported in Remito.tsx for the paper barcode).
function barsGradient(seed: string, color = '#C084FC'): string {
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

function rank(tier: TierKey): number {
  return TIERS.indexOf(tier) + 1
}

export default function CategoryCompareTable({ selections, onSelect }: Props) {
  const [activeCatId, setActiveCatId] = useState(CATEGORIES[0].id)
  const cat = CATEGORIES.find(c => c.id === activeCatId)!
  const code = SPEC_CODES[cat.id] ?? cat.id

  return (
    <div className="flex flex-col gap-6" style={{ color: '#E8EAF0' }}>
      {/* Terminal-style tab picker */}
      <div style={{ border: '1px solid rgba(255,255,255,.1)', background: '#0B0D12' }}>
        <div
          className="flex items-center gap-3 overflow-hidden font-mono text-xs"
          style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.08)', color: '#9AA1B1' }}
        >
          <span aria-hidden="true" className="flex flex-none gap-1.5">
            <span style={{ width: 8, height: 8, border: '1px solid #9AA1B1' }} />
            <span style={{ width: 8, height: 8, border: '1px solid #9AA1B1' }} />
            <span style={{ width: 8, height: 8, background: '#A855F7' }} />
          </span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            ctrl@t2t:~/catalogo$ <span style={{ color: '#E8EAF0' }}>ls --especializaciones</span>
          </span>
        </div>
        <div role="tablist" aria-label="Especializaciones" className="flex flex-wrap gap-1.5 p-3.5">
          {CATEGORIES.map(c => {
            const active = c.id === activeCatId
            const cCode = SPEC_CODES[c.id] ?? c.id
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCatId(c.id)}
                className="flex items-center gap-2.5 px-3.5 transition-colors"
                style={{
                  minHeight: 44,
                  border: `1px solid ${active ? '#A855F7' : 'rgba(255,255,255,.12)'}`,
                  background: active ? '#A855F7' : 'transparent',
                  color: active ? '#07080B' : '#E8EAF0',
                  cursor: 'pointer',
                }}
              >
                <span className="font-mono text-[11px] font-bold" style={{ letterSpacing: '.06em', color: active ? '#07080B' : '#C084FC' }}>
                  {cCode}
                </span>
                <span className="font-display font-semibold text-sm">{c.name}</span>
              </button>
            )
          })}
        </div>
        <div className="font-mono text-sm" style={{ padding: '0 14px 14px', color: '#E8EAF0' }}>
          <span style={{ color: '#4ADE80' }}>{'>'}</span> {cat.description}
        </div>
      </div>

      {/* Level cards */}
      <div className="tc-lv-track">
        {TIERS.map(tier => {
          const t = cat.tiers[tier]
          const sel = selections[cat.id] === tier
          const r = rank(tier)
          const off = t.listPrice > 0 ? Math.round((1 - t.price / t.listPrice) * 100) : 0
          const hasInherit = r > 1
          const prevTiers = TIERS.filter(x => rank(x) < r)
          const prevCourseCount = prevTiers.reduce((sum, x) => sum + cat.courseTitles[x].length, 0)
          const inheritTag = r === 2 ? 'Incluye Starter' : 'Incluye Starter + Pro'
          const inheritText = `Incluye ${prevTiers.map(x => TIER_NAME[x]).join(' + ')} · ${prevCourseCount} cursos`
          const listTitle = r > 1 ? `${TIER_NAME[tier].toUpperCase()} · ADICIONALES` : 'STARTER · CONTENIDO'
          const sku = `${code}-${tier}-${String(t.courses).padStart(3, '0')}`

          const handlePick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (sel) {
              onSelect(cat.id, null)
              return
            }
            onSelect(cat.id, tier)
            flyToRemito(e.currentTarget, `${code} ${tier.toUpperCase()} → REMITO`)
          }

          return (
            <article
              key={tier}
              className="flex flex-col transition-colors duration-200"
              style={{
                border: `1px solid ${sel ? '#A855F7' : 'rgba(255,255,255,.1)'}`,
                background: sel ? 'rgba(168,85,247,.07)' : 'rgba(22,24,28,.9)',
                boxShadow: sel ? '0 0 0 1px #A855F7,0 0 40px rgba(168,85,247,.25)' : 'none',
              }}
            >
              <div className="flex flex-col gap-3.5 p-[18px]">
                <div className="flex items-center justify-between gap-2 font-mono text-[11px] font-semibold" style={{ letterSpacing: '.1em' }}>
                  <span style={{ color: '#C084FC' }}>{code} · {tier.toUpperCase()}</span>
                  <span style={{ color: '#9AA1B1' }}>{TIER_TRI[tier]}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="m-0 font-display" style={{ fontWeight: 700, fontSize: 26, lineHeight: 1, letterSpacing: '-.03em' }}>
                    {TIER_NAME[tier]}
                  </h4>
                  {hasInherit && (
                    <span
                      className="font-mono text-[10.5px] font-semibold"
                      style={{ padding: '4px 7px', border: '1px solid rgba(74,222,128,.5)', color: '#4ADE80', letterSpacing: '.06em' }}
                    >
                      {inheritTag}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[13px]" style={{ color: '#9AA1B1' }}>USD</span>
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: 46, lineHeight: 1, letterSpacing: '-.05em' }}>{t.price}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 font-mono text-[13px]">
                  <span style={{ color: '#9AA1B1' }}>Lista <s>USD {t.listPrice}</s></span>
                  <span className="font-bold" style={{ padding: '4px 7px', background: '#FFB020', color: '#07080B' }}>−{off}%</span>
                </div>
                <dl
                  className="m-0 grid grid-cols-2"
                  style={{ borderTop: '1px solid rgba(255,255,255,.08)', borderBottom: '1px solid rgba(255,255,255,.08)' }}
                >
                  <div className="flex flex-col gap-1.5" style={{ padding: '10px 0' }}>
                    <dt className="font-mono text-[10px]" style={{ letterSpacing: '.12em', color: '#9AA1B1' }}>CURSOS</dt>
                    <dd className="m-0 font-mono font-bold text-lg">{t.courses}</dd>
                  </div>
                  <div className="flex flex-col gap-1.5" style={{ padding: '10px 0 10px 12px', borderLeft: '1px solid rgba(255,255,255,.08)' }}>
                    <dt className="font-mono text-[10px]" style={{ letterSpacing: '.12em', color: '#9AA1B1' }}>DURACIÓN</dt>
                    <dd className="m-0 font-mono font-bold text-lg">{minutesToLabel(t.minutes)}</dd>
                  </div>
                </dl>
                <div aria-hidden="true" className="flex flex-col gap-1.5">
                  <div style={{ height: 30, background: barsGradient(sku) }} />
                  <span className="font-mono text-[10px]" style={{ letterSpacing: '.2em', color: '#9AA1B1' }}>{sku}</span>
                </div>
                <button
                  type="button"
                  onClick={handlePick}
                  aria-pressed={sel}
                  className="flex items-center justify-center font-display transition-colors duration-200"
                  style={{
                    minHeight: 48,
                    border: '1px solid #A855F7',
                    background: sel ? '#A855F7' : 'transparent',
                    color: sel ? '#07080B' : '#E8EAF0',
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: '.02em',
                    cursor: 'pointer',
                  }}
                >
                  {sel ? '✓ En el remito' : `Agregar ${TIER_NAME[tier]} →`}
                </button>
              </div>

              <div
                aria-hidden="true"
                className="relative mx-3.5"
                style={{ height: 0, borderTop: '1.5px dashed rgba(255,255,255,.18)' }}
              >
                <span
                  className="absolute rounded-full"
                  style={{ left: -23, top: -9, width: 16, height: 16, background: '#07080B', border: `1px solid ${sel ? '#A855F7' : 'rgba(255,255,255,.1)'}` }}
                />
                <span
                  className="absolute rounded-full"
                  style={{ right: -23, top: -9, width: 16, height: 16, background: '#07080B', border: `1px solid ${sel ? '#A855F7' : 'rgba(255,255,255,.1)'}` }}
                />
              </div>

              <div className="flex flex-col gap-2" style={{ padding: '16px 18px 18px' }}>
                {hasInherit && (
                  <div
                    className="font-mono text-xs"
                    style={{ padding: '9px 10px', border: '1px solid rgba(74,222,128,.28)', background: 'rgba(74,222,128,.06)', color: '#4ADE80', lineHeight: 1.35 }}
                  >
                    ▼ {inheritText}
                  </div>
                )}
                <span className="font-mono text-[10.5px]" style={{ letterSpacing: '.12em', color: '#9AA1B1', paddingTop: 4 }}>
                  {listTitle}
                </span>
                <ul className="m-0 flex list-none flex-col p-0">
                  {cat.courseTitles[tier].map((title, i) => (
                    <li
                      key={i}
                      className="grid gap-2.5"
                      style={{ gridTemplateColumns: '62px 1fr', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}
                    >
                      <span className="font-mono text-[10.5px] font-semibold" style={{ lineHeight: 1.5, color: '#C084FC' }}>
                        {`${code.replace(/[^A-Z]/g, '').slice(0, 3) || 'SKU'}-${tier[0].toUpperCase()}${String(i + 1).padStart(2, '0')}`}
                      </span>
                      <span className="text-[13.5px]" style={{ color: '#E8EAF0', lineHeight: 1.4 }}>{title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
