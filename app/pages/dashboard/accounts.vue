<template>
  <div class="dashboard-page-container">
    <div class="dashboard-page-header">
      <h2>Your Accounts</h2>
      <p>Manage and review your connected bank accounts and cards.</p>
    </div>

    <div class="dashboard-card mb-6">
      <div class="card-header-main">
        <h3>Deposit Accounts</h3>
      </div>
      <div class="account-list">
        <AccountListItem
          title="Everyday Checking"
          subtitle="•••• 4921"
          :balance="formatCurrency(checkingBalance)"
          type="Available balance"
          icon="i-lucide-wallet-cards"
          theme="blue"
          @action="handleAction('Everyday Checking')"
        />
        <AccountListItem
          title="High-Yield Savings"
          subtitle="•••• 8832"
          :balance="formatCurrency(savingsBalance)"
          type="Available balance"
          icon="i-lucide-wallet-cards"
          theme="blue"
          @action="handleAction('High-Yield Savings')"
        />
      </div>
    </div>

    <div class="dashboard-card">
      <div class="card-header-main">
        <h3>Credit & Loans</h3>
      </div>
      <div class="account-list">
        <AccountListItem
          title="Tavrix Bank Rewards Visa"
          subtitle="•••• 9012"
          balance="$0.00"
          type="Outstanding balance"
          icon="i-lucide-credit-card"
          theme="dark"
          @action="handleAction('Tavrix Bank Rewards Visa')"
        />
        <AccountListItem
          title="30-Year Fixed Mortgage"
          subtitle="•••• 3456"
          balance="$0.00"
          type="Remaining principal"
          icon="i-lucide-home"
          theme="blue"
          @action="handleAction('30-Year Fixed Mortgage')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Your Accounts | Tavrix Bank'
})

const checkingBalance = ref(0)
const savingsBalance = ref(0)
const auth = useAuth()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const handleAction = (acct: string) => {
  navigateTo('/dashboard/transactions')
}

onMounted(async () => {
  const accountsRes = await auth.apiCall<any>('/dashboard/accounts', 'GET')
  if (accountsRes.success && accountsRes.data) {
    const accountsList: any[] = accountsRes.data?.data ?? accountsRes.data ?? []
    
    const checking = accountsList.find((a: any) => a.accountType === 'checking')
    checkingBalance.value = checking ? parseFloat(checking.balance || 0) : 0

    const savings = accountsList.find((a: any) => a.accountType === 'savings')
    savingsBalance.value = savings ? parseFloat(savings.balance || 0) : 0
  }
})
</script>

<style scoped>
.dashboard-page-container {
  max-width: 1000px;
  margin: 0 auto;
}

.dashboard-page-header {
  margin-bottom: 24px;
}

.dashboard-page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.dark .dashboard-page-header h2 {
  color: var(--color-text-light);
}

.dashboard-page-header p {
  font-size: 14px;
  color: var(--color-text-muted);
}

.dark .dashboard-page-header p {
  color: #94a3b8;
}

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
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.dark .card-header-main {
  border-bottom-color: var(--color-border-dark);
}

.card-header-main h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
}

.dark .card-header-main h3 {
  color: var(--color-text-light);
}

.account-list {
  display: flex;
  flex-direction: column;
}

.mb-6 {
  margin-bottom: 24px;
}
</style>
