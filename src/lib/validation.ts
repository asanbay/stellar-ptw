import { z } from 'zod'
import type { Language, Role } from './ptw-types'

// Base schemas
export const languageSchema = z.enum(['ru', 'tr', 'en']) as z.ZodType<Language>

export const roleSchema = z.enum(['issuer', 'supervisor', 'foreman', 'worker']) as z.ZodType<Role>

export const translationSchema = z.object({
  ru: z.string(),
  tr: z.string(),
  en: z.string(),
})

// Department schemas
export const departmentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Название отдела обязательно'),
  color: z.string().regex(/^oklch\([\d\s.]+\)$/, 'Неверный формат цвета'),
  emoji: z.string().min(1, 'Эмодзи обязателен'),
  description: z.string().optional(),
})

export const departmentInsertSchema = departmentSchema.omit({ id: true })
export const departmentUpdateSchema = departmentSchema.partial().required({ id: true })

// Person schemas
export const personSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  position: z.string().min(2, 'Должность обязательна'),
  role: roleSchema,
  email: z.string().email('Неверный формат email').optional().or(z.literal('')),
  phone: z.string().regex(/^\+?\d{10,15}$/, 'Неверный формат телефона').optional().or(z.literal('')),
  departmentId: z.string().uuid().optional(),
  customDuties: z.array(z.string()).optional(),
  customQualifications: z.array(z.string()).optional(),
})

export const personInsertSchema = personSchema.omit({ id: true })
export const personUpdateSchema = personSchema.partial()

// FAQ schemas
export const faqSchema = z.object({
  id: z.string().uuid().optional(),
  question: translationSchema,
  answer: translationSchema,
  category: z.string().optional(),
  order: z.number().int().min(0),
})

export const faqInsertSchema = faqSchema.omit({ id: true })
export const faqUpdateSchema = faqSchema.partial()

// Permit schemas
export const permitStatusSchema = z.enum(['draft', 'active', 'completed', 'cancelled'])

export const permitSchema = z.object({
  id: z.string().uuid().optional(),
  permit_number: z.string().min(1, 'Номер наряда обязателен'),
  work_description: z.string().min(5, 'Описание работ обязательно'),
  location: z.string().min(1, 'Местоположение обязательно'),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  status: permitStatusSchema,
  responsible_person_id: z.string().uuid(),
  issuer_id: z.string().uuid().optional(),
  supervisor_id: z.string().uuid().optional(),
  foreman_id: z.string().uuid().optional(),
  safety_measures: z.array(z.string()).optional(),
  required_ppe: z.array(z.string()).optional(),
  hazards_identified: z.array(z.string()).optional(),
  work_type: z.string().optional(),
  special_conditions: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}).refine(
  (data) => new Date(data.end_date) > new Date(data.start_date),
  {
    message: 'Дата окончания должна быть позже даты начала',
    path: ['end_date'],
  }
)

const basePermitSchema = permitSchema.innerType()
export const permitInsertSchema = basePermitSchema.omit({ id: true, created_at: true, updated_at: true })
export const permitUpdateSchema = basePermitSchema.partial()

// Combined work schemas
export const combinedWorkSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().min(5, 'Описание обязательно'),
  location: z.string().min(1, 'Местоположение обязательно'),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  status: z.enum(['planning', 'in_progress', 'completed', 'cancelled']),
  coordinator_id: z.string().uuid(),
  permit_ids: z.array(z.string().uuid()),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}).refine(
  (data) => new Date(data.end_date) > new Date(data.start_date),
  {
    message: 'Дата окончания должна быть позже даты начала',
    path: ['end_date'],
  }
)

const baseCombinedWorkSchema = combinedWorkSchema.innerType()
export const combinedWorkInsertSchema = baseCombinedWorkSchema.omit({ id: true, created_at: true, updated_at: true })
export const combinedWorkUpdateSchema = baseCombinedWorkSchema.partial()

// CSV import validation
export const csvPersonSchema = z.object({
  name: z.string().min(1),
  position: z.string().min(1),
  role: roleSchema,
  email: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
})

// Helper types
export type DepartmentInput = z.infer<typeof departmentInsertSchema>
export type PersonInput = z.infer<typeof personInsertSchema>
export type FAQInput = z.infer<typeof faqInsertSchema>
export type PermitInput = z.infer<typeof permitInsertSchema>
export type CombinedWorkInput = z.infer<typeof combinedWorkInsertSchema>
export type CSVPersonInput = z.infer<typeof csvPersonSchema>

// Validation helpers
export function validateWithSchema<T>(schema: z.ZodType<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: z.ZodError
} {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

export function getValidationErrors(error: z.ZodError, language: Language = 'ru'): string[] {
  const messages: Record<Language, Record<string, string>> = {
    ru: {
      'String must contain at least': 'Должно содержать минимум',
      'Invalid email': 'Неверный формат email',
      'Expected': 'Ожидается',
      'Required': 'Обязательное поле',
    },
    tr: {
      'String must contain at least': 'En az içermelidir',
      'Invalid email': 'Geçersiz e-posta formatı',
      'Expected': 'Beklenen',
      'Required': 'Zorunlu alan',
    },
    en: {
      'String must contain at least': 'Must contain at least',
      'Invalid email': 'Invalid email format',
      'Expected': 'Expected',
      'Required': 'Required field',
    },
  }

  return error.errors.map((err) => {
    let message = err.message
    
    // Simple translation
    Object.entries(messages[language]).forEach(([key, value]) => {
      message = message.replace(key, value)
    })
    
    return `${err.path.join('.')}: ${message}`
  })
}
