<template>
	<div class="text-center mb-8">
		<div class="flex items-center justify-center gap-2 mb-4">
			<div class="text-pink-500 text-2xl">
				<img alt="Payment4You logo" src="../../assets/logo.svg" class="h-16 w-16">
			</div>
			<h1 class="text-white text-2xl font-semibold">Payment4You</h1>
		</div>
		<h2 class="text-white text-xl font-medium mb-2">{{ props.welcomeTitle }}</h2>
		<p class="text-gray-400 text-sm">{{ props.welcomeSubtitle }}</p>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	welcomeTitle: string
	welcomeSubtitle: string
}>()
</script>
