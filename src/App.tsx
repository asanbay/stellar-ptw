import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { UserPlus, Download, Globe, LockKey, User, Palette } from '@phosphor-icons/react'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PersonnelSidebar } from '@/components/PersonnelSidebar'
import { PersonProfile } from '@/components/PersonProfile'
import { PersonDialog } from '@/components/PersonDialog'
import { ProcessTab } from '@/components/ProcessTab'
import { RolesTab } from '@/components/RolesTab'
import { RulesTab } from '@/components/RulesTab'
import { AnalyticsTab } from '@/components/AnalyticsTab'
import { DocumentsTab } from '@/components/DocumentsTab'
import { InfoBoard } from '@/components/InfoBoard'
import { LoginDialog } from '@/components/LoginDialog'
import { PTWTab } from '@/components/PTWTab'
import { CombinedWorksTab } from '@/components/CombinedWorksTab'
import type { Person, Language } from '@/lib/ptw-types'
import type { PTWForm } from '@/lib/ptw-form-types'
import { useLanguage } from '@/hooks/use-language'
import { calculatePersonStats, exportToCSV } from '@/lib/ptw-utils'
import { THEMES } from '@/lib/themes'

const INITIAL_PERSONS: Person[] = [
  {
    id: '1',
    name: 'Файзалиева Людмила',
    position: 'Директор по ОТ и ПБ',
    role: 'issuer',
    email: 'l.fayzalieva@stellar.com',
    phone: '+79991234567',
  },
  {
    id: '2',
    name: 'Мустафа Кючюкйылмаз',
    position: 'Операционный директор',
    role: 'supervisor',
    email: 'm.kucukyilmaz@stellar.com',
    phone: '+905551234567',
  },
  {
    id: '3',
    name: 'Петров Иван',
    position: 'Мастер-производитель',
    role: 'foreman',
    email: 'i.petrov@stellar.com',
    phone: '+79991234568',
  },
  {
    id: '4',
    name: 'Сидоров Сергей',
    position: 'Рабочий-монтажник',
    role: 'worker',
    email: 's.sidorov@stellar.com',
    phone: '+79991234569',
  },
]

function App() {
  const [persons, setPersons] = useKV<Person[]>('ptw-persons', INITIAL_PERSONS)
  const { language, setLanguage } = useLanguage()
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | undefined>()
  const [userMode, setUserMode] = useState<'user' | 'admin'>('user')
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useKV<string>('ptw-theme', 'stellar')

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

  const handleSwitchToAdmin = () => {
    setLoginDialogOpen(true)
  }

  const handleAdminLogin = () => {
    setUserMode('admin')
    toast.success(language === 'ru' ? '✅ Вы вошли как администратор' : language === 'tr' ? '✅ Yönetici olarak giriş yaptınız' : '✅ Logged in as administrator')
  }

  const handleSwitchToUser = () => {
    setUserMode('user')
    toast.success(language === 'ru' ? '👤 Режим пользователя' : language === 'tr' ? '👤 Kullanıcı modu' : '👤 User mode')
  }

  const isAdminMode = userMode === 'admin'

  const allPersons = persons || INITIAL_PERSONS
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

  const handleSavePerson = (personData: Partial<Person>) => {
    if (editingPerson) {
      setPersons((current) => (current || []).map((p) => (p.id === editingPerson.id ? { ...p, ...personData } : p)))
      toast.success(language === 'ru' ? '✅ Обновлено' : language === 'tr' ? '✅ Güncellendi' : '✅ Updated')
    } else {
      const newPerson: Person = {
        id: crypto.randomUUID(),
        name: personData.name!,
        position: personData.position!,
        role: personData.role!,
        email: personData.email,
        phone: personData.phone,
      }
      setPersons((current) => [...(current || []), newPerson])
      toast.success(language === 'ru' ? '✅ Добавлено' : language === 'tr' ? '✅ Eklendi' : '✅ Added')
    }
  }

  const handleDeletePerson = (id: string) => {
    const confirmMsg = language === 'ru' ? 'Вы уверены?' : language === 'tr' ? 'Emin misiniz?' : 'Are you sure?'
    if (confirm(confirmMsg)) {
      setPersons((current) => (current || []).filter((p) => p.id !== id))
      setSelectedPersonId(null)
      toast.success(language === 'ru' ? '✅ Удалено' : language === 'tr' ? '✅ Silindi' : '✅ Deleted')
    }
  }

  const handleExport = () => {
    exportToCSV(allPersons, language)
    toast.success(language === 'ru' ? '✅ Экспортировано' : language === 'tr' ? '✅ Dışa Aktarıldı' : '✅ Exported')
  }

  const handleUpdateDuties = (personId: string, duties: string[]) => {
    setPersons((current) => (current || []).map((p) => (p.id === personId ? { ...p, customDuties: duties } : p)))
    toast.success(language === 'ru' ? '✅ Обязанности обновлены' : language === 'tr' ? '✅ Yükümlülükler güncellendi' : '✅ Duties updated')
  }

  const handleUpdateQualifications = (personId: string, qualifications: string[]) => {
    setPersons((current) => (current || []).map((p) => (p.id === personId ? { ...p, customQualifications: qualifications } : p)))
    toast.success(language === 'ru' ? '✅ Квалификация обновлена' : language === 'tr' ? '✅ Nitelikler güncellendi' : '✅ Qualifications updated')
  }

  const labels = {
    ru: { 
      appTitle: 'Stellar PTW', 
      tabs: { 
        personnel: 'Профиль', 
        permits: 'Наряды-допуски',
        combined: 'Совмещенные',
        process: 'Процесс', 
        roles: 'Роли', 
        rules: 'Правила', 
        analytics: 'Аналитика', 
        docs: 'Документы' 
      }, 
      emptyTitle: 'Выберите сотрудника', 
      emptyDesc: 'Нажмите на сотрудника слева для просмотра деталей',
      adminMode: 'Админ',
      userMode: 'Пользователь',
      logout: 'Выйти',
      theme: 'Тема',
    },
    tr: { 
      appTitle: 'Stellar PTW', 
      tabs: { 
        personnel: 'Profil', 
        permits: 'İş İzinleri',
        combined: 'Birleştirilmiş',
        process: 'Süreç', 
        roles: 'Roller', 
        rules: 'Kurallar', 
        analytics: 'Analiz', 
        docs: 'Belgeler' 
      }, 
      emptyTitle: 'Çalışan Seçin', 
      emptyDesc: 'Detayları görmek için soldaki bir çalışana tıklayın',
      adminMode: 'Yönetici',
      userMode: 'Kullanıcı',
      logout: 'Çıkış',
      theme: 'Tema',
    },
    en: { 
      appTitle: 'Stellar PTW', 
      tabs: { 
        personnel: 'Profile', 
        permits: 'Permits',
        combined: 'Combined',
        process: 'Process', 
        roles: 'Roles', 
        rules: 'Rules', 
        analytics: 'Analytics', 
        docs: 'Documents' 
      }, 
      emptyTitle: 'Select Personnel', 
      emptyDesc: 'Click on a person in the sidebar to view details',
      adminMode: 'Admin',
      userMode: 'User',
      logout: 'Logout',
      theme: 'Theme',
    },
  }

  const l = labels[language]

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
                {l.adminMode}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
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
              <Button size="sm" onClick={handleAddPerson} className="font-semibold bg-accent text-accent-foreground hover:bg-accent/90">
                <UserPlus className="h-4 w-4 mr-1" />
                {language === 'ru' ? 'Добавить' : language === 'tr' ? 'Ekle' : 'Add'}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden max-w-[1800px] mx-auto w-full">
        <aside className="w-80 flex-shrink-0 hidden md:flex">
          <PersonnelSidebar persons={allPersons} selectedId={selectedPersonId} onSelectPerson={setSelectedPersonId} language={language} />
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
                <TabsTrigger value="process" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  ⚙️ {l.tabs.process}
                </TabsTrigger>
                <TabsTrigger value="roles" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  🎭 {l.tabs.roles}
                </TabsTrigger>
                <TabsTrigger value="rules" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  📏 {l.tabs.rules}
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  📊 {l.tabs.analytics}
                </TabsTrigger>
                <TabsTrigger value="docs" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:bg-transparent">
                  📄 {l.tabs.docs}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="personnel" className="mt-0">
                <div className="space-y-6">
                  <div className="w-full">
                    <InfoBoard language={language} isAdmin={isAdminMode} />
                  </div>
                  <div>
                    {selectedPerson ? (
                      <PersonProfile 
                        person={selectedPerson} 
                        language={language} 
                        isAdmin={isAdminMode} 
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
                          <p className="text-muted-foreground">{l.emptyDesc}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="permits" className="mt-0">
                <PTWTab language={language} isAdmin={isAdminMode} persons={allPersons} />
              </TabsContent>

              <TabsContent value="combined" className="mt-0">
                <CombinedWorksTab language={language} isAdmin={isAdminMode} persons={allPersons} />
              </TabsContent>

              <TabsContent value="process" className="mt-0">
                <ProcessTab language={language} />
              </TabsContent>

              <TabsContent value="roles" className="mt-0">
                <RolesTab persons={allPersons} language={language} />
              </TabsContent>

              <TabsContent value="rules" className="mt-0">
                <RulesTab language={language} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <AnalyticsTab stats={stats} language={language} />
              </TabsContent>

              <TabsContent value="docs" className="mt-0">
                <DocumentsTab language={language} />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>

      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} onLogin={handleAdminLogin} language={language} />
      {isAdminMode && <PersonDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSavePerson} person={editingPerson} language={language} />}
    </div>
  )
}

export default App
