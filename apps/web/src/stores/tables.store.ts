import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ─── Types ───────────────────────────────────────────────────────────────────
export type TableStatus = 'available' | 'reserved' | 'on-dine'
export type TableSize   = 'small' | 'large'
export type Rotation    = 0 | 90 | 180 | 270

export interface RestaurantTable {
  id: string
  number: number
  zone: string
  status: TableStatus
  seats: number
  occupants: number
  size: TableSize
  gridCol: number
  gridRow: number
  colSpan: number
  rowSpan: number
  rotation: Rotation
  mergedFrom?: number[]
}

// ─── Datos iniciales (fallback si no hay nada en localStorage) ───────────────
const DEFAULT_TABLES: RestaurantTable[] = [
  { id: 't1',  number: 1, zone: 'saloon', status: 'reserved',  seats: 8, occupants: 6,  size: 'large', gridCol: 1, gridRow: 1, colSpan: 2, rowSpan: 1, rotation: 0 },
  { id: 't2',  number: 2, zone: 'saloon', status: 'on-dine',   seats: 4, occupants: 2,  size: 'small', gridCol: 3, gridRow: 1, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 't3',  number: 3, zone: 'saloon', status: 'available', seats: 4, occupants: 0,  size: 'small', gridCol: 4, gridRow: 1, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 't4',  number: 4, zone: 'saloon', status: 'on-dine',   seats: 4, occupants: 3,  size: 'small', gridCol: 1, gridRow: 2, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 't5',  number: 5, zone: 'saloon', status: 'available', seats: 2, occupants: 0,  size: 'small', gridCol: 2, gridRow: 2, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 't6',  number: 6, zone: 'saloon', status: 'reserved',  seats: 8, occupants: 7,  size: 'large', gridCol: 3, gridRow: 2, colSpan: 2, rowSpan: 1, rotation: 0 },
  { id: 't7',  number: 7, zone: 'saloon', status: 'reserved',  seats: 8, occupants: 10, size: 'large', gridCol: 1, gridRow: 3, colSpan: 2, rowSpan: 1, rotation: 0 },
  { id: 't8',  number: 8, zone: 'saloon', status: 'on-dine',   seats: 4, occupants: 2,  size: 'small', gridCol: 3, gridRow: 3, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 't9',  number: 9, zone: 'saloon', status: 'on-dine',   seats: 4, occupants: 4,  size: 'small', gridCol: 4, gridRow: 3, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 'tt1', number: 1, zone: 'terrace', status: 'available', seats: 4, occupants: 0, size: 'small', gridCol: 1, gridRow: 1, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 'tt2', number: 2, zone: 'terrace', status: 'on-dine',   seats: 4, occupants: 3, size: 'small', gridCol: 2, gridRow: 1, colSpan: 1, rowSpan: 1, rotation: 0 },
]

const STORAGE_KEY = 'billsplit:tables'

// ─── Store ───────────────────────────────────────────────────────────────────
export const useTablesStore = defineStore('tables', () => {

  // ── Estado ────────────────────────────────────────────────────────────────
  const tables     = ref<RestaurantTable[]>(loadFromStorage())
  const activeZone = ref('saloon')
  const editMode   = ref(false)
  const selectedIds = ref<string[]>([])
  const isSaving   = ref(false)
  const lastSaved  = ref<Date | null>(null)

  // ── Computed ──────────────────────────────────────────────────────────────
  const filteredTables = computed(() =>
    tables.value.filter(t => t.zone === activeZone.value)
  )

  const tablesByZone = computed(() =>
    Object.fromEntries(
      ['saloon', 'terrace', 'outdoor'].map(zone => [
        zone,
        tables.value.filter(t => t.zone === zone)
      ])
    )
  )

  const stats = computed(() => ({
    total:     tables.value.length,
    available: tables.value.filter(t => t.status === 'available').length,
    reserved:  tables.value.filter(t => t.status === 'reserved').length,
    onDine:    tables.value.filter(t => t.status === 'on-dine').length,
  }))

  // ── Persistencia ──────────────────────────────────────────────────────────
  function loadFromStorage(): RestaurantTable[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return [...DEFAULT_TABLES]
      const parsed = JSON.parse(raw) as RestaurantTable[]
      return parsed.length ? parsed : [...DEFAULT_TABLES]
    } catch {
      return [...DEFAULT_TABLES]
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tables.value))
      lastSaved.value = new Date()
    } catch (e) {
      console.warn('[tables.store] Error saving to localStorage', e)
    }
  }

  function resetToDefaults() {
    tables.value = [...DEFAULT_TABLES]
    saveToStorage()
    return tables.value
  }

  // Listener para detectar cambios en localStorage desde otras pestañas
  // o cuando se borra la key externamente (ej: DevTools → Clear storage)
  function handleStorageEvent(e: StorageEvent) {
    if (e.key !== null && e.key !== STORAGE_KEY) return
    // key === null significa que se hizo localStorage.clear()
    const newValue = e.key === null ? null : e.newValue
    if (!newValue) {
      tables.value = [...DEFAULT_TABLES]
      saveToStorage()
    } else {
      try {
        const parsed = JSON.parse(newValue) as RestaurantTable[]
        if (parsed.length) tables.value = parsed
      } catch {
        tables.value = [...DEFAULT_TABLES]
      }
    }
  }

  // Re-valida al volver a la pestaña (cubre el borrado desde DevTools)
  function handleVisibilityChange() {
    if (document.visibilityState !== 'visible') return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      tables.value = [...DEFAULT_TABLES]
      saveToStorage()
    }
  }

  window.addEventListener('storage', handleStorageEvent)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // ── Sincronización con BE (cuando conectes Nuxt) ───────────────────────────
  async function syncWithBackend() {
    isSaving.value = true
    try {
      await fetch('/api/tables/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tables.value),
      })
      lastSaved.value = new Date()
    } catch (e) {
      console.warn('[tables.store] Error syncing with backend', e)
    } finally {
      isSaving.value = false
    }
  }

  // ── Acciones: layout ──────────────────────────────────────────────────────
  function saveLayout() {
    saveToStorage()
    // syncWithBackend() // descomentar cuando el endpoint esté listo
  }

  function moveTable(tableId: string, col: number, row: number) {
    const t = tables.value.find(t => t.id === tableId)
    if (!t) return
    t.gridCol = col
    t.gridRow = row
  }

  function rotateTable(tableId: string) {
    const t = tables.value.find(t => t.id === tableId)
    if (!t) return
    const prevColSpan = t.colSpan
    t.colSpan  = t.rowSpan
    t.rowSpan  = prevColSpan
    t.rotation = ((t.rotation + 90) % 360) as Rotation
  }

  function toggleSize(tableId: string) {
    const t = tables.value.find(t => t.id === tableId)
    if (!t) return
    if (t.colSpan === 1 && t.rowSpan === 1) {
      t.colSpan = 2; t.rowSpan = 1; t.size = 'large'
    } else {
      t.colSpan = 1; t.rowSpan = 1; t.size = 'small'
    }
  }

  // ── Acciones: CRUD ────────────────────────────────────────────────────────
  function addTable(payload: Omit<RestaurantTable, 'id'>) {
    tables.value.push({ ...payload, id: `t-${Date.now()}` })
    saveToStorage()
  }

  function updateTable(tableId: string, patch: Partial<RestaurantTable>) {
    const t = tables.value.find(t => t.id === tableId)
    if (!t) return
    Object.assign(t, patch)
    saveToStorage()
  }

  function removeTable(tableId: string) {
    tables.value = tables.value.filter(t => t.id !== tableId)
    saveToStorage()
  }

  // ── Acciones: merge / split ───────────────────────────────────────────────
  function mergeTables(tableIds: string[]) {
    const toMerge = tables.value.filter(t => tableIds.includes(t.id))
    if (toMerge.length < 2) return

    const merged: RestaurantTable = {
      id:        `merged-${Date.now()}`,
      number:    toMerge[0].number,
      zone:      toMerge[0].zone,
      status:    toMerge.some(t => t.status === 'on-dine')  ? 'on-dine'
               : toMerge.some(t => t.status === 'reserved') ? 'reserved'
               : 'available',
      seats:     toMerge.reduce((acc, t) => acc + t.seats, 0),
      occupants: toMerge.reduce((acc, t) => acc + t.occupants, 0),
      size:      'large',
      gridCol:   toMerge[0].gridCol,
      gridRow:   toMerge[0].gridRow,
      colSpan:   2,
      rowSpan:   1,
      rotation:  0,
      mergedFrom: toMerge.map(t => t.number),
    }

    tables.value = tables.value.filter(t => !tableIds.includes(t.id))
    tables.value.push(merged)
    saveToStorage()
  }

  function splitTable(tableId: string, into: number) {
    const source = tables.value.find(t => t.id === tableId)
    if (!source || into < 2) return

    const base      = Math.floor(source.seats / into)
    const remainder = source.seats % into

    // Números ya usados en la zona (excluyendo la mesa origen)
    const usedNumbers = new Set(
      tables.value
        .filter(t => t.zone === source.zone && t.id !== tableId)
        .map(t => t.number)
    )

    // Genera `into` números consecutivos libres a partir del número de la mesa origen
    const assignedNumbers: number[] = []
    let candidate = source.number
    while (assignedNumbers.length < into) {
      if (!usedNumbers.has(candidate)) assignedNumbers.push(candidate)
      candidate++
    }

    const ts = Date.now()
    const newTables: RestaurantTable[] = Array.from({ length: into }, (_, i) => ({
      id:        `split-${source.id}-${i}-${ts}`,
      number:    assignedNumbers[i],
      zone:      source.zone,
      status:    'available' as TableStatus,
      seats:     i < remainder ? base + 1 : base,
      occupants: 0,
      size:      'small' as TableSize,
      gridCol:   source.gridCol + i,
      gridRow:   source.gridRow,
      colSpan:   1,
      rowSpan:   1,
      rotation:  0,
    }))

    tables.value = tables.value.filter(t => t.id !== tableId)
    tables.value.push(...newTables)
    saveToStorage()
  }

  // ── Selección ─────────────────────────────────────────────────────────────
  function toggleSelect(tableId: string) {
    const idx = selectedIds.value.indexOf(tableId)
    if (idx === -1) selectedIds.value.push(tableId)
    else selectedIds.value.splice(idx, 1)
  }

  function clearSelection() {
    selectedIds.value = []
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────
  function toggleEditMode() {
    editMode.value = !editMode.value
    if (!editMode.value) saveLayout()
    clearSelection()
  }

  return {
    // state
    tables, activeZone, editMode, selectedIds, isSaving, lastSaved,
    // computed
    filteredTables, tablesByZone, stats,
    // layout
    saveLayout, moveTable, rotateTable, toggleSize, syncWithBackend, toggleEditMode,
    // crud
    addTable, updateTable, removeTable,
    // merge/split
    mergeTables, splitTable,
    // selección
    toggleSelect, clearSelection,
    // utils
    resetToDefaults,
  }
})
