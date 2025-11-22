import { Card } from '@/components/ui/card'
import type { Language, Person } from '@/lib/ptw-types'
import { ROLE_LABELS, ROLE_COLORS, PROCEDURE_DUTIES } from '@/lib/ptw-constants'

interface RolesTabProps {
  persons: Person[]
  language: Language
}

export function RolesTab({ persons, language }: RolesTabProps) {
  const labels = {
    ru: {
      title: 'Роли и обязанности',
      personnel: 'персонал',
    },
    tr: {
      title: 'Roller ve Sorumluluklar',
      personnel: 'personel',
    },
    en: {
      title: 'Roles and Responsibilities',
      personnel: 'personnel',
    },
  }

  const l = labels[language]

  const roles = ['issuer', 'supervisor', 'foreman', 'worker'] as const

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <span>🎭</span>
        {l.title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => {
          const count = persons.filter((p) => p.role === role).length
          const duties = PROCEDURE_DUTIES[role][language]

          return (
            <Card key={role} className="p-6 border-t-4" style={{ borderTopColor: ROLE_COLORS[role] }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: ROLE_COLORS[role] }}>
                {ROLE_LABELS[role][language]}
              </h3>
              <p className="text-sm font-semibold text-muted-foreground mb-4">
                {count} {l.personnel}
              </p>
              <div className="space-y-2">
                {duties.slice(0, 3).map((duty, index) => (
                  <div key={index} className="flex gap-2 text-sm">
                    <span className="font-bold" style={{ color: ROLE_COLORS[role] }}>
                      •
                    </span>
                    <span className="leading-relaxed">{duty}</span>
                  </div>
                ))}
                {duties.length > 3 && (
                  <p className="text-xs text-muted-foreground italic mt-2">
                    ... {language === 'ru' ? 'и ещё' : language === 'tr' ? 've' : 'and'} {duties.length - 3}{' '}
                    {language === 'ru' ? 'обязанностей' : language === 'tr' ? 'daha' : 'more'}
                  </p>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
