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
      starter: { label: 'Starter', courses: 10, minutes: 54,  price: 7,  listPrice: 14, savings: 50, driveLink: process.env.DRIVE_SC_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 21, minutes: 145, price: 16, listPrice: 32, savings: 50, driveLink: process.env.DRIVE_SC_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 30, minutes: 238, price: 31, listPrice: 62, savings: 50, driveLink: process.env.DRIVE_SC_EXPERT   || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'La Materia Gris de tu Equipo: ¿Cuánto Poder Tenés?',
        'Orquesta o Quirófano: ¿Cómo Trabaja tu Organización?',
        'Microproyectos I: La Clave para Equipos de Alta Performance',
        'Capacidad de Procesos: ¿Sabés Qué le Pedís a tu Fábrica?',
        'Brilliant Start Up: Las 12 Herramientas del Joven Profesional',
        'Liderar es Motivar Ep.1: El Secreto de los que Hacen Mover Equipos',
        'Liderar es Motivar Ep.2: El Arte de Mover Personas',
        'Supply Chain: Las Siglas Clave que Todo Profesional SC Debe Conocer',
        'Proceso de Planeamiento: Las 4 Funciones Básicas de Cada Rol',
      ],
      pro: [
        'Los Pilotos del Hércules: Confianza como Estrategia de SC',
        'Legado Único: El Método para Trascender en tu Área',
        '¡Es Posible lo IMPOSIBLE! Cómo Decir SÍ a Pedidos Imposibles en SC',
        'Liderazgo: 10 Ejercicios para Mejorar el Engagement (Ep. II)',
        'Supply Chain: Los 11 Principios que Crean el Mindset Ganador',
        'Mentoring: La Cortina de la Abuela — Persevera y Convencerás',
        'Productividad: La Charla de Yves Morieux que Cambia Todo',
        'El Consumidor en el Centro: La Lección de Jeff Bezos para SC',
        'Brilliant Start Up Ep.2: Las Siguientes 12 Herramientas Transformadoras',
        'Plan Zero: La Herramienta que Motiva a tu Equipo a la Mejora Continua',
        'Microproyectos II: Empoderá Creativamente a tu Equipo',
      ],
      expert: [
        'Soy de Supply Chain: ¿Cómo Nos Educamos en el Siglo XXI?',
        'Mi Liderazgo: 12 Habilidades para Destacarte desde el Comienzo',
        'Supply Chain: ¿Cómo Calificarías tu Reporting? 6 Claves para un 10',
        'Reporting de Producto Faltante: Más Inteligencia, Menos Energía',
        'Herramienta ECRS-DA: Simplificá tu Vida y la de tu Equipo',
        'Jeff Bezos: 14 Principios de Liderazgo que Definen una Cultura',
        'Mentoring: Las Metas y los Tiburones — No Temas al Desafío',
        'Planning: Conversando con Ventas — Cómo Reducir el 50% de las Discusiones',
        'Microproyectos III: La Evolución de los Palotes — Gestioná tu Tiempo',
      ],
    },
  },
  {
    id: 'manufactura',
    name: 'Manufactura',
    icon: '🏭',
    description: 'Gestión de plantas, pérdidas, KPIs y mejora continua.',
    tiers: {
      starter: { label: 'Starter', courses: 8,  minutes: 88,  price: 16, listPrice: 33, savings: 52, driveLink: process.env.DRIVE_MAN_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 17, minutes: 154, price: 23, listPrice: 45, savings: 49, driveLink: process.env.DRIVE_MAN_PRO     || '#' },
      expert:  { label: 'Expert',  courses: 27, minutes: 212, price: 27, listPrice: 54, savings: 50, driveLink: process.env.DRIVE_MAN_EXPERT  || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Árbol de Pérdidas: No Pierdas su Poder con un Uso Incorrecto',
        'Pérdidas Crónicas y Esporádicas: El Secreto del Profesional Diferente',
        '8 Grandes Pérdidas de Manufactura: Convertí tu ScoreCard en Acción',
        'Reunión ++: 1 Slide Suficiente — Menos es Más',
        'El Poder de la Limpieza: El Hábito que Transforma Plantas y Mentes',
        'Capacidad de Procesos: ¿Sabés Qué le Pedís a tu Fábrica?',
        'Soy Jefe de Producción Ep.1: 5 Secretos para Destacarte',
      ],
      pro: [
        'Cambios de Formato: Mis 4 Secretos para Reducir Setup al Mínimo',
        'Soy Jefe de Producción Ep.2: ¿Qué KPIs Usar en tu Planta?',
        'Operadores: KPIs Hechos Acción — Mucho Más que una Medición',
        'Manufactura: La Regla del 50% — Desafiá lo Imposible',
        'Árbol de Pérdidas: Casos Reales de Fábrica para Aprender Rápido',
        'Soy Jefe de Producción: ¿Caminás la Planta? ¿Realmente la Ves?',
        'Soy Jefe de Producción Ep.3: Cómo Vivir Más Tranquilo en Operaciones',
        'TPM: El Programa que Me Cambió la Cabeza (y Cambiará la Tuya)',
        'Manufactura: Competir y Jugar para Crecer — Motivación en el Piso',
      ],
      expert: [
        'Manufactura: El Nivel de Conocimiento que tu Equipo Necesita',
        'Herramienta ECRS-DA: Simplificá tu Vida y la de tu Equipo',
        'La Planta No es Flexible: Cómo Remar a Favor de la Corriente',
        'Plan Zero: La Herramienta que Motiva a tu Equipo a la Mejora Continua',
        'Non Stop Line: La Perspectiva Creativa que Revoluciona Manufactura',
        'Soy Jefe de Producción: Puntos Q — Otro Abordaje de la Calidad',
        'Soy Jefe de Producción: Puntos R — Otro Abordaje de la Seguridad',
        'Manufactura: Caso Exitoso de Change Over — Imperdible para Jefes',
        'Soy Jefe de Producción: KPIs Evolutivos que Generan Acción Real',
        'Soy Jefe de Producción: ¡Hay que Simplificar! 2 Ideas que Cambian Todo',
      ],
    },
  },
  {
    id: 'stocks',
    name: 'Stocks',
    icon: '📦',
    description: 'Inventarios, safety stock, análisis ABC y herramientas avanzadas.',
    tiers: {
      starter: { label: 'Starter', courses: 6,  minutes: 56,  price: 6,  listPrice: 12, savings: 50, driveLink: process.env.DRIVE_STK_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 9,  minutes: 100, price: 12, listPrice: 24, savings: 50, driveLink: process.env.DRIVE_STK_PRO     || '#' },
      expert:  { label: 'Expert',  courses: 13, minutes: 270, price: 34, listPrice: 69, savings: 51, driveLink: process.env.DRIVE_STK_EXPERT  || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Define tu Target de Stock como un Experto: Sin Adivinar',
        'Reunión ++: Mi Fórmula para Liberar Tiempo de Equipo',
        'Modelo de Wilson: El Cálculo que Ordena tu Inventario',
        'Distribución Normal: La Herramienta Indispensable del Planificador',
        'Gestión de Inventarios: Ejemplos Simples para Dominar los Conceptos',
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
      starter: { label: 'Starter', courses: 5,  minutes: 46,  price: 4,  listPrice: 9,  savings: 56, driveLink: process.env.DRIVE_SOP_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 7,  minutes: 125, price: 15, listPrice: 30, savings: 50, driveLink: process.env.DRIVE_SOP_PRO     || '#' },
      expert:  { label: 'Expert',  courses: 11, minutes: 153, price: 19, listPrice: 39, savings: 51, driveLink: process.env.DRIVE_SOP_EXPERT  || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Reunión ++: 1 Slide Suficiente — Menos es Más',
        'Proceso S&OP: Los Conceptos Básicos que Todo SC Debe Dominar',
        "Proceso S&OP: Las 7 A's del Demand Planning — Tu Hoja de Ruta",
        'S&OP: Lo que NO Es — Aclaremos el Concepto de Una Vez',
      ],
      pro: [
        'Proceso S&OP: ¿Cuál es el Estado de Salud de tu Empresa?',
        'Proceso S&OP: Falta Producto en Góndola — Caso Real de Sincronía',
      ],
      expert: [
        'Reporting de Producto Faltante: Más Inteligencia, Menos Energía',
        'Proceso S&OP: Forecast Accuracy Losses Tree — Mejora Estructural',
        'Demand Planning: Generador de Certezas — Salí del Loop Infinito',
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
      starter: { label: 'Starter', courses: 5,  minutes: 59,  price: 7,  listPrice: 15, savings: 53, driveLink: process.env.DRIVE_DP_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 9,  minutes: 153, price: 23, listPrice: 45, savings: 49, driveLink: process.env.DRIVE_DP_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 17, minutes: 383, price: 51, listPrice: 104, savings: 51, driveLink: process.env.DRIVE_DP_EXPERT  || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Reunión ++: 1 Slide Suficiente — Menos es Más',
        'Soy Demand Planner Siglo XXI — Ep.1: 5 Secretos de Performance',
        "Proceso S&OP: Las 7 A's del Demand Planning — Tu Hoja de Ruta",
        'Proceso de Planeamiento: Las 4 Funciones Básicas de Cada Rol',
      ],
      pro: [
        'Los Pilotos del Hércules: Confianza como Estrategia de SC',
        'Gerenciamiento del Portfolio: SKU Management de Precisión',
        'Demand Planning: 8 KPIs para Ser un Planner Exitoso',
        'Soy Demand Planner Ep.2: 5 Nuevos Secretos de Performance',
      ],
      expert: [
        'Supply Chain: ¿Cómo Calificarías tu Reporting? 6 Claves para un 10',
        'Reporting de Producto Faltante: Más Inteligencia, Menos Energía',
        'Proceso S&OP: Forecast Accuracy Losses Tree — Mejora Estructural',
        'Proceso S&OP: Falta Producto en Góndola — Caso Real de Sincronía',
        'Soy Demand Planner Ep.3: 5 Tips para Reportes que Impactan',
        'Demand Planning: Generador de Certezas — Salí del Loop Infinito',
        'Soy Demand Planner Ep.4: 12 Trucos que Cambian tu Performance',
        'Planning: Conversando con Ventas — Cómo Reducir el 50% de las Discusiones',
      ],
    },
  },
  {
    id: 'supply-planning',
    name: 'Supply Planning',
    icon: '🗓️',
    description: 'MPS, planeamiento estratégico, SKU management y gestión de producto.',
    tiers: {
      starter: { label: 'Starter', courses: 7,  minutes: 58,  price: 4,  listPrice: 9,  savings: 56, driveLink: process.env.DRIVE_SP_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 9,  minutes: 140, price: 12, listPrice: 24, savings: 50, driveLink: process.env.DRIVE_SP_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 13, minutes: 245, price: 22, listPrice: 45, savings: 51, driveLink: process.env.DRIVE_SP_EXPERT   || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Plan B, C, D: La Mentalidad que Simplifica las Crisis',
        'Reunión ++: 1 Slide Suficiente — Menos es Más',
        'Planning: ¿Cuánto Tiempo Invertís Realmente en tu Plan?',
        'Distribución Normal: La Herramienta Indispensable del Planificador',
        'Proceso de Planeamiento: Las 4 Funciones Básicas de Cada Rol',
        'Planeamiento: Un Poco de Futuro — Cómo Evolucionará el Área',
      ],
      pro: [
        'Los Pilotos del Hércules: Confianza como Estrategia de SC',
        'Gerenciamiento del Portfolio: SKU Management de Precisión',
      ],
      expert: [
        'Planning: Dinamizá tus Viernes con Productividad Máxima',
        'Planeamiento de Innovación: ¿Por Qué Siempre los Mismos Problemas?',
        'SpyGlass: Dominá la Gestión de Producto Importado',
        'Planning: Conversando con Ventas — Cómo Reducir el 50% de las Discusiones',
      ],
    },
  },
  {
    id: 'planif-materiales',
    name: 'Planif. Materiales',
    icon: '⚙️',
    description: 'Proceso MRP, milk run, relación con proveedores y optimización avanzada.',
    tiers: {
      starter: { label: 'Starter', courses: 6,  minutes: 67,  price: 9,  listPrice: 18, savings: 50, driveLink: process.env.DRIVE_PM_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 10, minutes: 168, price: 21, listPrice: 42, savings: 50, driveLink: process.env.DRIVE_PM_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 13, minutes: 232, price: 28, listPrice: 57, savings: 51, driveLink: process.env.DRIVE_PM_EXPERT   || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Plan B, C, D: La Mentalidad que Simplifica las Crisis',
        'Reunión ++: 1 Slide Suficiente — Menos es Más',
        'Soy MRP Ep.1: 5 Secretos para Optimizar tu Planeamiento',
        'Distribución Normal: La Herramienta Indispensable del Planificador',
        'Proceso de Planeamiento: Las 4 Funciones Básicas de Cada Rol',
      ],
      pro: [
        'Los Pilotos del Hércules: Confianza como Estrategia de SC',
        'Proceso MRP: Lo Que Todo Planificador Debe Saber',
        'Soy MRP Ep.2: 5 Nuevos Secretos para Optimizar tu Operación',
        'Soy MRP: Milk Run de Materiales — Optimizá tu Abastecimiento',
      ],
      expert: [
        'Proveedores: Evaluá para Transformar, No para Controlar',
        'Soy MRP Ep.3: 5 Tips para Optimizar tu Planeamiento de Materiales',
        'Soy MRP Ep.4: 6 Secretos Avanzados del Planificador Experto',
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

// Upgrade pricing (catálogo completo, de un nivel al siguiente)
export const UPGRADE_PRICES = {
  'starter-to-pro': { price: 51, from: 'Starter', to: 'Pro',    label: 'Upgrade Starter → Pro'    },
  'pro-to-expert':  { price: 59, from: 'Pro',     to: 'Expert', label: 'Upgrade Pro → Expert'    },
} as const
export type UpgradeKey = keyof typeof UPGRADE_PRICES
