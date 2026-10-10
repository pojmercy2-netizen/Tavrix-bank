<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Generate Virtual Card</h2>
        <button class="modal-close" @click="close" :disabled="loading">
          <Icon name="i-lucide-x" class="w-6 h-6" />
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label class="form-label" for="cardName">Card Name</label>
          <input
            id="cardName"
            type="text"
            placeholder="e.g., Online Shopping, Travel"
            v-model="cardName"
            :disabled="loading"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="spendingLimit">Spending Limit ($)</label>
          <input
            id="spendingLimit"
            type="number"
            placeholder="e.g., 500"
            v-model.number="spendingLimit"
            :disabled="loading"
            min="1"
            step="0.01"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="expiryDays">Expiry Duration (Days)</label>
          <select
            id="expiryDays"
            v-model="expiryDays"
            :disabled="loading"
            class="form-input form-select"
            required
          >
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
            <option value="180">6 Months</option>
            <option value="365">1 Year</option>
          </select>
        </div>

        <div class="modal-actions">
          <button 
            type="button" 
            class="btn btn-outline"
            @click="close"
            :disabled="loading"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <Icon name="i-lucide-loader-2" class="spin w-4 h-4" />
              Generating...
            </span>
            <span v-else>Generate Card</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  loading: boolean
}>()

const emit = defineEmits(['close', 'submit'])

const cardName = ref('')
const spendingLimit = ref<number | ''>('')
const expiryDays = ref('30')

const close = () => {
  if (!props.loading) {
    emit('close')
  }
}

const handleSubmit = () => {
  if (!cardName.value.trim()) {
    alert('Please enter a card name')
    return
  }
  if (!spendingLimit.value || spendingLimit.value <= 0) {
    alert('Please enter a valid spending limit')
    return
  }

  emit('submit', {
    cardName: cardName.value,
    spendingLimit: Number(spendingLimit.value),
    expiryDays: Number(expiryDays.value)
  })

  // Reset form
  cardName.value = ''
  spendingLimit.value = ''
  expiryDays.value = '30'
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-content {
  background: var(--color-surface);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  padding: 32px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--color-border);
}

.dark .modal-content {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
}

.dark .modal-header h2 {
  color: var(--color-text-light);
}

.modal-close {
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background-color: var(--color-background-subtle);
  color: var(--color-primary);
}

.dark .modal-close:hover {
  background-color: var(--color-background-dark-subtle);
  color: var(--color-text-light);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>
