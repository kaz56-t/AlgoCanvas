import { useLocation } from 'react-router-dom'

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/strategies': 'Strategies',
  '/strategies/new': 'New Strategy',
  '/backtests/run': 'Run Backtest',
  '/backtests/results': 'Backtest Results',
  '/nl-generator': 'NL Generator',
  '/market-data': 'Market Data',
}

export function Header() {
  const { pathname } = useLocation()

  const label =
    routeLabels[pathname] ??
    (pathname.startsWith('/strategies/') ? 'Strategy Editor' : pathname)

  return (
    <header className="flex h-14 items-center border-b bg-card px-6">
      <h1 className="text-base font-semibold">{label}</h1>
    </header>
  )
}
