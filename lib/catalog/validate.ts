import { CATEGORY_IDS, TIER_KEYS, UPGRADE_KEYS } from './types'
import type { CatalogDoc, CatalogCategory, CatalogCourse, CatalogTier, CategoryId, TierKey } from './types'

const TIER_LABEL: Record<TierKey, string> = { starter: 'Starter', pro: 'Pro', expert: 'Expert' }
const MAX_PRICE = 100_000
const MAX_COURSES_PER_TIER = 200

type Result = { ok: true; doc: CatalogDoc } | { ok: false; errors: string[] }

// Valida y normaliza el catálogo que manda el admin. Nunca confiar en la forma del JSON recibido.
export function parseCatalog(raw: unknown): Result {
  const errors: string[] = []
  const obj = (v: unknown): Record<string, unknown> | null => (v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : null)
  const int = (v: unknown, where: string, max = MAX_PRICE): number => {
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > max) {
      errors.push(`${where}: tiene que ser un número entero entre 0 y ${max}`)
      return 0
    }
    return v
  }
  const optInt = (v: unknown, where: string): number | null => (v === null || v === undefined ? null : int(v, where))
  const text = (v: unknown, where: string, min: number, max: number): string => {
    const s = typeof v === 'string' ? v.trim() : ''
    if (s.length < min || s.length > max) errors.push(`${where}: tiene que tener entre ${min} y ${max} caracteres`)
    return s.slice(0, max)
  }

  const root = obj(raw)
  if (!root) return { ok: false, errors: ['El catálogo no tiene el formato esperado'] }

  const rawCats = Array.isArray(root.categories) ? root.categories : []
  const categories: CatalogCategory[] = []
  const seen = new Set<string>()
  for (const rc of rawCats) {
    const c = obj(rc)
    const id = c?.id
    if (!c || typeof id !== 'string' || !(CATEGORY_IDS as readonly string[]).includes(id) || seen.has(id)) {
      errors.push('Hay una especialización inválida o repetida')
      continue
    }
    seen.add(id)
    const name = text(c.name, `Nombre de ${id}`, 1, 60)
    const rawTiers = obj(c.tiers)
    const tiers = {} as Record<TierKey, CatalogTier>
    for (const t of TIER_KEYS) {
      const where = `${name || id} · ${TIER_LABEL[t]}`
      const rt = obj(rawTiers?.[t])
      if (!rt) { errors.push(`${where}: falta el nivel`); continue }
      const listPrice = int(rt.listPrice, `${where} · precio de lista`)
      const price = int(rt.price, `${where} · precio`)
      if (price > listPrice) errors.push(`${where}: el precio no puede ser mayor que el de lista`)
      const rawCourses = Array.isArray(rt.courses) ? rt.courses : []
      if (rawCourses.length > MAX_COURSES_PER_TIER) errors.push(`${where}: máximo ${MAX_COURSES_PER_TIER} cursos`)
      const courses: CatalogCourse[] = rawCourses.slice(0, MAX_COURSES_PER_TIER).map((rcs, i) => {
        const co = obj(rcs)
        const cid = typeof co?.id === 'string' && /^[\w-]{1,64}$/.test(co.id) ? co.id : `${id}-${t}-${i + 1}`
        return {
          id: cid,
          title: text(co?.title, `${where} · curso ${i + 1}`, 1, 200),
          minutes: co?.minutes === null || co?.minutes === undefined ? null : int(co.minutes, `${where} · curso ${i + 1} · minutos`, 1440),
        }
      })
      tiers[t] = {
        listPrice, price, courses,
        coursesOverride: optInt(rt.coursesOverride, `${where} · cantidad de cursos`),
        minutesOverride: optInt(rt.minutesOverride, `${where} · duración`),
      }
    }
    categories.push({
      id: id as CategoryId,
      name,
      icon: typeof c.icon === 'string' ? c.icon.trim().slice(0, 8) : '',
      description: text(c.description, `Descripción de ${name || id}`, 0, 200),
      tiers,
    })
  }
  if (seen.size !== CATEGORY_IDS.length) errors.push('Tienen que estar las 7 especializaciones')

  const rawBundles = obj(root.bundles)
  const bundles = {} as CatalogDoc['bundles']
  for (const t of TIER_KEYS) {
    const b = obj(rawBundles?.[t])
    const where = `Catálogo completo · ${TIER_LABEL[t]}`
    if (!b) { errors.push(`${where}: falta`); continue }
    bundles[t] = {
      price: int(b.price, `${where} · precio`),
      listPriceOverride: optInt(b.listPriceOverride, `${where} · precio de lista`),
      coursesOverride: optInt(b.coursesOverride, `${where} · cantidad de cursos`),
      minutesOverride: optInt(b.minutesOverride, `${where} · duración`),
    }
  }

  const rawUpg = obj(root.upgrades)
  const upgrades = {} as CatalogDoc['upgrades']
  for (const k of UPGRADE_KEYS) {
    const u = obj(rawUpg?.[k])
    if (!u) { errors.push(`Upgrade ${k}: falta`); continue }
    upgrades[k] = { price: int(u.price, `Upgrade ${k} · precio`) }
  }

  const uniqueCoursesOverride = optInt(root.uniqueCoursesOverride, 'Cursos únicos')

  if (errors.length) return { ok: false, errors: [...new Set(errors)].slice(0, 30) }

  // Orden fijo de las especializaciones
  categories.sort((a, b) => CATEGORY_IDS.indexOf(a.id) - CATEGORY_IDS.indexOf(b.id))
  return { ok: true, doc: { categories, bundles, upgrades, uniqueCoursesOverride } }
}
