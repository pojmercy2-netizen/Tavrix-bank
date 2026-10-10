<template>
  <div :class="['card-type-card', cardClass]">
    <div class="card-type-header">
      <div class="card-type-icon-container">
        <Icon :name="icon" class="w-6 h-6" />
      </div>
      <h3>{{ title }}</h3>
    </div>
    <div class="card-type-content">
      <p class="card-type-label">{{ label }}</p>
      <div class="card-type-features">
        <div v-for="feat in features" :key="feat" class="feature-item">
          <Icon name="i-lucide-check-circle-2" class="w-4 h-4 text-green-500" />
          <span>{{ feat }}</span>
        </div>
      </div>
    </div>
    <button class="card-type-button" @click="$emit('action')">
      {{ btnText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  label: string
  icon: string
  features: string[]
  btnText: string
  theme: 'virtual' | 'physical'
}>()

defineEmits(['action'])

const cardClass = computed(() => {
  return props.theme === 'physical' ? 'physical-card' : 'visual-card'
})
</script>

<style scoped>
.card-type-card {
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s;
}

.dark .card-type-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.card-type-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.card-type-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-type-icon-container {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary);
}

.dark .card-type-icon-container {
  background: var(--color-background-dark-subtle);
  color: #60a5fa;
}

.card-type-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-main);
}

.dark .card-type-header h3 {
  color: var(--color-text-light);
}

.card-type-content {
  flex: 1;
  margin-bottom: 20px;
}

.card-type-label {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.dark .card-type-label {
  color: #94a3b8;
}

.card-type-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-main);
}

.dark .feature-item {
  color: #e2e8f0;
}

.card-type-button {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-main);
}

.dark .card-type-button {
  background: var(--color-surface-dark);
  border-color: var(--color-border-dark);
  color: #e2e8f0;
}

.card-type-button:hover {
  background: rgba(0, 102, 255, 0.05);
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.dark .card-type-button:hover {
  background: rgba(96, 165, 250, 0.1);
  border-color: #60a5fa;
  color: #60a5fa;
}
</style>
