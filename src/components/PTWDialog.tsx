import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Check, Plus, Trash } from '@phosphor-icons/react'
import type { Language, Person } from '@/lib/ptw-types'
import type { PTWForm, PTWType } from '@/lib/ptw-form-types'
import { PTW_TYPE_LABELS } from '@/lib/ptw-form-types'

interface PTWDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (ptw: Partial<PTWForm>) => void
  ptw?: PTWForm
  persons: Person[]
  language: Language
}

export function PTWDialog({ open, onOpenChange, onSave, ptw, persons, language }: PTWDialogProps) {
  const [type, setType] = useState<PTWType>(ptw?.type || 'hazardous-factors')
  const [workDescription, setWorkDescription] = useState(ptw?.workDescription || '')
  const [workLocation, setWorkLocation] = useState(ptw?.workLocation || '')
  const [workScope, setWorkScope] = useState(ptw?.workScope || '')
  const [issuerPersonId, setIssuerPersonId] = useState(ptw?.issuerPersonId || '')
  const [supervisorPersonId, setSupervisorPersonId] = useState(ptw?.supervisorPersonId || '')
  const [foremanPersonId, setForemanPersonId] = useState(ptw?.foremanPersonId || '')
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>(ptw?.teamMemberIds || [])
  const [equipment, setEquipment] = useState<string[]>(ptw?.equipment || [])
  const [hazards, setHazards] = useState<string[]>(ptw?.hazards || [])
  const [safetyMeasures, setSafetyMeasures] = useState<string[]>(ptw?.safetyMeasures || [])
  const [startDate, setStartDate] = useState(ptw?.startDate || '')
  const [endDate, setEndDate] = useState(ptw?.endDate || '')
  const [isCombinedWork, setIsCombinedWork] = useState(ptw?.isCombinedWork || false)

  const labels = {
    ru: {
      title: ptw ? 'Редактировать наряд-допуск' : 'Создать наряд-допуск',
      type: 'Тип работ',
      workDesc: 'Описание работ',
      workDescPlaceholder: 'Кратко опишите выполняемые работы...',
      location: 'Место производства работ',
      locationPlaceholder: 'Укажите место работ (зона, установка, оси, отметки)',
      scope: 'Объем работ',
      scopePlaceholder: 'Объем работ',
      issuer: 'Выдающий НД',
      supervisor: 'Ответственный руководитель',
      foreman: 'Производитель работ',
      team: 'Состав бригады',
      selectPerson: 'Выберите...',
      equipment: 'Оборудование и механизмы',
      addEquipment: 'Добавить оборудование',
      hazards: 'Опасные факторы',
      addHazard: 'Добавить фактор',
      safety: 'Меры безопасности',
      addMeasure: 'Добавить меру',
      startDate: 'Начало работ',
      endDate: 'Окончание работ',
      combinedWork: 'Совмещенные работы',
      save: 'Сохранить',
      cancel: 'Отмена',
      required: 'Обязательное поле',
    },
    tr: {
      title: ptw ? 'İş İzni Düzenle' : 'İş İzni Oluştur',
      type: 'İş Türü',
      workDesc: 'İş Açıklaması',
      workDescPlaceholder: 'Yapılacak işleri kısaca açıklayın...',
      location: 'İş Yeri',
      locationPlaceholder: 'İş yerini belirtin (bölge, kurulum, eksenler, işaretler)',
      scope: 'İş Kapsamı',
      scopePlaceholder: 'İş kapsamı',
      issuer: 'İzni Veren',
      supervisor: 'Sorumlu Yönetici',
      foreman: 'İş Yapan',
      team: 'Ekip Üyeleri',
      selectPerson: 'Seçin...',
      equipment: 'Ekipman ve Makineler',
      addEquipment: 'Ekipman Ekle',
      hazards: 'Tehlikeli Faktörler',
      addHazard: 'Faktör Ekle',
      safety: 'Güvenlik Önlemleri',
      addMeasure: 'Önlem Ekle',
      startDate: 'Başlangıç',
      endDate: 'Bitiş',
      combinedWork: 'Birleştirilmiş İşler',
      save: 'Kaydet',
      cancel: 'İptal',
      required: 'Zorunlu alan',
    },
    en: {
      title: ptw ? 'Edit Permit to Work' : 'Create Permit to Work',
      type: 'Work Type',
      workDesc: 'Work Description',
      workDescPlaceholder: 'Briefly describe the work to be performed...',
      location: 'Work Location',
      locationPlaceholder: 'Specify work location (zone, installation, axes, marks)',
      scope: 'Scope of Work',
      scopePlaceholder: 'Scope of work',
      issuer: 'PTW Issuer',
      supervisor: 'Responsible Supervisor',
      foreman: 'Work Performer',
      team: 'Team Members',
      selectPerson: 'Select...',
      equipment: 'Equipment and Machinery',
      addEquipment: 'Add Equipment',
      hazards: 'Hazards',
      addHazard: 'Add Hazard',
      safety: 'Safety Measures',
      addMeasure: 'Add Measure',
      startDate: 'Start Date',
      endDate: 'End Date',
      combinedWork: 'Combined Works',
      save: 'Save',
      cancel: 'Cancel',
      required: 'Required field',
    },
  }

  const l = labels[language]

  const issuers = persons.filter((p) => p.role === 'issuer')
  const supervisors = persons.filter((p) => p.role === 'supervisor')
  const foremen = persons.filter((p) => p.role === 'foreman')
  const workers = persons.filter((p) => p.role === 'worker' || p.role === 'foreman')

  const handleSave = () => {
    const ptwData: Partial<PTWForm> = {
      type,
      workDescription,
      workLocation,
      workScope,
      issuerPersonId,
      supervisorPersonId,
      foremanPersonId,
      teamMemberIds,
      equipment,
      hazards,
      safetyMeasures,
      startDate,
      endDate,
      isCombinedWork,
      status: 'draft',
      dailyAdmissions: [],
      notes: '',
    }
    onSave(ptwData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{l.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="type">{l.type} *</Label>
              <Select value={type} onValueChange={(val) => setType(val as PTWType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PTW_TYPE_LABELS) as PTWType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {PTW_TYPE_LABELS[t][language]} ({PTW_TYPE_LABELS[t].code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="workDescription">{l.workDesc} *</Label>
              <Textarea
                id="workDescription"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder={l.workDescPlaceholder}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="workLocation">{l.location} *</Label>
              <Input
                id="workLocation"
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                placeholder={l.locationPlaceholder}
              />
            </div>

            <div>
              <Label htmlFor="workScope">{l.scope}</Label>
              <Textarea
                id="workScope"
                value={workScope}
                onChange={(e) => setWorkScope(e.target.value)}
                placeholder={l.scopePlaceholder}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="issuer">{l.issuer} *</Label>
                <Select value={issuerPersonId} onValueChange={setIssuerPersonId}>
                  <SelectTrigger id="issuer">
                    <SelectValue placeholder={l.selectPerson} />
                  </SelectTrigger>
                  <SelectContent>
                    {issuers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="supervisor">{l.supervisor} *</Label>
                <Select value={supervisorPersonId} onValueChange={setSupervisorPersonId}>
                  <SelectTrigger id="supervisor">
                    <SelectValue placeholder={l.selectPerson} />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="foreman">{l.foreman} *</Label>
                <Select value={foremanPersonId} onValueChange={setForemanPersonId}>
                  <SelectTrigger id="foreman">
                    <SelectValue placeholder={l.selectPerson} />
                  </SelectTrigger>
                  <SelectContent>
                    {foremen.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">{l.startDate} *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="endDate">{l.endDate} *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="combinedWork"
                checked={isCombinedWork}
                onCheckedChange={(checked) => setIsCombinedWork(checked as boolean)}
              />
              <Label htmlFor="combinedWork" className="cursor-pointer">
                {l.combinedWork}
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1" />
            {l.cancel}
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !type ||
              !workDescription ||
              !workLocation ||
              !issuerPersonId ||
              !supervisorPersonId ||
              !foremanPersonId ||
              !startDate ||
              !endDate
            }
          >
            <Check className="h-4 w-4 mr-1" />
            {l.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
