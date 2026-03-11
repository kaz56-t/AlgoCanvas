export interface StrategyNode {
  id: string
  type: string
  data: Record<string, unknown>
  position: { x: number; y: number }
}

export interface StrategyEdge {
  id: string
  source: string
  target: string
}

export interface StrategyDefinition {
  nodes: StrategyNode[]
  edges: StrategyEdge[]
}

export interface Strategy {
  id: number
  name: string
  description: string | null
  tags: string | null
  definition: StrategyDefinition
  created_at: string
  updated_at: string
}

export interface StrategyCreate {
  name: string
  description?: string | null
  tags?: string | null
  definition?: StrategyDefinition
}

export interface StrategyUpdate {
  name?: string
  description?: string | null
  tags?: string | null
  definition?: StrategyDefinition
}
