import { useKV } from '@/hooks/use-kv'
import type { Language, Translation } from '@/lib/ptw-types'

export function useLanguage() {
  const [language, setLanguage] = useKV<Language>('ptw-language', 'ru')

  const t = (trans: Translation): string => {
    return trans[language || 'ru']
  }

  return { language: language || 'ru', setLanguage, t }
}
