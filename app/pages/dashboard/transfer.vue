<template>
  <div class="dashboard-page-container">
    <div class="dashboard-page-header">
      <h2>Transfer &amp; Pay</h2>
      <p>Move money between your accounts or send to someone else.</p>
    </div>

    <div v-if="message" :class="['alert-message', messageType === 'success' ? 'success' : 'error']">
      {{ message }}
    </div>

    <div class="page-grid">
      <!-- LEFT PANEL -->
      <div class="dashboard-card">

        <!-- ── STEP 1: Method selection ── -->
        <template v-if="step === 1">
          <div class="card-header-main">
            <h3>Make a Transfer</h3>
          </div>
          <div class="form-group">
            <label class="form-label">Select Transfer Method</label>
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

          <button
            class="btn btn-primary submit-btn w-full justify-center"
            :disabled="!selectedMethod"
            @click="goToStep2"
          >
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
            Proceed with Transfer
          </button>
        </template>

        <!-- ── STEP 2: Method-specific details ── -->
        <template v-else>
          <div class="card-header-main">
            <button class="back-btn" @click="step = 1">
              <Icon name="lucide:arrow-left" class="w-4 h-4" />
              Back
            </button>
            <h3>{{ selectedMethod }}</h3>
          </div>

          <form class="dashboard-form" @submit.prevent="handleTransfer">

            <!-- ─── BANK TRANSFER ─── -->
            <template v-if="selectedMethod === 'Bank Transfer'">
              <div class="form-group">
                <label class="form-label" for="bankRecipientName">Beneficiary Name</label>
                <input id="bankRecipientName" type="text" v-model="form.recipientName" placeholder="As on bank account" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="bankNameInput">Bank Name</label>
                <input id="bankNameInput" type="text" v-model="form.bankName" placeholder="e.g. Chase Bank" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="bankAccountNumber">Account Number / IBAN</label>
                <input id="bankAccountNumber" type="text" v-model="form.accountNumber" placeholder="Enter account number or IBAN" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="bankRoutingNumber">Routing Number / Sort Code</label>
                <input id="bankRoutingNumber" type="text" v-model="form.routingNumber" placeholder="Routing number / sort code" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="bankSwiftCode">SWIFT / BIC Code</label>
                <input id="bankSwiftCode" type="text" v-model="form.swiftCode" placeholder="SWIFT/BIC code" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="bankAmount">Amount (USD)</label>
                <input id="bankAmount" type="number" v-model.number="form.amount" placeholder="0.00" min="1" step="0.01" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="bankNote">Note / Reference (Optional)</label>
                <input id="bankNote" type="text" v-model="form.note" placeholder="Optional reference" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label" for="bankDate">Transfer Date</label>
                <input id="bankDate" type="date" v-model="form.date" class="form-input" required />
              </div>
              <button type="submit" class="btn btn-primary submit-btn w-full justify-center" :disabled="isLoading">
                <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 spin" />
                <span>{{ isLoading ? 'Processing…' : 'Send via Bank Transfer' }}</span>
              </button>
            </template>

            <!-- ─── PAYPAL ─── -->
            <template v-else-if="selectedMethod === 'PayPal'">
              <div class="form-group">
                <label class="form-label" for="paypalEmail">PayPal Email</label>
                <input id="paypalEmail" type="email" v-model="form.email" placeholder="recipient@paypal.com" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="paypalRecipientName">Recipient Name (Optional)</label>
                <input id="paypalRecipientName" type="text" v-model="form.recipientName" placeholder="Recipient's Name" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label" for="paypalAmount">Amount (USD)</label>
                <input id="paypalAmount" type="number" v-model.number="form.amount" placeholder="0.00" min="1" step="0.01" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="paypalNote">Note (Optional)</label>
                <input id="paypalNote" type="text" v-model="form.note" placeholder="What's this for?" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label" for="paypalDate">Transfer Date</label>
                <input id="paypalDate" type="date" v-model="form.date" class="form-input" required />
              </div>
              <button type="submit" class="btn btn-primary submit-btn w-full justify-center" :disabled="isLoading">
                <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 spin" />
                <span>{{ isLoading ? 'Processing…' : 'Send via PayPal' }}</span>
              </button>
            </template>

            <!-- ─── CRYPTO TRANSFER ─── -->
            <template v-else-if="selectedMethod === 'Crypto Transfer'">
              <div class="form-group">
                <label class="form-label">Select Coin</label>
                <div class="coin-grid">
                  <div
                    v-for="coin in coins"
                    :key="coin.id"
                    :class="['coin-card', { selected: form.coin === coin.id }]"
                    @click="form.coin = coin.id"
                  >
                    <span class="coin-symbol">{{ coin.symbol }}</span>
                    <span class="coin-name">{{ coin.name }}</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="walletAddress">Recipient Wallet Address</label>
                <input id="walletAddress" type="text" v-model="form.walletAddress" placeholder="0x... or bc1..." class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="cryptoAmount">Amount (USD)</label>
                <input id="cryptoAmount" type="number" v-model.number="form.amount" placeholder="0.00" min="1" step="0.01" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="cryptoDate">Transfer Date</label>
                <input id="cryptoDate" type="date" v-model="form.date" class="form-input" required />
              </div>
              <button type="submit" class="btn btn-primary submit-btn w-full justify-center" :disabled="isLoading">
                <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 spin" />
                <span>{{ isLoading ? 'Processing…' : 'Send Crypto' }}</span>
              </button>
            </template>

            <!-- ─── SKRILL ─── -->
            <template v-else-if="selectedMethod === 'Skrill'">
              <div class="form-group">
                <label class="form-label" for="skrillEmail">Skrill Email</label>
                <input id="skrillEmail" type="email" v-model="form.email" placeholder="recipient@example.com" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="skrillAmount">Amount (USD)</label>
                <input id="skrillAmount" type="number" v-model.number="form.amount" placeholder="0.00" min="1" step="0.01" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="skrillNote">Note (Optional)</label>
                <input id="skrillNote" type="text" v-model="form.note" placeholder="What's this for?" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label" for="skrillDate">Transfer Date</label>
                <input id="skrillDate" type="date" v-model="form.date" class="form-input" required />
              </div>
              <button type="submit" class="btn btn-primary submit-btn w-full justify-center" :disabled="isLoading">
                <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 spin" />
                <span>{{ isLoading ? 'Processing…' : 'Send via Skrill' }}</span>
              </button>
            </template>

            <!-- ─── GOOGLE PAY ─── -->
            <template v-else-if="selectedMethod === 'Google Pay'">
              <div class="form-group">
                <label class="form-label" for="gpayPhone">Recipient Phone / UPI ID</label>
                <input id="gpayPhone" type="text" v-model="form.phone" placeholder="+1 555 000 0000 or name@bank" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="gpayAmount">Amount (USD)</label>
                <input id="gpayAmount" type="number" v-model.number="form.amount" placeholder="0.00" min="1" step="0.01" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="gpayDate">Transfer Date</label>
                <input id="gpayDate" type="date" v-model="form.date" class="form-input" required />
              </div>
              <button type="submit" class="btn btn-primary submit-btn w-full justify-center" :disabled="isLoading">
                <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 spin" />
                <span>{{ isLoading ? 'Processing…' : 'Send via Google Pay' }}</span>
              </button>
            </template>

            <!-- ─── WESTERN UNION ─── -->
            <template v-else-if="selectedMethod === 'Western Union'">
              <div class="form-group">
                <label class="form-label" for="wuName">Recipient Full Name</label>
                <input id="wuName" type="text" v-model="form.recipientName" placeholder="As on government ID" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="wuCountry">Destination Country</label>
                <input id="wuCountry" type="text" v-model="form.country" placeholder="e.g. Nigeria, United Kingdom" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="wuAmount">Amount (USD)</label>
                <input id="wuAmount" type="number" v-model.number="form.amount" placeholder="0.00" min="1" step="0.01" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="wuDate">Transfer Date</label>
                <input id="wuDate" type="date" v-model="form.date" class="form-input" required />
              </div>
              <button type="submit" class="btn btn-primary submit-btn w-full justify-center" :disabled="isLoading">
                <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 spin" />
                <span>{{ isLoading ? 'Processing…' : 'Send via Western Union' }}</span>
              </button>
            </template>

            <!-- ─── WISE ─── -->
            <template v-else-if="selectedMethod === 'Wise'">
              <div class="form-group">
                <label class="form-label" for="wiseEmail">Recipient Email</label>
                <input id="wiseEmail" type="email" v-model="form.email" placeholder="recipient@example.com" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="wiseCurrency">Recipient Currency</label>
                <select id="wiseCurrency" v-model="form.currency" class="form-input form-select">
                  <option value="GBP">GBP — British Pound</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="NGN">NGN — Nigerian Naira</option>
                  <option value="CAD">CAD — Canadian Dollar</option>
                  <option value="AUD">AUD — Australian Dollar</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="wiseAmount">Amount (USD)</label>
                <input id="wiseAmount" type="number" v-model.number="form.amount" placeholder="0.00" min="1" step="0.01" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="wiseDate">Transfer Date</label>
                <input id="wiseDate" type="date" v-model="form.date" class="form-input" required />
              </div>
              <button type="submit" class="btn btn-primary submit-btn w-full justify-center" :disabled="isLoading">
                <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 spin" />
                <span>{{ isLoading ? 'Processing…' : 'Send via Wise' }}</span>
              </button>
            </template>

            <!-- ─── PAYONEER ─── -->
            <template v-else-if="selectedMethod === 'Payoneer'">
              <div class="form-group">
                <label class="form-label" for="payoneerEmail">Payoneer Email</label>
                <input id="payoneerEmail" type="email" v-model="form.email" placeholder="recipient@example.com" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="payoneerAmount">Amount (USD)</label>
                <input id="payoneerAmount" type="number" v-model.number="form.amount" placeholder="0.00" min="1" step="0.01" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="payoneerRef">Reference / Message</label>
                <input id="payoneerRef" type="text" v-model="form.note" placeholder="Optional reference" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label" for="payoneerDate">Transfer Date</label>
                <input id="payoneerDate" type="date" v-model="form.date" class="form-input" required />
              </div>
              <button type="submit" class="btn btn-primary submit-btn w-full justify-center" :disabled="isLoading">
                <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 spin" />
                <span>{{ isLoading ? 'Processing…' : 'Send via Payoneer' }}</span>
              </button>
            </template>

            <!-- ─── PAYPAY ─── -->
            <template v-else-if="selectedMethod === 'PayPay'">
              <div class="form-group">
                <label class="form-label" for="paypayPhone">Phone Number / PayPay ID</label>
                <input id="paypayPhone" type="text" v-model="form.phone" placeholder="+81 90-0000-0000 or PayPay ID" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="paypayRecipientName">Recipient Name (Optional)</label>
                <input id="paypayRecipientName" type="text" v-model="form.recipientName" placeholder="Recipient's Name" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label" for="paypayAmount">Amount (USD)</label>
                <input id="paypayAmount" type="number" v-model.number="form.amount" placeholder="0.00" min="1" step="0.01" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="paypayNote">Note (Optional)</label>
                <input id="paypayNote" type="text" v-model="form.note" placeholder="What's this for?" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label" for="paypayDate">Transfer Date</label>
                <input id="paypayDate" type="date" v-model="form.date" class="form-input" required />
              </div>
              <button type="submit" class="btn btn-primary submit-btn w-full justify-center" :disabled="isLoading">
                <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 spin" />
                <span>{{ isLoading ? 'Processing…' : 'Send via PayPay' }}</span>
              </button>
            </template>

          </form>
        </template>

      </div>

      <!-- RIGHT PANEL: Recent Transfers -->
      <div class="dashboard-card h-fit">
        <div class="card-header-main">
          <h3>Recent Transfers</h3>
        </div>
        <div v-if="recentTransfers.length === 0" class="no-items-msg">
          <Icon name="lucide:send" class="w-8 h-8 opacity-30 mx-auto mb-2" />
          <p>No recent transfers yet.</p>
        </div>
        <div v-else class="transaction-list">
          <div v-for="t in recentTransfers" :key="t.id" class="transaction-item">
            <div class="transaction-info">
              <div class="transaction-icon bg-blue-light">
                <Icon name="lucide:arrow-right" class="w-5 h-5 text-blue-500" />
              </div>
              <div class="transaction-details">
                <h4>{{ t.method }}</h4>
                <p>{{ t.date }}</p>
              </div>
            </div>
            <span class="transaction-amount font-mono">${{ t.amount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- PIN AUTHORIZATION MODAL -->
  <div v-if="showPinModal" class="modal-overlay" @click.self="showPinModal = false">
    <div class="modal-box">
      <div class="modal-header">
        <Icon name="lucide:shield-check" class="modal-icon" />
        <h2>Authorize Transfer</h2>
        <button class="modal-close" @click="showPinModal = false"><Icon name="lucide:x" /></button>
      </div>

      <form @submit.prevent="confirmPinAndTransfer" class="modal-body">
        <p class="modal-subtitle">Enter your 4-digit Transfer PIN to confirm this transaction.</p>
        
        <div class="form-group text-center">
          <input
            id="transferPin"
            type="password"
            v-model="enteredPin"
            maxlength="4"
            pattern="\d{4}"
            placeholder="••••"
            class="form-input text-center font-mono letter-spacing-lg"
            required
            autofocus
          />
          <span v-if="pinError" class="pin-error-text">{{ pinError }}</span>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="showPinModal = false">Cancel</button>
          <button type="submit" class="btn btn-primary">Confirm &amp; Send</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Transfer & Pay | Tavrix Bank' })

const auth = useAuth()

// Balance
const checkingBalance = ref(0)
const savingsBalance = ref(0)
const totalBalance = computed(() => checkingBalance.value + savingsBalance.value)

onMounted(async () => {
  // Load recent transfers from localStorage
  const saved = localStorage.getItem('recentTransfers')
  if (saved) {
    try {
      recentTransfers.value = JSON.parse(saved)
    } catch {
      recentTransfers.value = []
    }
  }

  // Load real balance details from API
  const accountsRes = await auth.apiCall<any>('/dashboard/accounts', 'GET')
  if (accountsRes.success && accountsRes.data) {
    const accountsList: any[] = accountsRes.data?.data ?? accountsRes.data ?? []
    
    const checking = accountsList.find((a: any) => a.accountType === 'checking')
    checkingBalance.value = checking ? parseFloat(checking.balance || 0) : 0

    const savings = accountsList.find((a: any) => a.accountType === 'savings')
    savingsBalance.value = savings ? parseFloat(savings.balance || 0) : 0
  }
})

// Steps
const step = ref(1)
const selectedMethod = ref('')
const isLoading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// PIN state
const showPinModal = ref(false)
const enteredPin = ref('')
const pinError = ref('')

// Form state
const form = ref({
  amount: '' as number | '',
  email: '',
  phone: '',
  walletAddress: '',
  coin: '',
  recipientName: '',
  country: '',
  currency: 'GBP',
  note: '',
  bankName: '',
  accountNumber: '',
  routingNumber: '',
  swiftCode: '',
  date: new Date().toISOString().split('T')[0],
})

// Recent transfers (localStorage)
const recentTransfers = ref<{ id: string; method: string; amount: number; date: string }[]>([])

const methods = [
  { id: 'Bank Transfer',   icon: 'lucide:landmark',   color: 'text-blue-500' },
  { id: 'Crypto Transfer', icon: 'lucide:bitcoin',    color: 'text-amber-500' },
  { id: 'PayPal',          icon: 'lucide:credit-card',color: 'text-blue-700' },
  { id: 'PayPay',          icon: 'lucide:qr-code',    color: 'text-red-500' },
  { id: 'Skrill',          icon: 'lucide:wallet',     color: 'text-purple-600' },
  { id: 'Google Pay',      icon: 'lucide:smartphone', color: 'text-emerald-500' },
  { id: 'Western Union',   icon: 'lucide:globe',      color: 'text-yellow-600' },
  { id: 'Wise',            icon: 'lucide:send',       color: 'text-lime-600' },
  { id: 'Payoneer',        icon: 'lucide:briefcase',  color: 'text-rose-500' },
]

const coins = [
  { id: 'BTC',  symbol: '₿', name: 'Bitcoin' },
  { id: 'ETH',  symbol: 'Ξ', name: 'Ethereum' },
  { id: 'USDT', symbol: '₮', name: 'USDT' },
]

const goToStep2 = () => {
  if (!selectedMethod.value) return
  // Reset form
  form.value = { amount: '', email: '', phone: '', walletAddress: '', coin: '', recipientName: '', country: '', currency: 'GBP', note: '', bankName: '', accountNumber: '', routingNumber: '', swiftCode: '', date: new Date().toISOString().split('T')[0] }
  message.value = ''
  step.value = 2
}

const handleTransfer = () => {
  if (!form.value.amount || Number(form.value.amount) <= 0) {
    messageType.value = 'error'
    message.value = 'Please enter a valid amount.'
    return
  }

  // Check if a transfer PIN is configured in localStorage
  if (import.meta.client) {
    const savedPin = localStorage.getItem('transfer_pin')
    if (!savedPin) {
      messageType.value = 'error'
      message.value = 'Security Verification: Please configure a 4-Digit Transfer PIN in Account Settings before initiating transfers.'
      return
    }
  }

  // Open PIN verification modal
  enteredPin.value = ''
  pinError.value = ''
  showPinModal.value = true
}

const confirmPinAndTransfer = () => {
  pinError.value = ''
  if (import.meta.client) {
    const savedPin = localStorage.getItem('transfer_pin')
    if (enteredPin.value !== savedPin) {
      pinError.value = 'Invalid transfer PIN. Please try again.'
      return
    }
  }

  // Correct PIN, proceed with transfer
  showPinModal.value = false
  executeTransferSubmission()
}

const executeTransferSubmission = async () => {
  isLoading.value = true
  message.value = ''

  try {
    const pin = import.meta.client ? (localStorage.getItem('transfer_pin') || '') : ''

    const payload: Record<string, any> = {
      method: selectedMethod.value,
      amount: Number(form.value.amount),
      pin,
      note: form.value.note || ''
    }

    if (selectedMethod.value === 'Bank Transfer') {
      payload.recipientName = form.value.recipientName
      payload.walletAddress = form.value.accountNumber
      payload.note = `Bank: ${form.value.bankName} | Routing: ${form.value.routingNumber} | SWIFT: ${form.value.swiftCode}${form.value.note ? ' | ' + form.value.note : ''}`
    } else if (selectedMethod.value === 'PayPal') {
      payload.email = form.value.email
      payload.recipientName = form.value.recipientName || 'PayPal Recipient'
    } else if (selectedMethod.value === 'PayPay') {
      payload.phone = form.value.phone
      payload.recipientName = form.value.recipientName || ''
    } else {
      // Attach other method-specific fields
      if (form.value.email)         payload.email = form.value.email
      if (form.value.phone)         payload.phone = form.value.phone
      if (form.value.walletAddress) payload.walletAddress = form.value.walletAddress
      if (form.value.coin)          payload.coin = form.value.coin
      if (form.value.recipientName) payload.recipientName = form.value.recipientName
      if (form.value.country)       payload.country = form.value.country
      if (form.value.currency)      payload.currency = form.value.currency
    }

    const res = await auth.apiCall<any>('/dashboard/transfers', 'POST', payload)

    if (res.success) {
      // Add to recent transfers sidebar with pending status
      const entry = {
        id: Date.now().toString(),
        method: selectedMethod.value,
        amount: Number(form.value.amount),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'pending'
      }
      recentTransfers.value = [entry, ...recentTransfers.value]
      if (import.meta.client) localStorage.setItem('recent_transfers', JSON.stringify(recentTransfers.value))

      messageType.value = 'success'
      message.value = `⏳ Transfer of $${Number(form.value.amount).toFixed(2)} via ${selectedMethod.value} submitted successfully and is pending admin approval. Your balance will be updated once approved.`
      step.value = 1
      selectedMethod.value = ''

      // Reset form
      form.value = {
        amount: '',
        email: '',
        phone: '',
        walletAddress: '',
        coin: '',
        recipientName: '',
        country: '',
        currency: 'GBP',
        note: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        swiftCode: '',
        date: new Date().toISOString().split('T')[0]
      }
    } else {
      messageType.value = 'error'
      message.value = res.error || 'Transfer failed. Please try again.'
    }
  } catch (e: any) {
    messageType.value = 'error'
    message.value = 'Network error. Please check your connection and try again.'
  } finally {
    isLoading.value = false
  }
}

const route = useRoute()

onMounted(async () => {
  if (import.meta.client) {
    const stored = localStorage.getItem('recent_transfers')
    if (stored) recentTransfers.value = JSON.parse(stored)

    // Check if query param specifies a method to skip step 1
    if (route.query.method) {
      const qMethod = route.query.method as string
      const matched = methods.find(m => m.id.toLowerCase() === qMethod.toLowerCase() || m.id === qMethod)
      if (matched) {
        selectedMethod.value = matched.id
        goToStep2()
      }
    }
  }
  const balanceRes = await auth.apiCall<any>('/account/balance', 'GET')
  if (balanceRes.success && balanceRes.data) {
    checkingBalance.value = balanceRes.data.balance || checkingBalance.value
  }
})
</script>

<style scoped>
.dashboard-page-container {
  max-width: 1000px;
  margin: 0 auto;
}
.dashboard-page-header { margin-bottom: 24px; }
.dashboard-page-header h2 {
  font-size: 24px; font-weight: 700;
  color: var(--color-primary); margin-bottom: 6px;
}
.dark .dashboard-page-header h2 { color: var(--color-text-light); }
.dashboard-page-header p { font-size: 14px; color: var(--color-text-muted); }
.dark .dashboard-page-header p { color: #94a3b8; }

.alert-message {
  padding: 12px 16px; border-radius: 6px;
  margin-bottom: 16px; font-size: 14px; font-weight: 500;
}
.alert-message.success {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border: 1px solid rgba(16,185,129,0.2);
}
.alert-message.error {
  background-color: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid rgba(239,68,68,0.2);
}

.page-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
}
@media (max-width: 900px) { .page-grid { grid-template-columns: 1fr; } }

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
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}
.dark .card-header-main { border-bottom-color: var(--color-border-dark); }
.card-header-main h3 {
  font-size: 18px; font-weight: 600;
  color: var(--color-primary); flex: 1;
}
.dark .card-header-main h3 { color: var(--color-text-light); }

/* Back button */
.back-btn {
  display: flex; align-items: center; gap: 6px;
  background: none; border: 1px solid var(--color-border);
  border-radius: 8px; padding: 6px 12px;
  font-size: 13px; font-weight: 600;
  color: var(--color-text-muted); cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover {
  background: var(--color-background-subtle);
  color: var(--color-text-main);
}
.dark .back-btn { border-color: var(--color-border-dark); color: #94a3b8; }
.dark .back-btn:hover { background: var(--color-background-dark-subtle); color: #f1f5f9; }

.dashboard-form {
  display: flex; flex-direction: column; gap: 20px;
}
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--color-text-main); }
.dark .form-label { color: var(--color-text-light); }

.form-input {
  padding: 10px 12px; border: 1px solid var(--color-border);
  border-radius: 8px; font-size: 14px;
  background: var(--color-background-page);
  color: var(--color-text-main); outline: none;
  font-family: var(--font-sans); width: 100%; box-sizing: border-box;
}
.dark .form-input {
  background: #1e293b; border-color: var(--color-border-dark);
  color: #f1f5f9;
}
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
}

/* Method grid */
.payment-method-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
@media (max-width: 640px) { .payment-method-grid { grid-template-columns: repeat(2, 1fr); } }

.payment-method-card {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 16px 8px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-surface);
  cursor: pointer; transition: all 0.2s ease; gap: 8px;
}
.dark .payment-method-card { background-color: var(--color-surface-dark); border-color: var(--color-border-dark); }
.payment-method-card:hover {
  border-color: rgba(0,102,255,0.4);
  background-color: var(--color-background-subtle);
  transform: translateY(-2px);
}
.dark .payment-method-card:hover { background-color: var(--color-background-dark-subtle); }
.payment-method-card.selected {
  border-color: var(--color-secondary);
  background-color: rgba(0,102,255,0.08);
}
.dark .payment-method-card.selected {
  background-color: rgba(96,165,250,0.12);
  border-color: #60a5fa;
}
.payment-icon-wrapper {
  width: 44px; height: 44px; display: flex;
  align-items: center; justify-content: center;
  border-radius: 10px;
  background-color: var(--color-background-subtle);
}
.dark .payment-icon-wrapper { background-color: var(--color-background-dark-subtle); }
.payment-method-card.selected .payment-icon-wrapper { background-color: var(--color-surface); }
.dark .payment-method-card.selected .payment-icon-wrapper { background-color: var(--color-surface-dark); }
.payment-method-name { font-size: 12px; font-weight: 600; color: var(--color-text-main); text-align: center; }
.dark .payment-method-name { color: #e2e8f0; }
.payment-method-card.selected .payment-method-name { color: var(--color-secondary); }
.dark .payment-method-card.selected .payment-method-name { color: #60a5fa; }

/* Coin selector */
.coin-grid {
  display: flex; gap: 10px;
}
.coin-card {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  padding: 14px 8px; border: 2px solid var(--color-border);
  border-radius: 10px; cursor: pointer; transition: all 0.2s;
  background: var(--color-surface);
}
.dark .coin-card { background: var(--color-surface-dark); border-color: var(--color-border-dark); }
.coin-card:hover { border-color: rgba(0,102,255,0.4); transform: translateY(-2px); }
.coin-card.selected {
  border-color: var(--color-secondary);
  background: rgba(0,102,255,0.08);
}
.dark .coin-card.selected { background: rgba(96,165,250,0.12); border-color: #60a5fa; }
.coin-symbol { font-size: 22px; font-weight: 700; color: var(--color-text-main); }
.dark .coin-symbol { color: #f1f5f9; }
.coin-name { font-size: 11px; color: var(--color-text-muted); }

/* Unavailable notice */
.method-notice {
  display: flex; gap: 14px; align-items: flex-start;
  padding: 18px 16px; border-radius: 10px;
}
.method-notice.unavailable {
  background: rgba(239,68,68,0.06);
  border: 1px solid rgba(239,68,68,0.2);
  color: #dc2626;
}
.dark .method-notice.unavailable { color: #f87171; background: rgba(239,68,68,0.08); }
.method-notice strong { display: block; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
.method-notice p { font-size: 13px; opacity: 0.85; margin: 0; }

/* Buttons */
.submit-btn {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; font-size: 15px; font-weight: 600;
  padding: 12px; margin-top: 8px;
}

/* Recent transfers */
.no-items-msg {
  text-align: center; padding: 32px 0;
  color: var(--color-text-muted); font-size: 13px;
}
.dark .no-items-msg { color: #94a3b8; }
.transaction-list { display: flex; flex-direction: column; }
.transaction-item {
  display: flex; justify-content: space-between;
  align-items: center; padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
}
.dark .transaction-item { border-bottom-color: var(--color-border-dark); }
.transaction-item:last-child { border-bottom: none; }
.transaction-info { display: flex; align-items: center; gap: 12px; }
.transaction-icon {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.bg-blue-light { background: rgba(59,130,246,0.1); }
.transaction-details h4 { font-size: 14px; font-weight: 600; color: var(--color-text-main); }
.dark .transaction-details h4 { color: var(--color-text-light); }
.transaction-details p { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }
.dark .transaction-details p { color: #94a3b8; }
.transaction-amount { font-size: 14px; font-weight: 700; color: var(--color-text-main); }
.dark .transaction-amount { color: var(--color-text-light); }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Modal Window styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
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
  max-width: 440px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
  overflow: hidden;
  animation: modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
}

.dark .modal-box {
  background: #0f172a;
  border-color: var(--color-border-dark);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.dark .modal-header {
  border-bottom-color: var(--color-border-dark);
}

.modal-header h2 {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.dark .modal-header h2 {
  color: #f1f5f9;
}

.modal-icon {
  width: 22px;
  height: 22px;
  color: var(--color-secondary);
  flex-shrink: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.4;
  margin: 0;
}
.dark .modal-subtitle {
  color: #94a3b8;
}

.letter-spacing-lg {
  letter-spacing: 0.5em;
}

.pin-error-text {
  color: #ef4444;
  font-size: 12.5px;
  margin-top: 6px;
  display: block;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>
