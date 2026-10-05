export type Horizon = 3 | 7 | 14

export type Section =
  | 'Lácteos'
  | 'Bebidas'
  | 'Congelados'
  | 'Fruta y verdura'
  | 'Carne'
  | 'Pescado'
  | 'Panadería'
  | 'Despensa'
  | 'Huevos'

export type Category =
  | 'milk'
  | 'yogurt'
  | 'cheese'
  | 'water'
  | 'beer'
  | 'soda'
  | 'juice'
  | 'ice-cream'
  | 'fruit'
  | 'citrus'
  | 'vegetable'
  | 'meat'
  | 'chicken'
  | 'fish'
  | 'bread'
  | 'snack'
  | 'spread'
  | 'egg'

export type FactorKind = 'weather' | 'holiday' | 'event' | 'trend' | 'history' | 'short-history'

export interface Factor {
  kind: FactorKind
  /** Texto del chip, p. ej. «Clima 31 ºC». */
  label: string
  /** Efecto sobre la demanda, en tanto por uno (0.18 = +18 %). */
  effect: number
}

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type TaskStatus = 'pending' | 'accepted' | 'adjusted'

export const ADJUST_REASONS = ['Promoción local', 'Obras', 'Otro'] as const
export type AdjustReason = (typeof ADJUST_REASONS)[number]

/** Una propuesta de pedido para un producto (`GET /api/tasks`). */
export interface OrderTask {
  id: string
  product: {
    name: string
    section: Section
    category: Category
    /** Unidades por bulto. */
    packSize: number
    imageUrl?: string
    /** Días hasta caducidad del stock actual. Solo perecederos. Viene del backend. */
    daysToExpiry?: number
  }
  /** Unidades en tienda y almacén. */
  stock: { store: number; warehouse: number }
  /** Lo que se pediría sin la previsión. */
  usualOrder: number
  /** Cantidad que propone el modelo, ya redondeada a bultos. */
  suggested: number
  /** Venta prevista en el horizonte. */
  forecastSales: number
  factors: Factor[]
  confidence: { level: ConfidenceLevel; score: number }
  status: TaskStatus
  /** Cantidad final cuando el gestor la ajusta. */
  finalQuantity?: number
  adjustReason?: AdjustReason
}

export interface OrderTasksResponse {
  horizon: Horizon
  /** Hora de corte del bloque logístico (ISO). */
  cutoffAt: string
  logisticsBlock: string
  tasks: OrderTask[]
}

/** Cuerpo de `PATCH /api/tasks/{id}`. */
export type TaskPatch =
  | { status: 'accepted' }
  | { status: 'adjusted'; quantity: number; reason?: AdjustReason }
  | { status: 'pending' }
