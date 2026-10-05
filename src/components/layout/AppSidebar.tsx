import { Leaf, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, type PageId } from './nav'

interface AppSidebarProps {
  current: PageId
  onNavigate: (page: PageId) => void
  collapsed: boolean
  onToggle: () => void
  badges?: Partial<Record<PageId, number>>
}

export function AppSidebar({ current, onNavigate, collapsed, onToggle, badges = {} }: AppSidebarProps) {
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

      <nav aria-label="Principal" data-tour="nav" className="flex flex-1 flex-col gap-2 p-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = id === current
          const badge = badges[id]
          const button = (
            <button
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={active ? 'page' : undefined}
              aria-label={collapsed ? label : undefined}
              className={cn(
                'relative flex h-12 w-full items-center gap-3 rounded-full text-base font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                collapsed ? 'justify-center' : 'px-4',
                active ? 'bg-success-soft text-primary' : 'text-foreground hover:bg-muted',
              )}
            >
              <Icon aria-hidden className="size-5 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">{label}</span>}

              {/* Badge — expanded: pill at end; collapsed: dot on icon corner */}
              {badge != null && badge > 0 && (
                collapsed ? (
                  <span
                    aria-label={`${badge} alertas`}
                    className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-bold leading-none text-foreground tabular-nums"
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                ) : (
                  <span
                    aria-label={`${badge} alertas`}
                    className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1.5 text-xs font-bold leading-none text-foreground tabular-nums"
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )
              )}
            </button>
          )

          return collapsed ? (
            <Tooltip key={id}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent side="right">
                {label}
                {badge != null && badge > 0 && ` · ${badge}`}
              </TooltipContent>
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
