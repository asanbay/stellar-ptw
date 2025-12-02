import { isSupabaseAvailable, supabase } from './supabase'

type Lock = {
  resourceType: string
  resourceId: string
  ownerId: string
  ownerName?: string
  createdAt: string
  updatedAt: string
  expiresAt: string
}

const LS_KEY = 'ptw-edit-locks'
const DEFAULT_TTL_MS = 5 * 60 * 1000

const nowISO = () => new Date().toISOString()

function loadMap(): Record<string, Lock> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveMap(map: Record<string, Lock>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(map))
  } catch {}
}

function key(resourceType: string, resourceId: string) {
  return `${resourceType}:${resourceId}`
}

function purgeExpired(map: Record<string, Lock>) {
  const now = Date.now()
  for (const k of Object.keys(map)) {
    const exp = Date.parse(map[k].expiresAt)
    if (!exp || exp <= now) delete map[k]
  }
}

export const editLocks = {
  async acquire(resourceType: string, resourceId: string, ownerId: string, ownerName?: string, ttlMs = DEFAULT_TTL_MS): Promise<{ ok: boolean; lock?: Lock; owned?: boolean }>
  {
    const now = Date.now()
    const expiresAt = new Date(now + ttlMs).toISOString()
    if (isSupabaseAvailable() && supabase) {
      // Очистим протухшие блокировки по этому ресурсу
      await supabase
        .from('edit_locks')
        .delete()
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .lte('expires_at', new Date(now).toISOString())

      // Пытаемся вставить новую блокировку
      const { data, error } = await supabase
        .from('edit_locks')
        .insert([{ resource_type: resourceType, resource_id: resourceId, owner_id: ownerId, owner_name: ownerName ?? null, expires_at: expiresAt }])
        .select()
        .single()

      if (error) {
        // Конфликт уникальности означает: занято
        return { ok: false }
      }

      const lock: Lock = {
        resourceType,
        resourceId,
        ownerId,
        ownerName: data?.owner_name ?? undefined,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        expiresAt: data?.expires_at,
      }
      return { ok: true, lock, owned: true }
    }

    // Local fallback
    const map = loadMap()
    purgeExpired(map)
    const k = key(resourceType, resourceId)
    const existing = map[k]
    const lock: Lock = existing ?? {
      resourceType,
      resourceId,
      ownerId,
      ownerName,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      expiresAt,
    }

    if (existing) {
      if (existing.ownerId !== ownerId && Date.parse(existing.expiresAt) > now) {
        return { ok: false }
      }
    }

    lock.updatedAt = nowISO()
    lock.expiresAt = expiresAt
    map[k] = lock
    saveMap(map)
    return { ok: true, lock, owned: existing?.ownerId === ownerId }
  },

  async release(resourceType: string, resourceId: string, ownerId: string): Promise<void> {
    if (isSupabaseAvailable() && supabase) {
      await supabase
        .from('edit_locks')
        .delete()
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .eq('owner_id', ownerId)
      return
    }

    const map = loadMap()
    const k = key(resourceType, resourceId)
    if (map[k]?.ownerId === ownerId) {
      delete map[k]
      saveMap(map)
    }
  },

  async get(resourceType: string, resourceId: string): Promise<Lock | null> {
    if (isSupabaseAvailable() && supabase) {
      const { data } = await supabase
        .from('edit_locks')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .single()
      if (!data) return null
      if (Date.parse(data.expires_at) <= Date.now()) {
        // автоочистка
        await supabase
          .from('edit_locks')
          .delete()
          .eq('id', data.id)
        return null
      }
      return {
        resourceType: data.resource_type,
        resourceId: data.resource_id,
        ownerId: data.owner_id,
        ownerName: data.owner_name ?? undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        expiresAt: data.expires_at,
      }
    }

    const map = loadMap()
    purgeExpired(map)
    return map[key(resourceType, resourceId)] ?? null
  }
}

// Renew lock TTL
export async function renew(resourceType: string, resourceId: string, ownerId: string, ttlMs = DEFAULT_TTL_MS): Promise<void> {
  const now = Date.now()
  const expiresAt = new Date(now + ttlMs).toISOString()
  if (isSupabaseAvailable() && supabase) {
    await supabase
      .from('edit_locks')
      .update({ expires_at: expiresAt })
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .eq('owner_id', ownerId)
    return
  }
  const map = loadMap()
  const k = key(resourceType, resourceId)
  const lock = map[k]
  if (lock && lock.ownerId === ownerId) {
    lock.updatedAt = nowISO()
    lock.expiresAt = expiresAt
    saveMap(map)
  }
}

// Heartbeat helper
export function startHeartbeat(resourceType: string, resourceId: string, ownerId: string, ttlMs = DEFAULT_TTL_MS, intervalMs = Math.floor(ttlMs / 2)) {
  const id = setInterval(() => {
    renew(resourceType, resourceId, ownerId, ttlMs)
      .catch(() => {})
  }, Math.max(10_000, intervalMs))
  return {
    stop() { clearInterval(id) }
  }
}

// Default owner id util
export function getDefaultOwnerId(): string {
  try {
    const k = 'ptw-session-id'
    let v = localStorage.getItem(k)
    if (!v) {
      v = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      localStorage.setItem(k, v)
    }
    return v
  } catch {
    return `sess_${Date.now().toString(36)}`
  }
}

export type { Lock }
