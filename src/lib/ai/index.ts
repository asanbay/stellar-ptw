/**
 * Централизованный AI модуль для Stellar PTW
 * Объединяет все интеллектуальные функции системы
 */

export { riskAnalyzer, RiskAnalyzer } from './risk-analyzer'
export type { RiskAssessment, RiskLevel } from './risk-analyzer'

export { smartSuggestions, SmartSuggestions } from './smart-suggestions'
export type { Suggestion, WorkTemplate } from './smart-suggestions'

export { personnelMatcher, PersonnelMatcher } from './personnel-matcher'
export type { PersonnelRecommendation, TeamSuggestion } from './personnel-matcher'

export { anomalyDetector, AnomalyDetector } from './anomaly-detector'
export type { Anomaly, DataQualityReport } from './anomaly-detector'

import { riskAnalyzer } from './risk-analyzer'
import { smartSuggestions } from './smart-suggestions'
import { personnelMatcher } from './personnel-matcher'
import { anomalyDetector } from './anomaly-detector'
import type { Language, Person } from '../ptw-types'
import type { RiskAssessment } from './risk-analyzer'
import type { DataQualityReport } from './anomaly-detector'
import type { PersonnelRecommendation, TeamSuggestion } from './personnel-matcher'

/**
 * Объединенный результат AI анализа
 */
export interface ComprehensiveAnalysis {
  riskAssessment: RiskAssessment
  dataQuality: DataQualityReport
  suggestions: {
    duration?: number
    requiredPPE: string[]
    safetyMeasures: string[]
    workers?: number
    confidence: number
  }
  personnelRecommendations?: PersonnelRecommendation[]
  teamSuggestion?: TeamSuggestion | null
}

/**
 * Главный AI ассистент
 */
export class StellarAI {
  /**
   * Комплексный анализ наряда-допуска
   */
  analyzePermit(permitData: {
    work_description: string
    location?: string
    work_type?: string
    start_date?: string
    end_date?: string
    responsible_person_id?: string
    required_ppe?: string[]
    safety_measures?: string[]
  }, options?: {
    language?: Language
    allPersonnel?: Person[]
    requiredRole?: 'issuer' | 'supervisor' | 'foreman' | 'worker'
    teamSize?: number
  }): ComprehensiveAnalysis {
    const language = options?.language || 'ru'
    
    // 1. Анализ рисков
    const riskAssessment = riskAnalyzer.analyze(
      permitData.work_description,
      permitData.work_type,
      permitData.location,
      language
    )

    // 2. Проверка качества данных
    const dataQuality = anomalyDetector.checkPermitData(permitData, language)

    // 3. Умные подсказки
    const suggestions = smartSuggestions.autocomplete(
      permitData.work_description,
      language
    )

    // 4. Подбор персонала (если доступен список)
    let personnelRecommendations: PersonnelRecommendation[] | undefined
    let teamSuggestion: TeamSuggestion | null | undefined

    if (options?.allPersonnel && options.allPersonnel.length > 0) {
      personnelRecommendations = personnelMatcher.findSuitablePersonnel(
        permitData.work_description,
        options.requiredRole,
        riskAssessment.requiredPPE,
        undefined,
        options.allPersonnel,
        language
      )

      if (options.teamSize) {
        const requiredRoles: ('issuer' | 'supervisor' | 'foreman' | 'worker')[] = []
        if (riskAssessment.level === 'critical' || riskAssessment.level === 'high') {
          requiredRoles.push('supervisor', 'foreman')
        }
        requiredRoles.push('worker')

        teamSuggestion = personnelMatcher.suggestTeam(
          permitData.work_description,
          requiredRoles,
          options.allPersonnel,
          options.teamSize,
          language
        )
      }
    }

    return {
      riskAssessment,
      dataQuality,
      suggestions,
      personnelRecommendations,
      teamSuggestion,
    }
  }

  /**
   * Быстрый анализ только рисков
   */
  quickRiskCheck(workDescription: string, language: Language = 'ru'): RiskAssessment {
    return riskAnalyzer.analyze(workDescription, undefined, undefined, language)
  }

  /**
   * Обучение на основе выполненных работ
   */
  learnFromWork(workData: {
    workType?: string
    description: string
    location?: string
    duration?: number
    requiredPPE?: string[]
    safetyMeasures?: string[]
    workers?: number
  }): void {
    smartSuggestions.learn(workData)
  }

  /**
   * Поиск подходящего персонала
   */
  findPersonnel(
    workDescription: string,
    allPersonnel: Person[],
    options?: {
      role?: 'issuer' | 'supervisor' | 'foreman' | 'worker'
      department?: string
      language?: Language
    }
  ): PersonnelRecommendation[] {
    return personnelMatcher.findSuitablePersonnel(
      workDescription,
      options?.role,
      undefined,
      options?.department,
      allPersonnel,
      options?.language || 'ru'
    )
  }

  /**
   * Формирование команды
   */
  buildTeam(
    workDescription: string,
    allPersonnel: Person[],
    teamSize = 5,
    language: Language = 'ru'
  ): TeamSuggestion | null {
    const risk = riskAnalyzer.analyze(workDescription, undefined, undefined, language)
    const requiredRoles: ('issuer' | 'supervisor' | 'foreman' | 'worker')[] = []

    // Определяем необходимые роли на основе риска
    if (risk.level === 'critical') {
      requiredRoles.push('issuer', 'supervisor', 'foreman')
    } else if (risk.level === 'high') {
      requiredRoles.push('supervisor', 'foreman')
    } else {
      requiredRoles.push('foreman')
    }
    requiredRoles.push('worker')

    return personnelMatcher.suggestTeam(
      workDescription,
      requiredRoles,
      allPersonnel,
      teamSize,
      language
    )
  }

  /**
   * Валидация данных
   */
  validateData(data: any, type: 'permit' | 'personnel', language: Language = 'ru'): DataQualityReport {
    if (type === 'permit') {
      return anomalyDetector.checkPermitData(data, language)
    } else {
      return anomalyDetector.checkPersonnelData(data, language)
    }
  }

  /**
   * Получение статистики AI системы
   */
  getStats() {
    return {
      suggestions: smartSuggestions.getStats(),
      popularTemplates: smartSuggestions.getPopularTemplates(5),
    }
  }

  /**
   * Экспорт обученных данных
   */
  exportLearning() {
    return {
      templates: smartSuggestions.exportTemplates(),
      version: '1.0.0',
      exportDate: new Date().toISOString(),
    }
  }

  /**
   * Импорт обученных данных
   */
  importLearning(data: { templates: any[] }) {
    if (data.templates) {
      smartSuggestions.importTemplates(data.templates)
    }
  }
}

// Singleton instance
export const stellarAI = new StellarAI()

// Singleton instances are already exported above
