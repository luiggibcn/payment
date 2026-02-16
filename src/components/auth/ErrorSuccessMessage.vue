<template>
    <div v-if="props.errorMessage" class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
        <p class="text-red-200 text-sm">{{ props.errorMessage }}</p>
    </div>

    <div v-if="props.successMessage" class="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg">
        <p class="text-green-200 text-sm">{{ props.successMessage }}</p>
    </div>
</template>
<script setup lang="ts">
const props = defineProps<{
	errorMessage?: string
	successMessage?: string
}>()
</script>