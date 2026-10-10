<template>
  <section class="page-header">
    <div class="container">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<style scoped>
.page-header {
  background: var(--page-header-bg);
  padding: 80px 0 48px;
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
  
  --page-header-bg: var(--color-background-subtle);
  --page-header-title-color: var(--color-text-main);
  --page-header-subtitle-color: var(--color-text-muted);
  --page-header-grid: rgba(0, 0, 0, 0.02);
}

@media (max-width: 768px) {
  .page-header {
    padding: 60px 0 36px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 44px 0 24px;
  }
}

:global(.dark) .page-header {
  background: var(--page-header-bg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  --page-header-bg: var(--color-primary);
  --page-header-title-color: #ffffff;
  --page-header-subtitle-color: rgba(255, 255, 255, 0.65);
  --page-header-grid: rgba(255, 255, 255, 0.03);
}

.page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--page-header-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--page-header-grid) 1px, transparent 1px);
  background-size: 50px 50px;
}

.page-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 800;
  color: var(--page-header-title-color);
  letter-spacing: -0.03em;
  position: relative;
  z-index: 1;
}

.page-subtitle {
  font-size: 17px;
  color: var(--page-header-subtitle-color);
  margin-top: 12px;
  max-width: 560px;
  line-height: 1.65;
  position: relative;
  z-index: 1;
}
</style>
