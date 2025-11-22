import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus, ChartBar, ListChecks } from '@phosphor-icons/react'
import { AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TaskCard } from '@/components/TaskCard'
import { TaskDialog } from '@/components/TaskDialog'
import { Dashboard } from '@/components/Dashboard'
import { EmptyState } from '@/components/EmptyState'
import { FilterBar } from '@/components/FilterBar'
import type { Task, FilterStatus, Priority, Category } from '@/lib/types'
import { calculateStats } from '@/lib/task-utils'

function App() {
  const [tasks, setTasks] = useKV<Task[]>('tasks', [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')

  const allTasks = tasks || []

  const filteredTasks = useMemo(() => {
    let filtered = allTasks

    if (statusFilter === 'active') {
      filtered = filtered.filter(t => !t.completed)
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(t => t.completed)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [allTasks, statusFilter, priorityFilter, categoryFilter, searchQuery])

  const stats = useMemo(() => calculateStats(allTasks), [allTasks])

  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskData.title!,
      description: taskData.description,
      completed: false,
      priority: taskData.priority || 'medium',
      category: taskData.category || 'personal',
      dueDate: taskData.dueDate,
      createdAt: new Date().toISOString(),
    }

    setTasks((current) => [...(current || []), newTask])
    toast.success('Task created successfully')
  }

  const handleUpdateTask = (taskData: Partial<Task>) => {
    setTasks((current) =>
      (current || []).map(t =>
        t.id === taskData.id
          ? { ...t, ...taskData }
          : t
      )
    )
    toast.success('Task updated successfully')
    setEditingTask(undefined)
  }

  const handleToggleTask = (id: string) => {
    setTasks((current) =>
      (current || []).map(t =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    )
  }

  const handleDeleteTask = (id: string) => {
    setTasks((current) => (current || []).filter(t => t.id !== id))
    toast.success('Task deleted')
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setDialogOpen(true)
  }

  const handleOpenDialog = () => {
    setEditingTask(undefined)
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">TaskFlow</h1>
              <p className="text-muted-foreground">Organize your work, achieve your goals</p>
            </div>
            <Button onClick={handleOpenDialog} size="lg" className="font-semibold">
              <Plus className="mr-2 h-5 w-5" weight="bold" />
              New Task
            </Button>
          </div>
        </header>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <ChartBar className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
            />

            {filteredTasks.length === 0 && allTasks.length === 0 ? (
              <EmptyState onCreateTask={handleOpenDialog} />
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No tasks match your filters
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard stats={stats} />
          </TabsContent>
        </Tabs>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </div>
  )
}

export default App