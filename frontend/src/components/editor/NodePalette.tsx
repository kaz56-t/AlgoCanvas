import { Database, TrendingUp, GitMerge, Layers, ArrowUpDown, ShieldAlert } from 'lucide-react'

interface PaletteItem {
  nodeType: string
  label: string
  description: string
  icon: React.ReactNode
  defaultData: Record<string, unknown>
  color: string
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    nodeType: 'DataSource',
    label: 'Data Source',
    description: 'Price data input',
    icon: <Database size={16} />,
    defaultData: { label: 'Data Source', symbol: 'AAPL', timeframe: '1d' },
    color: 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200',
  },
  {
    nodeType: 'Indicator',
    label: 'Indicator',
    description: 'Technical indicator',
    icon: <TrendingUp size={16} />,
    defaultData: { label: 'SMA(25)', indicator: 'SMA', params: { period: 25 } },
    color: 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200',
  },
  {
    nodeType: 'Condition',
    label: 'Condition',
    description: 'Signal condition',
    icon: <GitMerge size={16} />,
    defaultData: { label: 'Cross Over', operator: 'crossover' },
    color: 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200',
  },
  {
    nodeType: 'Logic',
    label: 'Logic Gate',
    description: 'AND / OR / NOT',
    icon: <Layers size={16} />,
    defaultData: { label: 'AND', operation: 'AND' },
    color: 'bg-cyan-100 border-cyan-300 text-cyan-800 hover:bg-cyan-200',
  },
  {
    nodeType: 'Signal',
    label: 'Signal',
    description: 'BUY or SELL signal',
    icon: <ArrowUpDown size={16} />,
    defaultData: { label: 'Buy Signal', action: 'BUY' },
    color: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200',
  },
  {
    nodeType: 'RiskControl',
    label: 'Risk Control',
    description: 'Stop loss / Take profit',
    icon: <ShieldAlert size={16} />,
    defaultData: {
      label: 'Risk Mgmt',
      stop_loss_pct: 5,
      take_profit_pct: 15,
      position_size_pct: 100,
    },
    color: 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200',
  },
]

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string, defaultData: Record<string, unknown>) => void
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <aside className="flex w-52 flex-col border-r bg-gray-50 overflow-y-auto">
      <div className="border-b p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Node Palette</h3>
        <p className="mt-1 text-xs text-gray-400">Drag nodes onto the canvas</p>
      </div>

      <div className="p-3 space-y-2">
        {PALETTE_ITEMS.map((item) => (
          <div
            key={item.nodeType}
            draggable
            onDragStart={(e) => onDragStart(e, item.nodeType, item.defaultData)}
            className={`flex cursor-grab items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors active:cursor-grabbing ${item.color}`}
          >
            {item.icon}
            <div className="min-w-0">
              <div className="font-semibold">{item.label}</div>
              <div className="truncate opacity-70">{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t p-3">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong>Tips:</strong> Connect nodes by dragging from the bottom handle to the top handle of the next node. Click a node to configure it.
        </p>
      </div>
    </aside>
  )
}
