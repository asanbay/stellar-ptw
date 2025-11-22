export type Priority = 'low' | 'medium' | 'high'
export type Category = 'work' | 'personal' | 'health' | 'learning' | 'other'
export type FilterStatus = 'all' | 'active' | 'completed'

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: Priority
  category: Category
  dueDate?: string
  createdAt: string
  completedAt?: string
}

export interface TaskStats {
  total: number
  completed: number
  active: number
  byCategory: Record<Category, number>
  byPriority: Record<Priority, number>
  completionRate: number
}
