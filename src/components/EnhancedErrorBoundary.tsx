import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Warning, ArrowClockwise, House } from '@phosphor-icons/react'

const WarningIcon = Warning
const ArrowClockwiseIcon = ArrowClockwise
const HouseIcon = House

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: string | null
  attemptCount: number
}

const MAX_AUTO_RETRY = 2
const RETRY_DELAY = 1000

export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryTimer: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      attemptCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    this.setState({
      errorInfo: errorInfo.componentStack || null,
    })

    // Auto-retry для некоторых типов ошибок
    if (this.shouldAutoRetry(error) && this.state.attemptCount < MAX_AUTO_RETRY) {
      this.scheduleRetry()
    }

    // Логирование в production (можно интегрировать с Sentry, LogRocket и т.д.)
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo)
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
    }
  }

  shouldAutoRetry(error: Error): boolean {
    // Автоматический retry для сетевых ошибок
    const retryableErrors = [
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      'ChunkLoadError',
    ]
    
    return retryableErrors.some((msg) => 
      error.message.includes(msg) || error.name.includes(msg)
    )
  }

  scheduleRetry = () => {
    this.setState((prevState) => ({
      attemptCount: prevState.attemptCount + 1,
    }))

    this.retryTimer = setTimeout(() => {
      this.handleReset()
    }, RETRY_DELAY * (this.state.attemptCount + 1))
  }

  handleReset = () => {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    this.props.onReset?.()
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Интеграция с error tracking сервисом
    // Например: Sentry.captureException(error, { extra: errorInfo })
    console.error('Production error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    })
  }

  render() {
    if (this.state.hasError) {
      // Кастомный fallback от пропсов
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, attemptCount } = this.state
      const isRetrying = attemptCount > 0 && attemptCount < MAX_AUTO_RETRY

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-destructive/10 rounded-full">
                <WarningIcon className="h-12 w-12 text-destructive" weight="bold" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Что-то пошло не так</h1>
                <p className="text-muted-foreground">
                  Приложение столкнулось с неожиданной ошибкой
                </p>
              </div>

              {isRetrying && (
                <div className="w-full p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <ArrowClockwiseIcon className="h-4 w-4 animate-spin" />
                    <span className="text-sm">
                      Попытка восстановления ({attemptCount}/{MAX_AUTO_RETRY})...
                    </span>
                  </div>
                </div>
              )}

              {!import.meta.env.PROD && error && (
                <details className="w-full text-left">
                  <summary className="cursor-pointer text-sm font-medium mb-2 hover:underline">
                    Детали ошибки (только в dev режиме)
                  </summary>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-mono text-destructive break-all">
                        {error.toString()}
                      </p>
                    </div>
                    {error.stack && (
                      <div className="p-4 bg-muted rounded-lg overflow-auto max-h-48">
                        <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {errorInfo && (
                      <div className="p-4 bg-muted rounded-lg overflow-auto max-h-48">
                        <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                          {errorInfo}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  size="lg"
                  className="gap-2"
                >
                  <ArrowClockwiseIcon className="h-4 w-4" />
                  Попробовать снова
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <HouseIcon className="h-4 w-4" />
                  На главную
                </Button>

                <Button
                  onClick={this.handleReload}
                  variant="secondary"
                  size="lg"
                  className="gap-2"
                >
                  <ArrowClockwiseIcon className="h-4 w-4" />
                  Перезагрузить страницу
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Если проблема повторяется, обратитесь в службу поддержки
              </p>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Хук для программного вызова error boundary
export function useErrorHandler() {
  const throwError = (error: Error) => {
    throw error
  }

  return { throwError }
}
