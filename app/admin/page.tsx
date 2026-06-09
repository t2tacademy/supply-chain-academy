import { supabase } from '@/lib/supabase'
import type { Order, OrderSelection } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data ?? []
}

const STATUS_LABELS: Record<string, { text: string; cls: string }> = {
  pending:  { text: 'Pendiente', cls: 'bg-yellow-100 text-yellow-800' },
  approved: { text: 'Aprobado',  cls: 'bg-green-100 text-green-800' },
  rejected: { text: 'Rechazado', cls: 'bg-red-100 text-red-800' },
}

const METHOD_LABELS: Record<string, string> = {
  mercadopago:    'Mercado Pago',
  transferencia:  'Transferencia AR',
  paypal:         'PayPal',
  internacional:  'Internacional',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function AdminPage() {
  const orders = await getOrders()

  const pending  = orders.filter(o => o.status === 'pending').length
  const approved = orders.filter(o => o.status === 'approved').length
  const total    = orders.reduce((s, o) => s + Number(o.total_usd), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0A0A0F] text-white px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-purple-400 text-xs font-semibold tracking-widest uppercase mb-1">T2T Academy</p>
          <h1 className="text-2xl font-extrabold">Panel de Órdenes — Supply Chain</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total órdenes', value: orders.length, color: 'text-gray-900' },
            { label: 'Pendientes', value: pending, color: 'text-yellow-600' },
            { label: 'Aprobadas', value: approved, color: 'text-green-600' },
            { label: 'Total USD', value: `$${total.toFixed(2)}`, color: 'text-purple-700' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
              <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Orders table */}
        {orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">Todavía no hay órdenes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS['pending']
              const approveUrl = `/api/approve/${order.approve_token}`

              return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">{order.customer_name}</p>
                      <p className="text-sm text-gray-400">{order.customer_email}</p>
                      {order.customer_phone && (
                        <p className="text-sm text-gray-400">{order.customer_phone}</p>
                      )}
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
                    <div className="text-sm text-gray-400 space-x-4">
                      <span>📅 {formatDate(order.created_at)}</span>
                      <span>💳 {METHOD_LABELS[order.payment_method] ?? order.payment_method}</span>
                      {order.approved_at && (
                        <span className="text-green-600">✓ Aprobado {formatDate(order.approved_at)}</span>
                      )}
                    </div>

                    {order.status === 'pending' && (
                      <a
                        href={approveUrl}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors"
                      >
                        ✅ Confirmar pago y enviar acceso
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
