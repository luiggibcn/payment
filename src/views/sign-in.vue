<template>
  <LanguageSwitcher />
  <div class="min-h-screen bg-black flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-lg">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-2 mb-4">
          <div class="text-pink-500 text-2xl">
            <img alt="Payment4You logo" src="../assets/logo.svg" class="h-16 w-16">
          </div>
          <h1 class="text-white text-2xl font-semibold">Payment4You</h1>
        </div>
        <h2 class="text-white text-xl font-medium mb-2">{{ t('auth.welcomeTitle') }}</h2>
        <p class="text-gray-400 text-sm">{{ t('auth.welcomeSubtitle') }}</p>
      </div>

      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
        <p class="text-red-200 text-sm">{{ errorMessage }}</p>
      </div>

      <!-- Step 1: Email (solo si currentStep === 1) -->
      <div v-if="currentStep === 1">
        <!-- Botones de OAuth -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <button
            @click="handleGoogleSignIn"
            :disabled="loading"
            class="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{{ t('auth.continueWithGoogle') }}</span>
          </button>

          <button
            @click="handleAppleSignIn"
            :disabled="loading"
            class="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
              />
            </svg>
            <span>{{ t('auth.continueWithApple') }}</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-black text-gray-400">{{ t('auth.continueWithEmail') }}</span>
          </div>
        </div>

        <!-- Form Email -->
        <form @submit.prevent="handleEmailSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-white text-sm font-medium mb-2">
              {{ t('auth.yourEmail') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                :placeholder="t('auth.enterEmail')"
                class="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{{ t('common.continue') }}</span>
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </form>
      </div>

      <!-- Step 2: Password -->
      <div v-else-if="currentStep === 2" class="space-y-4">
        <!-- Form Password -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="password" class="block text-white text-sm font-medium mb-2">
              {{ t('auth.yourPassword') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                id="password"
                ref="passwordInput"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                :placeholder="t('auth.enterPassword')"
                class="w-full pl-10 pr-12 py-3 bg-zinc-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              >
                <svg
                  v-if="!showPassword"
                  class="w-5 h-5 text-gray-400 hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5 text-gray-400 hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Botones Back y Login -->
          <div class="grid grid-cols-[auto_1fr] gap-3">
            <button
              type="button"
              @click="goBackToEmail"
              :disabled="loading"
              class="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-gray-700 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ t('common.back') }}
            </button>

            <button
              type="submit"
              :disabled="loading"
              class="py-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{{ loading ? t('auth.loggingIn') : t('auth.login') }}</span>
              <svg
                v-if="!loading"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </form>

        <!-- Forget Password -->
        <div class="text-center mt-4">
          <a
            href="#"
            @click.prevent="handleForgotPassword"
            class="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
          >
            {{ t('auth.forgotPassword') }}
          </a>
        </div>
      </div>

      <!-- Don't have account (solo en step 1) -->
      <div v-if="currentStep === 1" class="text-center mt-4">
        <p class="text-gray-400 text-sm">
          {{ t('auth.dontHaveAccount') }}
          <router-link
            to="/register"
            class="text-white hover:underline cursor-pointer font-medium"
          >
            {{ t('auth.signUp') }}
          </router-link>
        </p>
      </div>

      <!-- Terms (siempre visible) -->
      <div class="text-center mt-8">
        <p class="text-gray-500 text-xs">
          {{ t('auth.byAgreeing') }}
          <a href="#" class="text-white hover:underline cursor-pointer">{{ t('auth.termsAndConditions') }}</a>
          {{ t('auth.and') }}
          <a href="#" class="text-white hover:underline cursor-pointer">{{ t('auth.privacyPolicy') }}</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
// Estado local del componente (formulario y UI)
const currentStep = ref<1 | 2>(1)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

const passwordInput = ref<HTMLInputElement | null>(null)

// Loading viene de la store (se comparte entre componentes)
const loading = computed(() => authStore.loading)

watch(currentStep, async (newStep) => {
  if (newStep === 2) {
    await nextTick()
    passwordInput.value?.focus()
  }
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleEmailSubmit = () => {
  if (email.value) {
    errorMessage.value = ''
    currentStep.value = 2
  }
}

const handleLogin = async () => {
  errorMessage.value = ''

  try {
    const data = await authStore.signIn(email.value, password.value)
    
    if (data.session) {
      const redirect = router.currentRoute.value.query.redirect as string
      
      if (redirect) {
        router.push(redirect)
      } else {
        router.push('/shop')
      }
    }
  } catch (error: any) {
    if (error.message.includes('Invalid login credentials')) {
      errorMessage.value = t('errors.invalidCredentials')
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage.value = t('errors.emailNotConfirmed')
    } else {
      errorMessage.value = error.message || t('errors.genericError')
    }
    console.error('Login error:', error)
  }
}

const goBackToEmail = () => {
  currentStep.value = 1
  password.value = ''
  errorMessage.value = ''
}

const handleForgotPassword = async () => {
  if (!email.value) {
    errorMessage.value = t('errors.enterEmailFirst')
    currentStep.value = 1
    return
  }

  errorMessage.value = ''

  try {
    await authStore.resetPassword(email.value)
    alert(t('errors.passwordResetSent'))
  } catch (error: any) {
    errorMessage.value = error.message || t('errors.genericError')
    console.error('Reset password error:', error)
  }
}

const handleGoogleSignIn = async () => {
  return
}

const handleAppleSignIn = async () => {
  return
}
</script>


<style scoped>
</style>
