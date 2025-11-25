import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Department, Language } from '@/lib/ptw-types'

const EMOJI_OPTIONS = ['🏢', '⚙️', '🔧', '💼', '🏗️', '🔬', '📊', '🎯', '⚡', '🛠️', '🌟', '💻', '📱', '🚀', '🏭']
const COLOR_OPTIONS = [
  { value: 'oklch(0.55 0.22 25)', label: 'Red' },
  { value: 'oklch(0.70 0.15 45)', label: 'Orange' },
  { value: 'oklch(0.75 0.18 85)', label: 'Yellow' },
  { value: 'oklch(0.65 0.18 145)', label: 'Green' },
  { value: 'oklch(0.60 0.15 220)', label: 'Blue' },
  { value: 'oklch(0.55 0.20 280)', label: 'Purple' },
  { value: 'oklch(0.60 0.15 330)', label: 'Pink' },
]

interface DepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (department: Partial<Department>) => void
  department?: Department
  language: Language
}

export function DepartmentDialog({ open, onOpenChange, onSave, department, language }: DepartmentDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [emoji, setEmoji] = useState('🏢')
  const [color, setColor] = useState('oklch(0.60 0.15 220)')

  useEffect(() => {
    if (department) {
      setName(department.name)
      setDescription(department.description || '')
      setEmoji(department.emoji)
      setColor(department.color)
    } else {
      setName('')
      setDescription('')
      setEmoji('🏢')
      setColor('oklch(0.60 0.15 220)')
    }
  }, [department, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      description: description.trim(),
      emoji,
      color,
    })

    onOpenChange(false)
  }

  const labels = {
    ru: {
      title: department ? 'Редактировать отдел' : 'Новый отдел',
      name: 'Название отдела',
      description: 'Описание',
      emoji: 'Иконка',
      color: 'Цвет',
      cancel: 'Отмена',
      save: 'Сохранить',
    },
    tr: {
      title: department ? 'Departmanı Düzenle' : 'Yeni Departman',
      name: 'Departman Adı',
      description: 'Açıklama',
      emoji: 'İkon',
      color: 'Renk',
      cancel: 'İptal',
      save: 'Kaydet',
    },
    en: {
      title: department ? 'Edit Department' : 'New Department',
      name: 'Department Name',
      description: 'Description',
      emoji: 'Icon',
      color: 'Color',
      cancel: 'Cancel',
      save: 'Save',
    },
  }

  const l = labels[language]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{l.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dept-name">{l.name}</Label>
              <Input
                id="dept-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={l.name}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dept-description">{l.description}</Label>
              <Textarea
                id="dept-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={l.description}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{l.emoji}</Label>
                <div className="grid grid-cols-5 gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`text-2xl p-2 rounded border-2 transition-all hover:scale-110 ${
                        emoji === e ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>{l.color}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`h-10 rounded border-2 transition-all hover:scale-105 ${
                        color === c.value ? 'border-foreground scale-105' : 'border-border'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border-2 bg-card" style={{ borderColor: color }}>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold">{name || l.name}</div>
                  <div className="text-sm text-muted-foreground">{description || l.description}</div>
                </div>
              </div>
            </div>
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
