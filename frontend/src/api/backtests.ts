import client from './client'
import type { BacktestCreate, BacktestResponse } from '@/types/backtest'

export const backtestsApi = {
  list: () =>
    client.get<BacktestResponse[]>('/backtests').then((r) => r.data),

  get: (id: number) =>
    client.get<BacktestResponse>(`/backtests/${id}`).then((r) => r.data),

  create: (data: BacktestCreate) =>
    client.post<BacktestResponse>('/backtests', data).then((r) => r.data),

  getStatus: (id: number) =>
    client.get<BacktestResponse>(`/backtests/${id}/status`).then((r) => r.data),
}
