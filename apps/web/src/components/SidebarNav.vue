<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useNavItems } from '@/composables/useNavItems'

const props = defineProps<{
  collapsed?: boolean
}>()

const { t } = useI18n()
const { navItems, isActive, navigate } = useNavItems()
</script>

<template>
  <nav class="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
    <button
      v-for="item in navItems"
      :key="item.key"
      @click="navigate(item.routeName)"
      :class="[
        'w-full flex items-center rounded-lg transition-colors cursor-pointer group',
        !props.collapsed ? 'px-3 py-2.5 gap-3' : 'px-0 py-2.5 justify-center',
        isActive(item.routeName)
          ? 'bg-orange-50 text-orange-600'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      ]"
    >
      <span class="shrink-0" v-html="item.icon" />
      <span v-if="!props.collapsed" class="text-sm font-medium truncate">
        {{ t(item.labelKey) }}
      </span>
    </button>
  </nav>
</template>
