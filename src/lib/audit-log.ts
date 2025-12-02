import { supabase, isSupabaseAvailable } from './supabase'

export interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: 'create' | 'update' | 'delete' | 'export' | 'import' | 'login' | 'logout'
  entityType: 'personnel' | 'department' | 'ptw' | 'combined-work' | 'faq' | 'announcement'
  entityId: string
  entityName?: string
  changes?: Record<string, { old: any; new: any }>
  metadata?: Record<string, any>
}

class AuditLogger {
  private logs: AuditLogEntry[] = []
  private readonly MAX_LOCAL_LOGS = 1000

  constructor() {
    this.loadLocalLogs()
  }

  private loadLocalLogs() {
    try {
      const stored = localStorage.getItem('audit-logs')
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err)
    }
  }

  private saveLocalLogs() {
    try {
      // Keep only the most recent logs
      const recent = this.logs.slice(-this.MAX_LOCAL_LOGS)
      localStorage.setItem('audit-logs', JSON.stringify(recent))
      this.logs = recent
    } catch (err) {
      console.error('Failed to save audit logs:', err)
    }
  }

  async log(
    action: AuditLogEntry['action'],
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    options?: {
      userId?: string
      userName?: string
      entityName?: string
      changes?: AuditLogEntry['changes']
      metadata?: AuditLogEntry['metadata']
    }
  ) {
    const entry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: options?.userId || 'anonymous',
      userName: options?.userName || 'User',
      action,
      entityType,
      entityId,
      entityName: options?.entityName,
      changes: options?.changes,
      metadata: options?.metadata,
    }

    // Save locally
    this.logs.push(entry)
    this.saveLocalLogs()

    // Save to Supabase if available
    if (isSupabaseAvailable() && supabase) {
      try {
        await supabase
          .from('audit_logs')
          .insert<import('./database.types').Database['public']['Tables']['audit_logs']['Insert']>({
          user_id: entry.userId,
          user_name: entry.userName,
          action: entry.action,
          entity_type: entry.entityType,
          entity_id: entry.entityId,
          entity_name: entry.entityName,
          changes: entry.changes,
          metadata: entry.metadata,
          created_at: entry.timestamp,
          })
      } catch (err) {
        console.error('Failed to save audit log to Supabase:', err)
      }
    }

    return entry
  }

  async getLogs(options?: {
    entityType?: AuditLogEntry['entityType']
    entityId?: string
    userId?: string
    action?: AuditLogEntry['action']
    limit?: number
    offset?: number
  }): Promise<AuditLogEntry[]> {
    let logs = [...this.logs]

    // Apply filters
    if (options?.entityType) {
      logs = logs.filter((log) => log.entityType === options.entityType)
    }
    if (options?.entityId) {
      logs = logs.filter((log) => log.entityId === options.entityId)
    }
    if (options?.userId) {
      logs = logs.filter((log) => log.userId === options.userId)
    }
    if (options?.action) {
      logs = logs.filter((log) => log.action === options.action)
    }

    // Sort by timestamp descending (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply pagination
    const offset = options?.offset || 0
    const limit = options?.limit || 50
    return logs.slice(offset, offset + limit)
  }

  async getEntityHistory(entityType: AuditLogEntry['entityType'], entityId: string): Promise<AuditLogEntry[]> {
    return this.getLogs({ entityType, entityId })
  }

  async getUserActivity(userId: string, limit = 50): Promise<AuditLogEntry[]> {
    return this.getLogs({ userId, limit })
  }

  async exportLogs(): Promise<string> {
    return JSON.stringify(this.logs, null, 2)
  }

  async clearOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    this.logs = this.logs.filter(
      (log) => new Date(log.timestamp) > cutoffDate
    )
    this.saveLocalLogs()
  }
}

export const auditLogger = new AuditLogger()
