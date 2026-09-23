import { getLatestCatalogDoc, listCatalogVersions } from '@/lib/catalog/server'
import CatalogEditor from '@/components/admin/CatalogEditor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CatalogoAdminPage() {
  const [{ doc, versionId }, versions] = await Promise.all([
    getLatestCatalogDoc(),
    listCatalogVersions(20),
  ])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-[#0A0A0F] text-white px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-purple-400 text-xs font-semibold tracking-widest uppercase mb-1">T2T Academy</p>
            <h1 className="text-2xl font-extrabold">Catálogo — Supply Chain</h1>
          </div>
          <a href="/admin" className="text-gray-300 hover:text-white text-sm font-medium">
            ← Órdenes
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <CatalogEditor initialDoc={doc} initialVersionId={versionId} versions={versions} />
      </div>
    </div>
  )
}
