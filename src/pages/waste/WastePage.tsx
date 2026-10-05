import { BellRing, CheckCircle2, TrendingDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getOrderTasks } from '@/api/tasks'
import { ProductThumb } from '@/components/ProductThumb'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Horizon, OrderTask, OrderTasksResponse } from '@/types'

/* ─── Risk helpers ───────────────────────────────────────────────── */

type UrgencyLevel = 'critical' | 'high' | 'medium'

function urgencyLevel(daysToExpiry: number): UrgencyLevel {
  if (daysToExpiry <= 2) return 'critical'
  if (daysToExpiry <= 4) return 'high'
  return 'medium'
}

const URGENCY_STYLES: Record<UrgencyLevel, { border: string; badge: string; label: string }> = {
  critical: {
    border: 'border-l-[3px] border-l-destructive',
    badge: 'bg-destructive text-white',
    label: 'Urgente',
  },
  high: {
    border: 'border-l-[3px] border-l-[#FFA102]',
    badge: 'bg-[#FFA102] text-foreground',
    label: 'Riesgo alto',
  },
  medium: {
    border: 'border-l-[3px] border-l-[#FFD966]',
    badge: 'bg-[#FFD966] text-foreground',
    label: 'Vigilar',
  },
}

interface WasteItem {
  task: OrderTask
  daysToExpiry: number
  stock: number
  sellable: number
  wasteUnits: number
  urgency: UrgencyLevel
}

function buildWasteItems(tasks: OrderTask[], horizon: Horizon): WasteItem[] {
  const items: WasteItem[] = []

  for (const task of tasks) {
    const { daysToExpiry } = task.product
    if (!daysToExpiry) continue

    const stock = task.stock.store + task.stock.warehouse
    const dailySellable = task.forecastSales / horizon
    const sellable = Math.round(dailySellable * daysToExpiry)
    const wasteUnits = Math.max(0, stock - sellable)

    if (wasteUnits > 0) {
      items.push({
        task,
        daysToExpiry,
        stock,
        sellable,
        wasteUnits,
        urgency: urgencyLevel(daysToExpiry),
      })
    }
  }

  // Sort: urgency first (fewest days), then most waste
  return items.sort((a, b) => {
    if (a.daysToExpiry !== b.daysToExpiry) return a.daysToExpiry - b.daysToExpiry
    return b.wasteUnits - a.wasteUnits
  })
}

/* ─── Waste card ─────────────────────────────────────────────────── */

function WasteCard({ item }: { item: WasteItem }) {
  const { task, daysToExpiry, stock, sellable, wasteUnits, urgency } = item
  const { product } = task
  const styles = URGENCY_STYLES[urgency]
  const dayLabel = daysToExpiry === 1 ? 'mañana' : `en ${daysToExpiry} días`
  const wastePercent = Math.round((wasteUnits / stock) * 100)

  return (
    <div className={cn('rounded-xl border bg-warning-soft p-5 shadow-xs', styles.border)}>
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <ProductThumb category={product.category} imageUrl={product.imageUrl} name={product.name} />
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold leading-snug">{product.name}</div>
          <div className="text-sm text-muted-foreground">{product.section}</div>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold', styles.badge)}>
          Caduca {dayLabel}
        </span>
      </div>

      {/* Figures */}
      <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg border bg-background p-3">
        <div className="text-center">
          <div className="text-xl font-bold tabular-nums">{formatNumber(stock)}</div>
          <div className="text-xs text-muted-foreground">Stock actual</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold tabular-nums">{formatNumber(sellable)}</div>
          <div className="text-xs text-muted-foreground">
            Venta prev. {daysToExpiry === 1 ? 'hoy' : `${daysToExpiry} d`}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold tabular-nums text-[#FFA102]">{formatNumber(wasteUnits)}</div>
          <div className="text-xs text-muted-foreground">En riesgo ({wastePercent} %)</div>
        </div>
      </div>

      {/* Contextual message */}
      <p className="mb-4 text-sm text-muted-foreground">
        Te faltarán compradores para{' '}
        <span className="font-semibold text-foreground">{formatNumber(wasteUnits)} ud</span>{' '}
        antes de que caduquen. Reducir el próximo pedido ayudará a equilibrar el stock.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="default"
          className="gap-2 border-[#FFA102] text-foreground hover:bg-[#FFF1D6]"
          onClick={() =>
            toast.success(`Pedido ajustado · ${product.name}`, {
              description: `Se reducirá el próximo pedido en ~${formatNumber(wasteUnits)} ud`,
            })
          }
        >
          <TrendingDown className="size-4" aria-hidden />
          Reducir próximo pedido
        </Button>
        <Button
          variant="ghost"
          size="default"
          className="gap-2"
          onClick={() =>
            toast(`Aviso enviado · ${product.name}`, {
              description: `${formatNumber(wasteUnits)} ud en riesgo de merma`,
              icon: <BellRing className="size-4" />,
            })
          }
        >
          <BellRing className="size-4" aria-hidden />
          Avisar a tienda
        </Button>
      </div>
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────────── */

function WasteSkeleton() {
  return (
    <div className="space-y-6 px-8 pb-12 pt-8" aria-busy="true" aria-label="Cargando merma">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────── */

interface WastePageProps {
  horizon: Horizon
  onWasteCount?: (n: number) => void
}

export function WastePage({ horizon, onWasteCount }: WastePageProps) {
  const [data, setData] = useState<OrderTasksResponse | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setData(null)
    setLoadError(false)
    getOrderTasks(horizon)
      .then((r) => { if (!cancelled) setData(r) })
      .catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [horizon])

  const items = useMemo(
    () => (data ? buildWasteItems(data.tasks, horizon) : []),
    [data, horizon],
  )

  useEffect(() => { onWasteCount?.(items.length) }, [items.length, onWasteCount])

  if (loadError) {
    return (
      <div className="px-8 pt-8">
        <h1 className="mb-6 text-[28px] font-bold leading-tight">Merma y caducidad</h1>
        <div className="rounded-xl border p-8 text-center text-base text-muted-foreground">
          No hemos podido cargar las alertas. Inténtalo de nuevo.
        </div>
      </div>
    )
  }

  if (!data) return <WasteSkeleton />

  return (
    <div className="space-y-6 px-8 pb-12 pt-8">
      <div>
        <h1 className="text-[28px] font-bold leading-tight">Merma y caducidad</h1>
        {items.length > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'producto' : 'productos'} con riesgo de merma
            en los próximos {horizon} días
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border p-12 text-center">
          <CheckCircle2 className="size-12 text-primary" aria-hidden />
          <p className="text-xl font-semibold">Sin riesgo de merma</p>
          <p className="text-base text-muted-foreground">
            El stock de todos los productos perecederos está alineado con la venta prevista.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <WasteCard key={item.task.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
