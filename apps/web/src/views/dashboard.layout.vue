<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { AppRoute } from '@/interfaces/routes.interfaces'
import { setLocale } from '@/plugins/i18n'
import { mainLanguages, type Locale } from '@/locales'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(true)
const settingsOpen = ref(false)
const languageOpen = ref(false)

const activeLocales = mainLanguages.filter(l => l.available)

const settingsItems = [
  { key: 'settings', labelKey: 'sidebar.settings' },
]

const changeLocale = (code: string) => {
  setLocale(code as Locale)
}

interface NavItem {
  key: string
  labelKey: string
  routeName: AppRoute
  icon: string
}

const navItems: NavItem[] = [
  {
    key: 'tables',
    labelKey: 'sidebar.table',
    routeName: AppRoute.TABLES,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`
  },
  {
    key: 'menu',
    labelKey: 'sidebar.menu',
    routeName: AppRoute.PRODUCTS,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`
  },
  {
    key: 'history',
    labelKey: 'sidebar.history',
    routeName: AppRoute.QR,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
  },
]

const activeRoute = computed(() => route.name as AppRoute)

const isActive = (routeName: AppRoute) => activeRoute.value === routeName

const navigate = (routeName: AppRoute) => {
  router.push({ name: routeName })
}

const userSignOut = async () => {
  try {
    await authStore.signOut()
  } catch (_) {}
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">

    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col bg-white border-r border-gray-200 shrink-0 transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-60' : 'w-16'
      ]"
      class="h-full z-40"
    >
      <!-- Logo + toggle -->
      <div
        class="flex items-center h-16 px-3 border-b border-gray-100 shrink-0"
        :class="sidebarOpen ? 'justify-between' : 'justify-center'"
      >
        <div v-if="sidebarOpen" class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span class="font-semibold text-gray-900 text-sm truncate">Payment4You</span>
        </div>

        <button
          @click="sidebarOpen = !sidebarOpen"
          class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
        >
          <svg v-if="sidebarOpen" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Nav items -->
      <nav class="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        <button
          v-for="item in navItems"
          :key="item.key"
          @click="navigate(item.routeName)"
          :class="[
            'w-full flex items-center rounded-lg transition-colors cursor-pointer group',
            sidebarOpen ? 'px-3 py-2.5 gap-3' : 'px-0 py-2.5 justify-center',
            isActive(item.routeName)
              ? 'bg-orange-50 text-orange-600'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
          ]"
        >
          <span class="shrink-0" v-html="item.icon" />
          <span v-if="sidebarOpen" class="text-sm font-medium truncate">
            {{ t(item.labelKey) }}
          </span>
        </button>
      </nav>

      <!-- Bottom section: settings + sign out -->
      <div class="px-2 pb-4 space-y-0.5 shrink-0 border-t border-gray-100 pt-3">
        <!-- Settings with submenu -->
        <div>
          <button
            @click="settingsOpen = !settingsOpen"
            :class="[
              'w-full flex items-center rounded-lg transition-colors cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-800',
              sidebarOpen ? 'px-3 py-2.5 gap-3' : 'px-0 py-2.5 justify-center',
              settingsOpen ? 'bg-gray-100 text-gray-800' : ''
            ]"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span v-if="sidebarOpen" class="flex-1 text-sm font-medium truncate text-left">{{ t('sidebar.settings') }}</span>
            <svg
              v-if="sidebarOpen"
              class="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
              :class="settingsOpen ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Submenu -->
          <div v-if="settingsOpen && sidebarOpen" class="mt-0.5 ml-3 pl-3 border-l border-gray-200 space-y-0.5">
            <button
              v-for="sub in settingsItems"
              :key="sub.key"
              class="w-full flex items-center px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
            >
              {{ t(sub.labelKey) }}
            </button>

            <!-- Language sub-item -->
            <div>
              <button
                @click="languageOpen = !languageOpen"
                class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                :class="languageOpen ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'"
              >
                <span>{{ t('sidebar.language') }}</span>
                <svg
                  class="w-3 h-3 shrink-0 transition-transform duration-200"
                  :class="languageOpen ? 'rotate-180' : ''"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div v-if="languageOpen" class="mt-0.5 ml-3 pl-3 border-l border-gray-200 space-y-0.5">
                <button
                  v-for="lang in activeLocales"
                  :key="lang.code"
                  @click="changeLocale(lang.code)"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                  :class="locale === lang.code
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'"
                >
                  <span>{{ lang.flag }}</span>
                  <span>{{ lang.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          @click="userSignOut"
          :class="[
            'w-full flex items-center rounded-lg transition-colors cursor-pointer text-gray-500 hover:bg-red-50 hover:text-red-500',
            sidebarOpen ? 'px-3 py-2.5 gap-3' : 'px-0 py-2.5 justify-center'
          ]"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span v-if="sidebarOpen" class="text-sm font-medium truncate">{{ t('sidebar.signOut') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <router-view />
    </main>

  </div>
</template>
