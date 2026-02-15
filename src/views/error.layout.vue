<template>
  error layout
  <router-view/>
  <!-- <TheAppMessages :location="AppMessageLocation.TOAST" class="cart-view__app-messages" />
  <div v-if="isLoading" class="loading-spinner">
    <BaseLoadingSpinner />
  </div>
  <div v-else-if="!isCartEmpty" class="cart-view">

    <div class="cart-view__left">
      <TheAppMessages :location="AppMessageLocation.PAGE" class="cart-view__app-messages" />

      <div class="cart-view__title">
        <h1 class="title-headline">{{ t('pages.cartView.shoppingCart.headline.label') }}</h1>
        <h2 class="title-subheadline">
          {{ cartItemHeaders }}
        </h2>
      </div>

      <ThePriceSummary class="cart-view__mobile" />

      <CartItemList v-if="cartStore.cart?.cartItems" />
    </div>

    <div class="cart-view__right">
      <div class="right-order-summary">
        <ThePriceSummary v-if="!isMobile" class="cart-view__desktop" />

        <ThePriceSummary v-else class="cart-view__mobile" />

        <div
          id="pca-reco-container"
          class="layout-cart m-t-32"
          :class="{ 'dont-paint': !isCartEmpty }"
        >
          <div
            data-recommendations
            :data-heading="$t('pages.cartView.recommendations.title')"
            data-type="last_seen"
          />
        </div>

        <CartSubmitSection
          v-if="cartStore.cart"
          :is-button-disabled="isCheckoutButtonDisabled"
          :ab-test-tag="AbTestTag.basketToCheckout"
          @submit="onStartCheckout"
        />

        <OneClick
          v-if="isOneClickAvailable"
          :cart="cartStore.cart"
          :allowed-payment-methods="oneClickStore.allowedPaymentMethods"
          @cancel="handleOneClickCancel"
          @panic="handleOneClickPanic"
          @error="handleOneClickError"
          @success="handleOneClickSuccess"
        />
      </div>
    </div>
  </div>
  <TheEmptyCart v-else /> -->
</template>

<script lang="ts" setup></script>
<style lang="css" scoped>

</style>
