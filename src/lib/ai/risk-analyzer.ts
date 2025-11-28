import type { Language } from '../ptw-types'

// Типы рисков
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface RiskAssessment {
  level: RiskLevel
  score: number // 0-100
  hazards: string[]
  requiredPPE: string[] // Personal Protective Equipment
  safetyMeasures: string[]
  recommendations: string[]
  confidence: number // 0-1
}

// База знаний рисков (расширяемая)
interface RiskPattern {
  keywords: string[]
  riskLevel: RiskLevel
  baseScore: number
  hazards: Record<Language, string[]>
  requiredPPE: Record<Language, string[]>
  safetyMeasures: Record<Language, string[]>
}

const RISK_PATTERNS: RiskPattern[] = [
  // Работы на высоте
  {
    keywords: ['высот', 'лестниц', 'леса', 'подмост', 'кровл', 'вышк', 'высоко'],
    riskLevel: 'high',
    baseScore: 75,
    hazards: {
      ru: ['Падение с высоты', 'Падение инструмента', 'Потеря равновесия'],
      tr: ['Yüksekten düşme', 'Alet düşmesi', 'Denge kaybı'],
      en: ['Fall from height', 'Falling objects', 'Loss of balance'],
    },
    requiredPPE: {
      ru: ['Страховочный пояс', 'Каска', 'Спецобувь'],
      tr: ['Emniyet kemeri', 'Baret', 'İş ayakkabısı'],
      en: ['Safety harness', 'Hard hat', 'Safety boots'],
    },
    safetyMeasures: {
      ru: ['Ограждение зоны работ', 'Проверка страховочного оборудования', 'Наблюдатель'],
      tr: ['Çalışma alanının çevrelenmesi', 'Emniyet ekipmanı kontrolü', 'Gözetmen'],
      en: ['Work area barrier', 'Safety equipment inspection', 'Observer'],
    },
  },
  
  // Электромонтажные работы
  {
    keywords: ['электр', 'кабел', 'провод', 'напряжен', 'щит', 'разетк', 'монтаж'],
    riskLevel: 'high',
    baseScore: 80,
    hazards: {
      ru: ['Поражение электрическим током', 'Короткое замыкание', 'Пожар'],
      tr: ['Elektrik çarpması', 'Kısa devre', 'Yangın'],
      en: ['Electric shock', 'Short circuit', 'Fire'],
    },
    requiredPPE: {
      ru: ['Диэлектрические перчатки', 'Диэлектрическая обувь', 'Каска'],
      tr: ['Dielektrik eldiven', 'Dielektrik ayakkabı', 'Baret'],
      en: ['Dielectric gloves', 'Dielectric boots', 'Hard hat'],
    },
    safetyMeasures: {
      ru: ['Отключение питания', 'Вывешивание плакатов', 'Проверка отсутствия напряжения', 'Заземление'],
      tr: ['Güç kesintisi', 'Uyarı levhaları', 'Gerilim kontrolü', 'Topraklama'],
      en: ['Power disconnect', 'Warning signs', 'Voltage check', 'Grounding'],
    },
  },

  // Сварочные работы
  {
    keywords: ['сварк', 'сварочн', 'резк', 'газ', 'горелк', 'ацетилен'],
    riskLevel: 'high',
    baseScore: 70,
    hazards: {
      ru: ['Пожар', 'Взрыв', 'Ожоги', 'Отравление газами', 'Поражение глаз'],
      tr: ['Yangın', 'Patlama', 'Yanıklar', 'Gaz zehirlenmesi', 'Göz hasarı'],
      en: ['Fire', 'Explosion', 'Burns', 'Gas poisoning', 'Eye damage'],
    },
    requiredPPE: {
      ru: ['Сварочная маска', 'Огнестойкая одежда', 'Краги', 'Спецобувь'],
      tr: ['Kaynak maskesi', 'Yanmaz giysi', 'Eldiven', 'İş ayakkabısı'],
      en: ['Welding mask', 'Fire-resistant clothing', 'Welding gloves', 'Safety boots'],
    },
    safetyMeasures: {
      ru: ['Огнетушитель', 'Вентиляция', 'Ограждение зоны', 'Проверка газовых баллонов', 'Наблюдатель'],
      tr: ['Yangın söndürücü', 'Havalandırma', 'Alan bariyeri', 'Gaz tüpü kontrolü', 'Gözetmen'],
      en: ['Fire extinguisher', 'Ventilation', 'Area barrier', 'Gas cylinder check', 'Observer'],
    },
  },

  // Работы в замкнутых пространствах
  {
    keywords: ['замкнут', 'колодец', 'резервуар', 'емкост', 'цистерн', 'тоннел'],
    riskLevel: 'critical',
    baseScore: 90,
    hazards: {
      ru: ['Недостаток кислорода', 'Отравление газами', 'Невозможность быстрой эвакуации'],
      tr: ['Oksijen eksikliği', 'Gaz zehirlenmesi', 'Hızlı tahliye imkansızlığı'],
      en: ['Oxygen deficiency', 'Gas poisoning', 'Difficult evacuation'],
    },
    requiredPPE: {
      ru: ['Дыхательный аппарат', 'Страховочный пояс', 'Газоанализатор', 'Каска'],
      tr: ['Solunum cihazı', 'Emniyet kemeri', 'Gaz dedektörü', 'Baret'],
      en: ['Breathing apparatus', 'Safety harness', 'Gas detector', 'Hard hat'],
    },
    safetyMeasures: {
      ru: ['Анализ воздуха', 'Принудительная вентиляция', 'Страховочный трос', 'Наблюдатель снаружи', 'Связь'],
      tr: ['Hava analizi', 'Zorunlu havalandırma', 'Emniyet halatı', 'Dış gözetmen', 'İletişim'],
      en: ['Air analysis', 'Forced ventilation', 'Safety rope', 'External observer', 'Communication'],
    },
  },

  // Работы с химическими веществами
  {
    keywords: ['химическ', 'кислот', 'щелоч', 'растворител', 'краск', 'лак', 'реактив'],
    riskLevel: 'high',
    baseScore: 75,
    hazards: {
      ru: ['Химические ожоги', 'Отравление', 'Аллергия', 'Пожар'],
      tr: ['Kimyasal yanıklar', 'Zehirlenme', 'Alerji', 'Yangın'],
      en: ['Chemical burns', 'Poisoning', 'Allergic reaction', 'Fire'],
    },
    requiredPPE: {
      ru: ['Химзащитный костюм', 'Респиратор', 'Защитные очки', 'Химстойкие перчатки'],
      tr: ['Kimyasal koruyucu giysi', 'Solunum maskesi', 'Koruyucu gözlük', 'Kimyasal eldiven'],
      en: ['Chemical suit', 'Respirator', 'Safety goggles', 'Chemical gloves'],
    },
    safetyMeasures: {
      ru: ['Вентиляция', 'Аварийный душ', 'Нейтрализующие средства', 'Паспорт безопасности вещества'],
      tr: ['Havalandırma', 'Acil duş', 'Nötrleştirici maddeler', 'Güvenlik bilgi formu'],
      en: ['Ventilation', 'Emergency shower', 'Neutralizing agents', 'Material safety data sheet'],
    },
  },

  // Грузоподъемные работы
  {
    keywords: ['кран', 'подъем', 'груз', 'строп', 'талреп', 'лебедк'],
    riskLevel: 'high',
    baseScore: 70,
    hazards: {
      ru: ['Падение груза', 'Опрокидывание', 'Защемление', 'Обрыв строп'],
      tr: ['Yük düşmesi', 'Devrilme', 'Sıkışma', 'Askı kopması'],
      en: ['Falling load', 'Overturning', 'Crushing', 'Sling failure'],
    },
    requiredPPE: {
      ru: ['Каска', 'Спецобувь', 'Сигнальный жилет', 'Перчатки'],
      tr: ['Baret', 'İş ayakkabısı', 'İkaz yeleği', 'Eldiven'],
      en: ['Hard hat', 'Safety boots', 'High-visibility vest', 'Gloves'],
    },
    safetyMeasures: {
      ru: ['Ограждение зоны', 'Проверка грузоподъемности', 'Осмотр строп', 'Стропальщик', 'Звуковой сигнал'],
      tr: ['Alan bariyeri', 'Yük kapasitesi kontrolü', 'Askı kontrolü', 'Bağlayıcı', 'Ses sinyali'],
      en: ['Area barrier', 'Load capacity check', 'Sling inspection', 'Rigger', 'Audio signal'],
    },
  },

  // Земляные работы
  {
    keywords: ['земл', 'котлован', 'траншея', 'выемк', 'экскават', 'рыть'],
    riskLevel: 'medium',
    baseScore: 60,
    hazards: {
      ru: ['Обрушение грунта', 'Повреждение коммуникаций', 'Падение в яму'],
      tr: ['Toprak kayması', 'Altyapı hasarı', 'Çukura düşme'],
      en: ['Soil collapse', 'Utility damage', 'Falling into pit'],
    },
    requiredPPE: {
      ru: ['Каска', 'Спецобувь', 'Сигнальный жилет'],
      tr: ['Baret', 'İş ayakkabısı', 'İkaz yeleği'],
      en: ['Hard hat', 'Safety boots', 'High-visibility vest'],
    },
    safetyMeasures: {
      ru: ['Крепление стенок', 'Согласование с владельцами коммуникаций', 'Ограждение', 'Отвод воды'],
      tr: ['Duvar desteği', 'Altyapı sahipleriyle koordinasyon', 'Çevre', 'Su drenajı'],
      en: ['Wall support', 'Utility coordination', 'Barrier', 'Water drainage'],
    },
  },

  // Низкий риск - обычные работы
  {
    keywords: ['покраск', 'уборк', 'мойк', 'осмотр', 'контрол', 'проверк'],
    riskLevel: 'low',
    baseScore: 20,
    hazards: {
      ru: ['Минимальный риск'],
      tr: ['Minimum risk'],
      en: ['Minimal risk'],
    },
    requiredPPE: {
      ru: ['Рабочая одежда', 'Перчатки'],
      tr: ['İş giysisi', 'Eldiven'],
      en: ['Work clothes', 'Gloves'],
    },
    safetyMeasures: {
      ru: ['Стандартные меры безопасности'],
      tr: ['Standart güvenlik önlemleri'],
      en: ['Standard safety measures'],
    },
  },
]

/**
 * AI движок для анализа рисков работ
 */
export class RiskAnalyzer {
  private patterns: RiskPattern[] = RISK_PATTERNS

  /**
   * Анализ описания работ и определение уровня риска
   */
  analyze(
    workDescription: string,
    workType?: string,
    location?: string,
    language: Language = 'ru'
  ): RiskAssessment {
    const text = `${workDescription} ${workType || ''} ${location || ''}`.toLowerCase()
    
    // Найдем все подходящие паттерны
    const matches = this.patterns
      .map((pattern) => ({
        pattern,
        score: this.calculateMatchScore(text, pattern),
      }))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)

    if (matches.length === 0) {
      return this.getDefaultAssessment(language)
    }

    // Используем top 3 совпадения для расчета итогового риска
    const topMatches = matches.slice(0, 3)
    const totalScore = topMatches.reduce((sum, m) => sum + m.score, 0)
    
    // Определяем уровень риска
    const riskLevel = this.determineRiskLevel(totalScore / topMatches.length)
    
    // Собираем все опасности, СИЗ и меры
    const hazards = new Set<string>()
    const requiredPPE = new Set<string>()
    const safetyMeasures = new Set<string>()
    
    topMatches.forEach(({ pattern }) => {
      pattern.hazards[language].forEach((h) => hazards.add(h))
      pattern.requiredPPE[language].forEach((p) => requiredPPE.add(p))
      pattern.safetyMeasures[language].forEach((m) => safetyMeasures.add(m))
    })

    const recommendations = this.generateRecommendations(
      riskLevel,
      Array.from(hazards),
      language
    )

    return {
      level: riskLevel,
      score: Math.round(totalScore / topMatches.length),
      hazards: Array.from(hazards),
      requiredPPE: Array.from(requiredPPE),
      safetyMeasures: Array.from(safetyMeasures),
      recommendations,
      confidence: Math.min(topMatches[0].score / 100, 0.95),
    }
  }

  /**
   * Расчет совпадения текста с паттерном
   */
  private calculateMatchScore(text: string, pattern: RiskPattern): number {
    let score = 0
    let matches = 0

    pattern.keywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        matches++
        // Бонус за множественные совпадения
        score += pattern.baseScore * (1 + matches * 0.1)
      }
    })

    return matches > 0 ? score / matches : 0
  }

  /**
   * Определение уровня риска по баллам
   */
  private determineRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 30) return 'medium'
    return 'low'
  }

  /**
   * Генерация рекомендаций
   */
  private generateRecommendations(
    level: RiskLevel,
    hazards: string[],
    language: Language
  ): string[] {
    const recommendations: string[] = []

    const messages = {
      ru: {
        critical: [
          '⚠️ КРИТИЧЕСКИЙ УРОВЕНЬ РИСКА! Требуется особое внимание',
          'Обязательна разработка плана производства работ',
          'Необходимо согласование с службой ОТ и ПБ',
          'Требуется дополнительный инструктаж персонала',
        ],
        high: [
          '⚠️ Высокий уровень риска. Требуется повышенное внимание',
          'Рекомендуется дополнительный инструктаж',
          'Необходимо строгое соблюдение мер безопасности',
        ],
        medium: [
          'Средний уровень риска',
          'Соблюдайте стандартные меры безопасности',
        ],
        low: ['Низкий уровень риска', 'Соблюдайте общие правила безопасности'],
      },
      tr: {
        critical: [
          '⚠️ KRİTİK RİSK SEVİYESİ! Özel dikkat gerekiyor',
          'İş planı hazırlanması zorunludur',
          'İSG servisi ile koordinasyon gereklidir',
          'Personel için ek eğitim gereklidir',
        ],
        high: [
          '⚠️ Yüksek risk seviyesi. Artırılmış dikkat gerekiyor',
          'Ek eğitim önerilir',
          'Güvenlik önlemlerine sıkı uyum gereklidir',
        ],
        medium: [
          'Orta risk seviyesi',
          'Standart güvenlik önlemlerine uyun',
        ],
        low: ['Düşük risk seviyesi', 'Genel güvenlik kurallarına uyun'],
      },
      en: {
        critical: [
          '⚠️ CRITICAL RISK LEVEL! Special attention required',
          'Work plan development is mandatory',
          'Coordination with HSE required',
          'Additional personnel training required',
        ],
        high: [
          '⚠️ High risk level. Increased attention required',
          'Additional training recommended',
          'Strict compliance with safety measures required',
        ],
        medium: [
          'Medium risk level',
          'Follow standard safety measures',
        ],
        low: ['Low risk level', 'Follow general safety rules'],
      },
    }

    recommendations.push(...messages[language][level])

    if (hazards.length > 3) {
      const msg = {
        ru: `Выявлено ${hazards.length} потенциальных опасностей`,
        tr: `${hazards.length} potansiyel tehlike tespit edildi`,
        en: `${hazards.length} potential hazards identified`,
      }
      recommendations.push(msg[language])
    }

    return recommendations
  }

  /**
   * Оценка по умолчанию
   */
  private getDefaultAssessment(language: Language): RiskAssessment {
    const messages = {
      ru: {
        hazards: ['Не удалось определить конкретные риски'],
        ppe: ['Базовые СИЗ'],
        measures: ['Стандартные меры безопасности'],
        recommendations: ['Уточните описание работ для более точной оценки'],
      },
      tr: {
        hazards: ['Belirli riskler belirlenemedi'],
        ppe: ['Temel KKD'],
        measures: ['Standart güvenlik önlemleri'],
        recommendations: ['Daha doğru değerlendirme için iş tanımını netleştirin'],
      },
      en: {
        hazards: ['Unable to identify specific risks'],
        ppe: ['Basic PPE'],
        measures: ['Standard safety measures'],
        recommendations: ['Clarify work description for more accurate assessment'],
      },
    }

    return {
      level: 'medium',
      score: 50,
      hazards: messages[language].hazards,
      requiredPPE: messages[language].ppe,
      safetyMeasures: messages[language].measures,
      recommendations: messages[language].recommendations,
      confidence: 0.3,
    }
  }

  /**
   * Добавление кастомного паттерна (для обучения системы)
   */
  addPattern(pattern: RiskPattern): void {
    this.patterns.push(pattern)
  }

  /**
   * Экспорт паттернов для сохранения
   */
  exportPatterns(): RiskPattern[] {
    return this.patterns
  }

  /**
   * Импорт паттернов
   */
  importPatterns(patterns: RiskPattern[]): void {
    this.patterns = patterns
  }
}

// Singleton instance
export const riskAnalyzer = new RiskAnalyzer()
