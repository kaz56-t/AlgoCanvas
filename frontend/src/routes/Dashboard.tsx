import { useEffect, useState } from 'react'
import { strategiesApi } from '@/api/strategies'
import { backtestsApi } from '@/api/backtests'
import { marketDataApi } from '@/api/marketData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { BookOpen, FlaskConical, Database } from 'lucide-react'

interface Counts {
  strategies: number
  backtests: number
  marketFiles: number
}

export function Dashboard() {
  const [counts, setCounts] = useState<Counts | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([strategiesApi.list(), backtestsApi.list(), marketDataApi.list()])
      .then(([strategies, backtests, marketFiles]) => {
        setCounts({
          strategies: strategies.length,
          backtests: backtests.length,
          marketFiles: marketFiles.length,
        })
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load dashboard: {error}
        </div>
      </div>
    )
  }

  if (!counts) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const stats = [
    { label: 'Strategies', value: counts.strategies, icon: <BookOpen size={20} />, href: '/strategies' },
    { label: 'Backtests', value: counts.backtests, icon: <FlaskConical size={20} />, href: '/backtests/results' },
    { label: 'Market Data Files', value: counts.marketFiles, icon: <Database size={20} />, href: '/market-data' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome to AlgoCanvas</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Local algo-trading backtest platform
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <span className="text-muted-foreground">{s.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Upload market data CSV via <strong>Market Data</strong> (Phase 2)</li>
            <li>Create a trading strategy via <strong>Strategies</strong></li>
            <li>Run a backtest via <strong>Backtest</strong> (Phase 4)</li>
            <li>Analyse results in <strong>Results</strong> (Phase 4)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
