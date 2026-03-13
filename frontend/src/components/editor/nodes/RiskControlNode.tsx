import { Handle, Position, type NodeProps } from 'reactflow'

export function RiskControlNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`w-48 rounded-lg border-2 bg-white shadow-sm transition-shadow ${
        selected ? 'border-yellow-500 shadow-md' : 'border-yellow-400'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-yellow-500" />
      <div className="rounded-t-md bg-yellow-500 px-3 py-1.5">
        <p className="text-xs font-semibold text-white">Risk Control</p>
      </div>
      <div className="p-2 text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Stop Loss</span>
          <span className="font-medium text-red-600">
            {data.stop_loss_pct !== undefined ? `${data.stop_loss_pct}%` : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Take Profit</span>
          <span className="font-medium text-green-600">
            {data.take_profit_pct !== undefined ? `${data.take_profit_pct}%` : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Position</span>
          <span className="font-medium">
            {data.position_size_pct !== undefined ? `${data.position_size_pct}%` : '100%'}
          </span>
        </div>
        {data.label && (
          <p className="truncate text-center text-gray-600 italic">{String(data.label)}</p>
        )}
      </div>
    </div>
  )
}
