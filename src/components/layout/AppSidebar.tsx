import { Leaf, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, type PageId } from './nav'

interface AppSidebarProps {
  current: PageId
  onNavigate: (page: PageId) => void
  collapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ current, onNavigate, collapsed, onToggle }: AppSidebarProps) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r bg-background transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-60',
      )}
    >
      <div className={cn('flex h-16 items-center gap-2 border-b', collapsed ? 'justify-center' : 'px-6')}>
        <Leaf aria-hidden className="size-6 shrink-0 text-brand" />
        {!collapsed && <span className="text-xl font-bold text-primary">MercaPredict</span>}
      </div>

      <nav aria-label="Principal" className="flex flex-1 flex-col gap-2 p-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = id === current
          const button = (
            <button
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={active ? 'page' : undefined}
              aria-label={collapsed ? label : undefined}
              className={cn(
                'flex h-12 items-center gap-3 rounded-full text-base font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                collapsed ? 'justify-center' : 'px-4',
                active ? 'bg-success-soft text-primary' : 'text-foreground hover:bg-muted',
              )}
            >
              <Icon aria-hidden className="size-5 shrink-0" />
              {!collapsed && label}
            </button>
          )

          return collapsed ? (
            <Tooltip key={id}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ) : (
            <div key={id}>{button}</div>
          )
        })}
      </nav>

      <div className="border-t p-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          aria-expanded={!collapsed}
          className={cn(
            'flex h-11 w-full items-center gap-3 rounded-full text-sm text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50',
            collapsed ? 'justify-center' : 'px-4',
          )}
        >
          <ToggleIcon aria-hidden className="size-5 shrink-0" />
          {!collapsed && 'Contraer menú'}
        </button>
      </div>
    </aside>
  )
}
