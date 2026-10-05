import { CalendarDays, Clock, HelpCircle, Store, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatLongDate } from '@/lib/format'

interface AppHeaderProps {
  today: Date
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

export function AppHeader({ today, onStartTour }: AppHeaderProps) {
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
      <HeaderItem icon={<CalendarDays aria-hidden className="size-4 text-primary" />}>
        <span className="font-semibold text-foreground tabular-nums ml-auto">Previsión 8 días</span>
      </HeaderItem>

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
