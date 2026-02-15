<script setup lang="ts">
import { onMounted } from 'vue';
import { supabase } from './clients/supabase';
import { useAuth } from './composables/useAuth';

const { getCurrentUser, getCurrentSession } = useAuth()

onMounted(async () => {
  // Obtener sesión inicial
  await getCurrentSession()
  await getCurrentUser()
  
  // Escuchar cambios de autenticación
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session)
    if (session) {
      getCurrentUser()
    }
  })
})

</script>

<template>
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