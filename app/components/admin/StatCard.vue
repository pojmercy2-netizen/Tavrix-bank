<template>
  <div class="admin-stat-card">
    <div :class="['stat-icon', type]">
      <Icon :name="iconName" class="w-8 h-8" />
    </div>
    <div class="stat-details">
      <h3>{{ title }}</h3>
      <p class="stat-value">{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: string | number
  type: 'users' | 'tx' | 'kyc'
}>()

const iconName = computed(() => {
  if (props.type === 'users') return 'i-lucide-users'
  if (props.type === 'tx') return 'i-lucide-arrow-right-left'
  return 'i-lucide-shield-check'
})
</script>

<style scoped>
.admin-stat-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.admin-stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border-color: rgba(96, 165, 250, 0.2);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.users {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.stat-icon.tx {
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
}

.stat-icon.kyc {
  background: rgba(139, 92, 246, 0.1);
  color: #a78bfa;
}

.stat-details h3 {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  line-height: 1;
}
</style>
