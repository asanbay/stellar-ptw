import type { Language } from '../ptw-types'

export interface Suggestion {
  field: string
  value: string
  confidence: number
  reason?: string
}

export interface WorkTemplate {
  workType: string
  description: string
  location?: string
  duration?: number // минут
  requiredPPE: string[]
  safetyMeasures: string[]
  workers?: number
  frequency: number // сколько раз использовался
}

/**
 * AI система умных подсказок на основе истории работ
 */
export class SmartSuggestions {
  private templates: WorkTemplate[] = []
  private maxTemplates = 100

  /**
   * Обучение на основе выполненных работ
   */
  learn(workData: {
    workType?: string
    description: string
    location?: string
    duration?: number
    requiredPPE?: string[]
    safetyMeasures?: string[]
    workers?: number
  }): void {
    const normalized = this.normalizeText(workData.description)
    
    // Ищем похожий шаблон
    const existing = this.templates.find(
      (t) => this.normalizeText(t.description) === normalized ||
             this.calculateSimilarity(t.description, workData.description) > 0.8
    )

    if (existing) {
      // Увеличиваем частоту использования
      existing.frequency++
      // Обновляем данные если есть новая информация
      if (workData.duration) existing.duration = workData.duration
      if (workData.requiredPPE) existing.requiredPPE = [...new Set([...existing.requiredPPE, ...workData.requiredPPE])]
      if (workData.safetyMeasures) existing.safetyMeasures = [...new Set([...existing.safetyMeasures, ...workData.safetyMeasures])]
    } else {
      // Создаем новый шаблон
      const newTemplate: WorkTemplate = {
        workType: workData.workType || 'general',
        description: workData.description,
        location: workData.location,
        duration: workData.duration,
        requiredPPE: workData.requiredPPE || [],
        safetyMeasures: workData.safetyMeasures || [],
        workers: workData.workers,
        frequency: 1,
      }

      this.templates.push(newTemplate)

      // Ограничиваем количество шаблонов
      if (this.templates.length > this.maxTemplates) {
        // Удаляем наименее используемые
        this.templates.sort((a, b) => b.frequency - a.frequency)
        this.templates = this.templates.slice(0, this.maxTemplates)
      }
    }
  }

  /**
   * Получение подсказок на основе частичного ввода
   */
  getSuggestions(
    partialText: string,
    field: 'description' | 'location' | 'workType' = 'description',
    limit = 5
  ): Suggestion[] {
    if (!partialText || partialText.length < 2) return []

    const normalized = this.normalizeText(partialText)
    
    const suggestions = this.templates
      .map((template) => {
        const fieldValue = template[field] || template.description
        const similarity = this.calculateSimilarity(normalized, this.normalizeText(fieldValue))
        
        return {
          template,
          similarity,
          field,
        }
      })
      .filter((s) => s.similarity > 0.3)
      .sort((a, b) => {
        // Сортируем по частоте и похожести
        const scoreA = a.similarity * (1 + Math.log(a.template.frequency))
        const scoreB = b.similarity * (1 + Math.log(b.template.frequency))
        return scoreB - scoreA
      })
      .slice(0, limit)
      .map((s) => ({
        field,
        value: s.template[field] || s.template.description,
        confidence: s.similarity,
        reason: `Использовано ${s.template.frequency} раз`,
      }))

    return suggestions
  }

  /**
   * Автодополнение на основе похожих работ
   */
  autocomplete(workDescription: string, language: Language = 'ru'): {
    duration?: number
    requiredPPE: string[]
    safetyMeasures: string[]
    workers?: number
    confidence: number
  } {
    if (!workDescription || workDescription.length < 5) {
      return {
        requiredPPE: [],
        safetyMeasures: [],
        confidence: 0,
      }
    }

    // Находим наиболее похожий шаблон
    const matches = this.templates
      .map((template) => ({
        template,
        similarity: this.calculateSimilarity(
          this.normalizeText(workDescription),
          this.normalizeText(template.description)
        ),
      }))
      .filter((m) => m.similarity > 0.4)
      .sort((a, b) => {
        const scoreA = a.similarity * (1 + Math.log(a.template.frequency))
        const scoreB = b.similarity * (1 + Math.log(b.template.frequency))
        return scoreB - scoreA
      })

    if (matches.length === 0) {
      return {
        requiredPPE: [],
        safetyMeasures: [],
        confidence: 0,
      }
    }

    // Используем top 3 совпадения
    const topMatches = matches.slice(0, 3)
    const totalSimilarity = topMatches.reduce((sum, m) => sum + m.similarity, 0)
    
    // Собираем данные со взвешиванием по похожести
    const requiredPPE = new Set<string>()
    const safetyMeasures = new Set<string>()
    let avgDuration = 0
    let avgWorkers = 0
    let countWithDuration = 0
    let countWithWorkers = 0

    topMatches.forEach(({ template, similarity }) => {
      template.requiredPPE.forEach((ppe) => requiredPPE.add(ppe))
      template.safetyMeasures.forEach((measure) => safetyMeasures.add(measure))
      
      if (template.duration) {
        avgDuration += template.duration * similarity
        countWithDuration++
      }
      if (template.workers) {
        avgWorkers += template.workers * similarity
        countWithWorkers++
      }
    })

    return {
      duration: countWithDuration > 0 ? Math.round(avgDuration / countWithDuration) : undefined,
      requiredPPE: Array.from(requiredPPE),
      safetyMeasures: Array.from(safetyMeasures),
      workers: countWithWorkers > 0 ? Math.round(avgWorkers / countWithWorkers) : undefined,
      confidence: totalSimilarity / topMatches.length,
    }
  }

  /**
   * Получение популярных шаблонов
   */
  getPopularTemplates(limit = 10): WorkTemplate[] {
    return [...this.templates]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit)
  }

  /**
   * Поиск похожих работ
   */
  findSimilar(description: string, limit = 5): WorkTemplate[] {
    const normalized = this.normalizeText(description)
    
    return this.templates
      .map((template) => ({
        template,
        similarity: this.calculateSimilarity(normalized, this.normalizeText(template.description)),
      }))
      .filter((m) => m.similarity > 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((m) => m.template)
  }

  /**
   * Нормализация текста для сравнения
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\wа-яё\s]/gi, '')
      .replace(/\s+/g, ' ')
  }

  /**
   * Расчет похожести текстов (алгоритм Жаккара)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(' ').filter((w) => w.length > 2))
    const words2 = new Set(text2.split(' ').filter((w) => w.length > 2))

    if (words1.size === 0 || words2.size === 0) return 0

    const intersection = new Set([...words1].filter((w) => words2.has(w)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size
  }

  /**
   * Экспорт шаблонов
   */
  exportTemplates(): WorkTemplate[] {
    return this.templates
  }

  /**
   * Импорт шаблонов
   */
  importTemplates(templates: WorkTemplate[]): void {
    this.templates = templates
  }

  /**
   * Очистка шаблонов
   */
  clear(): void {
    this.templates = []
  }

  /**
   * Статистика
   */
  getStats(): {
    totalTemplates: number
    totalUsage: number
    averageFrequency: number
    mostPopular?: WorkTemplate
  } {
    const totalUsage = this.templates.reduce((sum, t) => sum + t.frequency, 0)
    const mostPopular = this.templates.length > 0
      ? [...this.templates].sort((a, b) => b.frequency - a.frequency)[0]
      : undefined

    return {
      totalTemplates: this.templates.length,
      totalUsage,
      averageFrequency: this.templates.length > 0 ? totalUsage / this.templates.length : 0,
      mostPopular,
    }
  }
}

// Singleton instance
export const smartSuggestions = new SmartSuggestions()
