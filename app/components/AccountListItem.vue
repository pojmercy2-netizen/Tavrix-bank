<template>
  <div class="account-list-item">
    <div :class="['account-list-icon', bgClass]">
      <Icon :name="icon" class="w-5 h-5 text-current" />
    </div>
    <div class="account-list-details">
      <h4>{{ title }}</h4>
      <p>{{ subtitle }}</p>
    </div>
    <div class="account-list-balance">
      <h4>{{ balance }}</h4>
      <p>{{ type }}</p>
    </div>
    <button class="icon-btn" @click="$emit('action')">
      <Icon name="i-lucide-more-vertical" class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  subtitle: string
  balance: string
  type: string
  icon: string
  theme?: 'blue' | 'dark'
}>()

defineEmits(['action'])

const bgClass = computed(() => {
  return props.theme === 'dark' ? 'bg-dark' : 'bg-blue'
})
</script>

<style scoped>
.account-list-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
}

.dark .account-list-item {
  border-bottom-color: var(--color-border-dark);
}

.account-list-item:last-child {
  border-bottom: none;
}

.account-list-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.bg-blue {
  background-color: #e0e7ff;
  color: #3b82f6;
}

.dark .bg-blue {
  background-color: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.bg-dark {
  background-color: #1e293b;
  color: #ffffff;
}

.dark .bg-dark {
  background-color: var(--color-background-dark-subtle);
  color: #e2e8f0;
  border: 1px solid var(--color-border-dark);
}

.account-list-details {
  flex: 1;
  min-width: 0; /* allows text truncation */
}

.account-list-details h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .account-list-details h4 {
  color: var(--color-text-light);
}

.account-list-details p {
  font-size: 13px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .account-list-details p {
  color: #94a3b8;
}

.account-list-balance {
  text-align: right;
  margin-right: 16px;
  flex-shrink: 0;
}

.account-list-balance h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 4px;
}

.dark .account-list-balance h4 {
  color: var(--color-text-light);
}

.account-list-balance p {
  font-size: 12px;
  color: var(--color-text-muted);
}

.dark .account-list-balance p {
  color: #94a3b8;
}

@media (max-width: 480px) {
  .account-list-icon {
    width: 38px;
    height: 38px;
    margin-right: 10px;
  }
  .account-list-details h4 {
    font-size: 13px;
  }
  .account-list-details p {
    font-size: 11px;
  }
  .account-list-balance h4 {
    font-size: 14px;
  }
  .account-list-balance p {
    font-size: 10px;
  }
  .account-list-balance {
    margin-right: 8px;
  }
}

.icon-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background-color: var(--color-background-subtle);
  color: var(--color-primary);
}

.dark .icon-btn:hover {
  background-color: var(--color-background-dark-subtle);
  color: var(--color-text-light);
}
</style>
