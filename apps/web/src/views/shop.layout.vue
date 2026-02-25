<template>
  <router-view/>
  <div class="page-products-wrapper flex justify-center justify-items-center">
<a @click="userSignOut" class="block px-4 py-2 text-sm text-gray-700 justify-center text-white cursor-pointer" role="menuitem" tabindex="-1"
                id="user-menu-item-2">Sign out</a>
  </div>
  
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore()
const userSignOut = async (): Promise<void> => {
  await authStore.signOut()
}
</script>
<style scoped>

</style>
