import { CheckCheck, CircleCheck, Clock, Download, Package, RotateCw, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { getOrderTasks, patchTask } from '@/api/tasks'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber, formatTime, formatTimeLeft } from '@/lib/format'
import { finalQuantity, deviation } from '@/lib/tasks'
import { cn } from '@/lib/utils'
import type { ConfidenceLevel, OrderTask, OrderTasksResponse, Section, TaskPatch } from '@/types'
import { ProposalRow, STICKY_CELL, type AdjustDraft } from './ProposalRow'

const SAVE_ERROR = 'No hemos podido guardar. Inténtalo de nuevo'

/* ─── CSV export ─────────────────────────────────────────────────── */

function exportCSV(tasks: OrderTask[]) {
  const BOM = '﻿'
  const CONF: Record<ConfidenceLevel, string> = { high: 'Alta', medium: 'Media', low: 'Baja' }
  const STATUS: Record<string, string> = { pending: 'Pendiente', accepted: 'Aceptado', adjusted: 'Ajustado' }
  const headers = ['Producto', 'Sección', 'Stock tienda', 'Stock almacén', 'Pedido habitual', 'Sugerido', 'Cantidad final', 'Confianza', 'Estado', 'Motivo ajuste']
  const rows = tasks.map((t) => [
    t.product.name,
    t.product.section,
    t.stock.store,
    t.stock.warehouse,
    t.usualOrder,
    t.suggested,
    finalQuantity(t),
    CONF[t.confidence.level],
    STATUS[t.status],
    t.adjustReason ?? '',
  ])
  const csv = BOM + [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(';')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pedido-8d-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ─── Hooks ──────────────────────────────────────────────────────── */

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

/* ─── Filter bar ─────────────────────────────────────────────────── */

interface FilterState {
  section: string
  confidence: string
  status: string
}

const EMPTY_FILTERS: FilterState = { section: 'all', confidence: 'all', status: 'all' }

function isFiltered(f: FilterState) {
  return f.section !== 'all' || f.confidence !== 'all' || f.status !== 'all'
}

interface FilterBarProps {
  filters: FilterState
  sections: Section[]
  total: number
  filtered: number
  onChange: (f: FilterState) => void
  onClear: () => void
}

function FilterBar({ filters, sections, total, filtered, onChange, onClear }: FilterBarProps) {
  const pill = (active: boolean) =>
    cn(
      'h-8 rounded-full px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
      active ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-border/60',
    )

  return (
    <div
      data-tour="filters"
      className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted px-4 py-2.5"
    >
      {/* Section */}
      <Select value={filters.section} onValueChange={(v) => onChange({ ...filters, section: v })}>
        <SelectTrigger className="h-8 w-44 text-sm">
          <SelectValue placeholder="Todas las secciones" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las secciones</SelectItem>
          {sections.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Confidence */}
      <div role="group" aria-label="Filtrar por confianza" className="flex gap-1">
        {(['all', 'high', 'medium', 'low'] as const).map((level) => (
          <button
            key={level}
            type="button"
            aria-pressed={filters.confidence === level}
            onClick={() => onChange({ ...filters, confidence: level })}
            className={pill(filters.confidence === level)}
          >
            {level === 'all' ? 'Toda confianza' : level === 'high' ? 'Alta' : level === 'medium' ? 'Media' : 'Baja'}
          </button>
        ))}
      </div>

      {/* Status */}
      <div role="group" aria-label="Filtrar por estado" className="flex gap-1">
        {(['all', 'pending', 'reviewed'] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={filters.status === s}
            onClick={() => onChange({ ...filters, status: s })}
            className={pill(filters.status === s)}
          >
            {s === 'all' ? 'Todos' : s === 'pending' ? 'Pendiente' : 'Revisado'}
          </button>
        ))}
      </div>

      {/* Count + clear */}
      <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
        {isFiltered(filters) && (
          <>
            <span className="tabular-nums">{filtered} de {total}</span>
            <button
              type="button"
              onClick={onClear}
              aria-label="Limpiar filtros"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <X className="size-3" aria-hidden />
              Limpiar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────── */

interface OrderProposalPageProps {
  onPendingCount?: (n: number) => void
}

export function OrderProposalPage({ onPendingCount }: OrderProposalPageProps) {
  const [data, setData] = useState<OrderTasksResponse | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<{ id: string; draft: AdjustDraft } | null>(null)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [confirmingBulk, setConfirmingBulk] = useState(false)
  const now = useNow()

  useEffect(() => {
    let cancelled = false
    getOrderTasks()
      .then((response) => { if (!cancelled) setData(response) })
      .catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [reloadKey])

  const tasks = useMemo(
    () => [...(data?.tasks ?? [])].sort((a, b) => deviation(b) - deviation(a)),
    [data],
  )

  // Report pending count to App for sidebar badge
  const pendingCount = tasks.filter((t) => t.status === 'pending').length
  useEffect(() => { onPendingCount?.(pendingCount) }, [pendingCount, onPendingCount])

  // Auto-cancel bulk confirmation after 5 s
  useEffect(() => {
    if (!confirmingBulk) return
    const id = setTimeout(() => setConfirmingBulk(false), 5000)
    return () => clearTimeout(id)
  }, [confirmingBulk])

  const sections = useMemo(
    () => [...new Set(tasks.map((t) => t.product.section))].sort() as Section[],
    [tasks],
  )

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (filters.section === 'all' || t.product.section === filters.section) &&
          (filters.confidence === 'all' || t.confidence.level === filters.confidence) &&
          (filters.status === 'all' ||
            (filters.status === 'pending' ? t.status === 'pending' : t.status !== 'pending')),
      ),
    [tasks, filters],
  )

  const pendingHigh = tasks.filter((t) => t.status === 'pending' && t.confidence.level === 'high')
  const confirmedCount = tasks.filter((t) => t.status !== 'pending').length

  const totals = useMemo(() => {
    let units = 0; let packs = 0; let confirmedUnits = 0; let confirmedPacks = 0
    for (const task of tasks) {
      const qty = finalQuantity(task)
      const taskPacks = Math.ceil(qty / task.product.packSize)
      units += qty; packs += taskPacks
      if (task.status !== 'pending') { confirmedUnits += qty; confirmedPacks += taskPacks }
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
    setConfirmingBulk(false)
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
    if (saved.length > 0)
      toast.success(saved.length === 1 ? 'Aceptada 1 propuesta de confianza alta' : `Aceptadas ${saved.length} propuestas de confianza alta`)
    if (saved.length < batch.length) toast.error(SAVE_ERROR)
  }

  async function saveAdjust(task: OrderTask) {
    if (!editing) return
    const quantity = Number(editing.draft.quantity)
    const ok = await save(task, { status: 'adjusted', quantity, reason: editing.draft.reason }, `Pedido guardado: ${formatNumber(quantity)} de ${task.product.name}`)
    if (ok) setEditing(null)
  }

  if (loadError) {
    return (
      <PageFrame>
        <div className="rounded-xl border p-8 text-center">
          <p className="text-base">No hemos podido cargar la propuesta. Inténtalo de nuevo.</p>
          <Button className="mt-4" onClick={() => { setLoadError(false); setReloadKey((k) => k + 1) }}>
            <RotateCw aria-hidden />
            Reintentar
          </Button>
        </div>
      </PageFrame>
    )
  }

  if (!data) return <OrderProposalSkeleton />

  const cutoff = new Date(data.cutoffAt)

  const bulkAction = confirmingBulk ? (
    <div className="flex items-center gap-2">
      <Button size="lg" onClick={acceptAllHigh}>
        <CheckCheck aria-hidden className="size-5" />
        Confirmar {pendingHigh.length} {pendingHigh.length === 1 ? 'propuesta' : 'propuestas'}
      </Button>
      <Button size="lg" variant="ghost" onClick={() => setConfirmingBulk(false)}>
        Cancelar
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button
        data-tour="export"
        variant="outline"
        size="lg"
        onClick={() => { exportCSV(tasks); toast.success('Pedido exportado') }}
        aria-label="Exportar pedido en CSV"
      >
        <Download aria-hidden className="size-4" />
        <span className="max-xl:sr-only">Exportar CSV</span>
      </Button>
      <Button
        data-tour="bulk-accept"
        size="lg"
        onClick={() => setConfirmingBulk(true)}
        disabled={pendingHigh.length === 0}
      >
        <CheckCheck aria-hidden className="size-5" />
        Aceptar propuestas de confianza alta
        {pendingHigh.length > 0 && (
          <span className="rounded-full bg-primary-foreground/20 px-2 text-base tabular-nums">
            {pendingHigh.length}
          </span>
        )}
      </Button>
    </div>
  )

  return (
    <PageFrame
      subtitle={tasks.length > 0 ? `${tasks.length} productos · previsión 8 días · ${pendingCount} por revisar` : undefined}
      action={bulkAction}
      confirmed={confirmedCount}
      total={tasks.length}
    >
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border p-12 text-center">
          <CircleCheck aria-hidden className="size-12 text-brand" />
          <p className="text-xl font-semibold">Todo en orden</p>
          <p className="text-base text-muted-foreground">No hay desviaciones que revisar.</p>
        </div>
      ) : (
        <>
          <FilterBar
            filters={filters}
            sections={sections}
            total={tasks.length}
            filtered={filteredTasks.length}
            onChange={setFilters}
            onClear={() => setFilters(EMPTY_FILTERS)}
          />

          <div className="rounded-xl border shadow-xs" data-tour="order-table">
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
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <ProposalRow
                      key={task.id}
                      task={task}
                      saving={savingIds.has(task.id)}
                      draft={editing?.id === task.id ? editing.draft : null}
                      onAccept={() => save(task, { status: 'accepted' }, `Pedido guardado: ${formatNumber(task.suggested)} de ${task.product.name}`)}
                      onStartAdjust={() => setEditing({ id: task.id, draft: { quantity: String(task.suggested) } })}
                      onDraftChange={(draft) => setEditing({ id: task.id, draft })}
                      onSaveAdjust={() => saveAdjust(task)}
                      onCancelAdjust={() => setEditing(null)}
                      onUndo={() => save(task, { status: 'pending' }, `Cambio deshecho: ${task.product.name}`)}
                    />
                  ))
                ) : (
                  <TableRow>
                    <td colSpan={8} className="py-12 text-center text-base text-muted-foreground">
                      Ningún producto coincide con los filtros activos.
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
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
          <span className="font-semibold text-foreground tabular-nums">{formatNumber(totals.confirmedUnits)}</span>{' '}
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

/* ─── PageFrame ──────────────────────────────────────────────────── */

function PageFrame({
  subtitle,
  action,
  confirmed,
  total,
  children,
}: {
  subtitle?: string
  action?: ReactNode
  confirmed?: number
  total?: number
  children: ReactNode
}) {
  const showProgress = total != null && total > 0
  const pct = showProgress ? Math.round(((confirmed ?? 0) / total!) * 100) : 0

  return (
    <div className="px-8 pt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-tight font-bold">Propuesta de pedido</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="mb-6 space-y-1.5" data-tour="progress">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{confirmed} de {total} propuestas confirmadas</span>
            <span className="tabular-nums font-medium text-foreground">{pct} %</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${confirmed} de ${total} propuestas confirmadas`}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">{children}</div>
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────────── */

function OrderProposalSkeleton() {
  return (
    <div className="px-8 pt-8" aria-busy="true" aria-label="Cargando propuesta de pedido">
      <div className="mb-4 flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-12 w-80 rounded-full" />
      </div>
      <Skeleton className="mb-6 h-2 rounded-full" />
      <Skeleton className="mb-4 h-12 rounded-xl" />
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
