import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LockKey, SignIn } from '@phosphor-icons/react'
import type { Language } from '@/lib/ptw-types'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (password: string) => void
  language: Language
}

export function LoginDialog({ open, onOpenChange, onLogin, language }: LoginDialogProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const labels = {
    ru: {
      title: '🔐 Вход для администратора',
      description: 'Введите пароль для доступа к функциям администратора',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Введите пароль',
      login: 'Войти',
      cancel: 'Отмена',
      errorMessage: 'Неверный пароль',
    },
    tr: {
      title: '🔐 Yönetici Girişi',
      description: 'Yönetici işlevlerine erişmek için şifreyi girin',
      passwordLabel: 'Şifre',
      passwordPlaceholder: 'Şifreyi girin',
      login: 'Giriş Yap',
      cancel: 'İptal',
      errorMessage: 'Yanlış şifre',
    },
    en: {
      title: '🔐 Administrator Login',
      description: 'Enter password to access administrator functions',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      login: 'Login',
      cancel: 'Cancel',
      errorMessage: 'Incorrect password',
    },
  }

  const l = labels[language]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === '123') {
      onLogin(password)
      setPassword('')
      setError(false)
      onOpenChange(false)
    } else {
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
          <DialogDescription>{l.description}</DialogDescription>
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
