<template>
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
            <language-side-bar />

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
</template>
<script setup lang="ts">
import { useCartStore } from '@/stores/cart.store';
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageSideBar from './switchers/LanguageSideBar.vue';

const cart = useCartStore()
const { t } = useI18n()
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