import { UPGRADE_PRICES } from '@/lib/courses'
import type { Category, Tier } from '@/lib/courses'
import { TIER_KEYS, UPGRADE_KEYS } from './types'
import type { CatalogCourse, CatalogDoc, DerivedCatalog, TierKey } from './types'

const TIER_LABEL: Record<TierKey, string> = { starter: 'Starter', pro: 'Pro', expert: 'Expert' }
const TIER_RANK: Record<TierKey, number> = { starter: 0, pro: 1, expert: 2 }

// Nombres cortos de las variables de links de Drive (DRIVE_SC_STARTER, etc.)
const DRIVE_SHORT: Record<string, string> = {
  'supply-chain': 'SC', 'manufactura': 'MAN', 'stocks': 'STK', 'sop': 'SOP',
  'demand-planner': 'DP', 'supply-planning': 'SP', 'planif-materiales': 'PM',
}

const normTitle = (t: string) => t.trim().toLowerCase().replace(/\s+/g, ' ')

// Cursos acumulados de un nivel: Pro incluye Starter, Expert incluye Starter + Pro
export function cumulativeCourses(tiers: Record<TierKey, { courses: CatalogCourse[] }>, tier: TierKey): CatalogCourse[] {
  return TIER_KEYS.filter(t => TIER_RANK[t] <= TIER_RANK[tier]).flatMap(t => tiers[t].courses)
}

const sumMinutes = (courses: CatalogCourse[]) => courses.reduce((s, c) => s + (c.minutes ?? 0), 0)

function uniqueByTitle(courses: CatalogCourse[]): CatalogCourse[] {
  const seen = new Map<string, CatalogCourse>()
  for (const c of courses) {
    const k = normTitle(c.title)
    if (!seen.has(k)) seen.set(k, c)
  }
  return [...seen.values()]
}

// withDrive: solo en el servidor. Los links de Drive nunca se mandan al navegador.
export function deriveCatalog(doc: CatalogDoc, opts: { withDrive: boolean }): DerivedCatalog {
  const categories: Category[] = doc.categories.map(c => {
    const tiers = {} as Record<TierKey, Tier>
    const courseTitles = {} as Record<TierKey, string[]>
    for (const t of TIER_KEYS) {
      const own = c.tiers[t]
      const cum = cumulativeCourses(c.tiers, t)
      tiers[t] = {
        label: TIER_LABEL[t],
        courses: own.coursesOverride ?? cum.length,
        minutes: own.minutesOverride ?? sumMinutes(cum),
        price: own.price,
        listPrice: own.listPrice,
        savings: own.listPrice > 0 ? Math.round((own.listPrice - own.price) / own.listPrice * 100) : 0,
        driveLink: opts.withDrive ? (process.env[`DRIVE_${DRIVE_SHORT[c.id]}_${t.toUpperCase()}`] || '#') : '#',
      }
      courseTitles[t] = own.courses.map(x => x.title)
    }
    return { id: c.id, name: c.name, icon: c.icon, description: c.description, tiers, courseTitles }
  })

  const bundles = {} as DerivedCatalog['bundles']
  for (const t of TIER_KEYS) {
    const b = doc.bundles[t]
    const unique = uniqueByTitle(doc.categories.flatMap(c => cumulativeCourses(c.tiers, t)))
    bundles[t] = {
      price: b.price,
      listPrice: b.listPriceOverride ?? doc.categories.reduce((s, c) => s + c.tiers[t].listPrice, 0),
      courses: b.coursesOverride ?? unique.length,
      minutes: b.minutesOverride ?? sumMinutes(unique),
    }
  }

  const upgrades = {} as DerivedCatalog['upgrades']
  for (const k of UPGRADE_KEYS) {
    upgrades[k] = { ...UPGRADE_PRICES[k], price: doc.upgrades[k].price }
  }

  const allUnique = uniqueByTitle(doc.categories.flatMap(c => cumulativeCourses(c.tiers, 'expert')))
  return { categories, bundles, upgrades, uniqueCourses: doc.uniqueCoursesOverride ?? allUnique.length }
}
