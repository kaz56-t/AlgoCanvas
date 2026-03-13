import { Handle, Position, type NodeProps } from 'reactflow'

export function SignalNode({ data, selected }: NodeProps) {
  const action = String(data.action || 'BUY')
  const isBuy = action === 'BUY'

  return (
    <div
      className={`w-40 rounded-lg border-2 bg-white shadow-sm transition-shadow ${
        selected
          ? isBuy
            ? 'border-green-500 shadow-md'
            : 'border-red-500 shadow-md'
          : isBuy
          ? 'border-green-300'
          : 'border-red-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className={isBuy ? '!bg-green-500' : '!bg-red-500'} />
      <div className={`rounded-t-md px-3 py-1.5 ${isBuy ? 'bg-green-600' : 'bg-red-600'}`}>
        <p className="text-xs font-semibold text-white">Signal</p>
      </div>
      <div className="p-2 text-xs space-y-1">
        <div
          className={`text-center text-lg font-bold ${isBuy ? 'text-green-600' : 'text-red-600'}`}
        >
          {isBuy ? '▲ BUY' : '▼ SELL'}
        </div>
        {data.label && (
          <p className="truncate text-center text-gray-600 italic">{String(data.label)}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className={isBuy ? '!bg-green-500' : '!bg-red-500'} />
    </div>
  )
}
