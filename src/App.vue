<script setup lang="ts">
import { ref } from 'vue';
import { useCartStore } from './stores/cart.store';

const errorMessage = ref<string>('')
const title = ref(import.meta.env.VITE_APP_TITLE || 'not')
const useCart = useCartStore()
const created= async () => {
    try {
      await useCart.fetchData()
    }
    catch(error){
      errorMessage.value = 'server error :('
    }
  }
</script>

<template>
  <h1>{{ title }}</h1>
  <div v-if="useCart.cart">
    <pre> {{ useCart.cart }}</pre>
  </div>
  <button type="button" @click.prevent="created()">llamda</button>
</template>
