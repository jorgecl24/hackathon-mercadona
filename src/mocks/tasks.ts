import type { Category, ConfidenceLevel, Factor, Horizon, OrderTask, Section } from '@/types'

/*
 * Tienda ficticia de Valencia en una semana de octubre con «veranillo»
 * (31 ºC), el festivo del 9 de octubre y partido en Mestalla.
 *
 * `weeklySales` es la venta habitual de 7 días sin señales. La previsión
 * aplica los factores encima, y el sugerido cubre la previsión más un 10 %
 * de seguridad, descontando el stock y redondeando a bultos.
 */
interface ProductSeed {
  id: string
  name: string
  section: Section
  category: Category
  packSize: number
  store: number
  warehouse: number
  weeklySales: number
  /** Pedido semanal que haría el gestor sin previsión. */
  usualWeekly: number
  factors: Factor[]
  score: number
}

const weather = (effect: number): Factor => ({ kind: 'weather', label: 'Clima 31 ºC', effect })
const holiday = (effect: number): Factor => ({ kind: 'holiday', label: 'Festivo 9 oct', effect })
const match = (effect: number): Factor => ({ kind: 'event', label: 'Partido Mestalla', effect })
const trend = (effect: number): Factor => ({
  kind: 'trend',
  label: effect >= 0 ? 'Tendencia al alza' : 'Tendencia a la baja',
  effect,
})
const history = (effect: number): Factor => ({ kind: 'history', label: 'Histórico', effect })
const shortHistory: Factor = { kind: 'short-history', label: 'Histórico corto', effect: 0 }

const seeds: ProductSeed[] = [
  { id: 'p01', name: 'Agua mineral Bronchales 1,5 L', section: 'Bebidas', category: 'water', packSize: 6, store: 180, warehouse: 240, weeklySales: 840, usualWeekly: 480, factors: [weather(0.22)], score: 89 },
  { id: 'p02', name: 'Cerveza Steinburg lata 33 cl', section: 'Bebidas', category: 'beer', packSize: 24, store: 312, warehouse: 288, weeklySales: 1150, usualWeekly: 648, factors: [weather(0.15), match(0.2)], score: 81 },
  { id: 'p03', name: 'Refresco de cola Hacendado 2 L', section: 'Bebidas', category: 'soda', packSize: 6, store: 66, warehouse: 84, weeklySales: 290, usualWeekly: 168, factors: [weather(0.1), match(0.12)], score: 84 },
  { id: 'p04', name: 'Horchata Hacendado 1 L', section: 'Bebidas', category: 'juice', packSize: 6, store: 30, warehouse: 30, weeklySales: 110, usualWeekly: 66, factors: [weather(0.3)], score: 76 },
  { id: 'p05', name: 'Zumo de naranja exprimido Hacendado 1 L', section: 'Bebidas', category: 'juice', packSize: 6, store: 48, warehouse: 36, weeklySales: 150, usualWeekly: 84, factors: [history(0)], score: 91 },
  { id: 'p06', name: 'Leche entera Hacendado 1 L', section: 'Lácteos', category: 'milk', packSize: 6, store: 120, warehouse: 300, weeklySales: 960, usualWeekly: 660, factors: [holiday(0.12)], score: 93 },
  { id: 'p07', name: 'Leche semidesnatada Hacendado 1 L', section: 'Lácteos', category: 'milk', packSize: 6, store: 96, warehouse: 240, weeklySales: 720, usualWeekly: 480, factors: [holiday(0.1)], score: 92 },
  { id: 'p08', name: 'Yogur natural Hacendado pack 4', section: 'Lácteos', category: 'yogurt', packSize: 12, store: 60, warehouse: 30, weeklySales: 70, usualWeekly: 48, factors: [history(-0.05)], score: 88 },
  { id: 'p09', name: 'Yogur griego Hacendado pack 4', section: 'Lácteos', category: 'yogurt', packSize: 12, store: 48, warehouse: 24, weeklySales: 84, usualWeekly: 60, factors: [trend(-0.08)], score: 83 },
  { id: 'p10', name: 'Kéfir natural Hacendado 500 g', section: 'Lácteos', category: 'yogurt', packSize: 6, store: 18, warehouse: 12, weeklySales: 60, usualWeekly: 36, factors: [trend(0.18)], score: 72 },
  { id: 'p11', name: 'Queso fresco batido 0 % Hacendado', section: 'Lácteos', category: 'cheese', packSize: 6, store: 24, warehouse: 12, weeklySales: 66, usualWeekly: 42, factors: [trend(0.12)], score: 78 },
  { id: 'p12', name: 'Conos nata y chocolate Hacendado 4 ud', section: 'Congelados', category: 'ice-cream', packSize: 12, store: 24, warehouse: 24, weeklySales: 96, usualWeekly: 48, factors: [weather(0.35)], score: 82 },
  { id: 'p13', name: 'Polos de limón Hacendado 10 ud', section: 'Congelados', category: 'ice-cream', packSize: 10, store: 20, warehouse: 10, weeklySales: 50, usualWeekly: 30, factors: [weather(0.4)], score: 70 },
  { id: 'p14', name: 'Sandía baja en semillas (pieza)', section: 'Fruta y verdura', category: 'fruit', packSize: 4, store: 16, warehouse: 8, weeklySales: 60, usualWeekly: 36, factors: [weather(0.25)], score: 79 },
  { id: 'p15', name: 'Plátano de Canarias 1 kg', section: 'Fruta y verdura', category: 'fruit', packSize: 10, store: 40, warehouse: 30, weeklySales: 160, usualWeekly: 100, factors: [history(0)], score: 90 },
  { id: 'p16', name: 'Fresas 500 g', section: 'Fruta y verdura', category: 'fruit', packSize: 10, store: 50, warehouse: 40, weeklySales: 90, usualWeekly: 60, factors: [history(-0.15)], score: 74 },
  { id: 'p17', name: 'Naranja de mesa malla 2 kg', section: 'Fruta y verdura', category: 'citrus', packSize: 8, store: 24, warehouse: 24, weeklySales: 96, usualWeekly: 56, factors: [history(0.05)], score: 86 },
  { id: 'p18', name: 'Lechuga iceberg (pieza)', section: 'Fruta y verdura', category: 'vegetable', packSize: 12, store: 36, warehouse: 12, weeklySales: 120, usualWeekly: 72, factors: [weather(0.1)], score: 85 },
  { id: 'p19', name: 'Aguacate malla 4 ud', section: 'Fruta y verdura', category: 'fruit', packSize: 8, store: 16, warehouse: 8, weeklySales: 64, usualWeekly: 40, factors: [trend(0.12)], score: 77 },
  { id: 'p20', name: 'Pechuga de pollo fileteada 500 g', section: 'Carne', category: 'chicken', packSize: 8, store: 32, warehouse: 16, weeklySales: 140, usualWeekly: 96, factors: [holiday(0.1)], score: 87 },
  { id: 'p21', name: 'Hamburguesa de vacuno 4 ud', section: 'Carne', category: 'meat', packSize: 8, store: 16, warehouse: 16, weeklySales: 72, usualWeekly: 48, factors: [match(0.15), weather(0.1)], score: 75 },
  { id: 'p22', name: 'Salmón fresco en lomos 250 g', section: 'Pescado', category: 'fish', packSize: 6, store: 30, warehouse: 12, weeklySales: 54, usualWeekly: 36, factors: [history(-0.1)], score: 73 },
  { id: 'p23', name: 'Barra de pan', section: 'Panadería', category: 'bread', packSize: 20, store: 40, warehouse: 0, weeklySales: 700, usualWeekly: 720, factors: [holiday(-0.06)], score: 90 },
  { id: 'p24', name: 'Patatas fritas lisas Hacendado 170 g', section: 'Despensa', category: 'snack', packSize: 12, store: 48, warehouse: 48, weeklySales: 150, usualWeekly: 72, factors: [match(0.25)], score: 80 },
  { id: 'p25', name: 'Hummus clásico Hacendado 240 g', section: 'Despensa', category: 'spread', packSize: 6, store: 18, warehouse: 6, weeklySales: 48, usualWeekly: 30, factors: [trend(0.12)], score: 71 },
  { id: 'p26', name: 'Crema de pistacho Hacendado 200 g', section: 'Despensa', category: 'spread', packSize: 6, store: 12, warehouse: 0, weeklySales: 30, usualWeekly: 18, factors: [trend(0.4), shortHistory], score: 52 },
  { id: 'p27', name: 'Huevos L docena', section: 'Huevos', category: 'egg', packSize: 10, store: 60, warehouse: 60, weeklySales: 260, usualWeekly: 150, factors: [holiday(0.1)], score: 89 },
]

const SAFETY_MARGIN = 0.1

const roundToPacks = (units: number, packSize: number) =>
  Math.ceil(Math.max(0, units) / packSize) * packSize

const confidenceLevel = (score: number): ConfidenceLevel =>
  score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'

/** Con horizontes largos la previsión pierde precisión. */
const HORIZON_SCORE_SHIFT: Record<Horizon, number> = { 3: 3, 7: 0, 14: -6 }

export function buildOrderTasks(horizon: Horizon): OrderTask[] {
  const scale = horizon / 7

  return seeds.map((seed) => {
    const stock = seed.store + seed.warehouse
    const lift = seed.factors.reduce((sum, f) => sum + f.effect, 0)
    const forecastSales = Math.round(seed.weeklySales * scale * (1 + lift))
    const score = Math.min(99, seed.score + HORIZON_SCORE_SHIFT[horizon])

    return {
      id: seed.id,
      product: {
        name: seed.name,
        section: seed.section,
        category: seed.category,
        packSize: seed.packSize,
      },
      stock: { store: seed.store, warehouse: seed.warehouse },
      usualOrder: roundToPacks(seed.usualWeekly * scale, seed.packSize),
      suggested: roundToPacks(forecastSales * (1 + SAFETY_MARGIN) - stock, seed.packSize),
      forecastSales,
      factors: seed.factors,
      confidence: { level: confidenceLevel(score), score },
      status: 'pending',
    }
  })
}
