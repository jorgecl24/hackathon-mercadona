import type { Category, ConfidenceLevel, Factor, Horizon, OrderTask, Section } from '@/types'
import backendData from './predicciones_backend.json'

/*
 * Tienda ficticia de Valencia en una semana de octubre con «veranillo»
 * (31 ºC), el festivo del 9 de octubre y partido en Mestalla.
 *
 * forecastSales, confidence y factors se toman del backend cuando hay match.
 * El resto (stock, imageUrl, packSize…) viene de los seeds hardcodeados.
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
  imageUrl?: string
  daysToExpiry?: number
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
  // p01: sin backend → escala estimada similar al resto de bebidas
  { id: 'p01', name: 'Agua mineral Bronchales 1,5 L',        section: 'Bebidas',        category: 'water',     packSize:  6, store: 360, warehouse: 480, weeklySales: 2520, usualWeekly: 1440, factors: [weather(0.22)],             score: 89, imageUrl: '/products/p01.jpg' },
  // Bebidas — backend totals: cerveza 1458, cola 1051, horchata 662, zumo 364
  { id: 'p02', name: 'Cerveza Steinburg lata 33 cl',          section: 'Bebidas',        category: 'beer',      packSize: 24, store: 120, warehouse: 150, weeklySales: 1320, usualWeekly: 1104, factors: [weather(0.15), match(0.2)], score: 81, imageUrl: '/products/p02.jpg' },
  { id: 'p03', name: 'Refresco de cola Hacendado 2 L',        section: 'Bebidas',        category: 'soda',      packSize:  6, store:  90, warehouse: 108, weeklySales:  954, usualWeekly:  792, factors: [weather(0.1), match(0.12)],  score: 84, imageUrl: '/products/p03.jpg' },
  { id: 'p04', name: 'Horchata Hacendado 1 L',                section: 'Bebidas',        category: 'juice',     packSize:  6, store:  54, warehouse:  54, weeklySales:  618, usualWeekly:  498, factors: [weather(0.3)],              score: 76, imageUrl: '/products/p04.jpg', daysToExpiry: 5 },
  { id: 'p05', name: 'Zumo de naranja exprimido Hacendado 1 L', section: 'Bebidas',      category: 'juice',     packSize:  6, store: 100, warehouse: 100, weeklySales:  336, usualWeekly:  276, factors: [history(0)],               score: 91, imageUrl: '/products/p05.jpg', daysToExpiry: 3 },
  // Lácteos — backend totals: leche entera 3083, semi 3115, yogur natural 1742, yogur griego 479, kéfir 238, queso 484
  { id: 'p06', name: 'Leche entera Hacendado 1 L',            section: 'Lácteos',        category: 'milk',      packSize:  6, store: 240, warehouse: 336, weeklySales: 2784, usualWeekly: 2316, factors: [holiday(0.12)],             score: 93, imageUrl: '/products/p06.jpg', daysToExpiry: 7 },
  { id: 'p07', name: 'Leche semidesnatada Hacendado 1 L',     section: 'Lácteos',        category: 'milk',      packSize:  6, store: 300, warehouse: 480, weeklySales: 2820, usualWeekly: 2340, factors: [holiday(0.1)],              score: 92, imageUrl: '/products/p07.jpg', daysToExpiry: 7 },
  { id: 'p08', name: 'Yogur natural Hacendado pack 4',        section: 'Lácteos',        category: 'yogurt',    packSize: 12, store: 180, warehouse: 144, weeklySales: 1584, usualWeekly: 1308, factors: [history(-0.05)],           score: 88, imageUrl: '/products/p08.jpg', daysToExpiry: 7 },
  { id: 'p09', name: 'Yogur griego Hacendado pack 4',         section: 'Lácteos',        category: 'yogurt',    packSize: 12, store:  60, warehouse:  60, weeklySales:  456, usualWeekly:  360, factors: [trend(-0.08)],             score: 83, imageUrl: '/products/p09.jpg', daysToExpiry: 14 },
  { id: 'p10', name: 'Kéfir natural Hacendado 500 g',         section: 'Lácteos',        category: 'yogurt',    packSize:  6, store:  30, warehouse:  30, weeklySales:  222, usualWeekly:  180, factors: [trend(0.18)],              score: 72, imageUrl: '/products/p10.jpg', daysToExpiry: 10 },
  { id: 'p11', name: 'Queso fresco batido 0 % Hacendado',     section: 'Lácteos',        category: 'cheese',    packSize:  6, store:  60, warehouse:  66, weeklySales:  462, usualWeekly:  366, factors: [trend(0.12)],              score: 78, imageUrl: '/products/p11.jpg', daysToExpiry: 10 },
  // Congelados — backend totals: conos 762, polos 510
  { id: 'p12', name: 'Conos nata y chocolate Hacendado 4 ud', section: 'Congelados',     category: 'ice-cream', packSize: 12, store:  96, warehouse:  96, weeklySales:  720, usualWeekly:  576, factors: [weather(0.35)],             score: 82, imageUrl: '/products/p12.jpg' },
  { id: 'p13', name: 'Polos de limón Hacendado 10 ud',        section: 'Congelados',     category: 'ice-cream', packSize: 10, store:  48, warehouse:  48, weeklySales:  480, usualWeekly:  390, factors: [weather(0.4)],              score: 70, imageUrl: '/products/p13.jpg' },
  // Fruta y verdura — backend totals: sandía 980, plátano 783, fresas 382, naranja 404, lechuga 642, aguacate 243
  { id: 'p14', name: 'Sandía baja en semillas (pieza)',        section: 'Fruta y verdura', category: 'fruit',   packSize:  4, store:  80, warehouse: 100, weeklySales:  900, usualWeekly:  736, factors: [weather(0.25)],             score: 79, imageUrl: '/products/p14.jpg', daysToExpiry: 5 },
  { id: 'p15', name: 'Plátano de Canarias 1 kg',              section: 'Fruta y verdura', category: 'fruit',   packSize: 10, store:  80, warehouse: 120, weeklySales:  750, usualWeekly:  590, factors: [history(0)],               score: 90, imageUrl: '/products/p15.jpg', daysToExpiry: 5 },
  { id: 'p16', name: 'Fresas 500 g',                          section: 'Fruta y verdura', category: 'fruit',   packSize: 10, store: 120, warehouse: 100, weeklySales:  360, usualWeekly:  290, factors: [history(-0.15)],           score: 74, imageUrl: '/products/p16.jpg', daysToExpiry: 3 },
  { id: 'p17', name: 'Naranja de mesa malla 2 kg',            section: 'Fruta y verdura', category: 'citrus',  packSize:  8, store:  48, warehouse:  56, weeklySales:  384, usualWeekly:  304, factors: [history(0.05)],            score: 86, imageUrl: '/products/p17.jpg', daysToExpiry: 10 },
  { id: 'p18', name: 'Lechuga iceberg (pieza)',                section: 'Fruta y verdura', category: 'vegetable', packSize: 12, store: 80, warehouse: 80, weeklySales: 612, usualWeekly:  492, factors: [weather(0.1)],             score: 85, imageUrl: '/products/p18.jpg', daysToExpiry: 4 },
  { id: 'p19', name: 'Aguacate malla 4 ud',                   section: 'Fruta y verdura', category: 'fruit',   packSize:  8, store:  32, warehouse:  24, weeklySales:  228, usualWeekly:  184, factors: [trend(0.12)],              score: 77, imageUrl: '/products/p19.jpg', daysToExpiry: 5 },
  // Carne — backend totals: pollo 1051, hamburguesa 721
  { id: 'p20', name: 'Pechuga de pollo fileteada 500 g',      section: 'Carne',           category: 'chicken',  packSize:  8, store:  96, warehouse: 104, weeklySales: 1008, usualWeekly:  792, factors: [holiday(0.1)],             score: 87, imageUrl: '/products/p20.jpg', daysToExpiry: 3 },
  { id: 'p21', name: 'Hamburguesa de vacuno 4 ud',            section: 'Carne',           category: 'meat',     packSize:  8, store:  80, warehouse:  96, weeklySales:  672, usualWeekly:  544, factors: [match(0.15), weather(0.1)], score: 75, imageUrl: '/products/p21.jpg', daysToExpiry: 4 },
  // Pescado — backend total: salmón 340
  { id: 'p22', name: 'Salmón fresco en lomos 250 g',          section: 'Pescado',         category: 'fish',     packSize:  6, store:  80, warehouse:  60, weeklySales:  318, usualWeekly:  258, factors: [history(-0.1)],            score: 73, imageUrl: '/products/p22.jpg', daysToExpiry: 2 },
  // Panadería — backend total: pan 4391
  { id: 'p23', name: 'Barra de pan',                          section: 'Panadería',       category: 'bread',    packSize: 20, store: 400, warehouse: 200, weeklySales: 4200, usualWeekly: 3300, factors: [holiday(-0.06)],            score: 90, imageUrl: '/products/p23.jpg', daysToExpiry: 1 },
  // Despensa — backend totals: patatas 875, hummus 625, crema pistacho 161
  { id: 'p24', name: 'Patatas fritas lisas Hacendado 170 g',  section: 'Despensa',        category: 'snack',    packSize: 12, store: 120, warehouse:  96, weeklySales:  840, usualWeekly:  660, factors: [match(0.25)],              score: 80, imageUrl: '/products/p24.jpg' },
  { id: 'p25', name: 'Hummus clásico Hacendado 240 g',        section: 'Despensa',        category: 'spread',   packSize:  6, store:  72, warehouse:  84, weeklySales:  600, usualWeekly:  468, factors: [trend(0.12)],              score: 71, imageUrl: '/products/p25.jpg' },
  { id: 'p26', name: 'Crema de pistacho Hacendado 200 g',     section: 'Despensa',        category: 'spread',   packSize:  6, store:  18, warehouse:  12, weeklySales:  156, usualWeekly:  126, factors: [trend(0.4), shortHistory],  score: 52, imageUrl: '/products/p26.jpg' },
  // Huevos — backend total: 1335
  { id: 'p27', name: 'Huevos L docena',                       section: 'Huevos',          category: 'egg',      packSize: 10, store: 180, warehouse: 160, weeklySales: 1260, usualWeekly: 1010, factors: [holiday(0.1)],             score: 89, imageUrl: '/products/p27.jpg' },
]

/* ─── Backend adapter ────────────────────────────────────────────── */

/** Maps each seed ID to the matching nombre_producto in the backend JSON. */
const SEED_TO_BACKEND: Record<string, string> = {
  p02: 'Cerveza Steinburg lata',
  p03: 'Refresco de cola Hacendado 2 L',
  p04: 'Horchata Hacendado 1 L',
  p05: 'Zumo de naranja exprimido 1 L',
  p06: 'Leche entera Hacendado 1 L',
  p07: 'Leche semidesnatada Hacendado 1 L',
  p08: 'Yogur natural Hacendado',
  p09: 'Yogur griego Hacendado',
  p10: 'Kéfir natural Hacendado',
  p11: 'Queso fresco batido 0 % Hacendado',
  p12: 'Conos nata y chocolate Hacendado',
  p13: 'Polos de limón Hacendado 10 ud',
  p14: 'Sandía baja en semillas',
  p15: 'Plátano de Canarias 1 kg',
  p16: 'Fresas 500 g',
  p17: 'Naranja de mesa 2 kg',
  p18: 'Lechuga iceberg',
  p19: 'Aguacate malla 4 ud',
  p20: 'Pechuga de pollo fileteada 500 g',
  p21: 'Hamburguesa de vacuno',
  p22: 'Salmón fresco en lomos 250 g',
  p23: 'Barra de pan',
  p24: 'Patatas fritas lisas Hacendado',
  p25: 'Hummus clásico Hacendado',
  p26: 'Crema de pistacho Hacendado 200 g',
  p27: 'Huevos L docena',
}

type BackendPrediction = (typeof backendData.predicciones_productos)[number]

const backendLookup = new Map<string, BackendPrediction>(
  backendData.predicciones_productos.map((p) => [p.nombre_producto, p]),
)

/** Derives a Factor chip from the backend motivo string. */
function motivoToFactor(motivo: string, baselineForecast: number, actualForecast: number): Factor {
  const effect = baselineForecast > 0
    ? Math.max(-0.5, Math.min(0.5, (actualForecast - baselineForecast) / baselineForecast))
    : 0

  if (motivo.startsWith('+')) {
    return { kind: 'weather', label: 'Temp. mínima alta', effect }
  }
  return { kind: 'weather', label: 'Temp. mínima baja', effect }
}

/* ─── Build tasks ────────────────────────────────────────────────── */

const SAFETY_MARGIN = 0.1

const roundToPacks = (units: number, packSize: number) =>
  Math.ceil(Math.max(0, units) / packSize) * packSize

const confidenceLevel = (score: number): ConfidenceLevel =>
  score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'

export function buildOrderTasks(horizon: Horizon): OrderTask[] {
  const scale = horizon / 8

  return seeds.map((seed) => {
    const stock = seed.store + seed.warehouse
    const backendKey = SEED_TO_BACKEND[seed.id]
    const pred = backendKey ? backendLookup.get(backendKey) : undefined

    let forecastSales: number
    let score: number
    let factors: Factor[]

    let dailyForecast: number[] | undefined

    if (pred) {
      dailyForecast = pred.predicciones_diarias
      forecastSales = dailyForecast.reduce((a, b) => a + b, 0)
      score = parseInt(pred.confianza_historica_reciente, 10)
      const seedBaseline = Math.round(seed.weeklySales * scale)
      factors = [motivoToFactor(pred.motivo_principal_ajuste, seedBaseline, forecastSales)]
    } else {
      const lift = seed.factors.reduce((sum, f) => sum + f.effect, 0)
      forecastSales = Math.round(seed.weeklySales * scale * (1 + lift))
      score = seed.score
      factors = seed.factors
    }

    return {
      id: seed.id,
      product: {
        name: seed.name,
        section: seed.section,
        category: seed.category,
        packSize: seed.packSize,
        imageUrl: seed.imageUrl,
        daysToExpiry: seed.daysToExpiry,
      },
      stock: { store: seed.store, warehouse: seed.warehouse },
      usualOrder: roundToPacks(seed.usualWeekly * scale, seed.packSize),
      suggested: roundToPacks(forecastSales * (1 + SAFETY_MARGIN) - stock, seed.packSize),
      forecastSales,
      dailyForecast,
      factors,
      confidence: { level: confidenceLevel(score), score },
      status: 'pending',
    }
  })
}
