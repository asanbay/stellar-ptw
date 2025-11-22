import type { Person, Stats } from './ptw-types'

export function calculatePersonStats(persons: Person[]): Stats {
  return {
    total: persons.length,
    issuer: persons.filter((p) => p.role === 'issuer').length,
    supervisor: persons.filter((p) => p.role === 'supervisor').length,
    foreman: persons.filter((p) => p.role === 'foreman').length,
    worker: persons.filter((p) => p.role === 'worker').length,
  }
}

export function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function exportToCSV(persons: Person[], language: 'ru' | 'tr' | 'en'): void {
  const headers = {
    ru: ['Имя', 'Должность', 'Роль', 'Email', 'Телефон'],
    tr: ['İsim', 'Pozisyon', 'Rol', 'Email', 'Telefon'],
    en: ['Name', 'Position', 'Role', 'Email', 'Phone'],
  }

  const roleLabels = {
    ru: { issuer: 'Выдающий', supervisor: 'Руководитель', foreman: 'Производитель', worker: 'Исполнитель' },
    tr: { issuer: 'İzni Veren', supervisor: 'Yönetici', foreman: 'İş Yapan', worker: 'İşçi' },
    en: { issuer: 'Issuer', supervisor: 'Supervisor', foreman: 'Foreman', worker: 'Worker' },
  }

  const rows = persons.map((p) => [
    `"${p.name}"`,
    `"${p.position}"`,
    `"${roleLabels[language][p.role]}"`,
    `"${p.email || ''}"`,
    `"${p.phone || ''}"`,
  ])

  const csv = [headers[language].join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `stellar-ptw-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
