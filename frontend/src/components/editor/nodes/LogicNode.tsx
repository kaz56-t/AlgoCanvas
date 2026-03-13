import { Handle, Position, type NodeProps } from 'reactflow'

export function LogicNode({ data, selected }: NodeProps) {
  const op = String(data.operation || 'AND')
  const color = op === 'AND' ? 'cyan' : op === 'OR' ? 'teal' : 'sky'

  const colorMap: Record<string, { border: string; header: string; text: string; handle: string }> = {
    cyan: {
      border: selected ? 'border-cyan-500 shadow-md' : 'border-cyan-300',
      header: 'bg-cyan-600',
      text: 'text-cyan-700',
      handle: '!bg-cyan-500',
    },
    teal: {
      border: selected ? 'border-teal-500 shadow-md' : 'border-teal-300',
      header: 'bg-teal-600',
      text: 'text-teal-700',
      handle: '!bg-teal-500',
    },
    sky: {
      border: selected ? 'border-sky-500 shadow-md' : 'border-sky-300',
      header: 'bg-sky-600',
      text: 'text-sky-700',
      handle: '!bg-sky-500',
    },
  }

  const c = colorMap[color]

  return (
    <div className={`w-36 rounded-lg border-2 bg-white shadow-sm transition-shadow ${c.border}`}>
      <Handle type="target" position={Position.Top} id="a" style={{ left: '30%' }} className={c.handle} />
      <Handle type="target" position={Position.Top} id="b" style={{ left: '70%' }} className={c.handle} />
      <div className={`rounded-t-md ${c.header} px-3 py-1.5`}>
        <p className="text-xs font-semibold text-white">Logic</p>
      </div>
      <div className="p-2 text-xs">
        <div className={`text-center text-2xl font-bold ${c.text}`}>{op}</div>
        {data.label && (
          <p className="truncate text-center text-gray-600 italic mt-1">{String(data.label)}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className={c.handle} />
    </div>
  )
}
