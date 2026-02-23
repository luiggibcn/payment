<template>
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
        @click="changePage(item.url)"
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
</template>
<script setup lang="ts">
import { useIsMobile } from '@/composables/isMobile.composable';
import { useAuthStore } from '@/stores/auth.store';
import { redirectTo } from '@/utils';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore()
const { isMobile } = useIsMobile()
const { t } = useI18n()
const sidebarOpen = ref(true)

onMounted(() => {
  if(isMobile) sidebarOpen.value = false
})
//TODO: REFACTOR COLORS IN NAVITEMS
const navItems = [
  {
    key: 'dashboard',
    labelKey: 'sidebar.dashboard',
    active: false,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>`,
    url: ''
  },
  {
    key: 'menu',
    labelKey: 'sidebar.menu',
    active: true,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
    url: ''
  },
  {
    key: 'stock',
    labelKey: 'sidebar.stock',
    active: false,
    icon: `<svg class="w-5 h-5" fill="none" stroke="#df0000" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
    url: 'tpv/products'
  },
  {
    key: 'table',
    labelKey: 'sidebar.table',
    active: false,
    icon: `<svg class="w-5 h-5" fill="none" stroke="#df0000" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
    url: 'tpv'
  },
  {
    key: 'history',
    labelKey: 'sidebar.history',
    active: false,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    url: ''
  },
  {
    key: 'settings',
    labelKey: 'sidebar.settings',
    active: false,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    url: ''
  },
]

const userSignOut = async (): Promise<void> => {
  try {
    await authStore.signOut()
  } catch (_) { }
}
const changePage = (url: string) => {
  if (url.trim() !== '') {
    sidebarOpen.value = false
    redirectTo(`/${url}`)
  }
}
</script>