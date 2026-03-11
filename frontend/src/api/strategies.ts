import client from './client'
import type { Strategy, StrategyCreate, StrategyUpdate } from '@/types/strategy'

export const strategiesApi = {
  list: () =>
    client.get<Strategy[]>('/strategies').then((r) => r.data),

  get: (id: number) =>
    client.get<Strategy>(`/strategies/${id}`).then((r) => r.data),

  create: (data: StrategyCreate) =>
    client.post<Strategy>('/strategies', data).then((r) => r.data),

  update: (id: number, data: StrategyUpdate) =>
    client.put<Strategy>(`/strategies/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    client.delete(`/strategies/${id}`).then((r) => r.data),
}
