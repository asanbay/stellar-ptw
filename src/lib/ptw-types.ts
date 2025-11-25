export type Language = 'ru' | 'tr' | 'en'

export type Role = 'issuer' | 'supervisor' | 'foreman' | 'worker'

export interface Department {
  id: string
  name: string
  color: string
  emoji: string
  description?: string
}

export interface Person {
  id: string
  name: string
  position: string
  role: Role
  email?: string
  phone?: string
  departmentId?: string
  customDuties?: string[]
  customQualifications?: string[]
}

export interface Translation {
  ru: string
  tr: string
  en: string
}

export interface DutyTranslation {
  ru: string[]
  tr: string[]
  en: string[]
}

export interface RuleItem {
  icon: string
  title: Translation
  value: Translation
  description: Translation
}

export interface TimelineItem {
  time: Translation
  content: Translation
}

export interface DocumentItem {
  code: string
  name: Translation
}

export interface Stats {
  total: number
  issuer: number
  supervisor: number
  foreman: number
  worker: number
}

export interface FAQItem {
  id: string
  question: Translation
  answer: Translation
  category?: string
  order: number
}
