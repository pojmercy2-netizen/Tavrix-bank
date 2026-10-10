<template>
  <div class="admin-page fade-in">
    <div class="page-header">
      <div>
        <h1 class="admin-page-title">Transaction Monitoring</h1>
        <p class="page-subtitle">Track, filter, and moderate transactions across all accounts</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="search-wrap">
        <Icon name="lucide:search" :size="15" class="search-icon" />
        <input v-model="search" type="text" placeholder="Search by reference, user ID..." class="filter-input" />
      </div>
      
      <div class="select-wrap">
        <select v-model="selectedType" class="filter-select">
          <option value="All">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>

      <div class="filter-tabs">
        <button v-for="tab in statusTabs" :key="tab" class="filter-tab" :class="{ active: activeTab === tab }" @click="activeTab = tab">
          {{ tab }}
        </button>
      </div>

      <button class="refresh-btn" @click="fetchTransactions" :disabled="loading" title="Refresh">
        <Icon name="lucide:refresh-cw" :size="15" :class="{ 'spin-icon': loading }" />
      </button>
    </div>

    <div class="admin-card">
      <div v-if="loading" class="admin-loading">
        <Icon name="lucide:loader-2" class="spin-icon" /> Loading transactions...
      </div>
      <div v-else class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Reference</th>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in filteredTransactions" :key="tx.id">
              <td class="muted-cell">{{ formatDate(tx.created_at || tx.createdAt) }}</td>
              <td class="monospace">{{ tx.reference }}</td>
              <td>
                <span class="user-id-link" @click="navigateToUser((tx.user_id || tx.userId) ?? '')">
                  {{ (tx.user_id || tx.userId || '—').substring(0, 8) }}...
                </span>
              </td>
              <td>
                <span :class="['type-badge', tx.type]">
                  {{ tx.type }}
                </span>
              </td>
              <td :class="['tx-amount', tx.type === 'deposit' ? 'positive' : 'negative']">
                {{ tx.type === 'deposit' ? '+' : '-' }}${{ Number(tx.amount).toFixed(2) }}
              </td>
              <td>
                <span :class="['status-badge', tx.status?.toLowerCase()]">
                  {{ tx.status }}
                </span>
              </td>
              <td>
                <div class="action-btns" v-if="tx.type === 'withdrawal' && tx.status?.toLowerCase() === 'pending'">
                  <button 
                    class="action-btn approve-btn" 
                    title="Approve Withdrawal" 
                    :disabled="actionLoading === tx.id"
                    @click="handleApprove(tx.id)"
                  >
                    Approve
                  </button>
                  <button 
                    class="action-btn decline-btn" 
                    title="Decline Withdrawal" 
                    :disabled="actionLoading === tx.id"
                    @click="handleDecline(tx.id)"
                  >
                    Decline
                  </button>
                </div>
                <span v-else class="muted-cell">—</span>
              </td>
            </tr>
            <tr v-if="filteredTransactions.length === 0">
              <td colspan="7" class="empty-row">
                <Icon name="lucide:arrow-left-right" :size="32" class="empty-icon" />
                <div>No transactions found.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span class="table-count">{{ filteredTransactions.length }} of {{ transactions.length }} transactions</span>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <Icon :name="toast.type === 'success' ? 'lucide:check-circle' : 'lucide:x-circle'" :size="16" />
        {{ toast.msg }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Transaction Monitoring | Tavrix Bank Admin'
})

interface Transaction {
  id: string
  user_id?: string
  userId?: string
  type: string
  status: string
  amount: number
  reference: string
  recipient_account: string | null
  created_at?: string
  createdAt?: string
}

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    userId: '1001',
    type: 'deposit',
    status: 'completed',
    amount: 2650.00,
    reference: 'DEP-99321',
    recipient_account: null,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: 'tx-2',
    userId: '1001',
    type: 'withdrawal',
    status: 'pending',
    amount: 120.00,
    reference: 'WTH-10293',
    recipient_account: null,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'tx-3',
    userId: '1002',
    type: 'transfer',
    status: 'completed',
    amount: 50.00,
    reference: 'TXF-44821',
    recipient_account: '992188',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
]

const transactions = ref<Transaction[]>([])
const loading = ref(true)
const actionLoading = ref<string | null>(null)
const search = ref('')
const selectedType = ref('All')
const activeTab = ref('All')
const statusTabs = ['All', 'Completed', 'Pending', 'Failed']

const auth = useAuth()
const router = useRouter()

const toast = ref({ show: false, msg: '', type: 'success' })
const showToast = (msg: string, type = 'success') => {
  toast.value = { show: true, msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString()
}

const navigateToUser = (userId: string) => {
  router.push(`/admin/user-management?id=${userId}`)
}

const fetchTransactions = async () => {
  loading.value = true
  try {
    const res = await auth.apiCall<any>('/admin/transactions', 'GET')
    const raw = res.data?.data?.data ?? res.data?.data ?? res.data
    transactions.value = Array.isArray(raw) ? raw : DEFAULT_TRANSACTIONS
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    transactions.value = DEFAULT_TRANSACTIONS
  } finally {
    loading.value = false
  }
}

const filteredTransactions = computed(() => {
  let list = transactions.value
  
  if (selectedType.value !== 'All') {
    list = list.filter(t => t.type?.toLowerCase() === selectedType.value.toLowerCase())
  }
  
  if (activeTab.value !== 'All') {
    list = list.filter(t => t.status?.toLowerCase() === activeTab.value.toLowerCase())
  }
  
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(t => 
      t.reference?.toLowerCase().includes(q) || 
      (t.user_id || t.userId || '').toLowerCase().includes(q)
    )
  }
  
  return list
})

const handleApprove = async (txId: string) => {
  if (!confirm('Approve this withdrawal?')) return
  actionLoading.value = txId
  try {
    const res = await auth.apiCall(`/admin/withdrawals/${txId}/approve`, 'PUT')
    if (res.success) {
      showToast('Withdrawal approved successfully.')
      await fetchTransactions()
    } else {
      // Mock fallback: toggle state in mock array
      const localTx = transactions.value.find(t => t.id === txId)
      if (localTx) {
        localTx.status = 'completed'
        showToast('Withdrawal approved (Mock Fallback).')
      } else {
        showToast(res.error || 'Failed to approve.', 'error')
      }
    }
  } catch (e) {
    showToast('An error occurred during approval.', 'error')
  } finally {
    actionLoading.value = null
  }
}

const handleDecline = async (txId: string) => {
  if (!confirm('Decline this withdrawal?')) return
  actionLoading.value = txId
  try {
    const res = await auth.apiCall(`/admin/withdrawals/${txId}/reject`, 'PUT')
    if (res.success) {
      showToast('Withdrawal declined successfully.')
      await fetchTransactions()
    } else {
      // Mock fallback
      const localTx = transactions.value.find(t => t.id === txId)
      if (localTx) {
        localTx.status = 'failed'
        showToast('Withdrawal declined (Mock Fallback).')
      } else {
        showToast(res.error || 'Failed to decline.', 'error')
      }
    }
  } catch (e) {
    showToast('An error occurred during decline.', 'error')
  } finally {
    actionLoading.value = null
  }
}

onMounted(() => {
  fetchTransactions()
})
</script>

<style scoped>
.admin-page {
  animation: fadeIn 0.4s ease-out;
  color: #f8fafc;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  margin-bottom: 20px;
}

.admin-page-title {
  font-size: 26px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.3);
}

.filter-input {
  width: 100%;
  background: rgba(13, 20, 36, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 9px 12px 9px 36px;
  color: #f1f5f9;
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.filter-input:focus {
  border-color: rgba(99, 102, 241, 0.5);
}

.select-wrap {
  position: relative;
}

.filter-select {
  background: rgba(13, 20, 36, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #f1f5f9;
  padding: 9px 12px;
  font-size: 13.5px;
  outline: none;
  cursor: pointer;
}

.filter-tabs {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 4px;
}

.filter-tab {
  padding: 6px 14px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
  transition: all 0.18s;
}

.filter-tab.active {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
}

.refresh-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9px;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: all 0.18s;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.admin-card {
  background: rgba(13, 20, 36, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  overflow: hidden;
}

.admin-loading {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.admin-table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th {
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  white-space: nowrap;
}

.admin-table td {
  padding: 13px 16px;
  color: #cbd5e1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: middle;
  font-size: 13.5px;
}

.admin-table tr:last-child td {
  border-bottom: none;
}

.admin-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.monospace {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 12px;
}

.user-id-link {
  color: #818cf8;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
}

.user-id-link:hover {
  text-decoration: underline;
  color: #a5b4fc;
}

.type-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  text-transform: capitalize;
}

.type-badge.deposit {
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
}

.type-badge.withdrawal {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.type-badge.transfer {
  background: rgba(99, 102, 241, 0.1);
  color: #818cf8;
}

.tx-amount.positive {
  color: #34d399;
  font-weight: 600;
}

.tx-amount.negative {
  color: #f87171;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}

.status-badge.completed, .status-badge.success {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.status-badge.failed, .status-badge.rejected {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.action-btns {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.approve-btn {
  background: #10b981;
  color: #fff;
}

.approve-btn:hover {
  background: #059669;
}

.decline-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.decline-btn:hover {
  background: rgba(239, 68, 68, 0.25);
}

.empty-row {
  text-align: center;
  padding: 48px 16px !important;
  color: rgba(255, 255, 255, 0.25);
}

.empty-icon {
  display: block;
  margin: 0 auto 12px;
  opacity: 0.3;
}

.table-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.table-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  backdrop-filter: blur(12px);
}

.toast.success {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.toast.error {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
