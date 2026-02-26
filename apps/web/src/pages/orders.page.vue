<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTablesStore, type RestaurantTable } from '@/stores/tables.store'
import { useOrdersStore } from '@/stores/orders.store'
import CategoriesSlider from '@/components/products/CategoriesSlider.vue'
import OrderPanel from '@/components/orders/OrderPanel.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

interface MenuItem {
  id: number
  name: string
  category: string
  price: number
  image: string
  video?: string
  badge: string | null
  width?: number
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const tablesStore = useTablesStore()
const ordersStore = useOrdersStore()

// ── Navegación basada en URL (?table=<id>) ─────────────────────────────────────
// /dashboard/orders          → step 1
// /dashboard/orders?table=t3 → step 2 con la mesa t3

// ── Step 2: mesa activa (derivada de la URL) ───────────────────────────────────
const selectedTable = computed<RestaurantTable | null>(() => {
  const id = route.query.table as string | undefined
  if (!id) return null
  return tablesStore.tables.find(t => t.id === id) ?? null
})

const currentStep = computed<1 | 2>(() => selectedTable.value ? 2 : 1)

// ── Step 1: selección pendiente (antes de abrir la mesa) ──────────────────────
const pendingTable = ref<RestaurantTable | null>(null)
const isGeneratingTable = ref(false)

const availableTables = computed(() =>
  tablesStore.tables.filter(t => t.status === 'available')
)

const onDineTables = computed(() =>
  tablesStore.tables.filter(t => t.status === 'on-dine')
)

function selectTable(table: RestaurantTable) {
  pendingTable.value = table
}

// Descarta la selección pendiente sin tocar el store
function clearPendingTable() {
  pendingTable.value = null
}

async function generateTable() {
  if (!pendingTable.value) return
  isGeneratingTable.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 600))
    tablesStore.updateTable(pendingTable.value.id, { status: 'on-dine' })
    router.push({ query: { table: pendingTable.value.id } })
    pendingTable.value = null
  } finally {
    isGeneratingTable.value = false
  }
}

// Navega al step 2 con una mesa que ya está on-dine
function goToOnDineTable(table: RestaurantTable) {
  resetOrderState()
  router.push({ query: { table: table.id } })
}

// Vuelve al step 1 (quita el query param)
function goBack() {
  router.push({ query: {} })
}

// Libera la mesa activa y vuelve al step 1
function closeTable() {
  if (selectedTable.value) {
    tablesStore.updateTable(selectedTable.value.id, { status: 'available' })
    ordersStore.clearTable(selectedTable.value.id)
  }
  resetOrderState()
  router.push({ query: {} })
}

// ── Step 2: productos ─────────────────────────────────────────────────────────
const searchQuery = ref('')
const selectedCategory = ref('all')

const categoryMap: Record<string, string> = {
  all: 'all',
  appetizer: 'Appetizer',
  soup: 'Soup',
  salads: 'Salads',
  main: 'Main Course',
  italian: 'Italian',
  side: 'Side Dish',
  dessert: 'Dessert',
  beverages: 'Beverages',
}

const onCategoryChange = (categoryId: string) => {
  selectedCategory.value = categoryId
}

// TODO: Replace with Supabase dishes query
const allMenuItems = ref<MenuItem[]>([
  { id: 2, name: 'Chicken Tofu Soup', category: 'Soup', price: 12.90, image: '/products/2.png', badge: t('products.bestSeller') },
  { id: 3, name: 'Quinoa Salad', category: 'Salads', price: 4.90, image: '/products/3.png', video: '/videos/nachos.mp4', badge: t('products.bestSeller') },
  { id: 4, name: 'Beef Wellington', category: 'Main Course', price: 22.50, image: '/products/4.png', badge: t('products.bestSeller') },
  { id: 5, name: 'Seafood Tempting', category: 'Main Course', price: 18.90, image: '/products/5.png', badge: null },
  { id: 6, name: 'Melting Brownie', category: 'Dessert', price: 8.50, image: '/products/6.png', badge: null },
  { id: 1, name: 'Espagueti Carbonara', category: 'Italian', price: 22.90, image: '/products/1.png', video: '/videos/pasta.mp4', badge: 'Destacado', width: 2 },
  { id: 7, name: 'Cheesy Pizza', category: 'Italian', price: 15.90, image: '/products/7.png', badge: null },
  { id: 8, name: 'Matcha Ice Cream', category: 'Dessert', price: 6.90, image: '/products/8.png', badge: null },
  { id: 9, name: 'Jamón ibérico', category: 'Dessert', price: 6.90, image: '/products/9.png', badge: null },
  { id: 10, name: 'Carpaccio de pulpo', category: 'Dessert', price: 6.90, image: '/products/10.png', badge: null },
  { id: 11, name: 'Aguas de gazpacho', category: 'Beverages', price: 6.90, image: '/products/11.png', badge: null },
])

const filteredMenuItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const cat = selectedCategory.value
  return allMenuItems.value.filter(item => {
    const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    const matchesCategory = cat === 'all' || item.category === categoryMap[cat]
    return matchesSearch && matchesCategory
  })
})

// ── Pedido actual ──────────────────────────────────────────────────────────────
// tableCart = estado real persistido en el store
const tableCart = computed(() =>
  selectedTable.value ? ordersStore.getCart(selectedTable.value.id) : []
)

function addToOrder(item: MenuItem) {
  if (!selectedTable.value) return
  ordersStore.addItem(selectedTable.value.id, {
    menuItemId: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
  })
}

function handleSendToKitchen() {
  if (!selectedTable.value || tableCart.value.length === 0) return
  ordersStore.sendToKitchen(selectedTable.value.id)
  router.push({ query: {} })
}

// ── Staging de cambios en órdenes en cocina ────────────────────────────────────
// Los decrementos/eliminaciones sobre una orden ya enviada a cocina se almacenan
// localmente (stagedQuantities) y NO se aplican al store hasta que el usuario
// confirma con un motivo. Si navega atrás o recarga, los cambios se descartan
// y el carrito original se mantiene intacto en localStorage.
//
// stagedQuantities: menuItemId → nueva cantidad deseada (0 = eliminar)
const stagedQuantities = ref<Record<number, number>>({})
const hasStagedChanges = computed(() => Object.keys(stagedQuantities.value).length > 0)

const showCancelModal = ref(false)
const cancelReason = ref('')
const cancelReasonValid = computed(() => cancelReason.value.trim().length >= 3)

const needsReason = computed(() =>
  !!selectedTable.value &&
  ordersStore.isInKitchen(selectedTable.value.id) &&
  hasStagedChanges.value
)

// El botón "Enviar a cocina" solo se activa cuando hay algo nuevo que enviar:
// – orden nueva (no en cocina): basta con que el carrito no esté vacío
// – orden en cocina: debe haber cambios reales respecto al último envío
//   (items nuevos en el store) O cambios staged (decrementos/eliminaciones)
const hasChangesToSend = computed(() => {
  if (!selectedTable.value) return false
  // Staged changes siempre desbloquean el botón, incluso si displayCart está
  // vacío (caso: último ítem staged para eliminar → hay que poder confirmar)
  if (hasStagedChanges.value) return true
  if (displayCart.value.length === 0) return false
  if (!ordersStore.isInKitchen(selectedTable.value.id)) return true
  return ordersStore.hasChangesFromKitchen(selectedTable.value.id)
})

// Vista del carrito con los cambios staged aplicados (lo que ve el usuario)
const displayCart = computed(() => {
  if (!hasStagedChanges.value) return tableCart.value
  return tableCart.value
    .map(item => {
      const staged = stagedQuantities.value[item.menuItemId]
      return staged !== undefined ? { ...item, quantity: staged } : item
    })
    .filter(item => item.quantity > 0)
})

const displayTotal = computed(() =>
  displayCart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

function itemQtyInCart(menuItemId: number): number {
  if (menuItemId in stagedQuantities.value) return stagedQuantities.value[menuItemId]
  const item = tableCart.value.find(i => i.menuItemId === menuItemId)
  return item?.quantity ?? 0
}

function increaseItem(item: { menuItemId: number }) {
  if (!selectedTable.value) return
  // Si el item tiene un staged decremento, revertirlo antes de tocar el store
  if (item.menuItemId in stagedQuantities.value) {
    const real = tableCart.value.find(i => i.menuItemId === item.menuItemId)
    if (!real) return
    const newQty = stagedQuantities.value[item.menuItemId] + 1
    if (newQty >= real.quantity) {
      // Restaurado a la cantidad original → quitar del staged
      const { [item.menuItemId]: _, ...rest } = stagedQuantities.value
      stagedQuantities.value = rest
    } else {
      stagedQuantities.value = { ...stagedQuantities.value, [item.menuItemId]: newQty }
    }
    return
  }
  ordersStore.updateQuantity(selectedTable.value.id, item.menuItemId, 1)
}

function decreaseItem(item: { menuItemId: number }) {
  if (!selectedTable.value) return
  if (ordersStore.isInKitchen(selectedTable.value.id)) {
    const real = tableCart.value.find(i => i.menuItemId === item.menuItemId)
    if (!real) return
    const currentQty = stagedQuantities.value[item.menuItemId] ?? real.quantity
    const newQty = Math.max(0, currentQty - 1)
    stagedQuantities.value = { ...stagedQuantities.value, [item.menuItemId]: newQty }
  } else {
    ordersStore.updateQuantity(selectedTable.value.id, item.menuItemId, -1)
  }
}

function removeItem(item: { menuItemId: number }) {
  if (!selectedTable.value) return
  if (ordersStore.isInKitchen(selectedTable.value.id)) {
    stagedQuantities.value = { ...stagedQuantities.value, [item.menuItemId]: 0 }
  } else {
    ordersStore.removeItem(selectedTable.value.id, item.menuItemId)
  }
}

function onSendButtonClick() {
  if (!hasChangesToSend.value) return
  if (needsReason.value) {
    cancelReason.value = ''
    showCancelModal.value = true
  } else {
    handleSendToKitchen()
  }
}

function confirmCancel() {
  if (!cancelReasonValid.value || !selectedTable.value) return
  const tableId = selectedTable.value.id
  // Aplicar los cambios staged al store real
  Object.entries(stagedQuantities.value).forEach(([id, newQty]) => {
    const menuItemId = Number(id)
    const real = tableCart.value.find(i => i.menuItemId === menuItemId)
    if (!real) return
    if (newQty <= 0) {
      ordersStore.removeItem(tableId, menuItemId)
    } else {
      const delta = newQty - real.quantity
      if (delta !== 0) ordersStore.updateQuantity(tableId, menuItemId, delta)
    }
  })
  stagedQuantities.value = {}
  showCancelModal.value = false
  // Si el carrito quedó vacío (todos los ítems eliminados), no hay nada que
  // re-enviar a cocina — solo volvemos al paso 1
  if (tableCart.value.length === 0) {
    ordersStore.removeFromKitchen(tableId)
    router.push({ query: {} })
  } else {
    handleSendToKitchen()
  }
}

function dismissCancel() {
  showCancelModal.value = false
  cancelReason.value = ''
}

function resetOrderState() {
  // Descarta staged sin tocar el store → el carrito original queda intacto
  stagedQuantities.value = {}
  showCancelModal.value = false
  cancelReason.value = ''
}

// Descartar staged al volver al step 1, sea cual sea la causa
// (goBack, closeTable, handleSendToKitchen, botón atrás del navegador)
watch(currentStep, (step) => {
  if (step === 1) resetOrderState()
})

const handleScroll = () => {}
onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <!-- ── Step 1: Selección de mesa ─────────────────────────────────────────── -->
  <div v-if="currentStep === 1" class="flex flex-col items-center justify-start min-h-full px-6 py-12">
    <div class="w-full max-w-2xl">

      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-2xl font-semibold text-gray-900">{{ t('orders.title') }}</h1>
        <p class="text-sm text-gray-500 mt-2">{{ t('orders.subtitle') }}</p>
      </div>

      <!-- Mesa seleccionada pero aún no abierta (pendiente de confirmar) -->
      <div v-if="pendingTable" class="mb-10">
        <div class="flex items-center justify-between px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl mb-4">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
            </svg>
            <span class="text-sm font-medium text-orange-700">
              {{ t('orders.tableLabel') }} {{ pendingTable.number }} · {{ pendingTable.seats }} {{ t('orders.seats') }}
            </span>
          </div>
          <button
            @click="clearPendingTable"
            class="text-xs text-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
          >
            {{ t('orders.closeTable') }}
          </button>
        </div>

        <button
          @click="generateTable"
          :disabled="isGeneratingTable"
          class="w-full py-3.5 rounded-xl font-semibold text-sm bg-orange-500 hover:bg-orange-600 text-white transition-all cursor-pointer disabled:opacity-60"
        >
          <span v-if="isGeneratingTable" class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            {{ t('orders.generating') }}
          </span>
          <span v-else>{{ t('orders.continueTable') }} {{ pendingTable.number }}</span>
        </button>
      </div>

      <!-- Contenido principal: mesas en curso + disponibles -->
      <template v-else>

        <!-- Mesas en curso (on-dine) -->
        <div v-if="onDineTables.length > 0" class="mb-8">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{{ t('orders.activeTables') }}</h2>
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <button
              v-for="table in onDineTables"
              :key="table.id"
              @click="goToOnDineTable(table)"
              class="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 py-4 px-3 transition-all cursor-pointer bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
            >
              <div class="relative">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
                </svg>
                <!-- Indicador cocina -->
                <span
                  v-if="ordersStore.isInKitchen(table.id)"
                  class="absolute -top-1.5 -right-2 text-sm leading-none"
                  title="En cocina"
                >🔥</span>
              </div>
              <span class="text-sm font-medium">{{ t('orders.tableLabel') }} {{ table.number }}</span>
              <span class="text-xs text-orange-500">
                {{ ordersStore.getItemCount(table.id) > 0
                  ? `${ordersStore.getItemCount(table.id)} items`
                  : `${table.seats} ${t('orders.seats')}` }}
              </span>
              <span
                v-if="ordersStore.isInKitchen(table.id)"
                class="text-[10px] font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full"
              >
                {{ t('orders.cookingStatus') }}
              </span>
            </button>
          </div>
        </div>

        <!-- Mesas disponibles -->
        <div>
          <h2 v-if="onDineTables.length > 0" class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{{ t('orders.availableTables') }}</h2>

          <div v-if="availableTables.length > 0" class="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-10">
            <button
              v-for="table in availableTables"
              :key="table.id"
              @click="selectTable(table)"
              :class="[
                'flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 py-4 px-3 transition-all cursor-pointer',
                'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              ]"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
              </svg>
              <span class="text-sm font-medium">{{ t('orders.tableLabel') }} {{ table.number }}</span>
              <span class="text-xs text-gray-400">{{ table.seats }} {{ t('orders.seats') }}</span>
            </button>
          </div>

          <!-- Estado vacío: no hay mesas disponibles -->
          <div v-else-if="onDineTables.length === 0" class="flex flex-col items-center justify-center py-12 text-center mb-10">
            <svg class="w-10 h-10 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
            </svg>
            <p class="text-gray-500 text-sm font-medium">{{ t('orders.noTablesAvailable') }}</p>
          </div>
        </div>

      </template>
    </div>
  </div>

  <!-- ── Step 2: Productos + Pedido ─────────────────────────────────────────── -->
  <div v-else-if="currentStep === 2" class="flex flex-col lg:flex-row gap-0 min-h-0 flex-1">

    <!-- ── Columna productos ───────────────────────────────────────────────── -->
    <div class="flex-1 min-w-0 flex flex-col gap-6 p-6 overflow-y-auto">

      <!-- Header con info de mesa y botón volver -->
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          {{ t('common.back') }}
        </button>
        <div class="h-4 w-px bg-gray-200" />
        <span class="text-sm font-medium text-gray-700">
          {{ t('orders.tableLabel') }} {{ selectedTable?.number }} · {{ selectedTable?.seats }} {{ t('orders.seats') }}
        </span>
      </div>

      <!-- Categorías + búsqueda + grid -->
      <section>
        <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('products.categories') }}</h2>
        <categories-slider @category-change="onCategoryChange" />

        <div class="flex items-center gap-3 mb-6">
          <div class="flex-1 relative">
            <input
              type="text"
              v-model="searchQuery"
              :placeholder="t('products.searchMenuPlaceholder')"
              class="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-600"
              autocomplete="off"
            />
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="filteredMenuItems.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
          <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p class="text-gray-500 font-medium">No se encontraron resultados para "{{ searchQuery }}"</p>
          <p class="text-gray-400 text-sm mt-1">Prueba con otro nombre o categoría</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            v-for="item in filteredMenuItems"
            :key="item.id"
            @click="addToOrder(item)"
            :class="[
              'bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col relative',
              item.width === 2 ? 'sm:col-span-2 xl:col-span-2' : '',
              itemQtyInCart(item.id) > 0 ? 'ring-2 ring-orange-400' : ''
            ]"
          >
            <!-- Badge cantidad en pedido -->
            <span
              v-if="itemQtyInCart(item.id) > 0"
              class="absolute top-3 left-3 z-10 w-7 h-7 bg-orange-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow"
            >
              {{ itemQtyInCart(item.id) }}
            </span>

            <div :class="['relative bg-gray-200 shrink-0', item.width === 2 ? 'h-64 xl:h-80' : 'h-48']">
              <video v-if="item.video" :src="item.video" autoplay loop muted playsinline class="w-full h-full object-cover"/>
              <img v-else :src="item.image" :alt="item.name" class="w-full h-full object-cover"/>
              <span v-if="item.badge" class="absolute top-3 right-3 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                {{ item.badge }}
              </span>
            </div>
            <div class="p-4 flex flex-col flex-1">
              <div class="mb-3">
                <h3 class="font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
                <p class="text-xs text-gray-500">{{ item.category }}</p>
              </div>
              <div class="flex items-center justify-between mt-auto">
                <span class="text-lg font-bold text-gray-900">{{ item.price.toFixed(2) }}€</span>
                <!-- Botón añadir visual -->
                <span class="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold shadow-sm">+</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ── Panel pedido (lateral en desktop, parte inferior en mobile) ──────── -->
    <OrderPanel
      :items="displayCart"
      :total="displayTotal"
      :can-send="hasChangesToSend"
      :needs-reason="needsReason"
      @close-table="closeTable"
      @decrease="decreaseItem"
      @increase="increaseItem"
      @remove="removeItem"
      @send="onSendButtonClick"
    />

  </div>

  <!-- ── Modal: motivo de cancelación ──────────────────────────────────────── -->
  <BaseModal :open="showCancelModal" @dismiss="dismissCancel">

    <!-- Icono + título -->
    <div class="flex items-start gap-3">
      <span class="text-2xl leading-none mt-0.5">⚠️</span>
      <div>
        <h3 class="font-semibold text-gray-900 text-base">{{ t('orders.cancelReasonTitle') }}</h3>
        <p class="text-sm text-gray-500 mt-0.5">{{ t('orders.cancelReasonSubtitle') }}</p>
      </div>
    </div>

    <!-- Input motivo -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">
        {{ t('orders.cancelReasonLabel') }}
      </label>
      <textarea
        v-model="cancelReason"
        :placeholder="t('orders.cancelReasonPlaceholder')"
        rows="3"
        autofocus
        class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
      />
      <p
        :class="[
          'text-xs transition-colors',
          cancelReason.trim().length === 0 ? 'text-gray-400'
          : cancelReasonValid ? 'text-green-500'
          : 'text-amber-500'
        ]"
      >
        {{ cancelReason.trim().length }}/3 {{ t('orders.cancelReasonMinChars') }}
      </p>
    </div>

    <!-- Acciones -->
    <div class="flex gap-2">
      <button
        @click="dismissCancel"
        class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        @click="confirmCancel"
        :disabled="!cancelReasonValid"
        :class="[
          'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all',
          cancelReasonValid
            ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        ]"
      >
        {{ t('orders.cancelReasonConfirm') }}
      </button>
    </div>

  </BaseModal>

</template>
