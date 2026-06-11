import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

  if (order.status === 'rejected') {
    return new NextResponse(resultHtml(order.customer_name, 'already'), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'rejected' })
    .eq('id', order.id)

  if (updateError) {
    return new NextResponse('Error al rechazar la orden', { status: 500 })
  }

  return new NextResponse(resultHtml(order.customer_name, 'done'), {
    headers: { 'Content-Type': 'text/html' },
  })
}

function resultHtml(customerName: string, state: 'done' | 'already') {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Orden rechazada — T2T Academy</title>
  <style>
    body { font-family: sans-serif; background: #0f0f17; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: white; border-radius: 16px; padding: 48px; max-width: 480px; text-align: center; }
    h1 { color: #dc2626; margin-bottom: 8px; }
    p { color: #6b7280; line-height: 1.6; }
    .badge { background: #f3f4f6; border-radius: 8px; padding: 8px 16px; display: inline-block; font-size: 14px; color: #374151; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:48px">${state === 'already' ? '⚠️' : '❌'}</div>
    <h1>${state === 'already' ? 'Ya estaba rechazada' : 'Orden rechazada'}</h1>
    <p>
      ${state === 'already'
        ? `Esta orden de <strong>${customerName}</strong> ya fue rechazada anteriormente.`
        : `La orden de <strong>${customerName}</strong> fue marcada como rechazada.`
      }
    </p>
    <div class="badge">Podés cerrar esta ventana</div>
  </div>
</body>
</html>`
}
