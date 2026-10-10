<template>
  <div class="public-layout">
    <AppNavbar />
    <main class="main-content">
      <slot />
    </main>
    <AppFooter />
    <GTranslate />
    <WhatsAppWidget />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.public-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex: 1;
}
</style>
