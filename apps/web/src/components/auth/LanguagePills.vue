<template>
  <div class="flex items-center gap-1">
    <button
      v-for="lang in availableLangs"
      :key="lang.code"
      @click="select(lang)"
      class="w-8 h-8 flex items-center justify-center rounded-full text-base transition-all cursor-pointer"
      :class="current === lang.code
        ? 'bg-white/15 ring-1 ring-white/30 scale-110'
        : 'hover:bg-white/10 opacity-60 hover:opacity-100'"
      :aria-label="lang.name"
      :title="lang.name"
    >
      {{ lang.flag }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mainLanguages } from '@/locales'
import { setLocale } from '@/plugins/i18n'
import type { Language, Locale } from '@billsplit/types'

const { locale } = useI18n()

const availableLangs = computed(() => mainLanguages.filter(l => l.available))
const current = computed(() => locale.value)

const select = (lang: Language) => {
  setLocale(lang.code as Locale)
}
</script>
