import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { FAQItem, Language, Translation } from '@/lib/ptw-types'

interface FAQDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (faq: Partial<FAQItem>) => void
  faq?: FAQItem
  language: Language
}

export function FAQDialog({ open, onOpenChange, onSave, faq, language }: FAQDialogProps) {
  const [questionRu, setQuestionRu] = useState('')
  const [questionTr, setQuestionTr] = useState('')
  const [questionEn, setQuestionEn] = useState('')
  const [answerRu, setAnswerRu] = useState('')
  const [answerTr, setAnswerTr] = useState('')
  const [answerEn, setAnswerEn] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (faq) {
      setQuestionRu(faq.question.ru)
      setQuestionTr(faq.question.tr)
      setQuestionEn(faq.question.en)
      setAnswerRu(faq.answer.ru)
      setAnswerTr(faq.answer.tr)
      setAnswerEn(faq.answer.en)
      setCategory(faq.category || '')
    } else {
      setQuestionRu('')
      setQuestionTr('')
      setQuestionEn('')
      setAnswerRu('')
      setAnswerTr('')
      setAnswerEn('')
      setCategory('')
    }
  }, [faq, open])

  const labels = {
    ru: {
      title: faq ? 'Редактировать вопрос' : 'Добавить вопрос',
      description: 'Заполните вопрос и ответ на всех языках',
      question: 'Вопрос',
      answer: 'Ответ',
      category: 'Категория (необязательно)',
      categoryPlaceholder: 'Например: Общие, Безопасность, Процедуры',
      save: 'Сохранить',
      cancel: 'Отмена',
      russian: 'Русский',
      turkish: 'Türkçe',
      english: 'English',
    },
    tr: {
      title: faq ? 'Soruyu Düzenle' : 'Soru Ekle',
      description: 'Soruyu ve cevabı tüm dillerde doldurun',
      question: 'Soru',
      answer: 'Cevap',
      category: 'Kategori (isteğe bağlı)',
      categoryPlaceholder: 'Örneğin: Genel, Güvenlik, Prosedürler',
      save: 'Kaydet',
      cancel: 'İptal',
      russian: 'Русский',
      turkish: 'Türkçe',
      english: 'English',
    },
    en: {
      title: faq ? 'Edit Question' : 'Add Question',
      description: 'Fill in the question and answer in all languages',
      question: 'Question',
      answer: 'Answer',
      category: 'Category (optional)',
      categoryPlaceholder: 'E.g.: General, Safety, Procedures',
      save: 'Save',
      cancel: 'Cancel',
      russian: 'Русский',
      turkish: 'Türkçe',
      english: 'English',
    },
  }

  const l = labels[language]

  const handleSave = () => {
    const question: Translation = { ru: questionRu, tr: questionTr, en: questionEn }
    const answer: Translation = { ru: answerRu, tr: answerTr, en: answerEn }

    onSave({
      question,
      answer,
      category: category.trim() || undefined,
      order: faq?.order ?? 999,
    })
  }

  const isValid = questionRu.trim() && questionTr.trim() && questionEn.trim() && answerRu.trim() && answerTr.trim() && answerEn.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{l.title}</DialogTitle>
          <DialogDescription>{l.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="category">{l.category}</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={l.categoryPlaceholder}
            />
          </div>

          <Tabs defaultValue="ru" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ru">🇷🇺 {l.russian}</TabsTrigger>
              <TabsTrigger value="tr">🇹🇷 {l.turkish}</TabsTrigger>
              <TabsTrigger value="en">🇬🇧 {l.english}</TabsTrigger>
            </TabsList>

            <TabsContent value="ru" className="space-y-4">
              <div>
                <Label htmlFor="question-ru">{l.question}</Label>
                <Input
                  id="question-ru"
                  value={questionRu}
                  onChange={(e) => setQuestionRu(e.target.value)}
                  placeholder="Введите вопрос на русском"
                />
              </div>
              <div>
                <Label htmlFor="answer-ru">{l.answer}</Label>
                <Textarea
                  id="answer-ru"
                  value={answerRu}
                  onChange={(e) => setAnswerRu(e.target.value)}
                  placeholder="Введите ответ на русском"
                  rows={6}
                />
              </div>
            </TabsContent>

            <TabsContent value="tr" className="space-y-4">
              <div>
                <Label htmlFor="question-tr">{l.question}</Label>
                <Input
                  id="question-tr"
                  value={questionTr}
                  onChange={(e) => setQuestionTr(e.target.value)}
                  placeholder="Soruyu Türkçe girin"
                />
              </div>
              <div>
                <Label htmlFor="answer-tr">{l.answer}</Label>
                <Textarea
                  id="answer-tr"
                  value={answerTr}
                  onChange={(e) => setAnswerTr(e.target.value)}
                  placeholder="Cevabı Türkçe girin"
                  rows={6}
                />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <div>
                <Label htmlFor="question-en">{l.question}</Label>
                <Input
                  id="question-en"
                  value={questionEn}
                  onChange={(e) => setQuestionEn(e.target.value)}
                  placeholder="Enter question in English"
                />
              </div>
              <div>
                <Label htmlFor="answer-en">{l.answer}</Label>
                <Textarea
                  id="answer-en"
                  value={answerEn}
                  onChange={(e) => setAnswerEn(e.target.value)}
                  placeholder="Enter answer in English"
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {l.cancel}
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {l.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
