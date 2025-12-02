/**
 * Production-safe logger utility
 * Automatically disabled in production builds
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private isDev = import.meta.env.DEV

  log(...args: unknown[]): void {
    if (this.isDev) {
      console.log(...args)
    }
  }

  info(...args: unknown[]): void {
    if (this.isDev) {
      console.info(...args)
    }
  }

  warn(...args: unknown[]): void {
    console.warn(...args)
  }

  error(...args: unknown[]): void {
    console.error(...args)
  }

  debug(...args: unknown[]): void {
    if (this.isDev) {
      console.debug(...args)
    }
  }

  group(label: string): void {
    if (this.isDev) {
      console.group(label)
    }
  }

  groupEnd(): void {
    if (this.isDev) {
      console.groupEnd()
    }
  }

  time(label: string): void {
    if (this.isDev) {
      console.time(label)
    }
  }

  timeEnd(label: string): void {
    if (this.isDev) {
      console.timeEnd(label)
    }
  }
}

export const logger = new Logger()
