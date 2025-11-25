import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, CalendarBlank, MapPin, Users } from '@phosphor-icons/react'
import type { Language, Person } from '@/lib/ptw-types'
import type { CombinedWorkEntry } from '@/lib/ptw-form-types'
import { format } from 'date-fns'

interface CombinedWorksTabProps {
  language: Language
  isAdmin: boolean
  persons: Person[]
}

export function CombinedWorksTab({ language, isAdmin, persons }: CombinedWorksTabProps) {
  const [combinedWorks, setCombinedWorks] = useKV<CombinedWorkEntry[]>('ptw-combined-works', [])

  const labels = {
    ru: {
      title: 'Журнал совмещенных работ',
      subtitle: 'STE-LOG-10-27',
      create: 'Добавить запись',
      date: 'Дата',
      location: 'Место работ',
      coordinator: 'Координатор',
      permits: 'Наряды-допуски',
      organizations: 'Организации',
      workTypes: 'Виды работ',
      safetyMeasures: 'Меры безопасности',
      notes: 'Примечания',
      noEntries: 'Записей нет',
      createFirst: 'Добавьте первую запись о совмещенных работах',
      description: 'Регистрация совмещенных работ, выполняемых одновременно несколькими организациями на одной площадке',
    },
    tr: {
      title: 'Birleştirilmiş İşler Günlüğü',
      subtitle: 'STE-LOG-10-27',
      create: 'Kayıt Ekle',
      date: 'Tarih',
      location: 'İş Yeri',
      coordinator: 'Koordinatör',
      permits: 'İş İzinleri',
      organizations: 'Organizasyonlar',
      workTypes: 'İş Türleri',
      safetyMeasures: 'Güvenlik Önlemleri',
      notes: 'Notlar',
      noEntries: 'Kayıt yok',
      createFirst: 'İlk birleştirilmiş iş kaydını ekleyin',
      description: 'Aynı sahada aynı anda birden fazla kuruluş tarafından yapılan işlerin kaydı',
    },
    en: {
      title: 'Combined Works Journal',
      subtitle: 'STE-LOG-10-27',
      create: 'Add Entry',
      date: 'Date',
      location: 'Location',
      coordinator: 'Coordinator',
      permits: 'Permits',
      organizations: 'Organizations',
      workTypes: 'Work Types',
      safetyMeasures: 'Safety Measures',
      notes: 'Notes',
      noEntries: 'No entries',
      createFirst: 'Add the first combined work entry',
      description: 'Registration of combined works performed simultaneously by multiple organizations at one site',
    },
  }

  const l = labels[language]

  const getCoordinatorName = (personId: string) => {
    const person = persons.find((p) => p.id === personId)
    return person?.name || personId
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">{l.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {l.subtitle}
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
            {l.description}
          </p>
        </div>
        {isAdmin && (
          <Button className="font-semibold">
            <Plus className="h-4 w-4 mr-1" />
            {l.create}
          </Button>
        )}
      </div>

      {(combinedWorks || []).length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{l.noEntries}</h3>
            <p className="text-muted-foreground mb-4">{l.createFirst}</p>
            {isAdmin && (
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                {l.create}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(combinedWorks || [])
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarBlank className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">
                          {format(new Date(entry.date), 'dd MMMM yyyy')}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {entry.location}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {entry.ptwNumbers.length}{' '}
                      {language === 'ru' ? 'НД' : language === 'tr' ? 'İİ' : 'PTW'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{l.coordinator}</p>
                      <p className="text-sm">{getCoordinatorName(entry.coordinatorPersonId)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{l.permits}</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.ptwNumbers.map((num) => (
                          <Badge key={num} variant="secondary" className="text-xs">
                            {num}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {entry.organizations.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{l.organizations}</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.organizations.map((org, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {org}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.workTypes.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{l.workTypes}</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.workTypes.map((type, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.safetyMeasures.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{l.safetyMeasures}</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        {entry.safetyMeasures.map((measure, idx) => (
                          <li key={idx}>{measure}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.notes && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{l.notes}</p>
                      <p className="text-sm">{entry.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
