import {
  CalendarDays,
  History,
  PartyPopper,
  Sun,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { formatEffect } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Factor } from '@/types'

const ICONS: Record<Factor['kind'], LucideIcon> = {
  weather: Sun,
  holiday: CalendarDays,
  event: PartyPopper,
  trend: TrendingUp,
  history: History,
  'short-history': History,
}

export function FactorChip({ factor }: { factor: Factor }) {
  const Icon = factor.kind === 'trend' && factor.effect < 0 ? TrendingDown : ICONS[factor.kind]
  const isShortHistory = factor.kind === 'short-history'

  return (
    <span
      title={factor.label}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm whitespace-nowrap',
        isShortHistory ? 'bg-warning-soft text-foreground' : 'bg-muted text-foreground',
      )}
    >
      <Icon aria-hidden className="size-3.5 text-muted-foreground" />
      {/* En pantallas estrechas solo icono y efecto; el nombre queda para lectores y tooltip. */}
      <span className={cn(!isShortHistory && factor.effect !== 0 && 'max-xl:sr-only')}>{factor.label}</span>
      {!isShortHistory && factor.effect !== 0 && (
        <span className="text-muted-foreground tabular-nums">
          <span className="max-xl:hidden">· </span>
          {formatEffect(factor.effect)}
        </span>
      )}
    </span>
  )
}
