import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CombinedWorkEntry } from '@/lib/ptw-form-types'
import type { Language, Person } from '@/lib/ptw-types'

interface CombinedWorkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (entry: Partial<CombinedWorkEntry>) => void
  entry?: CombinedWorkEntry
  language: Language
  persons: Person[]
}

const toTextarea = (values: string[]) => values.join('\n')

const fromTextarea = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

export function CombinedWorkDialog({ open, onOpenChange, onSave, entry, language, persons }: CombinedWorkDialogProps) {
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [coordinatorId, setCoordinatorId] = useState('')
  const [ptwNumbers, setPtwNumbers] = useState('')
  const [organizations, setOrganizations] = useState('')
  const [workTypes, setWorkTypes] = useState('')
  const [safetyMeasures, setSafetyMeasures] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (entry) {
      setDate(entry.date)
      setLocation(entry.location)
      setCoordinatorId(entry.coordinatorPersonId)
      setPtwNumbers(toTextarea(entry.ptwNumbers))
      setOrganizations(toTextarea(entry.organizations))
      setWorkTypes(toTextarea(entry.workTypes))
      setSafetyMeasures(toTextarea(entry.safetyMeasures))
      setNotes(entry.notes)
    } else {
      const today = new Date().toISOString().split('T')[0]
      setDate(today)
      setLocation('')
      setCoordinatorId(persons[0]?.id ?? '')
      setPtwNumbers('')
      setOrganizations('')
      setWorkTypes('')
      setSafetyMeasures('')
      setNotes('')
    }
  }, [entry, open, persons])

  const labels = {
    ru: {
      title: entry ? 'Редактировать запись' : 'Добавить запись',
      date: 'Дата',
      location: 'Место работ',
      coordinator: 'Координатор',
      ptwNumbers: 'Наряды-допуски (по одному в строке)',
      organizations: 'Организации (по одной в строке)',
      workTypes: 'Виды работ (по одному в строке)',
      safetyMeasures: 'Меры безопасности (по одной в строке)',
      notes: 'Примечания',
      cancel: 'Отмена',
      save: 'Сохранить',
    },
    tr: {
      title: entry ? 'Kaydı Düzenle' : 'Kayıt Ekle',
      date: 'Tarih',
      location: 'İş yeri',
      coordinator: 'Koordinatör',
      ptwNumbers: 'İş izinleri (her satıra bir tane)',
      organizations: 'Organizasyonlar (her satıra bir tane)',
      workTypes: 'İş türleri (her satıra bir tane)',
      safetyMeasures: 'Güvenlik önlemleri (her satıra bir tane)',
      notes: 'Notlar',
      cancel: 'İptal',
      save: 'Kaydet',
    },
    en: {
      title: entry ? 'Edit Entry' : 'Add Entry',
      date: 'Date',
      location: 'Work location',
      coordinator: 'Coordinator',
      ptwNumbers: 'PTW numbers (one per line)',
      organizations: 'Organizations (one per line)',
      workTypes: 'Work types (one per line)',
      safetyMeasures: 'Safety measures (one per line)',
      notes: 'Notes',
      cancel: 'Cancel',
      save: 'Save',
    },
  }

  const l = labels[language]

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!date || !location || !coordinatorId) return

    onSave({
      date,
      location,
      coordinatorPersonId: coordinatorId,
      ptwNumbers: fromTextarea(ptwNumbers),
      organizations: fromTextarea(organizations),
      workTypes: fromTextarea(workTypes),
      safetyMeasures: fromTextarea(safetyMeasures),
      notes: notes.trim(),
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{l.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="combined-date">{l.date} *</Label>
              <Input id="combined-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="combined-coordinator">{l.coordinator} *</Label>
              <Select value={coordinatorId} onValueChange={setCoordinatorId}>
                <SelectTrigger id="combined-coordinator">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {persons.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="combined-location">{l.location} *</Label>
            <Input id="combined-location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="combined-ptw">{l.ptwNumbers}</Label>
              <Textarea id="combined-ptw" value={ptwNumbers} onChange={(e) => setPtwNumbers(e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="combined-organizations">{l.organizations}</Label>
              <Textarea id="combined-organizations" value={organizations} onChange={(e) => setOrganizations(e.target.value)} rows={4} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="combined-work-types">{l.workTypes}</Label>
              <Textarea id="combined-work-types" value={workTypes} onChange={(e) => setWorkTypes(e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="combined-safety">{l.safetyMeasures}</Label>
              <Textarea id="combined-safety" value={safetyMeasures} onChange={(e) => setSafetyMeasures(e.target.value)} rows={4} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="combined-notes">{l.notes}</Label>
            <Textarea id="combined-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {l.cancel}
            </Button>
            <Button type="submit">{l.save}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
