'use client'

import { useState } from 'react'

export type PaymentMethod = 'mercadopago' | 'transferencia' | 'bbva-usd' | 'paypal'

interface Props {
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
  country?: 'argentina' | 'internacional'
}

const ALL_TABS: { id: PaymentMethod; label: string; flag: string; countries: ('argentina' | 'internacional')[] }[] = [
  { id: 'mercadopago',   label: 'Mercado Pago', flag: '🇦🇷', countries: ['argentina'] },
  { id: 'transferencia', label: 'BBVA Pesos',   flag: '🏦',  countries: ['argentina'] },
  { id: 'bbva-usd',      label: 'BBVA USD',     flag: '💵',  countries: ['argentina', 'internacional'] },
  { id: 'paypal',        label: 'PayPal',        flag: '🌎',  countries: ['argentina', 'internacional'] },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors font-medium"
    >
      {copied ? '✓ Copiado' : 'Copiar'}
    </button>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 gap-4">
      <span className="text-gray-500 text-sm font-medium w-24 flex-shrink-0">{label}</span>
      <span className="text-gray-900 font-mono text-sm flex-1 truncate">{value}</span>
      <CopyButton text={value} />
    </div>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
      {children}
    </div>
  )
}

export default function PaymentTabs({ selected, onSelect, country = 'argentina' }: Props) {
  const TABS = ALL_TABS.filter(t => t.countries.includes(country))
  return (
    <div>
      {/* Tabs */}
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
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        {selected === 'mercadopago' && (
          <div>
            <Row label="Alias" value="puma.tara.antes.mp" />
            <Row label="CVU" value="0000003100067943060793" />
            <Row label="Titular" value="Gustavo Rodriguez" />
            <InfoBox>
              Mercado Pago acepta tarjetas de crédito/débito. El pago es en pesos al tipo de cambio oficial del día.
            </InfoBox>
          </div>
        )}

        {selected === 'transferencia' && (
          <div>
            <Row label="Banco" value="BBVA" />
            <Row label="CBU" value="0170075640000075295354" />
            <Row label="Alias" value="GER1499" />
            <Row label="Titular" value="Gustavo Rodriguez" />
            <InfoBox>
              Transferencia en pesos argentinos (ARS). El precio en USD se convierte al tipo de cambio oficial del día.
            </InfoBox>
          </div>
        )}

        {selected === 'bbva-usd' && (
          <div>
            <Row label="Banco" value="BBVA" />
            <Row label="CBU" value="0170075640000074817786" />
            <Row label="Alias" value="GER1499u" />
            <Row label="Titular" value="Gustavo Rodriguez" />
            <InfoBox>
              Cuenta en dólares (USD). Transferí el importe exacto en USD. Disponible para Argentina y el exterior.
            </InfoBox>
          </div>
        )}

        {selected === 'paypal' && (
          <div>
            <Row label="Usuario" value="@gustrodriguez" />
            <div className="flex items-center justify-between py-3 border-b border-gray-100 gap-4">
              <span className="text-gray-500 text-sm font-medium w-24 flex-shrink-0">Link directo</span>
              <a href="https://paypal.me/gustrodriguez" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex-1">paypal.me/gustrodriguez</a>
              <CopyButton text="paypal.me/gustrodriguez" />
            </div>
            <InfoBox>
              Pagá en USD desde cualquier país. Seleccioná &quot;envío a amigos&quot; para evitar comisiones adicionales.
            </InfoBox>
          </div>
        )}
      </div>

      {/* How you receive access */}
      <div className="mt-4 bg-gray-100 rounded-xl p-4 text-sm text-gray-700 space-y-1">
        <p>📁 <strong>¿Cómo recibís los cursos?</strong> Una vez confirmado el pago, te enviamos el link de tu carpeta de Google Drive al email que ingresaste.</p>
        <p>⏳ <strong>Acceso:</strong> tenés <strong>3 meses para descargar</strong> los videos desde la fecha de activación.</p>
        <p>⏱ <strong>Tiempo de activación:</strong> menos de 24 horas hábiles desde que recibimos el comprobante.</p>
      </div>
    </div>
  )
}
