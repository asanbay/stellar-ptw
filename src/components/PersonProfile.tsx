import { PencilSimple, Trash, Envelope, Phone } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Person, Language } from '@/lib/ptw-types'
import { ROLE_COLORS, ROLE_LABELS, PROCEDURE_DUTIES, AUTO_QUALIFICATIONS, AUTO_ORDER_TYPES } from '@/lib/ptw-constants'
import { getInitials } from '@/lib/ptw-utils'

interface PersonProfileProps {
  person: Person
  language: Language
  isAdmin: boolean
  onEdit: (person: Person) => void
  onDelete: (id: string) => void
}

export function PersonProfile({ person, language, isAdmin, onEdit, onDelete }: PersonProfileProps) {
  const duties = PROCEDURE_DUTIES[person.role][language]
  const qualifications = AUTO_QUALIFICATIONS[person.role][language]
  const orderTypes = AUTO_ORDER_TYPES[person.role]

  const labels = {
    ru: {
      duties: 'Обязанности',
      qualifications: 'Квалификация',
      permitTypes: 'Типы нарядов',
      edit: 'Редактировать',
      delete: 'Удалить',
    },
    tr: {
      duties: 'Yükümlülükler',
      qualifications: 'Nitelikler',
      permitTypes: 'İzin Türleri',
      edit: 'Düzenle',
      delete: 'Sil',
    },
    en: {
      duties: 'Duties',
      qualifications: 'Qualifications',
      permitTypes: 'Permit Types',
      edit: 'Edit',
      delete: 'Delete',
    },
  }

  const l = labels[language]

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${ROLE_COLORS[person.role]}, color-mix(in oklch, ${ROLE_COLORS[person.role]} 80%, black))` }}
          >
            {getInitials(person.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-2">{person.name}</h2>
            <Badge
              className="mb-2 font-semibold"
              style={{
                backgroundColor: `color-mix(in oklch, ${ROLE_COLORS[person.role]} 20%, transparent)`,
                color: ROLE_COLORS[person.role],
                borderColor: ROLE_COLORS[person.role],
              }}
            >
              {ROLE_LABELS[person.role][language]}
            </Badge>
            <p className="text-muted-foreground text-sm">{person.position}</p>
            {(person.email || person.phone) && (
              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                {person.email && (
                  <a href={`mailto:${person.email}`} className="flex items-center gap-1 text-primary hover:underline">
                    <Envelope className="h-4 w-4" />
                    {person.email}
                  </a>
                )}
                {person.phone && (
                  <a href={`tel:${person.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                    <Phone className="h-4 w-4" />
                    {person.phone}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onEdit(person)} className="flex-1">
              <PencilSimple className="h-4 w-4 mr-2" />
              {l.edit}
            </Button>
            <Button variant="destructive" onClick={() => onDelete(person.id)} className="flex-1">
              <Trash className="h-4 w-4 mr-2" />
              {l.delete}
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-lg">📋</span>
          {l.duties}
        </h3>
        <ul className="space-y-2">
          {duties.map((duty, index) => (
            <li key={index} className="flex gap-3 text-sm">
              <span className="text-primary font-bold flex-shrink-0">✓</span>
              <span className="leading-relaxed">{duty}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-lg">🎓</span>
          {l.qualifications}
        </h3>
        <ul className="space-y-2">
          {qualifications.map((qual, index) => (
            <li key={index} className="flex gap-3 text-sm">
              <span className="text-primary font-bold flex-shrink-0">✓</span>
              <span className="leading-relaxed">{qual}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-lg">📑</span>
          {l.permitTypes}
        </h3>
        <div className="flex flex-wrap gap-2">
          {orderTypes.map((type) => (
            <Badge key={type} variant="secondary" className="font-mono text-xs">
              {type}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  )
}
