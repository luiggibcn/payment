<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface CartItem {
  menuItemId: number
  name: string
  price: number
  image: string
  quantity: number
}

interface Props {
  items: CartItem[]
  total: number
  canSend: boolean
  needsReason: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  closeTable: []
  decrease: [item: CartItem]
  increase: [item: CartItem]
  remove: [item: CartItem]
  send: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="w-full lg:w-80 xl:w-96 shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col">

    <!-- Header pedido -->
    <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="font-semibold text-gray-900">{{ t('orders.currentOrder') }}</h3>
      <button
        @click="emit('closeTable')"
        class="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
      >
        {{ t('orders.closeTable') }}
      </button>
    </div>

    <!-- Lista de items -->
    <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">

      <!-- Estado vacío -->
      <div v-if="props.items.length === 0" class="flex flex-col items-center justify-center h-full py-12 text-center gap-3">
        <svg class="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <p class="text-sm text-gray-400">{{ t('orders.emptyOrder') }}</p>
        <p class="text-xs text-gray-300">{{ t('orders.emptyOrderHint') }}</p>
      </div>

      <!-- Items -->
      <div
        v-for="item in props.items"
        :key="item.menuItemId"
        class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
      >
        <img :src="item.image" :alt="item.name" class="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"/>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
          <p class="text-xs text-gray-400">{{ item.price.toFixed(2) }}€ / ud.</p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button
            @click="emit('decrease', item)"
            class="w-6 h-6 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center text-sm hover:bg-gray-50 cursor-pointer transition-colors"
          >−</button>
          <span class="text-sm font-semibold text-gray-800 w-4 text-center">{{ item.quantity }}</span>
          <button
            @click="emit('increase', item)"
            class="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm hover:bg-orange-600 cursor-pointer transition-colors"
          >+</button>
        </div>
        <span class="text-sm font-semibold text-gray-900 w-14 text-right shrink-0">
          {{ (item.price * item.quantity).toFixed(2) }}€
        </span>
        <button
          @click="emit('remove', item)"
          class="text-gray-300 hover:text-red-400 transition-colors cursor-pointer shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Total + Enviar a cocina -->
    <div class="px-5 py-4 border-t border-gray-100 flex flex-col gap-3">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">{{ t('orders.total') }}</span>
        <span class="text-xl font-bold text-gray-900">{{ props.total.toFixed(2) }}€</span>
      </div>
      <button
        @click="emit('send')"
        :disabled="!props.canSend"
        :class="[
          'w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
          props.canSend
            ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        ]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
        </svg>
        {{ props.needsReason ? t('orders.continueToKitchen') : t('orders.sendToKitchen') }}
      </button>
    </div>
  </div>
</template>
