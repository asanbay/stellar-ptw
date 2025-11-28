import type { Language } from '../ptw-types'

export interface Anomaly {
  field: string
  value: any
  severity: 'low' | 'medium' | 'high'
  reason: string
  suggestion?: string
}

export interface DataQualityReport {
  isValid: boolean
  score: number // 0-100
  anomalies: Anomaly[]
  warnings: string[]
  recommendations: string[]
}

/**
 * AI детектор аномалий и проверки качества данных
 */
export class AnomalyDetector {
  /**
   * Проверка наряда-допуска на аномалии
   */
  checkPermitData(permitData: {
    work_description?: string
    location?: string
    start_date?: string
    end_date?: string
    responsible_person_id?: string
    work_type?: string
    required_ppe?: string[]
    safety_measures?: string[]
  }, language: Language = 'ru'): DataQualityReport {
    const anomalies: Anomaly[] = []
    const warnings: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Проверка описания работ
    if (permitData.work_description) {
      const desc = permitData.work_description.trim()
      
      // Слишком короткое описание
      if (desc.length < 10) {
        anomalies.push({
          field: 'work_description',
          value: desc,
          severity: 'high',
          reason: this.getText('descriptionTooShort', language),
          suggestion: this.getText('expandDescription', language),
        })
        score -= 20
      }
      
      // Слишком общее описание
      if (this.isTooGeneric(desc)) {
        anomalies.push({
          field: 'work_description',
          value: desc,
          severity: 'medium',
          reason: this.getText('descriptionTooGeneric', language),
          suggestion: this.getText('beMoreSpecific', language),
        })
        score -= 10
      }
      
      // Проверка на опасные слова без мер безопасности
      if (this.hasDangerousKeywords(desc) && (!permitData.safety_measures || permitData.safety_measures.length === 0)) {
        anomalies.push({
          field: 'safety_measures',
          value: null,
          severity: 'high',
          reason: this.getText('missingSafetyMeasures', language),
          suggestion: this.getText('addSafetyMeasures', language),
        })
        score -= 25
      }
    }

    // Проверка дат
    if (permitData.start_date && permitData.end_date) {
      const start = new Date(permitData.start_date)
      const end = new Date(permitData.end_date)
      const now = new Date()
      
      // Дата окончания раньше начала
      if (end < start) {
        anomalies.push({
          field: 'end_date',
          value: permitData.end_date,
          severity: 'high',
          reason: this.getText('endBeforeStart', language),
        })
        score -= 30
      }
      
      // Работа в прошлом
      if (start < now && (now.getTime() - start.getTime()) > 24 * 60 * 60 * 1000) {
        warnings.push(this.getText('workInPast', language))
        score -= 5
      }
      
      // Слишком длительная работа (>30 дней)
      const duration = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
      if (duration > 30) {
        anomalies.push({
          field: 'duration',
          value: Math.round(duration),
          severity: 'medium',
          reason: this.getText('tooLongDuration', language, { days: Math.round(duration) }),
          suggestion: this.getText('splitWork', language),
        })
        score -= 10
      }
      
      // Очень короткая работа (<15 минут)
      if (duration < 0.01) { // 15 минут
        anomalies.push({
          field: 'duration',
          value: Math.round(duration * 24 * 60),
          severity: 'low',
          reason: this.getText('tooShortDuration', language),
        })
        score -= 5
      }
    }

    // Проверка местоположения
    if (permitData.location) {
      if (permitData.location.trim().length < 3) {
        anomalies.push({
          field: 'location',
          value: permitData.location,
          severity: 'medium',
          reason: this.getText('locationTooVague', language),
          suggestion: this.getText('specifyLocation', language),
        })
        score -= 10
      }
    } else {
      warnings.push(this.getText('missingLocation', language))
      score -= 5
    }

    // Проверка ответственного лица
    if (!permitData.responsible_person_id) {
      anomalies.push({
        field: 'responsible_person_id',
        value: null,
        severity: 'high',
        reason: this.getText('missingResponsible', language),
      })
      score -= 20
    }

    // Проверка СИЗ
    if (!permitData.required_ppe || permitData.required_ppe.length === 0) {
      if (permitData.work_description && this.hasDangerousKeywords(permitData.work_description)) {
        anomalies.push({
          field: 'required_ppe',
          value: [],
          severity: 'high',
          reason: this.getText('missingPPE', language),
          suggestion: this.getText('addPPE', language),
        })
        score -= 20
      } else {
        warnings.push(this.getText('noPPESpecified', language))
        score -= 5
      }
    }

    // Рекомендации
    if (score >= 90) {
      recommendations.push(this.getText('excellentQuality', language))
    } else if (score >= 70) {
      recommendations.push(this.getText('goodQuality', language))
    } else if (score >= 50) {
      recommendations.push(this.getText('needsImprovement', language))
    } else {
      recommendations.push(this.getText('poorQuality', language))
    }

    return {
      isValid: anomalies.filter((a) => a.severity === 'high').length === 0,
      score: Math.max(0, score),
      anomalies,
      warnings,
      recommendations,
    }
  }

  /**
   * Проверка данных персонала
   */
  checkPersonnelData(personData: {
    name?: string
    position?: string
    email?: string
    phone?: string
  }, language: Language = 'ru'): DataQualityReport {
    const anomalies: Anomaly[] = []
    const warnings: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Проверка имени
    if (personData.name) {
      if (personData.name.length < 2) {
        anomalies.push({
          field: 'name',
          value: personData.name,
          severity: 'high',
          reason: this.getText('nameTooShort', language),
        })
        score -= 25
      }
      
      // Проверка на цифры в имени
      if (/\d/.test(personData.name)) {
        anomalies.push({
          field: 'name',
          value: personData.name,
          severity: 'medium',
          reason: this.getText('nameContainsDigits', language),
        })
        score -= 10
      }
    }

    // Проверка email
    if (personData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(personData.email)) {
        anomalies.push({
          field: 'email',
          value: personData.email,
          severity: 'medium',
          reason: this.getText('invalidEmail', language),
        })
        score -= 15
      }
    }

    // Проверка телефона
    if (personData.phone) {
      const phoneClean = personData.phone.replace(/[\s\-()]/g, '')
      if (phoneClean.length < 10 || phoneClean.length > 15) {
        anomalies.push({
          field: 'phone',
          value: personData.phone,
          severity: 'low',
          reason: this.getText('invalidPhone', language),
        })
        score -= 10
      }
    }

    return {
      isValid: anomalies.filter((a) => a.severity === 'high').length === 0,
      score: Math.max(0, score),
      anomalies,
      warnings,
      recommendations,
    }
  }

  /**
   * Проверка на слишком общее описание
   */
  private isTooGeneric(text: string): boolean {
    const genericPhrases = [
      'работы', 'работа', 'выполнение', 'проведение', 'монтаж',
      'çalışma', 'iş', 'yapım',
      'work', 'job', 'task',
    ]
    
    const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    return words.length < 3 || genericPhrases.includes(text.toLowerCase().trim())
  }

  /**
   * Проверка на опасные ключевые слова
   */
  private hasDangerousKeywords(text: string): boolean {
    const dangerous = [
      'высот', 'электр', 'сварк', 'газ', 'химич', 'взрыв', 'огне',
      'кран', 'груз', 'котлован', 'траншея', 'замкнут',
      'yüksek', 'elektrik', 'kaynak', 'gaz', 'kimyasal', 'patlama',
      'height', 'electric', 'welding', 'gas', 'chemical', 'explosion',
    ]
    
    const textLower = text.toLowerCase()
    return dangerous.some((keyword) => textLower.includes(keyword))
  }

  /**
   * Получение локализованного текста
   */
  private getText(key: string, language: Language, params?: Record<string, any>): string {
    const messages: Record<string, Record<Language, string>> = {
      descriptionTooShort: {
        ru: 'Описание работ слишком краткое',
        tr: 'İş tanımı çok kısa',
        en: 'Work description is too short',
      },
      expandDescription: {
        ru: 'Добавьте больше деталей о характере работ',
        tr: 'Çalışmanın doğası hakkında daha fazla ayrıntı ekleyin',
        en: 'Add more details about the nature of work',
      },
      descriptionTooGeneric: {
        ru: 'Описание слишком общее',
        tr: 'Açıklama çok genel',
        en: 'Description is too generic',
      },
      beMoreSpecific: {
        ru: 'Укажите конкретные виды работ',
        tr: 'Belirli çalışma türlerini belirtin',
        en: 'Specify particular types of work',
      },
      missingSafetyMeasures: {
        ru: 'Отсутствуют меры безопасности для опасных работ',
        tr: 'Tehlikeli işler için güvenlik önlemleri eksik',
        en: 'Safety measures missing for hazardous work',
      },
      addSafetyMeasures: {
        ru: 'Добавьте необходимые меры безопасности',
        tr: 'Gerekli güvenlik önlemlerini ekleyin',
        en: 'Add necessary safety measures',
      },
      endBeforeStart: {
        ru: 'Дата окончания раньше даты начала',
        tr: 'Bitiş tarihi başlangıç tarihinden önce',
        en: 'End date is before start date',
      },
      workInPast: {
        ru: '⚠ Работа запланирована в прошлом',
        tr: '⚠ Çalışma geçmişte planlandı',
        en: '⚠ Work scheduled in the past',
      },
      tooLongDuration: {
        ru: `Очень длительная работа (${params?.days} дней)`,
        tr: `Çok uzun çalışma (${params?.days} gün)`,
        en: `Very long duration (${params?.days} days)`,
      },
      splitWork: {
        ru: 'Рекомендуется разделить на этапы',
        tr: 'Aşamalara bölünmesi önerilir',
        en: 'Recommended to split into stages',
      },
      tooShortDuration: {
        ru: 'Очень короткая продолжительность',
        tr: 'Çok kısa süre',
        en: 'Very short duration',
      },
      locationTooVague: {
        ru: 'Местоположение указано неточно',
        tr: 'Konum belirsiz belirtildi',
        en: 'Location is vague',
      },
      specifyLocation: {
        ru: 'Укажите конкретное место проведения работ',
        tr: 'Belirli çalışma yerini belirtin',
        en: 'Specify exact work location',
      },
      missingLocation: {
        ru: '⚠ Не указано местоположение',
        tr: '⚠ Konum belirtilmedi',
        en: '⚠ Location not specified',
      },
      missingResponsible: {
        ru: 'Не назначен ответственный за работы',
        tr: 'İşten sorumlu kişi atanmadı',
        en: 'Responsible person not assigned',
      },
      missingPPE: {
        ru: 'Не указаны требуемые СИЗ для опасных работ',
        tr: 'Tehlikeli işler için gerekli KKD belirtilmedi',
        en: 'Required PPE not specified for hazardous work',
      },
      addPPE: {
        ru: 'Добавьте необходимые средства индивидуальной защиты',
        tr: 'Gerekli kişisel koruyucu ekipmanları ekleyin',
        en: 'Add necessary personal protective equipment',
      },
      noPPESpecified: {
        ru: '⚠ СИЗ не указаны',
        tr: '⚠ KKD belirtilmedi',
        en: '⚠ PPE not specified',
      },
      excellentQuality: {
        ru: '✓ Отличное качество данных',
        tr: '✓ Mükemmel veri kalitesi',
        en: '✓ Excellent data quality',
      },
      goodQuality: {
        ru: '✓ Хорошее качество данных',
        tr: '✓ İyi veri kalitesi',
        en: '✓ Good data quality',
      },
      needsImprovement: {
        ru: '⚠ Требуются улучшения',
        tr: '⚠ İyileştirme gerekli',
        en: '⚠ Needs improvement',
      },
      poorQuality: {
        ru: '⚠ Низкое качество данных - требуется доработка',
        tr: '⚠ Düşük veri kalitesi - düzeltme gerekli',
        en: '⚠ Poor data quality - revision required',
      },
      nameTooShort: {
        ru: 'Имя слишком короткое',
        tr: 'İsim çok kısa',
        en: 'Name is too short',
      },
      nameContainsDigits: {
        ru: 'Имя содержит цифры',
        tr: 'İsimde rakam var',
        en: 'Name contains digits',
      },
      invalidEmail: {
        ru: 'Неверный формат email',
        tr: 'Geçersiz e-posta formatı',
        en: 'Invalid email format',
      },
      invalidPhone: {
        ru: 'Неверный формат телефона',
        tr: 'Geçersiz telefon formatı',
        en: 'Invalid phone format',
      },
    }

    return messages[key]?.[language] || key
  }
}

// Singleton instance
export const anomalyDetector = new AnomalyDetector()
