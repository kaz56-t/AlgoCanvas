import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { Dashboard } from './Dashboard'
import { StrategyList } from './StrategyList'
import { StrategyEditor } from './StrategyEditor'
import { NLGenerator } from './NLGenerator'
import { BacktestRun } from './BacktestRun'
import { BacktestResult } from './BacktestResult'
import { DataManager } from './DataManager'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'strategies', element: <StrategyList /> },
      { path: 'strategies/:id', element: <StrategyEditor /> },
      { path: 'nl-generator', element: <NLGenerator /> },
      { path: 'backtests/run', element: <BacktestRun /> },
      { path: 'backtests/results', element: <BacktestResult /> },
      { path: 'data', element: <DataManager /> },
    ],
  },
])
