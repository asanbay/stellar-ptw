import type { Translation } from './ptw-types'

export interface WorkflowStep {
  phase: Translation
  actor: Translation
  action: Translation
  icon: string
}

export const PTW_WORKFLOW: WorkflowStep[] = [
  {
    phase: {
      ru: 'До начала работ',
      tr: 'İşlerden önce',
      en: 'Before work starts',
    },
    actor: {
      ru: 'Инициатор НД / Производитель работ',
      tr: 'İİ başlatıcısı / İş yapan',
      en: 'PTW initiator / Work performer',
    },
    action: {
      ru: 'Заполняет НД, согласовывает с выдающим НД',
      tr: 'İİ doldurur, İİ veren ile onaylar',
      en: 'Fills PTW, coordinates with PTW issuer',
    },
    icon: '📝',
  },
  {
    phase: {
      ru: 'До начала работ',
      tr: 'İşlerden önce',
      en: 'Before work starts',
    },
    actor: {
      ru: 'Выдающий НД',
      tr: 'İİ veren',
      en: 'PTW issuer',
    },
    action: {
      ru: 'Подписывает НД, возвращает производителю работ',
      tr: 'İİ imzalar, iş yapana geri verir',
      en: 'Signs PTW, returns to work performer',
    },
    icon: '✍️',
  },
  {
    phase: {
      ru: 'До начала работ',
      tr: 'İşlerden önce',
      en: 'Before work starts',
    },
    actor: {
      ru: 'Производитель работ',
      tr: 'İş yapan',
      en: 'Work performer',
    },
    action: {
      ru: 'Отдает НД в отдел ОТ для проверки и регистрации',
      tr: 'İİ yi İSG bölümüne kayıt ve kontrol için verir',
      en: 'Submits PTW to HSE department for verification and registration',
    },
    icon: '📋',
  },
  {
    phase: {
      ru: 'До начала работ',
      tr: 'İşlerden önce',
      en: 'Before work starts',
    },
    actor: {
      ru: 'Производитель работ',
      tr: 'İş yapan',
      en: 'Work performer',
    },
    action: {
      ru: 'Проводит целевой инструктаж, расписывает работников в НД',
      tr: 'Hedefli talimat verir, İİ de çalışanları imzalatır',
      en: 'Conducts targeted briefing, signs workers in PTW',
    },
    icon: '👥',
  },
  {
    phase: {
      ru: 'Ежедневно',
      tr: 'Her gün',
      en: 'Daily',
    },
    actor: {
      ru: 'Руководитель работ',
      tr: 'İş yöneticisi',
      en: 'Work supervisor',
    },
    action: {
      ru: 'Проверяет подготовку рабочего места, делает отметку в НД о допуске/разрешении на производство работ',
      tr: 'İş yerinin hazırlığını kontrol eder, İİ de kabul/izin notu yapar',
      en: 'Checks workplace preparation, marks admission/permission for work in PTW',
    },
    icon: '✅',
  },
  {
    phase: {
      ru: 'Ежедневно',
      tr: 'Her gün',
      en: 'Daily',
    },
    actor: {
      ru: 'Производитель или исполнитель работ',
      tr: 'İş yapan veya işi yapan',
      en: 'Work performer or executor',
    },
    action: {
      ru: 'Подписывает ежедневный допуск о получении разрешения на выполнение работ',
      tr: 'İşlerin yürütülmesi için izin alındığına dair günlük kabul imzalar',
      en: 'Signs daily admission for permission to perform work',
    },
    icon: '🖊️',
  },
  {
    phase: {
      ru: 'Ежедневно',
      tr: 'Her gün',
      en: 'Daily',
    },
    actor: {
      ru: 'Бригада',
      tr: 'Ekip',
      en: 'Team',
    },
    action: {
      ru: 'Приступает к выполнению работ, НД находится на рабочем месте у производителя работ или исполнителя работ',
      tr: 'İşlere başlar, İİ iş yerinde iş yapan veya işi yapanda bulunur',
      en: 'Starts work, PTW is kept at workplace by work performer or executor',
    },
    icon: '🔧',
  },
  {
    phase: {
      ru: 'По завершению работ',
      tr: 'İşler bittiğinde',
      en: 'Upon work completion',
    },
    actor: {
      ru: 'Производитель работ',
      tr: 'İş yapan',
      en: 'Work performer',
    },
    action: {
      ru: 'Подписывает у выдающего НД закрытие НД, сдает в отдел ОТ',
      tr: 'İİ verende İİ kapatmayı imzalar, İSG bölümüne teslim eder',
      en: 'Signs PTW closure with issuer, submits to HSE department',
    },
    icon: '📥',
  },
  {
    phase: {
      ru: 'По завершению работ',
      tr: 'İşler bittiğinde',
      en: 'Upon work completion',
    },
    actor: {
      ru: 'Отдел ОТ',
      tr: 'İSG bölümü',
      en: 'HSE department',
    },
    action: {
      ru: 'Отмечает в журнале сдачу закрытого НД, хранит в течении 30 дней',
      tr: 'Defterde kapalı İİ teslimini işaretler, 30 gün saklar',
      en: 'Marks closed PTW submission in journal, stores for 30 days',
    },
    icon: '📚',
  },
]

export const WORKFLOW_PHASES = {
  beforeWork: {
    ru: 'До начала работ',
    tr: 'İşlerden önce',
    en: 'Before work starts',
  },
  daily: {
    ru: 'Ежедневно',
    tr: 'Her gün',
    en: 'Daily',
  },
  completion: {
    ru: 'По завершению работ',
    tr: 'İşler bittiğinde',
    en: 'Upon work completion',
  },
}
