<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Sticky -->
    <header 
      class="sticky top-0 z-50 bg-white border-b border-gray-200 transition-shadow"
      :class="{ 'shadow-md': isScrolled }"
    >
      <div class="flex items-center justify-between px-6 py-4">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="sm:w-12 sm:h-12 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 sm:rounded-xl rounded-md flex items-center justify-center">
            <svg class="sm:w-7 sm:h-7 w-4 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span class="sm:text-xl text-sm font-bold text-gray-900">Payment4You</span>
        </div>

        <!-- Navigation -->
        <nav class="hidden lg:flex items-center gap-1">
          <button class="px-4 py-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </span>
          </button>

          <button class="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Menu
            </span>
          </button>

          <button class="px-4 py-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Stock
            </span>
          </button>

          <button class="px-4 py-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Table
            </span>
          </button>

          <button class="px-4 py-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </span>
          </button>

          <button class="px-4 py-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </span>
          </button>
        </nav>

        <!-- Right Section: Language Selector + User Profile -->
        <div class="flex items-center gap-3">
          <!-- Language Selector -->
          <div class="relative" ref="languageDropdownRef">
            <button 
              @click="toggleLanguageDropdown"
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <span class="text-xl">{{ selectedLanguage.flag }}</span>
              <span class="hidden md:inline text-sm font-medium text-gray-700">{{ selectedLanguage.code }}</span>
              <svg 
                class="w-4 h-4 text-gray-500 transition-transform"
                :class="{ 'rotate-180': isLanguageDropdownOpen }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div 
                v-show="isLanguageDropdownOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                <button
                  v-for="language in languages"
                  :key="language.code"
                  @click="selectLanguage(language)"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                  :class="{ 'bg-emerald-50': selectedLanguage.code === language.code }"
                >
                  <span class="text-xl">{{ language.flag }}</span>
                  <span class="text-sm font-medium text-gray-700">{{ language.name }}</span>
                  <svg 
                    v-if="selectedLanguage.code === language.code"
                    class="w-4 h-4 text-emerald-600 ml-auto" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </transition>
          </div>

          <!-- User Profile -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-300 overflow-hidden cursor-pointer">
              <img src="https://placehold.co/40" alt="Sania" class="w-full h-full object-cover" />
            </div>
            <div class="hidden md:block">
              <p class="text-sm font-medium text-gray-900">Sania</p>
              <p class="text-xs text-gray-500">Webber</p>
            </div>
            <button class="p-1 hover:bg-gray-100 rounded cursor-pointer">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex flex-col xl:flex-row gap-6 p-6">
      <!-- Left Section - Menu & Orders -->
      <div class="flex-1 space-y-6">
        <!-- Current Order Section -->
        <section>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Current order</h2>
          <!-- Order Cards Grid -->
          <featured-grid />
        </section>

        <!-- Menu Section -->
        <section>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
          <categories-slider />

          <!-- Search & Filter -->
          <div class="flex items-center gap-3 mb-6">
            <div class="flex-1 relative">
              <input 
                type="text" 
                v-model="searchQuery"
                placeholder="Search menu" 
                class="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-600"
              />
              <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button class="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>

          <!-- Menu Items Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            <!-- Menu Item Card -->
            <div 
              v-for="item in menuItems" 
              :key="item.id"
              class="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div class="relative h-48 bg-gray-200">
                <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                <span 
                  v-if="item.badge"
                  class="absolute top-3 right-3 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {{ item.badge }}
                </span>
              </div>
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
                    <p class="text-xs text-gray-500">{{ item.category }} <span v-if="item.badge" class="text-amber-600">• {{ item.badge }}</span></p>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-bold text-gray-900">${{ item.price.toFixed(2) }}</span>
                  <div class="flex items-center gap-2">
                    <button 
                      class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                      @click.stop="handleDecrement(item)"
                    >
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span class="w-8 text-center font-medium text-gray-600">{{ getItemQuantity(item.id) }}</span>
                    <button 
                      class="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
                      @click.stop="handleIncrement(item)"
                    >
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Section - Order Details -->
      <aside class="w-full xl:w-96 2xl:w-[420px] shrink-0">
        <div class="bg-white rounded-2xl p-6 xl:sticky xl:top-24">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Order details</h2>

          <!-- Order Type Tabs -->
          <div class="flex gap-2 mb-6">
            <button 
              :class="[
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                orderType === 'dine-in' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
              @click="orderType = 'dine-in'"
            >
              Dine-in
            </button>
            <button 
              :class="[
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                orderType === 'takeaway' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
              @click="orderType = 'takeaway'"
            >
              Takeaway
            </button>
            <button 
              :class="[
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                orderType === 'delivery' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
              @click="orderType = 'delivery'"
            >
              Delivery
            </button>
          </div>

          <!-- Customer Info -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Customer name</label>
              <input 
                type="text" 
                v-model="customerName"
                placeholder="Enter name" 
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Table number</label>
              <input 
                type="text" 
                v-model="tableNumber"
                :disabled="true"
                placeholder="04" 
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          <!-- Ordered Items -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-900">Ordered menu</h3>
              <span class="text-sm text-gray-500">{{ cart.itemCount }} Items</span>
            </div>

            <div class="space-y-4 max-h-64 overflow-y-auto">
              <div 
                v-for="item in cart.items" 
                :key="item.id"
                class="flex items-start gap-3"
              >
                <img :src="item.image" :alt="item.name" class="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 text-sm">{{ item.name }}</h4>
                  <p class="text-xs text-gray-500 mb-2">${{ item.price.toFixed(2) }} ×{{ item.quantity }}</p>
                  <div class="flex items-center gap-2">
                    <button 
                      class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                      @click="cart.decrement(item.id)"
                    >
                      <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span class="text-sm font-medium w-6 text-center text-gray-600">{{ item.quantity }}</span>
                    <button 
                      class="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
                      @click="cart.increment(item)"
                    >
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button 
                      class="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      @click="cart.removeProduct(item.id)"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <span class="font-semibold text-gray-900 text-sm shrink-0">${{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Details -->
          <div class="border-t border-gray-200 pt-4 mb-6 space-y-3">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Payment Details</h3>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-medium text-gray-900">${{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Taxes</span>
              <span class="font-medium text-gray-900">{{ cart.taxRate }}%</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Additional fee</span>
              <span class="font-medium text-gray-900">-</span>
            </div>
            <div class="flex items-center justify-between text-base font-semibold pt-3 border-t border-gray-200">
              <span class="text-gray-900">Total</span>
              <span class="text-gray-900">${{ cart.total.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Confirm Button -->
          <button class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors cursor-pointer">
            Confirm
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCartStore, type CartProduct } from '@/stores/cart.store'
import FeaturedGrid from '@/components/products/FeaturedGrid.vue'
import CategoriesSlider from '@/components/products/CategoriesSlider.vue'

// Cart store
const cart = useCartStore()

// Scroll state
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// Language selector
interface Language {
  code: string
  name: string
  flag: string
}

const languages = ref<Language[]>([
  { code: 'EN', name: 'English', flag: '🇬🇧' },
  { code: 'ES', name: 'Español', flag: '🇪🇸' },
  { code: 'CA', name: 'Català', flag: '🏴' },
  { code: 'FR', name: 'Français', flag: '🇫🇷' },
  { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'IT', name: 'Italiano', flag: '🇮🇹' },
])

const selectedLanguage = ref<Language>(languages.value[1]) // Español por defecto
const isLanguageDropdownOpen = ref(false)
const languageDropdownRef = ref<HTMLElement | null>(null)

const toggleLanguageDropdown = () => {
  isLanguageDropdownOpen.value = !isLanguageDropdownOpen.value
}

const selectLanguage = (language: Language) => {
  selectedLanguage.value = language
  isLanguageDropdownOpen.value = false
  console.log('Language changed to:', language.code)
}

// Cerrar dropdown al hacer click fuera
const handleClickOutside = (event: MouseEvent) => {
  if (languageDropdownRef.value && !languageDropdownRef.value.contains(event.target as Node)) {
    isLanguageDropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
  customerName.value = cart.userCart?.email ?? 'Domeniko'
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})

const searchQuery = ref('')

// Menu items (mock data)
const menuItems = ref<CartProduct[]>([
  { id: 1, name: 'Crispy Calamari', category: 'Appetizer', price: 22.90, image: 'https://placehold.net/1.png', badge: 'Best seller' },
  { id: 2, name: 'Chicken Tofu Soup', category: 'Soup', price: 12.90, image: 'https://placehold.net/2.png', badge: 'Best seller' },
  { id: 3, name: 'Quinoa Salad', category: 'Salads', price: 4.90, image: 'https://placehold.net/3.png', badge: 'Best seller' },
  { id: 4, name: 'Beef Wellington', category: 'Main Course', price: 22.50, image: 'https://placehold.net/4.png', badge: 'Best seller' },
  { id: 5, name: 'Seafood Tempting', category: 'Main Course', price: 18.90, image: 'https://placehold.net/5.png', badge: null },
  { id: 6, name: 'Melting Brownie', category: 'Dessert', price: 8.50, image: 'https://placehold.net/6.png', badge: null },
  { id: 7, name: 'Cheesy Pizza', category: 'Italian', price: 15.90, image: 'https://placehold.net/7.png', badge: null },
  { id: 8, name: 'Matcha Ice Cream', category: 'Dessert', price: 6.90, image: 'https://placehold.net/8.png', badge: null },
])

// Cart actions
const handleIncrement = (product: CartProduct) => {
  cart.increment(product)
}

const handleDecrement = (product: CartProduct) => {
  cart.decrement(product.id)
}

const getItemQuantity = (productId: CartProduct['id']): number => {
  const item = cart.findItem(productId)
  return item ? item.quantity : 0
}

// Order details
const orderType = ref('dine-in')
const customerName = ref('Darius Sinarmulla')
const tableNumber = ref('04')
</script>