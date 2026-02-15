<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCartStore } from './stores/cart.store';
import type { LuiggiService } from './types/src/api';

const errorMessage = ref<string>('')
const title = ref(import.meta.env.VITE_APP_TITLE || 'not')
const useCart = useCartStore()
const getCart = async () => {
  try {
    await useCart.fetchData()
  }
  catch (error) {
    errorMessage.value = 'server error :('
  }
}
const updateCart = async () => {
  try {
    await useCart.updateCartItem({
      sku: selected.value,
      quantity: Number(quantityInput.value),
    } as LuiggiService.CartItemDTO)
  }
  catch (error) {
    errorMessage.value = 'server error :('
  }
}

onMounted(() => {
  // getCart()
})
const isActionDisabled = computed(() => selected.value === '')

const selected = ref('')
const quantityInput = ref('1')
const hideModule = false
</script>

<template>
  <div v-if="hideModule">

  <h1>{{ title }}</h1>
  <div v-if="useCart.cart">
    <pre>{{ useCart.cart }}</pre>
  </div>


  <div>
    <p>Quantity: {{ quantityInput }}</p>
    <input v-model="quantityInput" :type="'number'" placeholder="1" />

    <p> Selected: {{ selected }}</p>

    <select v-model="selected">
      <option disabled value="">Please select one</option>
      <option v-for="product in useCart.cart?.items" :value="product.sku"> {{ product.productName }} - {{
        product.quantity }} </option>
    </select>
  </div>
  <button :disabled="isActionDisabled" type="button" @click.prevent="updateCart()">Update Cart</button>
  <hr />
  </div>
  <RouterView />
</template>
<style lang="scss" scoped>
button {
  &:enabled {
    border-color: greenyellow;
    background-color: green;
    color: white;
  }
  &:disabled {
    cursor: not-allowed;
    border-color: transparent
  }
}

hr {
  margin-top: 1rem;
}

</style>