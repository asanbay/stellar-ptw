import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  ShieldCheck, 
  Database, 
  HardDrives, 
  FileText, 
  Warning,
  ChartBar,
  UserGear,
  Download,
  ChartLineUp,
  ChartPie,
  Clock,
  CloudCheck,
  Info
} from '@phosphor-icons/react'
import { userStore } from '@/stores/users.store'
import { permitStore } from '@/stores/permits.store'
import { personnelStore } from '@/stores/personnel.store'
import { departmentStore } from '@/stores/departments.store'
import { faqStore } from '@/stores/faq.store'
import { toast } from 'sonner'
import { isSupabaseAvailable } from '@/lib/supabase'
import type { Language } from '@/lib/ptw-types'
import { format } from 'date-fns'
import { logger } from '@/lib/logger'

interface SuperAdminDashboardProps {
  language: Language
  localPersonnel?: any[]
  localPermits?: any[]
  localDepartments?: any[]
}

export function SuperAdminDashboard({ language, localPersonnel = [], localPermits = [], localDepartments = [] }: SuperAdminDashboardProps) {
  const supabaseEnabled = isSupabaseAvailable()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0,
    totalPermits: 0,
    activePermits: 0,
    totalPersonnel: 0,
    storageUsed: '0 MB'
  })
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasData, setHasData] = useState(false)

  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [permitStats, setPermitStats] = useState<Record<string, number>>({})
  const [departmentStats, setDepartmentStats] = useState<Record<string, number>>({})
  const [storageSize, setStorageSize] = useState<number>(0)

  const labels = {
    ru: {
      title: 'Панель Супер-Администратора',
      subtitle: 'Полный контроль над системой и пользователями',
      stats: 'Статистика системы',
      users: 'Управление пользователями',
      settings: 'Настройки системы',
      totalUsers: 'Всего пользователей',
      admins: 'Администраторы',
      permits: 'Наряды-допуски',
      storage: 'Хранилище',
      role: 'Роль',
      actions: 'Действия',
      makeAdmin: 'Сделать админом',
      makeUser: 'Сделать пользователем',
      dbConnection: 'Соединение с БД',
      connected: 'Подключено',
      disconnected: 'Нет соединения',
      systemInfo: 'Системная информация',
      serverUrl: 'URL Сервера',
      projectId: 'ID Проекта',
      environment: 'Окружение',
      clientVersion: 'Версия клиента',
      recentActivity: 'Недавняя активность',
      permitDistribution: 'Распределение нарядов',
      dataManagement: 'Управление данными',
      exportBackup: 'Скачать полный бэкап (JSON)',
      exportDesc: 'Экспорт всех данных системы для резервного копирования',
      newPermit: 'Новый наряд',
      newUser: 'Новый пользователь',
      departments: 'Отделы',
      personnelDist: 'Персонал по отделам',
      quickActions: 'Быстрые действия',
      createPermit: 'Создать наряд',
      createUser: 'Создать пользователя',
      viewLogs: 'Просмотр логов',
      storageUsage: 'Использование хранилища',
      lastBackup: 'Последний бэкап',
      notAvailable: 'Нет данных'
    },
    tr: {
      title: 'Süper Yönetici Paneli',
      subtitle: 'Sistem ve kullanıcılar üzerinde tam kontrol',
      stats: 'Sistem İstatistikleri',
      users: 'Kullanıcı Yönetimi',
      settings: 'Sistem Ayarları',
      totalUsers: 'Toplam Kullanıcı',
      admins: 'Yöneticiler',
      permits: 'İş İzinleri',
      storage: 'Depolama',
      role: 'Rol',
      actions: 'İşlemler',
      makeAdmin: 'Yönetici Yap',
      makeUser: 'Kullanıcı Yap',
      dbConnection: 'Veritabanı Bağlantısı',
      connected: 'Bağlandı',
      disconnected: 'Bağlantı Yok',
      systemInfo: 'Sistem Bilgisi',
      serverUrl: 'Sunucu URL',
      projectId: 'Proje ID',
      environment: 'Ortam',
      clientVersion: 'İstemci Sürümü',
      recentActivity: 'Son Aktiviteler',
      permitDistribution: 'İş İzni Dağılımı',
      dataManagement: 'Veri Yönetimi',
      exportBackup: 'Tam Yedek İndir (JSON)',
      exportDesc: 'Yedekleme için tüm sistem verilerini dışa aktar',
      newPermit: 'Yeni İş İzni',
      newUser: 'Yeni Kullanıcı',
      departments: 'Departmanlar',
      personnelDist: 'Departman Personeli',
      quickActions: 'Hızlı İşlemler',
      createPermit: 'İş İzni Oluştur',
      createUser: 'Kullanıcı Oluştur',
      viewLogs: 'Günlükleri Görüntüle',
      storageUsage: 'Depolama Kullanımı',
      lastBackup: 'Son Yedekleme',
      notAvailable: 'Veri Yok'
    },
    en: {
      title: 'Super Admin Dashboard',
      subtitle: 'Full control over system and users',
      stats: 'System Statistics',
      users: 'User Management',
      settings: 'System Settings',
      totalUsers: 'Total Users',
      admins: 'Administrators',
      permits: 'Permits',
      storage: 'Storage',
      role: 'Role',
      actions: 'Actions',
      makeAdmin: 'Make Admin',
      makeUser: 'Make User',
      dbConnection: 'DB Connection',
      connected: 'Connected',
      disconnected: 'Disconnected',
      systemInfo: 'System Information',
      serverUrl: 'Server URL',
      projectId: 'Project ID',
      environment: 'Environment',
      clientVersion: 'Client Version',
      recentActivity: 'Recent Activity',
      permitDistribution: 'Permit Distribution',
      dataManagement: 'Data Management',
      exportBackup: 'Download Full Backup (JSON)',
      exportDesc: 'Export all system data for backup purposes',
      newPermit: 'New Permit',
      newUser: 'New User',
      departments: 'Departments',
      personnelDist: 'Personnel by Dept',
      quickActions: 'Quick Actions',
      createPermit: 'Create Permit',
      createUser: 'Create User',
      viewLogs: 'View Logs',
      storageUsage: 'Storage Usage',
      lastBackup: 'Last Backup',
      notAvailable: 'Not Available'
    }
  }

  const l = labels[language]

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'Not configured'
  const projectId = supabaseUrl.includes('supabase.co') 
    ? supabaseUrl.split('https://')[1].split('.')[0] 
    : 'Local / Custom'
  const environment = import.meta.env.MODE
  const clientVersion = '2.45.4' // Supabase JS version from package.json (approx)

  useEffect(() => {
    loadData()
  }, [])
  
  // Перезагружаем данные при изменении локальных данных
  useEffect(() => {
    if (!supabaseEnabled && (localPersonnel.length > 0 || localPermits.length > 0 || localDepartments.length > 0)) {
      logger.log('🔄 Обновляем панель с новыми локальными данными')
      loadData()
    }
  }, [localPersonnel.length, localPermits.length, localDepartments.length, supabaseEnabled])

  const loadData = async () => {
    setLoading(true)
    logger.log('🚀 SuperAdminDashboard: начинаем загрузку данных', { supabaseEnabled })
    
    try {
      if (!supabaseEnabled) {
        // Используем локальные данные из localStorage
        logger.warn('⚠️ Supabase не настроен, используем данные из localStorage')
        
        const totalData = JSON.stringify({ localPersonnel, localPermits, localDepartments })
        const sizeBytes = new Blob([totalData]).size
        const sizeMB = sizeBytes / (1024 * 1024)
        
        setStats({
          totalUsers: 0, // Users только из Supabase
          totalAdmins: 0,
          totalSuperAdmins: 0,
          totalPermits: localPermits.length,
          activePermits: localPermits.filter((p: any) => p.status === 'active' || p.status === 'issued' || p.status === 'in-progress').length,
          totalPersonnel: localPersonnel.length,
          storageUsed: `${sizeMB.toFixed(2)} MB`
        })
        
        // Статистика по нарядам
        const pStats: Record<string, number> = {}
        localPermits.forEach((p: any) => {
          pStats[p.status] = (pStats[p.status] || 0) + 1
        })
        setPermitStats(pStats)
        
        // Статистика по отделам
        const dStats: Record<string, number> = {}
        localPersonnel.forEach((p: any) => {
          if (p.departmentId) {
            const dept = localDepartments.find((d: any) => d.id === p.departmentId)
            const name = dept ? dept.name : 'Unknown'
            dStats[name] = (dStats[name] || 0) + 1
          } else {
            dStats['Без отдела'] = (dStats['Без отдела'] || 0) + 1
          }
        })
        setDepartmentStats(dStats)
        
        // Недавняя активность из локальных данных
        const activity = [
          ...localPermits.slice(0, 3).map((p: any) => ({
            type: 'permit',
            title: `${l.newPermit}: ${p.number}`,
            desc: p.workDescription,
            date: p.createdAt,
            icon: FileText,
            color: 'text-blue-500 bg-blue-50'
          })),
          ...localPersonnel.slice(0, 3).map((p: any) => ({
            type: 'personnel',
            title: `Персонал: ${p.name}`,
            desc: p.position,
            date: new Date().toISOString(),
            icon: Users,
            color: 'text-green-500 bg-green-50'
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
        
        setRecentActivity(activity)
        setStorageSize(sizeMB)
        setHasData(localPersonnel.length > 0 || localPermits.length > 0)
        
        logger.log('✅ Загружены локальные данные:', {
          personnel: localPersonnel.length,
          permits: localPermits.length,
          departments: localDepartments.length
        })
        
        setLoading(false)
        return
      }

      // Fetch all data in parallel with individual error handling
      const [userStats, userList, permitsData, personnel, departments] = await Promise.all([
        userStore.getSystemStats().catch(err => {
          logger.warn('⚠️ Failed to load user stats:', err)
          return { users: 0, admins: 0, super_admins: 0, storage_used_mb: 0 }
        }),
        userStore.getAll().catch(err => {
          logger.warn('⚠️ Failed to load users:', err)
          return []
        }),
        permitStore.getAll().catch(err => {
          logger.warn('⚠️ Failed to load permits:', err)
          return []
        }),
        personnelStore.getAll().catch(err => {
          logger.warn('⚠️ Failed to load personnel:', err)
          return []
        }),
        departmentStore.getAll().catch(err => {
          logger.warn('⚠️ Failed to load departments:', err)
          return []
        })
      ])

      const permits = (permitsData || []) as any[]
      
      logger.log('📊 Загружено данных:', { 
        users: userList.length, 
        permits: permits.length,
        personnel: personnel.length,
        departments: departments.length
      })

      // Calculate real data size (approximate)
      const totalData = JSON.stringify({ userList, permits, personnel, departments })
      const sizeBytes = new Blob([totalData]).size
      const sizeMB = sizeBytes / (1024 * 1024)
      setStorageSize(sizeMB)

      setStats({
        totalUsers: userStats.users,
        totalAdmins: userStats.admins,
        totalSuperAdmins: userStats.super_admins,
        totalPermits: permits.length,
        activePermits: permits.filter((p: any) => p.status === 'active' || p.status === 'issued' || p.status === 'in-progress').length,
        totalPersonnel: personnel.length,
        storageUsed: `${sizeMB.toFixed(2)} MB`
      })
      
      setUsers(userList)

      // Calculate Permit Stats
      const pStats: Record<string, number> = {}
      permits.forEach((p: any) => {
        pStats[p.status] = (pStats[p.status] || 0) + 1
      })
      setPermitStats(pStats)

      // Calculate Department Stats
      const dStats: Record<string, number> = {}
      personnel.forEach((p: any) => {
        if (p.department_id) {
           const dept = (departments as any[]).find((d: any) => d.id === p.department_id)
           const name = dept ? dept.name : 'Unknown'
           dStats[name] = (dStats[name] || 0) + 1
        } else {
          dStats['No Dept'] = (dStats['No Dept'] || 0) + 1
        }
      })
      setDepartmentStats(dStats)

      // Generate Recent Activity
      const activity = [
        ...permits.slice(0, 5).map((p: any) => ({
          type: 'permit',
          title: `${l.newPermit}: ${p.permit_number}`,
          desc: p.description,
          date: p.created_at,
          icon: FileText,
          color: 'text-blue-500 bg-blue-50'
        })),
        ...userList.slice(0, 5).map((u: any) => ({
          type: 'user',
          title: `${l.newUser}: ${u.username || u.email}`,
          desc: u.role,
          date: u.created_at,
          icon: Users,
          color: 'text-green-500 bg-green-50'
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
      
      setRecentActivity(activity)
      
      // Check if we have any real data
      const hasRealData = userList.length > 0 || permits.length > 0 || personnel.length > 0
      setHasData(hasRealData)
      
      if (hasRealData) {
        logger.log('✅ SuperAdminDashboard: данные загружены', { 
          users: userList.length, 
          permits: permits.length,
          personnel: personnel.length 
        })
      } else {
        logger.warn('⚠️ SuperAdminDashboard: база данных пустая')
      }

    } catch (error) {
      logger.error('❌ Failed to load super admin data:', error)
      const errorMsg = language === 'ru' 
        ? 'Не удалось загрузить данные системы' 
        : language === 'tr'
        ? 'Sistem verileri yüklenemedi'
        : 'Failed to load system data'
      toast.error(errorMsg)
      
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalAdmins: 0,
        totalSuperAdmins: 0,
        totalPermits: 0,
        activePermits: 0,
        totalPersonnel: 0,
        storageUsed: '0 MB'
      })
      setHasData(false)
    } finally {
      setLoading(false)
    }
  }

  const handleExportBackup = async () => {
    try {
      const [users, permits, personnel, departments, faq] = await Promise.all([
        userStore.getAll(),
        permitStore.getAll(),
        personnelStore.getAll(),
        departmentStore.getAll(),
        faqStore.getAll()
      ])

      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          users,
          permits,
          personnel,
          departments,
          faq
        }
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stellar-ptw-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Backup downloaded successfully')
    } catch (error) {
      console.error('Backup failed', error)
      toast.error('Failed to generate backup')
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    try {
      logger.log('👤 Изменение роли пользователя:', { userId, newRole })
      await userStore.updateUserRole(userId, newRole)
      toast.success(`${language === 'ru' ? 'Роль изменена на' : 'Role updated to'} ${newRole}`)
      loadData() // Reload to reflect changes
    } catch (error) {
      logger.error('❌ Failed to update role:', error)
      toast.error(language === 'ru' ? 'Не удалось обновить роль' : 'Failed to update role')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">
            {language === 'ru' ? 'Загрузка...' : language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      {!supabaseEnabled && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>
            {language === 'ru' ? 'Режим локального хранилища' : language === 'tr' ? 'Yerel depolama modu' : 'Local Storage Mode'}
          </AlertTitle>
          <AlertDescription>
            {language === 'ru' 
              ? 'Показываются данные из localStorage. Для управления пользователями и полного функционала подключите Supabase (VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY).'
              : language === 'tr'
              ? 'localStorage veriler gösteriliyor. Kullanıcı yönetimi ve tam işlevsellik için Supabase bağlayın.'
              : 'Showing localStorage data. Connect Supabase for user management and full functionality.'}
          </AlertDescription>
        </Alert>
      )}
      
      {supabaseEnabled && !hasData && !loading && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>
            {language === 'ru' ? 'База данных пустая' : language === 'tr' ? 'Veritabanı boş' : 'Database Empty'}
          </AlertTitle>
          <AlertDescription>
            {language === 'ru' 
              ? 'Нет данных для отображения. Создайте пользователей через Supabase Auth или заполните базу данных тестовыми данными.'
              : language === 'tr'
              ? 'Görüntülenecek veri yok. Supabase Auth aracılığıyla kullanıcı oluşturun veya veritabanını test verileriyle doldurun.'
              : 'No data to display. Create users via Supabase Auth or seed the database with test data.'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">\n        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            {l.title}
          </h1>
          <p className="text-slate-500 mt-1">{l.subtitle}</p>
        </div>
        <Badge variant="outline" className={supabaseEnabled ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
          <Database className="h-4 w-4 mr-1" />
          {supabaseEnabled ? l.connected : l.disconnected}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{l.totalUsers}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAdmins} {l.admins}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{l.permits}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPermits}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePermits} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personnel</CardTitle>
            <UserGear className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPersonnel}</div>
            <p className="text-xs text-muted-foreground">
              Registered employees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{l.storage}</CardTitle>
            <HardDrives className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storageUsed}</div>
            <p className="text-xs text-muted-foreground">
              Estimated usage
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartLineUp className="h-5 w-5" />
              {l.recentActivity}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`p-2 rounded-full ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(item.date), 'dd.MM HH:mm')}
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permit Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartPie className="h-5 w-5" />
              {l.permitDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(permitStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'active' || status === 'in-progress' ? 'bg-green-500' :
                      status === 'draft' ? 'bg-gray-300' :
                      status === 'completed' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-sm capitalize">{status}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
              {Object.keys(permitStats).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Department Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {l.personnelDist}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(departmentStats).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between">
                  <span className="text-sm">{dept}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
              {Object.keys(departmentStats).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storage & Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudCheck className="h-5 w-5" />
              {l.storageUsage}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{l.storage}</span>
                  <span className="text-muted-foreground">{storageSize.toFixed(2)} MB / 500 MB</span>
                </div>
                <Progress value={(storageSize / 500) * 100} className="h-2" />
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">{l.lastBackup}</span>
                <span className="text-sm font-medium">{l.notAvailable}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrives className="h-5 w-5" />
              {l.quickActions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                {l.createPermit}
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <UserGear className="mr-2 h-4 w-4" />
                {l.createUser}
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ChartLineUp className="mr-2 h-4 w-4" />
                {l.viewLogs}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">{l.users}</TabsTrigger>
          <TabsTrigger value="settings">{l.settings}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{l.users}</CardTitle>
              <CardDescription>Manage system access and roles</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found in database. Users must sign up via Supabase Auth first.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email/Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username || user.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.role === 'super_admin' ? 'default' : 
                            user.role === 'admin' ? 'secondary' : 'outline'
                          }>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(user.created_at), 'dd.MM.yyyy')}</TableCell>
                        <TableCell className="text-right gap-2 flex justify-end">
                          {user.role !== 'super_admin' && (
                            <>
                              {user.role !== 'admin' && (
                                <Button size="sm" variant="outline" onClick={() => handleRoleChange(user.id, 'admin')}>
                                  Make Admin
                                </Button>
                              )}
                              {user.role === 'admin' && (
                                <Button size="sm" variant="outline" onClick={() => handleRoleChange(user.id, 'user')}>
                                  Make User
                                </Button>
                              )}
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{l.systemInfo}</CardTitle>
              <CardDescription>Connection details and environment info</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="text-sm text-muted-foreground mb-1">{l.serverUrl}</div>
                  <div className="font-mono text-sm break-all">{supabaseUrl}</div>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="text-sm text-muted-foreground mb-1">{l.projectId}</div>
                  <div className="font-mono text-sm">{projectId}</div>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="text-sm text-muted-foreground mb-1">{l.environment}</div>
                  <div className="font-medium capitalize">{environment}</div>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="text-sm text-muted-foreground mb-1">{l.clientVersion}</div>
                  <div className="font-mono text-sm">v{clientVersion}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{l.settings}</CardTitle>
              <CardDescription>System-wide configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">{l.dataManagement}</h3>
                    <p className="text-sm text-muted-foreground">{l.exportDesc}</p>
                  </div>
                  <Button onClick={handleExportBackup} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    {l.exportBackup}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Maintenance Mode</h3>
                    <p className="text-sm text-muted-foreground">Disable access for regular users</p>
                  </div>
                  <Button variant="outline" disabled>Coming Soon</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">System Logs</h3>
                    <p className="text-sm text-muted-foreground">View application activity logs</p>
                  </div>
                  <Button variant="outline" disabled>Coming Soon</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
