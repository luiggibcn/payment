<template>
  <div class="fixed top-4 right-4 z-50 w-[260px]">
    <div class="bg-zinc-900 border border-gray-700 rounded-lg p-4 shadow-lg">
      <p class="text-white text-sm mb-2">{{  t('languages.select') }}</p>
      
      <div class="flex gap-2">
        <button
          @click="changeLanguage('en')"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            locale === 'en'
              ? 'bg-pink-500 text-white'
              : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
          ]"
        >
          🇬🇧 {{ t('languages.en') }}
        </button>
        
        <button
          @click="changeLanguage('es')"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            locale === 'es'
              ? 'bg-pink-500 text-white'
              : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
          ]"
        >
          🇪🇸 {{ t('languages.es') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/plugins/i18n'
import type { Locale } from '@/locales'

const { t, locale } = useI18n()


const changeLanguage = (newLocale: Locale) => {
  setLocale(newLocale)
  console.log('Language changed to:', newLocale)
}
</script>
