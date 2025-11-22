import { CheckCircle, Circle, Trash, PencilSimple, CalendarBlank, Flag } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { Task } from '@/lib/types'
import { CATEGORY_MAP } from '@/lib/constants'
import { formatDate, isOverdue } from '@/lib/task-utils'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const category = CATEGORY_MAP[task.category]
  const isTaskOverdue = !task.completed && isOverdue(task.dueDate)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'p-4 hover:shadow-md transition-all duration-200',
          task.completed && 'opacity-60',
          task.priority === 'high' && !task.completed && 'border-l-4 border-l-accent',
          task.priority === 'medium' && !task.completed && 'border-l-4 border-l-[oklch(0.75_0.15_75)]',
          isTaskOverdue && 'border-l-4 border-l-destructive'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => onToggle(task.id)}
              className="h-5 w-5"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    'font-medium text-[15px] leading-tight mb-1',
                    task.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(task)}
                  className="h-8 w-8"
                >
                  <PencilSimple className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(task.id)}
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className="text-xs font-medium"
                style={{
                  backgroundColor: `color-mix(in oklch, ${category.color} 15%, transparent)`,
                  color: category.color,
                  borderColor: category.color,
                }}
              >
                {category.label}
              </Badge>

              {task.priority !== 'low' && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs font-medium',
                    task.priority === 'high' && 'border-accent text-accent',
                    task.priority === 'medium' && 'border-[oklch(0.75_0.15_75)] text-[oklch(0.75_0.15_75)]'
                  )}
                >
                  <Flag className="h-3 w-3 mr-1" weight="fill" />
                  {task.priority === 'high' ? 'High' : 'Medium'}
                </Badge>
              )}

              {task.dueDate && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs font-medium',
                    isTaskOverdue && 'border-destructive text-destructive bg-destructive/5'
                  )}
                >
                  <CalendarBlank className="h-3 w-3 mr-1" />
                  {formatDate(task.dueDate)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
