import { create } from 'zustand'
import { backtestsApi } from '@/api/backtests'
import type { BacktestCreate, BacktestResponse } from '@/types/backtest'

interface BacktestState {
  backtests: BacktestResponse[]
  loading: boolean
  error: string | null
  fetchBacktests: () => Promise<void>
  createBacktest: (data: BacktestCreate) => Promise<BacktestResponse>
  pollStatus: (id: number) => Promise<BacktestResponse>
}

export const useBacktestStore = create<BacktestState>((set) => ({
  backtests: [],
  loading: false,
  error: null,

  fetchBacktests: async () => {
    set({ loading: true, error: null })
    try {
      const backtests = await backtestsApi.list()
      set({ backtests, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createBacktest: async (data) => {
    const bt = await backtestsApi.create(data)
    set((s) => ({ backtests: [...s.backtests, bt] }))
    return bt
  },

  pollStatus: async (id) => {
    const bt = await backtestsApi.getStatus(id)
    set((s) => ({
      backtests: s.backtests.map((b) => (b.id === id ? bt : b)),
    }))
    return bt
  },
}))
