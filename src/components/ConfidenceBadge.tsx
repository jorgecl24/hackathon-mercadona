import { SignalHigh, SignalLow, SignalMedium } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderTask } from '@/types'

const LEVELS = {
  high: { label: 'Alta', icon: SignalHigh, className: 'bg-success-soft text-primary' },
  medium: { label: 'Media', icon: SignalMedium, className: 'bg-warning-soft text-foreground' },
  low: { label: 'Baja', icon: SignalLow, className: 'bg-muted text-muted-foreground' },
} as const

export function ConfidenceBadge({ confidence }: { confidence: OrderTask['confidence'] }) {
  const { label, icon: Icon, className } = LEVELS[confidence.level]
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium whitespace-nowrap',
          className,
        )}
      >
        <Icon aria-hidden className="size-4" />
        {label}
      </span>
      <span className="pl-2.5 text-sm text-muted-foreground tabular-nums">{confidence.score} %</span>
    </div>
  )
}
