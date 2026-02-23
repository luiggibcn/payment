<template>
  <div class="min-h-screen bg-gray-50 flex">

    <!-- ===== SIDEBAR ESQUERRA ===== -->
    <aside
      :class="[
        'flex flex-col bg-white border-r border-gray-200 shrink-0 transition-all duration-300 ease-in-out',
        sidebarOpen ? 'md:w-60 w-full' : 'w-16'
      ]"
      class="sticky top-0 h-screen z-40 overflow-hidden"
    >
      <!-- Logo + toggle -->
      <div class="flex items-center h-16 px-3 border-b border-gray-100 shrink-0"
        :class="sidebarOpen ? 'justify-between' : 'justify-center'">
        <div v-if="sidebarOpen" class="flex items-center gap-2 overflow-hidden">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span class="font-bold text-gray-900 text-sm whitespace-nowrap">Payment4You</span>
        </div>
        <button @click="sidebarOpen = !sidebarOpen"
          class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer shrink-0">
          <!-- Icona col·lapsar / expandir -->
          <svg v-if="sidebarOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Nav items -->
      <nav class="flex-1 py-4 space-y-1 px-2 overflow-hidden">
        <button v-for="item in navItems" :key="item.key"
          :class="[
            'w-full flex items-center rounded-xl transition-all cursor-pointer group',
            sidebarOpen ? 'px-3 py-2.5 gap-3' : 'px-3 py-2.5',
            item.active
              ? 'bg-orange-50 text-orange-500'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          ]">
          <span class="shrink-0" v-html="item.icon"></span>
          <span v-if="sidebarOpen" class="text-sm font-medium whitespace-nowrap">{{ t(item.labelKey) }}</span>
        </button>
      </nav>

      <!-- Sign out -->
      <div class="px-2 pb-4 shrink-0">
        <button @click="userSignOut"
          :class="[
            'w-full flex items-center rounded-xl transition-all cursor-pointer text-gray-500 hover:bg-red-50 hover:text-red-500',
            sidebarOpen ? 'px-3 py-2.5 gap-3' : 'px-0 py-2.5 justify-center'
          ]">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span v-if="sidebarOpen" class="text-sm font-medium whitespace-nowrap">{{ t('sidebar.signOut') }}</span>
        </button>
      </div>
    </aside>

    <!-- ===== COLUMNA DRETA: header + contingut ===== -->
    <div class="flex-1 flex flex-col min-w-0">

      <!-- Header Sticky -->
      <header class="sticky top-0 z-30 bg-white border-b border-gray-200 transition-shadow"
        :class="{ 'shadow-md': isScrolled }">
        <div class="flex items-center justify-between px-6 py-3 h-16">
          <!-- Títol pàgina -->
          <h1 class="text-lg font-semibold text-gray-900">{{ t('sidebar.menu') }}</h1>

          <!-- Right Section: Cart + Language + User -->
          <div class="flex items-center gap-3">
            <!-- Cart icon -->
            <div class="relative text-black">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span v-if="cart.itemCount > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-bounce">
                {{ cart.itemCount > 99 ? '99+' : cart.itemCount }}
              </span>
            </div>

            <!-- Language Selector -->
            <div class="relative" ref="languageDropdownRef">
              <button @click="toggleLanguageDropdown"
                class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <span class="text-xl">{{ selectedLanguage.flag }}</span>
                <span class="hidden md:inline text-sm font-medium text-gray-700">{{ selectedLanguage.code }}</span>
                <svg class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'rotate-180': isLanguageDropdownOpen }"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <transition enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95">
                <div v-show="isLanguageDropdownOpen"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button v-for="language in languages" :key="language.code" @click="selectLanguage(language)"
                    :disabled="!language.available"
                    class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                    :class="{ 'bg-emerald-50': selectedLanguage.code === language.code, 'hidden': !language.available }">
                    <span class="text-xl">{{ language.flag }}</span>
                    <span class="text-sm font-medium text-gray-700">{{ language.name }}</span>
                    <svg v-if="selectedLanguage.code === language.code" class="w-4 h-4 text-emerald-600 ml-auto"
                      fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </transition>
            </div>

            <!-- User Profile -->
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-full bg-gray-300 overflow-hidden cursor-pointer">
                <img src="https://placehold.co/40" alt="Sania" class="w-full h-full object-cover" />
              </div>
              <div class="hidden md:block">
                <p class="text-sm font-medium text-gray-900 leading-tight">Sania</p>
                <p class="text-xs text-gray-500">Webber</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="flex flex-col xl:flex-row gap-6 p-6">
        <!-- Left Section - Menu & Orders -->
        <div class="flex-1 space-y-6 min-w-0">
          <!-- Current Order Section -->
          <section>
            <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('products.currentOrder') }}</h2>
            <featured-grid />
          </section>

          <!-- Menu Section -->
          <section>
            <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('products.categories') }}</h2>
            <categories-slider @category-change="onCategoryChange" />

            <!-- Search & Filter -->
            <div class="flex items-center gap-3 mb-6">
              <div class="flex-1 relative">
                <input type="text" v-model="searchQuery"
                  :placeholder="t('products.searchMenuPlaceholder')"
                  class="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-600"
                  autocomplete="off" />
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button v-if="searchQuery" @click="searchQuery = ''"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button class="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>

            <!-- Menu Items Grid -->
            <div v-if="filteredMenuItems.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
              <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p class="text-gray-500 font-medium">No se encontraron resultados para "{{ searchQuery }}"</p>
              <p class="text-gray-400 text-sm mt-1">Prueba con otro nombre o categoría</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              <div v-for="item in filteredMenuItems" :key="item.id" :class="[
                'bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer flex flex-col',
                item.width === 2 ? 'sm:col-span-2 xl:col-span-2 2xl:col-span-2' : ''
              ]">
                <div :class="['relative bg-gray-200 shrink-0', item.width === 2 ? 'h-64 xl:h-80' : 'h-48']">
                  <video v-if="item.video" :src="item.video" autoplay loop muted playsinline class="w-full h-full object-cover" />
                  <img v-else :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                  <span v-if="item.badge"
                    class="absolute top-3 right-3 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {{ item.badge }}
                  </span>
                </div>
                <div class="p-4 flex flex-col flex-1">
                  <div class="mb-3">
                    <h3 class="font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
                    <p class="text-xs text-gray-500">
                      {{ item.category }}
                      <span v-if="item.badge" class="text-amber-600">• {{ item.badge }}</span>
                    </p>
                  </div>
                  <div class="flex items-center justify-between mt-auto">
                    <span class="text-lg font-bold text-gray-900">${{ item.price.toFixed(2) }}</span>
                    <div class="flex items-center gap-2">
                      <button
                        class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                        @click.stop="handleDecrement(item)">
                        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <span class="w-8 text-center font-medium text-gray-600">{{ getItemQuantity(item.id) }}</span>
                      <button
                        class="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
                        @click.stop="handleIncrement(item)">
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
        <aside class="w-full xl:w-96 2xl:w-[420px] shrink-0 aside-cart">
          <div class="bg-white rounded-2xl p-6 xl:sticky xl:top-20 xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t('products.orderDetails') }}</h2>

            <!-- Order Type Tabs -->
            <div class="flex gap-2 mb-6">
              <button :class="[
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                orderType === 'dine-in' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]" @click="orderType = 'dine-in'">{{ t('products.dineIn') }}</button>
              <button :class="[
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                orderType === 'takeaway' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]" @click="orderType = 'takeaway'">{{ t('products.takeAway') }}</button>
              <button :class="[
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                orderType === 'delivery' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]" @click="orderType = 'delivery'">{{ t('products.delivery') }}</button>
            </div>

            <!-- Customer Info -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('products.customerName') }}</label>
                <input type="text" :disabled="true" v-model="customerName" placeholder="Enter name"
                  class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 cursor-not-allowed" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('products.tableNumber') }}</label>
                <input type="text" v-model="tableNumber" :disabled="true" placeholder="04"
                  class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 cursor-not-allowed" />
              </div>
            </div>

            <!-- Ordered Items -->
            <div class="mb-6">
              <template v-if="cart.itemCount < 1">
                <div class="p-4 mb-4 text-sm rounded-md bg-orange-100" role="alert">
                  <span class="font-xs text-orange-700 text-center block">{{ t('common.emptyCart') }}</span>
                </div>
              </template>
              <template v-else>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-gray-900">Ordered menu</h3>
                  <span class="text-sm text-gray-500">{{ cart.itemCount }} Items</span>
                </div>
                <div class="space-y-4 max-h-64 overflow-y-auto">
                  <div v-for="item in cart.items" :key="item.id" class="flex items-start gap-3">
                    <img :src="item.image" :alt="item.name" class="w-16 h-16 rounded-lg object-cover shrink-0" />
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-gray-900 text-sm">{{ item.name }}</h4>
                      <p class="text-xs text-gray-500 mb-2">${{ item.price.toFixed(2) }} ×{{ item.quantity }}</p>
                      <div class="flex items-center gap-2">
                        <button class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                          @click="cart.decrement(item.id)">
                          <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <span class="text-sm font-medium w-6 text-center text-gray-600">{{ item.quantity }}</span>
                        <button class="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
                          @click="cart.increment(item)">
                          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <button class="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          @click="cart.removeProduct(item.id)">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <span class="font-semibold text-gray-900 text-sm shrink-0">${{ (item.price * item.quantity).toFixed(2) }}</span>
                  </div>
                </div>
              </template>
            </div>

            <!-- Payment Details -->
            <div class="border-t border-gray-200 pt-4 mb-6 space-y-3">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('products.paymentDetails') }}</h3>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">{{ t('products.subtotal') }}</span>
                <span class="font-medium text-gray-900">${{ cart.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">{{ t('products.taxes') }}</span>
                <span class="font-medium text-gray-900">{{ cart.taxRate }}%</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">{{ t('products.additionalFee') }}</span>
                <span class="font-medium text-gray-900">-</span>
              </div>
              <div class="flex items-center justify-between text-base font-semibold pt-3 border-t border-gray-200">
                <span class="text-gray-900">{{ t('products.total') }}</span>
                <span class="text-gray-900">${{ cart.total.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Confirm Button -->
            <button class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors cursor-pointer">
              {{ t('products.confirmButton') }}
            </button>
          </div>
        </aside>
      </div>

      <!-- Floating Cart Button (Mobile Only) -->
      <button @click="scrollToCart"
        class="fixed bottom-6 right-6 xl:hidden w-16 h-16 bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 z-50">
        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span v-if="cart.itemCount > 0"
          class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg animate-bounce">
          {{ cart.itemCount > 99 ? '99+' : cart.itemCount }}
        </span>
      </button>

    </div><!-- fi columna dreta -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCartStore, type CartProduct } from '@/stores/cart.store'
import FeaturedGrid from '@/components/products/FeaturedGrid.vue'
import CategoriesSlider from '@/components/products/CategoriesSlider.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/plugins/i18n'
import type { Locale } from '@/locales'

// Cart store
const cart = useCartStore()
const authStore = useAuthStore()
const { t } = useI18n()

// Sidebar
const sidebarOpen = ref(true)

const navItems = [
  {
    key: 'dashboard',
    labelKey: 'sidebar.dashboard',
    active: false,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>`
  },
  {
    key: 'menu',
    labelKey: 'sidebar.menu',
    active: true,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`
  },
  {
    key: 'stock',
    labelKey: 'sidebar.stock',
    active: false,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`
  },
  {
    key: 'table',
    labelKey: 'sidebar.table',
    active: false,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`
  },
  {
    key: 'history',
    labelKey: 'sidebar.history',
    active: false,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
  },
  {
    key: 'settings',
    labelKey: 'sidebar.settings',
    active: false,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
  },
]

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
  available: boolean
}

const languages = ref<Language[]>([
  { code: 'en', name: 'English', flag: '🇬🇧', available: true },
  { code: 'es', name: 'Español', flag: '🇪🇸', available: true },
  { code: 'ca', name: 'Català', flag: '🏴', available: true },
  { code: 'fr', name: 'Français', flag: '🇫🇷', available: false },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', available: false },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', available: false },
])

const selectedLanguage = ref<Language>(languages.value[1]) // Español por defecto
const isLanguageDropdownOpen = ref(false)
const languageDropdownRef = ref<HTMLElement | null>(null)

const toggleLanguageDropdown = () => {
  isLanguageDropdownOpen.value = !isLanguageDropdownOpen.value
}

const changeLanguage = (newLocale: Language) => {
  setLocale(newLocale.code as Locale)
}

const selectLanguage = (language: Language) => {
  if (!language.available) return
  selectedLanguage.value = language
  isLanguageDropdownOpen.value = false
  changeLanguage(language)
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
  // customerName.value = authStore.user?.user_metadata?.full_name ?? 'Domeniko'
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})

const searchQuery = ref('')
const selectedCategory = ref('all')

// Category id -> product category name mapping
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

const filteredMenuItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const cat = selectedCategory.value

  return allMenuItems.value.filter(item => {
    const matchesSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    const matchesCategory = cat === 'all' ||
      item.category === categoryMap[cat]
    return matchesSearch && matchesCategory
  })
})

// Menu items (mock data)
const allMenuItems = ref<CartProduct[]>([
  { id: 2, name: 'Chicken Tofu Soup', category: 'Soup', price: 12.90, image: '/products/2.png', badge: t('products.bestSeller') },
  { id: 3, name: 'Quinoa Salad', category: 'Salads', price: 4.90, image: '/products/3.png', video: '/videos/nachos.mp4', badge: t('products.bestSeller') },
  { id: 4, name: 'Beef Wellington', category: 'Main Course', price: 22.50, image: '/products/4.png', badge: t('products.bestSeller') },
  { id: 5, name: 'Seafood Tempting', category: 'Main Course', price: 18.90, image: '/products/5.png', badge: null },
  { id: 6, name: 'Melting Brownie', category: 'Dessert', price: 8.50, image: '/products/6.png', badge: null },
  { id: 1, name: 'Crispy Calamari', category: 'Appetizer', price: 22.90, image: '/products/1.png', video: '/videos/pasta.mp4', badge: 'Destacado', width: 2 },
  { id: 7, name: 'Cheesy Pizza', category: 'Italian', price: 15.90, image: '/products/7.png', badge: null },
  { id: 8, name: 'Matcha Ice Cream', category: 'Dessert', price: 6.90, image: '/products/8.png', badge: null },
  { id: 9, name: 'Jamón ibérico', category: 'Dessert', price: 6.90, image: '/products/9.png', badge: null },
  { id: 10, name: 'Carpaccio de pulpo', category: 'Dessert', price: 6.90, image: '/products/10.png', badge: null },
  { id: 11, name: 'Aguas de gazpacho a modo de Bloody Mary on the rocks', category: 'Dessert', price: 6.90, image: '/products/11.png', badge: null },
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

const userSignOut = async (): Promise<void> => {
  try {
    await authStore.signOut()
  } catch (_) { }
}
const scrollToCart = () => {
  const cartSection = document.querySelector('.aside-cart')
  if (cartSection) {
    cartSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>