import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import type { Person, Role, Language } from '@/lib/ptw-types'
import { ROLE_LABELS, PROCEDURE_DUTIES } from '@/lib/ptw-constants'

interface PersonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (person: Partial<Person>) => void
  person?: Person
  language: Language
}

export function PersonDialog({ open, onOpenChange, onSave, person, language }: PersonDialogProps) {
  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    position: '',
    role: 'worker',
    email: '',
    phone: '',
  })

  useEffect(() => {
    if (person) {
      setFormData(person)
    } else {
      setFormData({
        name: '',
        position: '',
        role: 'worker',
        email: '',
        phone: '',
      })
    }
  }, [person, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.position && formData.role) {
      onSave(formData)
      onOpenChange(false)
    }
  }

  const labels = {
    ru: {
      title: person ? 'Редактировать сотрудника' : 'Добавить сотрудника',
      name: 'ФИО',
      position: 'Должность',
      role: 'Роль',
      email: 'Email',
      phone: 'Телефон',
      selectRole: 'Выберите роль',
      dutiesPreview: 'Обязанности (автоматически определяются):',
      cancel: 'Отмена',
      save: 'Сохранить',
    },
    tr: {
      title: person ? 'Çalışanı Düzenle' : 'Çalışan Ekle',
      name: 'Ad Soyad',
      position: 'Pozisyon',
      role: 'Rol',
      email: 'Email',
      phone: 'Telefon',
      selectRole: 'Rol Seçin',
      dutiesPreview: 'Yükümlülükler (otomatik belirlenir):',
      cancel: 'İptal',
      save: 'Kaydet',
    },
    en: {
      title: person ? 'Edit Personnel' : 'Add Personnel',
      name: 'Full Name',
      position: 'Position',
      role: 'Role',
      email: 'Email',
      phone: 'Phone',
      selectRole: 'Select Role',
      dutiesPreview: 'Duties (automatically determined):',
      cancel: 'Cancel',
      save: 'Save',
    },
  }

  const l = labels[language]
  const selectedRoleDuties = formData.role ? PROCEDURE_DUTIES[formData.role][language] : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{l.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{l.name}</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">{l.position}</Label>
            <Input
              id="position"
              value={formData.position || ''}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{l.role}</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as Role })}>
              <SelectTrigger id="role">
                <SelectValue placeholder={l.selectRole} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issuer">{ROLE_LABELS.issuer[language]}</SelectItem>
                <SelectItem value="supervisor">{ROLE_LABELS.supervisor[language]}</SelectItem>
                <SelectItem value="foreman">{ROLE_LABELS.foreman[language]}</SelectItem>
                <SelectItem value="worker">{ROLE_LABELS.worker[language]}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{l.email}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{l.phone}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {formData.role && selectedRoleDuties.length > 0 && (
            <Card className="p-4 bg-muted/50">
              <p className="font-semibold text-sm mb-2">{l.dutiesPreview}</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {selectedRoleDuties.slice(0, 3).map((duty, index) => (
                  <div key={index} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{duty}</span>
                  </div>
                ))}
                {selectedRoleDuties.length > 3 && (
                  <p className="text-xs text-muted-foreground italic">
                    ... {language === 'ru' ? 'и ещё' : language === 'tr' ? 've' : 'and'} {selectedRoleDuties.length - 3}{' '}
                    {language === 'ru' ? 'обязанностей' : language === 'tr' ? 'daha' : 'more'}
                  </p>
                )}
              </div>
            </Card>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {l.cancel}
            </Button>
            <Button type="submit" className="flex-1">
              💾 {l.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
