<template>
  <div class="wallets-page">
    <div class="page-header">
      <div class="header-icon">
        <Icon name="lucide:wallet" class="w-5 h-5" />
      </div>
      <div>
        <h1>Crypto Wallet Addresses</h1>
        <p>Manage the deposit wallet addresses shown to users during crypto deposits.</p>
      </div>
    </div>

    <!-- Alert -->
    <div v-if="alert.show" :class="['alert-banner', alert.type]">
      <Icon :name="alert.type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'" class="w-4 h-4" />
      <span>{{ alert.message }}</span>
      <button class="alert-close" @click="alert.show = false">
        <Icon name="lucide:x" class="w-4 h-4" />
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin" />
      <span>Loading wallet addresses...</span>
    </div>

    <!-- Wallet Cards -->
    <div v-else class="wallets-grid">
      <div
        v-for="wallet in wallets"
        :key="wallet.coin"
        class="wallet-card"
      >
        <!-- Card Header -->
        <div class="wallet-card-header">
          <div class="coin-badge" :class="`coin-${wallet.coin.toLowerCase()}`">
            <Icon :name="coinIcon(wallet.coin)" class="w-5 h-5" />
          </div>
          <div class="coin-info">
            <h3>{{ wallet.label }}</h3>
            <span class="network-tag">{{ wallet.network }}</span>
          </div>
          <button
            v-if="editingCoin !== wallet.coin"
            class="edit-btn"
            @click="startEdit(wallet)"
          >
            <Icon name="lucide:pencil" class="w-4 h-4" />
            Edit
          </button>
        </div>

        <!-- Current Address Display -->
        <div v-if="editingCoin !== wallet.coin" class="address-display">
          <div class="address-label">Current Wallet Address</div>
          <div class="address-row">
            <code class="address-value">{{ wallet.address }}</code>
            <button class="copy-btn" @click="copyAddress(wallet.address)" :title="'Copy ' + wallet.coin + ' address'">
              <Icon name="lucide:copy" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Edit Form -->
        <div v-else class="edit-form">
          <div class="form-group">
            <label class="form-label">New Wallet Address</label>
            <input
              v-model="editForm.address"
              type="text"
              class="form-input"
              :placeholder="`Enter new ${wallet.coin} address`"
              autocomplete="off"
            />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Network Label</label>
              <input
                v-model="editForm.network"
                type="text"
                class="form-input"
                placeholder="e.g. TRC20 (Tron)"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Display Label</label>
              <input
                v-model="editForm.label"
                type="text"
                class="form-input"
                :placeholder="wallet.label"
              />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-cancel" @click="cancelEdit">
              <Icon name="lucide:x" class="w-4 h-4" />
              Cancel
            </button>
            <button
              class="btn-save"
              :disabled="saving"
              @click="saveWallet(wallet.coin)"
            >
              <Icon :name="saving ? 'lucide:loader-2' : 'lucide:save'" :class="['w-4 h-4', saving && 'animate-spin']" />
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Box -->
    <div class="info-box">
      <Icon name="lucide:info" class="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
      <div>
        <p class="info-title">How wallet addresses work</p>
        <p class="info-text">
          Changes take effect immediately. Users will see the new address the next time they visit the Crypto Deposit page.
          All changes are logged to the admin audit trail.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

useHead({ title: 'Wallet Addresses | Admin — Tavrix Bank' })

interface Wallet {
  coin: string
  label: string
  network: string
  address: string
}

const auth = useAuth()

const wallets = ref<Wallet[]>([])
const loading = ref(true)
const saving = ref(false)
const editingCoin = ref<string | null>(null)

const editForm = reactive({
  address: '',
  network: '',
  label: ''
})

const alert = reactive({
  show: false,
  type: 'success' as 'success' | 'error',
  message: ''
})

const showAlert = (type: 'success' | 'error', message: string) => {
  alert.type = type
  alert.message = message
  alert.show = true
  setTimeout(() => { alert.show = false }, 5000)
}

const coinIcon = (coin: string) => {
  if (coin === 'BTC') return 'lucide:bitcoin'
  if (coin === 'ETH') return 'lucide:zap'
  if (coin === 'USDT') return 'lucide:dollar-sign'
  return 'lucide:coins'
}

const loadWallets = async () => {
  loading.value = true
  const res = await auth.apiCall<any>('/admin/wallets', 'GET')
  if (res.success && res.data) {
    const data = res.data?.data ?? res.data
    wallets.value = Array.isArray(data) ? data : []
  } else {
    showAlert('error', res.error || 'Failed to load wallet addresses.')
  }
  loading.value = false
}

const startEdit = (wallet: Wallet) => {
  editingCoin.value = wallet.coin
  editForm.address = wallet.address
  editForm.network = wallet.network
  editForm.label = wallet.label
}

const cancelEdit = () => {
  editingCoin.value = null
  editForm.address = ''
  editForm.network = ''
  editForm.label = ''
}

const saveWallet = async (coin: string) => {
  if (!editForm.address.trim()) {
    showAlert('error', 'Wallet address cannot be empty.')
    return
  }
  if (editForm.address.trim().length < 10) {
    showAlert('error', 'The wallet address looks too short. Please check and try again.')
    return
  }

  saving.value = true
  const res = await auth.apiCall<any>('/admin/wallets', 'PUT', {
    coin,
    address: editForm.address.trim(),
    network: editForm.network.trim() || undefined,
    label: editForm.label.trim() || undefined
  })

  if (res.success) {
    showAlert('success', `${coin} wallet address updated successfully.`)
    await loadWallets()
    cancelEdit()
  } else {
    showAlert('error', res.error || 'Failed to update wallet address.')
  }
  saving.value = false
}

const copyAddress = (address: string) => {
  if (import.meta.client && navigator.clipboard) {
    navigator.clipboard.writeText(address).then(() => {
      showAlert('success', 'Address copied to clipboard!')
    })
  }
}

onMounted(() => {
  loadWallets()
})
</script>

<style scoped>
.wallets-page {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
  flex-shrink: 0;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 4px;
}

.page-header p {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  margin: 0;
}

/* Alert */
.alert-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 500;
}
.alert-banner.success {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #6ee7b7;
}
.alert-banner.error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}
.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  padding: 2px;
}
.alert-close:hover { opacity: 1; }

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 40px;
  justify-content: center;
  color: rgba(255,255,255,0.4);
  font-size: 14px;
}

/* Grid */
.wallets-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Wallet Card */
.wallet-card {
  background: #0d1424;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: border-color 0.2s;
}
.wallet-card:hover {
  border-color: rgba(99,102,241,0.2);
}

.wallet-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.coin-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.coin-btc {
  background: rgba(247, 147, 26, 0.15);
  border: 1px solid rgba(247, 147, 26, 0.25);
  color: #f7931a;
}
.coin-eth {
  background: rgba(98, 126, 234, 0.15);
  border: 1px solid rgba(98, 126, 234, 0.25);
  color: #627eea;
}
.coin-usdt {
  background: rgba(38, 161, 123, 0.15);
  border: 1px solid rgba(38, 161, 123, 0.25);
  color: #26a17b;
}

.coin-info {
  flex: 1;
}
.coin-info h3 {
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 4px;
}
.network-tag {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.05);
  padding: 2px 8px;
  border-radius: 99px;
  border: 1px solid rgba(255,255,255,0.08);
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  background: rgba(99,102,241,0.12);
  border: 1px solid rgba(99,102,241,0.2);
  color: #a5b4fc;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  font-family: inherit;
}
.edit-btn:hover {
  background: rgba(99,102,241,0.2);
  border-color: rgba(99,102,241,0.35);
}

/* Address display */
.address-display {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.address-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.3);
}
.address-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.address-value {
  flex: 1;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  color: #94a3b8;
  word-break: break-all;
  background: none;
  border: none;
}
.copy-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.18s;
}
.copy-btn:hover {
  background: rgba(99,102,241,0.15);
  border-color: rgba(99,102,241,0.3);
  color: #a5b4fc;
}

/* Edit form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(99,102,241,0.18);
  border-radius: 10px;
  padding: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 600px) {
  .form-row-2 { grid-template-columns: 1fr; }
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #f1f5f9;
  font-size: 13.5px;
  font-family: inherit;
  transition: border-color 0.18s;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: rgba(99,102,241,0.5);
  background: rgba(99,102,241,0.05);
}
.form-input::placeholder {
  color: rgba(255,255,255,0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.btn-cancel {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  font-family: inherit;
}
.btn-cancel:hover {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.8);
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(99,102,241,0.35);
}
.btn-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99,102,241,0.45);
}
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Info box */
.info-box {
  display: flex;
  gap: 12px;
  padding: 14px 18px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.18);
  border-radius: 10px;
}
.info-title {
  font-size: 13px;
  font-weight: 600;
  color: #93c5fd;
  margin: 0 0 4px;
}
.info-text {
  font-size: 12.5px;
  color: rgba(255,255,255,0.4);
  margin: 0;
  line-height: 1.6;
}

.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
