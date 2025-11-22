import type { Category, Priority } from './types'

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'work', label: 'Work', color: 'oklch(0.45 0.15 250)' },
  { value: 'personal', label: 'Personal', color: 'oklch(0.65 0.12 290)' },
  { value: 'health', label: 'Health', color: 'oklch(0.68 0.18 45)' },
  { value: 'learning', label: 'Learning', color: 'oklch(0.55 0.18 180)' },
  { value: 'other', label: 'Other', color: 'oklch(0.52 0.03 260)' },
]

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map(c => [c.value, c])
) as Record<Category, { value: Category; label: string; color: string }>
