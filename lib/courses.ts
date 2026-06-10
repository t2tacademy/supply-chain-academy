export type TierKey = 'starter' | 'pro' | 'expert'

export interface Tier {
  label: string
  courses: number
  minutes: number
  price: number      // precio con descuento (~50% off)
  listPrice: number  // precio de lista
  savings: number    // % de ahorro (entero)
  driveLink: string
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  tiers: Record<TierKey, Tier>
  courseTitles: Record<TierKey, string[]>
}

export const CATEGORIES: Category[] = [
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    icon: '🔗',
    description: 'Visión estratégica, KPIs, reporting y mindset ganador.',
    tiers: {
      starter: { label: 'Starter', courses: 5,  minutes: 54,  price: 7,  listPrice: 14, savings: 50, driveLink: process.env.DRIVE_SC_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 10, minutes: 145, price: 16, listPrice: 32, savings: 50, driveLink: process.env.DRIVE_SC_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 17, minutes: 238, price: 31, listPrice: 62, savings: 50, driveLink: process.env.DRIVE_SC_EXPERT   || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Capacidad de Procesos: ¿Sabés Qué le Pedís a tu Fábrica?',
        'Liderar es Motivar Ep.1: El Secreto de los que Hacen Mover Equipos',
        'Supply Chain: Las Siglas Clave que Todo Profesional SC Debe Conocer',
        'Proceso de Planeamiento: Las 4 Funciones Básicas de Cada Rol',
      ],
      pro: [
        'Los Pilotos del Hércules: Confianza como Estrategia de SC',
        '¡Es Posible lo IMPOSIBLE! Cómo Decir SÍ a Pedidos Imposibles en SC',
        'Supply Chain: Los 11 Principios que Crean el Mindset Ganador',
        'Supply Chain: Los 11 Secretos del Liderazgo Transformador',
        'Supply Chain: ¿Cómo Calificarías tu Reporting? 6 Claves para un 10',
      ],
      expert: [
        'Soy de Supply Chain: ¿Cómo Nos Educamos en el Siglo XXI?',
        'Proceso S&OP: ¿Cuál es el Estado de Salud de tu Empresa?',
        'Supply Chain Strategy: Cómo Prepararla para Ganar',
        'Herramienta ECRS-DA: Simplificá tu Vida y la de tu Equipo',
        'El Consumidor en el Centro: La Lección de Jeff Bezos para SC',
        'Demand Planning: Generador de Certezas — Salí del Loop Infinito',
        'Plan Zero: La Herramienta que Motiva a tu Equipo a la Mejora Continua',
      ],
    },
  },
  {
    id: 'manufactura',
    name: 'Manufactura',
    icon: '🏭',
    description: 'Gestión de plantas, pérdidas, KPIs y mejora continua.',
    tiers: {
      starter: { label: 'Starter', courses: 7,  minutes: 88,  price: 16, listPrice: 33, savings: 52, driveLink: process.env.DRIVE_MAN_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 10, minutes: 154, price: 23, listPrice: 45, savings: 49, driveLink: process.env.DRIVE_MAN_PRO     || '#' },
      expert:  { label: 'Expert',  courses: 13, minutes: 212, price: 27, listPrice: 54, savings: 50, driveLink: process.env.DRIVE_MAN_EXPERT  || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Árbol de Pérdidas: No Pierdas su Poder con un Uso Incorrecto',
        'Pérdidas Crónicas y Esporádicas: El Secreto del Profesional Diferente',
        '8 Grandes Pérdidas de Manufactura: Convertí tu ScoreCard en Acción',
        'El Poder de la Limpieza: El Hábito que Transforma Plantas y Mentes',
        'Capacidad de Procesos: ¿Sabés Qué le Pedís a tu Fábrica?',
        'Soy Jefe de Producción Ep.1: 5 Secretos para Destacarte',
      ],
      pro: [
        'Reunión ++: 1 Slide Suficiente — Menos es Más',
        'Soy Jefe de Mantenimiento Ep.1: 6 Consejos que Cambian Todo',
        'Cambios de Formato: Mis 4 Secretos para Reducir Setup al Mínimo',
      ],
      expert: [
        'Manufactura: 9 Herramientas Transformadoras para tu Planta',
        'Herramienta ECRS-DA: Simplificá tu Vida y la de tu Equipo',
        'La Planta No es Flexible: Cómo Remar a Favor de la Corriente',
      ],
    },
  },
  {
    id: 'stocks',
    name: 'Stocks',
    icon: '📦',
    description: 'Inventarios, safety stock, análisis ABC y herramientas avanzadas.',
    tiers: {
      starter: { label: 'Starter', courses: 5,  minutes: 56,  price: 6,  listPrice: 12, savings: 50, driveLink: process.env.DRIVE_STK_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 8,  minutes: 100, price: 12, listPrice: 24, savings: 50, driveLink: process.env.DRIVE_STK_PRO     || '#' },
      expert:  { label: 'Expert',  courses: 12, minutes: 270, price: 34, listPrice: 69, savings: 51, driveLink: process.env.DRIVE_STK_EXPERT  || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Define tu Target de Stock como un Experto: Sin Adivinar',
        'Reunión ++: Mi Fórmula para Liberar Tiempo de Equipo',
        'Modelo de Wilson: El Cálculo que Ordena tu Inventario',
        'Distribución Normal: La Herramienta Indispensable del Planificador',
      ],
      pro: [
        'Los Pilotos del Hércules: Confianza como Estrategia de SC',
        'Stock de Seguridad: Cómo Calcularlo y Mejorarlo sin Teorías',
        'Gestión de Inventarios: 6 Errores Comunes en el Safety Stock',
      ],
      expert: [
        'Gestión de Inventarios: Más de 50 Tips del Detrás de Escena',
        'Stocker: Gestión Profesional de Stock Policy',
        'SpyGlass: Dominá la Gestión de Producto Importado',
        'Stock Tracker: ¿Estoy Planeando Bien? La Herramienta que Responde',
      ],
    },
  },
  {
    id: 'sop',
    name: 'S&OP',
    icon: '📊',
    description: 'Sales & Operations Planning, demand planning y sincronía organizacional.',
    tiers: {
      starter: { label: 'Starter', courses: 4,  minutes: 46,  price: 4,  listPrice: 9,  savings: 56, driveLink: process.env.DRIVE_SOP_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 9,  minutes: 125, price: 15, listPrice: 30, savings: 50, driveLink: process.env.DRIVE_SOP_PRO     || '#' },
      expert:  { label: 'Expert',  courses: 11, minutes: 153, price: 19, listPrice: 39, savings: 51, driveLink: process.env.DRIVE_SOP_EXPERT  || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Proceso S&OP: Los Conceptos Básicos que Todo SC Debe Dominar',
        'Proceso S&OP: El Futuro Está en los Datos',
        "Proceso S&OP: Las 7 A's del Demand Planning — Tu Hoja de Ruta",
      ],
      pro: [
        'Reunión ++: 1 Slide Suficiente — Menos es Más',
        'Proceso S&OP: ¿Cuál es el Estado de Salud de tu Empresa?',
        'Proceso S&OP: Forecast Accuracy Losses Tree — Mejora Estructural',
        'Supply Chain Strategy: Cómo Prepararla para Ganar',
        'Proceso S&OP: Falta Producto en Góndola — Caso Real de Sincronía',
      ],
      expert: [
        'Reporting de Producto Faltante: Más Inteligencia, Menos Energía',
        'Planning: Conversando con Ventas — Cómo Reducir el 50% de las Discusiones',
      ],
    },
  },
  {
    id: 'demand-planner',
    name: 'Demand Planner',
    icon: '📈',
    description: 'Rol, herramientas, forecast, portfolio y secretos de performance.',
    tiers: {
      starter: { label: 'Starter', courses: 4,  minutes: 59,  price: 7,  listPrice: 15, savings: 53, driveLink: process.env.DRIVE_DP_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 9,  minutes: 153, price: 23, listPrice: 45, savings: 49, driveLink: process.env.DRIVE_DP_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 17, minutes: 383, price: 51, listPrice: 104, savings: 51, driveLink: process.env.DRIVE_DP_EXPERT  || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Soy Demand Planner Siglo XXI — Ep.1: 5 Secretos de Performance',
        'Proceso Demand Planning: Los Conceptos Básicos Aplicados',
        "Proceso S&OP: Las 7 A's del Demand Planning — Tu Hoja de Ruta",
      ],
      pro: [
        'Los Pilotos del Hércules: Confianza como Estrategia de SC',
        'Reunión ++: 1 Slide Suficiente — Menos es Más',
        'Gerenciamiento del Portfolio: SKU Management de Precisión',
        'Demand Planning: 8 KPIs para Ser un Planner Exitoso',
        'Soy Demand Planner Ep.2: 5 Nuevos Secretos de Performance',
      ],
      expert: [
        'Planning: Consejos de Waste Management para tu Operación',
        'Supply Chain: ¿Cómo Calificarías tu Reporting? 6 Claves para un 10',
        'Reporting de Producto Faltante: Más Inteligencia, Menos Energía',
        'Proceso S&OP: Forecast Accuracy Losses Tree — Mejora Estructural',
        'Supply Chain Strategy: Cómo Prepararla para Ganar',
        'Proceso S&OP: Falta Producto en Góndola — Caso Real de Sincronía',
        'Soy Demand Planner Ep.3: 5 Tips para Reportes que Impactan',
        'Demand Planning: Generador de Certezas — Salí del Loop Infinito',
      ],
    },
  },
  {
    id: 'supply-planning',
    name: 'Supply Planning',
    icon: '🗓️',
    description: 'MPS, planeamiento estratégico, SKU management y gestión de producto.',
    tiers: {
      starter: { label: 'Starter', courses: 3,  minutes: 58,  price: 4,  listPrice: 9,  savings: 56, driveLink: process.env.DRIVE_SP_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 6,  minutes: 140, price: 12, listPrice: 24, savings: 50, driveLink: process.env.DRIVE_SP_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 12, minutes: 245, price: 22, listPrice: 45, savings: 51, driveLink: process.env.DRIVE_SP_EXPERT   || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Plan B, C, D: La Mentalidad que Simplifica las Crisis',
        'Proceso MPS: Conceptos Básicos del Plan Maestro de Producción',
      ],
      pro: [
        'Los Pilotos del Hércules: Confianza como Estrategia de SC',
        'Reunión ++: 1 Slide Suficiente — Menos es Más',
        'Planeamiento Estratégico: Los 10 Puntos Clave',
      ],
      expert: [
        'Planning: Consejos de Waste Management para tu Operación',
        'Planning: ¿Cuánto Tiempo Invertís Realmente en tu Plan?',
        'Planning: Dinamizá tus Viernes con Productividad Máxima',
        'Planeamiento de Innovación: ¿Por Qué Siempre los Mismos Problemas?',
        'Supply Chain Strategy: Cómo Prepararla para Ganar',
        'SpyGlass: Dominá la Gestión de Producto Importado',
      ],
    },
  },
  {
    id: 'planif-materiales',
    name: 'Planif. Materiales',
    icon: '⚙️',
    description: 'Proceso MRP, milk run, relación con proveedores y optimización avanzada.',
    tiers: {
      starter: { label: 'Starter', courses: 5,  minutes: 67,  price: 9,  listPrice: 18, savings: 50, driveLink: process.env.DRIVE_PM_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 10, minutes: 168, price: 21, listPrice: 42, savings: 50, driveLink: process.env.DRIVE_PM_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 13, minutes: 232, price: 28, listPrice: 57, savings: 51, driveLink: process.env.DRIVE_PM_EXPERT   || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Plan B, C, D: La Mentalidad que Simplifica las Crisis',
        'Soy MRP Ep.1: 5 Secretos para Optimizar tu Planeamiento',
        'Distribución Normal: La Herramienta Indispensable del Planificador',
        'Proceso de Planeamiento: Las 4 Funciones Básicas de Cada Rol',
      ],
      pro: [
        'Los Pilotos del Hércules: Confianza como Estrategia de SC',
        'Reunión ++: 1 Slide Suficiente — Menos es Más',
        'Proceso MRP: Lo Que Todo Planificador Debe Saber',
        'Soy MRP Ep.2: 5 Nuevos Secretos para Optimizar tu Operación',
        'Soy MRP: Milk Run de Materiales — Optimizá tu Abastecimiento',
      ],
      expert: [
        'Planning: Consejos de Waste Management para tu Operación',
        'Relación con Proveedores: Los 9 Secretos para una Performance Óptima',
        'Proveedores: Evaluá para Transformar, No para Controlar',
      ],
    },
  },
]

export function minutesToLabel(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

// Bundle prices when buying all 7 categories at the same level (política v9)
// listPrice = precio de lista antes del ~50% descuento
export const BUNDLE_PRICES: Record<TierKey, { price: number; listPrice: number; courses: number; minutes: number }> = {
  starter: { price: 39,  listPrice: 80,  courses: 20, minutes: 386 },
  pro:     { price: 90,  listPrice: 179, courses: 40, minutes: 772 },
  expert:  { price: 149, listPrice: 301, courses: 59, minutes: 1140 },
}

// Totals for global level cards — uses bundle prices + course/minute counts
export function getLevelTotals(tier: TierKey) {
  const b = BUNDLE_PRICES[tier]
  return { price: b.price, listPrice: b.listPrice, courses: b.courses, minutes: b.minutes }
}
