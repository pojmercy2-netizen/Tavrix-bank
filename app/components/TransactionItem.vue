<template>
  <div class="transaction-item">
    <div class="transaction-info">
      <div :class="['transaction-icon', amount > 0 ? 'bg-green-solid' : 'bg-gray-light']">
        <Icon :name="amount > 0 ? 'i-lucide-wallet-cards' : 'i-lucide-credit-card'" class="w-5 h-5" :class="amount > 0 ? 'text-white' : 'text-slate-500'" />
      </div>
      <div class="transaction-details">
        <h4>{{ merchant }}</h4>
        <p>{{ date }}</p>
      </div>
    </div>
    <span :class="['transaction-amount', amount > 0 ? 'amount-positive' : 'amount-negative']">
      {{ amount > 0 ? '+' : '' }}{{ formatCurrency(amount) }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  merchant: string
  date: string
  amount: number
  type: string
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}
</script>

<style scoped>
.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
}

.dark .transaction-item {
  border-bottom-color: var(--color-border-dark);
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bg-green-solid {
  background-color: var(--color-success);
}

.bg-gray-light {
  background-color: var(--color-background-subtle);
}

.dark .bg-gray-light {
  background-color: var(--color-background-dark-subtle);
}

.transaction-details h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-main);
}

.dark .transaction-details h4 {
  color: var(--color-text-light);
}

.transaction-details p {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.dark .transaction-details p {
  color: #94a3b8;
}

.transaction-amount {
  font-size: 14px;
  font-weight: 700;
}

.amount-positive {
  color: var(--color-success);
}

.amount-negative {
  color: var(--color-text-main);
}

.dark .amount-negative {
  color: var(--color-text-light);
}
</style>
