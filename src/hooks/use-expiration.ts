import { useState, useEffect } from 'react'
import { differenceInDays, parseISO, format } from 'date-fns'
import { toast } from 'sonner'
import type { Language } from '@/lib/ptw-types'

export interface PTWWithDates {
  id: string
  ptwNumber: string
  workType: string
  startDate: string
  endDate: string
  status: string
  issuerName?: string
  supervisorName?: string
}

interface ExpirationNotification {
  ptwId: string
  ptwNumber: string
  daysRemaining: number
  expirationDate: string
  workType: string
}

const translations = {
  ru: {
    expiringSoon: 'PTW истекает скоро',
    expiringToday: 'PTW истекает сегодня!',
    expired: 'PTW просрочен!',
    daysRemaining: (days: number) => `Осталось ${days} дней`,
    ptwNumber: 'Наряд-допуск',
    checkExpiring: 'Проверить истекающие PTW',
    noExpiring: 'Нет истекающих PTW',
  },
  tr: {
    expiringSoon: 'PTW yakında sona eriyor',
    expiringToday: 'PTW bugün sona eriyor!',
    expired: 'PTW süresi doldu!',
    daysRemaining: (days: number) => `${days} gün kaldı`,
    ptwNumber: 'İzin Belgesi',
    checkExpiring: 'Süresi dolan PTW\'leri kontrol et',
    noExpiring: 'Süresi dolan PTW yok',
  },
  en: {
    expiringSoon: 'PTW expiring soon',
    expiringToday: 'PTW expires today!',
    expired: 'PTW expired!',
    daysRemaining: (days: number) => `${days} days remaining`,
    ptwNumber: 'Permit to Work',
    checkExpiring: 'Check expiring PTWs',
    noExpiring: 'No expiring PTWs',
  },
}

export function useExpirationNotifications(
  ptws: PTWWithDates[],
  language: Language = 'en',
  thresholdDays = 2
) {
  const [notifications, setNotifications] = useState<ExpirationNotification[]>([])
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const t = translations[language]

  useEffect(() => {
    checkExpirations()
    
    // Check every hour
    const interval = setInterval(checkExpirations, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [ptws, language, thresholdDays])

  const checkExpirations = () => {
    const now = new Date()
    const expiring: ExpirationNotification[] = []

    ptws.forEach((ptw) => {
      // Only check active PTWs
      if (ptw.status === 'closed' || ptw.status === 'draft') return

      const endDate = parseISO(ptw.endDate)
      const daysRemaining = differenceInDays(endDate, now)

      // PTW expired
      if (daysRemaining < 0) {
        expiring.push({
          ptwId: ptw.id,
          ptwNumber: ptw.ptwNumber,
          daysRemaining: 0,
          expirationDate: ptw.endDate,
          workType: ptw.workType,
        })

        // Show toast for expired PTW
        toast.error(`${t.expired} ${ptw.ptwNumber}`, {
          description: `${ptw.workType} - ${format(endDate, 'dd MMM yyyy')}`,
          duration: 10000,
        })
      }
      // PTW expires today
      else if (daysRemaining === 0) {
        expiring.push({
          ptwId: ptw.id,
          ptwNumber: ptw.ptwNumber,
          daysRemaining,
          expirationDate: ptw.endDate,
          workType: ptw.workType,
        })

        toast.warning(`${t.expiringToday} ${ptw.ptwNumber}`, {
          description: `${ptw.workType}`,
          duration: 8000,
        })
      }
      // PTW expires within threshold
      else if (daysRemaining <= thresholdDays && daysRemaining > 0) {
        expiring.push({
          ptwId: ptw.id,
          ptwNumber: ptw.ptwNumber,
          daysRemaining,
          expirationDate: ptw.endDate,
          workType: ptw.workType,
        })

        // Only show toast once per day
        const shouldNotify = !lastCheck || differenceInDays(now, lastCheck) >= 1

        if (shouldNotify) {
          toast.info(`${t.expiringSoon}: ${ptw.ptwNumber}`, {
            description: `${ptw.workType} - ${t.daysRemaining(daysRemaining)}`,
            duration: 6000,
          })
        }
      }
    })

    setNotifications(expiring)
    setLastCheck(now)
  }

  return {
    notifications,
    hasExpiringPTWs: notifications.length > 0,
    checkExpirations,
  }
}

export function getExpirationStatus(endDate: string): {
  status: 'expired' | 'expiring-today' | 'expiring-soon' | 'active'
  daysRemaining: number
  color: string
} {
  const now = new Date()
  const end = parseISO(endDate)
  const daysRemaining = differenceInDays(end, now)

  if (daysRemaining < 0) {
    return { status: 'expired', daysRemaining: 0, color: 'red' }
  } else if (daysRemaining === 0) {
    return { status: 'expiring-today', daysRemaining, color: 'orange' }
  } else if (daysRemaining <= 2) {
    return { status: 'expiring-soon', daysRemaining, color: 'yellow' }
  }
  
  return { status: 'active', daysRemaining, color: 'green' }
}
