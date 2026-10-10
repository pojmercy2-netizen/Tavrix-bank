<template>
  <div class="dashboard-overview">
    <!-- Welcome Greeting -->
    <div class="welcome-header-row">
      <div class="welcome-section-body">
        <h1>Welcome back, {{ firstName }}</h1>
        <p>Here's an overview of your account activity.</p>
      </div>
    </div>

    <!-- Hero Layout Grid (Balance Card & Send Money Grid) -->
    <div class="hero-layout-grid">
      <DashboardBalanceCard
        name="TOTAL BALANCE"
        :balance="totalBalance"
        subtitle="+12.5% this month"
        type="premium"
        :showKyc="true"
      />

      <div class="send-money-container-custom">
        <h3 class="send-money-header">SEND MONEY</h3>
        <div class="send-money-grid-custom">
          <NuxtLink
            v-for="method in dashboardMethods"
            :key="method.id"
            :to="`/dashboard/transfer?method=${encodeURIComponent(method.id)}`"
            class="send-money-card-custom"
          >
            <div :class="['send-money-icon-box-custom', method.bgClass]">
              <Icon :name="method.icon" class="w-6 h-6" :class="method.color" />
            </div>
            <span class="send-money-title-custom">{{ method.id }}</span>
            <span class="send-money-desc-custom">{{ method.desc }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Cards Section -->
    <div class="card-types-section">
      <div class="card-type-wrapper">
        <DashboardCardTypeCard
          title="Virtual Card"
          label="One-time use card numbers"
          icon="i-lucide-eye"
          :features="['Instant activation', 'Enhanced security']"
          btnText="Generate Virtual Card"
          theme="virtual"
          @action="navigateTo('/dashboard/cards')"
        />
      </div>
      <div class="card-type-wrapper">
        <DashboardCardTypeCard
          title="Physical Card"
          label="Tangible card for everyday use"
          icon="i-lucide-package"
          :features="['Premium metal design', 'Fast contactless payments']"
          btnText="Request Physical Card"
          theme="physical"
          @action="showPhysicalModal = true"
        />
      </div>
    </div>

    <!-- Main Grid -->
    <div class="dashboard-grid-container">
      <!-- Left Column -->
      <div class="dashboard-column-left">
        <!-- Recent Transactions -->
        <div class="dashboard-card recent-transactions">
          <div class="card-header-main">
            <h3>Recent Transactions</h3>
            <a href="#" class="view-all" @click.prevent="navigateTo('/dashboard/transactions')">
              View all
            </a>
          </div>
          
          <div class="transaction-list">
            <p v-if="transactions.length === 0" class="empty-text">No recent transactions.</p>
            <TransactionItem
              v-else
              v-for="txn in transactions.slice(0, 5)"
              :key="txn.id"
              :merchant="txn.merchant"
              :date="txn.date"
              :amount="txn.amount"
              :type="txn.type"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ModalsPhysicalCardModal
      v-if="showPhysicalModal"
      :loading="physicalCardLoading"
      @close="showPhysicalModal = false"
      @submit="handlePhysicalCardSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'


definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Dashboard Overview | Tavrix Bank'
})

const checkingBalance = ref(0)
const allAccountsBalance = ref(0) // sum of all real accounts
const transactions = ref<any[]>([])

const showPhysicalModal = ref(false)
const physicalCardLoading = ref(false)

const auth = useAuth()

// True total = sum of all accounts fetched from API
const totalBalance = computed(() => allAccountsBalance.value)

// User info for greeting
const fullName = ref('side side')
const firstName = computed(() => fullName.value.split(' ')[0])



const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const alert = (msg: string) => {
  if (import.meta.client) {
    window.alert(msg)
  }
}

// All transfer methods exactly matching the transfer page
const dashboardMethods = [
  { id: 'Bank Transfer',   icon: 'lucide:landmark',    color: 'text-blue-600',    bgClass: 'bg-blue-50 dark:bg-blue-950/20',    desc: 'Direct bank transfer' },
  { id: 'Crypto Transfer', icon: 'lucide:bitcoin',     color: 'text-amber-500',   bgClass: 'bg-amber-50 dark:bg-amber-950/20',   desc: 'Send BTC, ETH, USDT' },
  { id: 'PayPal',          icon: 'lucide:credit-card', color: 'text-blue-700',    bgClass: 'bg-indigo-50 dark:bg-indigo-950/20', desc: 'Instant PayPal' },
  { id: 'Skrill',          icon: 'lucide:wallet',      color: 'text-purple-600',  bgClass: 'bg-purple-50 dark:bg-purple-950/20', desc: 'Skrill wallet' },
  { id: 'Google Pay',      icon: 'lucide:smartphone',  color: 'text-emerald-500', bgClass: 'bg-emerald-50 dark:bg-emerald-950/20', desc: 'Google Pay / UPI' },
  { id: 'Western Union',   icon: 'lucide:globe',       color: 'text-yellow-600',  bgClass: 'bg-yellow-50 dark:bg-yellow-950/20',  desc: 'Cash pick up' },
  { id: 'Wise',            icon: 'lucide:send',        color: 'text-lime-600',    bgClass: 'bg-lime-50 dark:bg-lime-950/20',    desc: 'Wise payment' },
  { id: 'Payoneer',        icon: 'lucide:briefcase',   color: 'text-rose-500',    bgClass: 'bg-rose-50 dark:bg-rose-950/20',    desc: 'Payoneer account' },
]

const loadAccountData = async () => {
  try {
    // Fetch all accounts to compute true total balance
    const accountsRes = await auth.apiCall<any>('/dashboard/accounts', 'GET')
    if (accountsRes.success && accountsRes.data) {
      const accounts: any[] = accountsRes.data?.data ?? accountsRes.data ?? []
      const total = accounts.reduce((sum: number, a: any) => sum + parseFloat(a.balance || 0), 0)
      allAccountsBalance.value = total
      // Checking account balance (first checking account)
      const checking = accounts.find((a: any) => a.accountType === 'checking')
      checkingBalance.value = checking ? parseFloat(checking.balance || 0) : 0
    } else {
      allAccountsBalance.value = 0
      checkingBalance.value = 0
    }

    // Fetch recent transactions
    const txRes = await auth.apiCall<any>('/account/transactions', 'GET')
    if (txRes.success && txRes.data) {
      const txList: any[] = txRes.data?.data ?? txRes.data ?? []
      transactions.value = txList.map((tx: any) => ({
        id: tx.id,
        merchant: tx.description || 'Transaction',
        date: new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: parseFloat(tx.amount),
        type: tx.type?.toLowerCase() || 'transfer'
      }))
    } else {
      transactions.value = []
    }
  } catch (err) {
    console.error('Failed to load account data:', err)
    allAccountsBalance.value = 0
    checkingBalance.value = 0
    transactions.value = []
  }
}

onMounted(() => {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  if (user?.fullName) {
    fullName.value = user.fullName
  }
  loadAccountData()
})

const handlePhysicalCardSubmit = (formData: any) => {
  physicalCardLoading.value = true
  setTimeout(() => {
    physicalCardLoading.value = false
    showPhysicalModal.value = false
    alert(`✅ Physical Card Request Submitted!\n\nName: ${formData.firstName} ${formData.lastName}\nDelivery Address: ${formData.city}, ${formData.state}\nEstimated Delivery: 7 business days.`)
  }, 1500)
}
</script>

<style scoped>
.dashboard-overview {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Welcome header */
.welcome-header-row {
  display: flex;
  align-items: center;
  margin-top: 8px;
}
.welcome-section-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.welcome-section-body h1 {
  font-size: 32px;
  font-weight: 800;
  color: #0A192F;
  letter-spacing: -0.5px;
}
.dark .welcome-section-body h1 {
  color: #ffffff;
}
.welcome-section-body p {
  font-size: 16px;
  color: #64748b;
}
.dark .welcome-section-body p {
  color: #94a3b8;
}

/* Hero layout grid */
.hero-layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
}

.send-money-container-custom {
  display: none;
}

@media (max-width: 1024px) {
  .send-money-container-custom {
    display: flex;
    flex-direction: column;
  }
}
.send-money-header {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #8292a6;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.send-money-grid-custom {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 1200px) {
  .send-money-grid-custom {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .send-money-grid-custom {
    grid-template-columns: repeat(2, 1fr);
  }
}

.send-money-card-custom {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  text-decoration: none;
}
.dark .send-money-card-custom {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}
.send-money-card-custom:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 102, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.send-money-icon-box-custom {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.send-money-title-custom {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 2px;
}
.dark .send-money-title-custom {
  color: #ffffff;
}
.send-money-desc-custom {
  font-size: 10.5px;
  color: var(--color-text-muted);
  line-height: 1.3;
}
.dark .send-money-desc-custom {
  color: #94a3b8;
}

.card-types-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
@media (max-width: 768px) {
  .card-types-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .welcome-section-body h1 {
    font-size: 24px;
  }
  .welcome-section-body p {
    font-size: 14px;
  }
}

.dashboard-grid-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.dashboard-column-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
}
.card-header-main h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
}
.dark .card-header-main h3 {
  color: var(--color-text-light);
}

.view-all {
  font-size: 14px;
  color: var(--color-secondary);
  font-weight: 500;
  text-decoration: none;
}
.view-all:hover {
  text-decoration: underline;
}

.transaction-list {
  display: flex;
  flex-direction: column;
}
.empty-text {
  color: var(--color-text-muted);
  text-align: center;
  padding: 16px;
}
</style>
