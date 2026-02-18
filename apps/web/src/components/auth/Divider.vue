<template>
    <div class="relative mb-6">
        <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-700"></div>
        </div>
        <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-black text-gray-400">{{ props.continueMailText }}</span>
        </div>
    </div>
</template>
<script setup lang="ts">
const props = defineProps<{
	continueMailText: string
}>()
</script>