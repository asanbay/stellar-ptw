import { useState, useCallback, useEffect } from 'react'
import { stellarAI } from '@/lib/ai'
import type { Language, Person } from '@/lib/ptw-types'
import type {
  RiskAssessment,
  DataQualityReport,
  PersonnelRecommendation,
  TeamSuggestion,
  Suggestion,
  ComprehensiveAnalysis,
} from '@/lib/ai'
import { useDebounce } from './use-utils'

/**
 * Хук для анализа рисков в реальном времени
 */
export function useRiskAnalysis(
  workDescription: string,
  language: Language = 'ru',
  debounceMs = 500
) {
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const debouncedDescription = useDebounce(workDescription, debounceMs)

  useEffect(() => {
    if (!debouncedDescription || debouncedDescription.length < 5) {
      setRiskAssessment(null)
      return
    }

    setIsAnalyzing(true)
    
    // Симуляция небольшой задержки для более плавного UX
    const timer = setTimeout(() => {
      const assessment = stellarAI.quickRiskCheck(debouncedDescription, language)
      setRiskAssessment(assessment)
      setIsAnalyzing(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [debouncedDescription, language])

  return { riskAssessment, isAnalyzing }
}

/**
 * Хук для валидации данных в реальном времени
 */
export function useDataValidation(
  data: any,
  type: 'permit' | 'personnel',
  language: Language = 'ru',
  enabled = true
) {
  const [validation, setValidation] = useState<DataQualityReport | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    if (!enabled || !data) {
      setValidation(null)
      return
    }

    setIsValidating(true)
    
    const timer = setTimeout(() => {
      const result = stellarAI.validateData(data, type, language)
      setValidation(result)
      setIsValidating(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [data, type, language, enabled])

  return { validation, isValidating }
}

/**
 * Хук для умных подсказок
 */
export function useSmartSuggestions(
  partialText: string,
  field: 'description' | 'location' | 'workType' = 'description',
  debounceMs = 300
) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const debouncedText = useDebounce(partialText, debounceMs)

  useEffect(() => {
    if (!debouncedText || debouncedText.length < 2) {
      setSuggestions([])
      return
    }

    const results = (stellarAI as any).smartSuggestions.getSuggestions(debouncedText, field, 5)
    setSuggestions(results)
  }, [debouncedText, field])

  return suggestions
}

/**
 * Хук для автодополнения на основе описания
 */
export function useAutoComplete(
  workDescription: string,
  language: Language = 'ru',
  debounceMs = 500
) {
  const [autoComplete, setAutoComplete] = useState<{
    duration?: number
    requiredPPE: string[]
    safetyMeasures: string[]
    workers?: number
    confidence: number
  } | null>(null)
  
  const debouncedDescription = useDebounce(workDescription, debounceMs)

  useEffect(() => {
    if (!debouncedDescription || debouncedDescription.length < 5) {
      setAutoComplete(null)
      return
    }

    const result = (stellarAI as any).smartSuggestions.autocomplete(debouncedDescription, language)
    setAutoComplete(result)
  }, [debouncedDescription, language])

  return autoComplete
}

/**
 * Хук для подбора персонала
 */
export function usePersonnelRecommendations(
  workDescription: string,
  allPersonnel: Person[],
  options?: {
    role?: 'issuer' | 'supervisor' | 'foreman' | 'worker'
    department?: string
    language?: Language
  }
) {
  const [recommendations, setRecommendations] = useState<PersonnelRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const debouncedDescription = useDebounce(workDescription, 500)

  useEffect(() => {
    if (!debouncedDescription || debouncedDescription.length < 5 || allPersonnel.length === 0) {
      setRecommendations([])
      return
    }

    setIsLoading(true)
    
    const timer = setTimeout(() => {
      const results = stellarAI.findPersonnel(debouncedDescription, allPersonnel, options)
      setRecommendations(results)
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [debouncedDescription, allPersonnel, options?.role, options?.department, options?.language])

  return { recommendations, isLoading }
}

/**
 * Хук для формирования команды
 */
export function useTeamBuilder(
  workDescription: string,
  allPersonnel: Person[],
  teamSize = 5,
  language: Language = 'ru'
) {
  const [teamSuggestion, setTeamSuggestion] = useState<TeamSuggestion | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)

  const build = useCallback(() => {
    if (!workDescription || workDescription.length < 5 || allPersonnel.length === 0) {
      return
    }

    setIsBuilding(true)
    
    setTimeout(() => {
      const team = stellarAI.buildTeam(workDescription, allPersonnel, teamSize, language)
      setTeamSuggestion(team)
      setIsBuilding(false)
    }, 100)
  }, [workDescription, allPersonnel, teamSize, language])

  return { teamSuggestion, isBuilding, buildTeam: build }
}

/**
 * Комплексный хук для полного AI анализа
 */
export function useComprehensiveAnalysis(
  permitData: {
    work_description: string
    location?: string
    work_type?: string
    start_date?: string
    end_date?: string
    responsible_person_id?: string
    required_ppe?: string[]
    safety_measures?: string[]
  },
  options?: {
    language?: Language
    allPersonnel?: Person[]
    requiredRole?: 'issuer' | 'supervisor' | 'foreman' | 'worker'
    teamSize?: number
    enabled?: boolean
  }
) {
  const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const debouncedDescription = useDebounce(permitData.work_description, 500)

  useEffect(() => {
    if (options?.enabled === false) return
    
    if (!debouncedDescription || debouncedDescription.length < 5) {
      setAnalysis(null)
      return
    }

    setIsAnalyzing(true)
    
    const timer = setTimeout(() => {
      const result = stellarAI.analyzePermit(
        { ...permitData, work_description: debouncedDescription },
        options
      )
      setAnalysis(result)
      setIsAnalyzing(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [
    debouncedDescription,
    permitData.location,
    permitData.work_type,
    options?.language,
    options?.enabled,
  ])

  return { analysis, isAnalyzing }
}

/**
 * Хук для обучения AI на основе выполненных работ
 */
export function useAILearning() {
  const learn = useCallback((workData: {
    workType?: string
    description: string
    location?: string
    duration?: number
    requiredPPE?: string[]
    safetyMeasures?: string[]
    workers?: number
  }) => {
    stellarAI.learnFromWork(workData)
  }, [])

  const getStats = useCallback(() => {
    return stellarAI.getStats()
  }, [])

  const exportLearning = useCallback(() => {
    return stellarAI.exportLearning()
  }, [])

  const importLearning = useCallback((data: { templates: any[] }) => {
    stellarAI.importLearning(data)
  }, [])

  return {
    learn,
    getStats,
    exportLearning,
    importLearning,
  }
}

/**
 * Хук для AI статистики
 */
export function useAIStats() {
  const [stats, setStats] = useState<ReturnType<typeof stellarAI.getStats> | null>(null)

  useEffect(() => {
    const data = stellarAI.getStats()
    setStats(data)
  }, [])

  const refresh = useCallback(() => {
    const data = stellarAI.getStats()
    setStats(data)
  }, [])

  return { stats, refresh }
}
