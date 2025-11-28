import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      gcTime: 1000 * 60 * 10, // 10 минут (было cacheTime в v4)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
})

// Query keys factory для консистентности
export const queryKeys = {
  // Personnel
  personnel: {
    all: ['personnel'] as const,
    lists: () => [...queryKeys.personnel.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.personnel.lists(), { filters }] as const,
    details: () => [...queryKeys.personnel.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.personnel.details(), id] as const,
  },
  
  // Departments
  departments: {
    all: ['departments'] as const,
    lists: () => [...queryKeys.departments.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.departments.lists(), { filters }] as const,
    details: () => [...queryKeys.departments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.departments.details(), id] as const,
  },
  
  // FAQ
  faqs: {
    all: ['faqs'] as const,
    lists: () => [...queryKeys.faqs.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.faqs.lists(), { filters }] as const,
    details: () => [...queryKeys.faqs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.faqs.details(), id] as const,
  },
  
  // Permits
  permits: {
    all: ['permits'] as const,
    lists: () => [...queryKeys.permits.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.permits.lists(), { filters }] as const,
    details: () => [...queryKeys.permits.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.permits.details(), id] as const,
    byStatus: (status: string) => [...queryKeys.permits.all, 'status', status] as const,
  },
  
  // Combined Works
  combinedWorks: {
    all: ['combinedWorks'] as const,
    lists: () => [...queryKeys.combinedWorks.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.combinedWorks.lists(), { filters }] as const,
    details: () => [...queryKeys.combinedWorks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.combinedWorks.details(), id] as const,
  },
} as const
