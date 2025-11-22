import { Card } from '@/components/ui/card'
import type { Language, Stats } from '@/lib/ptw-types'
import { ROLE_COLORS } from '@/lib/ptw-constants'

interface AnalyticsTabProps {
  stats: Stats
  language: Language
}

export function AnalyticsTab({ stats, language }: AnalyticsTabProps) {
  const labels = {
    ru: {
      total: 'Всего',
      issuers: 'Выдающие',
      supervisors: 'Руководители',
      foremen: 'Производители',
      workers: 'Исполнители',
      roleDistribution: 'Распределение по ролям',
    },
    tr: {
      total: 'Toplam',
      issuers: 'İzni Verenler',
      supervisors: 'Yöneticiler',
      foremen: 'İş Yapanlar',
      workers: 'İşçiler',
      roleDistribution: 'Rollere Göre Dağılım',
    },
    en: {
      total: 'Total',
      issuers: 'Issuers',
      supervisors: 'Supervisors',
      foremen: 'Foremen',
      workers: 'Workers',
      roleDistribution: 'Role Distribution',
    },
  }

  const l = labels[language]

  const roleStats = [
    { key: 'issuer', label: l.issuers, value: stats.issuer, color: ROLE_COLORS.issuer },
    { key: 'supervisor', label: l.supervisors, value: stats.supervisor, color: ROLE_COLORS.supervisor },
    { key: 'foreman', label: l.foremen, value: stats.foreman, color: ROLE_COLORS.foreman },
    { key: 'worker', label: l.workers, value: stats.worker, color: ROLE_COLORS.worker },
  ]

  const maxValue = Math.max(...roleStats.map((s) => s.value), 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-6 text-center border-t-4 border-t-primary">
          <div className="text-3xl font-extrabold text-primary mb-2">{stats.total}</div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{l.total}</div>
        </Card>
        {roleStats.map((stat) => (
          <Card key={stat.key} className="p-6 text-center border-t-4" style={{ borderTopColor: stat.color }}>
            <div className="text-3xl font-extrabold mb-2" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-bold mb-6 text-center flex items-center justify-center gap-2">
          <span>📊</span>
          {l.roleDistribution}
        </h3>
        <div className="space-y-4">
          {roleStats.map((stat) => (
            <div key={stat.key}>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span>{stat.label}</span>
                <span>{stat.value}</span>
              </div>
              <div className="h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(stat.value / maxValue) * 100}%`,
                    backgroundColor: stat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
