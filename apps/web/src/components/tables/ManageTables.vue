<template>
  <div class="bg-white px-6 h-full flex flex-col gap-4">
    <div class="flex items-center justify-between flex-wrap gap-2">
      <h2 class="text-2xl font-semibold text-gray-900">{{ t('tables.title') }}</h2>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="zone in zones"
          :key="zone.id"
          @click="tableStore.activeZone = zone.id"
          :class="[
            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
            tableStore.activeZone === zone.id
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
          {{ t('tables.available') }}
        </span>
        <span class="flex items-center gap-1.5 text-sm text-gray-600">
          <span class="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
          {{ t('tables.reserved') }}
        </span>
        <span class="flex items-center gap-1.5 text-sm text-gray-600">
          <span class="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
          {{ t('tables.on-dine') }}
        </span>
      </div>

      <div class="flex gap-2 flex-wrap">
        <!-- Acciones de selección (solo en modo normal) -->
        <template v-if="!tableStore.editMode">
          <button
            v-if="tableStore.selectedIds.length >= 2"
            @click="tableStore.mergeTables(tableStore.selectedIds)"
            class="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition"
          >
            ⊕ {{ t('tables.join') }} ({{ tableStore.selectedIds.length }})
          </button>
          <button
            v-if="tableStore.selectedIds.length === 1"
            @click="openSplitModal(tableStore.selectedIds[0])"
            class="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
          >
            ⊗ {{ t('tables.split') }}
          </button>
          <button
            v-if="tableStore.selectedIds.length > 0"
            @click="tableStore.clearSelection"
            class="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="openAddTableModal"
            class="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition"
          >
            + {{ t('tables.newTable') }}
          </button>
        </template>

        <!-- Toggle modo edición -->
        <button
          @click="tableStore.toggleEditMode"
          :class="[
            'px-3 py-1.5 text-sm rounded-lg transition font-medium',
            tableStore.editMode
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ tableStore.editMode ? `✓ ${t('tables.saveLayout')}` : `✏️ ${t('tables.editLayout')}` }}
        </button>
      </div>
    </div>

    <!-- ─── Banner modo edición ─── -->
    <div
      v-if="tableStore.editMode"
      class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700 flex items-center gap-2"
    >
      <span>✏️</span>
      <span>{{ t('tables.banner') }}</span>
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
        <template v-if="tableStore.editMode">
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
          v-for="table in tableStore.filteredTables"
          :key="table.id"
          :draggable="tableStore.editMode"
          :style="{
            gridColumn: `${table.gridCol} / span ${table.colSpan}`,
            gridRow: `${table.gridRow} / span ${table.rowSpan}`,
            zIndex: 10
          }"
          :class="[
            'relative rounded-2xl border-2 cursor-pointer transition-all select-none',
            tableCardClass(table),
            !tableStore.editMode && tableStore.selectedIds.includes(table.id)
              ? 'ring-1 ring-teal-500'
              : '',
            tableStore.editMode ? 'cursor-grab active:cursor-grabbing shadow-lg' : 'hover:scale-[0.95]'
          ]"
          @click="!tableStore.editMode && tableStore.toggleSelect(table.id)"
          @dragstart="onDragStart($event, table)"
          @dragend="onDragEnd"
        >
          <!-- Controles de edición -->
           
          <div
            v-if="!tableStore.editMode"
            class="absolute bottom-1.5 right-1.5 flex gap-1 z-20"
          >
                    <button
              @click.stop="openEditModal(table)"
              class="w-6 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center text-xs hover:bg-gray-50 shadow-sm text-black cursor-pointer"
              :title="t('tables.editTable')"
            >
              ✏︎
            </button></div>
          <div
            v-if="tableStore.editMode"
            class="absolute bottom-1.5 right-1.5 flex gap-1 z-20"
          >
            <button
              @click.stop="tableStore.rotateTable(table.id)"
              class="w-6 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center text-xs hover:bg-gray-50 shadow-sm text-black cursor-pointer"
              title="Rotar 90°"
            >
              ↻
            </button>
            <button
              @click.stop="tableStore.toggleSize(table.id)"
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
            v-if="!tableStore.editMode && tableStore.selectedIds.includes(table.id)"
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
          <h3 class="font-semibold text-lg text-gray-900">{{ t('tables.newTable') }}</h3>

          <label class="flex flex-col gap-1 text-sm text-gray-700">
            {{ t('tables.number') }}
            <input
              v-model.number="newTable.number"
              type="number"
              class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </label>

          <label class="flex flex-col gap-1 text-sm text-gray-700">
            {{ t('tables.modal.seats') }}
            <input
              v-model.number="newTable.seats"
              type="number"
              min="2"
              step="2"
              class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </label>

          <label class="flex flex-col gap-1 text-sm text-gray-700">
            {{ t('tables.modal.sizeTable') }}
            <select
              v-model="newTable.size"
              class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="small">{{ t('tables.normal') }}</option>
              <option value="large">{{ t('tables.big') }}</option>
            </select>
          </label>

          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-400 mb-1">{{ t('tables.modal.previewText') }}</p>
            <div class="flex justify-center gap-1 flex-wrap">
              <span v-for="i in newTable.seats" :key="i" class="text-gray-300 text-sm">🪑</span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="addTable"
              class="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
            >
              {{ t('common.add') }}
            </button>
            <button
              @click="showAddModal = false"
              class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200 transition"
            >
              {{ t('common.cancel') }}
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
            {{ t('tables.splitTable') }} #{{ tableToSplit?.number }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ t('tables.tableOccupantsMsg') }}
            <strong class="text-gray-800">{{ tableToSplit?.seats }} {{ t('tables.seats') }}</strong>.
            {{ t('tables.splitMsg') }}
          </p>

          <label class="flex flex-col gap-1 text-sm text-gray-700">
            {{ t('tables.labelTotalTables') }}
            <input
              v-model.number="splitCount"
              type="number"
              min="2"
              :max="tableToSplit?.seats"
              class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </label>

          <div class="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5">
            <p class="text-xs font-medium text-gray-400 mb-0.5">{{ t('tables.result') }}</p>
            <div
              v-for="(seats, i) in splitSeatsPreview"
              :key="i"
              class="flex justify-between items-center text-sm"
            >
              <span class="text-gray-700 font-medium">
                {{ t('tables.table') }} #{{ (tableToSplit?.number ?? 0) + i }}
              </span>
              <span class="text-gray-500 flex items-center gap-1">
                <span v-for="s in seats" :key="s" class="text-xs text-gray-300">🪑</span>
                {{ seats }} {{ t('tables.seats') }}
              </span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="confirmSplit"
              :disabled="splitCount < 2 || splitCount > (tableToSplit?.seats ?? 0)"
              class="flex-1 bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ t('tables.split') }}
            </button>
            <button
              @click="showSplitModal = false"
              class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200 transition"
            >
              {{ t('common.cancel') }}
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
        {{ t('tables.editTable') }} #{{ tableToEdit?.number }}
      </h3>

      <label class="flex flex-col gap-1 text-sm text-gray-700">
        {{ t('tables.totalSeats') }}
        <input
          v-model.number="editForm.seats"
          type="number"
          min="1"
          class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </label>

      <label class="flex flex-col gap-1 text-sm text-gray-700">
        {{ t('tables.currentOccupants') }}
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
        <p class="text-xs text-gray-400 mb-2">{{ t('tables.preview') }}</p>
        <div class="flex justify-center gap-1 flex-wrap">
          <span
            v-for="i in editForm.seats"
            :key="i"
            class="text-sm"
            :class="i <= editForm.occupants ? 'text-teal-500' : 'text-gray-300'"
          >🪑</span>
        </div>
        <p class="text-xs text-gray-400 mt-2">
          {{ editForm.occupants }} / {{ editForm.seats }} {{ t('tables.occupied') }}
        </p>
      </div>

      <!-- Estado -->
      <label class="flex flex-col gap-1 text-sm text-gray-700">
        {{ t('tables.state') }}
        <select
          v-model="editForm.status"
          class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <option value="available">{{ t('tables.available') }}</option>
          <option value="reserved">{{ t('tables.reserved') }}</option>
          <option value="on-dine">{{ t('tables.on-dine') }}</option>
        </select>
      </label>

      <div class="flex gap-2">
        <button
          @click="confirmEdit"
          class="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
        >
          {{ t('common.save') }}
        </button>
        <button
          @click="showEditModal = false"
          class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200 transition"
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { useTablesStore, type RestaurantTable, type TableStatus } from '@/stores/tables.store'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const tableStore = useTablesStore()

// ─── Grid config ─────────────────────────────────────────────────────────────
const GRID_COLS = 6
const GRID_ROWS = 5

interface GridCell { col: number; row: number }

const gridCells = computed<GridCell[]>(() => {
  const cells: GridCell[] = []
  for (let row = 1; row <= GRID_ROWS; row++)
    for (let col = 1; col <= GRID_COLS; col++)
      cells.push({ col, row })
  return cells
})

// ─── Zonas ───────────────────────────────────────────────────────────────────
const zones = [
  { id: 'saloon',    name: t('tables.saloon') },
  { id: 'terrace', name: t('tables.terrace')  },
  { id: 'outdoor', name: t('tables.outdoor')   },
]

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

function topSeats(table: RestaurantTable): number {
  return Math.ceil(table.seats / 2)
}
function bottomSeats(table: RestaurantTable): number {
  return Math.floor(table.seats / 2)
}

// ─── Drag & Drop ─────────────────────────────────────────────────────────────
const draggingTableId = ref<string | null>(null)
const dragOverCell    = ref<GridCell | null>(null)

function onDragStart(event: DragEvent, table: RestaurantTable) {
  if (!tableStore.editMode) return
  draggingTableId.value = table.id
  event.dataTransfer?.setData('tableId', table.id)
}

function onDragEnd() {
  draggingTableId.value = null
  dragOverCell.value    = null
}

function onDropOnCell(cell: GridCell) {
  if (!draggingTableId.value) return
  tableStore.moveTable(draggingTableId.value, cell.col, cell.row)
  draggingTableId.value = null
  dragOverCell.value    = null
}

function onDropOnGrid(event: DragEvent) {
  event.preventDefault()
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
  if (!tableToEdit.value) return
  tableStore.updateTable(tableToEdit.value.id, {
    seats:     editForm.value.seats,
    occupants: Math.min(editForm.value.occupants, editForm.value.seats),
    status:    editForm.value.status,
  })
  showEditModal.value = false
  tableToEdit.value   = null
}

// ─── Dividir mesa ─────────────────────────────────────────────────────────────
const showSplitModal = ref(false)
const tableToSplit   = ref<RestaurantTable | null>(null)
const splitCount     = ref(2)

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
  tableToSplit.value   = tableStore.tables.find(t => t.id === tableId) ?? null
  splitCount.value     = 2
  showSplitModal.value = true
}

function confirmSplit() {
  if (!tableToSplit.value || splitCount.value < 2) return
  tableStore.splitTable(tableToSplit.value.id, splitCount.value)
  showSplitModal.value = false
  tableToSplit.value   = null
}

// ─── Añadir mesa ─────────────────────────────────────────────────────────────
const showAddModal = ref(false)
const newTable     = ref({ number: 1, seats: 4, size: 'small' as RestaurantTable['size'] })

function openAddTableModal() {
  const max = Math.max(0, ...tableStore.filteredTables.map(t => t.number))
  newTable.value     = { number: max + 1, seats: 4, size: 'small' }
  showAddModal.value = true
}

function addTable() {
  // Buscar primera celda libre en la zona activa
  const occupied = new Set(
    tableStore.filteredTables.map(t => `${t.gridCol}-${t.gridRow}`)
  )
  let freeCol = 1, freeRow = 1
  outer: for (let row = 1; row <= GRID_ROWS; row++) {
    for (let col = 1; col <= GRID_COLS; col++) {
      if (!occupied.has(`${col}-${row}`)) {
        freeCol = col; freeRow = row
        break outer
      }
    }
  }

  tableStore.addTable({
    number:    newTable.value.number,
    zone:      tableStore.activeZone,
    status:    'available',
    seats:     newTable.value.seats,
    occupants: 0,
    size:      newTable.value.size,
    gridCol:   freeCol,
    gridRow:   freeRow,
    colSpan:   newTable.value.size === 'large' ? 2 : 1,
    rowSpan:   1,
    rotation:  0,
  })

  showAddModal.value = false
}
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
