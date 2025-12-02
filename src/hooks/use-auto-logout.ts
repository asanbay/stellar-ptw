import { useState, useEffect } from 'react'
import type { UserMode } from '@/lib/ptw-types'

const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes in milliseconds

export function useAutoLogout(
  userMode: UserMode,
  onLogout: () => void,
  enabled = true
) {
  const [lastActivity, setLastActivity] = useState(Date.now())

  useEffect(() => {
    if (!enabled || userMode === 'user') return

    const updateActivity = () => {
      setLastActivity(Date.now())
    }

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach((event) => {
      window.addEventListener(event, updateActivity)
    })

    // Check for inactivity every minute
    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        onLogout()
      }
    }, 60 * 1000) // Check every minute

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity)
      })
      clearInterval(interval)
    }
  }, [userMode, enabled, lastActivity, onLogout])

  return {
    lastActivity,
    timeRemaining: Math.max(0, INACTIVITY_TIMEOUT - (Date.now() - lastActivity)),
  }
}
