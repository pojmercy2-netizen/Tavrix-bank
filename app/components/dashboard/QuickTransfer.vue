<template>
  <div class="dashboard-card quick-transfer">
    <div class="card-header-main">
      <h3>Quick Transfer</h3>
    </div>
    
    <form class="transfer-form" @submit.prevent="handleTransfer">
      <div class="form-group">
        <label class="form-label">From</label>
        <div class="select-box select-disabled">
          <span>Checking Account (•••• 4921) - {{ formatCurrency(checkingBalance) }}</span>
          <Icon name="i-lucide-chevron-down" class="w-4 h-4 text-slate-400" />
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="transferTo">To</label>
        <div class="select-box">
          <select 
            id="transferTo"
            v-model="transferTo"
            required
            class="select-inner"
          >
            <option value="" disabled>Select account</option>
            <option value="Savings Account (•••• 8832)">Savings Account (•••• 8832)</option>
            <option value="External Account (Chase)">External Account (Chase)</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="transferAmount">Amount</label>
        <div class="input-box">
          <span class="currency-symbol">$</span>
          <input 
            id="transferAmount"
            type="number" 
            step="0.01" 
            min="0.01"
            placeholder="0.00" 
            v-model.number="transferAmount"
            required
            class="input-inner"
          />
        </div>
      </div>
      
      <button type="submit" class="btn btn-primary w-full justify-center">
        Continue transfer
      </button>
    </form>
    
    <a href="#" class="view-all-link" @click.prevent="viewHistory">
      View transfer history
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  checkingBalance: number
}>()

const emit = defineEmits(['transfer', 'viewHistory'])

const transferAmount = ref<number | ''>('')
const transferTo = ref('')

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const handleTransfer = () => {
  const amt = Number(transferAmount.value)
  if (!transferTo.value) {
    alert('Please select a recipient account.')
    return
  }
  if (isNaN(amt) || amt <= 0) {
    alert('Please enter a valid transfer amount.')
    return
  }
  if (amt > props.checkingBalance) {
    alert('Insufficient funds for this transfer.')
    return
  }

  emit('transfer', { to: transferTo.value, amount: amt })
  transferAmount.value = ''
}

const viewHistory = () => {
  emit('viewHistory')
}
</script>

<style scoped>
.dashboard-card {
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
  padding: 24px;
}

.dark .dashboard-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.card-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header-main h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
}

.dark .card-header-main h3 {
  color: var(--color-text-light);
}

.transfer-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-main);
}

.dark .form-label {
  color: var(--color-text-light);
}

.select-box {
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
}

.dark .select-box {
  background: var(--color-surface-dark);
  border-color: var(--color-border-dark);
}

.select-inner {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: var(--color-text-main);
  cursor: pointer;
}

.dark .select-inner {
  color: #e2e8f0;
}

.select-inner option {
  background: var(--color-surface);
  color: var(--color-text-main);
}

.dark .select-inner option {
  background: var(--color-surface-dark);
  color: #e2e8f0;
}

.select-disabled {
  opacity: 0.8;
  cursor: not-allowed;
  font-size: 14px;
  color: var(--color-text-muted);
}

.dark .select-disabled {
  color: #94a3b8;
}

.input-box {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  padding: 10px 14px;
}

.dark .input-box {
  background: var(--color-surface-dark);
  border-color: var(--color-border-dark);
}

.currency-symbol {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-right: 6px;
}

.input-inner {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: var(--color-text-main);
}

.dark .input-inner {
  color: #e2e8f0;
}

.view-all-link {
  display: inline-block;
  margin-top: 16px;
  font-size: 14px;
  color: var(--color-secondary);
  font-weight: 500;
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}
</style>
