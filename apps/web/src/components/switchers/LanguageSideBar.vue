<template>
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
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { mainLanguages, type Language, type Locale } from '@/locales'
import { setLocale } from '@/plugins/i18n';

const languages = ref<Language[]>(mainLanguages)

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

const handleClickOutside = (event: MouseEvent) => {
  if (languageDropdownRef.value && !languageDropdownRef.value.contains(event.target as Node)) {
    isLanguageDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>