<template>
  <div class="bg-white rounded-2xl p-6 h-full flex flex-col gap-4">

    <!-- ─── Header ─── -->
    <div class="flex items-center justify-between flex-wrap gap-2">
      <h2 class="text-2xl font-semibold text-gray-900">Manage Tables</h2>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="zone in zones"
          :key="zone.id"
          @click="activeZone = zone.id"
          :class="[
            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
            activeZone === zone.id
              ? 'bg-teal-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          ]"
        >
          {{ zone.name }}
        </button>
      </div>
    </div>

    <!-- ─── Legend + Toolbar ─── -->
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1.5 text-sm text-gray-600">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-300 inline-block" />
          Available
        </span>
        <span class="flex items-center gap-1.5 text-sm text-gray-600">
          <span class="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
          Reserved
        </span>
        <span class="flex items-center gap-1.5 text-sm text-gray-600">
          <span class="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
          On Dine
        </span>
      </div>

      <div class="flex gap-2 flex-wrap">
        <!-- Acciones de selección (solo en modo normal) -->
        <template v-if="!editMode">
          <button
            v-if="selectedTables.length >= 2"
            @click="mergeTables"
            class="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition"
          >
            ⊕ Unir ({{ selectedTables.length }})
          </button>
          <button
            v-if="selectedTables.length === 1"
            @click="openSplitModal(selectedTables[0])"
            class="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
          >
            ⊗ Dividir
          </button>
          <button
            v-if="selectedTables.length > 0"
            @click="clearSelection"
            class="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            @click="openAddTableModal"
            class="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition"
          >
            + Nueva mesa
          </button>
        </template>

        <!-- Toggle modo edición -->
        <button
          @click="toggleEditMode"
          :class="[
            'px-3 py-1.5 text-sm rounded-lg transition font-medium',
            editMode
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ editMode ? '✓ Guardar layout' : '✏️ Editar layout' }}
        </button>
      </div>
    </div>

    <!-- ─── Banner modo edición ─── -->
    <div
      v-if="editMode"
      class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700 flex items-center gap-2"
    >
      <span>✏️</span>
      <span>Modo edición: arrastra las mesas para reposicionarlas. Usa los botones de cada mesa para rotar o redimensionar.</span>
    </div>

    <!-- ─── Grid de mesas ─── -->
    <div class="flex-1 overflow-auto">
      <div
        class="relative"
        :style="{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(120px, 1fr))`,
          gridTemplateRows: `repeat(${GRID_ROWS}, minmax(120px, 1fr))`,
          gap: '16px',
          minHeight: '500px'
        }"
        @dragover.prevent
        @drop="onDropOnGrid"
      >
        <!-- Celdas guía visibles en modo edición -->
        <template v-if="editMode">
          <div
            v-for="cell in gridCells"
            :key="`cell-${cell.col}-${cell.row}`"
            :style="{
              gridColumn: `${cell.col}`,
              gridRow: `${cell.row}`,
              pointerEvents: 'none'
            }"
            :class="[
              'rounded-xl border-2 border-dashed transition-colors',
              dragOverCell?.col === cell.col && dragOverCell?.row === cell.row
                ? 'border-teal-400 bg-teal-50'
                : 'border-gray-200 bg-gray-50/50'
            ]"
            @dragover.prevent="dragOverCell = cell"
            style="pointer-events: all"
            @drop.stop="onDropOnCell(cell)"
          />
        </template>

        <!-- Mesas -->
        <div
          v-for="table in filteredTables"
          :key="table.id"
          :draggable="editMode"
          :style="{
            gridColumn: `${table.gridCol} / span ${table.colSpan}`,
            gridRow: `${table.gridRow} / span ${table.rowSpan}`,
            zIndex: 10
          }"
          :class="[
            'relative rounded-2xl border-2 cursor-pointer transition-all select-none',
            tableCardClass(table),
            !editMode && selectedTables.includes(table.id)
              ? 'ring-1 ring-teal-500'
              : '',
            editMode ? 'cursor-grab active:cursor-grabbing shadow-lg' : 'hover:scale-[0.95]'
          ]"
          @click="!editMode && toggleSelect(table)"
          @dragstart="onDragStart($event, table)"
          @dragend="onDragEnd"
        >
          <!-- Controles de edición -->
           
          <div
            v-if="!editMode"
            class="absolute top-1.5 right-1.5 flex gap-1 z-20"
          >
                    <button
              @click.stop="openEditModal(table)"
              class="w-6 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center text-xs hover:bg-gray-50 shadow-sm text-black cursor-pointer"
              title="Editar mesa"
            >
              ✏︎
            </button></div>
          <div
            v-if="editMode"
            class="absolute top-1.5 right-1.5 flex gap-1 z-20"
          >
            <button
              @click.stop="rotateTable(table)"
              class="w-6 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center text-xs hover:bg-gray-50 shadow-sm text-black cursor-pointer"
              title="Rotar 90°"
            >
              ↻
            </button>
            <button
              @click.stop="toggleSize(table)"
              class="w-6 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center text-xs hover:bg-gray-50 shadow-sm text-black cursor-pointer"
              title="Cambiar tamaño"
            >
              {{ table.colSpan > 1 || table.rowSpan > 1 ? '⊟' : '⊞' }}
            </button>
          </div>

          <!-- Contenido interior con rotación visual -->
          <div
            class="w-full h-full flex flex-col items-center justify-between p-3 transition-transform duration-300"
          >
            <!-- Sillas top -->
            <div class="flex justify-center gap-1">
              <span
                v-for="i in topSeats(table)"
                :key="'t' + i"
                :class="['text-sm leading-none', chairColor(table)]"
              >🪑</span>
            </div>

            <!-- Info central -->
            <div class="text-center flex-1 flex flex-col items-center justify-center py-1">
              <p class="font-semibold text-gray-800 text-xs leading-tight">
                {{ table.mergedFrom
                  ? `${table.mergedFrom.join(' + ')}`
                  : `Table #${table.number}` }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">👥 {{ table.occupants }}</p>
              <span
                v-if="table.mergedFrom"
                class="inline-block mt-1 text-[9px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-medium"
              >
                unidas
              </span>
            </div>

            <!-- Sillas bottom -->
            <div class="flex justify-center gap-1">
              <span
                v-for="i in bottomSeats(table)"
                :key="'b' + i"
                :class="['text-sm leading-none', chairColor(table)]"
              >🪑</span>
            </div>
          </div>

          <!-- Check selección -->
          <div
            v-if="!editMode && selectedTables.includes(table.id)"
            class="absolute top-2 right-2 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs shadow"
          >
            ✓
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Modal: Nueva mesa ─── -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        @click.self="showAddModal = false"
      >
        <div class="bg-white rounded-2xl p-6 w-80 flex flex-col gap-4 shadow-xl">
          <h3 class="font-semibold text-lg text-gray-900">Nueva mesa</h3>

          <label class="flex flex-col gap-1 text-sm text-gray-700">
            Número
            <input
              v-model.number="newTable.number"
              type="number"
              class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </label>

          <label class="flex flex-col gap-1 text-sm text-gray-700">
            Asientos
            <input
              v-model.number="newTable.seats"
              type="number"
              min="2"
              step="2"
              class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </label>

          <label class="flex flex-col gap-1 text-sm text-gray-700">
            Tamaño visual
            <select
              v-model="newTable.size"
              class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="small">Normal (1×1)</option>
              <option value="large">Grande (2×1)</option>
            </select>
          </label>

          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-400 mb-1">Vista previa de asientos</p>
            <div class="flex justify-center gap-1 flex-wrap">
              <span v-for="i in newTable.seats" :key="i" class="text-gray-300 text-sm">🪑</span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="addTable"
              class="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
            >
              Añadir
            </button>
            <button
              @click="showAddModal = false"
              class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ─── Modal: Dividir mesa ─── -->
    <Teleport to="body">
      <div
        v-if="showSplitModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        @click.self="showSplitModal = false"
      >
        <div class="bg-white rounded-2xl p-6 w-80 flex flex-col gap-4 shadow-xl">
          <h3 class="font-semibold text-lg text-gray-900">
            Dividir Mesa #{{ tableToSplit?.number }}
          </h3>
          <p class="text-sm text-gray-500">
            Esta mesa tiene
            <strong class="text-gray-800">{{ tableToSplit?.seats }} asientos</strong>.
            Indica en cuántas mesas quieres dividirla.
          </p>

          <label class="flex flex-col gap-1 text-sm text-gray-700">
            Número de mesas resultantes
            <input
              v-model.number="splitCount"
              type="number"
              min="2"
              :max="tableToSplit?.seats"
              class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </label>

          <div class="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5">
            <p class="text-xs font-medium text-gray-400 mb-0.5">Resultado</p>
            <div
              v-for="(seats, i) in splitSeatsPreview"
              :key="i"
              class="flex justify-between items-center text-sm"
            >
              <span class="text-gray-700 font-medium">
                Mesa #{{ (tableToSplit?.number ?? 0) + i }}
              </span>
              <span class="text-gray-500 flex items-center gap-1">
                <span v-for="s in seats" :key="s" class="text-xs text-gray-300">🪑</span>
                {{ seats }} asientos
              </span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="confirmSplit"
              :disabled="splitCount < 2 || splitCount > (tableToSplit?.seats ?? 0)"
              class="flex-1 bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Dividir
            </button>
            <button
              @click="showSplitModal = false"
              class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
<!-- ─── Modal: Editar mesa ─── -->
<Teleport to="body">
  <div
    v-if="showEditModal"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    @click.self="showEditModal = false"
  >
    <div class="bg-white rounded-2xl p-6 w-80 flex flex-col gap-4 shadow-xl">
      <h3 class="font-semibold text-lg text-gray-900">
        Editar Mesa #{{ tableToEdit?.number }}
      </h3>

      <label class="flex flex-col gap-1 text-sm text-gray-700">
        Asientos totales
        <input
          v-model.number="editForm.seats"
          type="number"
          min="1"
          class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </label>

      <label class="flex flex-col gap-1 text-sm text-gray-700">
        Ocupantes actuales
        <input
          v-model.number="editForm.occupants"
          type="number"
          min="0"
          :max="editForm.seats"
          class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </label>

      <!-- Preview sillas -->
      <div class="bg-gray-50 rounded-xl p-3 text-center">
        <p class="text-xs text-gray-400 mb-2">Vista previa</p>
        <div class="flex justify-center gap-1 flex-wrap">
          <span
            v-for="i in editForm.seats"
            :key="i"
            class="text-sm"
            :class="i <= editForm.occupants ? 'text-teal-500' : 'text-gray-300'"
          >🪑</span>
        </div>
        <p class="text-xs text-gray-400 mt-2">
          {{ editForm.occupants }} / {{ editForm.seats }} ocupados
        </p>
      </div>

      <!-- Estado -->
      <label class="flex flex-col gap-1 text-sm text-gray-700">
        Estado
        <select
          v-model="editForm.status"
          class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="on-dine">On Dine</option>
        </select>
      </label>

      <div class="flex gap-2">
        <button
          @click="confirmEdit"
          class="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
        >
          Guardar
        </button>
        <button
          @click="showEditModal = false"
          class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// ─── Types ───────────────────────────────────────────────────────────────────
type TableStatus = 'available' | 'reserved' | 'on-dine'
type TableSize   = 'small' | 'large'
type Rotation    = 0 | 90 | 180 | 270

interface RestaurantTable {
  id: string
  number: number
  zone: string
  status: TableStatus
  seats: number
  occupants: number
  size: TableSize
  // Grid layout
  gridCol: number
  gridRow: number
  colSpan: number
  rowSpan: number
  rotation: Rotation
  mergedFrom?: number[]
}

interface GridCell {
  col: number
  row: number
}

// ─── Emits ───────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  merge:       [tableIds: string[]]
  split:       [tableId: string, into: number]
  tableAdded:  [table: RestaurantTable]
  layoutSaved: [tables: RestaurantTable[]]
}>()

// ─── Grid config ─────────────────────────────────────────────────────────────
const GRID_COLS = 6
const GRID_ROWS = 5

const gridCells = computed<GridCell[]>(() => {
  const cells: GridCell[] = []
  for (let row = 1; row <= GRID_ROWS; row++) {
    for (let col = 1; col <= GRID_COLS; col++) {
      cells.push({ col, row })
    }
  }
  return cells
})

// ─── Zonas ───────────────────────────────────────────────────────────────────
const zones = [
  { id: 'main',    name: 'Main Dining' },
  { id: 'terrace', name: 'Terrace'     },
  { id: 'outdoor', name: 'Outdoor'     },
]
const activeZone = ref('main')

// ─── Mesas ───────────────────────────────────────────────────────────────────
const tables = ref<RestaurantTable[]>([
  { id: 't1',  number: 1, zone: 'main', status: 'reserved',  seats: 8, occupants: 6,  size: 'large', gridCol: 1, gridRow: 1, colSpan: 2, rowSpan: 1, rotation: 0 },
  { id: 't2',  number: 2, zone: 'main', status: 'on-dine',   seats: 4, occupants: 2,  size: 'small', gridCol: 3, gridRow: 1, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 't3',  number: 3, zone: 'main', status: 'available', seats: 4, occupants: 0,  size: 'small', gridCol: 4, gridRow: 1, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 't4',  number: 4, zone: 'main', status: 'on-dine',   seats: 4, occupants: 3,  size: 'small', gridCol: 1, gridRow: 2, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 't5',  number: 5, zone: 'main', status: 'available', seats: 2, occupants: 0,  size: 'small', gridCol: 2, gridRow: 2, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 't6',  number: 6, zone: 'main', status: 'reserved',  seats: 8, occupants: 7,  size: 'large', gridCol: 3, gridRow: 2, colSpan: 2, rowSpan: 1, rotation: 0 },
  { id: 't7',  number: 7, zone: 'main', status: 'reserved',  seats: 8, occupants: 10, size: 'large', gridCol: 1, gridRow: 3, colSpan: 2, rowSpan: 1, rotation: 0 },
  { id: 't8',  number: 8, zone: 'main', status: 'on-dine',   seats: 4, occupants: 2,  size: 'small', gridCol: 3, gridRow: 3, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 't9',  number: 9, zone: 'main', status: 'on-dine',   seats: 4, occupants: 4,  size: 'small', gridCol: 4, gridRow: 3, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 'tt1', number: 1, zone: 'terrace', status: 'available', seats: 4, occupants: 0, size: 'small', gridCol: 1, gridRow: 1, colSpan: 1, rowSpan: 1, rotation: 0 },
  { id: 'tt2', number: 2, zone: 'terrace', status: 'on-dine',   seats: 4, occupants: 3, size: 'small', gridCol: 2, gridRow: 1, colSpan: 1, rowSpan: 1, rotation: 0 },
])

const filteredTables = computed(() =>
  tables.value.filter(t => t.zone === activeZone.value)
)

// ─── Sillas (sin laterales fijas) ────────────────────────────────────────────
function topSeats(table: RestaurantTable): number {
  // Si está rotada 90/270, las sillas "top/bottom" pasan a ser laterales visualmente
  // pero el conteo sigue siendo ceil/floor del total
  return Math.ceil(table.seats / 2)
}
function bottomSeats(table: RestaurantTable): number {
  return Math.floor(table.seats / 2)
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
function tableCardClass(table: RestaurantTable): string {
  if (table.status === 'reserved') return 'bg-teal-50 border-teal-200'
  if (table.status === 'on-dine')  return 'bg-orange-50 border-orange-200'
  return 'bg-blue-50 border-blue-200'
}

function chairColor(table: RestaurantTable): string {
  if (table.status === 'reserved') return 'text-teal-500'
  if (table.status === 'on-dine')  return 'text-orange-400'
  return 'text-gray-300'
}

// ─── Selección ───────────────────────────────────────────────────────────────
const selectedTables = ref<string[]>([])

function toggleSelect(table: RestaurantTable) {
  const idx = selectedTables.value.indexOf(table.id)
  if (idx === -1) selectedTables.value.push(table.id)
  else selectedTables.value.splice(idx, 1)
}

function clearSelection() {
  selectedTables.value = []
}

// ─── Modo edición ────────────────────────────────────────────────────────────
const editMode = ref(false)

function toggleEditMode() {
  editMode.value = !editMode.value
  if (!editMode.value) {
    // Al salir del modo edición, persistir el layout
    emit('layoutSaved', tables.value)
    clearSelection()
  }
}

// ─── Rotar mesa ──────────────────────────────────────────────────────────────
function rotateTable(table: RestaurantTable) {
  const t = tables.value.find(t => t.id === table.id)
  if (!t) return

  // Intercambiar colSpan y rowSpan al rotar
  const prevColSpan = t.colSpan
  t.colSpan = t.rowSpan
  t.rowSpan = prevColSpan

  t.rotation = ((t.rotation + 90) % 360) as Rotation
}

// ─── Cambiar tamaño ──────────────────────────────────────────────────────────
function toggleSize(table: RestaurantTable) {
  const t = tables.value.find(t => t.id === table.id)
  if (!t) return

  if (t.colSpan === 1 && t.rowSpan === 1) {
    // small → large horizontal
    t.colSpan = 2
    t.rowSpan = 1
    t.size = 'large'
  } else {
    // large → small
    t.colSpan = 1
    t.rowSpan = 1
    t.size = 'small'
  }
}

// ─── Drag & Drop entre celdas ─────────────────────────────────────────────────
const draggingTableId = ref<string | null>(null)
const dragOverCell    = ref<GridCell | null>(null)

function onDragStart(event: DragEvent, table: RestaurantTable) {
  if (!editMode.value) return
  draggingTableId.value = table.id
  event.dataTransfer?.setData('tableId', table.id)
}

function onDragEnd() {
  draggingTableId.value = null
  dragOverCell.value    = null
}

function onDropOnCell(cell: GridCell) {
  if (!draggingTableId.value) return
  const t = tables.value.find(t => t.id === draggingTableId.value)
  if (!t) return

  t.gridCol = cell.col
  t.gridRow = cell.row

  draggingTableId.value = null
  dragOverCell.value    = null
}

function onDropOnGrid(event: DragEvent) {
  // Fallback: si suelta en el grid pero no sobre una celda específica, no hacemos nada
  event.preventDefault()
}

// ─── Unir mesas ──────────────────────────────────────────────────────────────
function mergeTables() {
  const toMerge = tables.value.filter(t => selectedTables.value.includes(t.id))
  if (toMerge.length < 2) return

  const merged: RestaurantTable = {
    id: `merged-${Date.now()}`,
    number: toMerge[0].number,
    zone: toMerge[0].zone,
    status: toMerge.some(t => t.status === 'on-dine')  ? 'on-dine'
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

  tables.value = tables.value.filter(t => !selectedTables.value.includes(t.id))
  tables.value.push(merged)

  emit('merge', selectedTables.value)
  clearSelection()
}

// ─── Dividir mesa ─────────────────────────────────────────────────────────────
const showSplitModal  = ref(false)
const tableToSplit    = ref<RestaurantTable | null>(null)
const splitCount      = ref(2)

const splitSeatsPreview = computed<number[]>(() => {
  if (!tableToSplit.value || splitCount.value < 2) return []
  const total     = tableToSplit.value.seats
  const base      = Math.floor(total / splitCount.value)
  const remainder = total % splitCount.value
  return Array.from({ length: splitCount.value }, (_, i) =>
    i < remainder ? base + 1 : base
  )
})

function openSplitModal(tableId: string) {
  tableToSplit.value = tables.value.find(t => t.id === tableId) ?? null
  splitCount.value   = 2
  showSplitModal.value = true
}

function confirmSplit() {
  const source = tableToSplit.value
  if (!source || splitCount.value < 2) return

  const newTables: RestaurantTable[] = splitSeatsPreview.value.map((seats, i) => ({
    id:        `split-${source.id}-${i}-${Date.now()}`,
    number:    source.number + i,
    zone:      source.zone,
    status:    'available' as TableStatus,
    seats,
    occupants: 0,
    size:      'small' as TableSize,
    gridCol:   source.gridCol + i,  // las coloca en celdas consecutivas
    gridRow:   source.gridRow,
    colSpan:   1,
    rowSpan:   1,
    rotation:  0,
  }))

  tables.value = tables.value.filter(t => t.id !== source.id)
  tables.value.push(...newTables)

  emit('split', source.id, splitCount.value)
  showSplitModal.value = false
  tableToSplit.value   = null
  clearSelection()
}

// ─── Añadir mesa ─────────────────────────────────────────────────────────────
const showAddModal = ref(false)
const newTable     = ref({ number: 10, seats: 4, size: 'small' as TableSize })

function openAddTableModal() {
  const max = Math.max(0, ...filteredTables.value.map(t => t.number))
  newTable.value = { number: max + 1, seats: 4, size: 'small' }
  showAddModal.value = true
}

function addTable() {
  // Buscar primera celda libre
  const occupied = new Set(
    filteredTables.value.map(t => `${t.gridCol}-${t.gridRow}`)
  )
  let freeCol = 1, freeRow = 1
  outer: for (let row = 1; row <= GRID_ROWS; row++) {
    for (let col = 1; col <= GRID_COLS; col++) {
      if (!occupied.has(`${col}-${row}`)) {
        freeCol = col
        freeRow = row
        break outer
      }
    }
  }

  const table: RestaurantTable = {
    id:        `new-${Date.now()}`,
    number:    newTable.value.number,
    zone:      activeZone.value,
    status:    'available',
    seats:     newTable.value.seats,
    occupants: 0,
    size:      newTable.value.size,
    gridCol:   freeCol,
    gridRow:   freeRow,
    colSpan:   newTable.value.size === 'large' ? 2 : 1,
    rowSpan:   1,
    rotation:  0,
  }

  tables.value.push(table)
  emit('tableAdded', table)
  showAddModal.value = false
}
// ─── Editar mesa ─────────────────────────────────────────────────────────────
const showEditModal = ref(false)
const tableToEdit   = ref<RestaurantTable | null>(null)
const editForm      = ref({ seats: 4, occupants: 0, status: 'available' as TableStatus })

function openEditModal(table: RestaurantTable) {
  tableToEdit.value = table
  editForm.value = {
    seats:     table.seats,
    occupants: table.occupants,
    status:    table.status,
  }
  showEditModal.value = true
}

function confirmEdit() {
  const t = tables.value.find(t => t.id === tableToEdit.value?.id)
  if (!t) return

  t.seats     = editForm.value.seats
  t.occupants = Math.min(editForm.value.occupants, editForm.value.seats) // nunca > seats
  t.status    = editForm.value.status

  showEditModal.value = false
  tableToEdit.value   = null
}

</script>
