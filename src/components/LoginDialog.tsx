import { useState } from 'react'
import { logger } from '@/lib/logger'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LockKey, SignIn } from '@phosphor-icons/react'
import type { Language } from '@/lib/ptw-types'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (role?: 'admin' | 'super_admin') => void
  language: Language
}

export function LoginDialog({ open, onOpenChange, onLogin, language }: LoginDialogProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const labels = {
    ru: {
      title: '🔐 Вход в систему',
      description: 'Введите пароль для доступа',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Введите пароль',
      login: 'Войти',
      cancel: 'Отмена',
      errorMessage: 'Неверный пароль',
      hint: 'Админ: 123 • Супер-Админ: superadmin',
    },
    tr: {
      title: '🔐 Sistem Girişi',
      description: 'Erişim için şifreyi girin',
      passwordLabel: 'Şifre',
      passwordPlaceholder: 'Şifreyi girin',
      login: 'Giriş Yap',
      cancel: 'İptal',
      errorMessage: 'Yanlış şifre',
      hint: 'Admin: 123 • Süper Admin: superadmin',
    },
    en: {
      title: '🔐 System Login',
      description: 'Enter password to access',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      login: 'Login',
      cancel: 'Cancel',
      errorMessage: 'Incorrect password',
      hint: 'Admin: 123 • Super Admin: superadmin',
    },
  }

  const l = labels[language]

  const normalizePassword = (value: string) => {
    const compact = value.trim().replace(/\s+/g, '')
    const lower = compact.toLowerCase()

    // Супер-админ пароли (разные раскладки клавиатуры)
    const superAdminPasswords = [
      'superadmin',      // EN
      'суперадмин',      // RU
      'сгзукфвьшт',      // RU раскладка для superadmin
      'admin123',        // EN
      'админ123',        // RU
      'фвьшт123',        // RU раскладка для admin123
      'super',           // Короткий вариант
      'супер',           // RU короткий
    ]

    if (superAdminPasswords.includes(lower)) {
      return 'superadmin'
    }

    return compact
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedPassword = normalizePassword(password)
    
    // Читаем пароли из переменных окружения (безопасно)
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '123'
    const superAdminPassword = import.meta.env.VITE_SUPER_ADMIN_PASSWORD || 'superadmin'
    
    console.log('🔐 Login attempt:', {
      raw: password,
      normalized: normalizedPassword,
      length: normalizedPassword.length,
    })

    if (normalizedPassword === adminPassword) {
      console.log('✅ Admin login successful')
      onLogin('admin')
      setPassword('')
      setError(false)
      onOpenChange(false)
    } else if (normalizedPassword === superAdminPassword) {
      console.log('✅ Super Admin login successful')
      onLogin('super_admin')
      setPassword('')
      setError(false)
      onOpenChange(false)
    } else {
      console.log('❌ Login failed - invalid password')
      setError(true)
    }
  }

  const handleCancel = () => {
    setPassword('')
    setError(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockKey className="h-5 w-5 text-accent" />
            {l.title}
          </DialogTitle>
          <DialogDescription>
            {l.description}
            <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 {l.hint}
            </div>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">{l.passwordLabel}</Label>
            <Input
              id="admin-password"
              type="password"
              placeholder={l.passwordPlaceholder}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              className={error ? 'border-destructive' : ''}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                ⚠️ {l.errorMessage}
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {l.cancel}
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <SignIn className="h-4 w-4 mr-1" />
              {l.login}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
