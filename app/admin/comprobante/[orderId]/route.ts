import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Protegido por el Basic Auth de middleware.ts (matcher /admin/:path*).
// Genera un link firmado de corta duración al comprobante en el bucket privado y redirige.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params

  const { data: order, error } = await supabase
    .from('orders')
    .select('comprobante_url')
    .eq('id', orderId)
    .single()

  if (error || !order?.comprobante_url) {
    return new NextResponse('Comprobante no encontrado', { status: 404 })
  }

  // Órdenes viejas guardaban la URL pública completa; las nuevas guardan solo la ruta
  const stored: string = order.comprobante_url
  const marker = '/comprobantes/'
  const path = stored.includes(marker) ? decodeURIComponent(stored.split(marker).pop()!) : stored

  const { data, error: signError } = await supabase.storage
    .from('comprobantes')
    .createSignedUrl(path, 60 * 10)

  if (signError || !data?.signedUrl) {
    return new NextResponse('No se pudo abrir el comprobante', { status: 500 })
  }

  return NextResponse.redirect(data.signedUrl)
}
