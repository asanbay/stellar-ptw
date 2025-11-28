import type { Person, Role, Language } from '../ptw-types'

export interface PersonnelRecommendation {
  person: Person
  score: number // 0-100
  reasons: string[]
  warnings?: string[]
}

export interface TeamSuggestion {
  team: Person[]
  totalScore: number
  coverage: {
    roles: Role[]
    skills: string[]
  }
  warnings: string[]
  recommendations: string[]
}

/**
 * AI для интеллектуального подбора персонала
 */
export class PersonnelMatcher {
  /**
   * Подбор подходящих сотрудников для работы
   */
  findSuitablePersonnel(
    workDescription: string,
    requiredRole?: Role,
    requiredSkills?: string[],
    department?: string,
    allPersonnel?: Person[],
    language: Language = 'ru'
  ): PersonnelRecommendation[] {
    if (!allPersonnel || allPersonnel.length === 0) return []

    const workLower = workDescription.toLowerCase()
    
    const scored = allPersonnel
      .map((person) => {
        let score = 50 // базовый score
        const reasons: string[] = []
        const warnings: string[] = []

        // Проверка роли
        if (requiredRole) {
          if (person.role === requiredRole) {
            score += 30
            reasons.push(this.getLocalizedText('roleMatch', language))
          } else {
            score -= 15
            warnings.push(this.getLocalizedText('roleMismatch', language, { role: requiredRole }))
          }
        }

        // Проверка отдела
        if (department && person.departmentId === department) {
          score += 15
          reasons.push(this.getLocalizedText('departmentMatch', language))
        }

        // Проверка квалификаций
        if (requiredSkills && person.customQualifications) {
          const matchingSkills = requiredSkills.filter((skill) =>
            person.customQualifications?.some((q) =>
              q.toLowerCase().includes(skill.toLowerCase())
            )
          )
          
          if (matchingSkills.length > 0) {
            const skillScore = (matchingSkills.length / requiredSkills.length) * 25
            score += skillScore
            reasons.push(
              this.getLocalizedText('skillsMatch', language, {
                count: matchingSkills.length,
                total: requiredSkills.length,
              })
            )
          }
        }

        // Анализ обязанностей
        if (person.customDuties) {
          const dutyMatches = person.customDuties.filter((duty) =>
            this.hasKeywordMatch(duty, workLower)
          )
          
          if (dutyMatches.length > 0) {
            score += 10
            reasons.push(this.getLocalizedText('dutiesMatch', language))
          }
        }

        // Бонус за опыт (на основе должности)
        if (this.hasExperienceKeywords(person.position)) {
          score += 5
          reasons.push(this.getLocalizedText('experienceBonus', language))
        }

        return {
          person,
          score: Math.min(Math.max(score, 0), 100),
          reasons,
          warnings,
        }
      })
      .filter((r) => r.score >= 30) // Минимальный порог
      .sort((a, b) => b.score - a.score)

    return scored
  }

  /**
   * Формирование оптимальной команды
   */
  suggestTeam(
    workDescription: string,
    requiredRoles: Role[],
    allPersonnel: Person[],
    teamSize = 5,
    language: Language = 'ru'
  ): TeamSuggestion | null {
    if (!allPersonnel || allPersonnel.length === 0) return null

    const team: Person[] = []
    const usedIds = new Set<string>()
    const coverage = {
      roles: [] as Role[],
      skills: [] as string[],
    }

    // Сначала подбираем по обязательным ролям
    for (const role of requiredRoles) {
      const suitable = this.findSuitablePersonnel(
        workDescription,
        role,
        undefined,
        undefined,
        allPersonnel.filter((p) => !usedIds.has(p.id)),
        language
      )

      if (suitable.length > 0) {
        const best = suitable[0].person
        team.push(best)
        usedIds.add(best.id)
        coverage.roles.push(role)
        
        if (best.customQualifications) {
          coverage.skills.push(...best.customQualifications)
        }
      }
    }

    // Дополняем команду до нужного размера
    while (team.length < teamSize) {
      const remaining = allPersonnel.filter((p) => !usedIds.has(p.id))
      if (remaining.length === 0) break

      const candidates = this.findSuitablePersonnel(
        workDescription,
        undefined,
        undefined,
        undefined,
        remaining,
        language
      )

      if (candidates.length === 0) break

      const best = candidates[0].person
      team.push(best)
      usedIds.add(best.id)
      
      if (best.customQualifications) {
        coverage.skills.push(...best.customQualifications)
      }
    }

    // Анализируем команду
    const warnings: string[] = []
    const recommendations: string[] = []

    // Проверяем покрытие ролей
    const missingRoles = requiredRoles.filter((r) => !coverage.roles.includes(r))
    if (missingRoles.length > 0) {
      warnings.push(
        this.getLocalizedText('missingRoles', language, {
          roles: missingRoles.join(', '),
        })
      )
    }

    // Проверяем размер команды
    if (team.length < teamSize) {
      warnings.push(
        this.getLocalizedText('insufficientTeam', language, {
          current: team.length,
          required: teamSize,
        })
      )
    }

    // Рекомендации
    if (team.length >= teamSize && missingRoles.length === 0) {
      recommendations.push(this.getLocalizedText('teamComplete', language))
    }

    // Проверяем баланс опыта
    const hasExperienced = team.some((p) => this.hasExperienceKeywords(p.position))
    if (!hasExperienced && team.length > 2) {
      recommendations.push(this.getLocalizedText('needExperience', language))
    }

    const totalScore = team.reduce((sum, person) => {
      const rec = this.findSuitablePersonnel(
        workDescription,
        undefined,
        undefined,
        undefined,
        [person],
        language
      )
      return sum + (rec[0]?.score || 0)
    }, 0)

    return {
      team,
      totalScore: Math.round(totalScore / team.length),
      coverage: {
        roles: [...new Set(coverage.roles)],
        skills: [...new Set(coverage.skills)],
      },
      warnings,
      recommendations,
    }
  }

  /**
   * Поиск замены для сотрудника
   */
  findReplacement(
    person: Person,
    allPersonnel: Person[],
    language: Language = 'ru'
  ): PersonnelRecommendation[] {
    const available = allPersonnel.filter((p) => p.id !== person.id)
    
    return this.findSuitablePersonnel(
      person.position,
      person.role,
      person.customQualifications,
      person.departmentId,
      available,
      language
    )
  }

  /**
   * Проверка ключевых слов в тексте
   */
  private hasKeywordMatch(text: string, keywords: string): boolean {
    const textLower = text.toLowerCase()
    const keywordList = keywords.split(/\s+/)
    
    return keywordList.some((kw) => textLower.includes(kw) && kw.length > 3)
  }

  /**
   * Проверка маркеров опыта в должности
   */
  private hasExperienceKeywords(position: string): boolean {
    const experienceKeywords = [
      'старш', 'главн', 'ведущ', 'руководител', 'начальник', 'директор',
      'senior', 'lead', 'chief', 'head', 'manager',
      'üst', 'baş', 'kıdemli', 'yönetici',
    ]
    
    const posLower = position.toLowerCase()
    return experienceKeywords.some((kw) => posLower.includes(kw))
  }

  /**
   * Локализация сообщений
   */
  private getLocalizedText(
    key: string,
    language: Language,
    params?: Record<string, any>
  ): string {
    const messages: Record<string, Record<Language, string>> = {
      roleMatch: {
        ru: '✓ Соответствует требуемой роли',
        tr: '✓ Gerekli role uygun',
        en: '✓ Matches required role',
      },
      roleMismatch: {
        ru: `⚠ Роль не соответствует (требуется: ${params?.role})`,
        tr: `⚠ Rol uyumsuz (gerekli: ${params?.role})`,
        en: `⚠ Role mismatch (required: ${params?.role})`,
      },
      departmentMatch: {
        ru: '✓ Из нужного отдела',
        tr: '✓ Doğru departmandan',
        en: '✓ From required department',
      },
      skillsMatch: {
        ru: `✓ Совпадает ${params?.count} из ${params?.total} требуемых навыков`,
        tr: `✓ ${params?.count}/${params?.total} gerekli beceri eşleşiyor`,
        en: `✓ Matches ${params?.count} of ${params?.total} required skills`,
      },
      dutiesMatch: {
        ru: '✓ Обязанности соответствуют работе',
        tr: '✓ Görevler işe uygun',
        en: '✓ Duties match the work',
      },
      experienceBonus: {
        ru: '✓ Опытный специалист',
        tr: '✓ Deneyimli uzman',
        en: '✓ Experienced specialist',
      },
      missingRoles: {
        ru: `⚠ Отсутствуют роли: ${params?.roles}`,
        tr: `⚠ Eksik roller: ${params?.roles}`,
        en: `⚠ Missing roles: ${params?.roles}`,
      },
      insufficientTeam: {
        ru: `⚠ Недостаточно персонала (${params?.current}/${params?.required})`,
        tr: `⚠ Yetersiz personel (${params?.current}/${params?.required})`,
        en: `⚠ Insufficient team (${params?.current}/${params?.required})`,
      },
      teamComplete: {
        ru: '✓ Команда полностью укомплектована',
        tr: '✓ Ekip tam olarak oluşturuldu',
        en: '✓ Team fully assembled',
      },
      needExperience: {
        ru: '💡 Рекомендуется добавить опытного специалиста',
        tr: '💡 Deneyimli uzman eklenmesi önerilir',
        en: '💡 Recommended to add experienced specialist',
      },
    }

    return messages[key]?.[language] || key
  }
}

// Singleton instance
export const personnelMatcher = new PersonnelMatcher()
