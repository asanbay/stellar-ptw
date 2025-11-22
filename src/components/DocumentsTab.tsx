import { Card } from '@/components/ui/card'
import type { Language } from '@/lib/ptw-types'
import { PROCEDURE_DOCUMENTS } from '@/lib/ptw-constants'

interface DocumentsTabProps {
  language: Language
}

export function DocumentsTab({ language }: DocumentsTabProps) {
  const labels = {
    ru: {
      title: 'Документы',
    },
    tr: {
      title: 'Belgeler',
    },
    en: {
      title: 'Documents',
    },
  }

  const l = labels[language]

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>📄</span>
          {l.title}
        </h2>
        <ul className="space-y-0">
          {PROCEDURE_DOCUMENTS.map((doc, index) => (
            <li key={index} className="py-3 border-b last:border-0 flex gap-3">
              <span className="font-mono font-bold text-primary text-sm flex-shrink-0">{doc.code}</span>
              <span className="text-sm">{doc.name[language]}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
