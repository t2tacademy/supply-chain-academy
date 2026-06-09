export type TierKey = 'starter' | 'pro' | 'expert'

export interface Tier {
  label: string
  courses: number
  minutes: number
  price: number      // precio con descuento acumulado
  listPrice: number  // precio de lista (sin descuento)
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

// listPrice = suma de precios lista de los niveles incluidos (de la Sección 2)
// savings   = % de ahorro redondeado (de la Sección 3)
export const CATEGORIES: Category[] = [
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    icon: '🔗',
    description: 'Visión estratégica, KPIs, reporting y mindset ganador.',
    tiers: {
      starter: { label: 'Starter', courses: 5,  minutes: 54,  price: 1,  listPrice: 2,   savings: 30, driveLink: process.env.DRIVE_SC_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 12, minutes: 174, price: 17, listPrice: 25,  savings: 32, driveLink: process.env.DRIVE_SC_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 20, minutes: 280, price: 30, listPrice: 46,  savings: 35, driveLink: process.env.DRIVE_SC_EXPERT   || '#' },
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
        'Reporting de Producto Faltante: Más Inteligencia, Menos Energía',
        'KPIs de Supply Chain: Encontrá el que Estás Buscando',
      ],
      expert: [
        'Soy de Supply Chain: ¿Cómo Nos Educamos en el Siglo XXI?',
        'Proceso S&OP: ¿Cuál es el Estado de Salud de tu Empresa?',
        'Supply Chain Strategy: Cómo Prepararla para Ganar',
        'Herramienta ECRS-DA: Simplificá tu Vida y la de tu Equipo',
        'El Consumidor en el Centro: La Lección de Jeff Bezos para SC',
        'Demand Planning: Generador de Certezas — Salí del Loop Infinito',
        'Plan Zero: La Herramienta que Motiva a tu Equipo a la Mejora Continua',
        'Planning: Conversando con Ventas — Cómo Reducir el 50% de las Discusiones',
      ],
    },
  },
  {
    id: 'manufactura',
    name: 'Manufactura',
    icon: '🏭',
    description: 'Gestión de plantas, pérdidas, KPIs y mejora continua.',
    tiers: {
      starter: { label: 'Starter', courses: 7,  minutes: 88,  price: 6,  listPrice: 8,   savings: 30, driveLink: process.env.DRIVE_MAN_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 11, minutes: 169, price: 13, listPrice: 19,  savings: 32, driveLink: process.env.DRIVE_MAN_PRO     || '#' },
      expert:  { label: 'Expert',  courses: 15, minutes: 244, price: 30, listPrice: 45,  savings: 33, driveLink: process.env.DRIVE_MAN_EXPERT  || '#' },
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
        'Soy Jefe de Producción Ep.2: ¿Qué KPIs Usar en tu Planta?',
      ],
      expert: [
        'Manufactura: 9 Herramientas Transformadoras para tu Planta',
        'Herramienta ECRS-DA: Simplificá tu Vida y la de tu Equipo',
        'La Planta No es Flexible: Cómo Remar a Favor de la Corriente',
        'Plan Zero: La Herramienta que Motiva a tu Equipo a la Mejora Continua',
      ],
    },
  },
  {
    id: 'stocks',
    name: 'Stocks',
    icon: '📦',
    description: 'Inventarios, safety stock, análisis ABC y herramientas avanzadas.',
    tiers: {
      starter: { label: 'Starter', courses: 5,  minutes: 56,  price: 6,  listPrice: 9,   savings: 30, driveLink: process.env.DRIVE_STK_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 9,  minutes: 112, price: 11, listPrice: 17,  savings: 35, driveLink: process.env.DRIVE_STK_PRO     || '#' },
      expert:  { label: 'Expert',  courses: 13, minutes: 292, price: 49, listPrice: 72,  savings: 32, driveLink: process.env.DRIVE_STK_EXPERT  || '#' },
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
        'Gestión de Inventarios: Análisis ABC — Optimizá tu Portafolio',
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
      starter: { label: 'Starter', courses: 5,  minutes: 58,  price: 6,  listPrice: 9,   savings: 30, driveLink: process.env.DRIVE_SOP_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 11, minutes: 153, price: 22, listPrice: 33,  savings: 33, driveLink: process.env.DRIVE_SOP_PRO     || '#' },
      expert:  { label: 'Expert',  courses: 13, minutes: 181, price: 24, listPrice: 37,  savings: 35, driveLink: process.env.DRIVE_SOP_EXPERT  || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Proceso S&OP: Los Conceptos Básicos que Todo SC Debe Dominar',
        'Proceso S&OP: El Futuro Está en los Datos',
        "Proceso S&OP: Las 7 A's del Demand Planning — Tu Hoja de Ruta",
        "S&OP: Lo que NO Es — Aclaremos el Concepto de Una Vez",
      ],
      pro: [
        'Reunión ++: 1 Slide Suficiente — Menos es Más',
        'Proceso S&OP: ¿Cuál es el Estado de Salud de tu Empresa?',
        'Proceso S&OP: Forecast Accuracy Losses Tree — Mejora Estructural',
        'Supply Chain Strategy: Cómo Prepararla para Ganar',
        'Proceso S&OP: Falta Producto en Góndola — Caso Real de Sincronía',
        'Demand Planning: Generador de Certezas — Salí del Loop Infinito',
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
      starter: { label: 'Starter', courses: 5,  minutes: 74,  price: 11, listPrice: 16,  savings: 30, driveLink: process.env.DRIVE_DP_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 10, minutes: 170, price: 21, listPrice: 32,  savings: 34, driveLink: process.env.DRIVE_DP_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 20, minutes: 451, price: 57, listPrice: 85,  savings: 33, driveLink: process.env.DRIVE_DP_EXPERT   || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Soy Demand Planner Siglo XXI — Ep.1: 5 Secretos de Performance',
        'Proceso Demand Planning: Los Conceptos Básicos Aplicados',
        "Proceso S&OP: Las 7 A's del Demand Planning — Tu Hoja de Ruta",
        'Proceso de Planeamiento: Las 4 Funciones Básicas de Cada Rol',
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
      starter: { label: 'Starter', courses: 4,  minutes: 77,  price: 10, listPrice: 14,  savings: 30, driveLink: process.env.DRIVE_SP_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 8,  minutes: 186, price: 26, listPrice: 38,  savings: 32, driveLink: process.env.DRIVE_SP_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 16, minutes: 326, price: 43, listPrice: 66,  savings: 35, driveLink: process.env.DRIVE_SP_EXPERT   || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Plan B, C, D: La Mentalidad que Simplifica las Crisis',
        'Proceso MPS: Conceptos Básicos del Plan Maestro de Producción',
        'Proceso de Planeamiento: Las 4 Funciones Básicas de Cada Rol',
      ],
      pro: [
        'Los Pilotos del Hércules: Confianza como Estrategia de SC',
        'Reunión ++: 1 Slide Suficiente — Menos es Más',
        'Planeamiento Estratégico: Los 10 Puntos Clave',
        'Gerenciamiento del Portfolio: SKU Management de Precisión',
      ],
      expert: [
        'Planning: Consejos de Waste Management para tu Operación',
        'Planning: ¿Cuánto Tiempo Invertís Realmente en tu Plan?',
        'Planning: Dinamizá tus Viernes con Productividad Máxima',
        'Planeamiento de Innovación: ¿Por Qué Siempre los Mismos Problemas?',
        'Supply Chain Strategy: Cómo Prepararla para Ganar',
        'SpyGlass: Dominá la Gestión de Producto Importado',
        'Planning: Conversando con Ventas — Cómo Reducir el 50% de las Discusiones',
        'Planeamiento: Un Poco de Futuro — Cómo Evolucionará el Área',
      ],
    },
  },
  {
    id: 'planif-materiales',
    name: 'Planif. Materiales',
    icon: '⚙️',
    description: 'Proceso MRP, milk run, relación con proveedores y optimización avanzada.',
    tiers: {
      starter: { label: 'Starter', courses: 5,  minutes: 67,  price: 4,  listPrice: 6,   savings: 30, driveLink: process.env.DRIVE_PM_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 10, minutes: 168, price: 11, listPrice: 17,  savings: 35, driveLink: process.env.DRIVE_PM_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 16, minutes: 285, price: 29, listPrice: 43,  savings: 33, driveLink: process.env.DRIVE_PM_EXPERT   || '#' },
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
        'Supply Chain Strategy: Cómo Prepararla para Ganar',
        'Soy MRP Ep.3: 5 Tips para Optimizar tu Planeamiento de Materiales',
        'Soy MRP Ep.4: 6 Secretos Avanzados del Planificador Experto',
      ],
    },
  },
  {
    id: 'liderazgo-sc',
    name: 'Liderazgo SC',
    icon: '🚀',
    description: 'Liderazgo transformacional, equipos de alto rendimiento y mentoring.',
    tiers: {
      starter: { label: 'Starter', courses: 9,  minutes: 69,  price: 4,  listPrice: 6,   savings: 30, driveLink: process.env.DRIVE_LSC_STARTER || '#' },
      pro:     { label: 'Pro',     courses: 24, minutes: 304, price: 35, listPrice: 50,  savings: 30, driveLink: process.env.DRIVE_LSC_PRO     || '#' },
      expert:  { label: 'Expert',  courses: 33, minutes: 503, price: 57, listPrice: 86,  savings: 34, driveLink: process.env.DRIVE_LSC_EXPERT  || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'La Materia Gris de tu Equipo: ¿Cuánto Poder Tenés?',
        'Orquesta o Quirófano: ¿Cómo Trabaja tu Organización?',
        'La Torre del Liderazgo: Las 4 Funciones que Todo Profesional Debe Dominar',
        'Microproyectos I: La Clave para Equipos de Alta Performance',
        '¿Mentoring o Coaching? Elegí la Ayuda Correcta para Crecer',
        'Diagnosticá tu Área en 90 Días: El Paso que Nadie Te Enseña',
        'Identidad Ganadora en 6 Meses: Atendé, Observá y Aportá',
        'Liderar es Motivar Ep.1: El Secreto de los que Hacen Mover Equipos',
      ],
      pro: [
        'Legado Único: El Método para Trascender en tu Área',
        'Reunión ++: 1 Minuto Suficiente — Ser Claro, Conciso y Constructivo',
        'Liderazgo: 10 Ejercicios para Mejorar el Engagement (Ep. II)',
        'Team Branding: Hacé tu Equipo Memorable',
        'Equipos de Alto Rendimiento: 10 Trucos Infalibles',
        'Supply Chain: Los 11 Secretos del Liderazgo Transformador',
        'Cultivá tu Legado: La Clave que Define tu Carrera Profesional',
        'Productividad: La Charla de Yves Morieux que Cambia Todo',
        'El Consumidor en el Centro: La Lección de Jeff Bezos para SC',
        '¿Qué Lidera un Líder? El Mensaje del Maestro Kastika',
        'Mentoring: Las Metas y los Tiburones — No Temas al Desafío',
        'Plan Zero: La Herramienta que Motiva a tu Equipo a la Mejora Continua',
        'Transformación Organizacional: La Intencionalidad como Motor del Cambio',
        'Microproyectos II: Empoderá Creativamente a tu Equipo',
        'Microproyectos III: La Evolución de los Palotes — Gestioná tu Tiempo',
      ],
      expert: [
        'Soy de Supply Chain: ¿Cómo Nos Educamos en el Siglo XXI?',
        'Mi Liderazgo: 12 Habilidades para Destacarte desde el Comienzo',
        'Supply Chain: Los 11 Principios que Crean el Mindset Ganador',
        'Liderar es Motivar Ep.2: El Arte de Mover Personas',
        'Supply Chain: ¿Cómo Calificarías tu Reporting? 6 Claves para un 10',
        'Seguridad Psicológica: Vulnerabilidad Compartida = Confianza Asegurada',
        'Jeff Bezos: 14 Principios de Liderazgo que Definen una Cultura',
        'Liderazgo: 10 Ejercicios para Mejorar el Engagement (Ep. I)',
        'Mi Liderazgo: 15 Leyes Infalibles para Ser Eficaz',
      ],
    },
  },
  {
    id: 'habilidades-blandas',
    name: 'Habilidades Blandas',
    icon: '🧠',
    description: 'Productividad, inteligencia emocional, creatividad y herramientas profesionales.',
    tiers: {
      starter: { label: 'Starter', courses: 6,  minutes: 67,  price: 4,  listPrice: 6,   savings: 30, driveLink: process.env.DRIVE_HB_STARTER  || '#' },
      pro:     { label: 'Pro',     courses: 9,  minutes: 267, price: 32, listPrice: 46,  savings: 30, driveLink: process.env.DRIVE_HB_PRO      || '#' },
      expert:  { label: 'Expert',  courses: 12, minutes: 419, price: 60, listPrice: 90,  savings: 33, driveLink: process.env.DRIVE_HB_EXPERT   || '#' },
    },
    courseTitles: {
      starter: [
        'Aseguramiento de Procesos: Blindá tu Operación',
        'Trade-Off: La Decisión que Otros no Se Animan a Tomar',
        'Reunión ++: La Regla del 5/25 — Foco en la Solución',
        'La Curiosidad como Ventaja Competitiva: Un Caso de Negocio (HBR)',
        'Inteligencia Emocional: 8 Ejercicios para Entrenarla desde Ya',
        'Creatividad: 6 Actividades para Despertar tu Mente Innovadora',
      ],
      pro: [
        'Brilliant Start Up: Las 12 Herramientas del Joven Profesional',
        'Productividad: Las 2 Trampas que Te Desconcentran — y Cómo Escaparlas',
        'Productividad: 4 Tips Simples para Mejorar tu Rendimiento Hoy',
      ],
      expert: [
        'Mentoring: La Cortina de la Abuela — Persevera y Convencerás',
        'Brilliant Start Up Ep.2: Las Siguientes 12 Herramientas Transformadoras',
        'Brilliant Start Up: 5 Porqués I — La Herramienta de Causa Raíz',
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

// Totals for global level cards
export function getLevelTotals(tier: TierKey) {
  return CATEGORIES.reduce(
    (acc, cat) => ({
      price:     acc.price     + cat.tiers[tier].price,
      listPrice: acc.listPrice + cat.tiers[tier].listPrice,
      courses:   acc.courses   + cat.tiers[tier].courses,
      minutes:   acc.minutes   + cat.tiers[tier].minutes,
    }),
    { price: 0, listPrice: 0, courses: 0, minutes: 0 }
  )
}
