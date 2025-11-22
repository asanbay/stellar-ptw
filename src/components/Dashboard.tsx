import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ListChecks, Target, TrendUp } from '@phosphor-icons/react'
import type { TaskStats } from '@/lib/types'
import { CATEGORY_MAP } from '@/lib/constants'

interface DashboardProps {
  stats: TaskStats
}

export function Dashboard({ stats }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <ListChecks className="h-6 w-6 text-primary" weight="bold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[oklch(0.65_0.12_290)]/10">
              <CheckCircle className="h-6 w-6" weight="bold" style={{ color: 'oklch(0.65 0.12 290)' }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent/10">
              <Target className="h-6 w-6 text-accent" weight="bold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[oklch(0.55_0.18_180)]/10">
              <TrendUp className="h-6 w-6" weight="bold" style={{ color: 'oklch(0.55 0.18 180)' }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="text-2xl font-bold">{Math.round(stats.completionRate)}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tasks by Category</h3>
          <div className="space-y-4">
            {Object.entries(stats.byCategory).length > 0 ? (
              Object.entries(stats.byCategory).map(([cat, count]) => {
                const category = CATEGORY_MAP[cat as keyof typeof CATEGORY_MAP]
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium">{category.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count} tasks</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tasks yet. Create your first task to see analytics.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <div className="space-y-4">
            {Object.entries(stats.byPriority).length > 0 ? (
              <>
                {(['high', 'medium', 'low'] as const).map((pri) => {
                  const count = stats.byPriority[pri] || 0
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                  
                  return (
                    <div key={pri} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={
                            pri === 'high'
                              ? 'border-accent text-accent'
                              : pri === 'medium'
                              ? 'border-[oklch(0.75_0.15_75)] text-[oklch(0.75_0.15_75)]'
                              : 'border-muted-foreground text-muted-foreground'
                          }
                        >
                          {pri.charAt(0).toUpperCase() + pri.slice(1)} Priority
                        </Badge>
                        <span className="text-sm text-muted-foreground">{count} tasks</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tasks yet. Create your first task to see analytics.
              </p>
            )}
          </div>
        </Card>
      </div>

      {stats.total > 0 && (
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
      )}
    </div>
  )
}
