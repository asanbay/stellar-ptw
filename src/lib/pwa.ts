export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        
        console.log('ServiceWorker registered:', registration)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload()
                }
              }
            })
          }
        })
      } catch (error) {
        console.error('ServiceWorker registration failed:', error)
      }
    })
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister()
    })
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// Show notification
export async function showNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) {
    return
  }

  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      })
    } else {
      new Notification(title, options)
    }
  }
}

// Check if app is installed
export function isAppInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

// Prompt to install
export function promptInstall() {
  let deferredPrompt: any = null

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
  })

  return {
    canInstall: () => deferredPrompt !== null,
    install: async () => {
      if (!deferredPrompt) {
        return false
      }

      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      deferredPrompt = null
      return outcome === 'accepted'
    },
  }
}
