import type { OrderTask } from '@/types'

/** Cantidad que se pedirá: la ajustada por el gestor o la sugerida. */
export const finalQuantity = (task: OrderTask) =>
  task.status === 'adjusted' && task.finalQuantity !== undefined ? task.finalQuantity : task.suggested

/** Desviación relativa respecto al pedido habitual, para ordenar. */
export const deviation = (task: OrderTask) =>
  Math.abs(task.suggested - task.usualOrder) / Math.max(task.usualOrder, 1)
