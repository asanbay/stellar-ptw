import { useState, useEffect, useMemo, lazy, Suspense, useCallback } from 'react'
import { useKV } from '@/hooks/use-kv'
import { UserPlus, Download, Globe, LockKey, User, Palette, Upload, Users, Database, CloudArrowUp } from '@phosphor-icons/react'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PersonnelSidebar } from '@/components/PersonnelSidebar'
import { PersonProfile } from '@/components/PersonProfile'
import { PersonDialog } from '@/components/PersonDialog'
import { ImportPersonnelDialog } from '@/components/ImportPersonnelDialog'
import { InfoBoard } from '@/components/InfoBoard'
import { LoginDialog } from '@/components/LoginDialog'
import { DepartmentsTab } from '@/components/DepartmentsTab'
import { FAQTab } from '@/components/FAQTab'
import type { Person, Language, Department, FAQItem, UserMode } from '@/lib/ptw-types'
import { useLanguage } from '@/hooks/use-language'
import { calculatePersonStats, exportToCSV } from '@/lib/ptw-utils'
import { generateId, cn } from '@/lib/utils'
import { logger } from '@/lib/logger'
import { THEMES } from '@/lib/themes'
import { INITIAL_FAQS } from '@/lib/faq-data'
import { useIsMobile } from '@/hooks/use-mobile'
import { isSupabaseAvailable } from '@/lib/supabase'
import { editLocks } from '@/lib/edit-locks'
import { personnelStore } from '@/stores/personnel.store'
import { departmentStore } from '@/stores/departments.store'
import { faqStore } from '@/stores/faq.store'
import { PROCEDURE_DUTIES, AUTO_QUALIFICATIONS } from '@/lib/ptw-constants'
import {
  buildDepartmentInsert,
  buildDepartmentUpdate,
  buildFAQInsert,
  buildFAQUpdate,
  buildPersonnelInsert,
  buildPersonnelUpdate,
  mapDepartmentRow,
  mapFAQRow,
  mapPersonnelRow,
} from '@/lib/data-mappers'

// Lazy loaded components with error handling
const retryImport = (importFn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
  return importFn().catch((error) => {
    if (retries === 0) {
      console.error('Failed to load module after retries:', error);
      // Reload page if all retries fail
      window.location.reload();
      throw error;
    }
    console.warn(`Import failed, retrying... (${retries} attempts left)`);
    return new Promise(resolve => setTimeout(resolve, delay))
      .then(() => retryImport(importFn, retries - 1, delay));
  });
};

const ProcessTab = lazy(() => retryImport(() => import('@/components/ProcessTab').then(m => ({ default: m.ProcessTab }))))
const RolesTab = lazy(() => retryImport(() => import('@/components/RolesTab').then(m => ({ default: m.RolesTab }))))
const RulesTab = lazy(() => retryImport(() => import('@/components/RulesTab').then(m => ({ default: m.RulesTab }))))
const AnalyticsTab = lazy(() => retryImport(() => import('@/components/AnalyticsTab').then(m => ({ default: m.AnalyticsTab }))))
const DocumentsTab = lazy(() => retryImport(() => import('@/components/DocumentsTab').then(m => ({ default: m.DocumentsTab }))))
const PTWTab = lazy(() => retryImport(() => import('@/components/PTWTab').then(m => ({ default: m.PTWTab }))))
const CombinedWorksTab = lazy(() => retryImport(() => import('@/components/CombinedWorksTab').then(m => ({ default: m.CombinedWorksTab }))))
const SuperAdminDashboard = lazy(() => retryImport(() => import('@/components/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard }))))

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    name: 'Служба ОТ и ПБ',
    emoji: '🛡️',
    color: 'oklch(0.55 0.22 25)',
    description: 'Отдел охраны труда и промышленной безопасности',
  },
  {
    id: 'dept-2',
    name: 'Производственный отдел',
    emoji: '⚙️',
    color: 'oklch(0.60 0.15 220)',
    description: 'Основное производство и монтажные работы',
  },
  {
    id: 'dept-3',
    name: 'Техническая служба',
    emoji: '🔧',
    color: 'oklch(0.65 0.18 145)',
    description: 'Техническое обслуживание и ремонт',
  },
]

const INITIAL_PERSONS: Person[] = [
  {
    id: '1',
    name: 'Файзалиева Людмила',
    position: 'Директор по ОТ и ПБ',
    role: 'issuer',
    email: 'l.fayzalieva@stellar.com',
    phone: '+79991234567',
    departmentId: 'dept-1',
  },
  {
    id: '2',
    name: 'Мустафа Кючюкйылмаз',
    position: 'Операционный директор',
    role: 'supervisor',
    email: 'm.kucukyilmaz@stellar.com',
    phone: '+905551234567',
    departmentId: 'dept-2',
  },
  {
    id: '3',
    name: 'Петров Иван',
    position: 'Мастер-производитель',
    role: 'foreman',
    email: 'i.petrov@stellar.com',
    phone: '+79991234568',
    departmentId: 'dept-2',
  },
  {
    id: '4',
    name: 'Сидоров Сергей',
    position: 'Рабочий-монтажник',
    role: 'worker',
    email: 's.sidorov@stellar.com',
    phone: '+79991234569',
    departmentId: 'dept-3',
  },
]

function App() {
  const [localPersons, setLocalPersons] = useKV<Person[]>('ptw-persons', INITIAL_PERSONS)
  const [localDepartments, setLocalDepartments] = useKV<Department[]>('ptw-departments', INITIAL_DEPARTMENTS)
  const [localFaqs, setLocalFaqs] = useKV<FAQItem[]>('ptw-faqs', INITIAL_FAQS)
  const [localPermits] = useKV<any[]>('ptw-forms', [])
  const [forceOffline, setForceOffline] = useKV<boolean>('ptw-force-offline', false)
  const supabaseEnabled = isSupabaseAvailable()
  const requireOnline = (import.meta as any).env?.VITE_REQUIRE_ONLINE === 'true'
  const [remoteLoading, setRemoteLoading] = useState<boolean>(supabaseEnabled)
  const [remoteError, setRemoteError] = useState<string | null>(null)
  const [remotePersons, setRemotePersons] = useState<Person[] | null>(null)
  const [remoteDepartments, setRemoteDepartments] = useState<Department[] | null>(null)
  const [remoteFaqs, setRemoteFaqs] = useState<FAQItem[] | null>(null)
  const { language, setLanguage } = useLanguage()
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | undefined>()
  const [userMode, setUserMode] = useState<UserMode>('user')
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useKV<string>('ptw-theme', 'stellar')
  const [sessionId] = useKV<string>('ptw-session-id', generateId())
  const [currentLock, setCurrentLock] = useState<{ type: string; id: string } | null>(null)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    logger.log('🚀 App initialized:', {
      supabaseEnabled,
      localPersonsCount: localPersons?.length || 0,
      localDepartmentsCount: localDepartments?.length || 0,
      domain: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
    })
  }, [])

  const loadSupabaseData = useCallback(async () => {
    if (!supabaseEnabled) {
      logger.log('⚠️ Supabase отключен, используем localStorage')
      return
    }

    setRemoteLoading(true)
    setRemoteError(null)

    try {
      logger.log('🔄 Загружаем данные из Supabase...')
      
      const [departmentsData, personsData, faqData] = await Promise.all([
        departmentStore.getAll().catch(err => {
          logger.error('❌ Ошибка загрузки отделов:', err)
          return []
        }),
        personnelStore.getAll().catch(err => {
          logger.error('❌ Ошибка загрузки персонала:', err)
          return []
        }),
        faqStore.getAll().catch(err => {
          logger.error('❌ Ошибка загрузки FAQ:', err)
          return []
        }),
      ])

      const departments = departmentsData.map(mapDepartmentRow)
      const persons = personsData.map(mapPersonnelRow)
      const faqs = faqData.map(mapFAQRow)
      
      setRemoteDepartments(departments)
      setRemotePersons(persons)
      setRemoteFaqs(faqs)
      
      logger.log('✅ Данные из Supabase загружены:', {
        departments: departments.length,
        persons: persons.length,
        faqs: faqs.length
      })
    } catch (error) {
      logger.error('❌ Failed to load Supabase data:', error)
      setRemoteDepartments(null)
      setRemotePersons(null)
      setRemoteFaqs(null)
      const errorMsg = error instanceof Error ? error.message : 'Unknown Supabase error'
      setRemoteError(errorMsg)
      logger.log('⚠️ Переключаемся на localStorage из-за ошибки')
    } finally {
      setRemoteLoading(false)
    }
  }, [supabaseEnabled])

  useEffect(() => {
    const themeKey = currentTheme || 'stellar'
    const theme = THEMES[themeKey]
    if (theme) {
      const root = document.documentElement
      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        root.style.setProperty(`--${cssVar}`, value)
      })
    }
  }, [currentTheme])

  useEffect(() => {
    if (supabaseEnabled) {
      loadSupabaseData()
    }
  }, [supabaseEnabled, loadSupabaseData])

  useEffect(() => {
    if (remoteError && supabaseEnabled) {
      const message = language === 'ru'
        ? 'Не удалось загрузить данные из Supabase. Используется локальное хранилище.'
        : language === 'tr'
          ? 'Supabase verileri yüklenemedi. Yerel depolama kullanılıyor.'
          : 'Failed to load Supabase data. Falling back to local storage.'
      toast.error(message)
    }
  }, [remoteError, supabaseEnabled, language])

  const remoteReady = supabaseEnabled && remotePersons !== null && remoteDepartments !== null && remoteFaqs !== null
  const usingSupabaseData = (requireOnline ? true : !forceOffline) && remoteReady && !remoteError

  const allPersons = usingSupabaseData ? remotePersons! : localPersons || INITIAL_PERSONS
  const allDepartments = usingSupabaseData ? remoteDepartments! : localDepartments || INITIAL_DEPARTMENTS
  const allFaqs = usingSupabaseData ? remoteFaqs! : localFaqs || INITIAL_FAQS

  const handleSwitchToAdmin = () => {
    setLoginDialogOpen(true)
  }

  const handleAdminLogin = (role: 'admin' | 'super_admin' = 'admin') => {
    setUserMode(role)
    const message = role === 'super_admin'
      ? (language === 'ru' ? '🚀 Вы вошли как Супер-Администратор' : language === 'tr' ? '🚀 Süper Yönetici olarak giriş yaptınız' : '🚀 Logged in as Super Admin')
      : (language === 'ru' ? '✅ Вы вошли как администратор' : language === 'tr' ? '✅ Yönetici olarak giriş yaptınız' : '✅ Logged in as administrator')
    toast.success(message)
  }

  const handleSwitchToUser = () => {
    setUserMode('user')
    toast.success(language === 'ru' ? '👤 Режим пользователя' : language === 'tr' ? '👤 Kullanıcı modu' : '👤 User mode')
  }

  const isAdminMode = userMode === 'admin' || userMode === 'super_admin'
  const isSuperAdmin = userMode === 'super_admin'

  const stats = useMemo(() => calculatePersonStats(allPersons), [allPersons])
  const selectedPerson = allPersons.find((p) => p.id === selectedPersonId)

  const handleAddPerson = () => {
    setEditingPerson(undefined)
    setDialogOpen(true)
  }

  const handleEditPerson = async (person: Person) => {
    // Захватываем блокировку на профиль перед редактированием
    const { ok } = await editLocks.acquire('personnel', person.id, sessionId)
    if (!ok) {
      toast.warning(
        language === 'ru'
          ? 'Этот профиль редактируется другим пользователем'
          : language === 'tr'
            ? 'Bu profil başka bir kullanıcı tarafından düzenleniyor'
            : 'This profile is being edited by another user'
      )
      return
    }
    setCurrentLock({ type: 'personnel', id: person.id })
    setEditingPerson(person)
    setDialogOpen(true)
  }

  const handleSavePerson = async (personData: Partial<Person>) => {
    if (!ensureOnlineWrite()) return
    logger.log('💾 handleSavePerson called', { personData, editingPerson, usingSupabaseData })
    const successMessage = editingPerson
      ? language === 'ru' ? '✅ Обновлено' : language === 'tr' ? '✅ Güncellendi' : '✅ Updated'
      : language === 'ru' ? '✅ Добавлено' : language === 'tr' ? '✅ Eklendi' : '✅ Added'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось сохранить сотрудника'
      : language === 'tr'
        ? '❌ Personel kaydedilemedi'
        : '❌ Failed to save personnel'

    if (usingSupabaseData) {
      try {
        if (editingPerson) {
          const updated = await personnelStore.update(editingPerson.id, buildPersonnelUpdate(personData))
          const mapped = mapPersonnelRow(updated)
          setRemotePersons((current) => current ? current.map((p) => (p.id === editingPerson.id ? mapped : p)) : [mapped])
        } else {
          const created = await personnelStore.create(buildPersonnelInsert(personData))
          const mapped = mapPersonnelRow(created)
          setRemotePersons((current) => current ? [...current, mapped] : [mapped])
        }
        toast.success(successMessage)
        // Освобождаем блокировку после успешного сохранения в облаке
        if (currentLock?.type === 'personnel' && (editingPerson?.id || personData.id)) {
          const id = editingPerson?.id || personData.id!
          await editLocks.release('personnel', id, sessionId)
          setCurrentLock(null)
        }
      } catch (error) {
        console.error('Failed to save personnel', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
      return
    }

    if (editingPerson) {
      setLocalPersons((current) => (current || []).map((p) => (p.id === editingPerson.id ? { ...p, ...personData } : p)))
    } else {
      const newPerson: Person = {
        id: generateId(),
        name: personData.name!,
        position: personData.position!,
        role: personData.role!,
        email: personData.email,
        phone: personData.phone,
        departmentId: personData.departmentId,
        customDuties: personData.customDuties,
        customQualifications: personData.customQualifications,
      }
      console.log('📝 Creating new person:', newPerson)
      setLocalPersons((current) => [...(current || []), newPerson])
    }

    toast.success(successMessage)
    // Освобождаем блокировку после локального сохранения
    if (currentLock?.type === 'personnel') {
      const id = editingPerson?.id || ''
      if (id) await editLocks.release('personnel', id, sessionId)
      setCurrentLock(null)
    }
  }

  const handleDeletePerson = async (id: string) => {
    if (!ensureOnlineWrite()) return
    const successMessage = language === 'ru' ? '✅ Удалено' : language === 'tr' ? '✅ Silindi' : '✅ Deleted'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось удалить сотрудника'
      : language === 'tr'
        ? '❌ Personel silinemedi'
        : '❌ Failed to delete personnel'

    if (usingSupabaseData) {
      try {
        await personnelStore.delete(id)
        setRemotePersons((current) => current ? current.filter((p) => p.id !== id) : current)
        if (selectedPersonId === id) {
          setSelectedPersonId(null)
        }
        setMobileSheetOpen(false)
        toast.success(successMessage)
      } catch (error) {
        console.error('Failed to delete personnel', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
      return
    }

    setLocalPersons((current) => (current || []).filter((p) => p.id !== id))
    setSelectedPersonId(null)
    setMobileSheetOpen(false)
    toast.success(successMessage)
  }

  const handleExport = () => {
    exportToCSV(allPersons, language)
    toast.success(language === 'ru' ? '✅ Экспортировано' : language === 'tr' ? '✅ Dışa Aktarıldı' : '✅ Exported')
  }

  const handleUpdateDuties = async (personId: string, duties: string[]) => {
    if (!ensureOnlineWrite()) return
    const successMessage = language === 'ru' ? '✅ Обязанности обновлены' : language === 'tr' ? '✅ Yükümlülükler güncellendi' : '✅ Duties updated'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось обновить обязанности'
      : language === 'tr'
        ? '❌ Yükümlülükler güncellenemedi'
        : '❌ Failed to update duties'

    const sanitized = duties && duties.length > 0 ? duties : undefined
    if (usingSupabaseData) {
      try {
        const updated = await personnelStore.update(personId, buildPersonnelUpdate({ customDuties: sanitized }))
        const mapped = mapPersonnelRow(updated)
        setRemotePersons((current) => current ? current.map((p) => (p.id === personId ? mapped : p)) : [mapped])
        toast.success(successMessage)
      } catch (error) {
        console.error('Failed to update duties', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
      return
    }

    setLocalPersons((current) => (current || []).map((p) => (p.id === personId ? { ...p, customDuties: sanitized } : p)))
    toast.success(successMessage)
  }

  const handleUpdateQualifications = async (personId: string, qualifications: string[]) => {
    if (!ensureOnlineWrite()) return
    const successMessage = language === 'ru' ? '✅ Квалификация обновлена' : language === 'tr' ? '✅ Nitelikler güncellendi' : '✅ Qualifications updated'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось обновить квалификацию'
      : language === 'tr'
        ? '❌ Nitelikler güncellenemedi'
        : '❌ Failed to update qualifications'

    const sanitized = qualifications && qualifications.length > 0 ? qualifications : undefined
    if (usingSupabaseData) {
      try {
        const updated = await personnelStore.update(personId, buildPersonnelUpdate({ customQualifications: sanitized }))
        const mapped = mapPersonnelRow(updated)
        setRemotePersons((current) => current ? current.map((p) => (p.id === personId ? mapped : p)) : [mapped])
        toast.success(successMessage)
      } catch (error) {
        console.error('Failed to update qualifications', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
      return
    }

    setLocalPersons((current) => (current || []).map((p) => (p.id === personId ? { ...p, customQualifications: sanitized } : p)))
    toast.success(successMessage)
  }

  const handleImportPersons = async (importedPersons: Person[]) => {
    if (!ensureOnlineWrite()) return
    try {
      logger.log('📥 handleImportPersons вызван:', {
        count: importedPersons.length,
        usingSupabase: usingSupabaseData,
        samplePerson: importedPersons[0]
      })
      
      if (!importedPersons || importedPersons.length === 0) {
        logger.warn('⚠️ Нет данных для импорта')
        toast.warning(language === 'ru' ? 'Нет данных для импорта' : 'No data to import')
        return
      }

      const successMessage = language === 'ru'
        ? `✅ Импортировано ${importedPersons.length} сотрудников`
        : language === 'tr'
          ? `✅ ${importedPersons.length} çalışan içe aktarıldı`
          : `✅ Imported ${importedPersons.length} personnel`
      const errorMessage = language === 'ru'
        ? '❌ Не удалось импортировать сотрудников'
        : language === 'tr'
          ? '❌ Personel içe aktarılamadı'
          : '❌ Failed to import personnel'

      if (usingSupabaseData) {
        try {
          logger.log('💾 Начинаем импорт в Supabase...', { count: importedPersons.length })
          
          // Валидация и подготовка данных
          const validPersons = importedPersons.filter(p => {
            if (!p.name || !p.position || !p.role) {
              logger.warn('⚠️ Пропускаем невалидного сотрудника:', p)
              return false
            }
            return true
          })
          
          if (validPersons.length === 0) {
            throw new Error('Нет валидных данных для импорта')
          }
          
          const payload = validPersons.map((person) => {
            try {
              return buildPersonnelInsert(person)
            } catch (err) {
              logger.error('❌ Ошибка при подготовке данных сотрудника:', person, err)
              throw err
            }
          })
          
          logger.log('📤 Отправляем в Supabase:', { count: payload.length })
          const inserted = await personnelStore.bulkCreate(payload)
          logger.log('✅ Supabase вернул записей:', inserted.length)
          
          const mapped = inserted.map(mapPersonnelRow)
          setRemotePersons((current) => current ? [...current, ...mapped] : mapped)
          toast.success(`${successMessage} (${validPersons.length}/${importedPersons.length})`)
          logger.log('✅ Импорт в Supabase завершен успешно')
        } catch (error) {
          logger.error('❌ Failed to import personnel to Supabase:', error)
          const details = error instanceof Error ? error.message : 'Unknown error'
          toast.error(`${errorMessage}: ${details}`, { duration: 5000 })
          // Fallback to localStorage on error
          logger.log('⚠️ Переключаемся на localStorage из-за ошибки')
          setLocalPersons((current) => [...(current || []), ...importedPersons])
          toast.info(language === 'ru' ? 'Данные сохранены локально' : 'Data saved locally')
        }
        return
      }

      logger.log('💾 Импортируем в localStorage...')
      setLocalPersons((current) => [...(current || []), ...importedPersons])
      toast.success(successMessage)
      logger.log('✅ Импорт в localStorage завершен')
    } catch (error) {
      logger.error('❌ Critical error in handleImportPersons:', error)
      toast.error(language === 'ru' ? 'Критическая ошибка при импорте' : 'Critical import error')
    }
  }

  const handleAddDepartment = async (deptData: Partial<Department>) => {
    if (!ensureOnlineWrite()) return
    const successMessage = language === 'ru' ? '✅ Отдел добавлен' : language === 'tr' ? '✅ Departman eklendi' : '✅ Department added'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось добавить отдел'
      : language === 'tr'
        ? '❌ Departman eklenemedi'
        : '❌ Failed to add department'

    if (usingSupabaseData) {
      try {
        const created = await departmentStore.create(buildDepartmentInsert(deptData))
        const mapped = mapDepartmentRow(created)
        setRemoteDepartments((current) => current ? [...current, mapped] : [mapped])
        toast.success(successMessage)
      } catch (error) {
        console.error('Failed to add department', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
      return
    }

    const newDepartment: Department = {
      id: generateId(),
      name: deptData.name!,
      color: deptData.color!,
      emoji: deptData.emoji!,
      description: deptData.description,
    }
    setLocalDepartments((current) => [...(current || []), newDepartment])
    toast.success(successMessage)
  }

  const handleEditDepartment = async (id: string, deptData: Partial<Department>) => {
    if (!ensureOnlineWrite()) return
    const successMessage = language === 'ru' ? '✅ Отдел обновлен' : language === 'tr' ? '✅ Departman güncellendi' : '✅ Department updated'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось обновить отдел'
      : language === 'tr'
        ? '❌ Departman güncellenemedi'
        : '❌ Failed to update department'

    if (usingSupabaseData) {
      try {
        const updated = await departmentStore.update(id, buildDepartmentUpdate(deptData))
        const mapped = mapDepartmentRow(updated)
        setRemoteDepartments((current) => current ? current.map((d) => (d.id === id ? mapped : d)) : [mapped])
        toast.success(successMessage)
      } catch (error) {
        console.error('Failed to update department', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
      return
    }

    setLocalDepartments((current) => (current || []).map((d) => (d.id === id ? { ...d, ...deptData } : d)))
    toast.success(successMessage)
  }

  const handleDeleteDepartment = async (id: string) => {
    if (!ensureOnlineWrite()) return
    const successMessage = language === 'ru' ? '✅ Отдел удален' : language === 'tr' ? '✅ Departman silindi' : '✅ Department deleted'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось удалить отдел'
      : language === 'tr'
        ? '❌ Departman silinemedi'
        : '❌ Failed to delete department'

    if (usingSupabaseData) {
      try {
        await departmentStore.delete(id)
        setRemoteDepartments((current) => current ? current.filter((d) => d.id !== id) : current)
        setRemotePersons((current) => current ? current.map((p) => (p.departmentId === id ? { ...p, departmentId: undefined } : p)) : current)
        toast.success(successMessage)
      } catch (error) {
        console.error('Failed to delete department', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
      return
    }

    setLocalDepartments((current) => (current || []).filter((d) => d.id !== id))
    setLocalPersons((current) => (current || []).map((p) => (p.departmentId === id ? { ...p, departmentId: undefined } : p)))
    toast.success(successMessage)
  }

  const handleAddFAQ = async (faqData: Partial<FAQItem>) => {
    if (!ensureOnlineWrite()) return
    logger.log('📝 handleAddFAQ вызван:', faqData)
    
    const successMessage = language === 'ru' ? '✅ Вопрос добавлен' : language === 'tr' ? '✅ Soru eklendi' : '✅ Question added'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось добавить вопрос'
      : language === 'tr'
        ? '❌ Soru eklenemedi'
        : '❌ Failed to add question'
    const order = faqData.order ?? allFaqs.length

    if (usingSupabaseData) {
      try {
        // Проверяем на дубликаты
        const isDuplicate = allFaqs.some(f => 
          f.question[language] === faqData.question?.[language]
        )
        
        if (isDuplicate) {
          logger.warn('⚠️ FAQ уже существует, пропускаем')
          toast.warning(language === 'ru' ? 'Этот вопрос уже существует' : 'This question already exists')
          return
        }
        
        const created = await faqStore.create(buildFAQInsert({ ...faqData, order }))
        const mapped = mapFAQRow(created)
        setRemoteFaqs((current) => {
          const next = current ? [...current, mapped] : [mapped]
          return next.sort((a, b) => a.order - b.order)
        })
        logger.log('✅ FAQ добавлен в Supabase')
        toast.success(successMessage)
      } catch (error) {
        logger.error('❌ Failed to add FAQ:', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
      return
    }

    // Проверяем на дубликаты в localStorage
    const isDuplicate = allFaqs.some(f => 
      f.question[language] === faqData.question?.[language]
    )
    
    if (isDuplicate) {
      logger.warn('⚠️ FAQ уже существует в localStorage')
      toast.warning(language === 'ru' ? 'Этот вопрос уже существует' : 'This question already exists')
      return
    }

    const newFAQ: FAQItem = {
      id: generateId(),
      question: faqData.question!,
      answer: faqData.answer!,
      category: faqData.category,
      order,
    }
    setLocalFaqs((current) => [...(current || []), newFAQ])
    logger.log('✅ FAQ добавлен в localStorage')
    toast.success(successMessage)
  }

  const handleEditFAQ = async (id: string, faqData: Partial<FAQItem>) => {
    if (!ensureOnlineWrite()) return
    logger.log('✏️ handleEditFAQ вызван:', { id, faqData })
    
    const successMessage = language === 'ru' ? '✅ Вопрос обновлен' : language === 'tr' ? '✅ Soru güncellendi' : '✅ Question updated'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось обновить вопрос'
      : language === 'tr'
        ? '❌ Soru güncellenemedi'
        : '❌ Failed to update question'

    if (usingSupabaseData) {
      try {
        const updated = await faqStore.update(id, buildFAQUpdate(faqData))
        const mapped = mapFAQRow(updated)
        setRemoteFaqs((current) => {
          const next = current ? current.map((f) => (f.id === id ? mapped : f)) : [mapped]
          return next.sort((a, b) => a.order - b.order)
        })
        toast.success(successMessage)
      } catch (error) {
        console.error('Failed to update FAQ', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
      return
    }

    setLocalFaqs((current) => (current || []).map((f) => (f.id === id ? { ...f, ...faqData } : f)))
    toast.success(successMessage)
  }

  const handleDeleteFAQ = async (id: string) => {
    if (!ensureOnlineWrite()) return
    logger.log('🗑️ handleDeleteFAQ вызван:', id)
    
    const successMessage = language === 'ru' ? '✅ Вопрос удален' : language === 'tr' ? '✅ Soru silindi' : '✅ Question deleted'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось удалить вопрос'
      : language === 'tr'
        ? '❌ Soru silinemedi'
        : '❌ Failed to delete question'

    if (usingSupabaseData) {
      try {
        await faqStore.delete(id)
        setRemoteFaqs((current) => current ? current.filter((f) => f.id !== id) : current)
        toast.success(successMessage)
      } catch (error) {
        console.error('Failed to delete FAQ', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
      return
    }

    setLocalFaqs((current) => (current || []).filter((f) => f.id !== id))
    toast.success(successMessage)
  }

  const labels = {
    ru: { 
      appTitle: 'Stellar PTW', 
      tabs: { 
        personnel: 'Профиль', 
        permits: 'Наряды-допуски',
        combined: 'Совмещенные',
        departments: 'Отделы',
        process: 'Процесс', 
        roles: 'Роли', 
        rules: 'Правила',
        faq: 'FAQ',
        analytics: 'Аналитика', 
        docs: 'Документы',
        dashboard: 'Панель'
      }, 
      emptyTitle: 'Выберите сотрудника', 
      emptyDesc: 'Нажмите на сотрудника слева для просмотра деталей',
      emptyDescMobile: 'Нажмите кнопку "Персонал" для выбора сотрудника',
      adminMode: 'Админ',
      superAdminMode: 'Супер-Админ',
      userMode: 'Пользователь',
      logout: 'Выйти',
      theme: 'Тема',
      import: 'Импорт',
      personnel: 'Персонал',
    },
    tr: { 
      appTitle: 'Stellar PTW', 
      tabs: { 
        personnel: 'Profil', 
        permits: 'İş İzinleri',
        combined: 'Birleştirilmiş',
        departments: 'Departmanlar',
        process: 'Süreç', 
        roles: 'Roller', 
        rules: 'Kurallar',
        faq: 'SSS',
        analytics: 'Analiz', 
        docs: 'Belgeler',
        dashboard: 'Panel'
      }, 
      emptyTitle: 'Çalışan Seçin', 
      emptyDesc: 'Detayları görmek için soldaki bir çalışana tıklayın',
      emptyDescMobile: 'Çalışan seçmek için "Personel" düğmesine tıklayın',
      adminMode: 'Yönetici',
      superAdminMode: 'Süper Yönetici',
      userMode: 'Kullanıcı',
      logout: 'Çıkış',
      theme: 'Tema',
      import: 'İçe Aktar',
      personnel: 'Personel',
    },
    en: { 
      appTitle: 'Stellar PTW', 
      tabs: { 
        personnel: 'Profile', 
        permits: 'Permits',
        combined: 'Combined',
        departments: 'Departments',
        process: 'Process', 
        roles: 'Roles', 
        rules: 'Rules',
        faq: 'FAQ',
        analytics: 'Analytics', 
        docs: 'Documents',
        dashboard: 'Dashboard'
      }, 
      emptyTitle: 'Select Personnel', 
      emptyDesc: 'Click on a person in the sidebar to view details',
      emptyDescMobile: 'Click "Personnel" button to select a person',
      adminMode: 'Admin',
      superAdminMode: 'Super Admin',
      userMode: 'User',
      logout: 'Logout',
      theme: 'Theme',
      import: 'Import',
      personnel: 'Personnel',
    },
  }

  const handleSyncToCloud = async () => {
    if (!isSupabaseAvailable()) {
      toast.error(language === 'ru' ? 'Нет соединения с облаком' : 'No cloud connection')
      return
    }

    const confirmMsg = language === 'ru'
      ? 'Отправить локальные данные в облако? Существующие записи не будут изменены.'
      : language === 'tr'
      ? 'Yerel veriler buluta gönderilsin mi? Mevcut kayıtlar değiştirilmeyecektir.'
      : 'Push local data to cloud? Existing records will not be changed.'

    if (!window.confirm(confirmMsg)) return

    const loadingMsg = language === 'ru' ? 'Синхронизация...' : language === 'tr' ? 'Senkronizasyon...' : 'Syncing...'
    const toastId = toast.loading(loadingMsg)

    let addedCount = 0
    let skippedCount = 0

    try {
      // 1. Sync Departments and build ID Map
      const currentRemoteDepts = (await departmentStore.getAll()).map(mapDepartmentRow)
      const deptMap = new Map<string, string>() // Local ID -> Remote ID

      for (const localDept of (localDepartments || [])) {
        // Find existing remote department by Name
        const remoteDept = currentRemoteDepts.find(d => d.name === localDept.name)
        
        if (remoteDept) {
          deptMap.set(localDept.id, remoteDept.id)
          skippedCount++
        } else {
          // Create new department
          const payload = buildDepartmentInsert(localDept)
          delete payload.id // Let DB generate UUID
           const createdDept = await departmentStore.create(payload)
           const newDept = mapDepartmentRow(createdDept)
           if (newDept && newDept.id) {
             deptMap.set(localDept.id, newDept.id)
             addedCount++
          }
        }
      }

      // 2. Sync Personnel
      const currentRemotePersons = (await personnelStore.getAll()).map(mapPersonnelRow)
      for (const localPerson of (localPersons || [])) {
        // Check by Email (if exists) or Name + Role
        const exists = currentRemotePersons.some(p =>
          (localPerson.email && p.email === localPerson.email) ||
          (p.name === localPerson.name && p.role === localPerson.role)
        )

        if (!exists) {
          const payload = buildPersonnelInsert(localPerson)
          delete payload.id // Let DB generate UUID
          
          // Map Department ID
          if (localPerson.departmentId) {
            const remoteDeptId = deptMap.get(localPerson.departmentId)
            if (remoteDeptId) {
              payload.department_id = remoteDeptId
            } else {
              console.warn(`Skipping department link for ${localPerson.name}: Local Dept ${localPerson.departmentId} not found in remote map`)
              payload.department_id = null
            }
          }

          await personnelStore.create(payload)
          addedCount++
        } else {
          skippedCount++
        }
      }

      // 3. Sync FAQs
      const currentRemoteFaqs = (await faqStore.getAll()).map(mapFAQRow)
      const sameTranslation = (a: any, b: any) => a?.ru === b?.ru && a?.tr === b?.tr && a?.en === b?.en
      for (const localFaq of (localFaqs || [])) {
        const exists = currentRemoteFaqs.some(f => sameTranslation(f.question, localFaq.question))
        if (!exists) {
          const payload = buildFAQInsert(localFaq)
          delete payload.id // Let DB generate UUID
          await faqStore.create(payload)
          addedCount++
        } else {
          skippedCount++
        }
      }

      toast.success(
        language === 'ru'
          ? `Готово! Добавлено: ${addedCount}, Пропущено: ${skippedCount}`
          : `Done! Added: ${addedCount}, Skipped: ${skippedCount}`,
        { id: toastId }
      )

      // Refresh remote data if we are currently viewing it (or if we switch to it)
      if (!forceOffline) {
        loadSupabaseData()
      }

    } catch (error) {
      console.error('Sync error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(
        language === 'ru' 
          ? `Ошибка синхронизации: ${errorMessage}` 
          : `Sync error: ${errorMessage}`, 
        { id: toastId, duration: 5000 }
      )
    }
  }

  // Авто-синхронизация локальных данных в облако при доступности Supabase (один раз за сессию)
  const autoSyncToCloud = useCallback(async () => {
    if (!isSupabaseAvailable()) return
    try {
      const key = 'ptw-auto-sync-done'
      const already = typeof window !== 'undefined' ? sessionStorage.getItem(key) : '1'
      if (already) return
      sessionStorage.setItem(key, '1')
    } catch (_) {}

    let addedCount = 0
    let skippedCount = 0

    try {
      const currentRemoteDepts = (await departmentStore.getAll()).map(mapDepartmentRow)
      const deptMap = new Map<string, string>()

      for (const localDept of (localDepartments || [])) {
        const remoteDept = currentRemoteDepts.find(d => d.name === localDept.name)
        if (remoteDept) {
          deptMap.set(localDept.id, remoteDept.id)
          skippedCount++
        } else {
          const payload = buildDepartmentInsert(localDept)
          delete (payload as any).id
          const createdDept = await departmentStore.create(payload)
          const newDept = mapDepartmentRow(createdDept)
          if (newDept && newDept.id) {
            deptMap.set(localDept.id, newDept.id)
            addedCount++
          }
        }
      }

      const currentRemotePersons = (await personnelStore.getAll()).map(mapPersonnelRow)
      for (const localPerson of (localPersons || [])) {
        const exists = currentRemotePersons.some(p =>
          (localPerson.email && p.email === localPerson.email) ||
          (p.name === localPerson.name && p.role === localPerson.role)
        )

        if (!exists) {
          const payload = buildPersonnelInsert(localPerson)
          delete (payload as any).id
          if (localPerson.departmentId) {
            const remoteDeptId = deptMap.get(localPerson.departmentId)
            payload.department_id = remoteDeptId || null
          }
          await personnelStore.create(payload)
          addedCount++
        } else {
          skippedCount++
        }
      }

      const currentRemoteFaqs = (await faqStore.getAll()).map(mapFAQRow)
      const sameTranslation = (a: any, b: any) => a?.ru === b?.ru && a?.tr === b?.tr && a?.en === b?.en
      for (const localFaq of (localFaqs || [])) {
        const exists = currentRemoteFaqs.some(f => sameTranslation(f.question, localFaq.question))
        if (!exists) {
          const payload = buildFAQInsert(localFaq)
          delete (payload as any).id
          await faqStore.create(payload)
          addedCount++
        } else {
          skippedCount++
        }
      }

      const msg = language === 'ru'
        ? `Авто-синхронизация завершена. Добавлено: ${addedCount}, Пропущено: ${skippedCount}`
        : language === 'tr'
          ? `Otomatik senkron tamamlandı. Eklendi: ${addedCount}, Atlandı: ${skippedCount}`
          : `Auto sync done. Added: ${addedCount}, Skipped: ${skippedCount}`
      toast.success(msg)

      if (!forceOffline) {
        loadSupabaseData()
      }
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error'
      const msg = language === 'ru' ? `Авто-синхронизация: ошибка: ${err}` : `Auto sync error: ${err}`
      toast.error(msg)
    }
  }, [localDepartments, localPersons, localFaqs, language, forceOffline, loadSupabaseData])

  useEffect(() => {
    if (requireOnline && supabaseEnabled && remoteReady && !remoteError) {
      autoSyncToCloud()
    }
  }, [requireOnline, supabaseEnabled, remoteReady, remoteError, autoSyncToCloud])

  const l = labels[language]

  const writesForbidden = requireOnline && !supabaseEnabled
  const ensureOnlineWrite = () => {
    if (writesForbidden) {
      const msg = language === 'ru'
        ? 'Недоступно: требуется онлайн и настроенный Supabase (.env).'
        : language === 'tr'
          ? 'Kullanılamıyor: Çevrimiçi ve yapılandırılmış Supabase (.env) gerekli.'
          : 'Unavailable: Online mode and configured Supabase (.env) required.'
      toast.error(msg)
      return false
    }
    return true
  }

  // Автоприменение обязанностей/квалификаций по роли без подтверждения
  useEffect(() => {
    if (!selectedPerson) return
    if (!isAdminMode) return
    if (requireOnline && !supabaseEnabled) return

    const hasCustoms = (selectedPerson.customDuties && selectedPerson.customDuties.length > 0) ||
      (selectedPerson.customQualifications && selectedPerson.customQualifications.length > 0)
    if (hasCustoms) return

    const appliedKey = `ptw-auto-apply-done-${selectedPerson.id}`
    try {
      const alreadyApplied = typeof window !== 'undefined' ? sessionStorage.getItem(appliedKey) : '1'
      if (alreadyApplied) return
      sessionStorage.setItem(appliedKey, '1')
    } catch (_) {
      // ignore sessionStorage errors
    }

    const duties = PROCEDURE_DUTIES[selectedPerson.role][language]
    const quals = AUTO_QUALIFICATIONS[selectedPerson.role][language]

    ;(async () => {
      try {
        await handleUpdateDuties(selectedPerson.id, duties)
        await handleUpdateQualifications(selectedPerson.id, quals)
        const doneMsg = language === 'ru' ? '✅ Обязанности и квалификация применены' : language === 'tr' ? '✅ Görevler ve nitelikler uygulandı' : '✅ Duties and qualifications applied'
        toast.success(doneMsg)
      } catch (e) {
        // handleUpdate* уже показывают свои ошибки; тут просто перестраховка
      }
    })()
  }, [selectedPersonId, isAdminMode, language, requireOnline, supabaseEnabled])

  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">{language === 'ru' ? 'Загрузка...' : language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
      </div>
    </div>
  )

  const handleSeedDatabase = async () => {
    if (!supabaseEnabled) return
    
    const confirmMsg = language === 'ru' 
      ? 'Вы уверены? Это добавит тестовые данные в базу данных.' 
      : language === 'tr' 
      ? 'Emin misiniz? Bu işlem veritabanına test verileri ekleyecektir.' 
      : 'Are you sure? This will add test data to the database.'
      
    if (!window.confirm(confirmMsg)) return

    const loadingMsg = language === 'ru' ? 'Загрузка данных...' : language === 'tr' ? 'Veriler yükleniyor...' : 'Uploading data...'
    const toastId = toast.loading(loadingMsg)
    
    try {
      // Seed Departments
      for (const dept of INITIAL_DEPARTMENTS) {
        // Check if exists to avoid duplicates
        const existing = remoteDepartments?.find(d => d.name === dept.name)
        if (!existing) {
          await departmentStore.create(buildDepartmentInsert(dept))
        }
      }
      
      // Seed Personnel
      for (const person of INITIAL_PERSONS) {
        const existing = remotePersons?.find(p => p.email === person.email)
        if (!existing) {
          await personnelStore.create(buildPersonnelInsert(person))
        }
      }
      
      // Seed FAQs
      for (const faq of INITIAL_FAQS) {
        const existing = remoteFaqs?.find(f => f.question === faq.question)
        if (!existing) {
          await faqStore.create(buildFAQInsert(faq))
        }
      }
      
      toast.success(language === 'ru' ? 'База данных заполнена!' : 'Database seeded!', { id: toastId })
      loadSupabaseData()
    } catch (e) {
      console.error(e)
      toast.error('Failed to seed database', { id: toastId })
    }
  }

  const showSeedButton = usingSupabaseData && isAdminMode && (remotePersons?.length === 0 || remoteDepartments?.length === 0)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-center" />

      <header className="bg-gradient-to-r from-primary via-[oklch(0.28_0.03_240)] to-primary text-primary-foreground p-4 shadow-lg border-b">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{THEMES[currentTheme || 'stellar']?.emoji || '⭐'}</span>
            <h1 className="text-xl font-bold">{l.appTitle}</h1>
            {isAdminMode && (
              <span className="ml-2 px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs font-semibold flex items-center gap-1">
                <LockKey className="h-3 w-3" />
                {isSuperAdmin ? l.superAdminMode : l.adminMode}
              </span>
            )}
            {showSeedButton && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSeedDatabase}
                className="ml-2 font-semibold bg-yellow-500 hover:bg-yellow-600 text-white border-none animate-pulse"
              >
                <Database className="h-4 w-4 mr-1" />
                {language === 'ru' ? 'Заполнить БД' : 'Seed DB'}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isMobile && (
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="secondary" size="sm" className="font-semibold">
                    <Users className="h-4 w-4 mr-1" />
                    {l.personnel}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <PersonnelSidebar 
                    persons={allPersons} 
                    departments={allDepartments} 
                    selectedId={selectedPersonId} 
                    onSelectPerson={(id) => {
                      setSelectedPersonId(id)
                      setMobileSheetOpen(false)
                    }} 
                    language={language} 
                  />
                </SheetContent>
              </Sheet>
            )}
            {supabaseEnabled && !requireOnline && (
              <div className="flex gap-1">
                <Button
                  variant={forceOffline ? "destructive" : "secondary"}
                  size="sm"
                  onClick={() => setForceOffline(!forceOffline)}
                  className="font-semibold"
                  title={forceOffline ? "Switch to Online" : "Switch to Offline"}
                >
                  <Globe className={cn("h-4 w-4 mr-1", forceOffline && "opacity-50")} />
                  {forceOffline ? "Offline" : "Online"}
                </Button>
                
                {forceOffline && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSyncToCloud}
                    className="font-semibold bg-blue-600 hover:bg-blue-700 text-white border-none"
                    title={language === 'ru' ? "Отправить в облако" : "Push to Cloud"}
                  >
                    <CloudArrowUp className="h-4 w-4 mr-1" />
                    {language === 'ru' ? "Синхр." : "Sync"}
                  </Button>
                )}
              </div>
            )}
            {isAdminMode ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSwitchToUser}
                className="font-semibold"
              >
                <User className="h-4 w-4 mr-1" />
                {l.userMode}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSwitchToAdmin}
                className="font-semibold"
              >
                <LockKey className="h-4 w-4 mr-1" />
                {l.adminMode}
              </Button>
            )}
            <Select value={currentTheme || 'stellar'} onValueChange={(val) => setCurrentTheme(val)}>
              <SelectTrigger className="w-[160px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                <Palette className="h-4 w-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(THEMES).map(([key, theme]) => (
                  <SelectItem key={key} value={key}>
                    {theme.emoji} {theme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
              <SelectTrigger className="w-[140px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                <Globe className="h-4 w-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" size="sm" onClick={handleExport} className="font-semibold">
              <Download className="h-4 w-4 mr-1" />
              {language === 'ru' ? 'Экспорт' : language === 'tr' ? 'Dışa Aktar' : 'Export'}
            </Button>
            {isAdminMode && (
              <>
                <Button size="sm" onClick={() => setImportDialogOpen(true)} variant="secondary" className="font-semibold" disabled={writesForbidden} title={writesForbidden ? (language === 'ru' ? 'Требуется онлайн и Supabase' : language === 'tr' ? 'Çevrimiçi ve Supabase gerekli' : 'Online and Supabase required') : undefined}>
                  <Upload className="h-4 w-4 mr-1" />
                  {l.import}
                </Button>
                <Button size="sm" onClick={handleAddPerson} className="font-semibold bg-accent text-accent-foreground hover:bg-accent/90" disabled={writesForbidden} title={writesForbidden ? (language === 'ru' ? 'Требуется онлайн и Supabase' : language === 'tr' ? 'Çevrimiçi ve Supabase gerekli' : 'Online and Supabase required') : undefined}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  {language === 'ru' ? 'Добавить' : language === 'tr' ? 'Ekle' : 'Add'}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {supabaseEnabled && remoteLoading && !usingSupabaseData && (
        <div className="w-full px-4 py-2">
          <div className="mx-auto max-w-[1800px] rounded-md border border-border/40 bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
            {language === 'ru'
              ? 'Загружаем данные из Supabase...'
              : language === 'tr'
                ? 'Supabase verileri yükleniyor...'
                : 'Loading data from Supabase...'}
          </div>
        </div>
      )}

      {requireOnline && !supabaseEnabled && (
        <div className="w-full px-4 py-2">
          <div className="mx-auto max-w-[1800px] rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {language === 'ru'
              ? 'Требуется онлайн-режим: не настроен Supabase (.env). Укажите VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.'
              : language === 'tr'
                ? 'Çevrimiçi mod gerekli: Supabase yapılandırılmamış (.env). VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ayarlayın.'
                : 'Online mode required: Supabase is not configured (.env). Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'}
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden max-w-[1800px] mx-auto w-full">
        <aside className="w-80 flex-shrink-0 hidden md:flex">
          <PersonnelSidebar persons={allPersons} departments={allDepartments} selectedId={selectedPersonId} onSelectPerson={setSelectedPersonId} language={language} />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="personnel" className="flex flex-col h-full">
            <div className="bg-card border-b shadow-sm overflow-x-auto">
              <TabsList className="inline-flex w-full justify-start h-auto p-0 bg-transparent">
                <TabsTrigger value="personnel" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  👤 {l.tabs.personnel}
                </TabsTrigger>
                <TabsTrigger value="permits" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  📋 {l.tabs.permits}
                </TabsTrigger>
                <TabsTrigger value="combined" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  🔗 {l.tabs.combined}
                </TabsTrigger>
                <TabsTrigger value="departments" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  🏢 {l.tabs.departments}
                </TabsTrigger>
                <TabsTrigger value="process" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  ⚙️ {l.tabs.process}
                </TabsTrigger>
                <TabsTrigger value="roles" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  🎭 {l.tabs.roles}
                </TabsTrigger>
                <TabsTrigger value="rules" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  📏 {l.tabs.rules}
                </TabsTrigger>
                <TabsTrigger value="faq" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  ❓ {l.tabs.faq}
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  📊 {l.tabs.analytics}
                </TabsTrigger>
                <TabsTrigger value="docs" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  📄 {l.tabs.docs}
                </TabsTrigger>
                {isSuperAdmin && (
                  <TabsTrigger value="dashboard" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent text-indigo-600 font-semibold">
                    🚀 {l.tabs.dashboard}
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isSuperAdmin && (
                <TabsContent value="dashboard" className="mt-0">
                  <Suspense fallback={<LoadingFallback />}>
                    <SuperAdminDashboard 
                      language={language}
                      localPersonnel={allPersons}
                      localPermits={localPermits}
                      localDepartments={allDepartments}
                    />
                  </Suspense>
                </TabsContent>
              )}
              <TabsContent value="personnel" className="mt-0">\n                <div className="space-y-6">
                  {isMobile && (
                    <div className="md:hidden">
                      <PersonnelSidebar
                        persons={allPersons}
                        departments={allDepartments}
                        selectedId={selectedPersonId}
                        onSelectPerson={setSelectedPersonId}
                        language={language}
                        variant="card"
                      />
                    </div>
                  )}
                  <div className="w-full">
                    <InfoBoard language={language} isAdmin={isAdminMode} />
                  </div>
                  <div>
                    {selectedPerson ? (
                      <PersonProfile 
                        person={selectedPerson} 
                        language={language} 
                        isAdmin={isAdminMode}
                        departments={allDepartments}
                        onEdit={handleEditPerson} 
                        onDelete={handleDeletePerson}
                        onUpdateDuties={handleUpdateDuties}
                        onUpdateQualifications={handleUpdateQualifications}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[300px] text-center">
                        <div>
                          <div className="text-6xl mb-4">👋</div>
                          <h3 className="text-xl font-bold mb-2">{l.emptyTitle}</h3>
                          <p className="text-muted-foreground">{isMobile ? l.emptyDescMobile : l.emptyDesc}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="permits" className="mt-0">
                <Suspense fallback={<LoadingFallback />}>
                  <PTWTab language={language} isAdmin={isAdminMode} persons={allPersons} />
                </Suspense>
              </TabsContent>

              <TabsContent value="combined" className="mt-0">
                <Suspense fallback={<LoadingFallback />}>
                  <CombinedWorksTab language={language} isAdmin={isAdminMode} persons={allPersons} />
                </Suspense>
              </TabsContent>

              <TabsContent value="departments" className="mt-0">
                <DepartmentsTab
                  departments={allDepartments}
                  persons={allPersons}
                  language={language}
                  isAdmin={isAdminMode}
                  onAddDepartment={handleAddDepartment}
                  onEditDepartment={handleEditDepartment}
                  onDeleteDepartment={handleDeleteDepartment}
                />
              </TabsContent>

              <TabsContent value="process" className="mt-0">
                <Suspense fallback={<LoadingFallback />}>
                  <ProcessTab language={language} />
                </Suspense>
              </TabsContent>

              <TabsContent value="roles" className="mt-0">
                <Suspense fallback={<LoadingFallback />}>
                  <RolesTab persons={allPersons} language={language} />
                </Suspense>
              </TabsContent>

              <TabsContent value="rules" className="mt-0">
                <Suspense fallback={<LoadingFallback />}>
                  <RulesTab language={language} />
                </Suspense>
              </TabsContent>

              <TabsContent value="faq" className="mt-0">
                <FAQTab
                  language={language}
                  isAdmin={isAdminMode}
                  faqs={allFaqs}
                  onAddFAQ={handleAddFAQ}
                  onEditFAQ={handleEditFAQ}
                  onDeleteFAQ={handleDeleteFAQ}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <Suspense fallback={<LoadingFallback />}>
                  <AnalyticsTab stats={stats} language={language} />
                </Suspense>
              </TabsContent>

              <TabsContent value="docs" className="mt-0">
                <Suspense fallback={<LoadingFallback />}>
                  <DocumentsTab language={language} />
                </Suspense>
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>

      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} onLogin={handleAdminLogin} language={language} />
      {isAdminMode && (
        <>
          <PersonDialog 
            open={dialogOpen} 
            onOpenChange={async (open) => {
              setDialogOpen(open)
              if (!open && currentLock?.type === 'personnel' && editingPerson?.id) {
                await editLocks.release('personnel', editingPerson.id, sessionId)
                setCurrentLock(null)
              }
            }} 
            onSave={handleSavePerson} 
            person={editingPerson} 
            language={language} 
            departments={allDepartments} 
          />
          <ImportPersonnelDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} onImport={handleImportPersons} language={language} />
        </>
      )}
    </div>
  )
}

export default App
