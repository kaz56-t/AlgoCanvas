import { Handle, Position, type NodeProps } from 'reactflow'

export function DataSourceNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`w-44 rounded-lg border-2 bg-white shadow-sm transition-shadow ${
        selected ? 'border-blue-500 shadow-md' : 'border-blue-300'
      }`}
    >
      <div className="rounded-t-md bg-blue-600 px-3 py-1.5">
        <p className="text-xs font-semibold text-white">Data Source</p>
      </div>
      <div className="p-2 text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Symbol</span>
          <span className="font-medium">{String(data.symbol || 'AAPL')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Timeframe</span>
          <span className="font-medium">{String(data.timeframe || '1d')}</span>
        </div>
        {data.label && (
          <p className="truncate text-center text-gray-600 italic">{String(data.label)}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  )
}
