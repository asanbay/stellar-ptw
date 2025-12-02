import { useState, useEffect } from 'react'
import { auditLogger, type AuditLogEntry } from '@/lib/audit-log'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, User, Database, FileText, Download } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { Language } from '@/lib/ptw-types'

interface AuditLogViewerProps {
  entityType?: AuditLogEntry['entityType']
  entityId?: string
  language?: Language
  limit?: number
}

const translations = {
  ru: {
    title: 'История изменений',
    description: 'Все действия пользователей с отметкой времени',
    filterByAction: 'Фильтр по действию',
    filterByEntity: 'Фильтр по типу',
    all: 'Все',
    create: 'Создание',
    update: 'Изменение',
    delete: 'Удаление',
    export: 'Экспорт',
    import: 'Импорт',
    login: 'Вход',
    logout: 'Выход',
    personnel: 'Персонал',
    department: 'Департамент',
    ptw: 'Наряд-допуск',
    'combined-work': 'Совмещенные работы',
    faq: 'FAQ',
    announcement: 'Объявление',
    exportLogs: 'Экспорт логов',
    noLogs: 'Нет записей',
    changes: 'Изменения',
    exported: 'Логи экспортированы!',
  },
  tr: {
    title: 'Değişiklik Geçmişi',
    description: 'Zaman damgalı tüm kullanıcı eylemleri',
    filterByAction: 'Eyleme göre filtrele',
    filterByEntity: 'Türe göre filtrele',
    all: 'Tümü',
    create: 'Oluşturma',
    update: 'Güncelleme',
    delete: 'Silme',
    export: 'Dışa aktarma',
    import: 'İçe aktarma',
    login: 'Giriş',
    logout: 'Çıkış',
    personnel: 'Personel',
    department: 'Departman',
    ptw: 'İzin Belgesi',
    'combined-work': 'Birleşik İşler',
    faq: 'SSS',
    announcement: 'Duyuru',
    exportLogs: 'Logları dışa aktar',
    noLogs: 'Kayıt yok',
    changes: 'Değişiklikler',
    exported: 'Loglar dışa aktarıldı!',
  },
  en: {
    title: 'Audit Log',
    description: 'All user actions with timestamps',
    filterByAction: 'Filter by action',
    filterByEntity: 'Filter by type',
    all: 'All',
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    export: 'Export',
    import: 'Import',
    login: 'Login',
    logout: 'Logout',
    personnel: 'Personnel',
    department: 'Department',
    ptw: 'PTW',
    'combined-work': 'Combined Works',
    faq: 'FAQ',
    announcement: 'Announcement',
    exportLogs: 'Export Logs',
    noLogs: 'No entries',
    changes: 'Changes',
    exported: 'Logs exported!',
  },
}

const actionColors: Record<AuditLogEntry['action'], string> = {
  create: 'bg-green-500',
  update: 'bg-blue-500',
  delete: 'bg-red-500',
  export: 'bg-purple-500',
  import: 'bg-orange-500',
  login: 'bg-gray-500',
  logout: 'bg-gray-400',
}

export function AuditLogViewer({ entityType, entityId, language = 'en', limit = 100 }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const t = translations[language]

  useEffect(() => {
    loadLogs()
  }, [entityType, entityId, filterAction, filterEntity])

  const loadLogs = async () => {
    const options: any = { limit }
    
    if (entityType) options.entityType = entityType
    if (entityId) options.entityId = entityId
    if (filterAction !== 'all') options.action = filterAction
    if (filterEntity !== 'all') options.entityType = filterEntity

    const result = await auditLogger.getLogs(options)
    setLogs(result)
  }

  const handleExport = async () => {
    const data = await auditLogger.exportLogs()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t.exported)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              {t.title}
            </CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download size={16} />
            {t.exportLogs}
          </Button>
        </div>

        {!entityType && !entityId && (
          <div className="flex gap-2 pt-4">
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t.filterByAction} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="create">{t.create}</SelectItem>
                <SelectItem value="update">{t.update}</SelectItem>
                <SelectItem value="delete">{t.delete}</SelectItem>
                <SelectItem value="export">{t.export}</SelectItem>
                <SelectItem value="import">{t.import}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t.filterByEntity} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="personnel">{t.personnel}</SelectItem>
                <SelectItem value="department">{t.department}</SelectItem>
                <SelectItem value="ptw">{t.ptw}</SelectItem>
                <SelectItem value="combined-work">{t['combined-work']}</SelectItem>
                <SelectItem value="faq">{t.faq}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px]">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t.noLogs}</div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border-l-4 pl-4 py-2" style={{ borderColor: actionColors[log.action] }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className={actionColors[log.action] + ' text-white'}>
                          {t[log.action]}
                        </Badge>
                        <Badge variant="outline">{t[log.entityType]}</Badge>
                        {log.entityName && (
                          <span className="text-sm font-medium">{log.entityName}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User size={14} />
                        <span>{log.userName}</span>
                        <Clock size={14} className="ml-2" />
                        <span>{format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss')}</span>
                      </div>

                      {log.changes && (
                        <div className="mt-2 text-xs bg-muted p-2 rounded">
                          <div className="font-medium mb-1">{t.changes}:</div>
                          {Object.entries(log.changes).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="font-medium">{key}:</span>
                              <span className="line-through text-red-600">{JSON.stringify(value.old)}</span>
                              <span>→</span>
                              <span className="text-green-600">{JSON.stringify(value.new)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
