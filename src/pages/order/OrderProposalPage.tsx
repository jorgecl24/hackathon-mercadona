import { CheckCheck, CircleCheck, Clock, Package, RotateCw } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { getOrderTasks, patchTask } from '@/api/tasks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber, formatTime, formatTimeLeft } from '@/lib/format'
import { deviation, finalQuantity } from '@/lib/tasks'
import type { Horizon, OrderTask, OrderTasksResponse, TaskPatch } from '@/types'
import { cn } from '@/lib/utils'
import { ProposalRow, STICKY_CELL, type AdjustDraft } from './ProposalRow'

const SAVE_ERROR = 'No hemos podido guardar. Inténtalo de nuevo'

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

/** Se monta con `key={horizon}`, así que cambiar de horizonte reinicia el estado. */
export function OrderProposalPage({ horizon }: { horizon: Horizon }) {
  const [data, setData] = useState<OrderTasksResponse | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<{ id: string; draft: AdjustDraft } | null>(null)
  const now = useNow()

  useEffect(() => {
    let cancelled = false
    getOrderTasks(horizon)
      .then((response) => {
        if (!cancelled) setData(response)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [horizon, reloadKey])

  const tasks = useMemo(
    () => [...(data?.tasks ?? [])].sort((a, b) => deviation(b) - deviation(a)),
    [data],
  )

  const pendingHigh = tasks.filter((t) => t.status === 'pending' && t.confidence.level === 'high')
  const pendingCount = tasks.filter((t) => t.status === 'pending').length

  const totals = useMemo(() => {
    let units = 0
    let packs = 0
    let confirmedUnits = 0
    let confirmedPacks = 0
    for (const task of tasks) {
      const qty = finalQuantity(task)
      const taskPacks = Math.ceil(qty / task.product.packSize)
      units += qty
      packs += taskPacks
      if (task.status !== 'pending') {
        confirmedUnits += qty
        confirmedPacks += taskPacks
      }
    }
    return { units, packs, confirmedUnits, confirmedPacks }
  }, [tasks])

  const setSaving = (ids: string[], saving: boolean) =>
    setSavingIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (saving ? next.add(id) : next.delete(id)))
      return next
    })

  const replaceTask = (updated: OrderTask) =>
    setData((prev) =>
      prev && { ...prev, tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)) },
    )

  async function save(task: OrderTask, patch: TaskPatch, successMessage: string) {
    setSaving([task.id], true)
    try {
      replaceTask(await patchTask(task.id, patch))
      toast.success(successMessage)
      return true
    } catch {
      toast.error(SAVE_ERROR)
      return false
    } finally {
      setSaving([task.id], false)
    }
  }

  async function acceptAllHigh() {
    const batch = pendingHigh
    const ids = batch.map((t) => t.id)
    setSaving(ids, true)
    const results = await Promise.allSettled(batch.map((t) => patchTask(t.id, { status: 'accepted' })))
    setSaving(ids, false)

    const saved = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
    setData((prev) => {
      if (!prev) return prev
      const byId = new Map(saved.map((t) => [t.id, t]))
      return { ...prev, tasks: prev.tasks.map((t) => byId.get(t.id) ?? t) }
    })

    if (saved.length > 0) {
      toast.success(
        saved.length === 1
          ? 'Aceptada 1 propuesta de confianza alta'
          : `Aceptadas ${saved.length} propuestas de confianza alta`,
      )
    }
    if (saved.length < batch.length) toast.error(SAVE_ERROR)
  }

  async function saveAdjust(task: OrderTask) {
    if (!editing) return
    const quantity = Number(editing.draft.quantity)
    const ok = await save(
      task,
      { status: 'adjusted', quantity, reason: editing.draft.reason },
      `Pedido guardado: ${formatNumber(quantity)} de ${task.product.name}`,
    )
    if (ok) setEditing(null)
  }

  if (loadError) {
    return (
      <PageFrame>
        <div className="rounded-xl border p-8 text-center">
          <p className="text-base">No hemos podido cargar la propuesta. Inténtalo de nuevo.</p>
          <Button
            className="mt-4"
            onClick={() => {
              setLoadError(false)
              setReloadKey((k) => k + 1)
            }}
          >
            <RotateCw aria-hidden />
            Reintentar
          </Button>
        </div>
      </PageFrame>
    )
  }

  if (!data) return <OrderProposalSkeleton />

  const cutoff = new Date(data.cutoffAt)

  return (
    <PageFrame
      subtitle={
        tasks.length > 0
          ? `${tasks.length} productos para los próximos ${horizon} días · ${pendingCount} por revisar`
          : undefined
      }
      action={
        <Button size="lg" onClick={acceptAllHigh} disabled={pendingHigh.length === 0}>
          <CheckCheck aria-hidden className="size-5" />
          Aceptar propuestas de confianza alta
          {pendingHigh.length > 0 && (
            <span className="rounded-full bg-primary-foreground/20 px-2 text-base tabular-nums">
              {pendingHigh.length}
            </span>
          )}
        </Button>
      }
    >
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border p-12 text-center">
          <CircleCheck aria-hidden className="size-12 text-brand" />
          <p className="text-xl font-semibold">Todo en orden</p>
          <p className="text-base text-muted-foreground">No hay desviaciones que revisar.</p>
        </div>
      ) : (
        <div className="rounded-xl border shadow-xs">
          <Table>
            <caption className="sr-only">
              Propuesta de pedido ordenada de mayor a menor desviación respecto al pedido habitual
            </caption>
            <TableHeader className="bg-muted [&_th]:whitespace-normal">
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="h-12 pl-4 text-sm">Producto</TableHead>
                <TableHead className="text-right text-sm">Stock actual</TableHead>
                <TableHead className="text-right text-sm">Pedido habitual</TableHead>
                <TableHead className="text-right text-sm">Sugerido</TableHead>
                <TableHead className="text-right text-sm">Diferencia</TableHead>
                <TableHead className="text-sm">Motivo</TableHead>
                <TableHead className="text-sm">Confianza</TableHead>
                <TableHead className={cn('bg-muted pr-4 text-right text-sm', STICKY_CELL)}>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4">
              {tasks.map((task) => (
                <ProposalRow
                  key={task.id}
                  task={task}
                  saving={savingIds.has(task.id)}
                  draft={editing?.id === task.id ? editing.draft : null}
                  onAccept={() =>
                    save(
                      task,
                      { status: 'accepted' },
                      `Pedido guardado: ${formatNumber(task.suggested)} de ${task.product.name}`,
                    )
                  }
                  onStartAdjust={() =>
                    setEditing({ id: task.id, draft: { quantity: String(task.suggested) } })
                  }
                  onDraftChange={(draft) => setEditing({ id: task.id, draft })}
                  onSaveAdjust={() => saveAdjust(task)}
                  onCancelAdjust={() => setEditing(null)}
                  onUndo={() => save(task, { status: 'pending' }, `Cambio deshecho: ${task.product.name}`)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <footer className="sticky bottom-0 z-10 -mx-8 mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 border-t bg-background px-8 py-4">
        <div className="flex items-center gap-2">
          <Package aria-hidden className="size-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Total del pedido</span>
          <span className="text-2xl font-bold tabular-nums">{formatNumber(totals.units)}</span>
          <span className="text-sm text-muted-foreground">
            unidades · <span className="tabular-nums">{formatNumber(totals.packs)}</span> bultos
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Confirmado{' '}
          <span className="font-semibold text-foreground tabular-nums">
            {formatNumber(totals.confirmedUnits)}
          </span>{' '}
          unidades · <span className="tabular-nums">{formatNumber(totals.confirmedPacks)}</span> bultos
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Clock aria-hidden className="size-5" />
          Corte del bloque {data.logisticsBlock.toLowerCase()}
          <span className="font-semibold text-foreground tabular-nums">{formatTime(cutoff)}</span>
          <span>· quedan {formatTimeLeft(cutoff.getTime() - now)}</span>
        </div>
      </footer>
    </PageFrame>
  )
}

function PageFrame({
  subtitle,
  action,
  children,
}: {
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="px-8 pt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-tight font-bold">Propuesta de pedido</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function OrderProposalSkeleton() {
  return (
    <div className="px-8 pt-8" aria-busy="true" aria-label="Cargando propuesta de pedido">
      <div className="mb-6 flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-12 w-80 rounded-full" />
      </div>
      <div className="rounded-xl border">
        <Skeleton className="h-12 rounded-none rounded-t-xl" />
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex h-14 items-center gap-4 border-t px-4">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-11 w-48 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
