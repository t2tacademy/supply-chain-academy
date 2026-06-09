export type TierKey = 'starter' | 'pro' | 'expert'

export interface Tier {
  label: string
  courses: number
  minutes: number
  price: number
  includes: string
  driveLink: string
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  tiers: Record<TierKey, Tier>
}

export const CATEGORIES: Category[] = [
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    icon: '🔗',
    description: 'Visión estratégica de la cadena de suministro, KPIs, reporting y mindset ganador.',
    tiers: {
      starter: { label: 'Starter', courses: 5, minutes: 54, price: 1.39, includes: '5 cursos · 54 min', driveLink: process.env.DRIVE_SC_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 12, minutes: 174, price: 17.33, includes: '12 cursos · 2h 54min (incluye Starter)', driveLink: process.env.DRIVE_SC_PRO || '#' },
      expert:  { label: 'Expert',  courses: 20, minutes: 280, price: 30.40, includes: '20 cursos · 4h 40min (incluye todo)', driveLink: process.env.DRIVE_SC_EXPERT || '#' },
    },
  },
  {
    id: 'manufactura',
    name: 'Manufactura',
    icon: '🏭',
    description: 'Gestión de plantas, pérdidas, KPIs de producción y herramientas de mejora continua.',
    tiers: {
      starter: { label: 'Starter', courses: 7, minutes: 88, price: 5.57, includes: '7 cursos · 1h 28min', driveLink: process.env.DRIVE_MAN_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 11, minutes: 169, price: 12.69, includes: '11 cursos · 2h 49min (incluye Starter)', driveLink: process.env.DRIVE_MAN_PRO || '#' },
      expert:  { label: 'Expert',  courses: 15, minutes: 244, price: 30.10, includes: '15 cursos · 4h 4min (incluye todo)', driveLink: process.env.DRIVE_MAN_EXPERT || '#' },
    },
  },
  {
    id: 'stocks',
    name: 'Stocks',
    icon: '📦',
    description: 'Gestión profesional de inventarios, safety stock, análisis ABC y herramientas avanzadas.',
    tiers: {
      starter: { label: 'Starter', courses: 5, minutes: 56, price: 6.29, includes: '5 cursos · 56 min', driveLink: process.env.DRIVE_STK_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 9, minutes: 112, price: 11.23, includes: '9 cursos · 1h 52min (incluye Starter)', driveLink: process.env.DRIVE_STK_PRO || '#' },
      expert:  { label: 'Expert',  courses: 13, minutes: 292, price: 49.17, includes: '13 cursos · 4h 52min (incluye todo)', driveLink: process.env.DRIVE_STK_EXPERT || '#' },
    },
  },
  {
    id: 'sop',
    name: 'S&OP',
    icon: '📊',
    description: 'Proceso de Sales & Operations Planning, demand planning y sincronía organizacional.',
    tiers: {
      starter: { label: 'Starter', courses: 5, minutes: 58, price: 6.29, includes: '5 cursos · 58 min', driveLink: process.env.DRIVE_SOP_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 11, minutes: 153, price: 22.44, includes: '11 cursos · 2h 33min (incluye Starter)', driveLink: process.env.DRIVE_SOP_PRO || '#' },
      expert:  { label: 'Expert',  courses: 13, minutes: 181, price: 23.55, includes: '13 cursos · 3h 1min (incluye todo)', driveLink: process.env.DRIVE_SOP_EXPERT || '#' },
    },
  },
  {
    id: 'demand-planner',
    name: 'Demand Planner',
    icon: '📈',
    description: 'Rol, herramientas, forecast, gestión de portfolio y secretos de performance del demand planner.',
    tiers: {
      starter: { label: 'Starter', courses: 5, minutes: 74, price: 11.18, includes: '5 cursos · 1h 14min', driveLink: process.env.DRIVE_DP_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 10, minutes: 170, price: 21.24, includes: '10 cursos · 2h 50min (incluye Starter)', driveLink: process.env.DRIVE_DP_PRO || '#' },
      expert:  { label: 'Expert',  courses: 20, minutes: 451, price: 57.19, includes: '20 cursos · 7h 31min (incluye todo)', driveLink: process.env.DRIVE_DP_EXPERT || '#' },
    },
  },
  {
    id: 'supply-planning',
    name: 'Supply Planning',
    icon: '🗓️',
    description: 'MPS, planeamiento estratégico, SKU management, gestión de producto importado y waste.',
    tiers: {
      starter: { label: 'Starter', courses: 4, minutes: 77, price: 9.79, includes: '4 cursos · 1h 17min', driveLink: process.env.DRIVE_SP_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 8, minutes: 186, price: 25.59, includes: '8 cursos · 3h 6min (incluye Starter)', driveLink: process.env.DRIVE_SP_PRO || '#' },
      expert:  { label: 'Expert',  courses: 16, minutes: 326, price: 43.49, includes: '16 cursos · 5h 26min (incluye todo)', driveLink: process.env.DRIVE_SP_EXPERT || '#' },
    },
  },
  {
    id: 'planif-materiales',
    name: 'Planificación de Materiales',
    icon: '⚙️',
    description: 'Proceso MRP, milk run de materiales, relación con proveedores y optimización avanzada.',
    tiers: {
      starter: { label: 'Starter', courses: 5, minutes: 67, price: 4.18, includes: '5 cursos · 1h 7min', driveLink: process.env.DRIVE_PM_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 10, minutes: 168, price: 11.44, includes: '10 cursos · 2h 48min (incluye Starter)', driveLink: process.env.DRIVE_PM_PRO || '#' },
      expert:  { label: 'Expert',  courses: 16, minutes: 285, price: 28.85, includes: '16 cursos · 4h 45min (incluye todo)', driveLink: process.env.DRIVE_PM_EXPERT || '#' },
    },
  },
  {
    id: 'liderazgo-sc',
    name: 'Liderazgo SC',
    icon: '🚀',
    description: 'Liderazgo transformacional en Supply Chain, equipos de alto rendimiento, mentoring y engagement.',
    tiers: {
      starter: { label: 'Starter', courses: 9, minutes: 69, price: 4.18, includes: '9 cursos · 1h 9min', driveLink: process.env.DRIVE_LSC_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 24, minutes: 304, price: 34.51, includes: '24 cursos · 5h 4min (incluye Starter)', driveLink: process.env.DRIVE_LSC_PRO || '#' },
      expert:  { label: 'Expert',  courses: 33, minutes: 503, price: 56.62, includes: '33 cursos · 8h 23min (incluye todo)', driveLink: process.env.DRIVE_LSC_EXPERT || '#' },
    },
  },
  {
    id: 'habilidades-blandas',
    name: 'Habilidades Blandas',
    icon: '🧠',
    description: 'Productividad, inteligencia emocional, creatividad y herramientas del joven profesional.',
    tiers: {
      starter: { label: 'Starter', courses: 6, minutes: 67, price: 4.18, includes: '6 cursos · 1h 7min', driveLink: process.env.DRIVE_HB_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 9, minutes: 267, price: 31.76, includes: '9 cursos · 4h 27min (incluye Starter)', driveLink: process.env.DRIVE_HB_PRO || '#' },
      expert:  { label: 'Expert',  courses: 12, minutes: 419, price: 59.75, includes: '12 cursos · 6h 59min (incluye todo)', driveLink: process.env.DRIVE_HB_EXPERT || '#' },
    },
  },
]

export function minutesToLabel(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}
