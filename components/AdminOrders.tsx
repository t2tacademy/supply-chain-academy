'use client'

import { useState, useMemo } from 'react'
import type { Order, OrderSelection } from '@/lib/supabase'

const STATUS_LABELS: Record<string, { text: string; cls: string }> = {
  pending:  { text: 'Pendiente', cls: 'bg-yellow-100 text-yellow-800' },
  approved: { text: 'Aprobado',  cls: 'bg-green-100 text-green-800' },
  rejected: { text: 'Rechazado', cls: 'bg-red-100 text-red-800' },
}

const METHOD_LABELS: Record<string, string> = {
  mercadopago:   'Mercado Pago',
  transferencia: 'BBVA Pesos',
  'bbva-usd':    'BBVA USD',
  paypal:        'PayPal',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function exportCSV(orders: Order[]) {
  const rows = [
    ['Fecha', 'Nombre', 'Email', 'Teléfono', 'Módulos', 'Total USD', 'Método', 'Estado'],
    ...orders.map(o => [
      formatDate(o.created_at),
      o.customer_name,
      o.customer_email,
      o.customer_phone ?? '',
      (o.selections as OrderSelection[]).map(s => `${s.categoryName} ${s.tierLabel}`).join(' | '),
      Number(o.total_usd).toFixed(2),
      METHOD_LABELS[o.payment_method] ?? o.payment_method,
      STATUS_LABELS[o.status]?.text ?? o.status,
    ]),
  ]
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ordenes-t2t-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminOrders({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [resendDoneId, setResendDoneId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = filter === 'all' || o.status === filter
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [orders, search, filter])

  const pending  = orders.filter(o => o.status === 'pending').length
  const approved = orders.filter(o => o.status === 'approved').length
  const totalUsd = orders.reduce((s, o) => s + Number(o.total_usd), 0)
  const totalApprovedUsd = orders.filter(o => o.status === 'approved').reduce((s, o) => s + Number(o.total_usd), 0)

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total órdenes', value: orders.length, color: 'text-gray-900' },
          { label: 'Pendientes',    value: pending,       color: 'text-yellow-600' },
          { label: 'Aprobadas',     value: approved,      color: 'text-green-600' },
          { label: 'Recaudado',     value: `$${totalApprovedUsd.toFixed(0)} USD`, color: 'text-purple-700' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter + Export */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Aprobadas'}
            </button>
          ))}
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          📥 Exportar CSV
        </button>
      </div>

      {/* Results count */}
      {search || filter !== 'all' ? (
        <p className="text-sm text-gray-400 mb-4">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
      ) : null}

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">{search ? '🔍' : '📭'}</p>
          <p className="font-medium">{search ? 'No hay resultados para esa búsqueda.' : 'Todavía no hay órdenes.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS['pending']
            const approveUrl = `/api/approve/${order.approve_token}`

            const resendUrl = `/api/resend-access/${order.approve_token}`
            const rejectUrl = `/api/reject/${order.approve_token}`
            const isDoneResend = resendDoneId === order.id
            const isResending = resendingId === order.id

            async function handleResend() {
              if (isResending || isDoneResend) return
              setResendingId(order.id)
              await fetch(resendUrl, { method: 'POST' })
              setResendingId(null)
              setResendDoneId(order.id)
              setTimeout(() => setResendDoneId(null), 4000)
            }

            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">{order.customer_name}</p>
                    <p className="text-sm text-gray-400">{order.customer_email}</p>
                    {order.customer_phone && <p className="text-sm text-gray-400">{order.customer_phone}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.cls}`}>
                      {statusInfo.text}
                    </span>
                    <span className="text-purple-700 font-extrabold text-lg">${Number(order.total_usd).toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Selections */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Módulos comprados</p>
                  <div className="flex flex-wrap gap-2">
                    {(order.selections as OrderSelection[]).map((sel, i) => (
                      <span key={i} className="bg-purple-50 text-purple-800 text-xs font-medium px-3 py-1 rounded-full border border-purple-200">
                        {sel.categoryName} — {sel.tierLabel}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                    <span>📅 {formatDate(order.created_at)}</span>
                    <span>💳 {METHOD_LABELS[order.payment_method] ?? order.payment_method}</span>
                    {order.comprobante_url && (
                      <a href={`/admin/comprobante/${order.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        📎 Ver comprobante
                      </a>
                    )}
                    {order.approved_at && (
                      <span className="text-green-600">✓ Aprobado {formatDate(order.approved_at)}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <>
                        <a
                          href={approveUrl}
                          className="bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors"
                        >
                          ✅ Confirmar pago
                        </a>
                        <a
                          href={rejectUrl}
                          onClick={e => {
                            if (!confirm(`¿Rechazar la orden de ${order.customer_name}?`)) e.preventDefault()
                          }}
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-5 py-2 rounded-lg text-sm transition-colors"
                        >
                          ❌ Rechazar
                        </a>
                      </>
                    )}
                    {order.status === 'approved' && (
                      <button
                        onClick={handleResend}
                        disabled={isResending || isDoneResend}
                        className={`font-bold px-5 py-2 rounded-lg text-sm transition-colors ${
                          isDoneResend
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-700 disabled:opacity-50'
                        }`}
                      >
                        {isDoneResend ? '✓ Email reenviado' : isResending ? 'Enviando...' : '📧 Reenviar acceso'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
