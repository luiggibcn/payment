<script lang="ts" setup>
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
  <div class="flex h-screen overflow-hidden" style="background: #f0efed">
    <AppSidebar />
    <main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>
