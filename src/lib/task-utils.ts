import type { Task, TaskStats } from './types'

export function calculateStats(tasks: Task[]): TaskStats {
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const active = total - completed
  const completionRate = total > 0 ? (completed / total) * 100 : 0

  const byCategory = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const byPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total,
    completed,
    active,
    byCategory,
    byPriority,
    completionRate,
  }
}

export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function formatDate(date: string): string {
  const d = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (d.toDateString() === today.toDateString()) {
    return 'Today'
  }
  if (d.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  }
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
