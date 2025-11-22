import { CheckCircle, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onCreateTask: () => void
}

export function EmptyState({ onCreateTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-primary" weight="duotone" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkle className="w-8 h-8 text-accent" weight="fill" />
        </div>
      </div>
      
      <h3 className="text-2xl font-semibold mb-2">Your task list is empty</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Start your productivity journey by creating your first task. Break down your goals into actionable items.
      </p>
      
      <Button onClick={onCreateTask} size="lg" className="font-semibold">
        Create Your First Task
      </Button>
    </div>
  )
}
