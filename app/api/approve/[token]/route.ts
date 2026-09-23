import { supabase } from '@/lib/supabase'
import { sendCustomerAccess } from '@/lib/email'
import { grantOrderAccess } from '@/lib/drive'
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

function summary(order: { customer_name: string; customer_email: string; total_usd: number }) {
  return `<p><strong>${escapeHtml(order.customer_name)}</strong><br>${escapeHtml(order.customer_email)}<br>Total: <strong>USD ${Number(order.total_usd).toFixed(2)}</strong></p>`
}

// GET solo muestra la confirmación: los escáneres de links de los mails abren los GET
// automáticamente, así que la aprobación real se hace con el POST del botón.
export async function GET(_req: Request, { params }: Params) {
  const { token } = await params
  const order = await findOrder(token)
  if (!order) return htmlResponse(adminPage({ title: 'Orden no encontrada', heading: 'Orden no encontrada', body: '', accent: '#dc2626' }), 404)

  if (order.status === 'approved') {
    return htmlResponse(adminPage({
      title: 'Orden aprobada', heading: 'Ya estaba aprobado', accent: '#166534',
      body: `<p>Esta orden ya fue aprobada anteriormente. El acceso de <strong>${escapeHtml(order.customer_name)}</strong> ya fue enviado.</p>`,
    }))
  }

  return htmlResponse(adminPage({
    title: 'Aprobar orden', heading: '¿Confirmás el pago?', accent: '#7E22CE',
    body: `${summary(order)}<p>Al confirmar se le da acceso a las carpetas de Drive y se le envía el mail con el acceso.</p>`,
    form: { action: `/api/approve/${token}`, label: 'Confirmar pago y enviar acceso' },
  }))
}

export async function POST(_req: Request, { params }: Params) {
  const { token } = await params
  const order = await findOrder(token)
  if (!order) return htmlResponse(adminPage({ title: 'Orden no encontrada', heading: 'Orden no encontrada', body: '', accent: '#dc2626' }), 404)

  if (order.status === 'approved') {
    return htmlResponse(adminPage({
      title: 'Orden aprobada', heading: 'Ya estaba aprobado', accent: '#166534',
      body: `<p>Esta orden ya fue aprobada anteriormente. El acceso de <strong>${escapeHtml(order.customer_name)}</strong> ya fue enviado.</p>`,
    }))
  }

  const drivePermissionIds = await grantOrderAccess(order.selections, order.customer_email)

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      drive_permission_ids: drivePermissionIds,
      drive_access_revoked: false,
    })
    .eq('id', order.id)

  if (updateError) {
    return htmlResponse(adminPage({ title: 'Error', heading: 'Error al aprobar la orden', body: '', accent: '#dc2626' }), 500)
  }

  await sendCustomerAccess({
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    selections: order.selections,
    totalUsd: order.total_usd,
  })

  const shared = Object.keys(drivePermissionIds).length
  return htmlResponse(adminPage({
    title: 'Orden aprobada', heading: '¡Orden aprobada!', accent: '#166534',
    body: `<p>El acceso de <strong>${escapeHtml(order.customer_name)}</strong> fue enviado a su email.</p>`
      + (shared === 0 ? `<p style="color:#b45309"><strong>Atención:</strong> no se pudo compartir ninguna carpeta de Drive automáticamente (revisá la configuración de Drive). Compartila a mano con ${escapeHtml(order.customer_email)}.</p>` : ''),
  }))
}
