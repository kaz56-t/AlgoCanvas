import { Handle, Position, type NodeProps } from 'reactflow'

export function IndicatorNode({ data, selected }: NodeProps) {
  const params = (data.params as Record<string, unknown>) ?? {}
  const paramStr = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')

  return (
    <div
      className={`w-44 rounded-lg border-2 bg-white shadow-sm transition-shadow ${
        selected ? 'border-purple-500 shadow-md' : 'border-purple-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <div className="rounded-t-md bg-purple-600 px-3 py-1.5">
        <p className="text-xs font-semibold text-white">Indicator</p>
      </div>
      <div className="p-2 text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Type</span>
          <span className="font-semibold text-purple-700">{String(data.indicator || 'SMA')}</span>
        </div>
        {paramStr && (
          <div className="text-gray-500 truncate" title={paramStr}>
            {paramStr}
          </div>
        )}
        {data.label && (
          <p className="truncate text-center text-gray-600 italic">{String(data.label)}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
    </div>
  )
}
