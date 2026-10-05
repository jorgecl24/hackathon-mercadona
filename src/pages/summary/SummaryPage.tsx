import {
  AlertTriangle,
  Apple,
  ArrowDown,
  ArrowUp,
  Beer,
  CheckCircle2,
  ClipboardList,
  Croissant,
  Drumstick,
  Egg,
  Fish,
  IceCreamCone,
  Milk,
  ShoppingBasket,
  Snowflake,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { getOrderTasks } from '@/api/tasks'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { ProductThumb } from '@/components/ProductThumb'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber } from '@/lib/format'
import { deviation } from '@/lib/tasks'
import { cn } from '@/lib/utils'
import type { OrderTask, OrderTasksResponse, Section } from '@/types'

/* ─── Risk helpers ──────────────────────────────────────────────── */

/** Stock insuficiente para cubrir la venta prevista → riesgo de rotura. */
const isRotura = (t: OrderTask) =>
  t.stock.store + t.stock.warehouse < t.forecastSales

/** Stock supera en más de un 40 % la venta prevista → riesgo de merma. */
const isMerma = (t: OrderTask) =>
  t.stock.store + t.stock.warehouse > t.forecastSales * 1.4

type RiskLevel = 'ok' | 'medium' | 'high' | 'critical'

function sectionRiskLevel(tasks: OrderTask[]): RiskLevel {
  const ratio = tasks.filter((t) => isRotura(t) || isMerma(t)).length / tasks.length
  if (ratio === 0) return 'ok'
  if (ratio <= 0.3) return 'medium'
  if (ratio <= 0.6) return 'high'
  return 'critical'
}

const RISK_BG: Record<RiskLevel, string> = {
  ok: 'bg-[#CFE5C3]',
  medium: 'bg-[#FFD966]',
  high: 'bg-[#FFA102]',
  critical: 'bg-[#D32F2F] text-white',
}

const RISK_LABEL: Record<RiskLevel, string> = {
  ok: 'OK',
  medium: 'Atención',
  high: 'Riesgo',
  critical: 'Crítico',
}

/* ─── Section icons ─────────────────────────────────────────────── */

const SECTION_ICON: Record<Section, LucideIcon> = {
  Lácteos: Milk,
  Bebidas: Beer,
  Congelados: Snowflake,
  'Fruta y verdura': Apple,
  Carne: Drumstick,
  Pescado: Fish,
  Panadería: Croissant,
  Despensa: ShoppingBasket,
  Huevos: Egg,
}

/* ─── Sub-components ────────────────────────────────────────────── */

interface KpiCardProps {
  label: string
  value: number
  suffix: string
  /** Contextual note below the label */
  note: string
  variant: 'ok' | 'destructive' | 'warning' | 'neutral'
  icon: ReactNode
}

function KpiCard({ label, value, suffix, note, variant, icon }: KpiCardProps) {
  const border = {
    ok: 'border-l-[3px] border-l-primary',
    destructive: 'border-l-[3px] border-l-destructive bg-[#FDE7E7]',
    warning: 'border-l-[3px] border-l-[#FFA102] bg-[#FFF1D6]',
    neutral: 'border-l-[3px] border-l-border',
  }[variant]

  const iconColor = {
    ok: 'text-primary',
    destructive: 'text-destructive',
    warning: 'text-[#FFA102]',
    neutral: 'text-muted-foreground',
  }[variant]

  return (
    <div className={cn('rounded-xl border p-5 shadow-xs', border)}>
      <div className={cn('mb-3', iconColor)}>{icon}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[32px] font-bold tabular-nums leading-none">{formatNumber(value)}</span>
        <span className="text-sm text-muted-foreground">{suffix}</span>
      </div>
      <div className="mt-1.5 text-base font-semibold">{label}</div>
      <div className="mt-0.5 text-sm text-muted-foreground">{note}</div>
    </div>
  )
}

function SummarySkeleton() {
  return (
    <div className="space-y-8 px-8 pb-12 pt-8" aria-busy="true" aria-label="Cargando resumen">
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────────── */

export function SummaryPage() {
  const [data, setData] = useState<OrderTasksResponse | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setData(null)
    setLoadError(false)
    getOrderTasks()
      .then((r) => { if (!cancelled) setData(r) })
      .catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [])

  const derived = useMemo(() => {
    if (!data) return null
    const tasks = data.tasks

    const roturaCount = tasks.filter(isRotura).length
    const mermaCount = tasks.filter(isMerma).length
    const pendingCount = tasks.filter((t) => t.status === 'pending').length
    const avgScore = Math.round(
      tasks.reduce((s, t) => s + t.confidence.score, 0) / tasks.length,
    )

    const bySection = new Map<Section, OrderTask[]>()
    for (const t of tasks) {
      const section = t.product.section
      const list = bySection.get(section) ?? []
      list.push(t)
      bySection.set(section, list)
    }

    const top5 = [...tasks]
      .sort((a, b) => deviation(b) - deviation(a))
      .slice(0, 5)

    return { roturaCount, mermaCount, pendingCount, avgScore, bySection, top5 }
  }, [data])

  if (loadError) {
    return (
      <div className="px-8 pt-8">
        <h1 className="mb-6 text-[28px] font-bold leading-tight">Resumen</h1>
        <div className="rounded-xl border p-8 text-center text-base text-muted-foreground">
          No hemos podido cargar el resumen. Inténtalo de nuevo.
        </div>
      </div>
    )
  }

  if (!derived) return <SummarySkeleton />

  const { roturaCount, mermaCount, pendingCount, avgScore, bySection, top5 } = derived

  return (
    <div className="space-y-8 px-8 pb-12 pt-8">
      <h1 className="text-[28px] font-bold leading-tight">Resumen</h1>

      {/* KPIs — datos calculados a partir de la respuesta del backend */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4" data-tour="summary-kpis">
        <KpiCard
          label="Riesgo de rotura"
          value={roturaCount}
          suffix="productos"
          note="Stock insuficiente para la previsión"
          variant={roturaCount > 0 ? 'destructive' : 'ok'}
          icon={<AlertTriangle className="size-5" />}
        />
        <KpiCard
          label="Riesgo de merma"
          value={mermaCount}
          suffix="productos"
          note="Exceso respecto a la venta prevista"
          variant={mermaCount > 0 ? 'warning' : 'ok'}
          icon={<IceCreamCone className="size-5" />}
        />
        <KpiCard
          label="Pedidos por revisar"
          value={pendingCount}
          suffix="propuestas"
          note="Pendientes de aceptar o ajustar"
          variant="neutral"
          icon={<ClipboardList className="size-5" />}
        />
        <KpiCard
          label="Precisión de la previsión"
          value={avgScore}
          suffix="%"
          note="Confianza media · últimos 7 días"
          variant={avgScore >= 80 ? 'ok' : avgScore >= 60 ? 'warning' : 'destructive'}
          icon={<TrendingUp className="size-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Heatmap por sección */}
        <div className="rounded-xl border p-6 shadow-xs" data-tour="summary-heatmap">
          <h2 className="mb-4 text-xl font-semibold">Estado por sección</h2>
          <div className="grid grid-cols-3 gap-3">
            {Array.from(bySection.entries()).map(([section, tasks]) => {
              const level = sectionRiskLevel(tasks)
              const Icon = SECTION_ICON[section]
              const roturas = tasks.filter(isRotura).length
              const mermas = tasks.filter(isMerma).length
              const riskCount = roturas + mermas
              const dominant = roturas >= mermas ? 'rotura' : 'merma'
              return (
                <div
                  key={section}
                  className={cn('flex flex-col gap-1.5 rounded-xl p-3', RISK_BG[level])}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-4 shrink-0" />
                    <span className="text-sm font-medium leading-tight">{section}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {level === 'ok' ? (
                      <>
                        <CheckCircle2 className="size-4" />
                        <span className="text-sm font-semibold">OK</span>
                      </>
                    ) : (
                      <>
                        {dominant === 'rotura' ? (
                          <ArrowDown className="size-4" />
                        ) : (
                          <ArrowUp className="size-4" />
                        )}
                        <span className="text-sm font-semibold tabular-nums">
                          {riskCount} {riskCount === 1 ? 'producto' : 'productos'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {(['ok', 'medium', 'high', 'critical'] as RiskLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <span className={cn('size-3 rounded-sm', RISK_BG[level])} />
                <span className="text-sm text-muted-foreground">{RISK_LABEL[level]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lista "Requiere tu atención" */}
        <div className="rounded-xl border p-6 shadow-xs">
          <h2 className="mb-4 text-xl font-semibold">Requiere tu atención</h2>
          <ul className="space-y-3">
            {top5.map((task) => {
              const diff = task.suggested - task.usualOrder
              const DiffIcon = diff > 0 ? ArrowUp : ArrowDown
              const diffColor = diff > 0 ? 'text-destructive' : 'text-[#FFA102]'
              const diffLabel = diff > 0 ? 'Falta' : 'Sobra'
              return (
                <li key={task.id} className="flex items-center gap-3">
                  <ProductThumb
                    category={task.product.category}
                    imageUrl={task.product.imageUrl}
                    name={task.product.name}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-medium">{task.product.name}</div>
                    <div className="text-sm text-muted-foreground">{task.product.section}</div>
                  </div>
                  <div className={cn('flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums', diffColor)}>
                    <DiffIcon className="size-4" />
                    {diffLabel} {formatNumber(Math.abs(diff))}
                  </div>
                  <ConfidenceBadge confidence={task.confidence} />
                </li>
              )
            })}
          </ul>
          {top5.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 className="size-10 text-primary" />
              <p className="text-base font-semibold">Todo en orden</p>
              <p className="text-sm text-muted-foreground">No hay desviaciones que revisar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
