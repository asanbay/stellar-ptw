import { useState } from 'react'
import { useKV } from './use-kv'
import { generateId } from '@/lib/utils'

export interface PTWTemplate {
  id: string
  name: string
  workType: string
  description: string
  hazards: string[]
  safetyMeasures: string[]
  equipmentRequired: string[]
  estimatedDuration: number // hours
  createdAt: string
  createdBy: string
  useCount: number
}

export function usePTWTemplates() {
  const [templates, setTemplates] = useKV<PTWTemplate[]>('ptw-templates', [])
  const [loading, setLoading] = useState(false)

  const createTemplate = (template: Omit<PTWTemplate, 'id' | 'createdAt' | 'useCount'>) => {
    const newTemplate: PTWTemplate = {
      ...template,
      id: generateId(),
      createdAt: new Date().toISOString(),
      useCount: 0,
    }
    setTemplates([...templates, newTemplate])
    return newTemplate
  }

  const updateTemplate = (id: string, updates: Partial<PTWTemplate>) => {
    setTemplates(templates.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id))
  }

  const useTemplate = (id: string) => {
    setTemplates(
      templates.map((t) =>
        t.id === id ? { ...t, useCount: t.useCount + 1 } : t
      )
    )
    return templates.find((t) => t.id === id)
  }

  const getPopularTemplates = (limit = 5) => {
    return [...templates]
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, limit)
  }

  const searchTemplates = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.workType.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery)
    )
  }

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    getPopularTemplates,
    searchTemplates,
  }
}
