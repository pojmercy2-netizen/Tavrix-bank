<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Request Physical Card</h2>
        <button class="modal-close" @click="close" :disabled="loading">
          <Icon name="i-lucide-x" class="w-6 h-6" />
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label" for="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="John"
              v-model="firstName"
              :disabled="loading"
              class="form-input"
              required
            />
          </div>
          <div class="form-group flex-1">
            <label class="form-label" for="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Doe"
              v-model="lastName"
              :disabled="loading"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="addressLine1">Address Line 1</label>
          <input
            id="addressLine1"
            type="text"
            placeholder="123 Main Street"
            v-model="addressLine1"
            :disabled="loading"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="addressLine2">Address Line 2 (Optional)</label>
          <input
            id="addressLine2"
            type="text"
            placeholder="Apt 4B"
            v-model="addressLine2"
            :disabled="loading"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label" for="city">City</label>
            <input
              id="city"
              type="text"
              placeholder="New York"
              v-model="city"
              :disabled="loading"
              class="form-input"
              required
            />
          </div>
          <div class="form-group w-24">
            <label class="form-label" for="state">State</label>
            <input
              id="state"
              type="text"
              placeholder="NY"
              maxlength="2"
              v-model="state"
              :disabled="loading"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="zipCode">ZIP Code</label>
          <input
            id="zipCode"
            type="text"
            placeholder="10001"
            v-model="zipCode"
            :disabled="loading"
            class="form-input"
            required
          />
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
              Submitting...
            </span>
            <span v-else>Request Card</span>
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

const firstName = ref('')
const lastName = ref('')
const addressLine1 = ref('')
const addressLine2 = ref('')
const city = ref('')
const state = ref('')
const zipCode = ref('')

const close = () => {
  if (!props.loading) {
    emit('close')
  }
}

const handleSubmit = () => {
  if (!firstName.value.trim() || !lastName.value.trim()) {
    alert('Please enter your full name')
    return
  }
  if (!addressLine1.value.trim() || !city.value.trim() || !state.value.trim() || !zipCode.value.trim()) {
    alert('Please fill in all required address fields')
    return
  }

  emit('submit', {
    firstName: firstName.value,
    lastName: lastName.value,
    addressLine1: addressLine1.value,
    addressLine2: addressLine2.value,
    city: city.value,
    state: state.value,
    zipCode: zipCode.value
  })

  // Reset form
  firstName.value = ''
  lastName.value = ''
  addressLine1.value = ''
  addressLine2.value = ''
  city.value = ''
  state.value = ''
  zipCode.value = ''
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
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}
</style>
