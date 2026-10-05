import { buildOrderTasks } from '@/mocks/tasks'
import type { OrderTask, OrderTasksResponse, TaskPatch } from '@/types'

/*
 * Capa de datos simulada con la forma de los endpoints del backend FastAPI.
 * Para conectar el backend real basta con cambiar estas funciones por `fetch`.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Próxima hora de corte a las 13:00 (hoy o mañana). */
function nextCutoff(now = new Date()): Date {
  const cutoff = new Date(now)
  cutoff.setHours(13, 0, 0, 0)
  if (cutoff <= now) cutoff.setDate(cutoff.getDate() + 1)
  return cutoff
}

const db = new Map<string, OrderTask>()

/** `GET /api/tasks` */
export async function getOrderTasks(): Promise<OrderTasksResponse> {
  await delay(600)
  db.clear()
  const tasks = buildOrderTasks(8)
  tasks.forEach((task) => db.set(task.id, task))
  return {
    horizon: 8,
    cutoffAt: nextCutoff().toISOString(),
    logisticsBlock: 'Frescos y secos',
    tasks,
  }
}

/** `PATCH /api/tasks/{id}` */
export async function patchTask(id: string, patch: TaskPatch): Promise<OrderTask> {
  await delay(350)
  const task = db.get(id)
  if (!task) throw new Error(`Task ${id} not found`)

  const updated: OrderTask =
    patch.status === 'adjusted'
      ? { ...task, status: 'adjusted', finalQuantity: patch.quantity, adjustReason: patch.reason }
      : { ...task, status: patch.status, finalQuantity: undefined, adjustReason: undefined }

  db.set(id, updated)
  return updated
}
