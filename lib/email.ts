import { Resend } from 'resend'
import type { OrderSelection } from './supabase'
import { escapeHtml as e } from './html'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

// Resend no tira excepción cuando rechaza un envío: devuelve { error }. Se registra en los logs de Vercel.
async function send(payload: Parameters<Resend['emails']['send']>[0]) {
  const { error } = await getResend().emails.send(payload)
  if (error) console.error('Resend error:', error.name, error.message, '→', payload.to)
}

// Una o varias direcciones separadas por coma (ej: gustavo@gmail.com,t2tscacademy@gmail.com)
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || 't2tscacademy@gmail.com').split(',').map(s => s.trim()).filter(Boolean)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
// Con onboarding@resend.dev Resend solo entrega al dueño de la cuenta — configurar EMAIL_FROM con un dominio verificado
const EMAIL_FROM = process.env.EMAIL_FROM || 'T2T Academy <onboarding@resend.dev>'
// Las respuestas de los clientes ("Respondé este email") van a este buzón
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 't2tscacademy@gmail.com'

const METHOD_LABELS: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  transferencia: 'Transferencia bancaria (ARS)',
  'bbva-usd': 'Transferencia BBVA (USD)',
  paypal: 'PayPal',
}
const methodLabel = (m: string) => METHOD_LABELS[m] ?? m

// WhatsApp de Gustavo (mismo número que la landing)
const WHATSAPP_GUSTAVO = '5491134030955'

const usd = (n: number) => `USD ${n.toFixed(2)}`

function formatDateAR(d: Date) {
  return d.toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) + ' (hora Argentina)'
}

// wa.me necesita el número en formato internacional, solo dígitos
function whatsappLink(phone: string, text: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

// Maqueta común de los mails (tablas + estilos inline para que se vea bien en Gmail/Outlook)
function layout(o: { preheader: string; eyebrow: string; title: string; subtitle?: string; body: string }) {
  return `<!doctype html><html lang="es"><body style="margin:0;padding:0;background:#EEF0F4">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${o.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF0F4;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #DDE1E8;font-family:Arial,Helvetica,sans-serif;color:#1B1F29">
  <tr><td style="background:#0B0D12;padding:28px 32px 24px">
    <p style="margin:0 0 10px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;color:#4ADE80;text-transform:uppercase">${o.eyebrow}</p>
    <h1 style="margin:0;font-size:22px;line-height:1.3;color:#FFFFFF;font-weight:bold">${o.title}</h1>
    ${o.subtitle ? `<p style="margin:10px 0 0;font-size:14px;line-height:1.5;color:#A9B0BE">${o.subtitle}</p>` : ''}
  </td></tr>
  <tr><td style="height:6px;background:#4ADE80;font-size:0;line-height:0">&nbsp;</td></tr>
  <tr><td style="padding:28px 32px">${o.body}</td></tr>
  <tr><td style="background:#F6F7F9;border-top:1px solid #E4E7EC;padding:18px 32px">
    <p style="margin:0;font-size:12px;line-height:1.5;color:#6B7280">Supply Chain Academy · Gustavo Rodríguez<br>32+ años en supply chain · 16+ como director y asesor</p>
  </td></tr>
</table>
</td></tr></table></body></html>`
}

const label = (t: string) =>
  `<p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:1.5px;color:#6B7280;text-transform:uppercase">${t}</p>`

function kvRows(rows: [string, string][]) {
  return rows.map(([k, v]) => `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #EEF0F4;font-size:13px;color:#6B7280;width:40%;vertical-align:top">${k}</td>
    <td style="padding:8px 0;border-bottom:1px solid #EEF0F4;font-size:14px;color:#1B1F29;font-weight:bold">${v}</td></tr>`).join('')
}

function detailTable(selections: OrderSelection[], totalUsd: number) {
  const rows = selections.map(s => `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #EEF0F4;font-size:14px">${e(s.categoryName)} <span style="color:#6B7280">· ${e(s.tierLabel)}</span></td>
      <td style="padding:10px 12px;border-bottom:1px solid #EEF0F4;font-size:14px;text-align:right;white-space:nowrap">${usd(s.price)}</td></tr>`).join('')
  const sum = selections.reduce((a, s) => a + s.price, 0)
  const adj = Math.round((totalUsd - sum) * 100) / 100
  const adjRow = adj === 0 ? '' : `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #EEF0F4;font-size:13px;color:#6B7280">${adj < 0 ? 'Bonificación por paquete' : 'Ajuste'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #EEF0F4;font-size:13px;color:#6B7280;text-align:right;white-space:nowrap">${adj < 0 ? '−' : ''}${usd(Math.abs(adj))}</td></tr>`
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E4E7EC">
    ${rows}${adjRow}
    <tr><td style="padding:12px;background:#0B0D12;color:#FFFFFF;font-size:14px;font-weight:bold">Total informado</td>
        <td style="padding:12px;background:#0B0D12;color:#4ADE80;font-size:16px;font-weight:bold;text-align:right;white-space:nowrap">${usd(totalUsd)}</td></tr>
  </table>`
}

const button = (href: string, text: string, bg = '#0B0D12', color = '#FFFFFF') =>
  `<a href="${href}" style="display:inline-block;background:${bg};color:${color};padding:13px 22px;text-decoration:none;font-weight:bold;font-size:14px;margin:0 8px 8px 0">${text}</a>`

const mono = (t: string) => `<span style="font-family:'Courier New',monospace;letter-spacing:1px">${t}</span>`

export type OrderMail = {
  id: string
  orderNumber: string
  createdAt: Date
  customerName: string
  customerEmail: string
  customerPhone?: string
  selections: OrderSelection[]
  totalUsd: number
  paymentMethod: string
  hasReceipt: boolean
}

// Al cliente, apenas carga el comprobante: acuse formal con número de operación y próximos pasos.
// No confirma el pago: la verificación sigue siendo manual.
export async function sendCustomerReceipt(order: OrderMail) {
  const firstName = order.customerName.trim().split(/\s+/)[0]
  const waText = `Hola Gustavo, te escribo por mi orden ${order.orderNumber} del Catálogo Supply Chain.`
  const steps: [string, string][] = [
    ['01', 'Verificamos la acreditación del pago contra el comprobante recibido.'],
    ['02', 'Habilitamos tu acceso a las carpetas de Google Drive de cada programa.'],
    ['03', 'Te enviamos un segundo correo con los links de acceso, válidos por 90 días.'],
  ]
  await send({
    from: EMAIL_FROM,
    to: order.customerEmail,
    replyTo: EMAIL_REPLY_TO,
    subject: `Recibimos tu comprobante · Orden ${order.orderNumber}`,
    html: layout({
      preheader: `Orden ${order.orderNumber} registrada. Estamos verificando tu pago.`,
      eyebrow: `Orden ${order.orderNumber} · En verificación`,
      title: 'Recibimos tu comprobante de pago',
      subtitle: 'Tu orden quedó registrada y está en proceso de verificación.',
      body: `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Hola ${e(firstName)},</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6">Gracias por tu compra. Registramos tu orden junto con el comprobante de pago. Te dejamos el detalle de la operación para tu registro.</p>

        ${label('Datos de la operación')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
          ${kvRows([
            ['Número de orden', mono(order.orderNumber)],
            ['Fecha de registro', formatDateAR(order.createdAt)],
            ['Medio de pago', e(methodLabel(order.paymentMethod))],
            ['Comprobante', order.hasReceipt ? 'Recibido' : 'Pendiente de envío'],
            ['Estado', '<span style="color:#B45309">En verificación</span>'],
          ])}
        </table>

        ${label('Detalle')}
        <div style="margin-bottom:28px">${detailTable(order.selections, order.totalUsd)}</div>

        ${label('Próximos pasos')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
          ${steps.map(([n, t]) => `<tr>
            <td style="width:44px;padding:8px 0;vertical-align:top;font-family:'Courier New',monospace;font-size:13px;font-weight:bold;color:#16A34A">${n}</td>
            <td style="padding:8px 0;font-size:14px;line-height:1.5">${t}</td></tr>`).join('')}
        </table>

        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#374151">La verificación se realiza de forma manual dentro de las 24 horas hábiles. Ante cualquier consulta, escribinos indicando tu número de orden.</p>
        ${button(`https://wa.me/${WHATSAPP_GUSTAVO}?text=${encodeURIComponent(waText)}`, 'Consultar por WhatsApp', '#16A34A')}
        <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#6B7280">Este correo es un acuse de recibo y no confirma la acreditación del pago. Conservalo como constancia de tu operación.</p>
      `,
    }),
  })
}

// A Gustavo: comprobante para verificar, con accesos directos (comprobante, WhatsApp del cliente, confirmar)
export async function sendAdminNotification(order: OrderMail & { approveToken: string }) {
  const approveUrl = `${BASE_URL}/api/approve/${order.approveToken}`
  const firstName = order.customerName.trim().split(/\s+/)[0]
  const wa = order.customerPhone
    ? whatsappLink(order.customerPhone, `Hola ${firstName}, te escribo por tu orden ${order.orderNumber} del Catálogo Supply Chain.`)
    : null
  const phoneCell = !order.customerPhone
    ? '—'
    : e(order.customerPhone) + (wa ? '' : ' <span style="color:#B45309;font-weight:normal">(sin código de país: no se pudo armar el link de WhatsApp)</span>')

  await send({
    from: EMAIL_FROM,
    to: ADMIN_EMAILS,
    replyTo: order.customerEmail,
    subject: `Verificar pago · ${order.orderNumber} · ${order.customerName.replace(/\s+/g, ' ').slice(0, 60)} · ${usd(order.totalUsd)}`,
    html: layout({
      preheader: `Comprobante por ${usd(order.totalUsd)}. Verificalo y activá el acceso.`,
      eyebrow: `Orden ${order.orderNumber} · Pendiente de verificación`,
      title: 'Nuevo comprobante para verificar',
      subtitle: `${e(order.customerName)} informó un pago de ${usd(order.totalUsd)} por ${e(methodLabel(order.paymentMethod))}.`,
      body: `
        ${label('Qué hacer')}
        <p style="margin:0 0 20px;font-size:14px;line-height:1.7">1. Abrí el comprobante y verificá que el pago esté acreditado por el total informado.<br>
        2. Si está todo bien, confirmá el pago: se comparten las carpetas de Drive y el cliente recibe su acceso.<br>
        3. Si hace falta, contactalo por WhatsApp o respondé este correo (la respuesta le llega al cliente).</p>

        <div style="margin-bottom:24px">
          ${order.hasReceipt
            ? button(`${BASE_URL}/admin/comprobante/${order.id}`, 'Ver comprobante')
            : '<p style="margin:0 0 12px;font-size:14px;color:#B45309;font-weight:bold">La orden no tiene comprobante adjunto.</p>'}
          ${wa ? button(wa, 'WhatsApp del cliente', '#16A34A') : ''}
        </div>

        ${label('Cliente')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
          ${kvRows([
            ['Nombre', e(order.customerName)],
            ['Email', `<a href="mailto:${e(order.customerEmail)}" style="color:#1B1F29">${e(order.customerEmail)}</a>`],
            ['WhatsApp / teléfono', phoneCell],
            ['Número de orden', mono(order.orderNumber)],
            ['Fecha', formatDateAR(order.createdAt)],
            ['Medio de pago', e(methodLabel(order.paymentMethod))],
          ])}
        </table>

        ${label('Detalle de la orden')}
        <div style="margin-bottom:28px">${detailTable(order.selections, order.totalUsd)}</div>

        ${button(approveUrl, 'Confirmar pago y enviar acceso', '#4ADE80', '#0B0D12')}
        <p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#6B7280">El botón abre una pantalla de confirmación: nada se activa hasta que confirmes. Todas las órdenes están en <a href="${BASE_URL}/admin" style="color:#1B1F29">${BASE_URL}/admin</a>.</p>
      `,
    }),
  })
}

export async function sendCustomerAccess(order: {
  customerName: string
  customerEmail: string
  selections: OrderSelection[]
  totalUsd: number
}) {
  const driveLinksHtml = order.selections
    .map(s => `
      <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px">
        <p style="margin:0 0 8px 0;font-weight:bold;color:#1f2937">${e(s.categoryName)} — ${e(s.tierLabel)}</p>
        ${s.driveLink && s.driveLink !== '#'
          ? `<a href="${e(s.driveLink)}" style="background:#7C3AED;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
               📁 Acceder a mis cursos
             </a>`
          : `<p style="color:#9ca3af;font-size:13px">Tu link llegará en un segundo email.</p>`
        }
      </div>
    `)
    .join('')

  await send({
    from: EMAIL_FROM,
    to: order.customerEmail,
    replyTo: EMAIL_REPLY_TO,
    subject: '🎉 ¡Tu acceso a los cursos de Supply Chain está listo!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#7C3AED;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">¡Bienvenido/a a T2T Academy!</h1>
          <p style="color:#e9d5ff;margin:8px 0 0 0">Tu pago fue confirmado. Aquí tenés tu acceso.</p>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none">
          <p>Hola <strong>${e(order.customerName)}</strong>,</p>
          <p>Tu pago de <strong>$${order.totalUsd.toFixed(2)} USD</strong> fue confirmado. A continuación encontrás los links a tus carpetas de Google Drive:</p>

          ${driveLinksHtml}

          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-top:20px">
            <p style="margin:0;color:#1e40af;font-size:14px">
              💡 <strong>Acceso por 90 días:</strong> Tu acceso a las carpetas de Drive está activo por 90 días desde hoy. Podés acceder desde cualquier dispositivo con tu cuenta de Google.
            </p>
          </div>

          <p style="color:#6b7280;font-size:13px;margin-top:24px">
            ¿Alguna consulta? Respondé este email o contactanos en <a href="mailto:t2tscacademy@gmail.com">t2tscacademy@gmail.com</a>.
          </p>
        </div>
      </div>
    `,
  })
}
