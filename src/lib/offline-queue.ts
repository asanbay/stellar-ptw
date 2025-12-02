type Operation = {
  id: string
  entity: 'personnel' | 'departments' | 'faq' | 'permits' | 'combined_work_log' | 'announcements'
  action: 'create' | 'update' | 'delete'
  payload: any
  refId?: string
  createdAt: number
}

const QUEUE_KEY = 'ptw-offline-queue'
const DRAFT_PREFIX = 'ptw-draft:'

function readQueue(): Operation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeQueue(items: Operation[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
  } catch {}
}

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const offlineQueue = {
  enqueue(entity: Operation['entity'], action: Operation['action'], payload: any, refId?: string) {
    const op: Operation = { id: genId(), entity, action, payload, refId, createdAt: Date.now() }
    const q = readQueue()
    q.push(op)
    writeQueue(q)
    return op
  },
  peekAll(): Operation[] {
    return readQueue()
  },
  clear() {
    writeQueue([])
  },
  saveDraft(key: string, data: any) {
    try { localStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(data)) } catch {}
  },
  loadDraft<T = any>(key: string): T | null {
    try {
      const raw = localStorage.getItem(DRAFT_PREFIX + key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },
  removeDraft(key: string) {
    try { localStorage.removeItem(DRAFT_PREFIX + key) } catch {}
  },
}

export async function processQueue(processor: (op: Operation) => Promise<void>, onResult?: (ok: boolean, op: Operation, error?: any) => void) {
  const q = readQueue()
  if (q.length === 0) return
  const rest: Operation[] = []
  for (const op of q) {
    try {
      await processor(op)
      onResult?.(true, op)
    } catch (e) {
      // keep for retry
      rest.push(op)
      onResult?.(false, op, e)
    }
  }
  writeQueue(rest)
}

export function resumeOnOnline(handler: () => void) {
  window.addEventListener('online', handler)
}
