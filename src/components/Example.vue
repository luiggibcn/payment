<script lang="ts" setup>
import { computed, ref } from 'vue'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
}

const searchProducts = ref('')
const searchExisting = ref('')
const selectedCategory = ref('All Category')
const selectedBrand = ref('Select Brand')
const selectedDining = ref('Select Dining')
const selectedTable = ref('Select Table')
const activeTab = ref('Show All')

// Estados para mobile
const isSidebarOpen = ref(false)
const isCartOpen = ref(false)

const cartItems = ref<CartItem[]>([
  { id: '1', name: 'Fresh Basil Salad', price: 10, quantity: 2 },
  { id: '2', name: 'Fresh Basil Salad', price: 10, quantity: 2 },
  { id: '3', name: 'Fresh Basil Salad', price: 10, quantity: 2 }
])

const products = ref<Product[]>([
  { id: '1', name: 'Shrimp Basil Salad', price: 10, image: 'https://placehold.net/1.png', category: 'Salads' },
  { id: '2', name: 'Onion Rings', price: 10, image: 'https://placehold.net/2.png', category: 'Beverages' },
  { id: '3', name: 'Smoked Bacon', price: 10, image: 'https://placehold.net/3.png', category: 'Rice' },
  { id: '4', name: 'Fresh Tomatoes', price: 10, image: 'https://placehold.net/4.png', category: 'Salads' },
  { id: '5', name: 'Chicken Burger', price: 10, image: 'https://placehold.net/5.png', category: 'Rice' },
  { id: '6', name: 'Red Onion Rings', price: 10, image: 'https://placehold.net/6.png', category: 'Beverages' },
  { id: '7', name: 'Beef Burger', price: 10, image: 'https://placehold.net/7.png', category: 'Rice' },
  { id: '8', name: 'Grilled Burger', price: 10, image: 'https://placehold.net/8.png', category: 'Rice' },
  { id: '9', name: 'Grilled Burger', price: 10, image: 'https://placehold.net/9.png', category: 'Rice' },
  { id: '10', name: 'Grilled Burger', price: 10, image: 'https://placehold.net/10.png', category: 'Rice' },
])

const categories = ['Show All', 'Rice', 'Beverages', 'Salads', 'Soup', 'Pizza']

const subtotal = ref(1250)
const productDiscount = ref(240)
const extraDiscount = ref(0)
const couponDiscount = ref(0)

const total = ref(4500)

const updateQuantity = (item: CartItem, change: number) => {
  item.quantity += change
  if (item.quantity < 1) item.quantity = 1
}

const removeItem = (id: string) => {
  cartItems.value = cartItems.value.filter(item => item.id !== id)
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}

const cartItemCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Mobile Menu Button -->
    <button 
      @click="toggleSidebar"
      class="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg cursor-pointer"
    >
      <span class="text-2xl text-black lh-0">☰</span>
    </button>

    <!-- Overlay para mobile -->
    <div 
      v-if="isSidebarOpen || isCartOpen"
      @click="isSidebarOpen = false; isCartOpen = false"
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
    ></div>
    <!-- Sidebar -->
    <aside 
      :class="[
        'w-56 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 z-50',
        'lg:relative lg:translate-x-0',
        'fixed inset-y-0 left-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Close button for mobile -->
      <button 
        @click="toggleSidebar"
        class="lg:hidden absolute top-4 right-4 text-2xl text-gray-600 cursor-pointer"
      >
        ✕
      </button>

      <!-- Logo -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">R</span>
          </div>
          <span class="font-bold text-gray-900 text-lg">RogerApp</span>
        </div>
      </div>

      <!-- User Profile -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <img src="https://placehold.co/40" alt="User" class="w-10 h-10 rounded-full">
          <div>
            <p class="font-semibold text-gray-900 text-sm">Saiful Talukdar</p>
            <p class="text-xs text-gray-500">Product Designer</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
          <i class="w-5 h-5">📊</i>
          <span class="text-sm">Dashboard</span>
        </a>
        <a href="#" class="flex items-center gap-3 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg">
          <i class="w-5 h-5">🛒</i>
          <span class="text-sm font-medium">Pos</span>
        </a>
        <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
          <i class="w-5 h-5">🍽️</i>
          <span class="text-sm">Table</span>
        </a>
        <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
          <i class="w-5 h-5">📅</i>
          <span class="text-sm">Reservations</span>
        </a>

        <div class="pt-4">
          <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Offering</p>
          <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <i class="w-5 h-5">🚚</i>
            <span class="text-sm">Delivery Executive</span>
          </a>
          <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg relative">
            <i class="w-5 h-5">💳</i>
            <span class="text-sm">Payments</span>
            <span class="ml-auto px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">New</span>
          </a>
          <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <i class="w-5 h-5">👤</i>
            <span class="text-sm">Customer</span>
          </a>
          <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <i class="w-5 h-5">🧾</i>
            <span class="text-sm">Invoice</span>
          </a>
        </div>

        <div class="pt-4">
          <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Back Office</p>
          <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <i class="w-5 h-5">⭐</i>
            <span class="text-sm">Testimonial</span>
          </a>
          <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <i class="w-5 h-5">👥</i>
            <span class="text-sm">User</span>
          </a>
          <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <i class="w-5 h-5">📈</i>
            <span class="text-sm">Reports</span>
          </a>
          <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <i class="w-5 h-5">⚙️</i>
            <span class="text-sm">Setting</span>
          </a>
        </div>
      </nav>

      <!-- Logout -->
      <div class="p-4 border-t border-gray-200">
        <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
          <i class="w-5 h-5">🚪</i>
          <span class="text-sm">Login</span>
        </a>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <!-- Espaciador para el botón de menú en mobile -->
          <div class="w-10 lg:hidden"></div>
          
          <div class="flex-1 max-w-md mx-4">
            <div class="relative">
              <input 
                type="text" 
                placeholder="Search" 
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
              <i class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</i>
            </div>
          </div>
          
          <div class="flex items-center gap-2 lg:gap-4">
            <button class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg hidden lg:block">
              <i class="w-6 h-6">☀️</i>
            </button>
            <img src="https://placehold.co/40" alt="User" class="w-8 h-8 lg:w-10 lg:h-10 rounded-full">
          </div>
        </div>
      </header>

      <div class="flex-1 flex overflow-hidden relative">
        <!-- Products Section -->
        <section class="flex-1 overflow-y-auto p-4 lg:p-8">
          <!-- Page Title -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-4">
            <div>
              <h1 class="text-xl lg:text-2xl font-bold text-gray-900">Point of Sale (POS)</h1>
              <p class="text-sm text-gray-500">Dashboard • Pos</p>
            </div>
            
            <!-- Action buttons - diferentes layouts para mobile/desktop -->
            <div class="hidden lg:flex gap-3">
              <button class="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 flex items-center gap-2 text-sm cursor-pointer">
                <span>+</span> New
              </button>
              <button class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm cursor-pointer">
                <i>📱</i> QR Menu Orders
              </button>
              <button class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm cursor-pointer">
                <i>📋</i> Draft List
              </button>
              <button class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm cursor-pointer">
                <i>🍽️</i> Table Order
              </button>
            </div>

            <!-- Mobile: Solo botón New -->
            <div class="flex lg:hidden gap-2">
              <button class="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 flex items-center justify-center gap-2 text-sm">
                <span>+</span> New
              </button>
              <button class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                <i>⋯</i>
              </button>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 mb-4 lg:mb-6">
            <!-- Search and selects -->
            <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4 mb-4">
              <div class="flex-1 relative">
                <input 
                  type="text" 
                  v-model="searchProducts"
                  placeholder="Search in products" 
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                <i class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</i>
              </div>
              
              <div class="flex gap-3">
                <select v-model="selectedCategory" class="flex-1 lg:flex-none px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
                  <option>All Category</option>
                  <option>Rice</option>
                  <option>Beverages</option>
                  <option>Salads</option>
                </select>
                <select v-model="selectedBrand" class="flex-1 lg:flex-none px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
                  <option>Select Brand</option>
                </select>
              </div>
            </div>

            <!-- Category Tabs - Scrollable en mobile -->
            <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                v-for="category in categories" 
                :key="category"
                @click="activeTab = category"
                :class="[
                  'px-3 lg:px-4 py-2 rounded-lg font-medium text-xs lg:text-sm transition-colors whitespace-nowrap flex-shrink-0',
                  activeTab === category 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ category }}
              </button>
            </div>
          </div>

          <!-- Product Grid - Responsive -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 pb-20 lg:pb-4">
            <div 
              v-for="product in products" 
              :key="product.id"
              class="bg-white rounded-xl border border-gray-200 p-3 lg:p-4 hover:shadow-lg transition-shadow cursor-pointer relative"
            >
              <div class="aspect-square bg-gray-100 rounded-lg mb-2 lg:mb-3 flex items-center justify-center overflow-hidden">
                <img :src="product.image" :alt="product.name" class="w-full h-full object-cover">
              </div>
              <h3 class="font-medium text-gray-900 text-xs lg:text-sm mb-1 line-clamp-1">{{ product.name }}</h3>
              <p class="text-orange-500 font-semibold text-sm lg:text-base">${{ product.price.toFixed(2) }}</p>
              <button class="absolute bottom-3 lg:bottom-4 right-3 lg:right-4 w-7 h-7 lg:w-8 lg:h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 text-sm lg:text-base cursor-pointer">
                +
              </button>
            </div>
          </div>
        </section>

        <!-- Cart Section - Sidebar en desktop, modal en mobile -->
        <aside 
          :class="[
            'bg-white border-l border-gray-200 flex flex-col transition-transform duration-300 z-40',
            'lg:w-96 lg:relative lg:translate-x-0',
            'fixed inset-y-0 right-0 w-full sm:w-96',
            isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          ]"
        >
          <!-- Close button for mobile -->
          <button 
            @click="toggleCart"
            class="lg:hidden absolute top-4 right-4 text-2xl text-gray-600 z-10"
          >
            ✕
          </button>

          <div class="p-4 lg:p-6 border-b border-gray-200">
            <div class="relative mb-4">
              <input 
                type="text" 
                v-model="searchExisting"
                placeholder="Search in Existing" 
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
              <i class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</i>
            </div>
            <div class="flex gap-2">
              <select v-model="selectedDining" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs lg:text-sm">
                <option disabled value="">Please select one</option>
                <option>Select Dining</option>
              </select>
              <select v-model="selectedTable" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs lg:text-sm">
                <option>Select Table</option>
              </select>
            </div>
          </div>

          <!-- Order Header -->
          <div class="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
            <div class="flex items-center gap-2">
              <i class="text-gray-700">👤</i>
              <span class="font-semibold text-gray-900 text-sm lg:text-base">Order #20</span>
            </div>
          </div>

          <!-- Cart Items -->
          <div class="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            <div 
              v-for="item in cartItems" 
              :key="item.id"
              class="pb-4 border-b border-gray-200"
            >
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-medium text-gray-900 text-sm">{{ item.name }}</h4>
                <button @click="removeItem(item.id)" class="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 flex-shrink-0">
                  🗑️
                </button>
              </div>
              <p class="text-orange-500 text-xs lg:text-sm font-medium mb-3">
                ${{ item.price.toFixed(2) }} × {{ item.quantity }}=${{ (item.price * item.quantity).toFixed(2) }}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 lg:gap-3">
                  <button 
                    @click="updateQuantity(item, -1)"
                    class="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span class="font-medium text-gray-900 text-sm">{{ item.quantity }}</span>
                  <button 
                    @click="updateQuantity(item, 1)"
                    class="w-8 h-8 bg-orange-500 text-white rounded flex items-center justify-center hover:bg-orange-600"
                  >
                    +
                  </button>
                </div>
                <button class="text-xs lg:text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  <i>📝</i> <span class="hidden sm:inline">Add Notes</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Cart Summary -->
          <div class="p-4 lg:p-6 border-t border-gray-200 space-y-2 lg:space-y-3">
            <div class="flex justify-between text-xs lg:text-sm">
              <span class="text-gray-600">Sub total :</span>
              <span class="font-semibold text-gray-900">{{ subtotal }}$</span>
            </div>
            <div class="flex justify-between text-xs lg:text-sm">
              <span class="text-gray-600">Product Discount :</span>
              <span class="font-semibold text-gray-900">{{ productDiscount }}$</span>
            </div>
            <div class="flex justify-between text-xs lg:text-sm">
              <span class="text-gray-600">Extra Discount :</span>
              <div class="flex items-center gap-2">
                <i class="text-gray-400 text-xs">✏️</i>
                <span class="font-semibold text-gray-900">{{ extraDiscount.toFixed(2) }}$</span>
              </div>
            </div>
            <div class="flex justify-between text-xs lg:text-sm">
              <span class="text-gray-600">Coupon discount :</span>
              <div class="flex items-center gap-2">
                <i class="text-gray-400 text-xs">✏️</i>
                <span class="font-semibold text-gray-900">{{ couponDiscount.toFixed(2) }}$</span>
              </div>
            </div>
            <div class="flex justify-between text-base lg:text-lg font-bold pt-2 lg:pt-3 border-t border-gray-200">
              <span class="text-gray-900">Total :</span>
              <span class="text-gray-900">{{ total }}$</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="p-4 lg:p-6 space-y-2 lg:space-y-3 border-t border-gray-200">
            <div class="flex gap-2 lg:gap-3">
              <button class="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 text-xs lg:text-sm">
                KOT & Print
              </button>
              <button class="px-3 lg:px-4 py-2 lg:py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                <i>📋</i> <span class="hidden sm:inline">Draft</span>
              </button>
            </div>
            <div class="flex gap-2 lg:gap-3">
              <button class="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 text-xs lg:text-sm">
                Bill & Payment
              </button>
              <button class="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 text-xs lg:text-sm">
                Bill & Print
              </button>
            </div>
          </div>
        </aside>
      </div>

      <!-- Mobile Cart Button - Floating -->
      <button 
        @click="toggleCart"
        class="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 z-30 cursor-pointer"
      >
        <span class="text-2xl">🛒</span>
        <span 
          v-if="cartItemCount > 0"
          class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
        >
          {{ cartItemCount }}
        </span>
      </button>
    </main>
  </div>
</template>

<style lang="scss" scoped>
// Ocultar scrollbar en los tabs de categorías
.bg-opacity-50 {
    background-color: rgba(0,0,0,.5);
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

// Truncate text con line-clamp
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Estilos personalizados para scrollbars
.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
    
    &:hover {
      background: #555;
    }
  }
}
.lh-0 {
    line-height: 0;
}
</style>
