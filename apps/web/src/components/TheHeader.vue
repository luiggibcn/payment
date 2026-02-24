<template>
<!-- Header Sticky -->
      <header class="sticky top-0 z-30 bg-white border-b border-gray-200 transition-shadow"
        :class="{ 'shadow-md': isScrolled }">
        <div class="flex items-center justify-between px-6 py-3 h-16">
          <!-- Títol pàgina -->
          <h1 class="text-lg font-semibold text-gray-900">{{ t('sidebar.menu') }}</h1>

          <!-- Right Section: Language + User -->
          <div class="flex items-center gap-3">
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
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageSideBar from './switchers/LanguageSideBar.vue';

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