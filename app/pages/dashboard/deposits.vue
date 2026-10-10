<template>
  <div class="dashboard-page-container">
    <div class="dashboard-page-header">
      <h2>Fund Your Account</h2>
      <p>Add money to your Tavrix Bank accounts instantly using your preferred method.</p>
    </div>

    <div class="page-grid">
      <!-- Add Funds Section -->
      <div class="dashboard-card">
        <div class="card-header-main">
          <h3>Add Funds</h3>
        </div>
        <div v-if="notAvailable" class="not-available-state">
          <Icon name="lucide:alert-circle" class="w-12 h-12 text-amber-500 mb-2" />
          <h4>Not available at the moment</h4>
          <p>This payment method is temporarily down for maintenance. Please select another option.</p>
          <button class="btn btn-outline back-btn" @click="resetForm">Go Back</button>
        </div>

        <div v-else-if="isCryptoStep2" class="crypto-step2-state">
          <form @submit.prevent="handleCryptoSubmit" class="dashboard-form">
            <div class="form-group">
              <label class="form-label text-left block mb-1" for="selectedCoin">Select Cryptocurrency</label>
              <select id="selectedCoin" v-model="selectedCoin" class="form-input form-select" required>
                <option v-for="c in coins" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <!-- Destination Info Box -->
            <div class="dest-info-box text-left">
              <span class="dest-label">Send to Address (Network: {{ currentCoinNetwork }})</span>
              <div class="copy-address-row">
                <input type="text" readonly :value="currentCoinAddress" class="form-input read-only-input" />
                <button type="button" class="btn btn-outline" @click="copyText(currentCoinAddress)">Copy</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label text-left block mb-1">Upload Receipt of Payment</label>
              <div class="file-upload-wrapper">
                <input 
                  type="file" 
                  id="receiptUpload" 
                  accept="image/*" 
                  class="hidden-file-input" 
                  @change="handleReceiptChange" 
                  required 
                />
                <label for="receiptUpload" class="file-upload-label text-left">
                  <Icon name="lucide:image" class="w-5 h-5 text-slate-400" />
                  <span>{{ receiptFileName || 'Choose receipt image...' }}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label text-left block mb-1" for="cryptoAmount">Amount (USD)</label>
              <input 
                id="cryptoAmount" 
                type="number" 
                v-model.number="cryptoAmount" 
                placeholder="$ 0.00" 
                min="0.01" 
                step="0.01" 
                class="form-input" 
                required 
              />
            </div>

            <div class="form-actions-row">
              <button type="button" class="btn btn-outline" @click="isCryptoStep2 = false">Go Back</button>
              <button type="submit" class="btn btn-primary">Proceed</button>
            </div>
          </form>
        </div>

        <form v-else class="dashboard-form" @submit.prevent="handleDeposit">
          <div class="form-group mb-3">
            <label class="form-label block mb-3">Select Deposit Method</label>
            <div class="payment-method-grid">
              <div 
                v-for="method in methods"
                :key="method.id"
                :class="['payment-method-card', { selected: selectedMethod === method.id }]"
                @click="selectedMethod = method.id"
              >
                <div class="payment-icon-wrapper">
                  <Icon :name="method.icon" class="w-6 h-6" :class="method.color" />
                </div>
                <span class="payment-method-name">{{ method.id }}</span>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary submit-btn-fit">Proceed with Deposit</button>
        </form>
      </div>

      <!-- Recent Deposits Section -->
      <div class="dashboard-card h-fit">
        <div class="card-header-main">
          <h3>Recent Deposits</h3>
        </div>
        <div v-if="recentDeposits.length === 0" class="empty-text">
          No recent deposits.
        </div>
        <div v-else class="transaction-list">
          <div v-for="dep in recentDeposits" :key="dep.id" class="transaction-item">
            <div class="transaction-info">
              <div class="transaction-icon bg-orange-light">
                <Icon name="i-lucide-clock" class="w-5 h-5 text-orange-500" />
              </div>
              <div class="transaction-details">
                <h4>{{ dep.method }} Deposit</h4>
                <p>{{ dep.status }} • {{ dep.date }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Fund Your Account | Tavrix Bank'
})

interface Deposit {
  id: string
  method: string
  status: string
  date: string
}

const recentDeposits = ref<Deposit[]>([])
const selectedMethod = ref('')
const notAvailable = ref(false)
const isCryptoStep2 = ref(false)
const selectedCoin = ref('BTC')
const receiptFileName = ref('')
const cryptoAmount = ref<number | ''>('')
const auth = useAuth()

const coins = ref([
  { id: 'BTC', name: 'Bitcoin (BTC)', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', network: 'Bitcoin' },
  { id: 'ETH', name: 'Ethereum (ETH)', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'ERC20 (Ethereum)' },
  { id: 'USDT', name: 'Tether (USDT)', address: 'TR7NHqju6dC8GyqKz2763z54X5157mock', network: 'TRC20 (Tron)' }
])

const currentCoinAddress = computed(() => {
  const coin = coins.value.find(c => c.id === selectedCoin.value)
  return coin ? coin.address : ''
})

const currentCoinNetwork = computed(() => {
  const coin = coins.value.find(c => c.id === selectedCoin.value)
  return coin ? coin.network : ''
})

const resetForm = () => {
  notAvailable.value = false
  selectedMethod.value = ''
  isCryptoStep2.value = false
  receiptFileName.value = ''
}

const loadWalletAddresses = async () => {
  try {
    const res = await auth.apiCall<any>('/dashboard/wallets', 'GET')
    if (res.success && res.data) {
      const data: any[] = res.data?.data ?? res.data ?? []
      if (data.length > 0) {
        coins.value = data.map((w: any) => ({
          id: w.coin,
          name: w.label,
          address: w.address,
          network: w.network
        }))
      }
    }
  } catch {
    // Silently fall back to default values
  }
}

const loadDeposits = async () => {
  const res = await auth.apiCall<any>('/dashboard/deposits', 'GET')
  if (res.success && res.data) {
    const list: any[] = res.data?.data ?? res.data ?? []
    recentDeposits.value = list.map((d: any) => ({
      id: d.id,
      method: d.method,
      status: d.status,
      date: new Date(d.created_at || d.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }))
  }
}

onMounted(() => {
  loadWalletAddresses()
  loadDeposits()
})

const methods = [
  { id: 'Bank Transfer', icon: 'i-lucide-building-2', color: 'text-blue-500' },
  { id: 'Crypto Deposit', icon: 'i-lucide-bitcoin', color: 'text-amber-500' },
  { id: 'PayPal', icon: 'i-lucide-credit-card', color: 'text-blue-700' }
]

const alertPrompt = (msg: string) => {
  if (import.meta.client) {
    window.alert(msg)
  }
}

const selectMethod = (id: string) => {
  selectedMethod.value = id
}

const proceedToStep2 = () => {
  if (!selectedMethod.value) {
    alertPrompt('Please select a deposit method first.')
    return
  }

  if (selectedMethod.value === 'Bank Transfer' || selectedMethod.value === 'PayPal') {
    notAvailable.value = true
    return
  }

  if (selectedMethod.value === 'Crypto Deposit') {
    isCryptoStep2.value = true
    return
  }
}

const copyText = (text: string) => {
  if (import.meta.client && navigator.clipboard) {
    navigator.clipboard.writeText(text)
    alertPrompt('Wallet address copied to clipboard!')
  }
}

const handleReceiptChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) receiptFileName.value = file.name
  } else {
    receiptFileName.value = ''
  }
}

const handleCryptoSubmit = async () => {
  if (!cryptoAmount.value || cryptoAmount.value <= 0) {
    alertPrompt('Please enter a valid amount.')
    return
  }
  if (!receiptFileName.value) {
    alertPrompt('Please upload your receipt image.')
    return
  }

  const res = await auth.apiCall<any>('/dashboard/deposits', 'POST', {
    method: `Crypto (${selectedCoin.value})`,
    amount: Number(cryptoAmount.value),
    coin: selectedCoin.value,
    walletAddress: currentCoinAddress.value,
    note: `Crypto Deposit via ${selectedCoin.value}`
  })

  if (res.success) {
    await loadDeposits()
    alertPrompt(`✓ Crypto deposit of $${Number(cryptoAmount.value).toFixed(2)} submitted for review!\n\nTransaction verification is in progress.`)
    isCryptoStep2.value = false
    selectedCoin.value = 'BTC'
    receiptFileName.value = ''
    cryptoAmount.value = ''
  } else {
    alertPrompt(`Error: ${res.error || 'Failed to submit deposit.'}`)
  }
}

const handleDeposit = proceedToStep2
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

.page-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

@media (max-width: 900px) {
  .page-grid {
    grid-template-columns: 1fr;
  }
}

.col-span-full {
  grid-column: 1 / -1;
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

.dashboard-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row-2 {
  display: flex;
  gap: 16px;
}

@media (max-width: 480px) {
  .form-row-2 {
    flex-direction: column;
    gap: 12px;
  }
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-main);
}

.dark .form-label {
  color: var(--color-text-light);
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
}

.payment-method-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .payment-method-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.payment-method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-surface);
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 8px;
}

.dark .payment-method-card {
  background-color: var(--color-surface-dark);
  border-color: var(--color-border-dark);
}

.payment-method-card:hover {
  border-color: rgba(0, 102, 255, 0.4);
  background-color: var(--color-background-subtle);
  transform: translateY(-2px);
}

.dark .payment-method-card:hover {
  background-color: var(--color-background-dark-subtle);
}

.payment-method-card.selected {
  border-color: var(--color-secondary);
  background-color: rgba(0, 102, 255, 0.08);
}

.dark .payment-method-card.selected {
  background-color: rgba(96, 165, 250, 0.12);
  border-color: #60a5fa;
}

.payment-icon-wrapper {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: var(--color-background-subtle);
}

.dark .payment-icon-wrapper {
  background-color: var(--color-background-dark-subtle);
}

.payment-method-card.selected .payment-icon-wrapper {
  background-color: var(--color-surface);
}

.dark .payment-method-card.selected .payment-icon-wrapper {
  background-color: var(--color-surface-dark);
}

.payment-method-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-main);
  text-align: center;
}

.dark .payment-method-name {
  color: #e2e8f0;
}

.payment-method-card.selected .payment-method-name {
  color: var(--color-secondary);
}

.dark .payment-method-card.selected .payment-method-name {
  color: #60a5fa;
}

.submit-btn-fit {
  font-size: 15px;
  font-weight: 600;
  padding: 12px 24px;
  width: fit-content;
}

.check-images-wrapper {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.check-upload-btn {
  flex: 1;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 1.5px dashed var(--color-border);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.dark .check-upload-btn {
  border-color: var(--color-border-dark);
}

.check-upload-btn:hover {
  background-color: var(--color-background-subtle);
  border-color: var(--color-secondary);
}

.dark .check-upload-btn:hover {
  background-color: var(--color-background-dark-subtle);
  border-color: #60a5fa;
}

.check-upload-btn span {
  font-size: 13px;
  color: var(--color-text-muted);
}

.dark .check-upload-btn span {
  color: #94a3b8;
}

.info-note {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 8px;
}

.dark .info-note {
  color: #94a3b8;
}

.transaction-list {
  display: flex;
  flex-direction: column;
}

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
  gap: 12px;
}

.transaction-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-orange-light {
  background-color: rgba(249, 115, 22, 0.1);
}

.bg-green-light {
  background-color: rgba(16, 185, 129, 0.1);
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
  color: var(--color-text-main);
}

.dark .transaction-amount {
  color: var(--color-text-light);
}

.text-green-600 {
  color: var(--color-success);
}

.dest-info-box {
  background: var(--color-background-subtle);
  border: 1px solid var(--color-border);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}
.dark .dest-info-box {
  background: var(--color-background-dark-subtle);
  border-color: var(--color-border-dark);
}
.dest-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.copy-address-row {
  display: flex;
  gap: 8px;
}
.read-only-input {
  flex: 1;
  background: var(--color-surface);
  cursor: default;
}
.dark .read-only-input {
  background: #0f172a;
}
.form-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.hidden-file-input {
  display: none;
}
.file-upload-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  background: var(--color-background-page);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.dark .file-upload-label {
  background: #1e293b;
  border-color: var(--color-border-dark);
}
.file-upload-label:hover {
  border-color: var(--color-secondary);
  color: var(--color-text-main);
}
.dark .file-upload-label:hover {
  border-color: #60a5fa;
}

.not-available-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  gap: 12px;
}
.not-available-state h4 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}
.dark .not-available-state h4 {
  color: var(--color-text-light);
}
.not-available-state p {
  font-size: 14px;
  color: var(--color-text-muted);
  max-width: 320px;
  margin: 0;
}
.not-available-state .back-btn {
  margin-top: 8px;
}
</style>
