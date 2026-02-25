<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { setLocale } from '@/plugins/i18n'
import { mainLanguages, type Locale } from '@/locales'
import { useNavItems } from '@/composables/useNavItems'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const { navItems, isActive, navigate } = useNavItems()

const collapsed = ref(false)
const settingsOpen = ref(false)
const languageOpen = ref(false)

const activeLocales = mainLanguages.filter(l => l.available)

const changeLocale = (code: string) => {
  setLocale(code as Locale)
}

const userSignOut = async () => {
  try {
    await authStore.signOut()
  } catch (_) {}
}

const appVersion = __WEB_VERSION__

const userDisplayName = computed(() => {
  return authStore.user?.full_name || authStore.userEmail || 'User'
})

const userRoleLabel = computed(() => {
  const role = authStore.userRole
  const map: Record<string, string> = {
    admin: 'Admin',
    superadmin: 'Super Admin',
    editor: 'Editor',
    waiter: 'Waiter',
    user: 'User',
  }
  return map[role] ?? role
})
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <!-- Header: profile + collapse toggle -->
    <div class="sidebar-header">
      <div v-if="!collapsed" class="sidebar-profile">
        <div class="avatar">
          <img src="/projectx.jpg" alt="Logo" class="avatar-logo" />
        </div>
        <div class="profile-info">
          <span class="profile-name">{{ userDisplayName }}</span>
          <span class="profile-role">{{ userRoleLabel }}</span>
        </div>
      </div>

      <button class="collapse-btn" @click="collapsed = !collapsed" :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M16.5 4C17.3284 4 18 4.67157 18 5.5V14.5C18 15.3284 17.3284 16 16.5 16H3.5C2.67157 16 2 15.3284 2 14.5V5.5C2 4.67157 2.67157 4 3.5 4H16.5ZM7 15H16.5C16.7761 15 17 14.7761 17 14.5V5.5C17 5.22386 16.7761 5 16.5 5H7V15ZM3.5 5C3.22386 5 3 5.22386 3 5.5V14.5C3 14.7761 3.22386 15 3.5 15H6V5H3.5Z"/>
        </svg>
      </button>
    </div>

    <div class="sidebar-divider" />

    <!-- Management section -->
    <div class="sidebar-section">
      <span v-if="!collapsed" class="section-label">Management</span>
      <nav class="nav-list">
        <button
          v-for="item in navItems"
          :key="item.key"
          @click="navigate(item.routeName)"
          class="nav-item"
          :class="{ 'nav-item--active': isActive(item.routeName), 'nav-item--icon-only': collapsed }"
          :title="collapsed ? t(item.labelKey) : undefined"
        >
          <span class="nav-icon" v-html="item.icon" />
          <span v-if="!collapsed" class="nav-label">{{ t(item.labelKey) }}</span>
          <span v-if="!collapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </button>

        <!-- Settings with submenu — hidden when collapsed -->
        <div v-if="!collapsed">
          <button
            @click="settingsOpen = !settingsOpen"
            class="nav-item"
            :class="{ 'nav-item--active': settingsOpen }"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </span>
            <span class="nav-label">{{ t('sidebar.settings') }}</span>
            <svg
              class="nav-chevron"
              :class="{ 'nav-chevron--open': settingsOpen }"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            >
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <div v-if="settingsOpen" class="nav-submenu">
            <button
              @click="languageOpen = !languageOpen"
              class="nav-item nav-item--sub"
              :class="{ 'nav-item--active': languageOpen }"
            >
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z"/>
                </svg>
              </span>
              <span class="nav-label">{{ t('sidebar.language') }}</span>
              <svg
                class="nav-chevron"
                :class="{ 'nav-chevron--open': languageOpen }"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              >
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            <div v-if="languageOpen" class="nav-lang-list">
              <button
                v-for="lang in activeLocales"
                :key="lang.code"
                @click="changeLocale(lang.code)"
                class="lang-item"
                :class="{ 'lang-item--active': locale === lang.code }"
              >
                <span>{{ lang.flag }}</span>
                <span>{{ lang.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <div class="sidebar-divider" />

    <!-- Sign out -->
    <div class="sidebar-footer">
      <button
        class="signout-btn"
        :class="{ 'signout-btn--icon-only': collapsed }"
        @click="userSignOut"
        :title="collapsed ? t('sidebar.signOut') : undefined"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        <span v-if="!collapsed">{{ t('sidebar.signOut') }}</span>
      </button>

      <!-- Branding -->
      <div v-if="!collapsed" class="brand-row">
        <div class="brand-logo">
          <span>pos</span>
        </div>
        <div class="brand-info">
          <span class="brand-name">Project X</span>
          <span class="brand-version">v {{ appVersion }}</span>
        </div>
        <div class="brand-status">
          <span class="status-dot" />
          <span class="status-label">Online</span>
        </div>
      </div>
      <div v-else class="brand-logo brand-logo--centered">
        <span>pos</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

.sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  height: 100%;
  background: #f5f5f3;
  border-right: 1px solid #e8e8e4;
  font-family: 'DM Sans', sans-serif;
  padding: 0;
  overflow: hidden;
  flex-shrink: 0;
  transition: width 0.2s ease;
}

.sidebar--collapsed {
  width: 60px;
}

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 10px 10px 14px;
  gap: 8px;
}

.sidebar--collapsed .sidebar-header {
  flex-direction: column;
  align-items: center;
  padding: 14px 8px 10px;
  gap: 10px;
}

/* Profile */
.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}


.avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: #e8e8e4;
}

.avatar-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (max-width: 640px) {
  .avatar {
    display: none;
  }
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.profile-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.1px;
}

.profile-role {
  font-size: 12px;
  font-weight: 400;
  color: #8a8a85;
}

/* Collapse button */
.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 7px;
  cursor: pointer;
  color: #b0b0aa;
  flex-shrink: 0;
  transition: background 0.12s ease, color 0.12s ease;
}

.collapse-btn:hover {
  background: rgba(0,0,0,0.07);
  color: #1a1a1a;
}

/* Divider */
.sidebar-divider {
  height: 1px;
  background: #e0e0db;
  margin: 0 16px;
}

/* Section */
.sidebar-section {
  padding: 14px 8px 8px;
  flex: 1;
  overflow-y: auto;
}

.section-label {
  font-size: 10px;
  font-weight: 600;
  color: #a0a09a;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 0 8px;
  display: block;
  margin-bottom: 6px;
}

/* Nav items */
.nav-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
  color: #6b6b66;
  text-align: left;
}

.nav-item:hover {
  background: rgba(0,0,0,0.05);
  color: #1a1a1a;
}

.nav-item--active {
  background: #fff;
  color: #1a1a1a;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06);
}

.nav-item--sub {
  padding-left: 10px;
}

.nav-item--icon-only {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.nav-icon :deep(svg),
.nav-icon svg {
  width: 18px;
  height: 18px;
}

.nav-label {
  font-size: 13.5px;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  font-size: 11px;
  font-weight: 700;
  background: #1a1a1a;
  color: #fff;
  padding: 1px 6px;
  border-radius: 6px;
  letter-spacing: 0.2px;
  flex-shrink: 0;
}

.nav-chevron {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #b0b0aa;
  transition: transform 0.15s ease;
}

.nav-chevron--open {
  transform: rotate(90deg);
}

/* Submenu */
.nav-submenu {
  margin-top: 1px;
  padding-left: 4px;
  border-left: 1.5px solid #e0e0db;
  margin-left: 18px;
}

/* Language list */
.nav-lang-list {
  padding: 2px 0 2px 4px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.lang-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  color: #6b6b66;
  font-family: 'DM Sans', sans-serif;
  transition: background 0.12s ease, color 0.12s ease;
  width: 100%;
  text-align: left;
}

.lang-item:hover {
  background: rgba(0,0,0,0.05);
  color: #1a1a1a;
}

.lang-item--active {
  color: #1a1a1a;
  font-weight: 500;
}

/* Footer */
.sidebar-footer {
  padding: 12px 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.signout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #9a9a94;
  font-size: 13.5px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  transition: background 0.12s ease, color 0.12s ease;
  width: 100%;
  text-align: left;
}

.signout-btn:hover {
  background: rgba(220, 50, 50, 0.06);
  color: #c0392b;
}

.signout-btn svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.signout-btn--icon-only {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

/* Brand row */
.brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px 4px;
  border-top: 1px solid #e0e0db;
  margin-top: 4px;
}

.brand-logo {
  width: 36px;
  height: 36px;
  background: #1a1a1a;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-logo span {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}

.brand-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.brand-version {
  font-size: 11px;
  color: #a0a09a;
}

.brand-status {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #27ae60;
  box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.2);
}

.status-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b6b66;
}

.brand-logo--centered {
  margin: 0 auto;
}
</style>
