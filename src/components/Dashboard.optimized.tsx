import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ListChecks, Target, TrendUp } from '@phosphor-icons/react'
import type { TaskStats } from '@/lib/types'
import { CATEGORY_MAP } from '@/lib/constants'

interface DashboardProps {
  stats: TaskStats
}

export const Dashboard = memo(function Dashboard({ stats }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ListChecks}
          label="Total Tasks"
          value={stats.total}
          color="primary"
        />

        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={stats.completed}
          color="oklch(0.65 0.12 290)"
        />

        <StatCard
          icon={Target}
          label="Active"
          value={stats.active}
          color="accent"
        />

        <StatCard
          icon={TrendUp}
          label="Completion"
          value={`${Math.round(stats.completionRate)}%`}
          color="oklch(0.55 0.18 180)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart stats={stats} />
        <PriorityChart stats={stats} />
      </div>

      {stats.total > 0 && <OverallProgress stats={stats} />}
    </div>
  )
})

const StatCard = memo(function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: typeof ListChecks
  label: string
  value: number | string
  color: string
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <div 
          className="p-3 rounded-lg" 
          style={{ backgroundColor: `${color}/10` }}
        >
          <Icon 
            className="h-6 w-6" 
            weight="bold" 
            style={{ color }} 
          />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  )
})

const CategoryChart = memo(function CategoryChart({ stats }: { stats: TaskStats }) {
  const hasCategories = Object.keys(stats.byCategory).length > 0

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Tasks by Category</h3>
      <div className="space-y-4">
        {hasCategories ? (
          Object.entries(stats.byCategory).map(([cat, count]) => {
            const category = CATEGORY_MAP[cat as keyof typeof CATEGORY_MAP]
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
            
            return (
              <CategoryItem 
                key={cat}
                label={category.label}
                color={category.color}
                count={count}
                percentage={percentage}
              />
            )
          })
        ) : (
          <EmptyState message="No tasks yet. Create your first task to see analytics." />
        )}
      </div>
    </Card>
  )
})

const CategoryItem = memo(function CategoryItem({ 
  label, 
  color, 
  count, 
  percentage 
}: { 
  label: string
  color: string
  count: number
  percentage: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">{count} tasks</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
})

const PriorityChart = memo(function PriorityChart({ stats }: { stats: TaskStats }) {
  const hasPriorities = Object.keys(stats.byPriority).length > 0

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
      <div className="space-y-4">
        {hasPriorities ? (
          (['high', 'medium', 'low'] as const).map((pri) => {
            const count = stats.byPriority[pri] || 0
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
            
            return (
              <PriorityItem
                key={pri}
                priority={pri}
                count={count}
                percentage={percentage}
              />
            )
          })
        ) : (
          <EmptyState message="No tasks yet. Create your first task to see analytics." />
        )}
      </div>
    </Card>
  )
})

const PriorityItem = memo(function PriorityItem({ 
  priority, 
  count, 
  percentage 
}: { 
  priority: 'high' | 'medium' | 'low'
  count: number
  percentage: number
}) {
  const colors = {
    high: 'border-accent text-accent',
    medium: 'border-[oklch(0.75_0.15_75)] text-[oklch(0.75_0.15_75)]',
    low: 'border-muted-foreground text-muted-foreground',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={colors[priority]}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
        </Badge>
        <span className="text-sm text-muted-foreground">{count} tasks</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
})

const OverallProgress = memo(function OverallProgress({ stats }: { stats: TaskStats }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {stats.completed} of {stats.total} tasks completed
          </span>
          <span className="font-semibold">{Math.round(stats.completionRate)}%</span>
        </div>
        <Progress value={stats.completionRate} className="h-3" />
      </div>
    </Card>
  )
})

const EmptyState = memo(function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-muted-foreground text-center py-8">
      {message}
    </p>
  )
})
