import { CalendarDays, Clock, HelpCircle, Store, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatLongDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Horizon } from '@/types'

const HORIZONS: Horizon[] = [3, 7, 14]

interface AppHeaderProps {
  today: Date
  horizon: Horizon
  onHorizonChange: (horizon: Horizon) => void
  onStartTour: () => void
}

function HeaderItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
      {icon}
      {children}
    </span>
  )
}

export function AppHeader({ today, horizon, onHorizonChange, onStartTour }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-8 xl:gap-6">
      <HeaderItem icon={<Store aria-hidden className="size-4" />}>
        <span className="font-semibold text-foreground">
          <span className="max-xl:hidden">Tienda 2841 · Valencia, </span>Ruzafa
        </span>
      </HeaderItem>
      <HeaderItem icon={<CalendarDays aria-hidden className="size-4" />}>
        <span className="first-letter:uppercase">{formatLongDate(today)}</span>
      </HeaderItem>
      <HeaderItem icon={<Clock aria-hidden className="size-4" />}>
        Corte <span className="font-semibold text-foreground tabular-nums">13:00</span>
      </HeaderItem>
      <HeaderItem icon={<Sun aria-hidden className="size-4 text-warning" />}>
        <span className="max-xl:sr-only">Máx. prevista</span>
        <span className="font-semibold text-foreground tabular-nums">31 ºC</span>
      </HeaderItem>

      <div
        role="group"
        aria-label="Horizonte de previsión"
        data-tour="horizon"
        className="ml-auto flex items-center gap-1 rounded-full border bg-muted p-1"
      >
        {HORIZONS.map((h) => {
          const selected = h === horizon
          return (
            <button
              key={h}
              type="button"
              aria-pressed={selected}
              onClick={() => onHorizonChange(h)}
              className={cn(
                'h-9 min-w-20 rounded-full px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                selected ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-background',
              )}
            >
              {h} días
            </button>
          )
        })}
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onStartTour}
            aria-label="Ver tour de la aplicación"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <HelpCircle aria-hidden className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Ver tour</TooltipContent>
      </Tooltip>
    </header>
  )
}
