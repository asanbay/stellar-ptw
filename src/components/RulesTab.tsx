import { Card } from '@/components/ui/card'
import type { Language } from '@/lib/ptw-types'
import { PTW_RULES, ADDITIONAL_RULES, TIMELINE_RULES } from '@/lib/ptw-constants'

interface RulesTabProps {
  language: Language
}

export function RulesTab({ language }: RulesTabProps) {
  const labels = {
    ru: {
      mainRules: 'Основные правила оформления НД',
      timeframes: 'Временные рамки НД',
      limitsQuotas: 'Ограничения и квоты',
    },
    tr: {
      mainRules: 'İş İzninin Temel Kuralları',
      timeframes: 'İş İzni Zaman Çerçeveleri',
      limitsQuotas: 'Sınırlamalar ve Kotalar',
    },
    en: {
      mainRules: 'Main PTW Rules',
      timeframes: 'PTW Timeframes',
      limitsQuotas: 'Limits and Quotas',
    },
  }

  const l = labels[language]

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>📏</span>
          {l.mainRules}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PTW_RULES.map((rule, index) => (
            <div key={index} className="p-4 bg-card border rounded-lg border-l-4 border-l-primary">
              <div className="flex items-center gap-2 font-bold mb-2">
                <span className="text-xl">{rule.icon}</span>
                <span className="text-sm">{rule.title[language]}</span>
              </div>
              <div className="text-2xl font-extrabold text-primary mb-2">{rule.value[language]}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{rule.description[language]}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <span className="text-lg">🕒</span>
          {l.timeframes}
        </h3>
        <div className="relative pl-8 space-y-6">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full" />
          {TIMELINE_RULES.map((item, index) => (
            <div key={index} className="relative">
              <div className="absolute -left-9 top-1 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-sm" />
              <div className="font-bold text-primary mb-1">{item.time[language]}</div>
              <div className="text-sm">{item.content[language]}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <span className="text-lg">📊</span>
          {l.limitsQuotas}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADDITIONAL_RULES.map((rule, index) => (
            <div key={index} className="p-4 bg-card border rounded-lg border-l-4 border-l-secondary">
              <div className="flex items-center gap-2 font-bold mb-2">
                <span className="text-xl">{rule.icon}</span>
                <span className="text-sm">{rule.title[language]}</span>
              </div>
              <div className="text-2xl font-extrabold text-secondary mb-2">{rule.value[language]}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{rule.description[language]}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
