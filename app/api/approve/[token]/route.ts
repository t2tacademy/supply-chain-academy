import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendCustomerAccess } from '@/lib/email'
import { grantOrderAccess } from '@/lib/drive'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('approve_token', token)
    .single()

  if (error || !order) {
    return new NextResponse('Orden no encontrada', { status: 404 })
  }

  if (order.status === 'approved') {
    return new NextResponse(approvedHtml(order.customer_name, true), {
      headers: { 'Content-Type': 'text/html' },
    })
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
    return new NextResponse('Error al aprobar la orden', { status: 500 })
  }

  await sendCustomerAccess({
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    selections: order.selections,
    totalUsd: order.total_usd,
  })

  return new NextResponse(approvedHtml(order.customer_name, false), {
    headers: { 'Content-Type': 'text/html' },
  })
}

function approvedHtml(customerName: string, alreadyDone: boolean) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Orden aprobada — T2T Academy</title>
  <style>
    body { font-family: sans-serif; background: #0f0f17; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: white; border-radius: 16px; padding: 48px; max-width: 480px; text-align: center; }
    h1 { color: #7C3AED; margin-bottom: 8px; }
    p { color: #6b7280; line-height: 1.6; }
    .badge { background: #f3f4f6; border-radius: 8px; padding: 8px 16px; display: inline-block; font-size: 14px; color: #374151; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:48px">${alreadyDone ? '✅' : '🎉'}</div>
    <h1>${alreadyDone ? 'Ya estaba aprobado' : '¡Orden aprobada!'}</h1>
    <p>
      ${alreadyDone
        ? `Esta orden ya fue aprobada anteriormente. El acceso de <strong>${customerName}</strong> ya fue enviado.`
        : `El acceso de <strong>${customerName}</strong> fue enviado a su email exitosamente.`
      }
    </p>
    <div class="badge">Podés cerrar esta ventana</div>
  </div>
</body>
</html>`
}
