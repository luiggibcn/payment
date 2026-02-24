<template>
    <div class="min-h-screen bg-gray-50 flex">
        <TheSideBar/>
        <div class="flex-1 flex flex-col min-w-0">
            <TheHeader/>
            <router-view/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import TheHeader from '@/components/TheHeader.vue';
import TheSideBar from '@/components/TheSideBar.vue';
</script>