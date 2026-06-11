import { Resend } from 'resend'
import type { OrderSelection } from './supabase'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@t2tacademy.com'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export async function sendAdminNotification(order: {
  id: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  selections: OrderSelection[]
  totalUsd: number
  paymentMethod: string
  approveToken: string
  comprobanteUrl?: string | null
}) {
  const selectionsList = order.selections
    .map(s => `<li><strong>${s.categoryName}</strong> — ${s.tierLabel} · $${s.price.toFixed(2)} USD</li>`)
    .join('')

  const approveUrl = `${BASE_URL}/api/approve/${order.approveToken}`

  await getResend().emails.send({
    from: 'T2T Academy <onboarding@resend.dev>',
    to: ADMIN_EMAIL,
    subject: `🛒 Nueva compra: ${order.customerName} — $${order.totalUsd.toFixed(2)} USD`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#7C3AED;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:20px">Nueva compra en Catálogo Supply Chain</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="color:#1f2937;margin-top:0">Datos del comprador</h2>
          <p><strong>Nombre:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          ${order.customerPhone ? `<p><strong>Teléfono:</strong> ${order.customerPhone}</p>` : ''}
          <p><strong>Método de pago:</strong> ${order.paymentMethod}</p>

          <h2 style="color:#1f2937">Módulos seleccionados</h2>
          <ul style="background:white;padding:16px 32px;border-radius:8px;border:1px solid #e5e7eb">
            ${selectionsList}
          </ul>
          <p style="font-size:18px;font-weight:bold;color:#7C3AED">
            TOTAL: $${order.totalUsd.toFixed(2)} USD
          </p>

          ${order.comprobanteUrl ? `
          <div style="background:#f3f4f6;border-radius:8px;padding:12px 16px;margin-bottom:16px">
            <p style="margin:0;font-size:13px;color:#374151">📎 <strong>Comprobante adjunto:</strong> <a href="${order.comprobanteUrl}" style="color:#7C3AED">Ver comprobante</a></p>
          </div>` : ''}
          <p style="color:#6b7280;font-size:14px">
            Una vez que confirmés que el pago fue recibido, hacé clic en el botón de abajo para enviarle el acceso al cliente.
          </p>

          <a href="${approveUrl}" style="display:inline-block;background:#7C3AED;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;margin-top:8px">
            ✅ Confirmar pago y enviar acceso
          </a>

          <p style="color:#9ca3af;font-size:12px;margin-top:24px">
            También podés gestionar todas las órdenes en: <a href="${BASE_URL}/admin">${BASE_URL}/admin</a>
          </p>
        </div>
      </div>
    `,
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
        <p style="margin:0 0 8px 0;font-weight:bold;color:#1f2937">${s.categoryName} — ${s.tierLabel}</p>
        ${s.driveLink && s.driveLink !== '#'
          ? `<a href="${s.driveLink}" style="background:#7C3AED;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
               📁 Acceder a mis cursos
             </a>`
          : `<p style="color:#9ca3af;font-size:13px">Tu link llegará en un segundo email.</p>`
        }
      </div>
    `)
    .join('')

  await getResend().emails.send({
    from: 'T2T Academy <onboarding@resend.dev>',
    to: order.customerEmail,
    subject: '🎉 ¡Tu acceso a los cursos de Supply Chain está listo!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#7C3AED;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">¡Bienvenido/a a T2T Academy!</h1>
          <p style="color:#e9d5ff;margin:8px 0 0 0">Tu pago fue confirmado. Aquí tenés tu acceso.</p>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none">
          <p>Hola <strong>${order.customerName}</strong>,</p>
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
