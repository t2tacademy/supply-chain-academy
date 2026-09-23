import { CATEGORIES, BUNDLE_PRICES, UPGRADE_PRICES } from '@/lib/courses'
import { TIER_KEYS, UPGRADE_KEYS } from './types'
import type { CatalogDoc, CatalogCategory, CatalogTier, CategoryId, TierKey } from './types'

// Catálogo inicial = datos v9 de lib/courses.ts. Se usa si todavía no hay ninguna versión
// publicada en Supabase (o si la base no responde). Las cantidades y duraciones del v9 se
// cargan como valores "a mano" porque los títulos listados no cubren todos los cursos.
export function seedCatalog(): CatalogDoc {
  const categories: CatalogCategory[] = CATEGORIES.map(c => {
    const tiers = {} as Record<TierKey, CatalogTier>
    for (const t of TIER_KEYS) {
      tiers[t] = {
        listPrice: c.tiers[t].listPrice,
        price: c.tiers[t].price,
        courses: c.courseTitles[t].map((title, i) => ({ id: `${c.id}-${t}-${i + 1}`, title, minutes: null })),
        coursesOverride: c.tiers[t].courses,
        minutesOverride: c.tiers[t].minutes,
      }
    }
    return { id: c.id as CategoryId, name: c.name, icon: c.icon, description: c.description, tiers }
  })

  const bundles = {} as CatalogDoc['bundles']
  for (const t of TIER_KEYS) {
    const b = BUNDLE_PRICES[t]
    bundles[t] = { price: b.price, listPriceOverride: b.listPrice, coursesOverride: b.courses, minutesOverride: b.minutes }
  }

  const upgrades = {} as CatalogDoc['upgrades']
  for (const k of UPGRADE_KEYS) upgrades[k] = { price: UPGRADE_PRICES[k].price }

  return { categories, bundles, upgrades, uniqueCoursesOverride: BUNDLE_PRICES.expert.courses }
}
