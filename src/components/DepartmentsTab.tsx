import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash, Users } from '@phosphor-icons/react'
import type { Department, Language, Person } from '@/lib/ptw-types'
import { DepartmentDialog } from '@/components/DepartmentDialog'

interface DepartmentsTabProps {
  departments: Department[]
  persons: Person[]
  language: Language
  isAdmin: boolean
  onAddDepartment: (dept: Partial<Department>) => void
  onEditDepartment: (id: string, dept: Partial<Department>) => void
  onDeleteDepartment: (id: string) => void
}

export function DepartmentsTab({
  departments,
  persons,
  language,
  isAdmin,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
}: DepartmentsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | undefined>()

  const handleAdd = () => {
    setEditingDepartment(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept)
    setDialogOpen(true)
  }

  const handleSave = (deptData: Partial<Department>) => {
    if (editingDepartment) {
      onEditDepartment(editingDepartment.id, deptData)
    } else {
      onAddDepartment(deptData)
    }
  }

  const handleDelete = (id: string) => {
    onDeleteDepartment(id)
  }

  const getDepartmentPersonCount = (deptId: string) => {
    return persons.filter((p) => p.departmentId === deptId).length
  }

  const labels = {
    ru: {
      title: 'Отделы и подразделения',
      description: 'Управление структурой организации',
      addButton: 'Добавить отдел',
      noDepartments: 'Отделы не созданы',
      noDepartmentsDesc: 'Создайте отделы для организации сотрудников',
      personnel: 'сотрудников',
      edit: 'Редактировать',
      delete: 'Удалить',
    },
    tr: {
      title: 'Departmanlar ve Bölümler',
      description: 'Organizasyon yapısını yönet',
      addButton: 'Departman Ekle',
      noDepartments: 'Departman yok',
      noDepartmentsDesc: 'Çalışanları organize etmek için departman oluşturun',
      personnel: 'çalışan',
      edit: 'Düzenle',
      delete: 'Sil',
    },
    en: {
      title: 'Departments and Divisions',
      description: 'Manage organizational structure',
      addButton: 'Add Department',
      noDepartments: 'No Departments',
      noDepartmentsDesc: 'Create departments to organize personnel',
      personnel: 'personnel',
      edit: 'Edit',
      delete: 'Delete',
    },
  }

  const l = labels[language]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{l.title}</h2>
          <p className="text-muted-foreground">{l.description}</p>
        </div>
        {isAdmin && (
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            {l.addButton}
          </Button>
        )}
      </div>

      {departments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold mb-2">{l.noDepartments}</h3>
            <p className="text-muted-foreground mb-4">{l.noDepartmentsDesc}</p>
            {isAdmin && (
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                {l.addButton}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} className="border-2 transition-all hover:shadow-md" style={{ borderColor: dept.color }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{dept.emoji}</div>
                    <div>
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Users className="h-4 w-4" />
                        {getDepartmentPersonCount(dept.id)} {l.personnel}
                      </CardDescription>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(dept)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              {dept.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{dept.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {isAdmin && (
        <DepartmentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSave}
          department={editingDepartment}
          language={language}
        />
      )}
    </div>
  )
}
