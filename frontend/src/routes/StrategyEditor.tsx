import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { strategiesApi } from '@/api/strategies'
import { NodeConfigPanel } from '@/components/editor/NodeConfigPanel'
import { NodePalette } from '@/components/editor/NodePalette'
import { DataSourceNode } from '@/components/editor/nodes/DataSourceNode'
import { IndicatorNode } from '@/components/editor/nodes/IndicatorNode'
import { ConditionNode } from '@/components/editor/nodes/ConditionNode'
import { LogicNode } from '@/components/editor/nodes/LogicNode'
import { SignalNode } from '@/components/editor/nodes/SignalNode'
import { RiskControlNode } from '@/components/editor/nodes/RiskControlNode'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { Strategy } from '@/types/strategy'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'

const nodeTypes = {
  DataSource: DataSourceNode,
  Indicator: IndicatorNode,
  Condition: ConditionNode,
  Logic: LogicNode,
  Signal: SignalNode,
  RiskControl: RiskControlNode,
}

let nodeIdCounter = 1
const getNewId = () => `node_${Date.now()}_${nodeIdCounter++}`

function StrategyEditorInner({ strategy }: { strategy: Strategy }) {
  const navigate = useNavigate()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)
  const { project } = useReactFlow()

  // Convert backend StrategyNode[] → ReactFlow Node[]
  const toFlowNodes = (nodes: Strategy['definition']['nodes']): Node[] =>
    nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position ?? { x: Math.random() * 400, y: Math.random() * 300 },
      data: { ...n.data },
    }))

  // Convert backend StrategyEdge[] → ReactFlow Edge[]
  const toFlowEdges = (edges: Strategy['definition']['edges']): Edge[] =>
    edges.map((e, i) => ({
      id: e.id ?? `edge_${i}`,
      source: e.source,
      target: e.target,
    }))

  const [nodes, setNodes, onNodesChange] = useNodesState(toFlowNodes(strategy.definition.nodes ?? []))
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(strategy.definition.edges ?? []))
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(strategy.name)
  const [description, setDescription] = useState(strategy.description ?? '')

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      if (!reactFlowWrapper.current || !rfInstance) return

      const nodeType = event.dataTransfer.getData('application/reactflow-type')
      const defaultDataStr = event.dataTransfer.getData('application/reactflow-data')
      if (!nodeType) return

      const defaultData = defaultDataStr ? JSON.parse(defaultDataStr) : {}
      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })

      const newNode: Node = {
        id: getNewId(),
        type: nodeType,
        position,
        data: { ...defaultData },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [rfInstance, project, setNodes],
  )

  const handleDragStart = (
    event: React.DragEvent,
    nodeType: string,
    defaultData: Record<string, unknown>,
  ) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType)
    event.dataTransfer.setData('application/reactflow-data', JSON.stringify(defaultData))
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleNodeUpdate = useCallback((id: string, newData: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: newData } : n)),
    )
    setSelectedNode((prev) => (prev?.id === id ? { ...prev, data: newData } : prev))
  }, [setNodes])

  const handleNodeDelete = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id))
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
    setSelectedNode(null)
  }, [setNodes, setEdges])

  const handleSave = async () => {
    setSaving(true)
    try {
      const definition = {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type ?? '',
          data: n.data as Record<string, unknown>,
          position: n.position,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
        })),
      }
      await strategiesApi.update(strategy.id, { name, description: description || null, definition })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-2">
        <button
          onClick={() => navigate('/strategies')}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="h-5 w-px bg-gray-200" />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="Strategy name"
        />

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-64 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-gray-500 transition-colors hover:border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="Description (optional)"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            saved
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle size={15} />
              Saved
            </>
          ) : (
            <>
              <Save size={15} />
              {saving ? 'Saving…' : 'Save'}
            </>
          )}
        </button>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 overflow-hidden">
        <NodePalette onDragStart={handleDragStart} />

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={setRfInstance}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode="Delete"
            className="bg-gray-100"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#d1d5db" />
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                switch (n.type) {
                  case 'DataSource': return '#3b82f6'
                  case 'Indicator': return '#8b5cf6'
                  case 'Condition': return '#f59e0b'
                  case 'Logic': return '#06b6d4'
                  case 'Signal': return '#22c55e'
                  case 'RiskControl': return '#eab308'
                  default: return '#94a3b8'
                }
              }}
              className="!border !border-gray-200"
            />
          </ReactFlow>
        </div>

        <NodeConfigPanel
          node={selectedNode}
          onUpdate={handleNodeUpdate}
          onDelete={handleNodeDelete}
        />
      </div>
    </div>
  )
}

export function StrategyEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    strategiesApi
      .get(parseInt(id))
      .then(setStrategy)
      .catch(() => setError('Strategy not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !strategy) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-red-600">{error ?? 'Strategy not found'}</p>
        <button
          onClick={() => navigate('/strategies')}
          className="text-sm text-blue-600 hover:underline"
        >
          Back to Strategies
        </button>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <StrategyEditorInner strategy={strategy} />
    </ReactFlowProvider>
  )
}

// Re-export ReactFlowProvider for the wrapper
import { ReactFlowProvider } from 'reactflow'
