<template>
    <p class="text-gray-500 text-xs">
          {{ props.byAgreeing }}
          <a href="#" class="text-white hover:underline cursor-pointer">{{ props.termsConditions }}</a>
          {{ props.andText }}
          <a href="#" class="text-white hover:underline cursor-pointer">{{ props.privacyPolicy }}</a>
        </p>
</template>
<script setup lang="ts">
const props = defineProps<{
	byAgreeing: string
	termsConditions: string
	andText: string
	privacyPolicy: string
}>()
</script>