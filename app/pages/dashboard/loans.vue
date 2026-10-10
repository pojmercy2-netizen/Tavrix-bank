<template>
  <div class="dashboard-page-container">
    <div class="dashboard-page-header">
      <div>
        <h2>Loans</h2>
        <p>View your active loans and apply for new financing.</p>
      </div>
    </div>

    <!-- Active Loans -->
    <div class="dashboard-card">
      <div class="card-header-main">
        <h3>Active Loans</h3>
      </div>

      <div v-if="approvedLoans.length === 0" class="empty-state">
        <Icon name="lucide:inbox" class="w-12 h-12 text-slate-300 dark:text-slate-700" />
        <p>No Active Loans</p>
        <span>Your approved loans will appear here. Apply for a loan below.</span>
      </div>

      <div v-else class="loans-list">
        <div v-for="loan in approvedLoans" :key="loan.id" class="loan-item">
          <div class="loan-icon-wrap" :class="getThemeClass(loan.type)">
            <Icon :name="getIconName(loan.type)" class="w-5 h-5" />
          </div>
          <div class="loan-info">
            <span class="loan-name">{{ loan.name }}</span>
            <span class="loan-sub">Account •••• {{ loan.id.toString().slice(-4) }} · Originated {{ formatDate(loan.created_at) }}</span>
          </div>
          <div class="loan-stats">
            <div class="loan-stat">
              <span class="loan-stat-label">Remaining Balance</span>
              <span class="loan-stat-value">${{ Number(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="loan-stat">
              <span class="loan-stat-label">Monthly Payment</span>
              <span class="loan-stat-value">${{ calculateMonthlyPayment(loan.amount, loan.term, loan.type).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="loan-stat">
              <span class="loan-stat-label">Interest Rate</span>
              <span class="loan-stat-value rate">{{ getInterestRate(loan.type) }}% APR</span>
            </div>
          </div>
          <div class="loan-progress-wrap">
            <div class="progress-label">
              <span>Paid off</span>
              <span>0%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 0%"></div>
            </div>
          </div>
          <button class="btn-outline" @click="showAlert(`${loan.name} details...`)">View Details</button>
        </div>
      </div>
    </div>

    <!-- Apply for a Loan -->
    <div class="dashboard-card">
      <div class="card-header-main">
        <h3>Apply for a Loan</h3>
      </div>
      <div class="loan-products-grid">
        <div class="loan-product-card" @click="openApplyModal('personal')">
          <div class="product-icon personal-bg">
            <Icon name="lucide:user" class="w-6 h-6" />
          </div>
          <div class="product-info">
            <span class="product-name">Personal Loan</span>
            <span class="product-desc">Up to $50,000 · From 6.99% APR</span>
          </div>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-slate-400" />
        </div>

        <div class="loan-product-card" @click="openApplyModal('home-eq')">
          <div class="product-icon home-eq-bg">
            <Icon name="lucide:home" class="w-6 h-6" />
          </div>
          <div class="product-info">
            <span class="product-name">Home Equity Line</span>
            <span class="product-desc">Up to $250,000 · From 7.25% APR</span>
          </div>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-slate-400" />
        </div>

        <div class="loan-product-card" @click="openApplyModal('auto')">
          <div class="product-icon auto2-bg">
            <Icon name="lucide:car" class="w-6 h-6" />
          </div>
          <div class="product-info">
            <span class="product-name">Auto Loan</span>
            <span class="product-desc">New &amp; used vehicles · From 5.49% APR</span>
          </div>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-slate-400" />
        </div>

        <div class="loan-product-card" @click="openApplyModal('business')">
          <div class="product-icon biz-bg">
            <Icon name="lucide:briefcase" class="w-6 h-6" />
          </div>
          <div class="product-info">
            <span class="product-name">Business Loan</span>
            <span class="product-desc">Up to $500,000 · From 8.50% APR</span>
          </div>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>

    <!-- APPLY LOAN MODAL -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeApplyModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2>Apply for {{ getProductTitle(selectedType) }}</h2>
          <button class="modal-close" @click="closeApplyModal"><Icon name="lucide:x" /></button>
        </div>
        <form @submit.prevent="submitApplication" class="modal-body">
          <div class="form-group">
            <label class="form-label" for="amount">Loan Amount (USD)</label>
            <input 
              id="amount" 
              type="number" 
              v-model.number="formAmount" 
              :max="getMaxAmount(selectedType)"
              min="1000" 
              class="form-input" 
              placeholder="e.g. 10000"
              required 
            />
            <span class="field-hint">Max amount: ${{ getMaxAmount(selectedType).toLocaleString() }}</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="term">Loan Term</label>
            <select id="term" v-model.number="formTerm" class="form-input form-select" required>
              <option value="12">12 Months (1 Year)</option>
              <option value="36">36 Months (3 Years)</option>
              <option value="60">60 Months (5 Years)</option>
              <option value="120" v-if="selectedType === 'home-eq'">120 Months (10 Years)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="note">Purpose of Loan</label>
            <input 
              id="note" 
              type="text" 
              v-model="formNote" 
              class="form-input" 
              placeholder="e.g. Home renovation, Buying vehicle" 
              required 
            />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="closeApplyModal">Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Application</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Loans | Tavrix Bank' })

const showModal = ref(false)
const selectedType = ref<'personal' | 'home-eq' | 'auto' | 'business'>('personal')
const formAmount = ref<number | ''>('')
const formTerm = ref<number>(36)
const formNote = ref('')

const loanRequests = ref<any[]>([])

const fetchLoanRequests = () => {
  if (import.meta.client) {
    const data = localStorage.getItem('loan_requests')
    loanRequests.value = data ? JSON.parse(data) : []
  }
}

onMounted(() => {
  fetchLoanRequests()
})

// Current user details
const currentUser = computed(() => {
  if (!import.meta.client) return null
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
})

// Filter approved loans for the current user
const approvedLoans = computed(() => {
  const user = currentUser.value
  if (!user) return []
  return loanRequests.value.filter(
    (req: any) => req.userId === user.id && req.status === 'APPROVED'
  )
})

const openApplyModal = (type: 'personal' | 'home-eq' | 'auto' | 'business') => {
  selectedType.value = type
  formAmount.value = ''
  formTerm.value = type === 'home-eq' ? 60 : 36
  formNote.value = ''
  showModal.value = true
}

const closeApplyModal = () => {
  showModal.value = false
}

const submitApplication = () => {
  const user = currentUser.value
  if (!user) {
    showAlert('You must be logged in to apply.')
    return
  }

  const newRequest = {
    id: 'LN-' + Math.floor(100000 + Math.random() * 900000),
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    type: selectedType.value,
    name: getProductTitle(selectedType.value),
    amount: Number(formAmount.value),
    term: formTerm.value,
    note: formNote.value,
    status: 'PENDING',
    created_at: new Date().toISOString()
  }

  const updated = [newRequest, ...loanRequests.value]
  localStorage.setItem('loan_requests', JSON.stringify(updated))
  loanRequests.value = updated

  closeApplyModal()
  showAlert('✓ Application submitted successfully!\n\nYour request is now pending approval by the admin. You will see it listed under "Active Loans" once approved.')
}

const getProductTitle = (type: string) => {
  const titles: Record<string, string> = {
    personal: 'Personal Loan',
    'home-eq': 'Home Equity Line',
    auto: 'Auto Loan',
    business: 'Business Loan'
  }
  return titles[type] || 'Loan'
}

const getMaxAmount = (type: string) => {
  const maxes: Record<string, number> = {
    personal: 50000,
    'home-eq': 250000,
    auto: 75000,
    business: 500000
  }
  return maxes[type] || 50000
}

const getInterestRate = (type: string) => {
  const rates: Record<string, number> = {
    personal: 6.99,
    'home-eq': 7.25,
    auto: 5.49,
    business: 8.50
  }
  return rates[type] || 6.99
}

const calculateMonthlyPayment = (amount: number, term: number, type: string) => {
  const rate = getInterestRate(type) / 100 / 12
  const termMonths = term
  const payment = (amount * rate * Math.pow(1 + rate, termMonths)) / (Math.pow(1 + rate, termMonths) - 1)
  return isNaN(payment) ? amount / term : payment
}

const getThemeClass = (type: string) => {
  const classes: Record<string, string> = {
    personal: 'personal-bg',
    'home-eq': 'mortgage-bg',
    auto: 'auto-bg',
    business: 'biz-bg'
  }
  return classes[type] || 'personal-bg'
}

const getIconName = (type: string) => {
  const icons: Record<string, string> = {
    personal: 'lucide:user',
    'home-eq': 'lucide:home',
    auto: 'lucide:car',
    business: 'lucide:briefcase'
  }
  return icons[type] || 'lucide:landmark'
}

const formatDate = (isoStr: string) => {
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })
}

const showAlert = (msg: string) => {
  if (import.meta.client) window.alert(msg)
}
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

/* Empty state */
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

/* Loans list */
.loans-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.loan-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto auto;
  gap: 12px 16px;
  align-items: start;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}
.dark .loan-item { border-bottom-color: var(--color-border-dark); }
.loan-item:last-child { border-bottom: none; padding-bottom: 0; }

.loan-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  grid-row: 1 / 2;
}
.mortgage-bg { background: rgba(59,130,246,0.1); color: #3b82f6; }
.auto-bg { background: rgba(14,165,233,0.1); color: #0ea5e9; }
.personal-bg { background: rgba(168,85,247,0.1); color: #a855f7; }
.biz-bg { background: rgba(249,115,22,0.1); color: #f97316; }

.loan-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  grid-row: 1 / 2;
}
.loan-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-main);
}
.dark .loan-name { color: #f1f5f9; }
.loan-sub {
  font-size: 12px;
  color: var(--color-text-muted);
}

.loan-stats {
  grid-column: 1 / 4;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 600px) {
  .loan-stats { grid-template-columns: 1fr 1fr; }
}

.loan-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--color-background-page);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 12px 14px;
}
.dark .loan-stat {
  background: #1e293b;
  border-color: var(--color-border-dark);
}
.loan-stat-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}
.loan-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-main);
}
.dark .loan-stat-value { color: #f1f5f9; }
.loan-stat-value.rate { color: var(--color-secondary); font-size: 14px; }

.loan-progress-wrap {
  grid-column: 1 / 4;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
}
.progress-bar {
  height: 8px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}
.dark .progress-bar { background: #334155; }
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0066ff, #38bdf8);
  border-radius: 999px;
  transition: width 0.6s ease;
}

.btn-outline {
  grid-column: 3 / 4;
  grid-row: 1 / 2;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: none;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-outline:hover {
  border-color: var(--color-secondary);
  color: var(--color-secondary);
  background: rgba(0,102,255,0.05);
}

/* Loan products */
.loan-products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (max-width: 640px) {
  .loan-products-grid { grid-template-columns: 1fr; }
}

.loan-product-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--color-background-page);
}
.loan-product-card:hover {
  border-color: var(--color-secondary);
  background: rgba(0,102,255,0.03);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,102,255,0.08);
}
.dark .loan-product-card {
  background: #1e293b;
  border-color: var(--color-border-dark);
}
.dark .loan-product-card:hover {
  border-color: #60a5fa;
  background: rgba(96,165,250,0.05);
}

.product-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.personal-bg { background: rgba(168,85,247,0.1); color: #a855f7; }
.home-eq-bg  { background: rgba(59,130,246,0.1); color: #3b82f6; }
.auto2-bg    { background: rgba(14,165,233,0.1); color: #0ea5e9; }
.biz-bg      { background: rgba(249,115,22,0.1); color: #f97316; }

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.product-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-main);
}
.dark .product-name { color: #f1f5f9; }
.product-desc {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.modal-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  overflow: hidden;
}
.dark .modal-box {
  background: #0f172a;
  border-color: var(--color-border-dark);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}
.dark .modal-header { border-bottom-color: var(--color-border-dark); }
.modal-header h2 { font-size: 18px; font-weight: 700; color: var(--color-text-main); }
.dark .modal-header h2 { color: #f8fafc; }

.modal-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
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
.dark .form-label { color: #cbd5e1; }
.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-background-page);
  color: var(--color-text-main);
  outline: none;
}
.dark .form-input {
  background: #1e293b;
  border-color: var(--color-border-dark);
  color: #f1f5f9;
}
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
}

.field-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}
</style>
