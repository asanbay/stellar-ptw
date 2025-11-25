import { useState, useMemo } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Person, Role, Language, Department } from '@/lib/ptw-types'
import { ROLE_COLORS, ROLE_LABELS } from '@/lib/ptw-constants'
import { getInitials } from '@/lib/ptw-utils'

interface PersonnelSidebarProps {
  persons: Person[]
  departments: Department[]
  selectedId: string | null
  onSelectPerson: (id: string) => void
  language: Language
}

type FilterRole = Role | 'all'

export function PersonnelSidebar({ persons, departments, selectedId, onSelectPerson, language }: PersonnelSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterRole>('all')
  const [groupByDepartment, setGroupByDepartment] = useState(true)

  const filterLabels = {
    ru: { all: 'Все', issuer: 'Выдающие', supervisor: 'Руководители', foreman: 'Производители', worker: 'Исполнители' },
    tr: { all: 'Tümü', issuer: 'Verenler', supervisor: 'Yöneticiler', foreman: 'Yapanlar', worker: 'İşçiler' },
    en: { all: 'All', issuer: 'Issuers', supervisor: 'Supervisors', foreman: 'Foremen', worker: 'Workers' },
  }

  const filteredPersons = useMemo(() => {
    return persons.filter((person) => {
      const matchesSearch =
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) || person.position.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filter === 'all' || person.role === filter
      return matchesSearch && matchesFilter
    })
  }, [persons, searchQuery, filter])

  const groupedPersons = useMemo(() => {
    if (!groupByDepartment || departments.length === 0) {
      return [{ department: null, persons: filteredPersons }]
    }

    const groups: { department: Department | null; persons: Person[] }[] = []
    
    departments.forEach((dept) => {
      const deptPersons = filteredPersons.filter((p) => p.departmentId === dept.id)
      if (deptPersons.length > 0) {
        groups.push({ department: dept, persons: deptPersons })
      }
    })

    const noDeptPersons = filteredPersons.filter((p) => !p.departmentId)
    if (noDeptPersons.length > 0) {
      groups.push({ department: null, persons: noDeptPersons })
    }

    return groups
  }, [filteredPersons, departments, groupByDepartment])

  return (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-base mb-3">👥 {language === 'ru' ? 'Персонал' : language === 'tr' ? 'Personel' : 'Personnel'}</h2>
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'ru' ? 'Поиск...' : language === 'tr' ? 'Ara...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 p-2 border-b">
        {(['all', 'issuer', 'supervisor', 'foreman', 'worker'] as FilterRole[]).map((roleFilter) => (
          <Button
            key={roleFilter}
            variant={filter === roleFilter ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(roleFilter)}
            className={cn('text-xs h-8 flex-1 min-w-[60px]', filter === roleFilter && 'bg-primary text-primary-foreground')}
          >
            {filterLabels[language][roleFilter]}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-3">
          {departments.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGroupByDepartment(!groupByDepartment)}
              className="w-full text-xs"
            >
              {groupByDepartment ? '📂' : '📄'}{' '}
              {groupByDepartment
                ? language === 'ru'
                  ? 'По отделам'
                  : language === 'tr'
                  ? 'Departmanlara Göre'
                  : 'By Department'
                : language === 'ru'
                ? 'Все вместе'
                : language === 'tr'
                ? 'Hepsi Birlikte'
                : 'All Together'}
            </Button>
          )}
          
          {groupedPersons.map((group, groupIndex) => (
            <div key={group.department?.id || 'no-dept'}>
              {group.department && (
                <div
                  className="flex items-center gap-2 px-2 py-1.5 mb-2 rounded-md font-semibold text-xs"
                  style={{ backgroundColor: `color-mix(in oklch, ${group.department.color} 15%, transparent)` }}
                >
                  <span className="text-base">{group.department.emoji}</span>
                  <span style={{ color: group.department.color }}>{group.department.name}</span>
                  <span className="ml-auto text-muted-foreground">({group.persons.length})</span>
                </div>
              )}
              {!group.department && groupByDepartment && (
                <div className="flex items-center gap-2 px-2 py-1.5 mb-2 rounded-md font-semibold text-xs bg-muted/50">
                  <span className="text-base">📋</span>
                  <span className="text-muted-foreground">
                    {language === 'ru' ? 'Без отдела' : language === 'tr' ? 'Departmansız' : 'No Department'}
                  </span>
                  <span className="ml-auto text-muted-foreground">({group.persons.length})</span>
                </div>
              )}
              <div className="space-y-1">
                {group.persons.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => onSelectPerson(person.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                      selectedId === person.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted',
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${ROLE_COLORS[person.role]}, color-mix(in oklch, ${ROLE_COLORS[person.role]} 80%, black))` }}
                    >
                      {getInitials(person.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{person.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{ROLE_LABELS[person.role][language]}</div>
                    </div>
                  </button>
                ))}
              </div>
              {groupIndex < groupedPersons.length - 1 && groupByDepartment && (
                <Separator className="my-3" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
