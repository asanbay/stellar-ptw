import { useState, useMemo } from 'react'

export interface SelectionState<T> {
  selectedIds: Set<string>
  isAllSelected: boolean
  selectedItems: T[]
}

export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedIds.size === items.length
  }, [items.length, selectedIds.size])

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.has(item.id))
  }, [items, selectedIds])

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)))
    }
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const selectRange = (startId: string, endId: string) => {
    const startIndex = items.findIndex((item) => item.id === startId)
    const endIndex = items.findIndex((item) => item.id === endId)
    
    if (startIndex === -1 || endIndex === -1) return

    const [from, to] = startIndex < endIndex 
      ? [startIndex, endIndex] 
      : [endIndex, startIndex]

    const rangeIds = items.slice(from, to + 1).map((item) => item.id)
    const newSelected = new Set(selectedIds)
    rangeIds.forEach((id) => newSelected.add(id))
    setSelectedIds(newSelected)
  }

  return {
    selectedIds,
    selectedItems,
    isAllSelected,
    selectedCount: selectedIds.size,
    toggleSelection,
    toggleAll,
    clearSelection,
    selectRange,
    isSelected: (id: string) => selectedIds.has(id),
  }
}

export interface BulkOperation<T> {
  label: string
  icon?: React.ReactNode
  action: (items: T[]) => Promise<void> | void
  confirmMessage?: string
  variant?: 'default' | 'destructive'
}
