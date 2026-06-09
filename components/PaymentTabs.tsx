'use client'

import { useState } from 'react'

export type PaymentMethod = 'mercadopago' | 'transferencia' | 'paypal' | 'internacional'

interface Props {
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}

const TABS: { id: PaymentMethod; label: string; flag: string }[] = [
  { id: 'mercadopago', label: 'Mercado Pago', flag: '🇦🇷' },
  { id: 'transferencia', label: 'Transferencia AR', flag: '🏦' },
  { id: 'paypal', label: 'PayPal', flag: '🌎' },
  { id: 'internacional', label: 'Internacional', flag: '🌐' },
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

export default function PaymentTabs({ selected, onSelect }: Props) {
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
            <Row label="Alias" value="T2T.ACADEMY.MP" />
            <Row label="CVU" value="COMPLETAR_CVU_MP" />
            <Row label="Titular" value="Gustavo Rodriguez" />
            <InfoBox>
              Mercado Pago acepta tarjetas de crédito/débito en cuotas. Podés pagar desde cualquier país de LATAM.
            </InfoBox>
          </div>
        )}

        {selected === 'transferencia' && (
          <div>
            <Row label="Banco" value="COMPLETAR_NOMBRE_BANCO" />
            <Row label="CBU" value="COMPLETAR_CBU" />
            <Row label="Alias" value="T2T.ACADEMY" />
            <Row label="CUIT" value="COMPLETAR_CUIT" />
            <Row label="Titular" value="Gustavo Rodriguez" />
            <InfoBox>
              Transferencia en pesos argentinos. El precio se convierte al tipo de cambio oficial del día.
            </InfoBox>
          </div>
        )}

        {selected === 'paypal' && (
          <div>
            <Row label="Email" value="pagos@t2tacademy.com" />
            <Row label="Link" value="paypal.me/t2tacademy" />
            <InfoBox>
              Pagá en USD desde cualquier país. Seleccioná &quot;envío a amigos&quot; para evitar comisiones adicionales.
            </InfoBox>
          </div>
        )}

        {selected === 'internacional' && (
          <div>
            <Row label="Banco" value="COMPLETAR_BANCO — Sucursal COMPLETAR" />
            <Row label="SWIFT/BIC" value="COMPLETAR_SWIFT" />
            <Row label="IBAN/Cuenta" value="COMPLETAR_IBAN" />
            <Row label="Titular" value="Gustavo Rodriguez" />
            <Row label="Dirección" value="Buenos Aires, Argentina" />
            <InfoBox>
              Para transferencias desde México, Colombia, Perú, Chile, Uruguay y Brasil. Usá el precio en USD.
            </InfoBox>
          </div>
        )}
      </div>

      {/* How you receive access */}
      <div className="mt-4 bg-gray-100 rounded-xl p-4 text-sm text-gray-700 space-y-1">
        <p>📁 <strong>¿Cómo recibís los cursos?</strong> Una vez confirmado el pago, te enviamos el link de tu carpeta de Google Drive con todos los videos del pack al email que ingresaste. El acceso es permanente.</p>
        <p>⏱ <strong>Tiempo de activación:</strong> menos de 24 horas hábiles desde que recibimos el comprobante.</p>
      </div>
    </div>
  )
}
