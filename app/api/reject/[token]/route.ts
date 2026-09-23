import { supabase } from '@/lib/supabase'
import { escapeHtml } from '@/lib/html'
import { adminPage, htmlResponse } from '@/lib/adminPage'

type Params = { params: Promise<{ token: string }> }

async function findOrder(token: string) {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('approve_token', token)
    .single()
  return error ? null : order
}

const notFound = () => htmlResponse(adminPage({ title: 'Orden no encontrada', heading: 'Orden no encontrada', body: '', accent: '#dc2626' }), 404)
const already = (name: string) => htmlResponse(adminPage({
  title: 'Orden rechazada', heading: 'Ya estaba rechazada', accent: '#dc2626',
  body: `<p>Esta orden de <strong>${escapeHtml(name)}</strong> ya fue rechazada anteriormente.</p>`,
}))

// GET solo confirma; el rechazo real se hace con el POST del botón (ver approve)
export async function GET(_req: Request, { params }: Params) {
  const { token } = await params
  const order = await findOrder(token)
  if (!order) return notFound()
  if (order.status === 'rejected') return already(order.customer_name)

  return htmlResponse(adminPage({
    title: 'Rechazar orden', heading: '¿Rechazar esta orden?', accent: '#dc2626',
    body: `<p><strong>${escapeHtml(order.customer_name)}</strong><br>${escapeHtml(order.customer_email)}<br>Total: <strong>USD ${Number(order.total_usd).toFixed(2)}</strong></p>`,
    form: { action: `/api/reject/${token}`, label: 'Sí, rechazar orden' },
  }))
}

export async function POST(_req: Request, { params }: Params) {
  const { token } = await params
  const order = await findOrder(token)
  if (!order) return notFound()
  if (order.status === 'rejected') return already(order.customer_name)

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'rejected' })
    .eq('id', order.id)

  if (updateError) {
    return htmlResponse(adminPage({ title: 'Error', heading: 'Error al rechazar la orden', body: '', accent: '#dc2626' }), 500)
  }

  return htmlResponse(adminPage({
    title: 'Orden rechazada', heading: 'Orden rechazada', accent: '#dc2626',
    body: `<p>La orden de <strong>${escapeHtml(order.customer_name)}</strong> fue marcada como rechazada.</p>`,
  }))
}
