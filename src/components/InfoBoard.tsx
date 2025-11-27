import { useState } from 'react'
import { useKV } from '@/hooks/use-kv'
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
    <Card className="border-accent/30 shadow-lg bg-gradient-to-br from-accent/5 via-card to-card overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-accent/15 via-accent/10 to-accent/5 border-b border-accent/30 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <span className="text-xl">📢</span>
            {l.title}
          </CardTitle>
          {isAdmin && !isEditing && (
            <Button size="sm" onClick={handleAdd} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm h-8">
              <Plus className="h-3.5 w-3.5 mr-1" />
              {l.add}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {isEditing ? (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-accent/20">
            <Input
              id="announcement-title"
              placeholder={l.titlePlaceholder}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-semibold h-9"
            />
            <Textarea
              id="announcement-content"
              placeholder={l.contentPlaceholder}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-8">
                <X className="h-3.5 w-3.5 mr-1" />
                {l.cancel}
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90 h-8">
                <Check className="h-3.5 w-3.5 mr-1" />
                {l.save}
              </Button>
            </div>
          </div>
        ) : allAnnouncements.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <div className="text-3xl mb-1.5">📋</div>
            <p className="text-sm">{l.noAnnouncements}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {allAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-2.5 bg-card border border-accent/20 rounded-lg hover:shadow-md hover:border-accent/40 transition-all duration-200 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent to-accent/40 opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between gap-2 pl-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-0.5 text-foreground leading-tight">
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words leading-relaxed line-clamp-2">
                      {announcement.content}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 mt-1.5 flex items-center gap-1">
                      <span>🕐</span>
                      {new Date(announcement.date).toLocaleDateString(
                        language === 'ru' ? 'ru-RU' : language === 'tr' ? 'tr-TR' : 'en-US',
                        { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
                      )}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-0.5 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(announcement)}
                        className="h-6 w-6 p-0 hover:bg-accent/20"
                      >
                        <PencilSimple className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(announcement.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash className="h-3 w-3" />
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
