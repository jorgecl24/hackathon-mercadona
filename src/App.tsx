import { useState } from 'react'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { NAV_ITEMS, type PageId } from '@/components/layout/nav'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { startTour } from '@/lib/tour'
import { ForecastPage } from '@/pages/forecast/ForecastPage'
import { OrderProposalPage } from '@/pages/order/OrderProposalPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { SummaryPage } from '@/pages/summary/SummaryPage'
import { WastePage } from '@/pages/waste/WastePage'

export default function App() {
  const [page, setPage] = useState<PageId>('order')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 1440)
  const [today] = useState(() => new Date())
  const [badges, setBadges] = useState<Partial<Record<PageId, number>>>({})

  const pageTitle = NAV_ITEMS.find((item) => item.id === page)?.label ?? ''

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <AppSidebar
          current={page}
          onNavigate={setPage}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
          badges={badges}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            today={today}
            onStartTour={() => startTour(setPage)}
          />
          <main className="flex-1">
            {page === 'order' ? (
              <OrderProposalPage
                onPendingCount={(n) => setBadges((b) => ({ ...b, order: n || undefined }))}
              />
            ) : page === 'summary' ? (
              <SummaryPage />
            ) : page === 'forecast' ? (
              <ForecastPage />
            ) : page === 'waste' ? (
              <WastePage
                onWasteCount={(n) => setBadges((b) => ({ ...b, waste: n || undefined }))}
              />
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
