import { escapeHtml } from './html'

// Páginas HTML simples para los links de aprobar/rechazar que llegan por mail.
// `body` debe venir ya escapado (usar escapeHtml para datos de usuarios).
export function adminPage(opts: { title: string; heading: string; body: string; accent: string; form?: { action: string; label: string } }) {
  const form = opts.form
    ? `<form method="POST" action="${escapeHtml(opts.form.action)}">
        <button type="submit">${escapeHtml(opts.form.label)}</button>
      </form>`
    : `<div class="badge">Podés cerrar esta ventana</div>`
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>${escapeHtml(opts.title)} — T2T Academy</title>
  <style>
    body { font-family: sans-serif; background: #07080B; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 16px; box-sizing: border-box; }
    .card { background: #F4F1E8; color: #0B0D12; padding: 40px; max-width: 480px; width: 100%; text-align: center; border: 1px solid rgba(11,13,18,.2); }
    .code { font: 600 11px/1 monospace; letter-spacing: .14em; color: #4A4F5C; margin-bottom: 16px; }
    h1 { color: ${opts.accent}; margin: 0 0 12px; font-size: 26px; }
    p { color: #4A4F5C; line-height: 1.6; }
    button { margin-top: 20px; background: ${opts.accent}; color: white; border: 0; padding: 14px 28px; font-weight: bold; font-size: 16px; cursor: pointer; }
    .badge { background: rgba(11,13,18,.06); padding: 8px 16px; display: inline-block; font-size: 14px; color: #374151; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="code">T2T/SC-CTRL · ADMIN</div>
    <h1>${escapeHtml(opts.heading)}</h1>
    ${opts.body}
    ${form}
  </div>
</body>
</html>`
}

export function htmlResponse(html: string, status = 200) {
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
}
