import type { TierKey, UpgradeKey, Category } from '@/lib/courses'

export type { TierKey, UpgradeKey }

export const TIER_KEYS: TierKey[] = ['starter', 'pro', 'expert']
export const UPGRADE_KEYS: UpgradeKey[] = ['starter-to-pro', 'pro-to-expert']

// Las 7 especializaciones son fijas: sus ids se usan para las carpetas de Drive (lib/drive.ts)
export const CATEGORY_IDS = [
  'supply-chain', 'manufactura', 'stocks', 'sop', 'demand-planner', 'supply-planning', 'planif-materiales',
] as const
export type CategoryId = typeof CATEGORY_IDS[number]

// ── Documento editable (lo que se guarda en Supabase, tabla catalog_versions.data) ──

export interface CatalogCourse {
  id: string
  title: string
  minutes: number | null // duración del curso, opcional
}

export interface CatalogTier {
  listPrice: number        // USD, precio de lista
  price: number            // USD, precio final (el admin lo puede cargar vía % de descuento)
  courses: CatalogCourse[] // cursos PROPIOS de este nivel (Pro suma los de Starter, Expert los de Starter + Pro)
  coursesOverride: number | null // cantidad a mostrar a mano; null = se cuenta sola
  minutesOverride: number | null // duración total a mano; null = suma de los minutos de los cursos
}

export interface CatalogCategory {
  id: CategoryId
  name: string
  icon: string
  description: string
  tiers: Record<TierKey, CatalogTier>
}

export interface CatalogBundle {
  price: number
  listPriceOverride: number | null // null = suma de los precios de lista de las 7 especializaciones
  coursesOverride: number | null   // null = cursos únicos de las 7 especializaciones a ese nivel
  minutesOverride: number | null   // null = suma de duraciones de esos cursos
}

export interface CatalogDoc {
  categories: CatalogCategory[]
  bundles: Record<TierKey, CatalogBundle>
  upgrades: Record<UpgradeKey, { price: number }>
  uniqueCoursesOverride: number | null // "Cursos únicos" del hero; null = se cuenta sola
}

// ── Catálogo calculado (lo que consumen la landing y api/orders) ──

export interface DerivedCatalog {
  categories: Category[]
  bundles: Record<TierKey, { price: number; listPrice: number; courses: number; minutes: number }>
  upgrades: Record<UpgradeKey, { price: number; from: string; to: string; label: string }>
  uniqueCourses: number
}

export interface CatalogVersionInfo {
  id: number
  note: string | null
  created_at: string
}
