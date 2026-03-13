import { Handle, Position, type NodeProps } from 'reactflow'

const OPERATOR_LABELS: Record<string, string> = {
  crossover: 'Cross Over ↑',
  crossunder: 'Cross Under ↓',
  '>': 'Greater Than >',
  '<': 'Less Than <',
  '>=': '>=',
  '<=': '<=',
  '==': 'Equal ==',
}

export function ConditionNode({ data, selected }: NodeProps) {
  const op = String(data.operator || 'crossover')
  return (
    <div
      className={`w-44 rounded-lg border-2 bg-white shadow-sm transition-shadow ${
        selected ? 'border-orange-500 shadow-md' : 'border-orange-300'
      }`}
    >
      <Handle type="target" position={Position.Top} id="a" style={{ left: '30%' }} className="!bg-orange-500" />
      <Handle type="target" position={Position.Top} id="b" style={{ left: '70%' }} className="!bg-orange-500" />
      <div className="rounded-t-md bg-orange-500 px-3 py-1.5">
        <p className="text-xs font-semibold text-white">Condition</p>
      </div>
      <div className="p-2 text-xs space-y-1">
        <div className="text-center font-semibold text-orange-700">
          {OPERATOR_LABELS[op] ?? op}
        </div>
        {data.threshold !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-500">Threshold</span>
            <span className="font-medium">{String(data.threshold)}</span>
          </div>
        )}
        {data.label && (
          <p className="truncate text-center text-gray-600 italic">{String(data.label)}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
    </div>
  )
}
