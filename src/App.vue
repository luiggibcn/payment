<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initialize()
})
</script>

<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  overflow-x: hidden;
}
</style>
