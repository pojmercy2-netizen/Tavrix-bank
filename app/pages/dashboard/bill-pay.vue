<template>
  <div class="dashboard-page-container">
    <div class="dashboard-page-header">
      <div>
        <h2>Bill Pay</h2>
        <p>Schedule and manage your bill payments with ease.</p>
      </div>
      <div class="header-badges">
        <div class="badge badge-blue">
          <Icon name="lucide:shield-check" class="w-4 h-4" />
          Secure Payments
        </div>
      </div>
    </div>

    <!-- Success Banner -->
    <div v-if="successMsg" class="success-banner">
      <Icon name="lucide:check-circle-2" class="w-5 h-5" />
      {{ successMsg }}
    </div>

    <div class="page-grid">
      <!-- Left Column -->
      <div class="left-col">
        <!-- Quick Pay Billers -->
        <div class="dashboard-card">
          <div class="card-header-main">
            <h3>Quick Pay</h3>
            <p class="card-subtitle">Select a biller to pay instantly</p>
          </div>
          <div class="biller-grid">
            <button
              v-for="biller in billers"
              :key="biller.id"
              :class="['biller-card', { selected: selectedPayee === biller.id }]"
              @click="selectedPayee = biller.id"
            >
              <div class="biller-icon" :style="{ background: biller.bg }">
                <Icon :name="biller.icon" class="w-5 h-5" :style="{ color: biller.color }" />
              </div>
              <span class="biller-name">{{ biller.name }}</span>
              <span class="biller-cat">{{ biller.category }}</span>
            </button>
          </div>
        </div>

        <!-- Pay a Bill Form -->
        <div class="dashboard-card">
          <div class="card-header-main">
            <h3>Schedule Payment</h3>
          </div>
          <form class="dashboard-form" @submit.prevent="handlePay">
            <div class="form-group">
              <label class="form-label" for="payee">Payee</label>
              <select id="payee" v-model="selectedPayee" class="form-input" required>
                <option value="" disabled>Select a biller</option>
                <option v-for="b in billers" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="amount">Amount ($)</label>
                <input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  v-model.number="amount"
                  min="0.01"
                  step="0.01"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="from-account">From Account</label>
                <select id="from-account" v-model="fromAccount" class="form-input" required>
                  <option value="checking">Checking •• 4291</option>
                  <option value="savings">Savings •• 7703</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="date">Delivery Date</label>
                <input id="date" type="date" v-model="deliveryDate" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="frequency">Frequency</label>
                <select id="frequency" v-model="frequency" class="form-input">
                  <option value="once">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="memo">Memo (optional)</label>
              <input id="memo" type="text" v-model="memo" placeholder="e.g. March electricity bill" class="form-input" />
            </div>

            <div v-if="selectedPayee && amount" class="payment-summary">
              <div class="summary-row">
                <span>Payee</span>
                <strong>{{ billers.find(b => b.id === selectedPayee)?.name || selectedPayee }}</strong>
              </div>
              <div class="summary-row">
                <span>Amount</span>
                <strong>${{ Number(amount).toFixed(2) }}</strong>
              </div>
              <div class="summary-row">
                <span>From</span>
                <strong>{{ fromAccount === 'checking' ? 'Checking •• 4291' : 'Savings •• 7703' }}</strong>
              </div>
              <div class="summary-row">
                <span>Delivery</span>
                <strong>{{ deliveryDate }}</strong>
              </div>
            </div>

            <button type="submit" class="btn btn-primary submit-btn" :disabled="isSubmitting">
              <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 spin" />
              <span>{{ isSubmitting ? 'Processing…' : 'Schedule Payment' }}</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-col">
        <!-- Payment History -->
        <div class="dashboard-card">
          <div class="card-header-main">
            <h3>Payment History</h3>
          </div>
          <div v-if="paymentHistory.length === 0" class="empty-state">
            <Icon name="lucide:receipt" class="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2" />
            <p>No bill payments made yet.</p>
          </div>
          <div v-else class="transaction-list">
            <div v-for="h in paymentHistory" :key="h.id" class="transaction-item">
              <div class="transaction-info">
                <div class="transaction-icon" :style="{ background: h.bg }">
                  <Icon :name="h.icon" class="w-4 h-4" :style="{ color: h.color }" />
                </div>
                <div class="transaction-details">
                  <h4>{{ h.name }}</h4>
                  <p>{{ h.date }}</p>
                </div>
              </div>
              <div class="transaction-amount-col">
                <span class="amount-debit">-${{ h.amount }}</span>
                <span class="pay-status status-paid">Paid</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Bill Pay | Tavrix Bank' })

const auth = useAuth()
const amount = ref<number | ''>('')
const selectedPayee = ref('')
const deliveryDate = ref(new Date().toISOString().split('T')[0])
const fromAccount = ref('checking')
const frequency = ref('once')
const memo = ref('')
const isSubmitting = ref(false)
const successMsg = ref('')

const billers = [
  { id: 'electric', name: 'City Electric Co.', category: 'Utilities', icon: 'lucide:zap', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { id: 'water', name: 'Municipal Water', category: 'Utilities', icon: 'lucide:droplets', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { id: 'internet', name: 'Comcast Xfinity', category: 'Internet', icon: 'lucide:wifi', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { id: 'phone', name: 'AT&T Mobile', category: 'Phone', icon: 'lucide:smartphone', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { id: 'insurance', name: 'State Farm', category: 'Insurance', icon: 'lucide:shield', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  { id: 'mortgage', name: 'Chase Mortgage', category: 'Housing', icon: 'lucide:home', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
]
const paymentHistory = ref<any[]>([])

const loadHistory = async () => {
  const res = await auth.apiCall<any>('/dashboard/bill-pay', 'GET')
  if (res.success && res.data) {
    const data = res.data?.data ?? res.data
    paymentHistory.value = Array.isArray(data) ? data.map((h: any) => {
      const biller = billers.find(b => b.name === h.name || b.id === h.name)
      return {
        id: h.id,
        name: h.name,
        date: h.date,
        amount: h.amount,
        icon: biller?.icon || 'lucide:file-text',
        color: biller?.color || '#64748b',
        bg: biller?.bg || 'rgba(100,116,139,0.12)'
      }
    }) : []
  }
}

onMounted(() => {
  loadHistory()
})

const handlePay = async () => {
  if (!amount.value || !selectedPayee.value) return
  isSubmitting.value = true

  const biller = billers.find(b => b.id === selectedPayee.value)
  const billerName = biller?.name || selectedPayee.value

  const res = await auth.apiCall<any>('/dashboard/bill-pay', 'POST', {
    payeeId: selectedPayee.value,
    payeeName: billerName,
    amount: Number(amount.value),
    fromAccount: fromAccount.value,
    memo: memo.value
  })

  if (res.success) {
    await loadHistory()
    successMsg.value = `Payment of $${Number(amount.value).toFixed(2)} to ${billerName} processed for ${deliveryDate.value}.`
    amount.value = ''
    selectedPayee.value = ''
    memo.value = ''
    setTimeout(() => { successMsg.value = '' }, 5000)
  } else {
    if (import.meta.client) {
      window.alert(`Error: ${res.error || 'Failed to process bill payment'}`)
    }
  }

  isSubmitting.value = false
}
</script>

<style scoped>
.dashboard-page-container {
  max-width: 1100px;
  margin: 0 auto;
}

.dashboard-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.dashboard-page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 4px;
}
.dark .dashboard-page-header h2 { color: var(--color-text-light); }
.dashboard-page-header p { font-size: 14px; color: var(--color-text-muted); }

.header-badges { display: flex; gap: 8px; flex-wrap: wrap; }

.badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
}

.badge-blue {
  background: rgba(0, 102, 255, 0.08);
  color: var(--color-secondary);
  border: 1px solid rgba(0, 102, 255, 0.2);
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  padding: 14px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
}

.page-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}

@media (max-width: 1024px) {
  .page-grid { grid-template-columns: 1fr; }
}

.left-col, .right-col { display: flex; flex-direction: column; gap: 24px; }

.dashboard-card {
  background: var(--color-surface);
  border-radius: 14px;
  border: 1px solid var(--color-border);
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.dark .dashboard-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.card-header-main {
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}
.dark .card-header-main { border-bottom-color: var(--color-border-dark); }

.card-header-main h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
}
.dark .card-header-main h3 { color: var(--color-text-light); }

.card-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* Biller Grid */
.biller-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 600px) {
  .biller-grid { grid-template-columns: repeat(2, 1fr); }
}

.biller-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 12px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}
.dark .biller-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}
.biller-card:hover {
  border-color: var(--color-secondary);
  background: rgba(0,102,255,0.04);
  transform: translateY(-2px);
}
.biller-card.selected {
  border-color: var(--color-secondary);
  background: rgba(0,102,255,0.06);
  box-shadow: 0 0 0 3px rgba(0,102,255,0.12);
}

.biller-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.biller-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-main);
}
.dark .biller-name { color: var(--color-text-light); }

.biller-cat {
  font-size: 11px;
  color: var(--color-text-muted);
}

/* Form */
.dashboard-form { display: flex; flex-direction: column; gap: 18px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-main);
}
.dark .form-label { color: var(--color-text-light); }

/* Payment Summary */
.payment-summary {
  background: rgba(0,102,255,0.04);
  border: 1px solid rgba(0,102,255,0.15);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--color-text-muted);
}
.summary-row strong {
  font-weight: 600;
  color: var(--color-text-main);
}
.dark .summary-row strong { color: var(--color-text-light); }

.submit-btn {
  width: 100%;
  justify-content: center;
  padding: 13px;
  font-size: 15px;
  font-weight: 600;
  gap: 8px;
  display: flex;
  align-items: center;
}

/* Transactions */
.transaction-list { display: flex; flex-direction: column; }

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
  gap: 12px;
}
.dark .transaction-item { border-bottom-color: var(--color-border-dark); }
.transaction-item:last-child { border-bottom: none; }

.transaction-info { display: flex; align-items: center; gap: 12px; min-width: 0; }

.transaction-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.transaction-details h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dark .transaction-details h4 { color: var(--color-text-light); }
.transaction-details p { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }

.transaction-amount-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.amount-debit {
  font-size: 14px;
  font-weight: 700;
  color: #ef4444;
}

.pay-status {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}

.status-scheduled {
  background: rgba(0,102,255,0.1);
  color: var(--color-secondary);
}
.status-pending {
  background: rgba(245,158,11,0.12);
  color: #f59e0b;
}
.status-paid {
  background: rgba(16,185,129,0.1);
  color: #10b981;
}

.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-muted);
}
.empty-state p {
  font-size: 14px;
  margin: 0;
}
</style>
