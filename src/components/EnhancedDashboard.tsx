import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendUp, TrendDown, Users, FileText, Warning, CheckCircle } from '@phosphor-icons/react'
import type { Language } from '@/lib/ptw-types'

interface DashboardData {
  ptws: Array<{
    id: string
    status: string
    workType: string
    departmentId?: string
    startDate: string
    endDate: string
  }>
  personnel: Array<{
    id: string
    role: string
    departmentId?: string
  }>
  departments: Array<{
    id: string
    name: string
  }>
}

interface EnhancedDashboardProps {
  data: DashboardData
  language?: Language
}

const translations = {
  ru: {
    overview: 'Обзор',
    overviewDesc: 'Ключевые метрики системы',
    totalPTWs: 'Всего PTW',
    activePTWs: 'Активных PTW',
    totalPersonnel: 'Всего персонала',
    completionRate: 'Процент завершения',
    byStatus: 'По статусу',
    byWorkType: 'По типу работ',
    byDepartment: 'По департаментам',
    trend: 'Тренд за месяц',
    draft: 'Черновик',
    issued: 'Выдан',
    'in-progress': 'В работе',
    completed: 'Завершён',
    closed: 'Закрыт',
  },
  tr: {
    overview: 'Genel Bakış',
    overviewDesc: 'Ana sistem metrikleri',
    totalPTWs: 'Toplam PTW',
    activePTWs: 'Aktif PTW',
    totalPersonnel: 'Toplam Personel',
    completionRate: 'Tamamlanma Oranı',
    byStatus: 'Duruma Göre',
    byWorkType: 'İş Türüne Göre',
    byDepartment: 'Departmana Göre',
    trend: 'Aylık Trend',
    draft: 'Taslak',
    issued: 'Verildi',
    'in-progress': 'Devam Ediyor',
    completed: 'Tamamlandı',
    closed: 'Kapatıldı',
  },
  en: {
    overview: 'Overview',
    overviewDesc: 'Key system metrics',
    totalPTWs: 'Total PTWs',
    activePTWs: 'Active PTWs',
    totalPersonnel: 'Total Personnel',
    completionRate: 'Completion Rate',
    byStatus: 'By Status',
    byWorkType: 'By Work Type',
    byDepartment: 'By Department',
    trend: 'Monthly Trend',
    draft: 'Draft',
    issued: 'Issued',
    'in-progress': 'In Progress',
    completed: 'Completed',
    closed: 'Closed',
  },
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function EnhancedDashboard({ data, language = 'en' }: EnhancedDashboardProps) {
  const t = translations[language]

  const stats = useMemo(() => {
    const totalPTWs = data.ptws.length
    const activePTWs = data.ptws.filter((p) => p.status === 'in-progress' || p.status === 'issued').length
    const completedPTWs = data.ptws.filter((p) => p.status === 'completed' || p.status === 'closed').length
    const completionRate = totalPTWs > 0 ? Math.round((completedPTWs / totalPTWs) * 100) : 0

    return {
      totalPTWs,
      activePTWs,
      totalPersonnel: data.personnel.length,
      completionRate,
    }
  }, [data])

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    data.ptws.forEach((ptw) => {
      counts[ptw.status] = (counts[ptw.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({
      name: t[status as keyof typeof t] || status,
      value: count,
    }))
  }, [data.ptws, language])

  const workTypeData = useMemo(() => {
    const counts: Record<string, number> = {}
    data.ptws.forEach((ptw) => {
      counts[ptw.workType] = (counts[ptw.workType] || 0) + 1
    })
    return Object.entries(counts).map(([type, count]) => ({
      name: type,
      count,
    }))
  }, [data.ptws])

  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {}
    data.ptws.forEach((ptw) => {
      if (ptw.departmentId) {
        const dept = data.departments.find((d) => d.id === ptw.departmentId)
        const name = dept?.name || 'Unknown'
        counts[name] = (counts[name] || 0) + 1
      }
    })
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }))
  }, [data.ptws, data.departments])

  const monthlyTrend = useMemo(() => {
    const months: Record<string, { created: number; completed: number }> = {}
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = date.toLocaleDateString('en-US', { month: 'short' })
      months[key] = { created: 0, completed: 0 }
    }

    data.ptws.forEach((ptw) => {
      const startDate = new Date(ptw.startDate)
      const key = startDate.toLocaleDateString('en-US', { month: 'short' })
      
      if (months[key]) {
        months[key].created++
        if (ptw.status === 'completed' || ptw.status === 'closed') {
          months[key].completed++
        }
      }
    })

    return Object.entries(months).map(([month, data]) => ({
      month,
      created: data.created,
      completed: data.completed,
    }))
  }, [data.ptws])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalPTWs}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPTWs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.activePTWs}</CardTitle>
            <Warning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePTWs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalPersonnel}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPersonnel}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.completionRate}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t.byStatus}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Work Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t.byWorkType}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>{t.trend}</CardTitle>
          <CardDescription>PTWs created vs completed over last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Created" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Distribution */}
      {departmentData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.byDepartment}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
