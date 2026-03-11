export interface MarketDataFile {
  symbol: string
  timeframe: string
  filename: string
  row_count: number
  start_date: string
  end_date: string
  file_size_bytes: number
}

export interface UploadResponse {
  message: string
  symbol: string
  timeframe: string
  rows_imported: number
}
