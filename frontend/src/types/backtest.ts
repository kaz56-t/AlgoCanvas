export type BacktestStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface BacktestResult {
  total_return: number
  annualized_return: number
  max_drawdown: number
  sharpe_ratio: number
  win_rate: number
  total_trades: number
  commission_rate: number
  equity_curve: Array<{ date: string; value: number }>
  trades: Array<{
    date: string
    action: string
    price: number
    shares: number
    pnl: number
  }>
}

export interface BacktestResponse {
  id: number
  strategy_id: number
  symbol: string
  timeframe: string
  start_date: string
  end_date: string
  initial_capital: number
  commission_rate: number
  status: BacktestStatus
  result: BacktestResult | null
  created_at: string
  updated_at: string
}

export interface BacktestCreate {
  strategy_id: number
  symbol: string
  timeframe: string
  start_date: string
  end_date: string
  initial_capital?: number
  commission_rate?: number
}
