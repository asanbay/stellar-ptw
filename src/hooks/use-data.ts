import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { personnelStore } from '@/stores/personnel.store'
import { departmentStore } from '@/stores/departments.store'
import { faqStore } from '@/stores/faq.store'
import { permitStore } from '@/stores/permits.store'
import { combinedWorkStore } from '@/stores/combined-work.store'
import { queryKeys } from '@/lib/query-client'
import { mapPersonnelRow, mapDepartmentRow, mapFAQRow, buildPersonnelInsert, buildPersonnelUpdate, buildDepartmentInsert, buildDepartmentUpdate, buildFAQInsert, buildFAQUpdate } from '@/lib/data-mappers'
import type { Person, Department, FAQItem } from '@/lib/ptw-types'
import type { Database } from '@/lib/database.types'

type PersonnelRow = Database['public']['Tables']['personnel']['Row']
type DepartmentRow = Database['public']['Tables']['departments']['Row']

// ============================================
// PERSONNEL HOOKS
// ============================================

export function usePersonnel() {
  return useQuery({
    queryKey: queryKeys.personnel.lists(),
    queryFn: async () => {
      const data = await personnelStore.getAll()
      return data.map(mapPersonnelRow)
    },
  })
}

export function usePersonnelById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.personnel.detail(id || ''),
    queryFn: async () => {
      if (!id) return null
      const data = await personnelStore.getById(id)
      return mapPersonnelRow(data)
    },
    enabled: !!id,
  })
}

export function useCreatePersonnel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (person: Partial<Person>) => {
      const data = await personnelStore.create(buildPersonnelInsert(person))
      return mapPersonnelRow(data)
    },
    onMutate: async (newPerson) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.personnel.lists() })
      
      // Snapshot previous value
      const previousPersonnel = queryClient.getQueryData<Person[]>(queryKeys.personnel.lists())
      
      // Optimistically update
      if (previousPersonnel) {
        const optimisticPerson: Person = {
          id: crypto.randomUUID(),
          name: newPerson.name || '',
          position: newPerson.position || '',
          role: newPerson.role || 'worker',
          email: newPerson.email,
          phone: newPerson.phone,
          departmentId: newPerson.departmentId,
          customDuties: newPerson.customDuties,
          customQualifications: newPerson.customQualifications,
        }
        queryClient.setQueryData<Person[]>(queryKeys.personnel.lists(), [...previousPersonnel, optimisticPerson])
      }
      
      return { previousPersonnel }
    },
    onError: (_err, _newPerson, context) => {
      // Rollback on error
      if (context?.previousPersonnel) {
        queryClient.setQueryData(queryKeys.personnel.lists(), context.previousPersonnel)
      }
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.personnel.lists() })
    },
  })
}

export function useUpdatePersonnel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Person> }) => {
      const updated = await personnelStore.update(id, buildPersonnelUpdate(data))
      return mapPersonnelRow(updated)
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.personnel.lists() })
      
      const previousPersonnel = queryClient.getQueryData<Person[]>(queryKeys.personnel.lists())
      
      if (previousPersonnel) {
        queryClient.setQueryData<Person[]>(
          queryKeys.personnel.lists(),
          previousPersonnel.map((p) => (p.id === id ? { ...p, ...data } : p))
        )
      }
      
      return { previousPersonnel }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPersonnel) {
        queryClient.setQueryData(queryKeys.personnel.lists(), context.previousPersonnel)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personnel.lists() })
    },
  })
}

export function useDeletePersonnel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await personnelStore.delete(id)
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.personnel.lists() })
      
      const previousPersonnel = queryClient.getQueryData<Person[]>(queryKeys.personnel.lists())
      
      if (previousPersonnel) {
        queryClient.setQueryData<Person[]>(
          queryKeys.personnel.lists(),
          previousPersonnel.filter((p) => p.id !== id)
        )
      }
      
      return { previousPersonnel }
    },
    onError: (_err, _id, context) => {
      if (context?.previousPersonnel) {
        queryClient.setQueryData(queryKeys.personnel.lists(), context.previousPersonnel)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personnel.lists() })
    },
  })
}

// ============================================
// DEPARTMENTS HOOKS
// ============================================

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.lists(),
    queryFn: async () => {
      const data = await departmentStore.getAll()
      return data.map(mapDepartmentRow)
    },
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (dept: Partial<Department>) => {
      const data = await departmentStore.create(buildDepartmentInsert(dept))
      return mapDepartmentRow(data)
    },
    onMutate: async (newDept) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.departments.lists() })
      
      const previousDepartments = queryClient.getQueryData<Department[]>(queryKeys.departments.lists())
      
      if (previousDepartments) {
        const optimisticDept: Department = {
          id: crypto.randomUUID(),
          name: newDept.name || '',
          color: newDept.color || '',
          emoji: newDept.emoji || '',
          description: newDept.description,
        }
        queryClient.setQueryData<Department[]>(queryKeys.departments.lists(), [...previousDepartments, optimisticDept])
      }
      
      return { previousDepartments }
    },
    onError: (_err, _newDept, context) => {
      if (context?.previousDepartments) {
        queryClient.setQueryData(queryKeys.departments.lists(), context.previousDepartments)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.lists() })
    },
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Department> }) => {
      const updated = await departmentStore.update(id, buildDepartmentUpdate(data))
      return mapDepartmentRow(updated)
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.departments.lists() })
      
      const previousDepartments = queryClient.getQueryData<Department[]>(queryKeys.departments.lists())
      
      if (previousDepartments) {
        queryClient.setQueryData<Department[]>(
          queryKeys.departments.lists(),
          previousDepartments.map((d) => (d.id === id ? { ...d, ...data } : d))
        )
      }
      
      return { previousDepartments }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDepartments) {
        queryClient.setQueryData(queryKeys.departments.lists(), context.previousDepartments)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.lists() })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await departmentStore.delete(id)
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.departments.lists() })
      
      const previousDepartments = queryClient.getQueryData<Department[]>(queryKeys.departments.lists())
      
      if (previousDepartments) {
        queryClient.setQueryData<Department[]>(
          queryKeys.departments.lists(),
          previousDepartments.filter((d) => d.id !== id)
        )
      }
      
      return { previousDepartments }
    },
    onError: (_err, _id, context) => {
      if (context?.previousDepartments) {
        queryClient.setQueryData(queryKeys.departments.lists(), context.previousDepartments)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.lists() })
    },
  })
}

// ============================================
// FAQ HOOKS
// ============================================

export function useFAQs() {
  return useQuery({
    queryKey: queryKeys.faqs.lists(),
    queryFn: async () => {
      const data = await faqStore.getAll()
      return data.map(mapFAQRow).sort((a, b) => a.order - b.order)
    },
  })
}

export function useCreateFAQ() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (faq: Partial<FAQItem>) => {
      const data = await faqStore.create(buildFAQInsert(faq))
      return mapFAQRow(data)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.lists() })
    },
  })
}

export function useUpdateFAQ() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FAQItem> }) => {
      const updated = await faqStore.update(id, buildFAQUpdate(data))
      return mapFAQRow(updated)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.lists() })
    },
  })
}

export function useDeleteFAQ() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await faqStore.delete(id)
      return id
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.lists() })
    },
  })
}

// ============================================
// PERMITS HOOKS
// ============================================

export function usePermits() {
  return useQuery({
    queryKey: queryKeys.permits.lists(),
    queryFn: () => permitStore.getAll(),
  })
}

export function usePermitById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.permits.detail(id || ''),
    queryFn: () => permitStore.getById(id!),
    enabled: !!id,
  })
}

export function usePermitsByStatus(status: 'draft' | 'active' | 'completed' | 'cancelled') {
  return useQuery({
    queryKey: queryKeys.permits.byStatus(status),
    queryFn: () => permitStore.getByStatus(status),
  })
}

// ============================================
// COMBINED WORKS HOOKS
// ============================================

export function useCombinedWorks() {
  return useQuery({
    queryKey: queryKeys.combinedWorks.lists(),
    queryFn: () => combinedWorkStore.getAll(),
  })
}

export function useCombinedWorkById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.combinedWorks.detail(id || ''),
    queryFn: async () => {
      if (!id) return null
      const allWorks = await combinedWorkStore.getAll()
      return allWorks.find((w) => w.id === id) || null
    },
    enabled: !!id,
  })
}
