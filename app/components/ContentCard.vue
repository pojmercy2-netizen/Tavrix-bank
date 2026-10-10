<template>
  <div class="content-card">
    <div class="card-icon-wrapper">
      <Icon :name="icon" class="card-icon" />
    </div>
    <h3 class="card-title">{{ title }}</h3>
    <p class="card-text">{{ text }}</p>
    <NuxtLink v-if="btnText && btnLink" :to="btnLink" class="btn btn-outline w-full text-center justify-center">
      {{ btnText }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  title: string
  text: string
  btnText?: string
  btnLink?: string
}>(), {
  btnText: '',
  btnLink: ''
})
</script>

<style scoped>
.content-card {
  background: var(--color-surface);
  padding: 40px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--color-border);
  transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
}

.dark .content-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.content-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 102, 255, 0.2);
}

.card-icon-wrapper {
  margin-bottom: 24px;
}

.card-icon {
  width: 32px;
  height: 32px;
  color: var(--color-secondary);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.dark .card-title {
  color: var(--color-text-light);
}

.card-text {
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 24px;
  flex: 1;
}

.dark .card-text {
  color: #94a3b8;
}
</style>
