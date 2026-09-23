import CatalogPage from '@/components/CatalogPage'
import { CatalogProvider } from '@/components/CatalogProvider'
import { getPublicCatalog } from '@/lib/catalog/server'

// Se regenera al publicar desde /admin/catalogo (revalidateTag) y como mínimo cada 5 minutos
export const revalidate = 300

export default async function Home() {
  const catalog = await getPublicCatalog()
  return (
    <CatalogProvider catalog={catalog}>
      <CatalogPage />
    </CatalogProvider>
  )
}
