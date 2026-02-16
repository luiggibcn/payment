<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <!-- Order Card 1 -->
        <div class="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div class="flex items-start justify-between mb-3">
                <div>
                    <h3 class="font-semibold text-gray-900">Michael Jordan</h3>
                    <p class="text-sm text-gray-500">#PI9012</p>
                </div>
                <div class="relative">
                    <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <div
                            class="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow">
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Table 12</span>
                <span class="font-medium text-gray-900">$290</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">12 Items</p>
        </div>

        <!-- Order Card 2 -->
        <div class="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div class="flex items-start justify-between mb-3">
                <div>
                    <h3 class="font-semibold text-gray-900">Sujwo Bejo</h3>
                    <p class="text-sm text-gray-500">#588791</p>
                </div>
                <div class="relative">
                    <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span
                        class="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">79</span>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Table 09</span>
                <span class="font-medium text-gray-900">$180</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">4 Items</p>
        </div>

        <!-- Order Card 3 -->
        <div class="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div class="flex items-start justify-between mb-3">
                <div>
                    <h3 class="font-semibold text-gray-900">Dere Rizkani</h3>
                    <p class="text-sm text-gray-500">#PI17712</p>
                </div>
                <div class="relative">
                    <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <div class="w-10 h-10 rounded-full border-4 border-emerald-500 animate-spin-slow"
                            style="border-top-color: transparent; border-right-color: transparent; transform: rotate(180deg);">
                        </div>
                    </div>
                    <span
                        class="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">60</span>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Table 10</span>
                <span class="font-medium text-gray-900">$190</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">6 Items</p>
        </div>

        <!-- Order Card 4 -->
        <div class="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div class="flex items-start justify-between mb-3">
                <div>
                    <h3 class="font-semibold text-gray-900">Filipius Seris</h3>
                    <p class="text-sm text-gray-500">#PI38912</p>
                </div>
                <div class="relative">
                    <button
                        class="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center hover:bg-emerald-700 transition-colors cursor-pointer">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Table 11</span>
                <span class="font-medium text-gray-900">$90</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">3 Items</p>
        </div>
    </div>
</template>
<style lang="scss" scoped>
// Ocultar scrollbar pero mantener funcionalidad
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

// Animación suave para el spinner
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 2s linear infinite;
}
</style>