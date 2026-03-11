import client from './client'
import type { MarketDataFile, MarketDataFetchRequest } from '@/types/marketData'

export const marketDataApi = {
  list: () =>
    client.get<MarketDataFile[]>('/market-data').then((r) => r.data),

  fetch: (body: MarketDataFetchRequest) =>
    client.post<MarketDataFile>('/market-data/fetch', body).then((r) => r.data),

  preview: (id: number) =>
    client.get<{ columns: string[]; rows: Record<string, unknown>[] }>(`/market-data/${id}/preview`).then((r) => r.data),

  delete: (id: number) =>
    client.delete(`/market-data/${id}`).then((r) => r.data),
}
