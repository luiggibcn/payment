<template>
    <div class="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide mb-6 justify-between">
            <button 
              v-for="category in categories" 
              :key="category.id"
              :class="[
                'flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all cursor-pointer shrink-0 w-[115px]',
                selectedCategory === category.id 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-green-200'
              ]"
              @click="selectedCategory = category.id"
            >
              <span class="text-2xl">{{ category.icon }}</span>
              <span class="text-sm font-medium whitespace-nowrap">{{ category.name }}</span>
            </button>
          </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const selectedCategory = ref('all')
const categories = ref([
  { id: 'all', name: 'All menu', icon: '🍽️' },
  { id: 'appetizer', name: 'Appetizer', icon: '🍦' },
  { id: 'soup', name: 'Soup', icon: '🍜' },
  { id: 'salads', name: 'Salads', icon: '🥗' },
  { id: 'main', name: 'Main Course', icon: '🍗' },
  { id: 'italian', name: 'Italian', icon: '🍝' },
  { id: 'side', name: 'Side Dish', icon: '🍟' },
  { id: 'dessert', name: 'Dessert', icon: '🧁' },
  { id: 'beverages', name: 'Beverages', icon: '☕' },
])
</script>
<style lang="scss" scoped>
// Ocultar scrollbar pero mantener funcionalidad
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
