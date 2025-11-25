import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, FileText, Eye, PencilSimple, XCircle, CheckCircle, Clock } from '@phosphor-icons/react'
import { PTWDialog } from '@/components/PTWDialog'
import type { Language, Person } from '@/lib/ptw-types'
import type { PTWForm, PTWType, PTWStatus } from '@/lib/ptw-form-types'
import { PTW_TYPE_LABELS, PTW_STATUS_LABELS } from '@/lib/ptw-form-types'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface PTWTabProps {
  language: Language
  isAdmin: boolean
  persons: Person[]
}

export function PTWTab({ language, isAdmin, persons }: PTWTabProps) {
  const [ptwForms, setPtwForms] = useKV<PTWForm[]>('ptw-forms', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<PTWType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<PTWStatus | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPTW, setEditingPTW] = useState<PTWForm | undefined>()

  const handleCreatePTW = () => {
    setEditingPTW(undefined)
    setDialogOpen(true)
  }

  const handleSavePTW = (ptwData: Partial<PTWForm>) => {
    if (editingPTW) {
      setPtwForms((current) =>
        (current || []).map((p) =>
          p.id === editingPTW.id
            ? { ...p, ...ptwData, updatedAt: new Date().toISOString() }
            : p
        )
      )
      toast.success(language === 'ru' ? '✅ Обновлено' : language === 'tr' ? '✅ Güncellendi' : '✅ Updated')
    } else {
      const newPTW: PTWForm = {
        id: crypto.randomUUID(),
        number: `PTW-${new Date().getFullYear()}-${String((ptwForms || []).length + 1).padStart(4, '0')}`,
        ...ptwData,
        status: 'draft',
        dailyAdmissions: [],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user',
      } as PTWForm
      setPtwForms((current) => [...(current || []), newPTW])
      toast.success(language === 'ru' ? '✅ Создано' : language === 'tr' ? '✅ Oluşturuldu' : '✅ Created')
    }
  }

  const labels = {
    ru: {
      title: 'Наряды-допуски',
      create: 'Создать наряд-допуск',
      search: 'Поиск...',
      filterType: 'Тип работ',
      filterStatus: 'Статус',
      all: 'Все',
      number: 'Номер',
      workDesc: 'Описание работ',
      location: 'Место работ',
      dates: 'Период',
      issuer: 'Выдающий',
      supervisor: 'Руководитель',
      foreman: 'Производитель',
      team: 'Бригада',
      people: 'чел.',
      view: 'Просмотр',
      edit: 'Редактировать',
      noPermits: 'Нарядов-допусков нет',
      createFirst: 'Создайте первый наряд-допуск для начала работ',
      active: 'Активные',
      archived: 'Архив',
    },
    tr: {
      title: 'İş İzinleri',
      create: 'İş İzni Oluştur',
      search: 'Ara...',
      filterType: 'İş Türü',
      filterStatus: 'Durum',
      all: 'Tümü',
      number: 'Numara',
      workDesc: 'İş Açıklaması',
      location: 'İş Yeri',
      dates: 'Dönem',
      issuer: 'Veren',
      supervisor: 'Yönetici',
      foreman: 'İş Yapan',
      team: 'Ekip',
      people: 'kişi',
      view: 'Görüntüle',
      edit: 'Düzenle',
      noPermits: 'İş izni yok',
      createFirst: 'İlk iş iznini oluşturun',
      active: 'Aktif',
      archived: 'Arşiv',
    },
    en: {
      title: 'Permits to Work',
      create: 'Create PTW',
      search: 'Search...',
      filterType: 'Work Type',
      filterStatus: 'Status',
      all: 'All',
      number: 'Number',
      workDesc: 'Work Description',
      location: 'Location',
      dates: 'Period',
      issuer: 'Issuer',
      supervisor: 'Supervisor',
      foreman: 'Foreman',
      team: 'Team',
      people: 'people',
      view: 'View',
      edit: 'Edit',
      noPermits: 'No permits',
      createFirst: 'Create your first permit to work',
      active: 'Active',
      archived: 'Archive',
    },
  }

  const l = labels[language]

  const filteredForms = useMemo(() => {
    let filtered = ptwForms || []

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (form) =>
          form.number.toLowerCase().includes(query) ||
          form.workDescription.toLowerCase().includes(query) ||
          form.workLocation.toLowerCase().includes(query)
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((form) => form.type === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((form) => form.status === filterStatus)
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [ptwForms, searchQuery, filterType, filterStatus])

  const getStatusColor = (status: PTWStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700'
      case 'issued':
        return 'bg-blue-100 text-blue-700'
      case 'in-progress':
        return 'bg-green-100 text-green-700'
      case 'suspended':
        return 'bg-yellow-100 text-yellow-700'
      case 'completed':
        return 'bg-purple-100 text-purple-700'
      case 'closed':
        return 'bg-slate-100 text-slate-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: PTWStatus) => {
    switch (status) {
      case 'in-progress':
        return <Clock className="h-3 w-3" />
      case 'completed':
        return <CheckCircle className="h-3 w-3" />
      case 'cancelled':
        return <XCircle className="h-3 w-3" />
      default:
        return <FileText className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">{l.title}</h2>
        </div>
        {isAdmin && (
          <Button onClick={handleCreatePTW} className="font-semibold">
            <Plus className="h-4 w-4 mr-1" />
            {l.create}
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder={l.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterType} onValueChange={(val) => setFilterType(val as PTWType | 'all')}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={l.filterType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{l.all}</SelectItem>
            {(Object.keys(PTW_TYPE_LABELS) as PTWType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {PTW_TYPE_LABELS[type][language]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as PTWStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={l.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{l.all}</SelectItem>
            {(Object.keys(PTW_STATUS_LABELS) as PTWStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                {PTW_STATUS_LABELS[status][language]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredForms.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{l.noPermits}</h3>
            <p className="text-muted-foreground mb-4">{l.createFirst}</p>
            {isAdmin && (
              <Button onClick={handleCreatePTW}>
                <Plus className="h-4 w-4 mr-1" />
                {l.create}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredForms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{form.number}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {PTW_TYPE_LABELS[form.type].code}
                      </Badge>
                      <Badge className={`${getStatusColor(form.status)} flex items-center gap-1`}>
                        {getStatusIcon(form.status)}
                        {PTW_STATUS_LABELS[form.status][language]}
                      </Badge>
                      {form.isCombinedWork && (
                        <Badge variant="secondary" className="text-xs">
                          {language === 'ru' ? 'Совмещенные' : language === 'tr' ? 'Birleştirilmiş' : 'Combined'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground">{PTW_TYPE_LABELS[form.type][language]}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      {l.view}
                    </Button>
                    {isAdmin && form.status === 'draft' && (
                      <Button variant="outline" size="sm">
                        <PencilSimple className="h-4 w-4 mr-1" />
                        {l.edit}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{l.workDesc}</p>
                  <p className="text-sm">{form.workDescription}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{l.location}</p>
                    <p className="text-sm font-medium">{form.workLocation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{l.dates}</p>
                    <p className="text-sm font-medium">
                      {format(new Date(form.startDate), 'dd.MM.yyyy')} - {format(new Date(form.endDate), 'dd.MM.yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                  <span>
                    {l.team}: {form.teamMemberIds.length} {l.people}
                  </span>
                  <span>•</span>
                  <span>
                    {language === 'ru' ? 'Создан' : language === 'tr' ? 'Oluşturuldu' : 'Created'}:{' '}
                    {format(new Date(form.createdAt), 'dd.MM.yyyy HH:mm')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PTWDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSavePTW}
        ptw={editingPTW}
        persons={persons}
        language={language}
      />
    </div>
  )
}
