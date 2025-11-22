import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { PencilSimple, Check, X, Plus, Trash } from '@phosphor-icons/react'
import type { Language } from '@/lib/ptw-types'

interface Announcement {
  id: string
  title: string
  content: string
  date: string
}

interface InfoBoardProps {
  language: Language
  isAdmin: boolean
}

export function InfoBoard({ language, isAdmin }: InfoBoardProps) {
  const [announcements, setAnnouncements] = useKV<Announcement[]>('ptw-announcements', [])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const labels = {
    ru: {
      title: '📢 Информационный стенд',
      noAnnouncements: 'Нет объявлений',
      add: 'Добавить объявление',
      edit: 'Редактировать',
      delete: 'Удалить',
      save: 'Сохранить',
      cancel: 'Отмена',
      titlePlaceholder: 'Заголовок объявления',
      contentPlaceholder: 'Текст объявления...',
    },
    tr: {
      title: '📢 Bilgi Panosu',
      noAnnouncements: 'Duyuru yok',
      add: 'Duyuru Ekle',
      edit: 'Düzenle',
      delete: 'Sil',
      save: 'Kaydet',
      cancel: 'İptal',
      titlePlaceholder: 'Duyuru başlığı',
      contentPlaceholder: 'Duyuru metni...',
    },
    en: {
      title: '📢 Information Board',
      noAnnouncements: 'No announcements',
      add: 'Add Announcement',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      titlePlaceholder: 'Announcement title',
      contentPlaceholder: 'Announcement text...',
    },
  }

  const l = labels[language]
  const allAnnouncements = announcements || []

  const handleAdd = () => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
    setIsEditing(true)
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id)
    setEditTitle(announcement.title)
    setEditContent(announcement.content)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!editTitle.trim() || !editContent.trim()) return

    if (editingId) {
      setAnnouncements((current) =>
        (current || []).map((a) =>
          a.id === editingId
            ? { ...a, title: editTitle, content: editContent }
            : a
        )
      )
    } else {
      const newAnnouncement: Announcement = {
        id: crypto.randomUUID(),
        title: editTitle,
        content: editContent,
        date: new Date().toISOString(),
      }
      setAnnouncements((current) => [newAnnouncement, ...(current || [])])
    }

    setIsEditing(false)
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  const handleDelete = (id: string) => {
    setAnnouncements((current) => (current || []).filter((a) => a.id !== id))
  }

  return (
    <Card className="border-accent/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 border-b border-accent/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {l.title}
          </CardTitle>
          {isAdmin && !isEditing && (
            <Button size="sm" onClick={handleAdd} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-1" />
              {l.add}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <Input
              id="announcement-title"
              placeholder={l.titlePlaceholder}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-semibold"
            />
            <Textarea
              id="announcement-content"
              placeholder={l.contentPlaceholder}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                {l.cancel}
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Check className="h-4 w-4 mr-1" />
                {l.save}
              </Button>
            </div>
          </div>
        ) : allAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📋</div>
            <p>{l.noAnnouncements}</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {allAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 text-foreground">
                      {announcement.title}
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(announcement.date).toLocaleDateString(
                        language === 'ru' ? 'ru-RU' : language === 'tr' ? 'tr-TR' : 'en-US',
                        { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                      )}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(announcement)}
                        className="h-7 w-7 p-0"
                      >
                        <PencilSimple className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(announcement.id)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
