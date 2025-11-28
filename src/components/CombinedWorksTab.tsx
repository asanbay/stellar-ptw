import { useCallback, useEffect, useState } from 'react'
import { useKV } from '@/hooks/use-kv'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Plus, CalendarBlank, MapPin, Users, PencilSimple, Trash, Info } from '@phosphor-icons/react'
import type { Language, Person } from '@/lib/ptw-types'
import type { CombinedWorkEntry } from '@/lib/ptw-form-types'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { CombinedWorkDialog } from '@/components/CombinedWorkDialog'
import { isSupabaseAvailable } from '@/lib/supabase'
import { combinedWorkStore } from '@/stores/combined-work.store'
import { mapCombinedWorkRow, buildCombinedWorkInsert, buildCombinedWorkUpdate } from '@/lib/data-mappers'

interface CombinedWorksTabProps {
  language: Language
  isAdmin: boolean
  persons: Person[]
}

export function CombinedWorksTab({ language, isAdmin, persons }: CombinedWorksTabProps) {
  const [localCombinedWorks, setLocalCombinedWorks] = useKV<CombinedWorkEntry[]>('ptw-combined-works', [])
  const supabaseEnabled = isSupabaseAvailable()
  const [remoteCombinedWorks, setRemoteCombinedWorks] = useState<CombinedWorkEntry[] | null>(null)
  const [remoteLoading, setRemoteLoading] = useState<boolean>(supabaseEnabled)
  const [remoteError, setRemoteError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CombinedWorkEntry | undefined>()

  const labels = {
    ru: {
      title: 'Журнал совмещенных работ',
      subtitle: 'STE-LOG-10-27',
      create: 'Добавить запись',
      date: 'Дата',
      location: 'Место работ',
      coordinator: 'Координатор',
      permits: 'Наряды-допуски',
      organizations: 'Организации',
      workTypes: 'Виды работ',
      safetyMeasures: 'Меры безопасности',
      notes: 'Примечания',
      noEntries: 'Записей нет',
      createFirst: 'Добавьте первую запись о совмещенных работах',
      description: 'Регистрация совмещенных работ, выполняемых одновременно несколькими организациями на одной площадке',
      edit: 'Редактировать',
      delete: 'Удалить',
      deleteConfirm: 'Удалить эту запись?',
      loading: 'Загружаем записи из Supabase...',
      loadError: 'Не удалось загрузить журнал из Supabase. Используется локальное хранилище.',
      createSuccess: '✅ Запись добавлена',
      updateSuccess: '✅ Запись обновлена',
      saveError: '❌ Не удалось сохранить запись',
      deleteSuccess: '✅ Запись удалена',
      deleteError: '❌ Не удалось удалить запись',
      fallbackTitle: 'Режим локального хранилища',
      fallbackDescription: 'Supabase недоступен. Изменения сохраняются только на этом устройстве и не синхронизируются с командой.',
    },
    tr: {
      title: 'Birleştirilmiş İşler Günlüğü',
      subtitle: 'STE-LOG-10-27',
      create: 'Kayıt Ekle',
      date: 'Tarih',
      location: 'İş Yeri',
      coordinator: 'Koordinatör',
      permits: 'İş İzinleri',
      organizations: 'Organizasyonlar',
      workTypes: 'İş Türleri',
      safetyMeasures: 'Güvenlik Önlemleri',
      notes: 'Notlar',
      noEntries: 'Kayıt yok',
      createFirst: 'İlk birleştirilmiş iş kaydını ekleyin',
      description: 'Aynı sahada aynı anda birden fazla kuruluş tarafından yapılan işlerin kaydı',
      edit: 'Düzenle',
      delete: 'Sil',
      deleteConfirm: 'Bu kaydı silmek istiyor musunuz?',
      loading: 'Supabase kayıtları yükleniyor...',
      loadError: 'Supabase kaydı yüklenemedi. Yerel depolama kullanılıyor.',
      createSuccess: '✅ Kayıt eklendi',
      updateSuccess: '✅ Kayıt güncellendi',
      saveError: '❌ Kayıt kaydedilemedi',
      deleteSuccess: '✅ Kayıt silindi',
      deleteError: '❌ Kayıt silinemedi',
      fallbackTitle: 'Yerel Depolama Modu',
      fallbackDescription: 'Supabase erişilemiyor. Değişiklikler yalnızca bu cihazda saklanır ve ekiple senkronize edilmez.',
    },
    en: {
      title: 'Combined Works Journal',
      subtitle: 'STE-LOG-10-27',
      create: 'Add Entry',
      date: 'Date',
      location: 'Location',
      coordinator: 'Coordinator',
      permits: 'Permits',
      organizations: 'Organizations',
      workTypes: 'Work Types',
      safetyMeasures: 'Safety Measures',
      notes: 'Notes',
      noEntries: 'No entries',
      createFirst: 'Add the first combined work entry',
      description: 'Registration of combined works performed simultaneously by multiple organizations at one site',
      edit: 'Edit',
      delete: 'Delete',
      deleteConfirm: 'Delete this entry?',
      loading: 'Loading entries from Supabase...',
      loadError: 'Failed to load combined works from Supabase. Falling back to local storage.',
      createSuccess: '✅ Entry added',
      updateSuccess: '✅ Entry updated',
      saveError: '❌ Failed to save entry',
      deleteSuccess: '✅ Entry deleted',
      deleteError: '❌ Failed to delete entry',
      fallbackTitle: 'Local Storage Mode',
      fallbackDescription: 'Supabase is unavailable. Changes stay on this device and do not sync with the team.',
    },
  }

  const l = labels[language]

  const loadCombinedWorks = useCallback(async () => {
    if (!supabaseEnabled) return

    setRemoteLoading(true)
    setRemoteError(null)

    try {
      const rows = await combinedWorkStore.getAll()
      setRemoteCombinedWorks(rows.map(mapCombinedWorkRow))
    } catch (error) {
      console.error('Failed to load combined work entries from Supabase', error)
      setRemoteCombinedWorks(null)
      setRemoteError(error instanceof Error ? error.message : 'Unknown Supabase error')
    } finally {
      setRemoteLoading(false)
    }
  }, [supabaseEnabled])

  useEffect(() => {
    if (supabaseEnabled) {
      loadCombinedWorks()
    }
  }, [supabaseEnabled, loadCombinedWorks])

  useEffect(() => {
    if (remoteError && supabaseEnabled) {
      toast.error(l.loadError)
    }
  }, [remoteError, supabaseEnabled, l.loadError])

  const remoteReady = supabaseEnabled && remoteCombinedWorks !== null
  const usingSupabaseData = remoteReady && !remoteError
  const combinedWorks = usingSupabaseData ? remoteCombinedWorks! : localCombinedWorks || []
  const isLoading = supabaseEnabled && remoteLoading
  const showLocalFallbackBanner = isAdmin && (!supabaseEnabled || (!!remoteError && !remoteLoading))

  const getCoordinatorName = (personId: string) => {
    const person = persons.find((p) => p.id === personId)
    return person?.name || personId
  }

  const handleCreateEntry = () => {
    setEditingEntry(undefined)
    setDialogOpen(true)
  }

  const handleEditEntry = (entry: CombinedWorkEntry) => {
    setEditingEntry(entry)
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingEntry(undefined)
    }
  }

  const handleSaveEntry = async (entry: Partial<CombinedWorkEntry>) => {
    const successMessage = editingEntry ? l.updateSuccess : l.createSuccess
    const errorMessage = l.saveError

    if (usingSupabaseData) {
      try {
        if (editingEntry) {
          const payload = buildCombinedWorkUpdate(entry)
          const updatedRow = await combinedWorkStore.update(editingEntry.id, payload)
          const mapped = mapCombinedWorkRow(updatedRow)
          setRemoteCombinedWorks((current) => (current ? current.map((item) => (item.id === mapped.id ? mapped : item)) : [mapped]))
        } else {
          const payload = buildCombinedWorkInsert(entry)
          const createdRow = await combinedWorkStore.create(payload)
          const mapped = mapCombinedWorkRow(createdRow)
          setRemoteCombinedWorks((current) => (current ? [...current, mapped] : [mapped]))
        }

        toast.success(successMessage)
        return
      } catch (error) {
        console.error('Failed to save combined work entry', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
        return
      }
    }

    const timestamp = new Date().toISOString()

    if (editingEntry) {
      setLocalCombinedWorks((current) =>
        (current || []).map((item) =>
          item.id === editingEntry.id
            ? {
                ...item,
                ...entry,
              }
            : item,
        ),
      )
    } else {
      const newEntry: CombinedWorkEntry = {
        id: crypto.randomUUID(),
        date: entry.date!,
        location: entry.location!,
        coordinatorPersonId: entry.coordinatorPersonId!,
        ptwNumbers: entry.ptwNumbers ?? [],
        organizations: entry.organizations ?? [],
        workTypes: entry.workTypes ?? [],
        safetyMeasures: entry.safetyMeasures ?? [],
        notes: entry.notes ?? '',
        createdAt: timestamp,
      }
      setLocalCombinedWorks((current) => [...(current || []), newEntry])
    }

    toast.success(successMessage)
  }

  const handleDeleteEntry = async (entry: CombinedWorkEntry) => {
    const confirmed = window.confirm(l.deleteConfirm)
    if (!confirmed) return

    if (usingSupabaseData) {
      try {
        await combinedWorkStore.delete(entry.id)
        setRemoteCombinedWorks((current) => (current ? current.filter((item) => item.id !== entry.id) : []))
        toast.success(l.deleteSuccess)
        return
      } catch (error) {
        console.error('Failed to delete combined work entry', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${l.deleteError}: ${details}`)
        return
      }
    }

    setLocalCombinedWorks((current) => (current || []).filter((item) => item.id !== entry.id))
    toast.success(l.deleteSuccess)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">{l.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {l.subtitle}
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
            {l.description}
          </p>
        </div>
        {isAdmin && (
          <Button type="button" className="font-semibold" onClick={handleCreateEntry}>
            <Plus className="h-4 w-4 mr-1" />
            {l.create}
          </Button>
        )}
      </div>

      {showLocalFallbackBanner && (
        <Alert className="bg-primary/5 border-primary/40">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>{l.fallbackTitle}</AlertTitle>
          <AlertDescription>{l.fallbackDescription}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">{l.loading}</CardContent>
        </Card>
      ) : (combinedWorks || []).length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{l.noEntries}</h3>
            <p className="text-muted-foreground mb-4">{l.createFirst}</p>
            {isAdmin && (
              <Button type="button" onClick={handleCreateEntry}>
                <Plus className="h-4 w-4 mr-1" />
                {l.create}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(combinedWorks || [])
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarBlank className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">
                          {format(new Date(entry.date), 'dd MMMM yyyy')}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {entry.location}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEntry(entry)}
                          aria-label={l.edit}
                        >
                          <PencilSimple className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => void handleDeleteEntry(entry)}
                          aria-label={l.delete}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <Badge variant="outline">
                      {entry.ptwNumbers.length}{' '}
                      {language === 'ru' ? 'НД' : language === 'tr' ? 'İİ' : 'PTW'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{l.coordinator}</p>
                      <p className="text-sm">{getCoordinatorName(entry.coordinatorPersonId)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{l.permits}</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.ptwNumbers.map((num) => (
                          <Badge key={num} variant="secondary" className="text-xs">
                            {num}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {entry.organizations.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{l.organizations}</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.organizations.map((org, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {org}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.workTypes.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{l.workTypes}</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.workTypes.map((type, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.safetyMeasures.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{l.safetyMeasures}</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        {entry.safetyMeasures.map((measure, idx) => (
                          <li key={idx}>{measure}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.notes && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{l.notes}</p>
                      <p className="text-sm">{entry.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {isAdmin && (
        <CombinedWorkDialog
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          onSave={handleSaveEntry}
          entry={editingEntry}
          language={language}
          persons={persons}
        />
      )}
    </div>
  )
}
