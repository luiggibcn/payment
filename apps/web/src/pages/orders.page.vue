<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTablesStore, type RestaurantTable } from '@/stores/tables.store'
import CategoriesSlider from '@/components/products/CategoriesSlider.vue'
import FeaturedGrid from '@/components/products/FeaturedGrid.vue'

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
const tablesStore = useTablesStore()

// ── Multi-step ────────────────────────────────────────────────────────────────
// Step 1: seleccionar mesa | Step 2: productos
const currentStep = ref<1 | 2>(1)

// ── Step 1: selección de mesa ─────────────────────────────────────────────────
const selectedTable = ref<RestaurantTable | null>(null)
const isGeneratingTable = ref(false)

const availableTables = computed(() =>
  tablesStore.tables.filter(t => t.status === 'available')
)

function selectTable(table: RestaurantTable) {
  selectedTable.value = table
}

async function generateTable() {
  if (!selectedTable.value) return
  isGeneratingTable.value = true
  try {
    // TODO: generar QR para la mesa seleccionada usando selectedTable.value
    await new Promise(resolve => setTimeout(resolve, 800)) // simular latencia
    tablesStore.updateTable(selectedTable.value.id, { status: 'on-dine' })
    currentStep.value = 2
  } finally {
    isGeneratingTable.value = false
  }
}

// Solo navega al step anterior, conserva el estado de la mesa en el store
function goBack() {
  currentStep.value = 1
}

// Libera la mesa activa y vuelve al step 1 sin ninguna mesa seleccionada
function closeTable() {
  if (selectedTable.value) {
    tablesStore.updateTable(selectedTable.value.id, { status: 'available' })
  }
  selectedTable.value = null
  currentStep.value = 1
}

// ── Step 2: productos ─────────────────────────────────────────────────────────
const searchQuery = ref('')
const selectedCategory = ref('all')
const isScrolled = ref(false)

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

const handleScroll = () => { isScrolled.value = window.scrollY > 10 }
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

      <!-- Mesa activa: el usuario volvió desde el step 2 -->
      <div v-if="selectedTable" class="mb-10">
        <div class="flex items-center justify-between px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl mb-4">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
            </svg>
            <span class="text-sm font-medium text-orange-700">
              {{ t('orders.tableLabel') }} {{ selectedTable.number }} · {{ selectedTable.seats }} {{ t('orders.seats') }}
            </span>
          </div>
          <button
            @click="closeTable"
            class="text-xs text-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
          >
            {{ t('orders.closeTable') }}
          </button>
        </div>

        <button
          @click="currentStep = 2"
          class="w-full py-3.5 rounded-xl font-semibold text-sm bg-orange-500 hover:bg-orange-600 text-white transition-all cursor-pointer"
        >
          {{ t('orders.continueTable') }} {{ selectedTable.number }}
        </button>
      </div>

      <!-- Grid de mesas disponibles (solo cuando no hay mesa activa) -->
      <template v-else>
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
        <div v-else class="flex flex-col items-center justify-center py-12 text-center mb-10">
          <svg class="w-10 h-10 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
          </svg>
          <p class="text-gray-500 text-sm font-medium">{{ t('orders.noTablesAvailable') }}</p>
        </div>

        <!-- Botón generar mesa -->
        <button
          @click="generateTable"
          :disabled="!selectedTable || isGeneratingTable"
          :class="[
            'w-full py-3.5 rounded-xl font-semibold text-sm transition-all',
            selectedTable && !isGeneratingTable
              ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          ]"
        >
          <span v-if="isGeneratingTable" class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            {{ t('orders.generating') }}
          </span>
          <span v-else>{{ t('orders.selectTableFirst') }}</span>
        </button>
      </template>
    </div>
  </div>

  <!-- ── Step 2: Productos ──────────────────────────────────────────────────── -->
  <div v-else-if="currentStep === 2" class="flex flex-col gap-6 p-6 min-h-0 flex-1">

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

    <!-- Sección productos (mismo patrón que products.page.vue) -->
    <section>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('products.currentOrder') }}</h2>
      <featured-grid />
    </section>

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

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <div
          v-for="item in filteredMenuItems"
          :key="item.id"
          :class="[
            'bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer flex flex-col',
            item.width === 2 ? 'sm:col-span-2 xl:col-span-2 2xl:col-span-2' : ''
          ]"
        >
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
              <p class="text-xs text-gray-500">
                {{ item.category }}
                <span v-if="item.badge" class="text-amber-600">· {{ item.badge }}</span>
              </p>
            </div>
            <div class="flex items-center justify-between mt-auto">
              <span class="text-lg font-bold text-gray-900">${{ item.price.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
