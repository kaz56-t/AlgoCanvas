import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, FlaskConical, BarChart2, MessageSquare, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  phase: number
  enabled: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} />, phase: 1, enabled: true },
  { to: '/strategies', label: 'Strategies', icon: <BookOpen size={18} />, phase: 3, enabled: true },
  { to: '/backtests/run', label: 'Backtest', icon: <FlaskConical size={18} />, phase: 4, enabled: false },
  { to: '/backtests/results', label: 'Results', icon: <BarChart2 size={18} />, phase: 4, enabled: false },
  { to: '/nl-generator', label: 'NL Generator', icon: <MessageSquare size={18} />, phase: 5, enabled: false },
  { to: '/market-data', label: 'Market Data', icon: <Database size={18} />, phase: 2, enabled: false },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6">
        <span className="text-lg font-bold tracking-tight text-primary">AlgoCanvas</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) =>
          item.enabled ? (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ) : (
            <span
              key={item.to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/40 cursor-not-allowed select-none"
              title={`Phase ${item.phase}`}
            >
              {item.icon}
              {item.label}
              <span className="ml-auto text-xs opacity-60">Ph{item.phase}</span>
            </span>
          ),
        )}
      </nav>

      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">Phase 1 — Layout</p>
      </div>
    </aside>
  )
}
