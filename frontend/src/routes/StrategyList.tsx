import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStrategyStore } from '@/store/strategyStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Plus, Trash2, Pencil } from 'lucide-react'

export function StrategyList() {
  const { strategies, loading, error, fetchStrategies, createStrategy, deleteStrategy } =
    useStrategyStore()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    fetchStrategies()
  }, [fetchStrategies])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createStrategy({ name: newName.trim() })
      setNewName('')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete strategy "${name}"?`)) return
    await deleteStrategy(id)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Create form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Strategy name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={creating}
            />
            <Button type="submit" disabled={creating || !newName.trim()} size="sm">
              <Plus size={16} />
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex h-32 items-center justify-center">
          <LoadingSpinner />
        </div>
      )}

      {/* List */}
      {!loading && strategies.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          No strategies yet. Create one above.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {strategies.map((s) => (
          <Card key={s.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold leading-tight">{s.name}</CardTitle>
                <div className="flex shrink-0 gap-1">
                  <Link to={`/strategies/${s.id}`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Pencil size={14} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(s.id, s.name)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              {s.description && (
                <CardDescription className="text-xs">{s.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {s.tags && (
                <div className="flex flex-wrap gap-1">
                  {s.tags.split(',').map((t) => (
                    <Badge key={t.trim()} variant="secondary" className="text-xs">
                      {t.trim()}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(s.updated_at).toLocaleDateString('ja-JP')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
