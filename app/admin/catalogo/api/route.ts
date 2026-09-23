import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { parseCatalog } from '@/lib/catalog/validate'
import { CATALOG_TAG, getCatalogVersion, insertCatalogVersion } from '@/lib/catalog/server'

// Protegido por el Basic Auth de middleware.ts (matcher /admin/:path*).

// El navegador manda el Basic Auth solo, incluso desde otros sitios: se exige que el
// pedido venga de esta misma página para evitar que un sitio ajeno publique cambios (CSRF).
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return false
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export async function GET(req: Request) {
  const id = Number(new URL(req.url).searchParams.get('version'))
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Versión inválida' }, { status: 400 })
  const doc = await getCatalogVersion(id)
  if (!doc) return NextResponse.json({ error: 'Versión no encontrada' }, { status: 404 })
  return NextResponse.json({ doc }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 })
  }

  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 200) || null : null

  let doc
  if (body.action === 'restore') {
    const id = Number(body.versionId)
    doc = Number.isInteger(id) && id > 0 ? await getCatalogVersion(id) : null
    if (!doc) return NextResponse.json({ error: 'Versión no encontrada' }, { status: 404 })
  } else if (body.action === 'publish') {
    const parsed = parseCatalog(body.doc)
    if (!parsed.ok) return NextResponse.json({ error: 'Hay datos inválidos', errors: parsed.errors }, { status: 400 })
    doc = parsed.doc
  } else {
    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  }

  try {
    const versionId = await insertCatalogVersion(doc, body.action === 'restore' ? `Restaurada versión ${body.versionId}${note ? ` · ${note}` : ''}` : note)
    revalidateTag(CATALOG_TAG, { expire: 0 })
    revalidatePath('/')
    return NextResponse.json({ ok: true, versionId })
  } catch (err) {
    console.error('Error guardando catálogo:', err)
    return NextResponse.json({ error: 'No se pudo guardar. ¿Está creada la tabla catalog_versions en Supabase?' }, { status: 500 })
  }
}
