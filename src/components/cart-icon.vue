<template>
    <span class="absolute top-2.5 right-2 grid min-h-[24px] min-w-[24px] translate-x-2/4 -translate-y-2/4 place-items-center rounded-full bg-red-600 py-1 px-1 text-xs text-white">
        {{ props.totalItems }}
  </span>
    <svg class="size-8"  viewBox="0 0 24 24">
        <path
            d="M2 2v2h3.2l2.8 12.2c.1.5.5.8 1 .8h10c.5 0 .9-.3 1-.8l2-8c.1-.3 0-.6-.2-.9-.2-.2-.5-.3-.8-.3h-.4l1.3-2.6c.2-.5.1-1-.3-1.3l-3-2c-.3-.1-.6-.1-.9-.1-.3.1-.5.3-.6.5l-2.1 4.3v-1.8c0-.6-.4-1-1-1h-4c-.6 0-1 .4-1 1v3h-1.1l-.9-4.2c-.1-.5-.5-.8-1-.8h-4zm11 3v2h-2v-2h2zm5.4 2h-1.8l1.8-3.5 1.3.9-1.3 2.6zm-10 2h11.3l-1.5 6h-8.4l-1.4-6z">
        </path>
        <circle cx="18" cy="20" r="2"></circle>
        <circle cx="10" cy="20" r="2"></circle>
    </svg>
</template>
<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    totalItems?: string;
  }>(),
  {
    totalItems: '0',
  }
);
</script>