import { useEffect, useRef } from 'react'

interface UseKeyboardShortcutsOptions {
  onNewPTW?: () => void
  onNewPerson?: () => void
  onSearch?: () => void
  onSave?: () => void
  onClose?: () => void
  onExport?: () => void
  onToggleTheme?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
  const {
    onNewPTW,
    onNewPerson,
    onSearch,
    onSave,
    onClose,
    onExport,
    onToggleTheme,
    enabled = true,
  } = options

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape to blur inputs
        if (event.key === 'Escape') {
          target.blur()
        }
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? event.metaKey : event.ctrlKey

      // Ctrl/Cmd + N - New PTW
      if (modifier && event.key === 'n' && onNewPTW) {
        event.preventDefault()
        onNewPTW()
      }

      // Ctrl/Cmd + P - New Person
      if (modifier && event.key === 'p' && onNewPerson) {
        event.preventDefault()
        onNewPerson()
      }

      // Ctrl/Cmd + F - Focus Search
      if (modifier && event.key === 'f' && onSearch) {
        event.preventDefault()
        onSearch()
      }

      // Ctrl/Cmd + S - Save
      if (modifier && event.key === 's' && onSave) {
        event.preventDefault()
        onSave()
      }

      // Ctrl/Cmd + E - Export
      if (modifier && event.key === 'e' && onExport) {
        event.preventDefault()
        onExport()
      }

      // Ctrl/Cmd + K - Toggle Theme
      if (modifier && event.key === 'k' && onToggleTheme) {
        event.preventDefault()
        onToggleTheme()
      }

      // Escape - Close dialog/modal
      if (event.key === 'Escape' && onClose) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onNewPTW, onNewPerson, onSearch, onSave, onClose, onExport, onToggleTheme])
}

export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
  enabled = true
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!enabled) return

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [callback, enabled])

  return ref
}

export function useAutoFocus<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (enabled && ref.current) {
      // Small delay to ensure element is rendered
      setTimeout(() => ref.current?.focus(), 50)
    }
  }, [enabled])

  return ref
}
