import { useState } from 'react'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { NAV_ITEMS, type PageId } from '@/components/layout/nav'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { OrderProposalPage } from '@/pages/order/OrderProposalPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { ForecastPage } from '@/pages/forecast/ForecastPage'
import { SummaryPage } from '@/pages/summary/SummaryPage'
import { WastePage } from '@/pages/waste/WastePage'
import type { Horizon } from '@/types'

export default function App() {
  const [page, setPage] = useState<PageId>('order')
  const [horizon, setHorizon] = useState<Horizon>(7)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 1440)
  const [today] = useState(() => new Date())

  const pageTitle = NAV_ITEMS.find((item) => item.id === page)?.label ?? ''

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <AppSidebar
          current={page}
          onNavigate={setPage}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader today={today} horizon={horizon} onHorizonChange={setHorizon} />
          <main className="flex-1">
            {page === 'order' ? (
              <OrderProposalPage key={horizon} horizon={horizon} />
            ) : page === 'summary' ? (
              <SummaryPage key={horizon} horizon={horizon} />
            ) : page === 'forecast' ? (
              <ForecastPage key={horizon} horizon={horizon} />
            ) : page === 'waste' ? (
              <WastePage key={horizon} horizon={horizon} />
            ) : (
              <PlaceholderPage title={pageTitle} />
            )}
          </main>
        </div>
      </div>
      <Toaster position="bottom-center" offset={96} />
    </TooltipProvider>
  )
}
