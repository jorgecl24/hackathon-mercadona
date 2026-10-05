import { ChartLine, ClipboardList, LayoutDashboard, Timer, type LucideIcon } from 'lucide-react'

export type PageId = 'summary' | 'forecast' | 'order' | 'waste'

export const NAV_ITEMS: { id: PageId; label: string; icon: LucideIcon }[] = [
  { id: 'summary', label: 'Resumen', icon: LayoutDashboard },
  { id: 'forecast', label: 'Previsión', icon: ChartLine },
  { id: 'order', label: 'Pedido', icon: ClipboardList },
  { id: 'waste', label: 'Merma', icon: Timer },
]
