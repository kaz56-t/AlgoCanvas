import type { Node } from 'reactflow'

interface NodeConfigPanelProps {
  node: Node | null
  onUpdate: (id: string, data: Record<string, unknown>) => void
  onDelete: (id: string) => void
}

const INDICATOR_OPTIONS = ['SMA', 'EMA', 'WMA', 'MACD', 'RSI', 'BB', 'ATR', 'OBV', 'Stochastic', 'ADX']
const OPERATOR_OPTIONS = ['crossover', 'crossunder', '>', '<', '>=', '<=', '==']
const LOGIC_OPTIONS = ['AND', 'OR', 'NOT']
const ACTION_OPTIONS = ['BUY', 'SELL']
const TIMEFRAME_OPTIONS = ['1d', '1wk', '1mo']

export function NodeConfigPanel({ node, onUpdate, onDelete }: NodeConfigPanelProps) {
  if (!node) {
    return (
      <aside className="flex w-64 flex-col border-l bg-gray-50">
        <div className="border-b p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Properties</h3>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-center text-xs text-gray-400">Select a node to edit its properties</p>
        </div>
      </aside>
    )
  }

  const data = node.data as Record<string, unknown>
  const set = (patch: Record<string, unknown>) => onUpdate(node.id, { ...data, ...patch })
  const setParam = (key: string, value: unknown) => {
    const params = ((data.params as Record<string, unknown>) ?? {}) as Record<string, unknown>
    set({ params: { ...params, [key]: value } })
  }

  const renderFields = () => {
    switch (node.type) {
      case 'DataSource':
        return (
          <>
            <Field label="Symbol">
              <input
                className={inputCls}
                value={String(data.symbol ?? '')}
                onChange={(e) => set({ symbol: e.target.value })}
                placeholder="e.g. AAPL, 7203.T"
              />
            </Field>
            <Field label="Timeframe">
              <select className={inputCls} value={String(data.timeframe ?? '1d')} onChange={(e) => set({ timeframe: e.target.value })}>
                {TIMEFRAME_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </>
        )

      case 'Indicator': {
        const ind = String(data.indicator ?? 'SMA')
        const params = (data.params as Record<string, unknown>) ?? {}
        return (
          <>
            <Field label="Indicator">
              <select className={inputCls} value={ind} onChange={(e) => set({ indicator: e.target.value })}>
                {INDICATOR_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            {['SMA', 'EMA', 'WMA', 'RSI', 'ADX', 'Stochastic'].includes(ind) && (
              <Field label="Period">
                <input
                  type="number"
                  className={inputCls}
                  value={Number(params.period ?? 14)}
                  onChange={(e) => setParam('period', parseInt(e.target.value))}
                  min={1}
                />
              </Field>
            )}
            {ind === 'MACD' && (
              <>
                <Field label="Fast">
                  <input type="number" className={inputCls} value={Number(params.fast ?? 12)} onChange={(e) => setParam('fast', parseInt(e.target.value))} min={1} />
                </Field>
                <Field label="Slow">
                  <input type="number" className={inputCls} value={Number(params.slow ?? 26)} onChange={(e) => setParam('slow', parseInt(e.target.value))} min={1} />
                </Field>
                <Field label="Signal">
                  <input type="number" className={inputCls} value={Number(params.signal ?? 9)} onChange={(e) => setParam('signal', parseInt(e.target.value))} min={1} />
                </Field>
              </>
            )}
            {ind === 'BB' && (
              <>
                <Field label="Period">
                  <input type="number" className={inputCls} value={Number(params.period ?? 20)} onChange={(e) => setParam('period', parseInt(e.target.value))} min={1} />
                </Field>
                <Field label="Std Dev">
                  <input type="number" className={inputCls} value={Number(params.std ?? 2)} onChange={(e) => setParam('std', parseFloat(e.target.value))} step={0.1} min={0.1} />
                </Field>
              </>
            )}
            {ind === 'ATR' && (
              <Field label="Period">
                <input type="number" className={inputCls} value={Number(params.period ?? 14)} onChange={(e) => setParam('period', parseInt(e.target.value))} min={1} />
              </Field>
            )}
          </>
        )
      }

      case 'Condition':
        return (
          <>
            <Field label="Operator">
              <select className={inputCls} value={String(data.operator ?? 'crossover')} onChange={(e) => set({ operator: e.target.value })}>
                {OPERATOR_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            {['>','<','>=','<=','=='].includes(String(data.operator)) && (
              <Field label="Threshold">
                <input
                  type="number"
                  className={inputCls}
                  value={Number(data.threshold ?? 0)}
                  onChange={(e) => set({ threshold: parseFloat(e.target.value) })}
                  step="any"
                />
              </Field>
            )}
          </>
        )

      case 'Logic':
        return (
          <Field label="Operation">
            <select className={inputCls} value={String(data.operation ?? 'AND')} onChange={(e) => set({ operation: e.target.value })}>
              {LOGIC_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
        )

      case 'Signal':
        return (
          <Field label="Action">
            <select className={inputCls} value={String(data.action ?? 'BUY')} onChange={(e) => set({ action: e.target.value })}>
              {ACTION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
        )

      case 'RiskControl':
        return (
          <>
            <Field label="Stop Loss %">
              <input
                type="number"
                className={inputCls}
                value={Number(data.stop_loss_pct ?? 5)}
                onChange={(e) => set({ stop_loss_pct: parseFloat(e.target.value) })}
                step={0.1}
                min={0}
              />
            </Field>
            <Field label="Take Profit %">
              <input
                type="number"
                className={inputCls}
                value={Number(data.take_profit_pct ?? 15)}
                onChange={(e) => set({ take_profit_pct: parseFloat(e.target.value) })}
                step={0.1}
                min={0}
              />
            </Field>
            <Field label="Position Size %">
              <input
                type="number"
                className={inputCls}
                value={Number(data.position_size_pct ?? 100)}
                onChange={(e) => set({ position_size_pct: parseFloat(e.target.value) })}
                step={1}
                min={1}
                max={100}
              />
            </Field>
          </>
        )

      default:
        return <p className="text-xs text-gray-400">No configurable properties</p>
    }
  }

  return (
    <aside className="flex w-64 flex-col border-l bg-gray-50 overflow-y-auto">
      <div className="border-b p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Properties</h3>
        <p className="mt-0.5 text-xs font-medium text-gray-700">{node.type}</p>
      </div>

      <div className="p-3 space-y-3">
        <Field label="Label">
          <input
            className={inputCls}
            value={String(data.label ?? '')}
            onChange={(e) => set({ label: e.target.value })}
            placeholder="Node label"
          />
        </Field>

        <hr className="border-gray-200" />

        {renderFields()}

        <hr className="border-gray-200" />

        <button
          onClick={() => onDelete(node.id)}
          className="w-full rounded-md border border-red-300 bg-red-50 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          Delete Node
        </button>
      </div>
    </aside>
  )
}

const inputCls =
  'w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}
