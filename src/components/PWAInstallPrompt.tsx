import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, X } from '@phosphor-icons/react'
import { promptInstall, isAppInstalled } from '@/lib/pwa'
import type { Language } from '@/lib/ptw-types'

const translations = {
  ru: {
    title: 'Установить приложение',
    description: 'Установите Stellar PTW на ваше устройство для быстрого доступа',
    install: 'Установить',
    dismiss: 'Позже',
  },
  tr: {
    title: 'Uygulamayı Yükle',
    description: 'Hızlı erişim için Stellar PTW\'yi cihazınıza yükleyin',
    install: 'Yükle',
    dismiss: 'Sonra',
  },
  en: {
    title: 'Install App',
    description: 'Install Stellar PTW on your device for quick access',
    install: 'Install',
    dismiss: 'Later',
  },
}

interface PWAInstallPromptProps {
  language?: Language
}

export function PWAInstallPrompt({ language = 'en' }: PWAInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [installer, setInstaller] = useState<any>(null)
  const t = translations[language]

  useEffect(() => {
    // Don't show if already installed
    if (isAppInstalled()) {
      return
    }

    // Check if user has dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return
      }
    }

    const inst = promptInstall()
    setInstaller(inst)

    // Show prompt after 30 seconds
    const timer = setTimeout(() => {
      if (inst.canInstall()) {
        setShowPrompt(true)
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [])

  const handleInstall = async () => {
    if (installer) {
      const accepted = await installer.install()
      if (accepted) {
        setShowPrompt(false)
      }
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{t.title}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {t.description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1"
              onClick={handleDismiss}
            >
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={handleInstall} className="flex-1 gap-2">
            <Download size={16} />
            {t.install}
          </Button>
          <Button variant="outline" onClick={handleDismiss}>
            {t.dismiss}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
