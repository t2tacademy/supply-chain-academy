'use client'

import { createContext, useContext } from 'react'
import type { DerivedCatalog } from '@/lib/catalog/types'

// El catálogo (precios, cursos, duraciones) viene del servidor y se comparte con los componentes de la landing
const CatalogContext = createContext<DerivedCatalog | null>(null)

export function CatalogProvider({ catalog, children }: { catalog: DerivedCatalog; children: React.ReactNode }) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>
}

export function useCatalog(): DerivedCatalog {
  const c = useContext(CatalogContext)
  if (!c) throw new Error('useCatalog tiene que usarse dentro de <CatalogProvider>')
  return c
}
