export interface MarketDataFile {
  id: number
  symbol: string
  display_name: string | null
  filename: string
  row_count: number | null
  start_date: string | null
  end_date: string | null
  timeframe: string | null
  fetched_at: string
}

export interface MarketDataFetchRequest {
  symbol: string
  timeframe: string
  start_date: string
  end_date: string
  refresh: boolean
}
