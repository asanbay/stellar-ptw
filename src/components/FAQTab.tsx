import { useRef, useState } from 'react'
import { Plus, PencilSimple, Trash, Question } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { FAQDialog } from '@/components/FAQDialog'
import type { FAQItem, Language } from '@/lib/ptw-types'
import { editLocks, getDefaultOwnerId, startHeartbeat } from '@/lib/edit-locks'
import { toast } from 'sonner'

interface FAQTabProps {
  language: Language
  isAdmin: boolean
  faqs: FAQItem[]
  onAddFAQ: (faq: Partial<FAQItem>) => void
  onEditFAQ: (id: string, faq: Partial<FAQItem>) => void
  onDeleteFAQ: (id: string) => void
}

export function FAQTab({ language, isAdmin, faqs, onAddFAQ, onEditFAQ, onDeleteFAQ }: FAQTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | undefined>()
  const ownerIdRef = useRef<string>(getDefaultOwnerId())
  const heartbeatRef = useRef<{ stop: () => void } | null>(null)

  const labels = {
    ru: {
      title: 'Часто задаваемые вопросы',
      description: 'Найдите ответы на распространенные вопросы о системе PTW',
      addNew: 'Добавить вопрос',
      edit: 'Редактировать',
      delete: 'Удалить',
      noFAQs: 'Пока нет вопросов',
      noFAQsDesc: 'Администратор может добавить часто задаваемые вопросы',
      category: 'Категория',
      general: 'Общие',
    },
    tr: {
      title: 'Sık Sorulan Sorular',
      description: 'PTW sistemi hakkında yaygın soruların cevaplarını bulun',
      addNew: 'Soru Ekle',
      edit: 'Düzenle',
      delete: 'Sil',
      noFAQs: 'Henüz soru yok',
      noFAQsDesc: 'Yönetici sık sorulan soruları ekleyebilir',
      category: 'Kategori',
      general: 'Genel',
    },
    en: {
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions about the PTW system',
      addNew: 'Add Question',
      edit: 'Edit',
      delete: 'Delete',
      noFAQs: 'No questions yet',
      noFAQsDesc: 'Administrator can add frequently asked questions',
      category: 'Category',
      general: 'General',
    },
  }

  const l = labels[language]

  const handleAddClick = () => {
    setEditingFAQ(undefined)
    setDialogOpen(true)
  }

  const handleEditClick = async (faq: FAQItem) => {
    const { ok } = await editLocks.acquire('faq', faq.id, ownerIdRef.current)
    if (!ok) {
      toast.warning(
        language === 'ru'
          ? 'Этот вопрос уже редактируется'
          : language === 'tr'
            ? 'Bu soru düzenleniyor'
            : 'This question is being edited'
      )
      return
    }
    setEditingFAQ(faq)
    setDialogOpen(true)
    heartbeatRef.current?.stop?.()
    heartbeatRef.current = startHeartbeat('faq', faq.id, ownerIdRef.current)
  }

  const handleSave = (faqData: Partial<FAQItem>) => {
    if (editingFAQ) {
      onEditFAQ(editingFAQ.id, faqData)
    } else {
      onAddFAQ(faqData)
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    onDeleteFAQ(id)
  }

  const sortedFAQs = [...faqs].sort((a, b) => a.order - b.order)

  const categories = Array.from(new Set(sortedFAQs.map(f => f.category || l.general)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Question className="h-8 w-8 text-primary" weight="duotone" />
            {l.title}
          </h2>
          <p className="text-muted-foreground mt-1">{l.description}</p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddClick} className="font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            {l.addNew}
          </Button>
        )}
      </div>

      {sortedFAQs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Question className="h-16 w-16 text-muted-foreground mb-4" weight="duotone" />
            <h3 className="text-xl font-semibold mb-2">{l.noFAQs}</h3>
            <p className="text-muted-foreground text-center">{l.noFAQsDesc}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryFAQs = sortedFAQs.filter(f => (f.category || l.general) === category)
            if (categoryFAQs.length === 0) return null

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {category}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {categoryFAQs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex items-start justify-between w-full pr-4">
                            <span className="font-semibold">{faq.question[language]}</span>
                            {isAdmin && (
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditClick(faq)
                                  }}
                                >
                                  <PencilSimple className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(faq.id)
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 pb-4 text-muted-foreground whitespace-pre-wrap">
                            {faq.answer[language]}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {isAdmin && (
        <FAQDialog
          open={dialogOpen}
          onOpenChange={async (open) => {
            setDialogOpen(open)
            if (!open && editingFAQ) {
              heartbeatRef.current?.stop?.()
              heartbeatRef.current = null
              await editLocks.release('faq', editingFAQ.id, ownerIdRef.current)
              setEditingFAQ(undefined)
            }
          }}
          onSave={handleSave}
          faq={editingFAQ}
          language={language}
        />
      )}
    </div>
  )
}
