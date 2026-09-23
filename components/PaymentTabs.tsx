'use client'

export type PaymentMethod = 'mercadopago' | 'transferencia' | 'bbva-usd' | 'paypal'

interface Props {
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
  country?: 'argentina' | 'internacional'
  whatsappUrl?: string
}

const ALL_TABS: {
  id: PaymentMethod
  label: string
  code: string
  countries: ('argentina' | 'internacional')[]
  description: string
}[] = [
  {
    id: 'mercadopago',
    label: 'Mercado Pago',
    code: 'ARS',
    countries: ['argentina'],
    description: 'Transferencia o pago con tarjeta de crédito/débito en pesos (ARS).',
  },
  {
    id: 'transferencia',
    label: 'BBVA Pesos',
    code: 'ARS',
    countries: ['argentina'],
    description: 'Transferencia bancaria en pesos argentinos (ARS).',
  },
  {
    id: 'bbva-usd',
    label: 'BBVA USD',
    code: 'USD',
    countries: ['argentina', 'internacional'],
    description: 'Transferencia bancaria en dólares (USD). Disponible desde Argentina y el exterior.',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    code: 'INTL',
    countries: ['argentina', 'internacional'],
    description: 'Pago en USD desde cualquier país. Seleccioná "envío a amigos" para evitar comisiones adicionales.',
  },
]

const DEFAULT_WA = `https://wa.me/5491134030955?text=${encodeURIComponent('¡Hola Gustavo! Quiero comprar del Catálogo Supply Chain. ¿Me podés pasar los datos de pago?')}`

export default function PaymentTabs({ selected, onSelect, country = 'argentina', whatsappUrl }: Props) {
  const TABS = ALL_TABS.filter(t => t.countries.includes(country))
  const activeTab = TABS.find(t => t.id === selected) ?? TABS[0]
  const waUrl = whatsappUrl ?? DEFAULT_WA

  return (
    <div className="font-sans" style={{ color: '#E8EAF0' }}>
      {/* Method selector */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map(tab => {
          const active = selected === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelect(tab.id)}
              className="flex items-center gap-2.5 px-3.5 transition-colors"
              style={{
                minHeight: 44,
                border: `1px solid ${active ? '#A855F7' : 'rgba(255,255,255,.12)'}`,
                background: active ? '#A855F7' : 'transparent',
                color: active ? '#07080B' : '#E8EAF0',
                cursor: 'pointer',
              }}
            >
              <span
                className="font-mono text-[10.5px] font-bold"
                style={{ letterSpacing: '.08em', color: active ? '#07080B' : '#C084FC' }}
              >
                {tab.code}
              </span>
              <span className="font-display text-sm font-semibold">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-5" style={{ border: '1px solid rgba(255,255,255,.1)', background: '#0B0D12' }}>
        <p className="text-sm" style={{ color: '#9AA1B1' }}>{activeTab.description}</p>

        <div
          className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center"
          style={{ border: '1px solid rgba(74,222,128,.28)', background: 'rgba(74,222,128,.06)' }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold" style={{ color: '#E8EAF0' }}>¿Cómo recibo los datos de pago?</p>
            <p className="mt-0.5 text-xs" style={{ color: '#9AA1B1' }}>
              Escribinos por WhatsApp y Gustavo te envía el CBU / alias / usuario según el método elegido.
            </p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-bold transition-colors"
            style={{ background: '#4ADE80', color: '#07080B' }}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Escribir a Gustavo
          </a>
        </div>
      </div>
    </div>
  )
}
