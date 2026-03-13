import { useEffect, useState } from 'react'
import { marketDataApi } from '@/api/marketData'
import type { MarketDataFile, MarketDataFetchRequest } from '@/types/marketData'
import { Loader2, RefreshCw, Trash2 } from 'lucide-react'

const TIMEFRAMES = ['1d', '1wk', '1mo']

function today() {
  return new Date().toISOString().slice(0, 10)
}

function oneYearAgo() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  return d.toISOString().slice(0, 10)
}

export function DataManager() {
  const [list, setList] = useState<MarketDataFile[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<MarketDataFetchRequest>({
    symbol: '',
    timeframe: '1d',
    start_date: oneYearAgo(),
    end_date: today(),
    refresh: false,
  })

  const loadList = async () => {
    setLoading(true)
    try {
      setList(await marketDataApi.list())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault()
    setFetching(true)
    setError(null)
    try {
      await marketDataApi.fetch(form)
      await loadList()
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to fetch data'
      setError(msg)
    } finally {
      setFetching(false)
    }
  }

  const handleRefetch = async (item: MarketDataFile) => {
    setFetching(true)
    setError(null)
    try {
      await marketDataApi.fetch({
        symbol: item.symbol,
        timeframe: item.timeframe ?? '1d',
        start_date: item.start_date ?? oneYearAgo(),
        end_date: today(),
        refresh: true,
      })
      await loadList()
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to refetch'
      setError(msg)
    } finally {
      setFetching(false)
    }
  }

  const handleDelete = async (id: number) => {
    await marketDataApi.delete(id)
    await loadList()
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Data Manager</h1>

      {/* Fetch form */}
      <form onSubmit={handleFetch} className="rounded-lg border bg-card p-4 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Fetch Market Data</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs mb-1">Symbol</label>
            <input
              className="w-full rounded border bg-background px-2 py-1.5 text-sm"
              placeholder="e.g. 7203.T"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value.trim().toUpperCase() })}
              required
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Timeframe</label>
            <select
              className="w-full rounded border bg-background px-2 py-1.5 text-sm"
              value={form.timeframe}
              onChange={(e) => setForm({ ...form, timeframe: e.target.value })}
            >
              {TIMEFRAMES.map((tf) => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Start date</label>
            <input
              type="date"
              className="w-full rounded border bg-background px-2 py-1.5 text-sm"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs mb-1">End date</label>
            <input
              type="date"
              className="w-full rounded border bg-background px-2 py-1.5 text-sm"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={fetching}
          className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {fetching && <Loader2 size={14} className="animate-spin" />}
          Fetch
        </button>
      </form>

      {/* Data list */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Symbol</th>
              <th className="px-4 py-2 text-left font-medium">Name</th>
              <th className="px-4 py-2 text-left font-medium">Timeframe</th>
              <th className="px-4 py-2 text-left font-medium">Period</th>
              <th className="px-4 py-2 text-right font-medium">Rows</th>
              <th className="px-4 py-2 text-left font-medium">Fetched</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  <Loader2 size={16} className="animate-spin inline" />
                </td>
              </tr>
            )}
            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  No data yet. Use the form above to fetch market data.
                </td>
              </tr>
            )}
            {list.map((item) => (
              <tr key={item.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-2 font-mono font-medium">{item.symbol}</td>
                <td className="px-4 py-2 text-muted-foreground">{item.display_name ?? '—'}</td>
                <td className="px-4 py-2">{item.timeframe}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {item.start_date} – {item.end_date}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">{item.row_count?.toLocaleString()}</td>
                <td className="px-4 py-2 text-muted-foreground text-xs">
                  {new Date(item.fetched_at).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleRefetch(item)}
                      disabled={fetching}
                      className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
                      title="Re-fetch"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
