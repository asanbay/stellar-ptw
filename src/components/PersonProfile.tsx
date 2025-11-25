import { useState } from 'react'
import { PencilSimple, Trash, Envelope, Phone, Check, X, Plus } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { Person, Language, Department } from '@/lib/ptw-types'
import { ROLE_COLORS, ROLE_LABELS, PROCEDURE_DUTIES, AUTO_QUALIFICATIONS, AUTO_ORDER_TYPES } from '@/lib/ptw-constants'
import { getInitials } from '@/lib/ptw-utils'

interface PersonProfileProps {
  person: Person
  language: Language
  isAdmin: boolean
  departments: Department[]
  onEdit: (person: Person) => void
  onDelete: (id: string) => void
  onUpdateDuties?: (personId: string, duties: string[]) => void
  onUpdateQualifications?: (personId: string, qualifications: string[]) => void
}

export function PersonProfile({ person, language, isAdmin, departments, onEdit, onDelete, onUpdateDuties, onUpdateQualifications }: PersonProfileProps) {
  const defaultDuties = PROCEDURE_DUTIES[person.role][language]
  const defaultQualifications = AUTO_QUALIFICATIONS[person.role][language]
  const orderTypes = AUTO_ORDER_TYPES[person.role]

  const duties = person.customDuties || defaultDuties
  const qualifications = person.customQualifications || defaultQualifications
  const department = departments.find((d) => d.id === person.departmentId)

  const [editingDuties, setEditingDuties] = useState(false)
  const [editingQualifications, setEditingQualifications] = useState(false)
  const [tempDuties, setTempDuties] = useState<string[]>([])
  const [tempQualifications, setTempQualifications] = useState<string[]>([])
  const [newDuty, setNewDuty] = useState('')
  const [newQualification, setNewQualification] = useState('')

  const labels = {
    ru: {
      duties: 'Обязанности',
      qualifications: 'Квалификация',
      permitTypes: 'Типы нарядов',
      edit: 'Редактировать',
      delete: 'Удалить',
      save: 'Сохранить',
      cancel: 'Отмена',
      add: 'Добавить',
      addDuty: 'Добавить обязанность',
      addQualification: 'Добавить квалификацию',
      reset: 'Сбросить',
    },
    tr: {
      duties: 'Yükümlülükler',
      qualifications: 'Nitelikler',
      permitTypes: 'İzin Türleri',
      edit: 'Düzenle',
      delete: 'Sil',
      save: 'Kaydet',
      cancel: 'İptal',
      add: 'Ekle',
      addDuty: 'Yükümlülük ekle',
      addQualification: 'Nitelik ekle',
      reset: 'Sıfırla',
    },
    en: {
      duties: 'Duties',
      qualifications: 'Qualifications',
      permitTypes: 'Permit Types',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      add: 'Add',
      addDuty: 'Add duty',
      addQualification: 'Add qualification',
      reset: 'Reset',
    },
  }

  const l = labels[language]

  const handleEditDuties = () => {
    setTempDuties([...duties])
    setEditingDuties(true)
  }

  const handleSaveDuties = () => {
    if (onUpdateDuties) {
      onUpdateDuties(person.id, tempDuties)
    }
    setEditingDuties(false)
    setNewDuty('')
  }

  const handleCancelDuties = () => {
    setEditingDuties(false)
    setTempDuties([])
    setNewDuty('')
  }

  const handleAddDuty = () => {
    if (newDuty.trim()) {
      setTempDuties([...tempDuties, newDuty.trim()])
      setNewDuty('')
    }
  }

  const handleRemoveDuty = (index: number) => {
    setTempDuties(tempDuties.filter((_, i) => i !== index))
  }

  const handleEditQualifications = () => {
    setTempQualifications([...qualifications])
    setEditingQualifications(true)
  }

  const handleSaveQualifications = () => {
    if (onUpdateQualifications) {
      onUpdateQualifications(person.id, tempQualifications)
    }
    setEditingQualifications(false)
    setNewQualification('')
  }

  const handleCancelQualifications = () => {
    setEditingQualifications(false)
    setTempQualifications([])
    setNewQualification('')
  }

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      setTempQualifications([...tempQualifications, newQualification.trim()])
      setNewQualification('')
    }
  }

  const handleRemoveQualification = (index: number) => {
    setTempQualifications(tempQualifications.filter((_, i) => i !== index))
  }

  const handleResetDuties = () => {
    if (onUpdateDuties) {
      onUpdateDuties(person.id, defaultDuties)
    }
    setEditingDuties(false)
  }

  const handleResetQualifications = () => {
    if (onUpdateQualifications) {
      onUpdateQualifications(person.id, defaultQualifications)
    }
    setEditingQualifications(false)
  }

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
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge
                className="font-semibold"
                style={{
                  backgroundColor: `color-mix(in oklch, ${ROLE_COLORS[person.role]} 20%, transparent)`,
                  color: ROLE_COLORS[person.role],
                  borderColor: ROLE_COLORS[person.role],
                }}
              >
                {ROLE_LABELS[person.role][language]}
              </Badge>
              {department && (
                <Badge
                  className="font-semibold"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${department.color} 20%, transparent)`,
                    color: department.color,
                    borderColor: department.color,
                  }}
                >
                  {department.emoji} {department.name}
                </Badge>
              )}
            </div>
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-lg">📋</span>
            {l.duties}
          </h3>
          {isAdmin && !editingDuties && (
            <div className="flex gap-2">
              {person.customDuties && (
                <Button size="sm" variant="outline" onClick={handleResetDuties} className="h-8 text-xs">
                  {l.reset}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleEditDuties} className="h-8">
                <PencilSimple className="h-3.5 w-3.5 mr-1" />
                {l.edit}
              </Button>
            </div>
          )}
        </div>
        {editingDuties ? (
          <div className="space-y-3">
            <ul className="space-y-2">
              {tempDuties.map((duty, index) => (
                <li key={index} className="flex gap-2 text-sm items-start bg-muted/50 p-2 rounded">
                  <span className="text-primary font-bold flex-shrink-0 mt-0.5">✓</span>
                  <span className="leading-relaxed flex-1">{duty}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveDuty(index)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive flex-shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input
                placeholder={l.addDuty}
                value={newDuty}
                onChange={(e) => setNewDuty(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDuty()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddDuty} disabled={!newDuty.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={handleCancelDuties}>
                <X className="h-3.5 w-3.5 mr-1" />
                {l.cancel}
              </Button>
              <Button size="sm" onClick={handleSaveDuties} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Check className="h-3.5 w-3.5 mr-1" />
                {l.save}
              </Button>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {duties.map((duty, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span className="leading-relaxed">{duty}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-lg">🎓</span>
            {l.qualifications}
          </h3>
          {isAdmin && !editingQualifications && (
            <div className="flex gap-2">
              {person.customQualifications && (
                <Button size="sm" variant="outline" onClick={handleResetQualifications} className="h-8 text-xs">
                  {l.reset}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleEditQualifications} className="h-8">
                <PencilSimple className="h-3.5 w-3.5 mr-1" />
                {l.edit}
              </Button>
            </div>
          )}
        </div>
        {editingQualifications ? (
          <div className="space-y-3">
            <ul className="space-y-2">
              {tempQualifications.map((qual, index) => (
                <li key={index} className="flex gap-2 text-sm items-start bg-muted/50 p-2 rounded">
                  <span className="text-primary font-bold flex-shrink-0 mt-0.5">✓</span>
                  <span className="leading-relaxed flex-1">{qual}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveQualification(index)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive flex-shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input
                placeholder={l.addQualification}
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddQualification()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddQualification} disabled={!newQualification.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={handleCancelQualifications}>
                <X className="h-3.5 w-3.5 mr-1" />
                {l.cancel}
              </Button>
              <Button size="sm" onClick={handleSaveQualifications} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Check className="h-3.5 w-3.5 mr-1" />
                {l.save}
              </Button>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {qualifications.map((qual, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span className="leading-relaxed">{qual}</span>
              </li>
            ))}
          </ul>
        )}
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
