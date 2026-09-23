import { unstable_cache } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { deriveCatalog } from './derive'
import { seedCatalog } from './seed'
import { parseCatalog } from './validate'
import type { CatalogDoc, CatalogVersionInfo, DerivedCatalog } from './types'

// Solo servidor: usa la service_role de Supabase.

export const CATALOG_TAG = 'catalog'

export async function getLatestCatalogDoc(): Promise<{ doc: CatalogDoc; versionId: number | null }> {
  try {
    const { data, error } = await supabase
      .from('catalog_versions')
      .select('id, data')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    if (data) {
      const parsed = parseCatalog(data.data)
      if (parsed.ok) return { doc: parsed.doc, versionId: data.id }
      console.error('Catálogo guardado inválido, se usa el inicial:', parsed.errors)
    }
  } catch (err) {
    console.error('No se pudo leer el catálogo de Supabase, se usa el inicial:', err)
  }
  return { doc: seedCatalog(), versionId: null }
}

// Para cobrar (api/orders): siempre la última versión, sin caché, con links de Drive
export async function getServerCatalog(): Promise<DerivedCatalog> {
  const { doc } = await getLatestCatalogDoc()
  return deriveCatalog(doc, { withDrive: true })
}

// Para la landing: cacheado y SIN links de Drive (se manda al navegador)
export const getPublicCatalog = unstable_cache(
  async (): Promise<DerivedCatalog> => {
    const { doc } = await getLatestCatalogDoc()
    return deriveCatalog(doc, { withDrive: false })
  },
  ['catalog-public'],
  { tags: [CATALOG_TAG], revalidate: 300 },
)

export async function listCatalogVersions(limit = 20): Promise<CatalogVersionInfo[]> {
  const { data, error } = await supabase
    .from('catalog_versions')
    .select('id, note, created_at')
    .order('id', { ascending: false })
    .limit(limit)
  if (error) return []
  return data ?? []
}

export async function getCatalogVersion(id: number): Promise<CatalogDoc | null> {
  const { data, error } = await supabase.from('catalog_versions').select('data').eq('id', id).maybeSingle()
  if (error || !data) return null
  const parsed = parseCatalog(data.data)
  return parsed.ok ? parsed.doc : null
}

export async function insertCatalogVersion(doc: CatalogDoc, note: string | null): Promise<number> {
  const { data, error } = await supabase
    .from('catalog_versions')
    .insert({ data: doc, note })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}
