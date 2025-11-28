import { useState, useMemo, useEffect, useCallback } from 'react'
import { useKV } from '@/hooks/use-kv'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, FileText, Eye, PencilSimple, XCircle, CheckCircle, Clock, DotsThree } from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PTWDialog } from '@/components/PTWDialog'
import type { Language, Person } from '@/lib/ptw-types'
import type { PTWForm, PTWType, PTWStatus } from '@/lib/ptw-form-types'
import { PTW_TYPE_LABELS, PTW_STATUS_LABELS } from '@/lib/ptw-form-types'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { isSupabaseAvailable } from '@/lib/supabase'
import { permitStore } from '@/stores/permits.store'
import { mapPermitRow, buildPermitInsert, buildPermitUpdate } from '@/lib/data-mappers'

interface PTWTabProps {
  language: Language
  isAdmin: boolean
  persons: Person[]
}

export function PTWTab({ language, isAdmin, persons }: PTWTabProps) {
  const [localPermits, setLocalPermits] = useKV<PTWForm[]>('ptw-forms', [])
  const supabaseEnabled = isSupabaseAvailable()
  const [remotePermits, setRemotePermits] = useState<PTWForm[] | null>(null)
  const [remoteLoading, setRemoteLoading] = useState<boolean>(supabaseEnabled)
  const [remoteError, setRemoteError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<PTWType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<PTWStatus | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPTW, setEditingPTW] = useState<PTWForm | undefined>()

  const loadPermits = useCallback(async () => {
    if (!supabaseEnabled) return

    setRemoteLoading(true)
    setRemoteError(null)

    try {
      const data = await permitStore.getAll()
      setRemotePermits(data.map(mapPermitRow))
    } catch (error) {
      console.error('Failed to load permits from Supabase', error)
      setRemotePermits(null)
      setRemoteError(error instanceof Error ? error.message : 'Unknown Supabase error')
    } finally {
      setRemoteLoading(false)
    }
  }, [supabaseEnabled])

  useEffect(() => {
    if (supabaseEnabled) {
      loadPermits()
    }
  }, [supabaseEnabled, loadPermits])

  useEffect(() => {
    if (remoteError && supabaseEnabled) {
      const message = language === 'ru'
        ? 'Не удалось загрузить наряды из Supabase. Используется локальное хранилище.'
        : language === 'tr'
          ? 'Supabase iş izinleri yüklenemedi. Yerel depolama kullanılıyor.'
          : 'Failed to load permits from Supabase. Falling back to local storage.'
      toast.error(message)
    }
  }, [remoteError, supabaseEnabled, language])

  const remoteReady = supabaseEnabled && remotePermits !== null
  const usingSupabaseData = remoteReady && !remoteError
  const permits = usingSupabaseData ? remotePermits! : localPermits || []

  const handleCreatePTW = () => {
    setEditingPTW(undefined)
    setDialogOpen(true)
  }

  const generatePermitNumber = useCallback(() => {
    const year = new Date().getFullYear()
    const prefix = `PTW-${year}-`
    const existingNumbers = permits
      .filter((form) => form.number.startsWith(prefix))
      .map((form) => {
        const parts = form.number.split('-')
        const last = parts[parts.length - 1]
        const parsed = Number.parseInt(last, 10)
        return Number.isFinite(parsed) ? parsed : 0
      })

    const nextIndex = existingNumbers.length === 0 ? 1 : Math.max(...existingNumbers) + 1
    return `${prefix}${String(nextIndex).padStart(4, '0')}`
  }, [permits])

  const handleSavePTW = async (ptwData: Partial<PTWForm>) => {
    const successMessage = editingPTW
      ? language === 'ru' ? '✅ Обновлено' : language === 'tr' ? '✅ Güncellendi' : '✅ Updated'
      : language === 'ru' ? '✅ Создано' : language === 'tr' ? '✅ Oluşturuldu' : '✅ Created'
    const errorMessage = editingPTW
      ? language === 'ru' ? '❌ Не удалось обновить наряд' : language === 'tr' ? '❌ İş izni güncellenemedi' : '❌ Failed to update permit'
      : language === 'ru' ? '❌ Не удалось создать наряд' : language === 'tr' ? '❌ İş izni oluşturulamadı' : '❌ Failed to create permit'

    const timestamp = new Date().toISOString()

    if (usingSupabaseData) {
      try {
        if (editingPTW) {
          const mergedData = { ...editingPTW, ...ptwData, updatedAt: timestamp }
          const payload = buildPermitUpdate(mergedData)
          const updatedRow = await permitStore.update(editingPTW.id, payload, mergedData.teamMemberIds)
          const mapped = mapPermitRow(updatedRow)
          setRemotePermits((current) => {
            const base = current ? current.map((p) => (p.id === mapped.id ? mapped : p)) : [mapped]
            return base.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          })
        } else {
          const baseForm: PTWForm = {
            id: crypto.randomUUID(),
            number: generatePermitNumber(),
            type: ptwData.type!,
            status: 'draft',
            issuerPersonId: ptwData.issuerPersonId!,
            supervisorPersonId: ptwData.supervisorPersonId!,
            foremanPersonId: ptwData.foremanPersonId!,
            teamMemberIds: ptwData.teamMemberIds ?? [],
            workDescription: ptwData.workDescription!,
            workLocation: ptwData.workLocation!,
            workScope: ptwData.workScope ?? '',
            equipment: ptwData.equipment ?? [],
            hazards: ptwData.hazards ?? [],
            safetyMeasures: ptwData.safetyMeasures ?? [],
            startDate: ptwData.startDate!,
            endDate: ptwData.endDate!,
            validUntil: ptwData.endDate ?? ptwData.startDate!,
            issuedAt: undefined,
            startedAt: undefined,
            completedAt: undefined,
            closedAt: undefined,
            dailyAdmissions: ptwData.dailyAdmissions ?? [],
            notes: ptwData.notes ?? '',
            attachments: ptwData.attachments,
            isCombinedWork: ptwData.isCombinedWork ?? false,
            combinedWorkJournalRef: ptwData.combinedWorkJournalRef,
            createdAt: timestamp,
            updatedAt: timestamp,
            createdBy: 'supabase',
          }
          const payload = buildPermitInsert(baseForm)
          const createdRow = await permitStore.create(payload, baseForm.teamMemberIds)
          const mapped = mapPermitRow(createdRow)
          setRemotePermits((current) => {
            const next = current ? [...current, mapped] : [mapped]
            return next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          })
        }

        toast.success(successMessage)
      } catch (error) {
        console.error('Failed to save permit', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
      return
    }

    if (editingPTW) {
      setLocalPermits((current) =>
        (current || []).map((p) =>
          p.id === editingPTW.id
            ? { ...p, ...ptwData, updatedAt: timestamp }
            : p
        )
      )
    } else {
      const newPTW: PTWForm = {
        id: crypto.randomUUID(),
        number: generatePermitNumber(),
        type: ptwData.type!,
        status: 'draft',
        issuerPersonId: ptwData.issuerPersonId!,
        supervisorPersonId: ptwData.supervisorPersonId!,
        foremanPersonId: ptwData.foremanPersonId!,
        teamMemberIds: ptwData.teamMemberIds ?? [],
        workDescription: ptwData.workDescription!,
        workLocation: ptwData.workLocation!,
        workScope: ptwData.workScope ?? '',
        equipment: ptwData.equipment ?? [],
        hazards: ptwData.hazards ?? [],
        safetyMeasures: ptwData.safetyMeasures ?? [],
        startDate: ptwData.startDate!,
        endDate: ptwData.endDate!,
        validUntil: ptwData.endDate ?? ptwData.startDate!,
        issuedAt: undefined,
        startedAt: undefined,
        completedAt: undefined,
        closedAt: undefined,
        dailyAdmissions: ptwData.dailyAdmissions ?? [],
        notes: ptwData.notes ?? '',
        attachments: ptwData.attachments,
        isCombinedWork: ptwData.isCombinedWork ?? false,
        combinedWorkJournalRef: ptwData.combinedWorkJournalRef,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: 'current-user',
      }
      setLocalPermits((current) => [...(current || []), newPTW])
    }

    toast.success(successMessage)
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
      loading: 'Загружаем наряды из Supabase...'
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
      loading: 'Supabase iş izinleri yükleniyor...'
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
      loading: 'Loading permits from Supabase...',
      actions: 'Actions'
    },
  }

  const l = labels[language]

  const filteredForms = useMemo(() => {
    let filtered = permits || []

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
  }, [permits, searchQuery, filterType, filterStatus])

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

      {supabaseEnabled && remoteLoading && permits.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">{l.loading}</h3>
          </CardContent>
        </Card>
      ) : filteredForms.length === 0 ? (
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
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">{l.number}</TableHead>
                <TableHead className="w-[140px]">{l.filterStatus}</TableHead>
                <TableHead className="w-[180px]">{l.filterType}</TableHead>
                <TableHead>{l.workDesc}</TableHead>
                <TableHead className="w-[180px]">{l.location}</TableHead>
                <TableHead className="w-[200px]">{l.dates}</TableHead>
                <TableHead className="w-[80px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForms.map((form) => (
                <TableRow key={form.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{form.number}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(form.createdAt), 'dd.MM.yyyy')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(form.status)} flex w-fit items-center gap-1`}>
                      {getStatusIcon(form.status)}
                      {PTW_STATUS_LABELS[form.status][language]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{PTW_TYPE_LABELS[form.type][language]}</span>
                      {form.isCombinedWork && (
                        <Badge variant="secondary" className="w-fit text-[10px] px-1 py-0 h-5">
                          {language === 'ru' ? 'Совмещенные' : language === 'tr' ? 'Birleştirilmiş' : 'Combined'}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm text-muted-foreground" title={form.workDescription}>
                      {form.workDescription}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{form.workLocation}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{format(new Date(form.startDate), 'dd.MM.yyyy')}</span>
                      <span className="text-muted-foreground text-xs">
                        {'→ '}{format(new Date(form.endDate), 'dd.MM.yyyy')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <DotsThree className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingPTW(form)
                          setDialogOpen(true)
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          {l.view}
                        </DropdownMenuItem>
                        {isAdmin && form.status === 'draft' && (
                          <DropdownMenuItem onClick={() => {
                            setEditingPTW(form)
                            setDialogOpen(true)
                          }}>
                            <PencilSimple className="mr-2 h-4 w-4" />
                            {l.edit}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
