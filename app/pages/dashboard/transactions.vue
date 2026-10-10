<template>
  <div class="dashboard-page-container">
    <div class="dashboard-page-header">
      <div>
        <h2>Transactions</h2>
        <p>View and filter your full transaction history.</p>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-label">Total In</span>
        <span class="stat-value income">+{{ formatCurrency(totalIn) }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total Out</span>
        <span class="stat-value expense">-{{ formatCurrency(totalOut) }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Net</span>
        <span class="stat-value" :class="net >= 0 ? 'income' : 'expense'">
          {{ net >= 0 ? '+' : '' }}{{ formatCurrency(net) }}
        </span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total Transactions</span>
        <span class="stat-value neutral">{{ filteredTransactions.length }}</span>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="dashboard-card filters-card">
      <div class="filters-row">
        <!-- Search -->
        <div class="search-box">
          <Icon name="lucide:search" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search transactions..."
            class="search-input"
          />
        </div>

        <!-- Type Tabs -->
        <div class="filter-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="filter-tab"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Transaction List -->
    <div class="dashboard-card">
      <div class="card-header-main">
        <h3>Transaction History</h3>
        <span class="count-badge">{{ filteredTransactions.length }} records</span>
      </div>

      <div v-if="loading" class="loading-state">
        <Icon name="lucide:loader-2" class="spin w-6 h-6 text-blue-500" />
        <span>Loading transactions...</span>
      </div>

      <div v-else-if="filteredTransactions.length === 0" class="empty-state">
        <Icon name="lucide:inbox" class="w-12 h-12 text-slate-300" />
        <p>No transactions found.</p>
        <span>Try adjusting your search or filters.</span>
      </div>

      <div v-else class="transaction-list">
        <div
          v-for="txn in filteredTransactions"
          :key="txn.id"
          class="transaction-row"
          :class="{ 'txn-pending': txn.status === 'pending' }"
        >
          <div class="txn-icon-wrap" :class="`type-${txn.type}`">
            <Icon :name="typeIcon(txn.type)" class="w-5 h-5" />
          </div>
          <div class="txn-info">
            <span class="txn-merchant">{{ txn.merchant }}</span>
            <span class="txn-date">{{ txn.date }}</span>
          </div>
          <div v-if="txn.status === 'pending'" class="txn-type-badge badge-pending">
            ⏳ Pending
          </div>
          <div v-else class="txn-type-badge" :class="`badge-${txn.type}`">
            {{ txn.type }}
          </div>
          <div class="txn-amount" :class="txn.status === 'pending' ? 'pending-amount' : (txn.amount >= 0 ? 'positive' : 'negative')">
            {{ txn.status === 'pending' ? '' : (txn.amount >= 0 ? '+' : '') }}{{ formatCurrency(txn.amount) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Transactions | Tavrix Bank' })

const auth = useAuth()
const loading = ref(true)
const searchQuery = ref('')
const activeTab = ref('all')

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Deposits', value: 'deposit' },
  { label: 'Transfers', value: 'transfer' },
  { label: 'Pending', value: 'pending' },
  { label: 'Other', value: 'other' }
]

interface Transaction {
  id: number | string
  merchant: string
  date: string
  amount: number
  type: string
  status?: string
}

const transactions = ref<Transaction[]>([])

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(val))

const typeIcon = (type: string) => {
  const icons: Record<string, string> = {
    deposit: 'lucide:arrow-down-left',
    transfer: 'lucide:send',
    shopping: 'lucide:shopping-bag',
    dining: 'lucide:utensils',
    transport: 'lucide:car',
    debit: 'lucide:receipt',
    other: 'lucide:circle-dot'
  }
  return icons[type] ?? 'lucide:circle-dot'
}

const filteredTransactions = computed(() => {
  let list = transactions.value

  if (activeTab.value === 'pending') {
    list = list.filter(t => t.status === 'pending')
  } else if (activeTab.value !== 'all') {
    if (activeTab.value === 'other') {
      const known = ['deposit', 'transfer', 'shopping', 'dining', 'transport']
      list = list.filter(t => !known.includes(t.type) && t.status !== 'pending')
    } else {
      list = list.filter(t => t.type === activeTab.value && t.status !== 'pending')
    }
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t =>
      t.merchant.toLowerCase().includes(q) ||
      t.date.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q)
    )
  }

  return list
})

const totalIn = computed(() =>
  filteredTransactions.value.filter(t => t.status !== 'pending' && t.amount > 0).reduce((s, t) => s + t.amount, 0)
)
const totalOut = computed(() =>
  filteredTransactions.value.filter(t => t.status !== 'pending' && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
)
const net = computed(() => totalIn.value - totalOut.value)

onMounted(async () => {
  const allTxns: Transaction[] = []

  // 1. Fetch completed transactions log
  const res = await auth.apiCall<any>('/account/transactions', 'GET')
  const raw = res.data?.data ?? res.data
  if (res.success && Array.isArray(raw) && raw.length) {
    const completed = raw.map((tx: any) => ({
      id: tx.id,
      merchant: tx.description || tx.method || 'Transaction',
      date: new Date(tx.created_at || tx.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      }),
      amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount),
      type: (tx.type || 'other').toLowerCase(),
      status: (tx.status || 'completed').toLowerCase()
    }))
    allTxns.push(...completed)
  }

  // 2. Fetch pending transfers (not yet in transactions log)
  const tRes = await auth.apiCall<any>('/dashboard/transfers', 'GET')
  const tRaw = tRes.data?.data ?? tRes.data
  if (tRes.success && Array.isArray(tRaw)) {
    const pendingOnly = tRaw
      .filter((t: any) => (t.status || '').toLowerCase() === 'pending')
      .map((t: any) => ({
        id: `pending-${t.id}`,
        merchant: `Transfer via ${t.method} to ${t.recipient_name || t.recipientName || t.recipient_email || t.recipientEmail || 'Beneficiary'}`,
        date: new Date(t.created_at || t.createdAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        }),
        amount: typeof t.amount === 'string' ? parseFloat(t.amount) : Number(t.amount),
        type: 'transfer',
        status: 'pending'
      }))
    allTxns.unshift(...pendingOnly) // Pending at top
  }

  transactions.value = allTxns
  loading.value = false
})
</script>

<style scoped>
.dashboard-page-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 6px;
}
.dark .dashboard-page-header h2 { color: var(--color-text-light); }
.dashboard-page-header p { font-size: 14px; color: var(--color-text-muted); }
.dark .dashboard-page-header p { color: #94a3b8; }

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .stats-row { grid-template-columns: 1fr; }
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dark .stat-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.stat-value.income { color: #16a34a; }
.stat-value.expense { color: #dc2626; }
.stat-value.neutral { color: var(--color-text-main); }
.dark .stat-value.neutral { color: #f1f5f9; }

/* Card */
.dashboard-card {
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid var(--color-border);
  padding: 24px;
}
.dark .dashboard-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

/* Filters */
.filters-card { padding: 16px 24px; }
.filters-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  width: 16px;
  height: 16px;
}
.search-input {
  width: 100%;
  padding: 9px 12px 9px 36px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-background-page);
  color: var(--color-text-main);
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: var(--color-secondary); }
.dark .search-input {
  background: #1e293b;
  border-color: var(--color-border-dark);
  color: #f1f5f9;
}

.filter-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.filter-tab {
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--color-border);
  background: none;
  color: var(--color-text-muted);
  transition: all 0.2s;
  font-family: var(--font-sans);
}
.filter-tab:hover {
  background: var(--color-background-page);
  color: var(--color-text-main);
}
.filter-tab.active {
  background: var(--color-secondary);
  color: #fff;
  border-color: var(--color-secondary);
}

/* Card header */
.card-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}
.dark .card-header-main { border-bottom-color: var(--color-border-dark); }
.card-header-main h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
}
.dark .card-header-main h3 { color: var(--color-text-light); }

.count-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-background-page);
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
}
.dark .count-badge {
  background: #1e293b;
  border-color: var(--color-border-dark);
}

/* States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 16px;
  color: var(--color-text-muted);
  text-align: center;
}
.empty-state p { font-size: 16px; font-weight: 600; color: var(--color-text-main); margin: 0; }
.dark .empty-state p { color: #e2e8f0; }
.empty-state span { font-size: 13px; }

/* Transaction rows */
.transaction-list { display: flex; flex-direction: column; }

.transaction-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
  transition: background 0.15s;
}
.dark .transaction-row { border-bottom-color: var(--color-border-dark); }
.transaction-row:last-child { border-bottom: none; }

.txn-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.type-deposit { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
.type-transfer { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.type-shopping { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
.type-dining { background: rgba(249, 115, 22, 0.1); color: #f97316; }
.type-transport { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
.type-debit { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.type-other { background: rgba(100, 116, 139, 0.1); color: #64748b; }

.txn-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.txn-merchant {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dark .txn-merchant { color: #f1f5f9; }
.txn-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.txn-type-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  padding: 3px 9px;
  border-radius: 999px;
  white-space: nowrap;
  display: none;
}
@media (min-width: 600px) { .txn-type-badge { display: inline-block; } }
.badge-deposit { background: rgba(22,163,74,0.1); color: #16a34a; }
.badge-transfer { background: rgba(59,130,246,0.1); color: #3b82f6; }
.badge-shopping { background: rgba(168,85,247,0.1); color: #a855f7; }
.badge-dining { background: rgba(249,115,22,0.1); color: #f97316; }
.badge-transport { background: rgba(14,165,233,0.1); color: #0ea5e9; }
.badge-debit { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.badge-other { background: rgba(100,116,139,0.1); color: #64748b; }

.txn-amount {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.txn-amount.positive { color: #16a34a; }
.txn-amount.negative { color: #dc2626; }
.txn-amount.pending-amount { color: #d97706; }

/* Pending row */
.txn-pending {
  background: rgba(245, 158, 11, 0.04);
  border-radius: 8px;
  padding-left: 10px;
  padding-right: 4px;
}
.badge-pending {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

/* Spin animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spin { animation: spin 1s linear infinite; }
</style>
