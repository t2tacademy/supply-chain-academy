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
  flag: string
  countries: ('argentina' | 'internacional')[]
  description: string
}[] = [
  {
    id: 'mercadopago',
    label: 'Mercado Pago',
    flag: '🇦🇷',
    countries: ['argentina'],
    description: 'Transferencia o pago con tarjeta de crédito/débito en pesos (ARS).',
  },
  {
    id: 'transferencia',
    label: 'BBVA Pesos',
    flag: '🏦',
    countries: ['argentina'],
    description: 'Transferencia bancaria en pesos argentinos (ARS).',
  },
  {
    id: 'bbva-usd',
    label: 'BBVA USD',
    flag: '💵',
    countries: ['argentina', 'internacional'],
    description: 'Transferencia bancaria en dólares (USD). Disponible desde Argentina y el exterior.',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    flag: '🌎',
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
    <div>
      {/* Method selector */}
      <div className="flex flex-wrap gap-1 mb-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selected === tab.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{tab.flag}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-sm text-gray-600">{activeTab.description}</p>

        <div className="bg-white border border-green-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">¿Cómo recibo los datos de pago?</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Escribinos por WhatsApp y Gustavo te envía el CBU / alias / usuario según el método elegido.
            </p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Escribir a Gustavo
          </a>
        </div>
      </div>
    </div>
  )
}
