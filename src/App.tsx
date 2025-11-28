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
import type { Person, Language, Department, FAQItem } from '@/lib/ptw-types'
import { useLanguage } from '@/hooks/use-language'
import { calculatePersonStats, exportToCSV } from '@/lib/ptw-utils'
import { generateId, cn } from '@/lib/utils'
import { THEMES } from '@/lib/themes'
import { INITIAL_FAQS } from '@/lib/faq-data'
import { useIsMobile } from '@/hooks/use-mobile'
import { isSupabaseAvailable } from '@/lib/supabase'
import { personnelStore } from '@/stores/personnel.store'
import { departmentStore } from '@/stores/departments.store'
import { faqStore } from '@/stores/faq.store'
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
  const [forceOffline, setForceOffline] = useKV<boolean>('ptw-force-offline', false)
  const supabaseEnabled = isSupabaseAvailable()
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
  const [userMode, setUserMode] = useState<'user' | 'admin'>('user')
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useKV<string>('ptw-theme', 'stellar')
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    console.log('🚀 App initialized:', {
      supabaseEnabled,
      localPersonsCount: localPersons?.length || 0,
      localDepartmentsCount: localDepartments?.length || 0,
      domain: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
    })
  }, [])

  const loadSupabaseData = useCallback(async () => {
    if (!supabaseEnabled) return

    setRemoteLoading(true)
    setRemoteError(null)

    try {
      const [departmentsData, personsData, faqData] = await Promise.all([
        departmentStore.getAll(),
        personnelStore.getAll(),
        faqStore.getAll(),
      ])

      setRemoteDepartments(departmentsData.map(mapDepartmentRow))
      setRemotePersons(personsData.map(mapPersonnelRow))
      setRemoteFaqs(faqData.map(mapFAQRow))
    } catch (error) {
      console.error('Failed to load Supabase data', error)
      setRemoteDepartments(null)
      setRemotePersons(null)
      setRemoteFaqs(null)
      setRemoteError(error instanceof Error ? error.message : 'Unknown Supabase error')
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
  const usingSupabaseData = !forceOffline && remoteReady && !remoteError

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

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person)
    setDialogOpen(true)
  }

  const handleSavePerson = async (personData: Partial<Person>) => {
    console.log('💾 handleSavePerson called', { personData, editingPerson, usingSupabaseData })
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
  }

  const handleDeletePerson = async (id: string) => {
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
    const successMessage = language === 'ru' ? '✅ Обязанности обновлены' : language === 'tr' ? '✅ Yükümlülükler güncellendi' : '✅ Duties updated'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось обновить обязанности'
      : language === 'tr'
        ? '❌ Yükümlülükler güncellenemedi'
        : '❌ Failed to update duties'

    if (usingSupabaseData) {
      try {
        const updated = await personnelStore.update(personId, buildPersonnelUpdate({ customDuties: duties }))
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

    setLocalPersons((current) => (current || []).map((p) => (p.id === personId ? { ...p, customDuties: duties } : p)))
    toast.success(successMessage)
  }

  const handleUpdateQualifications = async (personId: string, qualifications: string[]) => {
    const successMessage = language === 'ru' ? '✅ Квалификация обновлена' : language === 'tr' ? '✅ Nitelikler güncellendi' : '✅ Qualifications updated'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось обновить квалификацию'
      : language === 'tr'
        ? '❌ Nitelikler güncellenemedi'
        : '❌ Failed to update qualifications'

    if (usingSupabaseData) {
      try {
        const updated = await personnelStore.update(personId, buildPersonnelUpdate({ customQualifications: qualifications }))
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

    setLocalPersons((current) => (current || []).map((p) => (p.id === personId ? { ...p, customQualifications: qualifications } : p)))
    toast.success(successMessage)
  }

  const handleImportPersons = async (importedPersons: Person[]) => {
    console.log('📥 handleImportPersons вызван:', {
      count: importedPersons.length,
      usingSupabase: usingSupabaseData,
      persons: importedPersons
    })
    
    if (importedPersons.length === 0) {
      console.warn('⚠️ Нет данных для импорта')
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
        console.log('💾 Импорт в Supabase...')
        const payload = importedPersons.map((person) => buildPersonnelInsert(person))
        console.log('📤 Payload для Supabase:', payload)
        const inserted = await personnelStore.bulkCreate(payload)
        console.log('✅ Supabase вернул:', inserted)
        const mapped = inserted.map(mapPersonnelRow)
        console.log('✅ Mapped данные:', mapped)
        setRemotePersons((current) => current ? [...current, ...mapped] : mapped)
        toast.success(successMessage)
        console.log('✅ Импорт в Supabase завершен успешно')
      } catch (error) {
        console.error('❌ Failed to import personnel', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
      return
    }

    console.log('💾 Импорт в localStorage...')
    setLocalPersons((current) => [...(current || []), ...importedPersons])
    toast.success(successMessage)
    console.log('✅ Импорт в localStorage завершен')
  }

  const handleAddDepartment = async (deptData: Partial<Department>) => {
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
    const successMessage = language === 'ru' ? '✅ Вопрос добавлен' : language === 'tr' ? '✅ Soru eklendi' : '✅ Question added'
    const errorMessage = language === 'ru'
      ? '❌ Не удалось добавить вопрос'
      : language === 'tr'
        ? '❌ Soru eklenemedi'
        : '❌ Failed to add question'
    const order = faqData.order ?? allFaqs.length

    if (usingSupabaseData) {
      try {
        const created = await faqStore.create(buildFAQInsert({ ...faqData, order }))
        const mapped = mapFAQRow(created)
        setRemoteFaqs((current) => {
          const next = current ? [...current, mapped] : [mapped]
          return next.sort((a, b) => a.order - b.order)
        })
        toast.success(successMessage)
      } catch (error) {
        console.error('Failed to add FAQ', error)
        const details = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`${errorMessage}: ${details}`)
      }
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
    toast.success(successMessage)
  }

  const handleEditFAQ = async (id: string, faqData: Partial<FAQItem>) => {
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
      // 1. Sync Departments
      const currentRemoteDepts = await departmentStore.getAll()
      for (const localDept of (localDepartments || [])) {
        // Check by Name or ID
        const exists = currentRemoteDepts.some(d => d.name === localDept.name || d.id === localDept.id)
        if (!exists) {
          await departmentStore.create(buildDepartmentInsert(localDept))
          addedCount++
        } else {
          skippedCount++
        }
      }

      // 2. Sync Personnel
      const currentRemotePersons = await personnelStore.getAll()
      for (const localPerson of (localPersons || [])) {
        // Check by Email (if exists) or Name + Role, or ID
        const exists = currentRemotePersons.some(p =>
          p.id === localPerson.id ||
          (localPerson.email && p.email === localPerson.email) ||
          (p.name === localPerson.name && p.role === localPerson.role)
        )

        if (!exists) {
          await personnelStore.create(buildPersonnelInsert(localPerson))
          addedCount++
        } else {
          skippedCount++
        }
      }

      // 3. Sync FAQs
      const currentRemoteFaqs = await faqStore.getAll()
      for (const localFaq of (localFaqs || [])) {
        const exists = currentRemoteFaqs.some(f => f.id === localFaq.id || f.question === localFaq.question)
        if (!exists) {
          await faqStore.create(buildFAQInsert(localFaq))
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
      toast.error(language === 'ru' ? 'Ошибка синхронизации' : 'Sync error', { id: toastId })
    }
  }

  const l = labels[language]

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
            {supabaseEnabled && (
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
                <Button size="sm" onClick={() => setImportDialogOpen(true)} variant="secondary" className="font-semibold">
                  <Upload className="h-4 w-4 mr-1" />
                  {l.import}
                </Button>
                <Button size="sm" onClick={handleAddPerson} className="font-semibold bg-accent text-accent-foreground hover:bg-accent/90">
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
                    <SuperAdminDashboard language={language} />
                  </Suspense>
                </TabsContent>
              )}
              <TabsContent value="personnel" className="mt-0">
                <div className="space-y-6">
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
          <PersonDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSavePerson} person={editingPerson} language={language} departments={allDepartments} />
          <ImportPersonnelDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} onImport={handleImportPersons} language={language} />
        </>
      )}
    </div>
  )
}

export default App
