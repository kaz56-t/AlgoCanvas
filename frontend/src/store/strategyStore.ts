import { create } from 'zustand'
import { strategiesApi } from '@/api/strategies'
import type { Strategy, StrategyCreate, StrategyUpdate } from '@/types/strategy'

interface StrategyState {
  strategies: Strategy[]
  loading: boolean
  error: string | null
  fetchStrategies: () => Promise<void>
  createStrategy: (data: StrategyCreate) => Promise<Strategy>
  updateStrategy: (id: number, data: StrategyUpdate) => Promise<Strategy>
  deleteStrategy: (id: number) => Promise<void>
}

export const useStrategyStore = create<StrategyState>((set) => ({
  strategies: [],
  loading: false,
  error: null,

  fetchStrategies: async () => {
    set({ loading: true, error: null })
    try {
      const strategies = await strategiesApi.list()
      set({ strategies, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createStrategy: async (data) => {
    const strategy = await strategiesApi.create(data)
    set((s) => ({ strategies: [...s.strategies, strategy] }))
    return strategy
  },

  updateStrategy: async (id, data) => {
    const updated = await strategiesApi.update(id, data)
    set((s) => ({
      strategies: s.strategies.map((st) => (st.id === id ? updated : st)),
    }))
    return updated
  },

  deleteStrategy: async (id) => {
    await strategiesApi.delete(id)
    set((s) => ({ strategies: s.strategies.filter((st) => st.id !== id) }))
  },
}))
