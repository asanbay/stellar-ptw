import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { queryClient } from './lib/query-client'
import { registerServiceWorker } from './lib/pwa'

import "./main.css"

// Register service worker for PWA
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>
)
