'use client'

import { UpgradeKey } from '@/lib/courses'
import { useCatalog } from '@/components/CatalogProvider'
import { flyToRemito } from './fly'

const UPGRADE_CODES: Record<UpgradeKey, string> = {
  'starter-to-pro': 'UPG-01',
  'pro-to-expert': 'UPG-02',
}

interface Props {
  activeUpgrade: UpgradeKey | null
  onPick: (key: UpgradeKey) => void
}

export default function UpgradeCards({ activeUpgrade, onPick }: Props) {
  const { upgrades: UPGRADE_PRICES } = useCatalog()
  const keys = Object.keys(UPGRADE_PRICES) as UpgradeKey[]

  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-xs" style={{ letterSpacing: '.1em', color: '#4A4F5C' }}>
        ¿YA TENÉS UN NIVEL? UPGRADEÁ AL SIGUIENTE
      </span>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))' }}>
        {keys.map(key => {
          const u = UPGRADE_PRICES[key]
          const sel = activeUpgrade === key
          const code = UPGRADE_CODES[key]

          const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            const wasActive = sel
            onPick(key)
            if (!wasActive) {
              flyToRemito(e.currentTarget, `${code} → REMITO`)
            }
          }

          return (
            <div
              key={key}
              className="flex items-center gap-4 px-[18px] py-4"
              style={{ border: `1px dashed ${sel ? '#7E22CE' : 'rgba(11,13,18,.28)'}`, background: '#F6F4EE' }}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="font-mono text-[11px]" style={{ letterSpacing: '.12em', color: '#7E22CE' }}>{code}</span>
                <span className="font-display font-semibold" style={{ fontSize: 17, lineHeight: 1.2 }}>{u.label}</span>
                <span className="text-[13px]" style={{ color: '#4A4F5C', lineHeight: 1.3 }}>
                  Requiere verificar tu compra anterior
                </span>
              </div>
              <span className="whitespace-nowrap font-mono" style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-.03em' }}>
                USD {u.price}
              </span>
              <button
                type="button"
                onClick={handleClick}
                aria-pressed={sel}
                aria-label={`${sel ? 'Quitar' : 'Agregar'} upgrade ${u.from} a ${u.to}`}
                className="grid flex-none place-items-center font-mono"
                style={{
                  width: 48,
                  height: 48,
                  border: '1px solid #A855F7',
                  background: sel ? '#A855F7' : '#0B0D12',
                  color: sel ? '#07080B' : '#E8EAF0',
                  fontWeight: 700,
                  fontSize: 20,
                  cursor: 'pointer',
                }}
              >
                {sel ? '✓' : '+'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
