import {
  CalendarDays,
  History,
  PartyPopper,
  Sun,
  Thermometer,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getOrderTasks } from '@/api/tasks'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { formatEffect, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Factor, FactorKind, OrderTask, OrderTasksResponse } from '@/types'

/* ─── Factor metadata ────────────────────────────────────────────── */

const FACTOR_ICONS: Record<FactorKind, LucideIcon> = {
  weather: Sun,
  holiday: CalendarDays,
  event: PartyPopper,
  trend: TrendingUp,
  history: History,
  'short-history': History,
}

const FACTOR_NAMES: Record<FactorKind, string> = {
  weather: 'Clima',
  holiday: 'Calendario',
  event: 'Evento local',
  trend: 'Tendencia',
  history: 'Histórico',
  'short-history': 'Histórico corto',
}

/* ─── Chart data generation ──────────────────────────────────────── */

const SHORT_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DOW_FACTORS = [0.88, 0.82, 0.90, 0.95, 1.02, 1.20, 1.18]

function fmtLabel(date: Date) {
  return `${SHORT_DAYS[date.getDay()]} ${date.getDate()}`
}

/** Deterministic pseudo-random 0–1 from a string seed. */
function prand(seed: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 0x01000193)
  }
  return (h >>> 0) / 0xffffffff
}

interface ChartPoint {
  label: string
  historical: number | null
  forecast: number | null
  /** Transparent base for the stacked confidence band. */
  bandBottom: number | null
  /** Colored height of the confidence band. */
  bandTop: number | null
}

interface EventLine {
  label: string
  x: string
}

const HORIZON = 8 as const

function buildChartData(
  task: OrderTask,
  activeKinds: Set<FactorKind>,
  effectiveFactors: Factor[],
  now: Date,
): { points: ChartPoint[]; todayLabel: string; eventLines: EventLine[] } {
  // When real backend data is available, use it as baseline and scale by the
  // active-factors multiplier so the toggles in the "Señales" panel still work.
  const totalLift = task.factors.reduce((s, f) => s + f.effect, 0)
  const activeLift = effectiveFactors
    .filter((f) => activeKinds.has(f.kind))
    .reduce((s, f) => s + f.effect, 0)
  // How much to scale the backend values when the user toggles signals.
  const liftMultiplier = (1 + totalLift) !== 0 ? (1 + activeLift) / (1 + totalLift) : 1

  // Base daily units (used for history and as fallback for forecast).
  const avgDailyReal = task.dailyForecast
    ? task.dailyForecast.reduce((a, b) => a + b, 0) / task.dailyForecast.length
    : null
  const baseDailyUnits = avgDailyReal ?? (task.usualOrder / HORIZON)
  const margin = ((100 - task.confidence.score) / 100) * 0.5

  const points: ChartPoint[] = []

  // 14 days of synthetic historical data
  for (let i = 14; i >= 1; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const noise = 0.82 + prand(task.id + String(i)) * 0.36
    const value = Math.round(baseDailyUnits * DOW_FACTORS[d.getDay()] * noise)
    points.push({ label: fmtLabel(d), historical: value, forecast: null, bandBottom: null, bandTop: null })
  }

  const todayLabel = fmtLabel(now)

  // Forecast: use real backend daily values when available (scaled by active lift)
  // otherwise fall back to synthetic calculation.
  for (let i = 0; i <= HORIZON; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    let fc: number
    if (task.dailyForecast && i < task.dailyForecast.length) {
      fc = Math.max(0, Math.round(task.dailyForecast[i] * liftMultiplier))
    } else {
      fc = Math.round(baseDailyUnits * (1 + activeLift) * DOW_FACTORS[d.getDay()])
    }
    const hi = Math.round(fc * (1 + margin))
    const lo = Math.max(0, Math.round(fc * (1 - margin)))
    points.push({ label: fmtLabel(d), historical: null, forecast: fc, bandBottom: lo, bandTop: hi - lo })
  }

  // Orange reference lines for calendar/event factors
  const eventLines: EventLine[] = []
  if (effectiveFactors.some((f) => f.kind === 'holiday')) {
    const d = new Date(now)
    d.setDate(d.getDate() + 4)
    eventLines.push({ label: 'Festivo', x: fmtLabel(d) })
  }
  if (effectiveFactors.some((f) => f.kind === 'event')) {
    const d = new Date(now)
    d.setDate(d.getDate() + 6)
    eventLines.push({ label: 'Partido', x: fmtLabel(d) })
  }

  return { points, todayLabel, eventLines }
}

/* ─── Custom tooltip ─────────────────────────────────────────────── */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number | null }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const hist = payload.find((p) => p.name === 'historical' && p.value != null)
  const fc = payload.find((p) => p.name === 'forecast' && p.value != null)
  if (!hist && !fc) return null
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-muted-foreground">{label}</p>
      {hist && (
        <p className="tabular-nums">
          Ventas reales:{' '}
          <span className="font-semibold">{formatNumber(hist.value!)}</span> ud
        </p>
      )}
      {fc && (
        <p className="tabular-nums">
          Previsión:{' '}
          <span className="font-semibold text-primary">{formatNumber(fc.value!)}</span> ud
        </p>
      )}
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function LegendItem({
  color,
  dash,
  area,
  label,
}: {
  color: string
  dash?: boolean
  area?: boolean
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      {area ? (
        <span className="h-3 w-6 rounded-sm opacity-70" style={{ backgroundColor: color }} />
      ) : (
        <svg width="24" height="3" className="shrink-0">
          <line
            x1="0" y1="1.5" x2="24" y2="1.5"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={dash ? '6 3' : undefined}
          />
        </svg>
      )}
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

interface DemoSliderProps {
  label: string
  icon: ReactNode
  value: number
  min: number
  max: number
  format: (v: number) => string
  onChange: (v: number) => void
}

function DemoSlider({ label, icon, value, min, max, format, onChange }: DemoSliderProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-base font-medium">
          {icon}
          {label}
        </div>
        <span
          className={cn(
            'text-base font-semibold tabular-nums',
            value > 0 ? 'text-primary' : value < 0 ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
        aria-label={label}
      />
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{format(min)}</span>
        <span>{format(0)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

function ForecastSkeleton() {
  return (
    <div className="space-y-6 px-8 pb-12 pt-8" aria-busy="true" aria-label="Cargando previsión">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-10 w-72 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-7 w-36 rounded-full" />
        <Skeleton className="h-7 w-32 rounded-full" />
        <Skeleton className="h-7 w-36 rounded-full" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────── */

export function ForecastPage() {
  const [data, setData] = useState<OrderTasksResponse | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [activeKinds, setActiveKinds] = useState<Set<FactorKind>>(new Set())
  const [tempDelta, setTempDelta] = useState(0)
  const [trendDelta, setTrendDelta] = useState(0)
  const [now] = useState(() => new Date())

  useEffect(() => {
    let cancelled = false
    setData(null)
    setLoadError(false)
    getOrderTasks()
      .then((r) => {
        if (cancelled) return
        setData(r)
        setSelectedId((prev) => prev || r.tasks[0]?.id || '')
      })
      .catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [])

  const task: OrderTask | null = useMemo(
    () => data?.tasks.find((t) => t.id === selectedId) ?? null,
    [data, selectedId],
  )

  // Reset toggles and demo controls whenever the selected product changes
  useEffect(() => {
    if (!task) return
    setActiveKinds(new Set(task.factors.map((f) => f.kind)))
    setTempDelta(0)
    setTrendDelta(0)
  }, [task?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Apply demo overrides to factor effects
  const effectiveFactors = useMemo((): Factor[] => {
    if (!task) return []
    return task.factors.map((f) => {
      if (f.kind === 'weather') return { ...f, effect: f.effect + tempDelta / 100 }
      if (f.kind === 'trend') return { ...f, effect: f.effect + trendDelta / 100 }
      return f
    })
  }, [task, tempDelta, trendDelta])

  const { points, todayLabel, eventLines, activeSuggested } = useMemo(() => {
    if (!task) return { points: [], todayLabel: '', eventLines: [], activeSuggested: 0 }

    const chart = buildChartData(task, activeKinds, effectiveFactors, now)

    const activeLift = effectiveFactors
      .filter((f) => activeKinds.has(f.kind))
      .reduce((s, f) => s + f.effect, 0)
    const totalLift = task.factors.reduce((s, f) => s + f.effect, 0)
    const liftMultiplier = (1 + totalLift) !== 0 ? (1 + activeLift) / (1 + totalLift) : 1
    const activeForecast = Math.round(task.forecastSales * liftMultiplier)
    const stock = task.stock.store + task.stock.warehouse
    const suggested =
      Math.ceil(Math.max(0, activeForecast * 1.1 - stock) / task.product.packSize) *
      task.product.packSize

    return { ...chart, activeSuggested: suggested }
  }, [task, activeKinds, effectiveFactors, now])

  const hasWeather = task?.factors.some((f) => f.kind === 'weather') ?? false
  const hasTrend = task?.factors.some((f) => f.kind === 'trend') ?? false
  const showDemo = hasWeather || hasTrend

  if (loadError) {
    return (
      <div className="px-8 pt-8">
        <h1 className="mb-6 text-[28px] font-bold leading-tight">Previsión</h1>
        <div className="rounded-xl border p-8 text-center text-base text-muted-foreground">
          No hemos podido cargar la previsión. Inténtalo de nuevo.
        </div>
      </div>
    )
  }

  if (!data || !task) return <ForecastSkeleton />

  return (
    <div className="space-y-6 px-8 pb-12 pt-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-[28px] font-bold leading-tight">Previsión</h1>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {data.tasks.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Confidence chip + active factor chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium',
            task.confidence.level === 'high'
              ? 'bg-success-soft text-primary'
              : task.confidence.level === 'medium'
                ? 'bg-warning-soft text-foreground'
                : 'bg-muted text-muted-foreground',
          )}
        >
          Confianza {task.confidence.level === 'high' ? 'alta' : task.confidence.level === 'medium' ? 'media' : 'baja'}
          {' · '}
          {task.confidence.score} %
        </span>
        {effectiveFactors
          .filter((f) => activeKinds.has(f.kind) && f.kind !== 'history' && f.kind !== 'short-history')
          .map((f) => {
            const Icon = f.kind === 'trend' && f.effect < 0 ? TrendingDown : FACTOR_ICONS[f.kind]
            return (
              <span
                key={f.kind}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-sm"
              >
                <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                {f.label}
                {f.effect !== 0 && (
                  <span className="text-muted-foreground tabular-nums">· {formatEffect(f.effect)}</span>
                )}
              </span>
            )
          })}
      </div>

      {/* Chart */}
      <div className="rounded-xl border p-6 shadow-xs" data-tour="forecast-chart">
        <div className="mb-5 flex flex-wrap items-baseline gap-3">
          <span className="text-sm text-muted-foreground">Sugerido con señales activas</span>
          <span className="text-[28px] font-bold tabular-nums text-primary">
            {formatNumber(activeSuggested)}
          </span>
          <span className="text-sm text-muted-foreground">
            ud · {task.product.section}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={points} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E3DE" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6B6B66' }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B6B66' }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} />

            {/* Confidence band: stacked areas — transparent base + green top */}
            <Area type="monotone" dataKey="bandBottom" stackId="band" fill="transparent" stroke="none" legendType="none" isAnimationActive={false} />
            <Area type="monotone" dataKey="bandTop" stackId="band" fill="#CFE5C3" fillOpacity={0.7} stroke="none" legendType="none" isAnimationActive={false} />

            {/* Historical */}
            <Line type="monotone" dataKey="historical" stroke="#6B6B66" strokeWidth={2} dot={false} name="historical" connectNulls={false} isAnimationActive={false} />

            {/* Forecast */}
            <Line type="monotone" dataKey="forecast" stroke="#3F7D2B" strokeWidth={2} dot={false} name="forecast" connectNulls={false} strokeDasharray="6 3" isAnimationActive={false} />

            {/* Today marker */}
            <ReferenceLine
              x={todayLabel}
              stroke="#6B6B66"
              strokeDasharray="4 2"
              label={{ value: 'Hoy', fill: '#6B6B66', fontSize: 11, position: 'insideTopRight' }}
            />

            {/* Event markers */}
            {eventLines.map((ev) => (
              <ReferenceLine
                key={ev.label}
                x={ev.x}
                stroke="#FFA102"
                strokeDasharray="4 2"
                label={{ value: ev.label, fill: '#FFA102', fontSize: 11, position: 'insideTopRight' }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>

        <div className="mt-3 flex flex-wrap gap-5">
          <LegendItem color="#6B6B66" label="Ventas históricas" />
          <LegendItem color="#3F7D2B" dash label="Previsión" />
          <LegendItem color="#CFE5C3" area label="Banda de confianza" />
          {eventLines.length > 0 && <LegendItem color="#FFA102" dash label="Eventos" />}
        </div>
      </div>

      {/* Bottom panels */}
      <div className={cn('grid gap-6', showDemo ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 max-w-xl')}>
        {/* Señales de futuro */}
        <div className="rounded-xl border p-6 shadow-xs" data-tour="forecast-signals">
          <h2 className="mb-1 text-xl font-semibold">Señales de futuro</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Activa o desactiva señales para recalcular la previsión.
          </p>
          <ul className="divide-y divide-border">
            {task.factors.map((factor) => {
              const ef = effectiveFactors.find((f) => f.kind === factor.kind) ?? factor
              const isActive = activeKinds.has(factor.kind)
              const isFixed = factor.kind === 'history' || factor.kind === 'short-history'
              const Icon =
                factor.kind === 'trend' && ef.effect < 0
                  ? TrendingDown
                  : FACTOR_ICONS[factor.kind]
              return (
                <li key={factor.kind} className="flex items-center gap-3 py-3">
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted transition-opacity',
                      !isActive && 'opacity-40',
                    )}
                  >
                    <Icon className="size-4 text-muted-foreground" aria-hidden />
                  </span>
                  <div className={cn('min-w-0 flex-1 transition-opacity', !isActive && 'opacity-40')}>
                    <div className="text-base font-medium">{FACTOR_NAMES[factor.kind]}</div>
                    <div className="text-sm text-muted-foreground">{factor.label}</div>
                  </div>
                  {ef.effect !== 0 && (
                    <span
                      className={cn(
                        'shrink-0 text-base font-semibold tabular-nums transition-opacity',
                        !isActive && 'opacity-40',
                        ef.effect > 0 ? 'text-primary' : 'text-destructive',
                      )}
                    >
                      {formatEffect(ef.effect)}
                    </span>
                  )}
                  <Switch
                    checked={isActive}
                    disabled={isFixed}
                    onCheckedChange={(checked) =>
                      setActiveKinds((prev) => {
                        const next = new Set(prev)
                        checked ? next.add(factor.kind) : next.delete(factor.kind)
                        return next
                      })
                    }
                    aria-label={`${isActive ? 'Desactivar' : 'Activar'} ${FACTOR_NAMES[factor.kind]}`}
                  />
                </li>
              )
            })}
          </ul>
        </div>

        {/* Demo controls — only visible when the product has weather or trend factors */}
        {showDemo && (
          <div className="rounded-xl border border-dashed p-6">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-xl font-semibold">Controles demo</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Solo demo
              </span>
            </div>
            <p className="mb-5 text-sm text-muted-foreground">
              Simula escenarios para la presentación en directo.
            </p>
            <div className="space-y-6">
              {hasWeather && (
                <DemoSlider
                  label="Efecto del clima"
                  icon={<Thermometer className="size-4" />}
                  value={tempDelta}
                  min={-20}
                  max={20}
                  format={(v) => `${v > 0 ? '+' : ''}${v} %`}
                  onChange={setTempDelta}
                />
              )}
              {hasTrend && (
                <DemoSlider
                  label="Tendencia"
                  icon={
                    trendDelta < 0 ? (
                      <TrendingDown className="size-4" />
                    ) : (
                      <TrendingUp className="size-4" />
                    )
                  }
                  value={trendDelta}
                  min={-30}
                  max={30}
                  format={(v) => `${v > 0 ? '+' : ''}${v} %`}
                  onChange={setTrendDelta}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
