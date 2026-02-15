<template>
  <!-- <div class="min-h-screen"> -->
  <nav class="bg-gray-800 w-full">
    <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div class="relative flex h-16 items-center justify-between">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <!-- Mobile menu button-->
          <button type="button"
            class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset"
            aria-controls="mobile-menu" aria-expanded="false">
            <span class="absolute -inset-0.5"></span>
            <span class="sr-only">Open main menuss</span>
            <!--
            Icon when menu is closed.

            Menu open: "hidden", Menu closed: "block"
          -->
            <svg class="block size-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
              aria-hidden="true" data-slot="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <!--
            Icon when menu is open.

            Menu open: "block", Menu closed: "hidden"
          -->
            <svg class="hidden size-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
              aria-hidden="true" data-slot="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div class="flex shrink-0 items-center">
            <!-- <img class="h-8 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
              alt="Your Company"> -->
              <LogoIcon />
          </div>
          <div class="row">
            <div class="box"></div>
            <div class="box"></div>
            <input type="search" name="search" id="search" placeholder="Search" />
            <div class="box"></div>
          </div>
          <div class="hidden sm:ml-6 sm:block">
            <div class="flex space-x-4">
              <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
              <a href="#" class="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
                aria-current="page">Home</a>
              <a href="#"
                class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Shop</a>
              <a href="#"
                class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Account</a>
            </div>
          </div>
        </div>
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <button type="button"
            class="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white"
            @click.prevent="showModal()">
            <span class="absolute -inset-1.5"></span>
            <span class="sr-only">View notifications</span>
            <CartIcon :totalItems="total"/>
          </button>

          <!-- Profile dropdown -->
          <div class="relative ml-3">
            <div>
              <button type="button"
                class="relative flex rounded-full bg-gray-800 text-sm"
                id="user-menu-button" aria-expanded="false" aria-haspopup="true"
                @click.prevent="showSubMenu()">
                <span class="absolute -inset-1.5"></span>
                <span class="sr-only">Open user menu</span>
                <img class="size-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="">
              </button>
            </div>

            <!--
            Dropdown menu, show/hide based on menu state.

            Entering: "transition ease-out duration-100"
              From: "transform opacity-0 scale-95"
              To: "transform opacity-100 scale-100"
            Leaving: "transition ease-in duration-75"
              From: "transform opacity-100 scale-100"
              To: "transform opacity-0 scale-95"
          -->
            <div
              class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 focus:outline-hidden"
              :class="{
          'hidden': !isShowSubMenu,
              }"
              role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabindex="-1">
              <!-- Active: "bg-gray-100 outline-hidden", Not Active: "" -->
              <a href="#" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1"
                id="user-menu-item-0">Your Profile</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1"
                id="user-menu-item-1">Settings</a>
              <a @click="handleAppleSignOut" class="block px-4 py-2 text-sm text-gray-700 cursor-pointer" role="menuitem" tabindex="-1"
                id="user-menu-item-2">Sign out</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    <div class="sm:hidden" id="mobile-menu">
      <div class="space-y-1 px-2 pt-2 pb-3">
        <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
        <a href="#" class="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white"
          aria-current="page">Dashboard</a>
        <a href="#"
          class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Team</a>
        <a href="#"
          class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Projects</a>
        <a href="#"
          class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Calendar</a>
      </div>
    </div>
  </nav>
  <router-view />
  <div 
    class="antialiased inset-0 bg-stone-800 bg-opacity-75 flex justify-center items-center transition-opacity duration-300 ease-out z-[9999]"
    :class="{
          'opacity-100 fixed': isShowModal,
          'opacity-0 hidden': !isShowModal,
              }"
    id="exampleModalWeb3" 
    aria-hidden="true"
  >
    <div class="bg-white rounded-lg w-9/12 sm:w-7/12 md:w-5/12 lg:w-3/12 scale-95 transition-transform duration-300 ease-out">
      <!-- Modal Header -->
      <div class="border-b border-stone-200 p-4 flex justify-between items-start">
        <div class="flex flex-col">
          <h1 class="text-lg text-stone-800 font-semibold">Connect a Wallet</h1>
          <p class="font-sans text-base text-stone-500">Choose which card you want to connect</p>
        </div>
        <button 
          type="button" 
          id="closeModalButton" 
          aria-label="Close" 
          class="text-stone-500 hover:text-stone-800 cursor-pointer"
          @click.prevent="showModal()"
        >
          &times;
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-4 text-stone-500">
        <p class="font-sans text-base text-stone-800 dark:text-white mb-2 font-semibold">Popular</p>
        <div class="space-y-2">
          <button class="inline-flex w-full gap-2 items-center justify-center border align-middle select-none font-sans font-medium text-center duration-300 ease-in disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed focus:shadow-none text-sm py-2 px-4 shadow-sm hover:shadow-md bg-stone-200 hover:bg-stone-100 relative bg-gradient-to-b from-white to-white border-stone-200 text-stone-700 rounded-lg hover:bg-gradient-to-b hover:from-stone-50 hover:to-stone-50 hover:border-stone-200 after:absolute after:inset-0 after:rounded-[inherit] after:box-shadow after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.35),inset_0_-1px_0px_rgba(0,0,0,0.20)] after:pointer-events-none transition">
            <img alt="metamask" src="https://docs.material-tailwind.com/icons/metamask.svg" class="h-5 w-5">
            <p class="font-sans text-base text-inherit font-semibold">Connect with MetaMask</p>
          </button>
          <button class="inline-flex w-full gap-2 items-center justify-center border align-middle select-none font-sans font-medium text-center duration-300 ease-in disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed focus:shadow-none text-sm py-2 px-4 shadow-sm hover:shadow-md bg-stone-200 hover:bg-stone-100 relative bg-gradient-to-b from-white to-white border-stone-200 text-stone-700 rounded-lg hover:bg-gradient-to-b hover:from-stone-50 hover:to-stone-50 hover:border-stone-200 after:absolute after:inset-0 after:rounded-[inherit] after:box-shadow after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.35),inset_0_-1px_0px_rgba(0,0,0,0.20)] after:pointer-events-none transition">
            <img alt="coinbase" src="https://docs.material-tailwind.com/icons/coinbase.svg" class="h-6 w-6 rounded">
            <p class="font-sans text-base text-inherit font-semibold">Connect with Coinbase</p>
          </button>
        </div>
        <p class="font-sans text-base text-stone-800 dark:text-white mb-2 mt-6 font-semibold">Other</p>
        <button class="inline-flex w-full gap-2 items-center justify-center border align-middle select-none font-sans font-medium text-center duration-300 ease-in disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed focus:shadow-none text-sm py-2 px-4 shadow-sm hover:shadow-md bg-stone-200 hover:bg-stone-100 relative bg-gradient-to-b from-white to-white border-stone-200 text-stone-700 rounded-lg hover:bg-gradient-to-b hover:from-stone-50 hover:to-stone-50 hover:border-stone-200 after:absolute after:inset-0 after:rounded-[inherit] after:box-shadow after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.35),inset_0_-1px_0px_rgba(0,0,0,0.20)] after:pointer-events-none transition">
          <img alt="trustwallet" src="https://docs.material-tailwind.com/icons/trust-wallet.svg" class="h-6 w-6 rounded">
          <p class="font-sans text-base text-inherit font-semibold">Connect with Trust Wallet</p>
        </button>
      </div>

      <!-- Modal Footer -->
      <div class="border-t border-stone-200 p-4 flex flex-col items-center gap-2">
        <small class="font-sans antialiased text-sm text-stone-800 text-center">
          New to Ethereum wallets?
        </small>
        <button class="inline-flex gap-2 items-center justify-center border align-middle select-none font-sans font-medium text-center duration-300 ease-in disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed focus:shadow-none text-sm py-2 px-4 shadow-sm hover:shadow-md bg-stone-200 hover:bg-stone-100 relative bg-gradient-to-b from-white to-white border-stone-200 text-stone-700 rounded-lg hover:bg-gradient-to-b hover:from-stone-50 hover:to-stone-50 hover:border-stone-200 after:absolute after:inset-0 after:rounded-[inherit] after:box-shadow after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.35),inset_0_-1px_0px_rgba(0,0,0,0.20)] after:pointer-events-none transition">
          Learn More
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import CartIcon from '@/components/cart-icon.vue';
import { useCartStore } from '@/stores/cart.store';
import LogoIcon from '@/components/logo-icon.vue';
import { useAuth } from '@/composables/useAuth';
const useCart = useCartStore()
const { signOut } = useAuth()
const isScrolled = ref(false);
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

const total = computed(()=> {
  const resp = useCart.cart?.items.reduce((total, item, _, _arr) => 
        total + item.quantity, 
        0
      ) ?? 0;
      return resp > 99 ? '+99' : String(resp);
})
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
const isShowSubMenu = ref(false)
const isShowModal = ref(false)
const showSubMenu = () => {
  isShowSubMenu.value = !isShowSubMenu.value
}
const showModal = () => {
  isShowModal.value = !isShowModal.value
}

const handleAppleSignOut = async (): Promise<void> => {
  await signOut()
}
</script>
<style lang="scss" s>
 @use "../scss/variables" as variables;
 @use "../scss/mixins" as mixins;


.box {
  background-color: hsl(214,8.1%,61.2%);
  width: 30px;
}

.row {
  color: hsl(210,9.1%,87%);
  display: flex;
  gap: 1rem;
  input {
    background-color: hsl(225,6.3%,12.5%);
    color: hsl(210,9.1%,87%);
    border: none;
    outline: none;
    width: 9em;
    transition: width 0.25s;
    border-radius: 0.25em;
    padding: 0.375em;
    font-size: 0.875em;
    &:focus,
    &:not(:placeholder-shown) {
      width: 15em;
    }
    &:focus-visible {
      box-shadow: 0 0 0.25rem hsl(200,100%,50%);
    }
    &::placeholder {
      color: hsl(216, 5%, 79%);
    }
    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }
}

.fix {
  position: fixed;
  bottom: 0;
}
</style>
