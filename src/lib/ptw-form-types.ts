export type PTWType = 
  | 'hazardous-factors'
  | 'height'
  | 'hot-work'
  | 'confined-space'
  | 'earthwork'

export type PTWStatus = 
  | 'draft'
  | 'issued'
  | 'in-progress'
  | 'suspended'
  | 'completed'
  | 'closed'
  | 'cancelled'

export interface PTWForm {
  id: string
  number: string
  type: PTWType
  status: PTWStatus
  
  issuerPersonId: string
  supervisorPersonId: string
  foremanPersonId: string
  teamMemberIds: string[]
  
  workDescription: string
  workLocation: string
  workScope: string
  equipment: string[]
  
  hazards: string[]
  safetyMeasures: string[]
  
  startDate: string
  endDate: string
  validUntil: string
  
  issuedAt?: string
  startedAt?: string
  completedAt?: string
  closedAt?: string
  
  dailyAdmissions: DailyAdmission[]
  
  notes: string
  attachments?: string[]
  
  isCombinedWork: boolean
  combinedWorkJournalRef?: string
  
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface DailyAdmission {
  date: string
  time: string
  supervisorSignature: string
  foremanSignature: string
  teamPresent: string[]
  conditions: string
  approved: boolean
}

export interface CombinedWorkEntry {
  id: string
  date: string
  location: string
  ptwNumbers: string[]
  coordinatorPersonId: string
  organizations: string[]
  workTypes: string[]
  safetyMeasures: string[]
  notes: string
  createdAt: string
}

export const PTW_TYPE_LABELS = {
  'hazardous-factors': {
    ru: 'Работы в местах действия опасных факторов',
    tr: 'Tehlikeli Faktörlerin Bulunduğu Yerlerde Çalışma',
    en: 'Work in Hazardous Conditions',
    code: 'STE-PTW-10-01'
  },
  'height': {
    ru: 'Работы на высоте',
    tr: 'Yüksekte Çalışma',
    en: 'Work at Height',
    code: 'STE-PTW-10-02'
  },
  'hot-work': {
    ru: 'Огневые работы',
    tr: 'Ateşli İşler',
    en: 'Hot Work',
    code: 'STE-PTW-10-03'
  },
  'confined-space': {
    ru: 'Работы в ОЗП',
    tr: 'SKA İşleri',
    en: 'Confined Space Work',
    code: 'STE-PTW-10-04'
  },
  'earthwork': {
    ru: 'Земляные работы',
    tr: 'Toprak İşleri',
    en: 'Earthwork',
    code: 'STE-PTW-10-05'
  }
} as const

export const PTW_STATUS_LABELS = {
  'draft': {
    ru: 'Черновик',
    tr: 'Taslak',
    en: 'Draft'
  },
  'issued': {
    ru: 'Выдан',
    tr: 'Verildi',
    en: 'Issued'
  },
  'in-progress': {
    ru: 'В работе',
    tr: 'Devam Ediyor',
    en: 'In Progress'
  },
  'suspended': {
    ru: 'Приостановлен',
    tr: 'Askıya Alındı',
    en: 'Suspended'
  },
  'completed': {
    ru: 'Завершен',
    tr: 'Tamamlandı',
    en: 'Completed'
  },
  'closed': {
    ru: 'Закрыт',
    tr: 'Kapatıldı',
    en: 'Closed'
  },
  'cancelled': {
    ru: 'Отменен',
    tr: 'İptal Edildi',
    en: 'Cancelled'
  }
} as const
