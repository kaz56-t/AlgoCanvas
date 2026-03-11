import client from './client'
import type { MarketDataFile, UploadResponse } from '@/types/marketData'

export const marketDataApi = {
  list: () =>
    client.get<MarketDataFile[]>('/market-data').then((r) => r.data),

  upload: (symbol: string, timeframe: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return client
      .post<UploadResponse>(`/market-data/upload?symbol=${symbol}&timeframe=${timeframe}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  delete: (symbol: string, timeframe: string) =>
    client.delete(`/market-data/${symbol}/${timeframe}`).then((r) => r.data),
}
